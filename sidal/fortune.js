'use strict';
// Birthdate tarot and MBTI tarot: pure calculation and wording. No DOM here, and nothing is sent anywhere.
// Everything is derived in the browser from the typed birthdate and today's date. The same input on the same day gives the same card.

const FORTUNE_ELEMENTS = {
  '목': {name: '목(木)', color: '초록빛', feel: '자라고 시작하는 기운', tip: '새로 시작할 작은 일 하나에 시간을 내어 보세요.'},
  '화': {name: '화(火)', color: '따뜻한 주황빛', feel: '드러내고 표현하는 기운', tip: '마음에 있는 말을 짧게 꺼내 보세요.'},
  '토': {name: '토(土)', color: '부드러운 노란빛', feel: '중심을 잡고 받쳐 주는 기운', tip: '생활의 리듬(식사·수면)부터 고르게 맞춰 보세요.'},
  '금': {name: '금(金)', color: '은은한 흰빛', feel: '정리하고 기준을 세우는 기운', tip: '쌓인 것 중 하나를 정리해 보세요.'},
  '수': {name: '수(水)', color: '깊은 남색', feel: '흐르고 쉬어 가는 기운', tip: '서두르지 않고 쉬는 시간을 먼저 확보해 보세요.'}
};
const STEM_ELEMENT = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'];

// Life-path style themes for the numbers 1-9. They are prompts for reflection, not predictions.
const NUMBER_THEMES = {
  1: {topic: '내가 먼저 시작하는 일', balance: '혼자 밀어붙이는 힘과 함께 가는 힘 사이', ask: '스스로 정하고 싶은 것 하나는 무엇인가요?'},
  2: {topic: '관계와 균형', balance: '상대를 배려하는 마음과 내 의견 사이', ask: '말하지 않고 삼킨 마음이 있나요?'},
  3: {topic: '표현과 즐거움', balance: '꺼내 보이는 일과 다듬는 일 사이', ask: '요즘 나를 가볍게 웃게 하는 것은 무엇인가요?'},
  4: {topic: '기반과 습관', balance: '꾸준함과 숨 돌릴 여유 사이', ask: '매일 할 수 있는 가장 작은 습관은 무엇인가요?'},
  5: {topic: '변화와 자유', balance: '새로움을 향한 호기심과 지켜야 할 약속 사이', ask: '바꾸고 싶은 것과 지키고 싶은 것은 각각 무엇인가요?'},
  6: {topic: '돌봄과 책임', balance: '남을 챙기는 일과 나를 챙기는 일 사이', ask: '이번 주 나를 돌보는 데 쓴 시간은 얼마인가요?'},
  7: {topic: '혼자 생각하고 배우는 시간', balance: '깊이 파고드는 시간과 사람들과 나누는 시간 사이', ask: '더 알고 싶은 것 한 가지는 무엇인가요?'},
  8: {topic: '일과 자원의 균형', balance: '성과를 내는 일과 쉬는 일 사이', ask: '지금 내가 쓰고 있는 에너지는 어디로 가고 있나요?'},
  9: {topic: '마무리와 놓아 주기', balance: '붙잡는 마음과 보내는 마음 사이', ask: '이제 정리해도 괜찮은 것은 무엇인가요?'}
};

// "오늘 줄여볼 행동" (instead of a list of things to be afraid of) and a light action, chosen by the day number.
const LESS_OF = {
  1: '혼자 다 결정하려는 것', 2: '상대 눈치만 보며 말을 미루는 것', 3: '생각 없이 말을 쏟아내는 것',
  4: '계획을 지나치게 촘촘히 짜는 것', 5: '이것저것 한꺼번에 벌이는 것', 6: '남의 몫까지 떠안는 것',
  7: '혼자 곱씹으며 결론을 서두르는 것', 8: '쉬는 시간까지 일로 채우는 것', 9: '지나간 일을 계속 되짚는 것'
};
const LIGHT_ACTION = {
  1: '오늘 내가 정하고 싶은 것 한 가지를 메모해 보기', 2: '고마운 사람에게 안부 한 줄 보내기', 3: '좋아하는 노래 한 곡을 끝까지 듣기',
  4: '책상 위 한 칸만 정리하기', 5: '평소와 다른 길로 5분 걸어 보기', 6: '따뜻한 물 한 잔을 천천히 마시기',
  7: '휴대폰을 내려두고 3분 조용히 앉아 있기', 8: '30분 일하고 5분 일어나 스트레칭하기', 9: '더는 필요 없는 파일이나 사진 한 가지 지우기'
};

