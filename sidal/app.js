'use strict';
const $ = id => document.getElementById(id);
const deckById = new Map(TAROT_DECK.map(card => [card.id, card]));
const allItems = CATEGORIES.flatMap(category => category.items.map(item => ({...item, category})));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let activeCat = 'all', selected = null, currentCard = null, currentReading = null;
let phase = 0, timers = [], toastTimer, deckGroup = '메이저';
// History holds only screen/item identifiers. Notes stay in this page's memory.
const drawn = new Map(), drafts = new Map(), historySession = Date.now() + '-' + Math.random();
let currentScreen = 'home', restoringHistory = false;

function show(name) {
  if (!restoringHistory && name !== currentScreen) {
    const state = {sidal: historySession, screen: name, item: allItems.indexOf(selected)};
    if (currentScreen === 'ritual' && name === 'result') history.replaceState(state, '');
    else history.pushState(state, '');
  }
  currentScreen = name;
  ['home', 'fortune', 'prepare', 'ritual', 'result'].forEach(id => $(id).hidden = id !== name);
  window.scrollTo({top: 0, behavior: 'instant'});
  const heading = $(name).querySelector('h1');
  if (heading && name !== 'home') heading.focus({preventScroll: true});
}
function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3200);
}
function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
  phase++;
}
function goBrowse() {
  clearTimers();
  show('home');
  $('browse').scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth'});
}
function fillKeys(host, keywords) {
  host.replaceChildren();
  keywords.forEach(word => {
    const span = document.createElement('span');
    span.textContent = word;
    host.append(span);
  });
}
function renderCategories() {
  $('categories').replaceChildren();
  [{id: 'all', name: '전체', symbol: '✧'}, ...CATEGORIES].forEach(category => {
    const button = document.createElement('button');
    button.textContent = category.symbol + ' ' + category.name;
    button.classList.toggle('active', activeCat === category.id);
    button.setAttribute('aria-pressed', String(activeCat === category.id));
    button.onclick = () => { activeCat = category.id; renderCategories(); renderList(); };
    $('categories').append(button);
  });
}
function renderList() {
  const query = $('search').value.trim().toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  const items = allItems.filter(item => {
    const text = [item.title, item.fact, item.uncertain, item.category.name, item.action, item.template].join(' ').toLowerCase();
    return (activeCat === 'all' || item.category.id === activeCat) && words.every(word => text.includes(word));
  });
  $('clearSearch').hidden = !query;
  $('listTitle').textContent = query ? `“${query}” 검색 결과` : activeCat === 'all' ? '모든 고민' : CATEGORIES.find(c => c.id === activeCat).name;
  $('count').textContent = items.length + '개의 이야기';
  $('empty').hidden = items.length > 0;
  $('situations').replaceChildren();
  items.forEach(item => {
    const button = document.createElement('button');
    button.className = 'situation';
    const tag = document.createElement('small');
    tag.textContent = item.category.symbol + ' ' + item.category.name;
    const title = document.createElement('b');
    title.textContent = item.title;
    const sub = document.createElement('span');
    const card = deckById.get(SITUATION_READINGS[item.id].cardId);
    sub.textContent = card.name + ' · ' + card.keywords.slice(0, 2).join(' / ');
    const arrow = document.createElement('em');
    arrow.textContent = '↗';
    button.append(tag, title, sub, arrow);
    button.onclick = () => choose(item);
    $('situations').append(button);
  });
}
function choose(item) {
  clearTimers();
  setSelection(item);
  show('prepare');
}
function setSelection(item) {
  selected = item;
  currentCard = drawn.get(item) || null;
  currentReading = SITUATION_READINGS[item.id];
  $('selectedCat').textContent = item.category.name;
  $('selectedTitle').textContent = item.title;
  $('note').value = drafts.get(item) || '';
  $('noteCount').textContent = $('note').value.length + ' / 500';
}
$('search').oninput = renderList;
$('clearSearch').onclick = () => { $('search').value = ''; renderList(); $('search').focus(); };
$('resetSearch').onclick = () => { activeCat = 'all'; $('search').value = ''; renderCategories(); renderList(); };
$('note').oninput = () => { drafts.set(selected, $('note').value); $('noteCount').textContent = $('note').value.length + ' / 500'; };
['backList', 'backHome', 'again', 'explore', 'exploreNav'].forEach(id => $(id).onclick = goBrowse);
$('backPrepare').onclick = () => { clearTimers(); show('prepare'); };
history.replaceState({sidal: historySession, screen: 'home', item: -1}, '');
window.addEventListener('popstate', event => {
  clearTimers();
  const state = event.state;
  restoringHistory = true;
  try {
    if (!state || state.sidal !== historySession || !['home', 'prepare', 'ritual', 'result'].includes(state.screen) || (state.screen !== 'home' && !allItems[state.item])) {
      history.replaceState({sidal: historySession, screen: 'home', item: -1}, '');
      show('home');
      return;
    }
    if (state.screen === 'home') { show('home'); return; }
    setSelection(allItems[state.item]);
    if (state.screen === 'ritual') startRitual();
    else if (state.screen === 'result') renderResult();
    else show('prepare');
  } finally { restoringHistory = false; }
});

