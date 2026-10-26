'use strict';
// Screen for the birthdate tarot and the MBTI tarot. The birthdate stays in this page unless the box "이 기기에 기억하기" is ticked,
// and then only in this browser's localStorage. Nothing is sent to a server.

const BIRTH_STORE = 'sidal_birth';
let fortuneTab = 'birth', mbtiView = 'own', fortuneSalt = 0, mbtiSalt = 0, birthCalendar = 'solar';
const FORTUNE_LOADING_MS = 1200;
const revealedOnce = new Set();   // a short reveal only the first time a result is shown on each screen; later results appear at once
let pauseSlot = '', messageTone = 'clear', messageVariant = 0, memoMode = false, pauseTimer = null;
const loadTokens = {birthResult: 0, mbtiResult: 0};

function fEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function fSection(label, lines) {
  const box = fEl('div', 'fortune-block');
  box.append(fEl('h3', '', label));
  lines.forEach(line => box.append(fEl('p', '', line)));
  return box;
}
function fCardHead(card, caption) {
  const head = fEl('div', 'fortune-card');
  const img = fEl('img');
  img.src = card.image; img.alt = card.name + ' 카드'; img.width = 240; img.height = 400;
  const text = fEl('div');
  text.append(fEl('span', 'tiny-label', caption), fEl('h3', '', card.name + ' · ' + card.en), fEl('p', '', card.keywords.join(' · ')));
  head.append(img, text);
  return head;
}
function fStore(action, value) {
  try {
    if (action === 'get') return localStorage.getItem(BIRTH_STORE) || '';
    if (action === 'set') localStorage.setItem(BIRTH_STORE, value);
    else localStorage.removeItem(BIRTH_STORE);
  } catch { /* storage blocked: the page still works without it */ }
  return '';
}

// Remembered value looks like S19900315 (solar), L19900315 (lunar) or M19900315 (lunar leap month).
function birthStoreValue(text, calendar, leap) { return (calendar === 'lunar' ? (leap ? 'M' : 'L') : 'S') + text.replace(/\D/g, ''); }
function readBirthInput() {
  const leap = birthCalendar === 'lunar' && $('birthLeap').checked;
  return {birth: parseBirthdate($('birthInput').value, new Date(), birthCalendar, leap), leap};
}
function setBirthCalendar(calendar) {
  birthCalendar = calendar === 'lunar' ? 'lunar' : 'solar';
  ['solar', 'lunar'].forEach(name => $('cal-' + name).setAttribute('aria-pressed', String(name === birthCalendar)));
  $('birthLeapWrap').hidden = birthCalendar !== 'lunar';
}
function birthProblem() {
  const {birth} = readBirthInput();
  if (birth) return '';
  const digits = $('birthInput').value.replace(/\D/g, '');
  if (birthCalendar === 'lunar' && digits.length === 8) return '그 음력 날짜를 찾지 못했어요. 윤달이라면 \u201C윤달\u201D 칸을 켜 보고, 날짜를 다시 확인해 주세요.';
  return '생년월일을 8자리 숫자로 입력해 주세요. 예: 19900101';
}

// A short "opening the card" moment, only the first time a result is shown on a screen (never with reduced motion). A newer request replaces an older one.
function runWithLoading(out, buttons, problem, render) {
  const message = problem();
  const instant = reducedMotion || revealedOnce.has(out.id);
  if (message) { loadTokens[out.id]++; buttons.forEach(button => { button.disabled = false; }); out.removeAttribute('aria-busy'); out.replaceChildren(fEl('p', 'fortune-error', message)); return; }
  if (!message && instant) { loadTokens[out.id]++; revealedOnce.add(out.id); render(); out.scrollIntoView({behavior: 'instant', block: 'start'}); return; }
  revealedOnce.add(out.id);
  const token = ++loadTokens[out.id];
  buttons.forEach(button => { button.disabled = true; });
  const box = fEl('div', 'fortune-loading');
  box.append(fEl('span', 'fortune-spinner', '\u2726'), fEl('p', '', '고른 카드를 펼쳐볼게요'));
  out.setAttribute('aria-busy', 'true');
  out.replaceChildren(box);
  out.scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth', block: 'start'});
  setTimeout(() => {
    if (token !== loadTokens[out.id]) return;
    render();
    out.scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth', block: 'start'});
  }, FORTUNE_LOADING_MS);
}