function fnv(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function digitSum(n) { return String(Math.abs(n)).split('').reduce((sum, d) => sum + Number(d), 0); }
function reduceNumber(n) { while (n > 9) n = digitSum(n); return n; }
function pad2(n) { return String(n).padStart(2, '0'); }
function ymdOf(date) { return date.getFullYear() + pad2(date.getMonth() + 1) + pad2(date.getDate()); }

// Lunar -> solar, in the browser. The Chinese calendar of Intl gives the lunar date of any solar date, so the solar date is found by
// scanning the days a lunar year can cover (about 21 January to 19 February of the next year). Leap months are written "2bis" by Intl.
const LUNAR_FORMAT = typeof Intl !== 'undefined' ? new Intl.DateTimeFormat('en-u-ca-chinese', {year: 'numeric', month: 'numeric', day: 'numeric'}) : null;
function lunarOf(date) {
  const parts = {};
  for (const part of LUNAR_FORMAT.formatToParts(date)) parts[part.type] = part.value;
  const month = String(parts.month || '');
  return {year: Number(parts.relatedYear), month: parseInt(month, 10), leap: /bis$/.test(month), day: Number(parts.day)};
}
// Returns {year, month, day} (solar) or null when that lunar date does not exist (for example day 30 of a 29-day month, or a leap month that year lacks).
function lunarToSolar(year, month, day, leap = false) {
  if (!LUNAR_FORMAT || !Number.isInteger(year) || year < 1900 || year > 2100) return null;
  try {
    const start = new Date(year, 0, 15), end = new Date(year + 1, 1, 25);
    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const lunar = lunarOf(cursor);
      if (lunar.year === year && lunar.month === month && lunar.day === day && lunar.leap === Boolean(leap)) {
        return {year: cursor.getFullYear(), month: cursor.getMonth() + 1, day: cursor.getDate()};
      }
    }
  } catch { /* Intl without the Chinese calendar: treated as "cannot convert" */ }
  return null;
}

// Accepts exactly 8 digits (YYYYMMDD). calendar is 'solar' or 'lunar' (leap = 윤달). Returns the SOLAR date used for every calculation,
// or null for an impossible date, a date before 1900 or after today.
function parseBirthdate(text, today = new Date(), calendar = 'solar', leap = false) {
  const clean = String(text || '').replace(/[\s.\-/]/g, '');
  if (!/^[0-9]{8}$/.test(clean)) return null;
  let year = Number(clean.slice(0, 4)), month = Number(clean.slice(4, 6)), day = Number(clean.slice(6, 8));
  let lunar = null;
  if (calendar === 'lunar') {
    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 30) return null;
    const solar = lunarToSolar(year, month, day, leap);
    if (!solar) return null;
    lunar = {year, month, day, leap: Boolean(leap)};
    ({year, month, day} = solar);
  }
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (year < 1900 || date > today) return null;
  return {year, month, day, lunar, key: String(year) + pad2(month) + pad2(day)};
}

function birthElement(birth) {
  // Simplified: the year's heavenly stem, without the 입춘 (start of spring) boundary.
  const stem = ((birth.year - 4) % 10 + 10) % 10;
  return STEM_ELEMENT[stem];
}
function personalYear(birth, year) { return reduceNumber(digitSum(birth.month) + digitSum(birth.day) + digitSum(year)); }
function personalDay(birth, date) {
  const personalMonth = reduceNumber(personalYear(birth, date.getFullYear()) + date.getMonth() + 1);
  return reduceNumber(personalMonth + date.getDate());
}
function fortuneCard(deck, seed) { return deck[fnv(seed) % deck.length]; }