$('begin').onclick = startRitual;
const SPREAD_SIZE = 18;
let drawPool = [], spreadButtons = [];
function randomIndex(n) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] % n;
  }
  return Math.floor(Math.random() * n);
}
function shuffleDeck() {
  const cards = [...TAROT_DECK];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
function startRitual() {
  if (!selected) return;
  clearTimers();
  const token = phase;
  currentCard = null;
  drawn.delete(selected);
  drawPool = shuffleDeck().slice(0, SPREAD_SIZE);
  $('spread').hidden = true;
  $('spread').classList.remove('choosing');
  $('spread').replaceChildren();
  $('reshuffle').hidden = true;
  $('revealCaption').hidden = true;
  $('reveal').classList.remove('flipped');
  $('reveal').disabled = true;
  $('cardStage').hidden = false;
  $('cardStage').className = 'card-stage shuffling';
  $('ritualHint').textContent = '마음속 질문을 떠올리며 카드를 섞고 있어요.';
  show('ritual');
  timers.push(setTimeout(() => { if (token === phase) showSpread(); }, reducedMotion ? 0 : 1600));
}
function showSpread() {
  const host = $('spread');
  host.replaceChildren();
  spreadButtons = [];
  drawPool.forEach((card, index) => {
    const button = document.createElement('button');
    button.className = 'pick-card';
    button.setAttribute('aria-label', (index + 1) + '번째 카드 고르기');
    button.style.setProperty('--i', index);
    button.style.setProperty('--r', ((index * 37) % 7 - 3) + 'deg');
    button.onclick = () => pickCard(index);
    spreadButtons.push(button);
    host.append(button);
  });
  $('cardStage').hidden = true;
  host.hidden = false;
  $('reshuffle').hidden = false;
  $('ritualHint').textContent = '끌리는 카드를 한 장 고르세요. 어느 카드를 골라도 괜찮아요.';
}
function pickCard(index) {
  if (currentCard || !drawPool[index]) return;
  clearTimers();
  const token = phase;
  currentCard = drawPool[index];
  drawn.set(selected, currentCard);
  $('revealImage').src = currentCard.image;
  $('revealImage').alt = currentCard.name + ' 전통 타로 카드';
  $('revealName').textContent = currentCard.name;
  $('revealKeys').textContent = currentCard.keywords.join(' · ');
  $('reshuffle').hidden = true;
  $('spread').classList.add('choosing');
  if (spreadButtons[index]) spreadButtons[index].classList.add('picked');
  $('ritualHint').textContent = '고른 카드를 펼쳐볼게요.';
  timers.push(setTimeout(() => {
    if (token !== phase) return;
    $('spread').hidden = true;
    $('spread').classList.remove('choosing');
    $('cardStage').hidden = false;
    $('cardStage').className = 'card-stage ready';
    timers.push(setTimeout(() => { if (token === phase) flipChosen(); }, reducedMotion ? 0 : 450));
  }, reducedMotion ? 0 : 380));
}
function flipChosen() {
  const token = phase;
  $('reveal').classList.add('flipped');
  $('ritualHint').textContent = currentCard.symbolism;
  timers.push(setTimeout(() => {
    if (token !== phase) return;
    $('revealCaption').hidden = false;
    $('readResult').focus({preventScroll: true});
  }, reducedMotion ? 0 : 650));
}
$('reshuffle').onclick = startRitual;
function bridgeText() {
  if (currentReading.cardId === currentCard.id) return currentReading.bridge;
  return currentCard.symbolism + ' 이 카드의 키워드 ‘' + currentCard.keywords.join(' · ') + '’를 거울로 이 고민을 바라보면, 이런 질문을 던져볼 수 있어요. ' +
    currentCard.question + ' 다만, ' + selected.uncertain;
}
$('readResult').onclick = renderResult;
function actionText() {
  if (selected.id === '1-9') return '이미 여러 번 연락했거나 연락을 거절당했다면 추가 메시지는 멈춰요. 그렇지 않다면 부담 없는 안부를 한 번 전하고, 그다음에는 답을 기다려보세요.';
  return selected.action;
}
function renderResult() {
  if (!currentCard) { startRitual(); return; }
  const category = selected.category;
  $('resultImage').src = currentCard.image;
  $('resultImage').alt = currentCard.name + ' · ' + currentCard.symbolism;
  $('resultNum').textContent = currentCard.num + ' · UPRIGHT';
  $('resultCard').textContent = currentCard.name;
  $('resultEn').textContent = currentCard.en;
  $('resultCat').textContent = category.name;
  $('resultTitle').textContent = selected.title;
  $('readingLead').textContent = currentReading.lead;
  fillKeys($('resultKeys'), currentCard.keywords);
  $('coreMeaning').textContent = currentCard.meaning;
  $('symbolism').textContent = currentCard.symbolism;
  $('story').textContent = bridgeText();
  $('energyTitle').textContent = category.element + ' · ' + category.flow;
  $('energy').textContent = category.energy;
  document.querySelectorAll('.elements span').forEach(el => el.classList.toggle('active', category.element.includes(el.textContent)));
  $('fact').textContent = selected.fact;
  $('uncertain').textContent = selected.uncertain;
  $('action').textContent = actionText();
  $('templateText').textContent = selected.template;
  $('templateLabel').textContent = selected.template.includes('\n') ? '나를 위한 작은 점검표' : '내 말투로 바꿔 쓸 수 있는 문장';
  $('reflection').textContent = currentReading.reflection;
  const note = $('note').value.trim();
  $('memo').hidden = !note;
  $('memoText').textContent = note;
  document.querySelectorAll('[data-feedback]').forEach(button => button.classList.remove('active'));
  $('feedbackStatus').textContent = '선택한 의견은 이 브라우저에만 저장돼요. 운영자에게 전송되지 않아요.';
  show('result');
  if (typeof applyPaywall === 'function') applyPaywall();
}
$('deleteNote').onclick = () => {
  drafts.delete(selected);
  $('note').value = '';
  $('noteCount').textContent = '0 / 500';
  $('memoText').textContent = '';
  $('memo').hidden = true;
  toast('개인 메모를 지웠어요.');
};
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('복사했어요.'); }
  catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.style.cssText = 'position:fixed;opacity:0';
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch {}
    field.remove();
    toast(copied ? '복사했어요.' : '문장을 길게 눌러 직접 복사해주세요.');
  }
}
const reportLocked = () => typeof lockedForExport === 'function' && lockedForExport();
$('copyTemplate').onclick = () => reportLocked() ? toast('대화 문장은 열람 후 복사할 수 있어요.') : copyText(selected.template);
$('copyReport').onclick = () => copyText([
  '사이달 SIDAL · ' + selected.title,
  currentCard.name + ' / 정방향 / ' + currentCard.keywords.join(' · '), currentReading.lead,
  '카드의 기본 뜻', currentCard.meaning, '그림 속 상징', currentCard.symbolism,
  '내 상황에 연결하면', bridgeText(), '오행의 비유 · ' + selected.category.element,
  selected.category.energy, '개인 사주 계산이나 타로의 전통 대응이 아닌 별도의 비유입니다.',
  ...(reportLocked() ? [] : ['확인되는 것', selected.fact, '단정할 수 없는 것', selected.uncertain]),
  '오늘의 행동', actionText(), ...(reportLocked() ? [] : [selected.template]), '나에게 남기는 질문', currentReading.reflection,
  '직접 고른 카드와 사전 작성 해석입니다. 미래나 타인의 마음을 예측하지 않습니다.'
].join('\n\n'));