function setFortuneTab(tab) {
  fortuneTab = tab === 'mbti' || tab === 'chem' ? tab : 'birth';
  ['birth', 'mbti', 'chem'].forEach(name => {
    const on = name === fortuneTab;
    $('tab-' + name).setAttribute('aria-selected', String(on));
    $('tab-' + name).classList.toggle('active', on);
    $('panel-' + name).hidden = !on;
  });
}

function renderBirthResult() {
  const {birth, leap} = readBirthInput();
  const out = $('birthResult');
  loadTokens.birthResult++;
  ['birthGo', 'birthAgain'].forEach(id => { $(id).disabled = false; });
  out.removeAttribute('aria-busy');
  if (!birth) { out.replaceChildren(fEl('p', 'fortune-error', birthProblem())); return false; }
  if ($('birthRemember').checked) fStore('set', birthStoreValue($('birthInput').value, birthCalendar, leap)); else fStore('clear');
  const now = new Date(), year = yearReading(birth, TAROT_DECK, now, fortuneSalt), today = todayReading(birth, TAROT_DECK, now, fortuneSalt);
  out.replaceChildren(
    fEl('h2', '', now.getFullYear() + '년의 나침반'),
    fCardHead(year.card, '올해의 나침반 카드'),
    fEl('p', 'fortune-note', year.calc),
    fSection('길게 챙겨 볼 주제', [year.topic]),
    fSection('균형점', [year.balance]),
    fSection('가져가 볼 질문', [year.ask]),
    fEl('h2', '', '오늘의 한 걸음'),
    fCardHead(today.card, '오늘의 카드'),
    fEl('p', 'fortune-why', todayWhy(today)),
    fEl('p', 'fortune-note', '오늘 카드는 생년월일과 오늘 날짜로 섞어 뽑아요. 같은 날 같은 입력이면 같은 카드가 나와요.'),
    fSection('오늘 신경 쓸 점', [today.care]),
    fSection('오늘 줄여볼 행동', [today.lessOf]),
    fSection('가볍게 시도할 행동', [today.light]),
    fSection('행운의 색·숫자 상징', [today.color]),
    fSection('내 오행 비유', [today.elementLine + ' (태어난 해의 천간만 본 단순 풀이예요.)']),
    fEl('p', 'fortune-note', '타로와 오행은 재미와 자기 성찰을 위한 상징이에요. 앞날이나 다른 사람의 마음을 알려 주지 않아요.'));
  return true;
}

// A square picture with only the card, the one-line mission and the logo. Nothing the person typed, no MBTI, no birthdate.
function photoButton(reading) {
  const row = fEl('div', 'actions');
  const button = fEl('button', 'secondary', '1줄 포토카드로 저장');
  button.onclick = () => savePhotoCard(reading.card, '오늘의 3분 미션: ' + reading.action);
  row.append(button);
  return row;
}

function stopPauseTimer() { if (pauseTimer) { clearInterval(pauseTimer); pauseTimer = null; } }

// "오늘의 3분 쉼표": the person picks the time of day that suits them. Nothing is scheduled or sent; it is a reminder to themselves on screen.
function pauseBlock(reading) {
  const box = fEl('div', 'fortune-block pause');
  box.append(fEl('h3', '', '오늘의 3분 쉼표'));
  const hint = fEl('p', '', pauseSlot ? '정해 둔 시간: ' + PAUSE_SLOTS.find(slot => slot[0] === pauseSlot)[1] + ' — 그때 위의 3분 미션을 해 보세요.' : '편한 시간대를 고르면, 그때 3분 미션을 하기로 마음먹을 수 있어요. 알림은 보내지 않아요.');
  const row = fEl('div', 'fortune-views');
  row.setAttribute('role', 'group'); row.setAttribute('aria-label', '3분 쉼표 시간대');
  PAUSE_SLOTS.forEach(([id, label]) => {
    const button = fEl('button', 'secondary', label);
    button.setAttribute('aria-pressed', String(pauseSlot === id));
    button.onclick = () => {
      pauseSlot = pauseSlot === id ? '' : id;
      row.querySelectorAll('button').forEach((other, index) => other.setAttribute('aria-pressed', String(PAUSE_SLOTS[index][0] === pauseSlot)));
      hint.textContent = pauseSlot ? '정해 둔 시간: ' + label + ' — 그때 위의 3분 미션을 해 보세요.' : '선택을 풀었어요.';
    };
    row.append(button);
  });
  const timer = fEl('button', 'primary', '3분 타이머 시작');
  const clock = fEl('p', 'fortune-note', '');
  timer.onclick = () => {
    stopPauseTimer();
    let left = 180;
    const draw = () => { clock.textContent = '남은 시간 ' + Math.floor(left / 60) + ':' + pad2(left % 60); };
    draw();
    pauseTimer = setInterval(() => {
      left--;
      if (left <= 0) { stopPauseTimer(); clock.textContent = '3분이 지났어요. 한 줄만 적어 볼까요?'; toast('3분이 지났어요.'); } else draw();
    }, 1000);
  };
  const calendar = fEl('button', 'secondary', '캘린더에 3분 쉼표 저장 (.ics)');
  calendar.onclick = () => { if (!pauseSlot) toast('먼저 편한 시간대를 골라 주세요.'); else savePauseToCalendar(pauseSlot, reading.action); };
  box.append(hint, row, calendar, timer, clock);
  return box;
}