function yearReading(birth, deck, today = new Date(), salt = 0) {
  const year = today.getFullYear(), number = personalYear(birth, year), theme = NUMBER_THEMES[number];
  // Numerology: month + day + this year, reduced to 1-9, points to the Major Arcana of the same number.
  const card = deck.find(c => c.id === 'm0' + number) || fortuneCard(deck, 'Y|' + birth.key + '|' + year);
  return {year, number, card,
    calc: (birth.lunar ? '음력 ' + birth.lunar.year + '년 ' + (birth.lunar.leap ? '윤' : '') + birth.lunar.month + '월 ' + birth.lunar.day + '일은 양력 ' + birth.year + '년 ' + birth.month + '월 ' + birth.day + '일이에요. ' : '') + '계산: (' + birth.month + '월 + ' + birth.day + '일 + ' + year + '년)의 각 자리 숫자를 더해 한 자리로 줄이면 ' + number + ' → 메이저 ' + number + '번 ' + card.name + ' 카드예요.', element: birthElement(birth),
    topic: '올해 길게 챙겨 볼 주제는 “' + theme.topic + '”이에요. 카드 키워드(' + card.keywords.slice(0, 2).join('·') + ')를 곁에 두고 읽어 보세요.',
    balance: '균형을 찾는 자리는 ' + theme.balance + '로 볼 수 있어요.',
    ask: theme.ask + ' 그리고 ' + card.question};
}
function todayReading(birth, deck, today = new Date(), salt = 0) {
  const number = personalDay(birth, today), element = FORTUNE_ELEMENTS[birthElement(birth)];
  const card = fortuneCard(deck, 'D|' + birth.key + '|' + ymdOf(today) + '|' + salt);
  return {date: ymdOf(today), number, card, element: birthElement(birth),
    care: '오늘 카드는 ' + card.name + '이에요. ' + card.meaning,
    lessOf: fortuneFrame(LESS_FRAMES, LESS_OF[number], 'LF|' + birth.key + '|' + ymdOf(today) + '|' + salt),
    light: fortuneFrame(LIGHT_FRAMES, LIGHT_ACTION[number], 'AF|' + birth.key + '|' + ymdOf(today) + '|' + salt),
    color: '상징 색: ' + element.color + '. 오늘의 숫자: ' + number + '. 둘 다 재미로 보는 상징일 뿐 결과를 정하지 않아요.',
    elementLine: element.name + ' · ' + element.feel + '. ' + element.tip};
}

// Several sentence patterns per kind of line, picked by the same seed as the card, so the same day gives the same wording
// but different days (and "다른 카드로 다시 보기") do not all read alike. Every "줄여볼" item ends in "것" and every action ends in "기".
const LESS_FRAMES = [
  x => '오늘 줄여볼 행동은 ' + x + '이에요.',
  x => '오늘은 ' + x + '을 조금만 덜어 내 보세요.',
  x => '하루만 ' + x + '을 가볍게 내려놓아 봐요.',
  x => x + ', 오늘은 평소의 절반만 해 보면 어때요?',
  x => '줄여 볼 한 가지: ' + x + '.'
];
const LIGHT_FRAMES = [
  x => '가볍게 시도할 행동: ' + x + '.',
  x => '오늘의 작은 시도 — ' + x + '.',
  x => '부담 없이 해 볼 일: ' + x + '.',
  x => '해 볼 만한 작은 일은 ' + x + '예요.'
];
const MISSION_FRAMES = [
  (a, k, q) => '타이머를 3분에 맞추고 시작해요: ' + a + '. 하는 동안 카드 키워드 ‘' + k + '’ 하나를 떠올려 보세요. 끝나면 이 질문에 한 줄로 답해 보세요: ' + q,
  (a, k, q) => '오늘의 3분은 이거예요 — ' + a + '. 키워드 ‘' + k + '’를 곁에 두고 해 보세요. 마친 뒤 질문 하나: ' + q,
  (a, k, q) => '딱 3분만. ' + a + '. 키워드 ‘' + k + '’를 떠올려도 좋고, 그냥 해도 좋아요. 끝나면 이 질문을 생각해 봐요: ' + q,
  (a, k, q) => '작게 시작해요. 3분 안에 할 일: ' + a + '. 오늘 카드의 질문은 이거예요: ' + q,
  (a, k, q) => '3분 미션 — ' + a + '. 끝낸 뒤 한 줄로 답해 보세요: ' + q
];
function fortuneFrame(frames, value, seed) { return frames[fnv(seed) % frames.length](value); }
function fortunePick(list, seed) { return list[fnv(seed) % list.length]; }

