'use strict';
// "오늘의 한 장": one face-down card at the top of the first screen. One tap turns it over and shows a three-line summary.
// The day's card is kept in this browser (so reloading cannot be used to shuffle until a nicer card shows up); tomorrow brings a new one.

const TODAY_KEY = 'sidal_today';

function todayRandom(limit) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0] % limit;
  return Math.floor(Math.random() * limit);
}
function todayStored(now = new Date()) {
  try {
    const saved = JSON.parse(localStorage.getItem(TODAY_KEY) || 'null');
    if (saved && saved.d === ymdOf(now) && deckById.has(saved.id)) return deckById.get(saved.id);
  } catch { /* nothing saved, or storage blocked */ }
  return null;
}
function todayRemember(card, now = new Date()) {
  try { localStorage.setItem(TODAY_KEY, JSON.stringify({d: ymdOf(now), id: card.id})); } catch { /* the card still shows for this visit */ }
}
// Three short lines: what the card says, one light step for today (by the day's number), and a question to carry.
function todaySummary(card, now = new Date()) {
  const number = reduceNumber(digitSum(Number(ymdOf(now))));
  return ['카드가 말하는 것: ' + card.meaning, '오늘의 한 걸음: ' + LIGHT_ACTION[number] + '.', '생각해 볼 질문: ' + card.question];
}

function showTodayCard(card, again) {
  $('todayImage').src = card.image;
  $('todayImage').alt = card.name + ' 카드';
  $('todayImage').hidden = false;
  $('todayBack').hidden = true;
  $('todayFlip').setAttribute('aria-label', '오늘의 한 장: ' + card.name);
  $('todayName').textContent = card.name + ' · ' + card.en;
  fillKeys($('todayKeys'), card.keywords);
  const lines = todaySummary(card);
  ['todayLine1', 'todayLine2', 'todayLine3'].forEach((id, index) => { $(id).textContent = lines[index]; });
  $('todayResult').hidden = false;
  $('todayHint').textContent = again ? '오늘 이미 뽑은 카드예요. 내일은 새 카드가 나와요.' : '오늘의 한 장이에요. 내일은 새 카드가 나와요.';
}

(function initToday() {
  const saved = todayStored();
  if (saved) showTodayCard(saved, true);
  $('todayFlip').onclick = () => {
    if (!$('todayResult').hidden) return;
    const card = todayStored() || TAROT_DECK[todayRandom(TAROT_DECK.length)];
    todayRemember(card);
    showTodayCard(card, false);
  };
})();
