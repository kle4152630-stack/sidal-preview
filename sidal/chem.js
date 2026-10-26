'use strict';
// 2인 케미 (a conversation manual for two MBTI types). Only the two types the people chose are used; nothing about either person's feelings is claimed.
// The facts and the conversation rules are always free. Only the ready-to-copy message examples sit behind a ticket, and only when payments are switched on.

const CHEM_AXES = [['에너지', 'E', 'I'], ['정보를 보는 방식', 'S', 'N'], ['판단', 'T', 'F'], ['생활 방식', 'J', 'P']];
const CHEM_UNSURE = [
  'MBTI는 스스로 고른 값이라 실제 성격이나 상대의 마음을 알려 주지 않아요.',
  '같은 유형끼리도, 다른 유형끼리도 잘 지내는 사람이 있어요. 이 화면은 궁합의 좋고 나쁨을 정하지 않아요.',
  '상대가 실제로 어떤 사람인지, 어떻게 느끼는지는 대화로만 알 수 있어요.'
];
// How to talk with someone of this letter (two variants each, picked by the day).
const CHEM_RULES = {
  E: ['상대가 E형이면 생각을 말로 꺼내며 정리할 수 있어요. 바로 결론을 물으면 서두르는 느낌이 들 수 있으니 이야기가 잠깐 흘러가게 두세요.',
    '상대가 E형이면 반응이 빨라도 아직 결정이 아닐 수 있어요. 마지막에 “그럼 이렇게 정리해도 될까?”로 확인해 보세요.'],
  I: ['상대가 I형이면 생각할 시간이 필요할 수 있어요. 질문은 짧게 하고 답을 기다리는 시간을 주세요.',
    '상대가 I형이면 여럿보다 일대일 대화가 편할 수 있어요. 중요한 이야기는 조용한 자리에서 꺼내 보세요.'],
  S: ['상대가 S형이면 구체적인 예와 사실이 잘 전달될 수 있어요. “언제, 무엇을”처럼 짚어서 말해 보세요.',
    '상대가 S형이면 큰 그림보다 오늘 할 수 있는 일부터 이야기하는 편이 편할 수 있어요.'],
  N: ['상대가 N형이면 의미와 방향을 먼저 이야기하면 잘 닿을 수 있어요. 세부 사항은 그다음에 맞춰 보세요.',
    '상대가 N형이면 말이 앞서 나가는 것처럼 느껴질 수 있어요. 지금 정해진 것과 아이디어를 나눠서 물어보세요.'],
  T: ['상대가 T형이면 감정 설명보다 상황과 이유를 먼저 짧게 말하는 쪽이 전달될 수 있어요.',
    '상대가 T형이면 차갑게 들리는 말이 있어도 해결에 집중한 표현일 수 있어요. 서운하면 “그 부분이 서운했어”라고 사실처럼 말해 보세요.'],
  F: ['상대가 F형이면 내용 못지않게 말투와 마음이 전해질 수 있어요. 요청 앞에 고마움이나 걱정을 한 줄 붙여 보세요.',
    '상대가 F형이면 지적이 사람 자체에 대한 말로 들릴 수 있어요. 일과 사람을 나눠서 말해 보세요.'],
  J: ['상대가 J형이면 미리 정해진 일정이 마음을 편하게 할 수 있어요. 약속은 가능하면 일찍 알려 주세요.',
    '상대가 J형이면 갑작스러운 변경이 부담일 수 있어요. 바뀌는 경우 이유와 대안을 같이 전해 보세요.'],
  P: ['상대가 P형이면 여지를 남겨 둔 제안이 편할 수 있어요. “이날 아니어도 괜찮아”를 덧붙여 보세요.',
    '상대가 P형이면 결정을 늦추는 것이 무관심은 아닐 수 있어요. 마감이 필요하면 날짜를 분명히 말해 주세요.']
};
const CHEM_MISSION = {
  T: '상대에게 전할 말을 사실 한 줄과 바라는 점 한 줄로 적어 보기', F: '상대에게 전할 말 앞에 내 감정 한 단어를 먼저 붙여 적어 보기',
  E: '부담 없는 짧은 안부를 먼저 보내 보기', I: '답을 재촉하지 않고 하루 기다려 보기',
  S: '전하려는 일을 날짜와 장소로 구체화해 적어 보기', N: '전하려는 일의 목적을 한 줄로 적어 보기',
  J: '대화 전에 말하고 싶은 것 세 가지를 순서대로 적어 보기', P: '이번 대화에서 정하지 않아도 되는 것 하나를 미리 정해 두기'
};
// Copy-ready messages by the PARTNER's T/F (four situations) and J/P (one). They state the sender's own facts and wishes, never the other person's feelings.
const CHEM_MESSAGES = {
  T: [['약속 잡기', '이번 주에 약속 날짜를 정하고 싶어. 가능한 날을 두 개 알려주면 내가 거기에 맞춰 장소를 정할게.'],
    ['서운함 전하기', '어제 약속이 취소돼서 일정이 꼬였어. 다음에는 하루 전에 알려주면 내가 조정하기 쉬울 것 같아.'],
    ['사과하기', '내가 그때 말을 급하게 해서 오해가 생긴 것 같아. 어떤 부분이 불편했는지 알려주면 고쳐 볼게.'],
    ['부탁하기', '이 일 마감이 금요일이야. 네가 맡을 수 있는 범위를 알려주면 나머지는 내가 정리할게.']],
  F: [['약속 잡기', '이번 주에 얼굴 보고 싶은데, 네가 편한 날이 언제일까? 무리되면 다음 주도 괜찮아.'],
    ['서운함 전하기', '어제 약속이 취소돼서 조금 서운했어. 네 사정도 듣고 싶어. 편할 때 얘기해 줄래?'],
    ['사과하기', '그때 내 말이 너한테 상처가 됐다면 미안해. 네 마음이 어땠는지 천천히 들려줘.'],
    ['부탁하기', '이거 도와줄 수 있으면 정말 고마울 것 같아. 어려우면 편하게 말해 줘, 괜찮아.']]
};
const CHEM_PLAN_MESSAGE = {
  J: ['일정 맞추기', '다음 주 일정을 미리 맞춰 두면 마음이 편할 것 같아. 이번 주 안에 날짜를 한번 정해 볼까?'],
  P: ['일정 맞추기', '다음 주에 시간 되는 날 있으면 그날 가볍게 보자. 정해지면 그때 알려줘도 돼.']
};
const CHEM_LOCKED_FILLER = '상대 유형에 맞춘 카톡 문장 5개가 이곳에 나와요. 티켓 1장으로 열면 바로 복사할 수 있어요.';
const CHEM_UNLOCK_KEY = 'sidal_chem_unlocked';