// MBTI
const MBTI_TYPES = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
const MBTI_FLIP = {E: 'I', I: 'E', S: 'N', N: 'S', T: 'F', F: 'T', J: 'P', P: 'J'};
const MBTI_LENS = {
  E: ['말하며 생각을 정리하는 편이라면, 카드의 뜻을 누군가와 말로 풀어 보면 선명해질 수 있어요.',
    '사람 속에서 힘을 얻는 편이라면, 오늘 카드 이야기를 한 사람에게 꺼내 보는 것도 방법이에요.',
    '생각이 입 밖으로 나올 때 또렷해지는 편이라면, 카드가 떠올리게 하는 말을 소리 내어 해 보세요.'],
  I: ['혼자 곱씹으며 정리하는 편이라면, 그림을 오래 들여다보며 떠오르는 것을 적어 보면 좋아요.',
    '조용한 시간에 힘을 얻는 편이라면, 카드 한 장과 마주 앉아 천천히 생각해 보세요.',
    '속으로 오래 품는 편이라면, 카드에서 마음에 걸린 한 곳만 골라 말로 옮겨 보세요.'],
  S: ['눈에 보이는 사실에서 출발하는 편이라면, 그림 속 구체적인 물건과 장면부터 하나씩 짚어 보세요.',
    '경험과 현실을 믿는 편이라면, 카드의 뜻을 오늘 실제로 할 수 있는 일에 대어 보세요.',
    '손에 잡히는 것이 편한 편이라면, 카드의 색과 사물 하나를 골라 지금 내 상황과 비교해 보세요.'],
  N: ['의미와 가능성을 먼저 떠올리는 편이라면, 그림이 가리키는 상징을 자유롭게 연결해 보세요.',
    '큰 그림을 먼저 보는 편이라면, 카드가 던지는 이야기를 내 상황의 한 장면으로 그려 보세요.',
    '이어 붙이며 생각하는 편이라면, 카드의 키워드가 어디로 이어질지 세 갈래로 상상해 보세요.'],
  T: ['기준과 논리로 따져 보는 편이라면, 카드의 뜻을 내 상황의 근거에 대어 보세요.',
    '이유가 맞아야 마음이 움직이는 편이라면, 카드의 메시지를 사실과 해석으로 나눠 적어 보세요.',
    '분석이 편한 편이라면, 카드가 가리키는 것 중 확인할 수 있는 것부터 확인해 보세요.'],
  F: ['마음과 관계의 결을 먼저 살피는 편이라면, 카드를 보며 올라오는 감정부터 느껴 보세요.',
    '사람의 마음에 민감한 편이라면, 카드가 건드린 감정에 이름을 하나 붙여 보세요.',
    '공감이 먼저인 편이라면, 오늘만큼은 나의 마음을 먼저 들어 주는 쪽으로 카드를 읽어 보세요.'],
  J: ['미리 정해 두고 움직이는 편이라면, 카드가 말하는 바를 오늘 할 일 한 줄로 정해 보세요.',
    '계획이 있어야 편한 편이라면, 카드의 키워드를 오늘 일정 한 칸에 적어 두세요.',
    '마무리를 좋아하는 편이라면, 카드에서 끝내고 싶은 일 하나를 골라 보세요.'],
  P: ['상황 따라 열어 두는 편이라면, 카드의 뜻을 정답이 아닌 몇 가지 가능성으로 열어 두세요.',
    '흐름을 타며 움직이는 편이라면, 카드가 건넨 질문을 오늘 하루 곁에 두고 지켜보세요.',
    '선택지를 열어 두는 편이라면, 카드를 보고 떠오른 길 중 가장 가벼운 길부터 시험해 보세요.']
};
const MBTI_LESS = {
  E: '쉬는 시간까지 약속으로 채우는 것', I: '정리한 생각을 끝까지 말하지 않는 것',
  S: '눈앞 사실만 보고 다른 가능성을 닫는 것', N: '상상으로 앞서가 걱정을 키우는 것',
  T: '결론부터 말해 버리는 것', F: '상대의 기분을 먼저 떠맡는 것',
  J: '계획을 한 칸 더 촘촘히 짜는 것', P: '결정을 계속 뒤로 미루는 것'
};
const MBTI_MISSION = {
  E: ['가까운 한 사람에게 오늘 카드 이야기를 한 문장으로 보내 보기', '좋아하는 사람에게 안부를 한 줄 보내 보기'],
  I: ['조용한 곳에서 떠오르는 생각을 세 줄로 적어 보기', '창밖을 보며 말없이 머릿속을 비워 보기'],
  S: ['지금 눈에 보이는 사실 세 가지만 적어 보기', '손에 닿는 물건 하나를 골라 천천히 살펴보기'],
  N: ['떠오른 가능성 중 가장 작은 하나만 골라 적어 보기', '이 고민이 한 장면이라면 어떤 장면일지 한 줄로 그려 보기'],
  T: ['판단하기 전에 지금 감정을 한 단어로 먼저 적어 보기', '고민 중인 일의 좋은 점과 아쉬운 점을 한 줄씩 적어 보기'],
  F: ['내 기분 한 단어와 사실 한 줄을 나란히 적어 보기', '내게 지금 필요한 것을 한 문장으로 말해 보기'],
  J: ['일정에 일부러 10분 빈칸을 만들어 두기', '오늘 할 일 하나를 지우고 그 자리를 비워 두기'],
  P: ['미뤄 둔 일 중 3분 안에 끝낼 수 있는 한 가지에 손대기', '떠오르는 선택지 하나에 오늘 날짜의 임시 결정을 적어 보기']
};