document.querySelectorAll('[data-feedback]').forEach(button => button.onclick = () => {
  document.querySelectorAll('[data-feedback]').forEach(b => b.classList.toggle('active', b === button));
  try {
    const key = 'sidal-feedback-v4';
    let saved;
    try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch { saved = []; }
    if (!Array.isArray(saved)) saved = [];
    saved.push({situation: selected.id, card: currentCard.id, rating: button.dataset.feedback, at: Date.now()});
    localStorage.setItem(key, JSON.stringify(saved.slice(-100)));
    $('feedbackStatus').textContent = '이 브라우저에 의견을 저장했어요. 운영자에게는 전송되지 않아요.';
  } catch { $('feedbackStatus').textContent = '브라우저 저장이 제한되어 의견을 저장하지 못했어요.'; }
});
function openAbout() { $('modal').showModal(); }
['about', 'noticeAbout', 'credits'].forEach(id => $(id).onclick = openAbout);
['close', 'closeBottom'].forEach(id => $(id).onclick = () => $('modal').close());

function renderDeck() {
  $('deckDetail').hidden = true;
  $('deckGrid').hidden = false;
  $('deckFilters').hidden = false;
  $('deckFilters').replaceChildren();
  ['메이저', '완드', '컵', '소드', '펜타클'].forEach(group => {
    const button = document.createElement('button');
    button.textContent = group + (group === '메이저' ? ' · 22' : ' · 14');
    button.classList.toggle('active', group === deckGroup);
    button.setAttribute('aria-pressed', String(group === deckGroup));
    button.onclick = () => { deckGroup = group; renderDeck(); };
    $('deckFilters').append(button);
  });
  $('deckGrid').replaceChildren();
  TAROT_DECK.filter(card => card.group === deckGroup).forEach(card => {
    const button = document.createElement('button');
    button.className = 'deck-item';
    const image = document.createElement('img');
    image.src = card.image;
    image.alt = card.name + ' 카드';
    image.loading = 'lazy';
    image.width = 480; image.height = 800;
    const name = document.createElement('b');
    name.textContent = card.name;
    const keys = document.createElement('span');
    keys.textContent = card.keywords.join(' · ');
    button.append(image, name, keys);
    button.onclick = () => showCardDetail(card);
    $('deckGrid').append(button);
  });
}
function showCardDetail(card) {
  $('deckGrid').hidden = true;
  $('deckFilters').hidden = true;
  $('deckDetail').hidden = false;
  $('detailImage').src = card.image;
  $('detailImage').alt = card.name + ' · ' + card.symbolism;
  $('detailGroup').textContent = card.group + ' · 정방향';
  $('detailName').textContent = card.name;
  $('detailEn').textContent = card.en;
  fillKeys($('detailKeys'), card.keywords);
  $('detailSymbol').textContent = card.symbolism;
  $('detailMeaning').textContent = card.meaning;
  $('detailQuestion').textContent = card.question;
  $('deckModal').scrollTop = 0;
  $('backDeck').focus({preventScroll: true});
}
$('deckNav').onclick = () => { renderDeck(); $('deckModal').showModal(); };
$('closeDeck').onclick = () => $('deckModal').close();
$('backDeck').onclick = renderDeck;
$('enlargeCard').onclick = () => { renderDeck(); $('deckModal').showModal(); showCardDetail(currentCard); };

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image'));
    img.src = src;
  });
}
renderCategories();
renderList();
