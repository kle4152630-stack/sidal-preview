'use strict';
// Screen for 2인 케미. Needs fortune-ui.js (fEl, fSection, fCardHead, runWithLoading), share.js (Kakao, share sheet), tickets.js and paywall.js.

let chemSalt = 0;
loadTokens.chemResult = 0;

function chemCurrent() { return chemReading($('chemMe').value, $('chemPartner').value, TAROT_DECK, new Date(), chemSalt); }
function chemProblem() { return chemValid($('chemMe').value, $('chemPartner').value) ? '' : '내 MBTI와 상대 MBTI를 모두 골라 주세요.'; }

async function chemCopyLink(link) {
  try { await navigator.clipboard.writeText(link); toast('링크가 복사되었습니다!'); return true; }
  catch { await copyText(link); return false; }
}
async function chemShare() {
  const me = $('chemMe').value;
  if (!validMbti(me)) { toast('먼저 내 MBTI를 골라 주세요.'); return false; }
  const payload = chemSharePayload(me), key = kakaoKey();
  if (key) {
    try {
      const Kakao = await loadKakao();
      if (!Kakao.isInitialized()) Kakao.init(key);
      const link = {mobileWebUrl: payload.link, webUrl: payload.link};
      Kakao.Share.sendDefault({objectType: 'feed', content: {title: payload.title, description: payload.text, imageUrl: payload.imageUrl, imageWidth: 1200, imageHeight: 630, link},
        buttons: [{title: '우리 케미 확인하기', link}]});
      return true;
    } catch { /* fall through to the phone's own share sheet */ }
  }
  if (await shareNative(payload)) return true;
  await chemCopyLink(payload.link);
  return false;
}

function chemMessageBlock(view) {
  const box = fEl('div', 'fortune-block');
  box.append(fEl('h3', '', '바로 복사해 쓰는 카톡 문장'));
  if (view.messageFiller) {
    box.append(fEl('p', '', view.messageFiller));
    return box;
  }
  box.append(fEl('p', 'fortune-note', view.messageNote));
  view.messages.forEach(message => {
    const row = fEl('div', 'chem-message');
    const text = fEl('p', '', message.text);
    const button = fEl('button', 'secondary', message.label + ' 복사');
    button.onclick = () => copyText(message.text);
    row.append(fEl('b', '', message.label), text, button);
    box.append(row);
  });
  return box;
}
function chemLockBar(reading) {
  const bar = fEl('div', 'chem-lock');
  const balance = ticketBalance();
  bar.append(fEl('p', '', '티켓 1장 사용 또는 ' + won(PRODUCTS.single.price) + ' 결제 후 즉시 보기'));
  if (balance >= 1) {
    const use = fEl('button', 'primary', '티켓 1장 사용하고 보기 (잔액 ' + balance + '장)');
    use.onclick = () => { if (chemOpenWithTicket(reading)) { renderChemResult(); toast('티켓 1장을 사용했어요. 남은 티켓 ' + ticketBalance() + '장'); } };
    bar.append(use);
  }
  const buy = fEl('button', 'secondary', won(PRODUCTS.single.price) + ' 결제하고 보기');
  buy.onclick = openPayModal;
  bar.append(buy);
  return bar;
}

function renderChemResult() {
  const out = $('chemResult');
  loadTokens.chemResult++;
  ['chemGo', 'chemAgain'].forEach(id => { $(id).disabled = false; });
  out.removeAttribute('aria-busy');
  const reading = chemCurrent();
  if (!reading) { out.replaceChildren(fEl('p', 'fortune-error', chemProblem())); return false; }
  // A paid unlock never reaches a situation reading: forget the situation shown earlier so a payment made here cannot spend a ticket on it.
  selected = null; currentCard = null;
  const locked = chemLocked(reading), view = chemView(reading, locked);
  const share = fEl('div', 'actions');
  const kakao = fEl('button', 'primary', '상대방에게 공유하여 궁합 확인하기');
  kakao.onclick = chemShare;
  const copy = fEl('button', 'secondary', '링크 복사');
  copy.onclick = () => chemCopyLink(chemShareLink(reading.me));
  share.append(kakao, copy);
  out.replaceChildren(
    fEl('h2', '', reading.me + ' × ' + reading.partner + ' 케미'),
    fEl('p', 'fortune-why', reading.why),
    fCardHead(reading.card, '두 사람의 오늘 카드'),
    fSection('카드가 건네는 말', [reading.cardLine]),
    fSection('확인되는 것 (고른 유형 기준)', reading.facts),
    fSection('단정할 수 없는 것', reading.unsure),
    fSection('상대 유형에 맞는 대화 규칙', reading.rules),
    fSection('오늘 줄여볼 행동', [reading.lessOf]),
    fSection('3분 미션', [reading.mission]),
    chemMessageBlock(view),
    ...(locked ? [chemLockBar(reading)] : []),
    share,
    fEl('p', 'fortune-note', '공유 링크에는 내가 고른 MBTI 4글자만 들어가요. 상대의 이름이나 생년월일은 어디에도 보내지 않아요.'));
  return true;
}

(function initChem() {
  for (const id of ['chemMe', 'chemPartner']) MBTI_TYPES.forEach(type => { const option = fEl('option', '', type); option.value = type; $(id).append(option); });
  const buttons = [$('chemGo'), $('chemAgain')];
  $('chemGo').onclick = () => { chemSalt = 0; runWithLoading($('chemResult'), buttons, chemProblem, renderChemResult); };
  $('chemAgain').onclick = () => { chemSalt++; runWithLoading($('chemResult'), buttons, chemProblem, renderChemResult); };
  $('tab-chem').onclick = () => setFortuneTab('chem');
  // A friend's link (?chem=INFP) opens this tab with that type already filled in as the other person.
  const shared = new URLSearchParams(location.search).get('chem');
  if (validMbti(shared)) {
    openFortune('chem');
    $('chemPartner').value = shared;
    toast('친구가 보낸 케미 링크예요. 내 MBTI를 골라 주세요.');
  }
})();