// How each letter tends to take in a card, used for the one-line "why this advice" and for the 3-minute pause.
const MBTI_STYLE = {
  E: '말로 풀어 보는', I: '혼자 곱씹어 보는', S: '눈에 보이는 것부터 짚는', N: '의미를 이어 보는',
  T: '근거를 따져 보는', F: '마음을 먼저 살피는', J: '미리 정해 두는', P: '여지를 열어 두는'
};
const PAUSE_SLOTS = [['lunch', '점심 식사 후'], ['evening', '퇴근·하교 후'], ['night', '자기 전'], ['now', '지금 바로']];
const MESSAGE_TONES = [['clear', '짧고 명확하게'], ['warm', '따뜻하게'], ['easy', '부담 없이']];
// Two sentences per tone. They say what the sender wants and leave the answer open; they never speak for the other person.
const MESSAGE_TEMPLATES = {
  clear: [k => '‘' + k + '’에 대해 잠깐 이야기하고 싶어. 가능한 시간을 알려줘.', k => '‘' + k + '’ 관련해서 확인할 게 있어. 이번 주에 10분만 시간 낼 수 있을까?'],
  warm: [k => '요즘 ‘' + k + '’ 이야기가 계속 마음에 남아서, 네 생각이 궁금해졌어. 편할 때 들려줄래?', k => '네 생각을 천천히 듣고 싶어서 연락했어. ‘' + k + '’에 대해 편할 때 이야기해 줄래?'],
  easy: [k => '급한 건 아니고, 시간 될 때 ‘' + k + '’ 얘기 가볍게 나눠볼 수 있을까? 어려우면 괜찮아.', k => '부담 갖지 말고 들어줘. 언젠가 ‘' + k + '’ 이야기를 해 보고 싶어. 답은 천천히 줘도 돼.']
};

