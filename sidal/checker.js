'use strict';
// "보내기 전 30초 점검": look at a message before sending it and list how it could read to a T-leaning and to an F-leaning person.
// It only looks at the shape of the sentence (rules), never at the other person's feelings, and the text stays on this device:
// it is not stored, not sent, and not even kept after the box is cleared.

const CHECK_MAX = 600;
const CHECK_SIGNS = {
  absolute: /(항상|맨날|늘\s|절대|전혀|도대체|당연히|매번|한\s*번도|원래\s)/,
  blame: /(너는|넌\s|네가|니가|너\s*때문|네\s*탓|너\s*왜|왜\s*그래|왜\s*그러)/g,
  order: /(해라|하라고|해야지|해야\s*해|하세요|당장|빨리|지금\s*바로|언제까지|답장해|대답해)/,
  cushion: /(미안|고마|괜찮|혹시|편할\s*때|가능하면|천천히|이해|걱정|궁금|부담|괜찮다면|해\s*줄래|할까)/,
  feeling: /(서운|속상|섭섭|불안|힘들|아쉬|슬프|화가|화났|기뻐|좋았)/g,
  me: /(나는|난\s|내가|내\s*마음|나도)/,
  concrete: /([0-9]+\s*(시|분|일|월|원|번|개)|오늘|내일|모레|이번\s*주|다음\s*주|주말|아침|저녁|오전|오후|[월화수목금토일]요일)/,
  request: /(해\s*줘|해\s*줄|부탁|알려\s*줘|알려\s*줄|보내\s*줘|답장|연락|가능|말해\s*줘|\?)/
};
const count = (text, pattern) => (text.match(pattern) || []).length;

// Returns {empty, trimmed, items: [{lens: 'T'|'F', id, ok, text, fix}], watch, summary}
function checkMessage(raw) {
  const text = String(raw || '').trim();
  if (!text) return {empty: true, trimmed: false, items: [], watch: 0, summary: '점검할 문장을 먼저 붙여넣어 주세요.'};
  const trimmed = text.length > CHECK_MAX;
  const body = text.slice(0, CHECK_MAX);
  const has = pattern => new RegExp(pattern.source).test(body);
  const items = [];
  const add = (lens, id, ok, good, watch, fix) => items.push({lens, id, ok, text: ok ? good : watch, fix: ok ? '' : fix});

  // Read by someone who weighs facts and clarity first (T-leaning).
  add('T', 'request', has(CHECK_SIGNS.request), '원하는 것이 문장에 드러나요.',
    '원하는 것(무엇을 해 주면 좋은지)이 보이지 않아요. 마음은 전해져도 무엇을 하라는 건지 모호하게 읽힐 수 있어요.',
    '예: “이번 주 안에 시간 될 때 알려줄 수 있어?”');
  add('T', 'concrete', has(CHECK_SIGNS.concrete), '시간·날짜·숫자처럼 확인할 수 있는 말이 있어요.',
    '언제·무엇을 같은 구체적인 말이 없어요. 판단하기 어려운 문장으로 읽힐 수 있어요.',
    '예: “금요일 저녁 전까지”처럼 시점을 하나 넣어 보세요.');
  add('T', 'absolute', !has(CHECK_SIGNS.absolute), '“항상·절대” 같은 단정하는 말이 보이지 않아요.',
    '“항상·절대·매번” 같은 말은 사실인지 따지게 만들 수 있어요.',
    '예: “이번 주에 두 번 그랬어”처럼 최근의 한 가지 일로 바꿔 보세요.');
  const feelingOnly = count(body, CHECK_SIGNS.feeling) >= 2 && !has(CHECK_SIGNS.request) && !has(CHECK_SIGNS.concrete);
  add('T', 'feelingOnly', !feelingOnly, '마음과 바라는 점이 함께 있어요.',
    '마음 표현은 많은데 바라는 점이 없어요. 어떻게 하면 되는지 모르겠다고 읽힐 수 있어요.',
    '예: 마음 한 줄 뒤에 “그래서 ~해 주면 좋겠어”를 덧붙여 보세요.');

  // Read by someone who notices tone and warmth first (F-leaning).
  add('F', 'cushion', has(CHECK_SIGNS.cushion), '부드럽게 말하는 표현이 있어요.',
    '“혹시·편할 때·고마워” 같은 부드러운 표현이 없어요. 차갑게 들릴 수 있어요.',
    '예: 앞에 “바쁜 중에 미안한데,” 한마디를 붙여 보세요.');
  const blames = count(body, CHECK_SIGNS.blame);
  add('F', 'blame', blames === 0, has(CHECK_SIGNS.me) ? '나를 주어로 말하고 있어요.' : '상대를 탓하는 말투가 보이지 않아요.',
    '“너는·네가”로 시작하는 말이 ' + blames + '번 있어요. 지적으로 들릴 수 있어요.',
    '예: “네가 늦었잖아” → “기다리는 동안 조금 걱정됐어”.');
  add('F', 'order', !has(CHECK_SIGNS.order), '재촉하거나 명령하는 말이 보이지 않아요.',
    '“빨리·당장·해야지” 같은 말은 재촉으로 읽힐 수 있어요.',
    '예: “가능할 때 알려줘”, “무리 없으면 부탁해”.');
  const tooShort = body.length < 20 && !has(CHECK_SIGNS.cushion), tooLong = body.length > 220;
  add('F', 'length', !tooShort && !tooLong, '길이가 읽기에 부담스럽지 않아요.',
    tooShort ? '아주 짧고 단정한 문장은 퉁명스럽게 읽힐 수 있어요.' : '길어서 부담스럽게 읽힐 수 있어요.',
    tooShort ? '예: 마음을 덧붙인 한 줄을 더해 보세요.' : '예: 핵심 두세 문장으로 줄여 보세요.');

  const watch = items.filter(item => !item.ok).length;
  const summary = watch === 0 ? '크게 걸리는 곳이 보이지 않아요. 보낼지 말지는 내가 정해요.'
    : watch <= 2 ? '조금만 고치면 더 잘 닿을 곳이 ' + watch + '군데 있어요.'
    : '걸릴 수 있는 곳이 ' + watch + '군데예요. 가장 먼저 한 곳부터 고쳐 보세요.';
  return {empty: false, trimmed, items, watch, summary};
}

const CHECK_NOTE = '이 점검은 문장의 모양만 보는 규칙 계산이에요. 상대가 실제로 어떻게 느낄지는 알려 주지 않아요. 붙여넣은 문장은 이 기기를 떠나지 않아요.';