// Conversation sentence in a tone the person chooses, editable before copying; or a note to oneself when nothing can be sent.
function messageBlock(reading) {
  const box = fEl('div', 'fortune-block');
  box.append(fEl('h3', '', '대화 문장 만들기'));
  const area = fEl('textarea', 'fortune-edit');
  area.setAttribute('rows', '4'); area.setAttribute('maxlength', '300'); area.setAttribute('aria-label', '고쳐 쓸 수 있는 문장');
  const fill = () => { area.value = memoMode ? mbtiMemo(reading) : mbtiMessage(reading, messageTone, messageVariant); };
  const tones = fEl('div', 'fortune-views');
  tones.setAttribute('role', 'group'); tones.setAttribute('aria-label', '말투 고르기');
  const paint = () => {
    tones.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-pressed', String(!memoMode && Boolean(MESSAGE_TONES[index]) && MESSAGE_TONES[index][0] === messageTone)));
    memoButton.setAttribute('aria-pressed', String(memoMode));
  };
  const memoButton = fEl('button', 'secondary', '나만의 다짐 메모');
  MESSAGE_TONES.forEach(([id, label]) => {
    const button = fEl('button', 'secondary', label);
    button.onclick = () => { memoMode = false; messageTone = id; fill(); paint(); };
    tones.append(button);
  });
  memoButton.onclick = () => { memoMode = !memoMode; fill(); paint(); };
  tones.append(memoButton);
  const other = fEl('button', 'secondary', '다른 문장으로');
  other.onclick = () => { messageVariant++; memoMode = false; fill(); paint(); };
  const copy = fEl('button', 'primary', '복사하기');
  copy.onclick = () => copyText(area.value);
  fill(); paint();
  box.append(fEl('p', 'fortune-note', '연락할 때 쓰는 문장이에요. 말투를 고르고 내 말처럼 고쳐 쓴 뒤 복사하세요. 말투를 바꾸면 문장이 새로 채워져요. 보낼 수 없는 상황이면 “나만의 다짐 메모”를 써 보세요(어디로도 전송되지 않아요).'), tones, area, fEl('div', 'actions'), );
  box.lastChild.append(other, copy);
  return box;
}

