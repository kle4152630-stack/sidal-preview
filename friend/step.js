'use strict';
// One question per screen. A tap on a card moves on. 시작 → 고민 종류 → 한 줄로 더 → 번호 3개 → 확인 → 결과 (every reading uses 3 cards for now)
(function () {
  const app = window.TarotApp, core = app.core, el = app.el;
  const $ = id => document.getElementById(id);
  const session = app.createSession();
  const answers = {category: null, detail: ''};
  const TITLES = ['타로 친구', '내 고민', '내 고민', '카드 고르기', '확인', '결과'];
  const RESULT = 5;
  const LAST_STEP = 4;          // the progress bar is full on the confirm screen
  let screen = 0;
  let lastResult = '';
  let lastPicked = [];
  let toastTimer;
  let picker;

  // Line icons are built node by node, never from an HTML string.
  function svgIcon(shapes) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    const style = {viewBox: '0 0 24 24', width: 28, height: 28, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'};
    Object.entries(style).forEach(([key, value]) => svg.setAttribute(key, String(value)));
    shapes.forEach(([tag, attrs]) => {
      const node = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
      svg.append(node);
    });
    return svg;
  }

  const CATEGORIES = [
    {id: 'love', label: '연애 · 이별', shapes: [['path', {d: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'}]], example: '예) 헤어진 사람이 자꾸 생각나서 마음을 정리하고 싶어요'},
    {id: 'work', label: '일 · 진로', shapes: [['path', {d: 'M4 20l1-4L16 5l3 3L8 19l-4 1z'}], ['path', {d: 'M14 7l3 3'}]], example: '예) 이직을 해야 할지 지금 자리에 남아야 할지 모르겠어요'},
    {id: 'money', label: '돈 · 생활', shapes: [['rect', {x: 2, y: 6.5, width: 20, height: 11, rx: 1.5}], ['rect', {x: 4.5, y: 9, width: 15, height: 6, rx: 0.5}], ['circle', {cx: 12, cy: 12, r: 1.6}], ['path', {d: 'M6.5 12h.01M17.5 12h.01'}]], example: '예) 이번 달 생활비가 빠듯해서 어디서부터 줄일지 고민이에요'},
    {id: 'people', label: '사람 관계', shapes: [['circle', {cx: 12, cy: 8, r: 4}], ['path', {d: 'M4.5 21c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7'}]], example: '예) 요즘 사람에 치여서 너무 힘들어요'},
    {id: 'mind', label: '마음 · 감정', shapes: [['path', {d: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z'}]], example: '예) 이유 없이 불안하고 마음이 가라앉지 않아요'},
    {id: 'etc', label: '그 밖의 고민', shapes: [['path', {d: 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z'}]], example: '예) 새로 시작하는 일 앞에서 자신이 없어요'},
  ];
  function toast(message) {
    const node = $('toast');
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { node.hidden = true; }, 2200);
  }

  // ---- moving between screens ----
  // Every screen is a history entry, so the phone's back button goes to the previous screen instead of leaving the page.
  function go(next, {pop = false} = {}) {
    const back = next < screen;
    if (!pop && next !== screen) history.pushState({s: next}, '');
    screen = next;
    document.querySelectorAll('.screen').forEach(node => {
      const on = Number(node.dataset.screen) === next;
      node.hidden = !on;
      node.classList.remove('enter', 'enterback');
      if (on) { void node.offsetWidth; node.classList.add(back ? 'enterback' : 'enter'); }
    });
    $('stepTitle').textContent = TITLES[next];
    $('backBtn').hidden = next === 0 || next === RESULT;
    const bar = $('progress');
    bar.hidden = next === 0;
    const step = Math.min(next, LAST_STEP);
    bar.setAttribute('aria-valuenow', String(step));
    $('barFill').style.width = (step / LAST_STEP * 100) + '%';
    window.scrollTo({top: 0, behavior: 'auto'});
    const heading = document.querySelector(`.screen[data-screen="${next}"] h1`);
    if (heading) { heading.tabIndex = -1; heading.focus({preventScroll: true}); }
  }
  $('backBtn').addEventListener('click', () => { if (screen > 0 && screen < RESULT) history.back(); });
  window.addEventListener('popstate', event => {
    let target = event.state && Number.isInteger(event.state.s) ? event.state.s : 0;
    if (target > 0 && !answers.category) target = 0;                 // nothing chosen yet (for example after a reload)
    if (target === RESULT && !lastResult) target = LAST_STEP;       // the answer is not there to show again
    go(Math.max(0, Math.min(target, RESULT)), {pop: true});
  });

  // ---- choice cards: one tap selects and moves on ----
  function renderChoices(host, items, selectedValue, valueOf, onPick) {
    host.replaceChildren(...items.map(item => {
      const card = el('button', 'card');
      card.type = 'button';
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', String(valueOf(item) === selectedValue));
      const icon = el('span', 'icon');
      icon.replaceChildren(svgIcon(item.shapes));
      icon.setAttribute('aria-hidden', 'true');
      const words = el('span', 'words', item.label);
      if (item.note) words.append(el('small', '', item.note));
      const radio = el('span', 'radio');
      radio.setAttribute('aria-hidden', 'true');
      card.append(icon, words, radio);
      card.onclick = () => {
        host.querySelectorAll('.card').forEach(other => { other.setAttribute('aria-checked', String(other === card)); other.disabled = true; });
        setTimeout(() => { host.querySelectorAll('.card').forEach(other => { other.disabled = false; }); onPick(item); }, app.reduced ? 0 : 220);
      };
      return card;
    }));
  }

  // ---- 0 start ----
  function updateUsage() {
    $('usageNote').textContent = app.usageText();
    $('startBtn').disabled = !app.canStart();
  }
  $('startBtn').addEventListener('click', () => { if (app.canStart()) { showCategories(); go(1); } });

  // ---- 1 category ----
  function showCategories() {
    renderChoices($('catHost'), CATEGORIES, answers.category && answers.category.id, item => item.id, item => { answers.category = item; detail.placeholder = item.example; go(2); $('detail').focus({preventScroll: true}); });
  }

  // ---- 2 one more line (optional) ----
  const detail = $('detail');
  detail.addEventListener('input', () => { $('detailCount').textContent = String(detail.value.length); });
  detail.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); $('detailForm').requestSubmit(); } });
  $('detailForm').addEventListener('submit', event => { event.preventDefault(); answers.detail = core.cleanInput(detail.value, 150); startPick(); go(3); });
  $('skipDetail').addEventListener('click', () => { detail.value = ''; $('detailCount').textContent = '0'; answers.detail = ''; startPick(); go(3); });

  // ---- 3 numbers ----
  function questionText() {
    const base = `${answers.category.label} 고민이에요`;
    return answers.detail ? `${base}. ${answers.detail}` : base;
  }
  function startPick() {
    session.begin(questionText());
    $('pickLead').textContent = `카드 78장을 섞었어요. 1부터 78까지 번호 중에서 직감으로 ${session.count}개를 눌러 주세요. 먼저 누른 번호가 첫 번째 자리예요.`;
    if (!picker) {
      picker = app.mountPicker(session, {slotsHost: $('slotsHost'), gridHost: $('gridHost'), confirm: $('confirmPick'), onChange: updateStatus});
    } else picker.render();
  }
  function updateStatus() {
    const left = session.count - session.chosen.length;
    const status = $('pickStatus');
    status.replaceChildren(document.createTextNode(`${session.count}개 중 `), el('b', '', `${session.chosen.length}개`), document.createTextNode(left > 0 ? ` 골랐어요. ${left}개 더 눌러 주세요.` : ' 골랐어요. 아래 버튼을 눌러 주세요.'));
  }
  $('clearPick').addEventListener('click', () => { if (picker) picker.reset(); });
  $('confirmPick').addEventListener('click', () => { if (session.ready()) { showSummary(); go(4); } });

  // ---- 4 confirm ----
  function showSummary() {
    const rows = [['고민 종류', answers.category.label], ['한 줄', answers.detail || '적지 않았어요'], ['카드', `${session.count}장`], ['고른 번호', session.chosen.join(' · ')]];
    $('summary').replaceChildren(...rows.map(([name, value]) => {
      const row = el('div');
      row.append(el('dt', '', name), el('dd', '', value));
      return row;
    }));
  }
  $('editBtn').addEventListener('click', () => { go(1); showCategories(); });
  $('yesBtn').addEventListener('click', startReading);

  // ---- 5 result ----
  function afterAnswer() {
    $('afterRow').hidden = false;
    $('againRow').hidden = false;
    $('deepChoice').hidden = false;
    const left = session.followLeft();
    $('followForm').hidden = left <= 0;
    if (left > 0) $('followNote').textContent = `이어서 물어볼 수 있는 횟수: ${left}번`;
  }
  async function startReading() {
    if (!app.canStart()) { go(0); updateUsage(); return; }
    $('pickedHost').replaceChildren();
    $('followAnswers').replaceChildren();
    $('followForm').hidden = true;
    $('afterRow').hidden = true;
    $('againRow').hidden = true;
    $('deepChoice').hidden = true;
    $('resultTitle').textContent = '카드를 읽는 중이에요';
    const box = $('reading');
    box.className = 'reading waiting';
    box.replaceChildren(el('p', '', '잠시만 기다려 주세요…'));
    go(RESULT);
    session.busy = true;
    try {
      const data = await session.send(session.question);
      $('resultTitle').textContent = '결과예요';
      $('pickedHost').replaceChildren(app.pickedBox(data.picked));
      box.className = 'reading';
      app.paragraphs(box, data.reply);
      lastResult = app.plainResult(data.picked, data.reply);
      lastPicked = data.picked;
      afterAnswer();
    } catch (error) {
      if (error.cancelled) return;
      $('resultTitle').textContent = '결과를 가져오지 못했어요';
      box.className = 'reading error';
      box.replaceChildren(el('p', '', error.message || '답을 가져오지 못했어요.'));
      const retry = el('button', 'plain boxed', '다시 시도');
      retry.type = 'button';
      retry.onclick = startReading;
      const edit = el('button', 'plain boxed', '번호 다시 고르기');
      edit.type = 'button';
      edit.onclick = () => go(3);
      box.append(retry, edit);
    } finally { session.busy = false; updateUsage(); }
  }
  $('followForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (session.busy || session.followLeft() <= 0) return;
    const text = core.cleanInput($('follow').value, 300);
    if (!text) return;
    $('follow').value = '';
    session.followups += 1;
    session.busy = true;
    $('followForm').hidden = true;
    $('afterRow').hidden = true;
    $('againRow').hidden = true;
    const holder = el('div', 'reading waiting');
    holder.append(el('p', 'followq', '질문: ' + text), el('p', '', '답을 정리하는 중이에요…'));
    $('followAnswers').append(holder);
    try {
      const data = await session.send(text);
      holder.className = 'reading';
      holder.replaceChildren(el('p', 'followq', '질문: ' + text));
      app.paragraphs(holder, data.reply, {keep: true});
      lastResult += '\n\n질문: ' + text + '\n' + core.toBlocks(data.reply).map(block => block.text).join('\n');
    } catch (error) {
      if (error.cancelled) return;
      session.followups -= 1;
      holder.className = 'reading error';
      holder.replaceChildren(el('p', '', error.message || '답을 가져오지 못했어요.'));
    } finally { session.busy = false; afterAnswer(); }
  });
  $('aiDeepBtn').addEventListener('click', () => {
    if ($('followForm').hidden) { toast('오늘 이어서 묻는 횟수를 모두 썼어요. 내일 다시 만나요.'); return; }
    $('followForm').scrollIntoView({behavior: 'smooth', block: 'center'});
    $('follow').focus();
  });
  $('expertBtn').addEventListener('click', () => $('expertDialog').showModal());
  $('expertClose').addEventListener('click', () => $('expertDialog').close());
  if (navigator.share) $('shareBtn').hidden = false;
  // A short message to send: the one-line headline and the address. The full reading is only shared if the person chooses to.
  $('shareBtn').addEventListener('click', () => {
    if (!lastResult) return;
    const headline = document.querySelector('.headtext');
    const text = headline ? `${headline.textContent}\n타로 친구에서 고민을 함께 정리해 봤어요. https://tarot-friend.vercel.app` : lastResult;
    navigator.share({title: '타로 친구', text}).catch(() => {});
  });
  $('saveBtn').addEventListener('click', async () => {
    if (!lastPicked.length) return;
    try {
      const blob = await app.pickedPicture(lastPicked);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = ['타로-고른-카드', 'png'].join('.');
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('고른 카드 사진을 저장했어요');
    } catch {
      toast('사진을 만들지 못했어요. 다시 해 주세요');
    }
  });
  $('againBtn').addEventListener('click', () => {
    session.cancel();
    answers.category = null; answers.detail = '';
    detail.value = ''; $('detailCount').textContent = '0';
    lastResult = '';
    lastPicked = [];
    updateUsage();
    go(0);
  });

  updateUsage();
  history.replaceState({s: 0}, '');
  go(0, {pop: true});
})();
