'use strict';
// The lock on the 3rd tier (fact and interpretation) and on the 4th tier's conversation sentence.
// While locked, the real text is never put into the page (so removing the blur in the browser reveals nothing); a placeholder is shown instead.
// Situations that carry money or safety guidance are never locked, and the 4th tier's "one thing to do today" is always free.

const SAFETY_FREE_IDS = new Set(['1-23', '2-14', '3-11', '4-22']);
const LOCKED_FILLER = {
  fact: '선택한 상황에서 확인되는 것을 짧게 정리해 드려요. 열람하면 바로 보여요.',
  uncertain: '아직 단정할 수 없는 것과 조심할 점을 함께 알려드려요. 열람하면 바로 보여요.',
  template: '바로 쓸 수 있는 대화 문장이 이곳에 나와요. 열람하면 바로 보여요.'
};

function alwaysFree(item) { return Boolean(item) && (String(item.id).startsWith('5-') || SAFETY_FREE_IDS.has(item.id)); }
function paywallActive() { return typeof paymentsEnabled === 'function' && paymentsEnabled(); }
function isLocked() {
  return paywallActive() && Boolean(selected) && Boolean(currentCard) && !alwaysFree(selected) && !isReadingUnlocked(readingKey());
}

function lockBar(host) {
  let bar = host.querySelector('.lock-cta');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'lock-cta';
    const message = document.createElement('p');
    message.className = 'lock-message';
    const use = document.createElement('button');
    use.className = 'primary lock-use';
    use.onclick = useTicketForReading;
    const buy = document.createElement('button');
    buy.className = 'secondary lock-buy';
    buy.onclick = openPayModal;
    bar.append(message, use, buy);
    host.append(bar);
  }
  return bar;
}

function applyPaywall() {
  const targets = [document.querySelector('.reality'), document.querySelector('.template')].filter(Boolean);
  const locked = isLocked();
  const balance = paywallActive() ? ticketBalance() : 0;
  const badge = $('ticketBadge');
  if (badge) { badge.hidden = !paywallActive(); badge.textContent = '내 티켓 ' + balance + '장'; }
  if (!locked) {
    targets.forEach(target => { target.classList.remove('locked'); target.removeAttribute && target.removeAttribute('inert'); });
    document.querySelectorAll('.lock-cta').forEach(bar => bar.remove());
    return false;
  }
  $('fact').textContent = LOCKED_FILLER.fact;
  $('uncertain').textContent = LOCKED_FILLER.uncertain;
  $('templateText').textContent = LOCKED_FILLER.template;
  $('templateLabel').textContent = '대화 문장';
  targets.forEach(target => {
    target.classList.add('locked');
    target.setAttribute('inert', '');
  });
  for (const host of [$('lockHostFact'), $('lockHostTemplate')].filter(Boolean)) {
    const bar = lockBar(host);
    bar.querySelector('.lock-message').textContent = '티켓 1장 사용 또는 ' + won(PRODUCTS.single.price) + ' 결제 후 즉시 보기';
    const use = bar.querySelector('.lock-use');
    use.textContent = '티켓 1장 사용하고 보기 (잔액 ' + balance + '장)';
    use.hidden = balance < 1;
    bar.querySelector('.lock-buy').textContent = won(PRODUCTS.single.price) + ' 결제하고 보기';
  }
  return true;
}

function useTicketForReading() {
  if (!isLocked()) return false;
  if (!openReadingWithTicket()) { if (ticketBalance() < 1) openPayModal(); return false; }
  renderResult();
  toast('티켓 1장을 사용했어요. 남은 티켓 ' + ticketBalance() + '장');
  return true;
}

// Keep the locked sentences out of the clipboard and out of copied reports as well.
function lockedForExport() { return isLocked(); }

$('payClose').onclick = closePayModal;
// Business details and the terms/refund links are shown only when payments are on (the build refuses to turn payments on while they are blank).
{ const on = paywallActive(); if ($('bizInfo')) $('bizInfo').hidden = !on; if ($('paidLegal')) $('paidLegal').hidden = !on; }
