// 사이달 AI 상담 엔진 (초안). 서버·키·네트워크 없이 브라우저/Node 안에서만 동작한다.
// 입력: 상황, 고민, 목표, 카드 번호(1~78). 출력: 상담 결과 섹션들과 평문, 품질 점검, AI에 더 맡길 프롬프트.
// 이것은 대규모 언어 모델이 아니다. 사이달의 210개 상황·78장 카드 데이터와 규칙으로 조립하는 "초안 생성기"이고,
// 더 풍부한 문장이 필요하면 buildPrompt()가 만든 프롬프트를 Claude·GPT 등에 붙여 넣는다.
(function (root) {
  'use strict';

  var LIMITS = {situation: 400, worry: 100, goal: 100, min: 6};
  // 상황 매칭 기준(2026-10-26 보정): 흔한 글자 조합(6개 이상 상황에 등장)은 버리고, 남은 조합의 가중 일치 질량 3 이상·비율 0.3 이상·일치 2개 이상일 때만 같은 상황으로 본다.
  var STOP_DF = 6, MIN_MASS = 3, MIN_RATIO = 0.3, MIN_HITS = 2;

  // 위기 신호(건강·안전): 카드 해석 대신 전문가 연결을 권한다. 신고·수사기관 안내는 넣지 않는다(AGENTS.md).
  var CRISIS = /(자살|죽고\s*싶|죽어\s*버리|자해|살기\s*싫|사라지고\s*싶|목숨을\s*끊|극단적인\s*선택)/;
  var PREDICT = /(될까|올까|할까요|언제|얼마나\s*(걸|갈)|성공할|붙을까|돌아올까|합격할)/;
  var MIND = /(속마음|진심|나를\s*(좋아|사랑)|마음이\s*(있|뭐)|생각하는지|어떻게\s*생각)/;
  var SENSITIVE = /(대출|투자|보증|빚|주식|코인|계약|소송|법적|병원|약(?!속)|우울|불면|증상|진단|폭식|공황|무기력|입맛|식욕|잠을\s*(잘\s*)?못|잠이\s*안|가슴이\s*두근)/;

  // self-check와 tests가 같이 쓰는 금지 표현(.claude/skills/sidal-situation-content/toolbox/verify-situation.cjs V4와 같은 기준 + 예측 단정)
  var FORBIDDEN = [
    [/(반드시|분명히|틀림없이)\s*(돌아|재회|연락|성공|올라)/, '미래·결과 보장 표현'],
    [/(보장|확정)(해|합|돼|됩)/, '보장 표현'],
    [/(속마음|진심은|사실은 (너를|당신을)).*(이에요|입니다|이야)/, '타인의 속마음 단정'],
    [/(경찰|신고|112|수사기관|스토킹)/, '안전·신고 안내 문구(서비스 범위 밖, 사용자 지시)'],
    [/(될 거예요|올 거예요|돌아올 거|성공할 거|좋아질 거예요|헤어질 거|만나게 될)/, '예측 단정']
  ];

  var CATEGORY_KEYWORDS = [
    /(이별|헤어|재회|전\s*(연인|남친|여친)|차단|미련)/,
    /(썸|소개팅|애프터|호감|연락|데이트|사귄|사귀|연애|애인|남자친구|여자친구|남친|여친|답장|읽씹|약속)/,
    /(결혼|동거|배우자|육아|시댁|처가|명절|부부|오래\s*만난)/,
    /(짝사랑|고백|좋아하는\s*사람|좋아해)/,
    /(취업|이직|면접|퇴사|진로|합격|이력서|포트폴리오|연봉|수습)/,
    /(돈|대출|투자|빚|월급|지출|저축|예산|환불|보증|주식|코인)/,
    /(직장|동료|친구|상사|팀|회식|지인|모임|단톡)/
  ];

  var CAT = [
    {
      traps: ['상대의 침묵을 "아직 마음이 있다"는 신호로 읽는 것', '새벽에 감정이 올라온 채로 긴 메시지를 보내는 것', '재회와 사과와 해명을 한 번의 메시지에 다 담으려는 것'],
      rules: [['상대가 짧게라도 답하면', '한 번만 더 담백하게 이어가고, 답이 없으면 거기서 멈춰요.'], ['연락을 원하지 않는다는 뜻이 보이면', '더 보내지 않고, 혼자 정리할 방법(글쓰기·산책)으로 옮겨요.']],
      sentence: '보내기 전에 메모에 먼저 적어요: 지금 내가 원하는 것 한 줄, 상대가 거절해도 괜찮은 것 한 줄.',
      ask: '이 연락으로 내가 얻고 싶은 것은 상대의 답인가요, 내 마음의 정리인가요?'
    },
    {
      traps: ['답장 속도만으로 마음의 크기를 가늠하는 것', '확답을 듣기 전에 기대부터 키우는 것', '상대에게 맞추다 내 기준을 잊는 것'],
      rules: [['제안에 구체적인 날짜로 답하면', '약속을 잡고 부담 없는 자리부터 시작해요.'], ['일정 이야기를 계속 흐리면', '내가 원하는 관계의 방향을 한 문장으로 말하고 반응을 확인해요.']],
      sentence: '이번 주에 시간 되면 잠깐 볼래? 어렵다면 편한 때를 알려줘.',
      ask: '이 사람과의 관계에서 내가 포기하고 싶지 않은 기준은 무엇인가요?'
    },
    {
      traps: ['서운함을 쌓아 두었다가 한 번에 터뜨리는 것', '돈·가족 문제를 분위기 좋은 때로만 미루는 것', '"당연히 알겠지" 하고 말하지 않는 것'],
      rules: [['상대가 대화에 응하면', '한 번에 한 주제만, 20분 안에 끝낼 시간을 정하고 시작해요.'], ['피곤하다며 미루면', '다시 이야기할 날짜를 같이 정하고 그날까지 각자 생각을 적어 와요.']],
      sentence: '오늘 20분만 이야기할 수 있을까? 해결보다 먼저 내 이야기를 들어줬으면 해.',
      ask: '이 문제에서 두 사람이 이미 합의한 것과 아직 합의하지 못한 것은 각각 무엇인가요?'
    },
    {
      traps: ['작은 친절을 큰 신호로 해석하는 것', '고백 전에 나를 과하게 바꾸는 것', '답을 재촉하는 것'],
      rules: [['가볍게 만날 기회가 생기면', '부담 없는 제안을 한 번만 하고 반응을 봐요.'], ['거절하거나 선을 그으면', '그 뜻을 받아들이고 접근을 멈춰요.']],
      sentence: '이번 주에 가볍게 차 한잔 할래요? 부담되면 다음에 해도 괜찮아요.',
      ask: '답이 어떻게 오든 내가 지키고 싶은 태도는 무엇인가요?'
    },
    {
      traps: ['조건 하나(연봉·회사 이름)만 보고 결정하는 것', '불안해서 확인 없이 구두 약속을 믿는 것', '준비를 완벽하게 끝낸 뒤에야 움직이려는 것'],
      rules: [['조건이 서면으로 확인되면', '연봉·업무·성장 기회를 비교표로 적고 결정해요.'], ['서면 확인이 안 되면', '확인되기 전에는 퇴사나 확답을 보류해요.']],
      sentence: '조건을 서면으로 정리해 주실 수 있을까요? 확인한 뒤 답변드리겠습니다.',
      ask: '이 선택이 1년 뒤 내 일의 모습을 어떻게 바꾸나요?'
    },
    {
      traps: ['"다들 한다"는 말에 확인을 건너뛰는 것', '감정이 큰 날 큰 결정을 하는 것', '한 번의 지출만 보고 전체 상황을 놓치는 것'],
      rules: [['금액과 조건을 서면으로 확인할 수 있으면', '그 기준으로 비교하고 천천히 결정해요.'], ['재촉하거나 서면을 꺼리면', '결정을 멈추고 공적 금융·법률 상담에 먼저 확인해요.']],
      sentence: '결정 전에 금액·기간·조건을 서면으로 확인하고 싶습니다.',
      ask: '이 결정이 잘못돼도 감당할 수 있는 금액과 기간은 얼마인가요?'
    },
    {
      traps: ['감정이 올라온 상태에서 메시지를 보내는 것', '상대의 의도를 단정하고 대응하는 것', '내 경계를 말하지 않고 참기만 하는 것'],
      rules: [['요청을 들어주면', '합의한 내용을 짧은 문장으로 남겨요.'], ['같은 일이 반복되면', '날짜와 상황을 메모하고 제3자(상사·공통 지인)와 먼저 상의해요.']],
      sentence: '내가 이해한 내용은 이거야. 맞는지 확인하고 싶어. 앞으로는 이렇게 하면 어떨까?',
      ask: '이 관계에서 내가 지키고 싶은 경계 하나는 무엇인가요?'
    }
  ];
  CAT.push({
    traps: ['확인되지 않은 부분을 가장 나쁜 쪽으로 채우는 것', '감정이 큰 날 중요한 결정을 내리는 것', '한 번에 모든 것을 해결하려는 것'],
    rules: [['필요한 사실이 확인되면', '그 사실을 기준으로 선택지를 두세 개로 줄여요.'], ['확인이 계속 안 되면', '기한(예: 7일)을 정하고 그날까지는 결정을 미뤄요.']],
    sentence: '지금 상황에서 내가 이해한 건 이거야. 틀린 부분이 있으면 알려줘.',
    ask: '이 일에서 내가 정할 수 있는 것과 정할 수 없는 것은 각각 무엇인가요?'
  });
  var CAT_FALLBACK = CAT[7];

  // 한 줄 요약(카테고리별 2가지). {W}=고민, {G}=목표. 카드 키워드가 아니라 상황의 성격으로 만든다.
  var HEADLINES = [
    ['{W}는 상대의 답보다 내가 이 연락으로 얻고 싶은 것이 먼저인 문제예요.', '{G}이 목표라면, 오늘 할 일은 보내는 일이 아니라 정리하는 일이에요.'],
    ['{W}는 상대의 마음을 맞히는 문제가 아니라, 내가 원하는 관계의 기준을 확인하는 문제예요.', '{G}이 목표라면, 오늘 할 일은 상대의 반응을 읽는 일이 아니라 내가 원하는 것을 말로 정하는 일이에요.'],
    ['{W}는 누가 맞는지가 아니라, 두 사람이 어떤 방식으로 정할지의 문제예요.', '{G}이 목표라면, 오늘 할 일은 누가 맞는지 가리는 일이 아니라 이야기할 주제를 하나 정하는 일이에요.'],
    ['{W} 앞에서 필요한 건 확신이 아니라 내가 감당할 수 있는 한 걸음의 크기예요.', '{G}이 목표라면, 오늘 할 일은 상대의 신호를 해석하는 일이 아니라 내가 전할 말을 정하는 일이에요.'],
    ['{W}는 정답 찾기보다 내가 중요하게 여기는 기준을 순서대로 놓는 일이에요.', '{G}이 목표라면, 오늘 할 일은 결정을 서두르는 일이 아니라 확인할 조건을 적는 일이에요.'],
    ['{W}는 느낌이 아니라 숫자와 조건으로 확인할 문제예요.', '{G}이 목표라면, 오늘 할 일은 결정하는 일이 아니라 확인할 항목을 적는 일이에요.'],
    ['{W}는 상대의 의도를 맞히는 일이 아니라 내 경계를 말로 정하는 일이에요.', '{G}이 목표라면, 오늘 할 일은 상대의 의도를 맞히는 일이 아니라 내 요청을 정하는 일이에요.'],
    ['{W} 앞에서는 답을 서두르기보다 확인할 수 있는 것과 없는 것을 나누는 일이 먼저예요.', '{G}이 목표라면, 오늘 할 일은 답을 서두르는 일이 아니라 가장 작은 행동 하나를 고르는 일이에요.']
  ];
  var GUESS = /(같아요|같다|것\s*같|듯해|듯하|아마|싫어하|질린|질렸|식은|식었|변한|좋아하지\s*않|속으로|분명)/;

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function clip(text, n) {
    var s = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }
  function grams(text) {
    var t = String(text).toLowerCase().replace(/[^0-9a-z가-힣]/g, '');
    var out = {};
    for (var i = 0; i < t.length - 1; i++) out[t.slice(i, i + 2)] = 1;
    return out;
  }
  function lastHangul(word) {
    var m = String(word).match(/[가-힣](?=[^가-힣]*$)/);
    return m ? m[0].charCodeAt(0) - 0xAC00 : -1;
  }
  // 받침에 따라 조사를 고른다: pp('학교','은/는') -> '는'
  function pp(word, pair) {
    var parts = pair.split('/');
    var code = lastHangul(word);
    if (code < 0) return parts[1];
    var batchim = code % 28;
    if (pair === '으로/로') return batchim !== 0 && batchim !== 8 ? parts[0] : parts[1];
    return batchim !== 0 ? parts[0] : parts[1];
  }
  function quote(text) { return '‘' + text + '’'; }
  function sentences(text) {
    return String(text).split(/(?<=[.!?。])\s+|[\r\n]+/).map(function (t) { return clip(t, 90); }).filter(function (t) { return t.length >= 4; });
  }
  function firstSentence(text) {
    var m = String(text).match(/^.*?[.!?](\s|$)/);
    return (m ? m[0].trim() : String(text)).replace(/^오늘은\s*/, '');
  }

  // 운영자가 사용자에게 붙여 받은 마무리 안내(프롬프트 원문). config.closing으로 바꾸거나 ''로 끈다.
  var DEFAULT_CLOSING = '※ 더 깊은 대화나 1:1 심층 전문가 상담을 원하시면 프로필 링크를 확인해 주세요.';

  // 이번 주 해볼 한 걸음(구체 행동 1가지): 상황 범주별 기본 행동. 가까운 기존 상황이 있으면 그 상황의 행동을 우선한다.
  var STEPS = [
    '오늘은 보내려는 말을 메모에 적고, 3일 뒤에도 보내고 싶은지 다시 읽어 봐요.',
    '이번 주 안에 날짜와 장소가 있는 제안을 한 번만 하고, 답을 기다릴 기한을 내 마음속에 정해 둬요.',
    '이야기할 주제를 하나만 고르고, 20분만 이야기하자며 날짜를 정해 제안해요.',
    '상대에게 전할 한 문장을 적어 두고, 전하는 날짜를 이번 주 안으로 정해요.',
    '확인하고 싶은 조건 세 가지를 적어 서면으로 요청해요.',
    '오늘은 결정하지 않고, 금액·기간·조건을 적은 확인 목록을 만들어요.',
    '있었던 일을 날짜와 행동 위주로 세 줄 메모하고, 요청할 한 가지를 정해요.',
    '지금 확인되는 사실 세 가지를 적고, 그중 내가 바로 할 수 있는 일 하나만 골라 해요.'
  ];

  function defaultLens() {
    if (typeof module !== 'undefined' && module.exports && typeof require === 'function') return require('./card-lens.js');
    return root.SidalCardLens || null;
  }

  function create(data, config) {
    var lensData = config && config.lens ? config.lens : defaultLens();
    var lens = lensData && lensData.lens, qmap = lensData && lensData.questions;
    var closing = config && Object.prototype.hasOwnProperty.call(config, 'closing') ? String(config.closing || '') : DEFAULT_CLOSING;
    var categories = data.CATEGORIES;
    var deck = data.TAROT_DECK;
    var readings = data.SITUATION_READINGS;
    var entries = [];
    categories.forEach(function (category, ci) {
      category.items.forEach(function (item) {
        entries.push({item: item, category: category, ci: ci, t: grams(item.title), b: grams(item.fact + ' ' + item.uncertain + ' ' + item.action)});
      });
    });

    var df = {};
    entries.forEach(function (e) {
      var seen = {};
      Object.keys(e.t).concat(Object.keys(e.b)).forEach(function (k) { if (!seen[k]) { seen[k] = 1; df[k] = (df[k] || 0) + 1; } });
    });
    function idf(k) { return Math.log(entries.length / (1 + df[k])); }
    function match(text) {
      var q = grams(text);
      return entries.map(function (e) {
        var hit = 0, total = 0, n = 0;
        for (var k in q) {
          if (!df[k] || df[k] >= STOP_DF) continue;
          var w = idf(k); total += w;
          if (e.t[k]) { hit += w; n++; } else if (e.b[k]) { hit += 0.4 * w; n++; }
        }
        return {entry: e, mass: hit, score: total ? hit / total : 0, hits: n};
      }).sort(function (a, b) { return b.mass - a.mass; }).slice(0, 3);
    }
    function categoryIndex(text, matched) {
      if (matched) return matched.ci;
      var best = -1, bestCount = 0;
      CATEGORY_KEYWORDS.forEach(function (re, i) {
        var count = (text.match(new RegExp(re.source, 'g')) || []).length;
        if (count > bestCount) { best = i; bestCount = count; }
      });
      return best;
    }

    function sanitize(input) {
      input = input || {};
      var n = parseInt(input.cardNumber, 10);
      return {
        situation: clip(input.situation, LIMITS.situation),
        worry: clip(input.worry, LIMITS.worry),
        goal: clip(input.goal, LIMITS.goal),
        cardNumber: n >= 1 && n <= deck.length ? n : 0
      };
    }
    function validate(inp) {
      var errors = [];
      if (inp.situation.length < LIMITS.min) errors.push({field: 'situation', message: '상황을 ' + LIMITS.min + '글자 이상 적어 주세요.'});
      if (inp.worry.length < 2) errors.push({field: 'worry', message: '고민을 한 줄로 적어 주세요.'});
      if (inp.goal.length < 2) errors.push({field: 'goal', message: '목표를 한 줄로 적어 주세요.'});
      return errors;
    }

    function crisisResult(inp) {
      var sections = [
        {key: 'care', title: '먼저 전하고 싶은 말', lines: [
          '지금 마음이 많이 힘들다는 말이 전해졌어요. 적어 주셔서 고마워요.',
          '이 상담은 카드의 상징으로 생각을 정리하는 도구라서, 지금 이 마음을 다루기에는 충분하지 않아요.',
          '혼자 견디지 말고, 자살예방 상담전화 109(24시간)나 가까운 사람, 정신건강 전문가에게 지금 바로 이야기해 주세요.',
          '당장 안전이 걱정된다면 혼자 있지 말고 곁에 있어 줄 사람에게 연락해 주세요.'
        ]},
        {key: 'disclaimer', title: '안내', lines: ['본 서비스는 전문 상담, 의학, 법률 조언을 대체하지 않습니다.']}
      ];
      return {ok: true, mode: 'crisis', input: inp, matched: null, card: null, sections: sections, text: toText(sections)};
    }

    function toText(sections) {
      return sections.map(function (s) { return (s.title ? '【' + s.title + '】\n' : '') + s.lines.join('\n'); }).join('\n\n');
    }

    function consult(input) {
      var inp = sanitize(input);
      var errors = validate(inp);
      if (errors.length) return {ok: false, errors: errors};
      var all = inp.situation + ' ' + inp.worry + ' ' + inp.goal;
      if (CRISIS.test(all)) return crisisResult(inp);

      var seed = hash(inp.situation + '|' + inp.worry + '|' + inp.goal + '|' + inp.cardNumber);
      var card = deck[(inp.cardNumber ? inp.cardNumber - 1 : seed % deck.length)];
      var top = match(inp.situation + ' ' + inp.worry);
      var confident = top.length > 0 && top[0].mass >= MIN_MASS && top[0].score >= MIN_RATIO && top[0].hits >= MIN_HITS;
      var found = confident ? top[0].entry : null;
      var reading = found ? readings[found.item.id] : null;
      var ci = categoryIndex(all, found);
      var cat = ci >= 0 ? CAT[ci] : CAT_FALLBACK;
      var cardQuestion = (qmap && qmap[card.id]) || card.question;
      var kw = card.keywords[0];
      var wantsPrediction = PREDICT.test(inp.worry + ' ' + inp.goal);
      var wantsMind = MIND.test(inp.worry + ' ' + inp.situation);
      var sensitive = SENSITIVE.test(all) || ci === 5;
      var g = quote(inp.goal);

      var wShort = clip(inp.worry, 28), gShort = clip(inp.goal, 28);
      var w = quote(wShort);
      var headline = reading ? reading.lead : HEADLINES[ci >= 0 ? ci : 7][seed % 2]
        .replace('{W}는', w + pp(wShort, '은/는'))
        .replace('{W}', w)
        .replace('{G}이', quote(gShort) + pp(gShort, '이/가'))
        .replace('{G}', quote(gShort));

      var own = sentences(inp.situation);
      var ownFacts = own.filter(function (t) { return !GUESS.test(t); }).slice(0, 3);
      var ownGuesses = own.filter(function (t) { return GUESS.test(t); }).slice(0, 2);
      var unknown = [found ? found.item.uncertain : '이 글만으로는 상대의 마음이나 앞으로의 결과를 알 수 없어요.'];
      ownGuesses.forEach(function (t) { unknown.push('“' + t + '”는 지금 확인된 사실이 아니라 추측이에요.'); });
      if (wantsPrediction) unknown.push('시기나 결과를 예측해 달라는 질문이 있었는데, 이 상담은 예측하지 않아요. 대신 직접 확인할 수 있는 조건과 행동으로 바꿔 적었어요.');
      if (wantsMind) unknown.push('상대가 어떤 마음인지는 카드로 알 수 없어요. 직접 확인할 수 있는 질문을 아래 문장에 담았어요.');

      // 제목을 되풀이하는 일반형 fact("선택한 고민: …")는 사실 문장으로 쓰지 않는다.
      var factText = found && !/^선택한 고민/.test(found.item.fact) ? found.item.fact : null;
      var facts = found ? [
        '입력하신 내용과 가장 가까운 상황은 ' + quote(found.item.title) + '이에요.',
        factText || '적어 주신 고민은 ' + quote(clip(inp.worry, 40)) + '예요.',
        '목표는 ' + g + '이에요.'
      ] : (ownFacts.length ? ownFacts.map(function (t) { return '적어 주신 사실: “' + t + '”'; }) : []).concat([
        '고민은 ' + quote(clip(inp.worry, 40)) + ', 목표는 ' + g + '라고 적어 주셨어요.'
      ]);

      var todayStep = found ? firstSentence(found.item.action) : '지금 확인되는 사실 세 가지를 종이에 적어요.';
      var plan = [
        '오늘(10분): ' + todayStep + ' 이어서 ' + g + ' 중 내가 정할 수 있는 것과 정할 수 없는 것을 두 칸으로 나눠 적어요.',
        '3일 안: ' + cat.rules[0][0] + ', ' + cat.rules[0][1],
        '3일 안: ' + cat.rules[1][0] + ', ' + cat.rules[1][1],
        '7일째: 카드가 던진 질문에 한 줄로 답해요 — “' + cardQuestion + '” 그리고 ' + g + '에 한 걸음 가까워졌는지 ‘예 / 아니오 / 모르겠다’ 중 하나로 적어요.'
      ];

      var sentence = found ? found.item.template : cat.sentence;
      if (wantsMind) sentence += '\n직접 확인하는 말: “요즘 우리 이야기에서 내가 놓친 게 있다면 편하게 말해 줄래?”';

      var questions = [
        cardQuestion,
        reading ? reading.reflection : cat.ask,
        g + pp(inp.goal, '이/가') + ' 이뤄진 일주일 뒤, 지금과 달라진 한 가지는 무엇일까요?'
      ];

      var worryShort = clip(inp.worry, 36);
      var guessLine = ownGuesses.length ? ownGuesses.map(function (t) { return '“' + t + '” → 아직 확인되지 않은 추측이에요.'; }) : [];
      var factLine = found
        ? ['가장 가까운 상황은 ' + quote(found.item.title) + '이에요.'].concat(factText ? [factText] : ownFacts.map(function (t) { return '적어 주신 사실: “' + t + '”'; }))
        : (ownFacts.length ? ownFacts.map(function (t) { return '적어 주신 사실: “' + t + '”'; }) : ['고민은 ' + quote(worryShort) + '라고 적어 주셨어요.']);
      var oneStep = found ? firstSentence(found.item.action) : STEPS[ci >= 0 ? ci : 7];
      var how = found ? found.item.template : cat.sentence;
      var howLines = how.split('\n');

      var sections = [
        {key: 'summary', title: '핵심 한 줄 요약', main: true, lines: [headline]},
        {key: 'card', title: '카드가 말하는 것', main: true, lines: [
          card.name + ' · ' + card.en + ' — ' + card.keywords.join(' · ')
        ].concat(lens && lens[card.id]
          ? [quote(worryShort) + '에 이 카드를 대면: ' + lens[card.id]]
          : [card.symbolism, quote(worryShort) + '에 이 카드를 대면: ' + card.meaning],
        ['카드가 묻는 것: ' + cardQuestion])},
        {key: 'mirror', title: '내 고민에 비춰 보면', main: true, lines: factLine.concat(guessLine, [
          '조심할 함정 하나: ' + cat.traps[seed % cat.traps.length],
          '목표 ' + g + '까지는, 상대의 반응보다 내가 정할 수 있는 부분을 먼저 나누는 것이 출발점이에요.'
        ])},
        {key: 'step', title: '이번 주 해볼 한 걸음', main: true, lines: [
          oneStep,
          '이렇게 해봐요: ' + howLines[0]
        ].concat(howLines.slice(1), ['7일 뒤에 이 한 걸음을 했는지 ‘예 / 아니오’ 중 하나로 적어 봐요.'])},
        {key: 'yours', title: '내가 쓴 말', lines: ['상황: “' + clip(inp.situation, 120) + '”', '고민: “' + inp.worry + '”', '목표: “' + inp.goal + '”']},
        {key: 'fact', title: '지금 확인되는 것', lines: facts},
        {key: 'unknown', title: '아직 단정할 수 없는 것', lines: unknown},
        {key: 'trap', title: '이 상황에서 흔한 함정 하나', lines: [cat.traps[seed % cat.traps.length]]},
        {key: 'plan', title: '목표까지 7일 계획', lines: plan},
        {key: 'sentence', title: '그대로 쓸 수 있는 문장', lines: sentence.split('\n')},
        {key: 'questions', title: '스스로에게 묻기', lines: questions}
      ];
      if (sensitive) {
        sections.push({key: 'expert', title: '전문가에게 확인할 부분', lines: [
          '이 부분은 카드로 정할 문제가 아니에요.',
          '금전·계약·법률은 공적 금융·법률 상담 창구나 전문가에게, 몸과 마음의 증상은 의료·상담 전문가에게 먼저 확인하세요.'
        ]});
      }
      sections.push({key: 'disclaimer', title: '안내', lines: [
        '이 결과는 프로그램이 입력하신 글과 카드의 상징을 바탕으로 만든 초안이에요. 미래나 다른 사람의 마음을 예측하지 않아요.',
        '본 서비스는 전문 상담, 의학, 법률 조언을 대체하지 않습니다.'
      ]});
      if (closing) sections.push({key: 'closing', title: '', lines: [closing]});

      return {
        ok: true, mode: 'reading', input: inp,
        matched: found ? {id: found.item.id, title: found.item.title, score: Math.round(top[0].score * 100) / 100, category: found.category.name} : null,
        candidates: top.map(function (t) { return {id: t.entry.item.id, title: t.entry.item.title, score: Math.round(t.score * 100) / 100}; }),
        lead: own.length ? '적어 주신 내용에서 사실로 읽히는 것은 ' + ownFacts.length + '개, 아직 추측인 것은 ' + ownGuesses.length + '개예요.' : '',
        card: card, categoryIndex: ci, sections: sections, text: toText(sections)
      };
    }

    // 결과를 품질 기준으로 스스로 점검한다. 모든 항목은 통과/실패로 판정된다(주관어 없음).
    function selfCheck(result) {
      var checks = [];
      function add(id, label, pass, detail) { checks.push({id: id, label: label, pass: !!pass, detail: detail || ''}); }
      if (!result || !result.ok) { add('K0', '입력이 유효하다', false, '입력 오류'); return checks; }
      var text = result.text;
      var bad = [];
      FORBIDDEN.forEach(function (f) { var hit = text.match(f[0]); if (hit) bad.push(f[1] + ': "' + hit[0] + '"'); });
      add('K1', '금지 표현(보장·속마음 단정·신고 안내·예측 단정)이 없다', bad.length === 0, bad.join(' / '));
      add('K2', '면책 문구가 있다', /대체하지 않습니다/.test(text));
      if (result.mode === 'crisis') {
        add('K3', '위기 응답에 상담전화 109 안내가 있다', /109/.test(text));
        add('K4', '위기 응답에 카드 해석이 없다', !result.sections.some(function (s) { return s.key === 'card'; }));
        return checks;
      }
      var inp = result.input;
      var sit = clip(inp.situation, 120);
      add('K3', '입력한 상황·고민·목표를 그대로 인용한다', text.indexOf(sit) >= 0 && text.indexOf(inp.worry) >= 0 && text.indexOf(inp.goal) >= 0);
      var plan = result.sections.filter(function (s) { return s.key === 'plan'; })[0];
      add('K4', '행동 단계가 4줄(오늘·3일 안 2개·7일째)이다', !!plan && plan.lines.length === 4);
      add('K5', '조건형 규칙("~하면")이 2개 이상 있다', plan && plan.lines.filter(function (l) { return l.indexOf('3일 안') === 0; }).length >= 2);
      var q = result.sections.filter(function (s) { return s.key === 'questions'; })[0];
      add('K6', '질문이 3개이고 모두 물음표로 끝난다', !!q && q.lines.length === 3 && q.lines.every(function (l) { return /[?？]$/.test(l.trim()); }));
      add('K7', '전체 길이가 2,400자 이하다', text.length <= 2400, text.length + '자');
      add('K8', '카드 해석 섹션과 키워드가 있다', result.sections.some(function (s) { return s.key === 'card'; }) && text.indexOf(result.card.keywords[0]) >= 0);
      add('K9', '"선택한 고민:" 같은 제목 반복형 문장이 없다', !/선택한 고민/.test(text));
      var keys = result.sections.map(function (s) { return s.key; });
      var order = ['summary', 'card', 'mirror', 'step'];
      add('K10', '핵심 한 줄 요약·카드가 말하는 것·내 고민에 비춰 보면·이번 주 해볼 한 걸음이 이 순서로 맨 앞에 있다', order.every(function (k, i) { return keys[i] === k; }));
      var summary = result.sections[0].lines;
      add('K11', '한 줄 요약이 한 문장이고 90자 이하이며 물음표로 끝나지 않는다', summary.length === 1 && summary[0].length <= 90 && !/[?？]$/.test(summary[0].trim()), summary[0].length + '자');
      var step = result.sections.filter(function (s) { return s.key === 'step'; })[0];
      add('K12', '해볼 한 걸음이 행동 1가지(행동·방법·7일 뒤 확인)로 구성된다', !!step && step.lines.length >= 3 && /7일 뒤/.test(step.lines[step.lines.length - 1]));
      var cardSec = result.sections.filter(function (s) { return s.key === 'card'; })[0];
      add('K14', '카드 박스에 "이 카드를 대면" 상황 연결 문장이 있다', !!cardSec && cardSec.lines.some(function (l) { return l.indexOf('이 카드를 대면: ') >= 0; }));
      if (closing) add('K13', '운영자 마무리 안내가 맨 끝에 있다', result.sections[result.sections.length - 1].lines[0] === closing);
      return checks;
    }

    // Claude·GPT 등에 붙여 넣어 더 풍부한 문장을 받기 위한 프롬프트. 사용자가 준 '사이달' 시스템 프롬프트(4부 구조·금지 사항·마무리 문구)를
    // 기본으로 하고, 이 엔진이 확인한 규칙(입력 인용, 사실과 추측 분리, 조건형 행동, 위기·전문가 안내)을 더했다. 개인정보를 넣지 말 것.
    function buildPrompt(result) {
      if (!result || result.mode !== 'reading') return '';
      var inp = result.input, m = result.matched, c = result.card;
      var sec = function (k) { return result.sections.filter(function (s) { return s.key === k; })[0]; };
      return [
        '당신은 2030 세대의 마음을 따뜻하게 비추어주는 전문 심리·타로 카운슬러 \'사이달\'입니다.',
        '절대로 미래를 100% 단정하거나, 공포심을 조장하거나, 상대방의 속마음을 확정 짓는 답변(예: "그 사람은 당신을 싫어합니다", "이별합니다")을 하지 마세요.',
        '',
        '사용자가 [고민/상황]과 [선택한 타로 번호(1~78)]를 입력하면, 아래 4부 구조에 맞춰 지루하지 않고 현실적인 리딩을 제공하세요.',
        '1. 【핵심 한 줄 요약】: 전체 리딩을 관통하는 강렬하고 명쾌한 1문장 결론(90자 이하, 질문 아님)',
        '2. 【카드가 말하는 것】: 선택한 번호 카드의 상징적 의미를 상황과 연결',
        '3. 【내 고민에 비춰 보면】: 유저의 내면 감정을 객관적으로 정리(사실로 적은 것과 추측인 것을 나눔)',
        '4. 【이번 주 해볼 한 걸음】: 현실에서 당장 실천할 수 있는 구체적 행동 가이드 1가지(행동 / 이렇게 해봐요 / 7일 뒤 확인)',
        '',
        '[추가 규칙]',
        '- 사용자의 상황·고민·목표를 한 번 그대로 인용해 구체적으로 답한다. 누구에게나 맞는 일반론("마음의 소리에 귀 기울이세요")만 쓰지 않는다.',
        '- 예측 대신 조건형으로 쓴다: "만약 A라면 B를 하고, C라면 D를 한다". 시기·성공·합격·재회 여부와 상대의 속마음은 말하지 않고, 직접 확인하는 말(질문 문장)을 준다.',
        '- 사용자가 적지 않은 사실(성격, 건강, 과거)을 지어내지 않는다.',
        '- 금전·계약·법률·건강 소재는 카드로 정하지 말고 공적 상담 창구나 전문가 확인을 안내한다.',
        '- 자해·자살을 암시하는 말이 있으면 해석을 멈추고 자살예방 상담전화 109와 전문가·가까운 사람에게 이야기하도록 권한다. 이때는 아래 마무리 문구를 쓰지 않는다.',
        '- 말투는 ~해요/~이에요 체, 전체 1,200자 이내. 마지막에 "본 서비스는 전문 상담, 의학, 법률 조언을 대체하지 않습니다."를 쓴다.',
        closing ? '\n답변 끝에는 항상 아래 문구를 덧붙이세요:\n"' + closing + '"' : '',
        '',
        '[사용자 입력]',
        '상황: ' + inp.situation,
        '고민: ' + inp.worry,
        '목표: ' + inp.goal,
        '',
        '[선택한 타로 번호] ' + inp.cardNumber + '번 → ' + c.name + '(' + c.en + ') · 키워드: ' + c.keywords.join(', '),
        '상징: ' + c.symbolism,
        '뜻: ' + c.meaning,
        '카드가 던지는 질문: ' + c.question,
        m ? '\n[가장 가까운 기존 상황(근거 자료)] ' + m.title : '',
        '',
        '[엔진이 만든 초안 — 이보다 더 구체적이고 생생하게 고쳐 써 주세요]',
        ['summary', 'card', 'mirror', 'step'].map(function (k) { var s = sec(k); return '【' + s.title + '】\n' + s.lines.join('\n'); }).join('\n\n')
      ].join('\n');
    }

    return {consult: consult, selfCheck: selfCheck, buildPrompt: buildPrompt, match: match};
  }

  var api = {create: create, pp: pp, hash: hash, FORBIDDEN: FORBIDDEN, LIMITS: LIMITS};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SidalConsult = api;
})(typeof window !== 'undefined' ? window : this);