function validMbti(type) { return MBTI_TYPES.includes(type); }
function flipMbti(type) { return type.split('').map(letter => MBTI_FLIP[letter]).join(''); }

// view: 'own' reads the card through your own type, 'opposite' through the opposite type (a change of angle, not a verdict).
function mbtiReading(type, view, deck, today = new Date(), salt = 0) {
  if (!validMbti(type)) return null;
  const lens = view === 'opposite' ? flipMbti(type) : type;
  const card = fortuneCard(deck, 'M|' + type + '|' + ymdOf(today) + '|' + salt);
  const letters = lens.split('');
  const seed = type + '|' + ymdOf(today) + '|' + salt;
  const pickLetter = letters[fnv('L|' + seed) % 4];
  const keyword = card.keywords[0];
  const missionAction = fortunePick(MBTI_MISSION[pickLetter], 'M|' + seed);
  const lessItems = [letters[fnv('A|' + seed) % 4], letters[(fnv('A|' + seed) + 1 + fnv('B|' + seed) % 3) % 4]].map(letter => MBTI_LESS[letter]);
  return {type, lens, view: view === 'opposite' ? 'opposite' : 'own', card,
    viewLine: view === 'opposite'
      ? fortunePick([type + '의 반대 관점인 ' + lens + '의 눈으로 보면, 평소 놓치던 면이 보일 수 있어요.',
        '오늘은 자리를 바꿔 ' + lens + '의 눈으로 읽어 봐요. 낯설면 낯선 대로 괜찮아요.',
        '평소와 반대인 ' + lens + ' 쪽에서 카드를 보면 다른 단서가 눈에 들어올 수 있어요.'], 'V|' + seed)
      : fortunePick([type + ' 성향의 눈으로 카드를 읽어요.', type + '답게 편한 방식으로 카드를 읽어 봐요.', '평소의 ' + type + ' 시선 그대로 카드를 펼쳐 봐요.'], 'V|' + seed),
    symbol: card.name + '(' + card.keywords.slice(0, 3).join('·') + '): ' + card.symbolism,
    lensLines: letters.map(letter => fortunePick(MBTI_LENS[letter], 'N|' + letter + '|' + seed)),
    meaning: card.meaning,
    lessOf: fortuneFrame(LESS_FRAMES, lessItems[0] === lessItems[1] ? lessItems[0] : lessItems.join(', 그리고 '), 'LF|' + seed),
    mission: fortuneFrame(MISSION_FRAMES.map(frame => a => frame(a, keyword, card.question)), missionAction, 'MF|' + seed),
    action: missionAction, keyword,
    why: '카드 ‘' + card.name + '’의 키워드 ‘' + keyword + '’와, ' + MBTI_STYLE[pickLetter] + ' ' + pickLetter + ' 성향의 관점을 이어서 이 3분 미션을 골랐어요.',
    note: 'MBTI는 정답이 아니라 참고용 틀이에요. 오늘의 나와 다르면 다르다고 느껴도 괜찮아요.'};
}

// A message the person can edit and copy, in the tone they pick. Returns '' for an unknown tone.
function mbtiMessage(reading, tone, variant = 0) {
  const list = MESSAGE_TEMPLATES[tone];
  return list ? list[Math.abs(variant) % list.length](reading.keyword) : '';
}
// For when no message can be sent: a note to oneself.
function mbtiMemo(reading) {
  return '오늘의 다짐 — 카드 ‘' + reading.card.name + '’, 키워드 ‘' + reading.keyword + '’. 3분 동안 ' + reading.action + '. 질문 하나: ' + reading.card.question + ' 연락하지 않아도 괜찮아요. 내 마음이 정리되는 만큼만 해요.';
}
// Birthdate reading: one line on why this action was chosen.
function todayWhy(today) { return '오늘 카드 ‘' + today.card.name + '’의 키워드 ‘' + today.card.keywords[0] + '’와, 오늘의 숫자 ' + today.number + '의 주제를 이어서 아래 행동을 골랐어요.'; }
