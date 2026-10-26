'use strict';
// Small payments through PortOne (formerly iamport): products, the checkout dialog and the result handling.
// OFF by default. It only switches on when the deploy step writes a PortOne merchant code into the page (scripts/build-site.cjs),
// and that step refuses to do so until the legal pages exist (docs/PAYMENTS.md). The PortOne SDK is fetched only when the
// checkout dialog opens.

const PRODUCTS = {
  single: {id: 'single', label: '1회 열람권', price: 1900, tickets: 1},
  pack3: {id: 'pack3', label: '3회 티켓 패키지', price: 4900, tickets: 3},
  pack5: {id: 'pack5', label: '5회 티켓 패키지', price: 6900, tickets: 5}
};
const PAY_METHODS = {
  kakaopay: {label: '카카오페이', meta: 'sidal:portone-pg-kakao'},
  toss: {label: '토스페이먼츠', meta: 'sidal:portone-pg-toss'},
  card: {label: '신용카드', meta: 'sidal:portone-pg-card'}
};
const PORTONE_SDK = {
  url: 'https://cdn.iamport.kr/js/iamport.payment-1.2.0.js',
  integrity: 'sha384-H7ptVR4RFxqZUyN7brv4K3nVK3/nd+WaAi/UqJcywjdXxJab2di68cbPyO3I4aoo'
};
let portoneLoading = null;
let payBusy = false;

function won(amount) { return amount.toLocaleString('ko-KR') + '원'; }
function metaContent(name) {
  const meta = document.querySelector('meta[name="' + name + '"]');
  return meta ? (meta.getAttribute('content') || '') : '';
}
function merchantCode() { const value = metaContent('sidal:portone-code'); return /^imp[0-9]{8}$/.test(value) ? value : ''; }
function methodPg(method) { const value = metaContent(PAY_METHODS[method].meta); return /^[A-Za-z0-9_.{}-]{3,60}$/.test(value) ? value : ''; }
function availableMethods() { return Object.keys(PAY_METHODS).filter(method => methodPg(method)); }
const DEFAULT_VERIFY_PATH = '/api/verify-payment';
// Tickets are never credited on the browser's word alone: every successful payment is checked by this same-site server function first.
function verifyPath() { const value = metaContent('sidal:verify-path'); return /^\/[A-Za-z0-9_\-/]{1,80}$/.test(value) ? value : DEFAULT_VERIFY_PATH; }
function paymentsEnabled() { return Boolean(merchantCode()) && availableMethods().length > 0; }

function loadPortOne() {
  if (window.IMP) return Promise.resolve(window.IMP);
  if (!portoneLoading) {
    portoneLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = PORTONE_SDK.url;
      script.integrity = PORTONE_SDK.integrity;
      script.crossOrigin = 'anonymous';
      script.onload = () => window.IMP ? resolve(window.IMP) : reject(new Error('portone'));
      script.onerror = () => { portoneLoading = null; reject(new Error('portone')); };
      document.head.append(script);
    });
  }
  return portoneLoading;
}

function newMerchantUid() {
  const random = typeof crypto !== 'undefined' && crypto.getRandomValues ? Array.from(crypto.getRandomValues(new Uint32Array(2)), n => n.toString(36)).join('') : Math.random().toString(36).slice(2);
  return 'sidal_' + Date.now().toString(36) + '_' + random;
}

// Tickets are only credited after the server confirms the payment with PortOne (api/verify-payment.js), including the amount.
async function verifyPayment(rsp, product) {
  const path = verifyPath();
  try {
    const reply = await fetch(path, {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({imp_uid: rsp.imp_uid, merchant_uid: rsp.merchant_uid, product: product.id, expected_amount: product.price, device: deviceId()})});
    const data = await reply.json();
    return reply.ok && data && data.ok === true;
  } catch { return false; }
}

// Payment numbers being checked right now, so a payment reported twice at the same moment is credited once.
const verifying = new Set();

// Called with PortOne's answer. Credits tickets and unlocks the open reading only for a successful (and, if configured, verified) payment.
async function finishPayment(rsp, product) {
  if (!rsp || rsp.success !== true) {
    toast('결제가 완료되지 않았어요' + (rsp && rsp.error_msg ? ' (' + String(rsp.error_msg).slice(0, 60) + ')' : '') + '. 결제된 금액은 없어요.');
    return false;
  }
  // Idempotency: a payment (by payment number or order number) that already became tickets on this device is never credited again.
  const ids = [rsp.imp_uid, rsp.merchant_uid].filter(Boolean).map(String);
  if (ids.some(id => wasCredited(id) || verifying.has(id))) { toast('이미 처리된 결제예요. 티켓은 한 번만 충전돼요.'); return false; }
  ids.forEach(id => verifying.add(id));
  try {
    if (!(await verifyPayment(rsp, product))) {
      toast('결제 검증에 실패했습니다. 고객센터로 문의해주세요. (결제번호: ' + String(rsp.imp_uid || '').slice(0, 30) + ')');
      return false;
    }
    ids.forEach(markCredited);
  } finally { ids.forEach(id => verifying.delete(id)); }
  addTickets(product.tickets);
  if (typeof openReadingWithTicket === 'function') openReadingWithTicket();
  closePayModal();
  if (typeof renderResult === 'function' && currentCard) renderResult();
  toast('결제가 완료되었어요. 티켓 ' + product.tickets + '장이 충전되고 리포트가 열렸어요.');
  return true;
}

async function startPayment(productId, method) {
  const product = PRODUCTS[productId];
  if (!product || !PAY_METHODS[method] || !methodPg(method) || payBusy || !paymentsEnabled()) return false;
  payBusy = true;
  try {
    const IMP = await loadPortOne();
    IMP.init(merchantCode());
    const params = {pg: methodPg(method), pay_method: 'card', merchant_uid: newMerchantUid(),
      name: '사이달 ' + product.label, amount: product.price, currency: 'KRW', m_redirect_url: location.href.split('#')[0]};
    return await new Promise(resolve => IMP.request_pay(params, rsp => { finishPayment(rsp, product).then(resolve); }));
  } catch {
    toast('결제창을 열지 못했어요. 잠시 후 다시 시도해주세요.');
    return false;
  } finally { payBusy = false; }
}

function closePayModal() { const dialog = $('payModal'); if (dialog && dialog.open) dialog.close(); }

function openPayModal() {
  if (!paymentsEnabled()) return false;
  const host = $('payProducts');
  host.replaceChildren();
  Object.values(PRODUCTS).forEach((product, index) => {
    const label = document.createElement('label');
    label.className = 'pay-product';
    const input = document.createElement('input');
    input.type = 'radio'; input.name = 'payProduct'; input.value = product.id; input.checked = index === 0;
    const text = document.createElement('span');
    text.textContent = product.label + ' · ' + won(product.price) + (product.tickets > 1 ? ' (티켓 ' + product.tickets + '장)' : '');
    label.append(input, text);
    host.append(label);
  });
  const methods = $('payMethods');
  methods.replaceChildren();
  availableMethods().forEach(method => {
    const button = document.createElement('button');
    button.className = 'primary pay-method';
    button.textContent = PAY_METHODS[method].label + '로 결제';
    button.onclick = () => {
      const checked = host.querySelector && host.querySelector('input:checked');
      startPayment(checked ? checked.value : 'single', method);
    };
    methods.append(button);
  });
  $('payModal').showModal();
  return true;
}