function chemValid(me, partner) { return validMbti(me) && validMbti(partner); }
function chemKey(me, partner, card) { return 'chem:' + me + '-' + partner + ':' + card.id; }

function chemReading(me, partner, deck, today = new Date(), salt = 0) {
  if (!chemValid(me, partner)) return null;
  const seed = me + '|' + partner + '|' + ymdOf(today) + '|' + salt;
  const card = fortuneCard(deck, 'C|' + seed);
  const mine = me.split(''), theirs = partner.split('');
  const same = CHEM_AXES.filter((axis, i) => mine[i] === theirs[i]).length;
  const facts = CHEM_AXES.map((axis, i) => axis[0] + ': ' + (mine[i] === theirs[i] ? '둘 다 ' + mine[i] + '예요.' : '나는 ' + mine[i] + ', 상대는 ' + theirs[i] + '로 달라요.'));
  facts.push('고른 값 기준으로 네 가지 중 ' + same + '가지가 같아요.');
  const keyword = card.keywords[0];
  const missionLetter = theirs[fnv('K|' + seed) % 4];
  const tf = partner.includes('T') ? 'T' : 'F', jp = partner.includes('J') ? 'J' : 'P';
  return {me, partner, card, same, facts, unsure: CHEM_UNSURE,
    why: '카드 ‘' + card.name + '’의 키워드 ‘' + keyword + '’와, 상대의 ' + missionLetter + '(' + MBTI_STYLE[missionLetter] + ') 성향을 이어서 이 3분 미션을 골랐어요.',
    cardLine: card.name + '(' + card.keywords.slice(0, 3).join('·') + '): ' + card.meaning,
    rules: theirs.map(letter => fortunePick(CHEM_RULES[letter], 'R|' + letter + '|' + seed)),
    lessOf: fortuneFrame(LESS_FRAMES, MBTI_LESS[mine[fnv('S|' + seed) % 4]], 'LF|' + seed),
    mission: fortuneFrame(MISSION_FRAMES.map(frame => a => frame(a, keyword, card.question)), CHEM_MISSION[missionLetter], 'MF|' + seed),
    messages: [...CHEM_MESSAGES[tf], CHEM_PLAN_MESSAGE[jp]].map(([label, text]) => ({label, text})),
    messageNote: '상대가 ' + tf + '형이고 ' + jp + '형이라는 선택에 맞춘 예시예요. 내 말투에 맞게 고쳐 써도 좋아요.',
    key: chemKey(me, partner, card)};
}

// What the screen may show. While locked the real messages are not part of the result at all (blurring is not protection).
function chemView(reading, locked) {
  return {...reading, messages: locked ? [] : reading.messages, messageFiller: locked ? CHEM_LOCKED_FILLER : ''};
}

function chemUnlockedList() { const saved = readStore(CHEM_UNLOCK_KEY); return Array.isArray(saved) ? saved.filter(item => typeof item === 'string').slice(-300) : []; }
function chemIsUnlocked(key) { return chemUnlockedList().includes(key); }
function chemPaywallOn() { return typeof paymentsEnabled === 'function' && paymentsEnabled(); }
function chemLocked(reading) { return chemPaywallOn() && !chemIsUnlocked(reading.key); }
// One ticket opens one pairing's messages; the ticket is spent only after the unlock was written down.
function chemOpenWithTicket(reading) {
  if (!reading || chemIsUnlocked(reading.key)) return true;
  if (ticketBalance() < 1) return false;
  writeStore(CHEM_UNLOCK_KEY, [...chemUnlockedList(), reading.key].slice(-300));
  return spendTicket(1);
}

function chemShareLink(me) { return siteBase() + '/?chem=' + encodeURIComponent(me); }
function chemSharePayload(me) {
  return {title: me + '인 나와의 케미가 궁금하다면?', text: '내 MBTI를 고르면 우리 둘의 대화 사용설명서가 나와요. 서로의 마음은 단정하지 않고, 말 걸기 쉬운 방법만 알려 줘요.',
    link: chemShareLink(me), imageUrl: siteBase() + '/og-image.png'};
}