function renderMbtiResult(differs) {
  const type = $('mbtiSelect').value, out = $('mbtiResult');
  loadTokens.mbtiResult++;
  stopPauseTimer();
  ['mbtiGo', 'mbtiAgain'].forEach(id => { $(id).disabled = false; });
  out.removeAttribute('aria-busy');
  const reading = mbtiReading(type, mbtiView, TAROT_DECK, new Date(), mbtiSalt);
  if (!reading) { out.replaceChildren(fEl('p', 'fortune-error', '먼저 MBTI 16가지 중 하나를 골라 주세요.')); return false; }
  const feedback = fEl('div', 'fortune-feedback');
  feedback.setAttribute('role', 'group'); feedback.setAttribute('aria-label', '이 해석이 맞았나요?');
  ['나와 잘 맞아요', '오늘은 달라요'].forEach(label => {
    const button = fEl('button', 'secondary', label);
    button.setAttribute('aria-pressed', 'false');
    button.onclick = () => {
      const was = button.getAttribute('aria-pressed') === 'true';
      feedback.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', String(!was));
      if (label === '오늘은 달라요' && !was && mbtiView === 'own') {
        mbtiView = 'opposite';
        ['own', 'opposite'].forEach(name => $('view-' + name).setAttribute('aria-pressed', String(name === 'opposite')));
        renderMbtiResult(true);
        toast('오늘은 반대 관점의 미션으로 바꿨어요.');
        return;
      }
      toast(was ? '선택을 풀었어요.' : '기록해 두었어요. 이 화면 안에만 남아요.');
    };
    feedback.append(button);
  });
  out.replaceChildren(
    fEl('h2', '', reading.type + (reading.view === 'opposite' ? ' · 반대 관점으로 보기' : ' · 내 성향대로 보기')),
    fEl('p', 'fortune-why', reading.why),
    fCardHead(reading.card, '오늘의 카드'),
    fSection('보는 방법', [reading.viewLine]),
    fSection('카드가 보여 주는 것', [reading.symbol]),
    fSection('카드의 기본 뜻', [reading.meaning]),
    fSection('성향별로 읽으면', reading.lensLines),
    fSection('오늘 줄여볼 행동', [reading.lessOf]),
    fSection('3분 미션', [reading.mission]),
    pauseBlock(reading),
    messageBlock(reading),
    photoButton(reading),
    feedback,
    fEl('p', 'fortune-note', reading.note));
  if (differs === true) feedback.querySelectorAll('button')[1].setAttribute('aria-pressed', 'true');
  return true;
}

function openFortune(tab) {
  show('fortune');
  setFortuneTab(tab);
}

(function initFortune() {
  const select = $('mbtiSelect');
  MBTI_TYPES.forEach(type => { const option = fEl('option', '', type); option.value = type; select.append(option); });
  const saved = fStore('get');
  const savedCalendar = saved[0] === 'L' || saved[0] === 'M' ? 'lunar' : 'solar';
  if (/^[SLM][0-9]{8}$/.test(saved) && parseBirthdate(saved.slice(1), new Date(), savedCalendar, saved[0] === 'M')) {
    setBirthCalendar(savedCalendar);
    $('birthLeap').checked = saved[0] === 'M';
    $('birthInput').value = saved.slice(1);
    $('birthRemember').checked = true;
  }
  $('cal-solar').onclick = () => setBirthCalendar('solar');
  $('cal-lunar').onclick = () => setBirthCalendar('lunar');
  $('tab-birth').onclick = () => setFortuneTab('birth');
  $('tab-mbti').onclick = () => setFortuneTab('mbti');
  const birthButtons = [$('birthGo'), $('birthAgain')], mbtiButtons = [$('mbtiGo'), $('mbtiAgain')];
  $('birthGo').onclick = () => { fortuneSalt = 0; runWithLoading($('birthResult'), birthButtons, birthProblem, renderBirthResult); };
  $('birthAgain').onclick = () => { fortuneSalt++; runWithLoading($('birthResult'), birthButtons, birthProblem, renderBirthResult); };
  $('birthForget').onclick = () => { fStore('clear'); $('birthInput').value = ''; $('birthRemember').checked = false; $('birthLeap').checked = false; loadTokens.birthResult++; birthButtons.forEach(button => { button.disabled = false; }); $('birthResult').replaceChildren(); toast('기억해 둔 생년월일을 지웠어요.'); };
  const mbtiProblem = () => $('mbtiSelect').value ? '' : '먼저 MBTI 16가지 중 하나를 골라 주세요.';
  $('mbtiGo').onclick = () => { mbtiSalt = 0; runWithLoading($('mbtiResult'), mbtiButtons, mbtiProblem, renderMbtiResult); };
  $('mbtiAgain').onclick = () => { mbtiSalt++; runWithLoading($('mbtiResult'), mbtiButtons, mbtiProblem, renderMbtiResult); };
  ['own', 'opposite'].forEach(view => {
    $('view-' + view).onclick = () => {
      mbtiView = view;
      ['own', 'opposite'].forEach(name => $('view-' + name).setAttribute('aria-pressed', String(name === view)));
      if (select.value) renderMbtiResult();
    };
  });
  $('fortuneNav').onclick = () => openFortune('birth');
  $('fortuneHero').onclick = () => openFortune('birth');
  $('backFortune').onclick = () => show('home');
})();
