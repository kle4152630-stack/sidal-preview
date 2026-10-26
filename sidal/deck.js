const TAROT_DECK = [
  {
    "id": "m00",
    "name": "바보",
    "en": "THE FOOL",
    "num": "0",
    "group": "메이저",
    "keywords": [
      "시작",
      "호기심",
      "준비"
    ],
    "symbolism": "절벽 앞의 여행자와 작은 보따리는 아직 경험하지 않은 길을 보여줘요. 흰 개는 발밑도 살피라는 신호로 읽을 수 있어요.",
    "meaning": "새로운 가능성에 열려 있되, 준비 없이 뛰어드는 것과 작은 시도는 구분해요.",
    "question": "시작하기 전에 확인할 현실적인 조건 하나는 무엇인가요?",
    "image": "assets/tarot/00_Fool.webp"
  },
  {
    "id": "m01",
    "name": "마법사",
    "en": "THE MAGICIAN",
    "num": "I",
    "group": "메이저",
    "keywords": [
      "의지",
      "자원",
      "실행"
    ],
    "symbolism": "한 손은 하늘을, 다른 손은 땅을 가리켜요. 탁자 위 네 도구는 마음속 구상을 현실의 행동으로 옮길 자원을 상징해요.",
    "meaning": "모든 조건을 기다리기보다 이미 가진 도구로 구체적인 첫 행동을 정해요.",
    "question": "지금 가진 경험이나 도구 중 바로 쓸 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/01_Magician.webp"
  },
  {
    "id": "m02",
    "name": "여사제",
    "en": "THE HIGH PRIESTESS",
    "num": "II",
    "group": "메이저",
    "keywords": [
      "관찰",
      "직관",
      "미지"
    ],
    "symbolism": "두 기둥 사이의 인물과 뒤편의 장막은 보이는 정보와 아직 드러나지 않은 정보를 나눠 보여줘요.",
    "meaning": "느낌을 무시하지 않되, 느낌만으로 빈칸을 채우지는 않아요.",
    "question": "내가 아는 것과 아직 묻지 않은 것은 무엇인가요?",
    "image": "assets/tarot/02_High_Priestess.webp"
  },
  {
    "id": "m03",
    "name": "여황제",
    "en": "THE EMPRESS",
    "num": "III",
    "group": "메이저",
    "keywords": [
      "돌봄",
      "풍요",
      "성장"
    ],
    "symbolism": "곡식과 나무에 둘러싸인 여황제의 풍경은 돌봄이 쌓여 자라는 삶을 보여줘요.",
    "meaning": "빠른 성과보다 몸과 일상을 보살피는 조건을 먼저 살펴봐요.",
    "question": "지금의 나에게 필요한 돌봄 한 가지는 무엇인가요?",
    "image": "assets/tarot/03_Empress.webp"
  },
  {
    "id": "m04",
    "name": "황제",
    "en": "THE EMPEROR",
    "num": "IV",
    "group": "메이저",
    "keywords": [
      "질서",
      "경계",
      "책임"
    ],
    "symbolism": "단단한 왕좌와 바위산은 버틸 수 있는 구조를 상징해요. 보호하는 기준이 지나친 통제로 바뀌지 않는지도 살펴봐요.",
    "meaning": "모호한 기대를 역할과 경계, 지킬 수 있는 약속으로 바꿔요.",
    "question": "누가 무엇을 책임지는지 분명히 정할 부분은 어디인가요?",
    "image": "assets/tarot/04_Emperor.webp"
  },
  {
    "id": "m05",
    "name": "교황",
    "en": "THE HIEROPHANT",
    "num": "V",
    "group": "메이저",
    "keywords": [
      "가치",
      "전통",
      "배움"
    ],
    "symbolism": "두 사람 앞에 앉은 교황과 교차한 열쇠는 공동체가 전해온 규칙과 배움을 떠올리게 해요.",
    "meaning": "익숙한 규범을 무조건 따르기보다 내가 동의하는 가치인지 확인해요.",
    "question": "당연하다고 여긴 기준은 누구에게서 배운 것인가요?",
    "image": "assets/tarot/05_Hierophant.webp"
  },
  {
    "id": "m06",
    "name": "연인들",
    "en": "THE LOVERS",
    "num": "VI",
    "group": "메이저",
    "keywords": [
      "관계",
      "선택",
      "가치"
    ],
    "symbolism": "서로 마주한 두 인물과 위의 천사는 끌림뿐 아니라 관계 안에서 선택하는 가치를 보여줘요.",
    "meaning": "호감이 있다는 것과 같은 관계를 원한다는 것은 구분해서 살펴요.",
    "question": "나는 어떤 관계에 동의하고 어떤 관계에는 동의하기 어려운가요?",
    "image": "assets/tarot/06_Lovers.webp"
  },
  {
    "id": "m07",
    "name": "전차",
    "en": "THE CHARIOT",
    "num": "VII",
    "group": "메이저",
    "keywords": [
      "방향",
      "의지",
      "조율"
    ],
    "symbolism": "검고 흰 두 스핑크스는 서로 다른 힘을, 전차는 그 힘을 한 방향으로 모으는 의지를 보여줘요.",
    "meaning": "속도를 높이기 전에 목적지와 내가 조절할 수 있는 조건을 정해요.",
    "question": "빨리 움직이는 것보다 먼저 정해야 할 방향은 무엇인가요?",
    "image": "assets/tarot/07_Chariot.webp"
  },
  {
    "id": "m08",
    "name": "힘",
    "en": "STRENGTH",
    "num": "VIII",
    "group": "메이저",
    "keywords": [
      "용기",
      "인내",
      "온화함"
    ],
    "symbolism": "인물은 사자를 힘으로 누르기보다 부드럽게 마주해요. 충동을 알아차리면서 선택을 지키는 힘의 모습이에요.",
    "meaning": "감정을 없애려 하기보다 감정이 있어도 지킬 행동을 선택해요.",
    "question": "감정이 강한 오늘도 내가 지킬 수 있는 작은 기준은 무엇인가요?",
    "image": "assets/tarot/08_Strength.webp"
  },
  {
    "id": "m09",
    "name": "은둔자",
    "en": "THE HERMIT",
    "num": "IX",
    "group": "메이저",
    "keywords": [
      "성찰",
      "거리",
      "내면의 빛"
    ],
    "symbolism": "산 위의 인물이 든 등불은 먼 미래 전체가 아니라 바로 앞의 길을 비춰요.",
    "meaning": "남의 마음을 더 추측하기 전에 내 마음과 다음 한 걸음을 살펴요.",
    "question": "지금 내 등불이 비출 수 있는 가장 가까운 사실은 무엇인가요?",
    "image": "assets/tarot/09_Hermit.webp"
  },
  {
    "id": "m10",
    "name": "운명의 수레바퀴",
    "en": "WHEEL OF FORTUNE",
    "num": "X",
    "group": "메이저",
    "keywords": [
      "순환",
      "변화",
      "반복"
    ],
    "symbolism": "돌아가는 바퀴와 주변의 형상은 바뀌는 흐름 속에서도 반복되는 패턴을 떠올리게 해요.",
    "meaning": "변화를 통제하려 하기보다 반복 속에서 내가 바꿀 부분을 찾아요.",
    "question": "같은 장면에서 이번에는 무엇을 다르게 해볼 수 있나요?",
    "image": "assets/tarot/10_Wheel_of_Fortune.webp"
  },
  {
    "id": "m11",
    "name": "정의",
    "en": "JUSTICE",
    "num": "XI",
    "group": "메이저",
    "keywords": [
      "균형",
      "근거",
      "책임"
    ],
    "symbolism": "한 손의 저울은 양쪽의 사정을, 다른 손의 검은 기준에 따른 결정을 상징해요.",
    "meaning": "느낌과 기록을 구분하고, 나와 상대에게 같은 기준을 적용해요.",
    "question": "판단에 필요한 사실과 내가 지킬 기준이 각각 무엇인가요?",
    "image": "assets/tarot/11_Justice.webp"
  },
  {
    "id": "m12",
    "name": "매달린 사람",
    "en": "THE HANGED MAN",
    "num": "XII",
    "group": "메이저",
    "keywords": [
      "멈춤",
      "재검토",
      "관점"
    ],
    "symbolism": "한쪽 발로 매달린 인물의 시야는 평소와 거꾸로예요. 멈춤이 다른 각도를 만드는 장면이에요.",
    "meaning": "바로 결론을 내리기보다 질문의 방향을 바꾸어 봐요.",
    "question": "지금 답을 재촉하는 대신 바꿔볼 질문은 무엇인가요?",
    "image": "assets/tarot/12_Hanged_Man.webp"
  },
  {
    "id": "m13",
    "name": "죽음",
    "en": "DEATH",
    "num": "XIII",
    "group": "메이저",
    "keywords": [
      "종결",
      "전환",
      "내려놓음"
    ],
    "symbolism": "갑옷을 입은 해골 기수와 멀리 떠오르는 해는 한 국면의 끝과 뒤따르는 변화를 함께 보여줘요.",
    "meaning": "실제 죽음을 예언하는 카드가 아니에요. 무엇을 끝내고 무엇을 이어갈지 살펴봐요.",
    "question": "이미 끝난 것과 아직 지킬 수 있는 것을 나누면 무엇이 남나요?",
    "image": "assets/tarot/13_Death.webp"
  },
  {
    "id": "m14",
    "name": "절제",
    "en": "TEMPERANCE",
    "num": "XIV",
    "group": "메이저",
    "keywords": [
      "조율",
      "중용",
      "회복"
    ],
    "symbolism": "두 잔 사이로 물을 옮기는 천사와 물·땅에 걸친 발은 서로 다른 흐름을 맞추는 모습을 보여줘요.",
    "meaning": "한쪽이 계속 참는 타협보다 지속 가능한 비율과 속도를 찾아요.",
    "question": "두 사람 또는 두 필요가 함께 지킬 수 있는 중간 지점은 어디인가요?",
    "image": "assets/tarot/14_Temperance.webp"
  },
  {
    "id": "m15",
    "name": "악마",
    "en": "THE DEVIL",
    "num": "XV",
    "group": "메이저",
    "keywords": [
      "집착",
      "속박",
      "자각"
    ],
    "symbolism": "사슬에 묶인 두 인물은 벗어나기 어렵게 느끼는 패턴을 보여줘요. 실제 외부의 제약도 함께 살펴야 해요.",
    "meaning": "유혹이나 습관, 권력관계가 선택을 좁히는지 점검해요. 잘못을 내 탓으로 돌리라는 뜻은 아니에요.",
    "question": "반복을 끊기 위해 나 혼자의 의지 말고 어떤 장치나 도움이 필요한가요?",
    "image": "assets/tarot/15_Devil.webp"
  },
  {
    "id": "m16",
    "name": "탑",
    "en": "THE TOWER",
    "num": "XVI",
    "group": "메이저",
    "keywords": [
      "충격",
      "균열",
      "재점검"
    ],
    "symbolism": "번개가 탑의 꼭대기를 치고 왕관이 떨어져요. 당연하던 구조가 흔들리는 장면이에요.",
    "meaning": "불행의 예고가 아니에요. 드러난 문제를 축소하지 말고 안전과 기반부터 살펴요.",
    "question": "지금 지켜야 할 기반과 다시 점검할 가정은 각각 무엇인가요?",
    "image": "assets/tarot/16_Tower.webp"
  },
  {
    "id": "m17",
    "name": "별",
    "en": "THE STAR",
    "num": "XVII",
    "group": "메이저",
    "keywords": [
      "희망",
      "회복",
      "여유"
    ],
    "symbolism": "별 아래 인물이 물과 땅에 물을 붓는 모습은 소진된 마음과 현실을 함께 돌보는 흐름을 보여줘요.",
    "meaning": "좋은 결과를 보장하기보다 회복할 조건을 하나씩 만들어요.",
    "question": "내가 다시 숨을 고를 수 있게 돕는 작은 일은 무엇인가요?",
    "image": "assets/tarot/17_Star.webp"
  },
  {
    "id": "m18",
    "name": "달",
    "en": "THE MOON",
    "num": "XVIII",
    "group": "메이저",
    "keywords": [
      "불확실성",
      "감정",
      "탐색"
    ],
    "symbolism": "두 탑 사이의 길, 개와 늑대, 물에서 올라오는 가재는 익숙한 것과 낯선 감정이 겹친 밤을 보여줘요.",
    "meaning": "정보가 적을 때 불안이나 기대를 확정된 이야기로 만들지 않아요.",
    "question": "지금 내가 사실처럼 받아들이는 추측은 무엇인가요?",
    "image": "assets/tarot/18_Moon.webp"
  },
  {
    "id": "m19",
    "name": "태양",
    "en": "THE SUN",
    "num": "XIX",
    "group": "메이저",
    "keywords": [
      "명료함",
      "기쁨",
      "표현"
    ],
    "symbolism": "밝은 해와 흰 말 위의 아이, 해바라기는 숨김없이 드러나는 생명력과 기쁨을 보여줘요.",
    "meaning": "좋았던 경험을 구체적으로 확인하고 솔직하게 표현해요.",
    "question": "내가 실제로 즐거웠던 장면을 하나 꼽는다면 무엇인가요?",
    "image": "assets/tarot/19_Sun.webp"
  },
  {
    "id": "m20",
    "name": "심판",
    "en": "JUDGEMENT",
    "num": "XX",
    "group": "메이저",
    "keywords": [
      "돌아봄",
      "응답",
      "재결정"
    ],
    "symbolism": "나팔 소리에 몸을 일으키는 사람들은 지나온 일을 돌아보고 새롭게 응답하는 순간을 보여줘요.",
    "meaning": "재회나 합격의 보장이 아니에요. 과거의 경험을 바탕으로 지금의 결정을 새로 해요.",
    "question": "다시 선택한다면 지난번과 달라져야 할 조건은 무엇인가요?",
    "image": "assets/tarot/20_Judgement.webp"
  },
  {
    "id": "m21",
    "name": "세계",
    "en": "THE WORLD",
    "num": "XXI",
    "group": "메이저",
    "keywords": [
      "완성",
      "통합",
      "다음 단계"
    ],
    "symbolism": "월계수 타원 안의 인물과 네 모서리의 형상은 여러 경험이 하나로 모이는 완결을 상징해요.",
    "meaning": "완벽해야 끝낼 수 있다는 생각 대신 마무리할 기준을 정해요.",
    "question": "충분히 해낸 부분을 인정하고 마무리할 일은 무엇인가요?",
    "image": "assets/tarot/21_World.webp"
  },
  {
    "id": "cups-01",
    "name": "컵 에이스",
    "en": "ACE OF CUPS",
    "num": "에이스",
    "group": "컵",
    "keywords": [
      "감정의 시작",
      "수용"
    ],
    "symbolism": "구름 속 손이 넘치는 잔을 내밀어요.",
    "meaning": "새롭게 느끼는 감정을 서두르지 않고 알아차려요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups01.webp"
  },
  {
    "id": "cups-02",
    "name": "컵 2",
    "en": "2 OF CUPS",
    "num": "2",
    "group": "컵",
    "keywords": [
      "교감",
      "상호성"
    ],
    "symbolism": "두 인물이 서로 잔을 마주 들어요.",
    "meaning": "한쪽의 기대뿐 아니라 서로의 의사를 확인해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups02.webp"
  },
  {
    "id": "cups-03",
    "name": "컵 3",
    "en": "3 OF CUPS",
    "num": "3",
    "group": "컵",
    "keywords": [
      "우정",
      "함께하는 기쁨"
    ],
    "symbolism": "세 인물이 잔을 들고 원을 이뤄요.",
    "meaning": "혼자 해결하려 애쓰기보다 믿을 만한 연결을 떠올려요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups03.webp"
  },
  {
    "id": "cups-04",
    "name": "컵 4",
    "en": "4 OF CUPS",
    "num": "4",
    "group": "컵",
    "keywords": [
      "권태",
      "재고"
    ],
    "symbolism": "나무 아래 인물이 앞의 잔과 새로 내민 잔을 바라봐요.",
    "meaning": "기회가 없는지, 지금 받아들일 여유가 없는지 나눠봐요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups04.webp"
  },
  {
    "id": "cups-05",
    "name": "컵 5",
    "en": "5 OF CUPS",
    "num": "5",
    "group": "컵",
    "keywords": [
      "상실",
      "남아 있는 것"
    ],
    "symbolism": "쓰러진 잔 셋과 뒤에 서 있는 잔 둘이 보여요.",
    "meaning": "상실을 충분히 인정하면서 아직 지킬 수 있는 것도 찾아요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups05.webp"
  },
  {
    "id": "cups-06",
    "name": "컵 6",
    "en": "6 OF CUPS",
    "num": "6",
    "group": "컵",
    "keywords": [
      "추억",
      "친숙함"
    ],
    "symbolism": "한 인물이 꽃이 담긴 잔을 다른 인물에게 건네요.",
    "meaning": "좋았던 기억과 지금의 관계가 같은지는 따로 살펴요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups06.webp"
  },
  {
    "id": "cups-07",
    "name": "컵 7",
    "en": "7 OF CUPS",
    "num": "7",
    "group": "컵",
    "keywords": [
      "상상",
      "선택의 혼란"
    ],
    "symbolism": "구름 위 여러 잔에 서로 다른 상징이 담겨 있어요.",
    "meaning": "가능성의 수보다 확인된 조건을 기준으로 좁혀봐요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups07.webp"
  },
  {
    "id": "cups-08",
    "name": "컵 8",
    "en": "8 OF CUPS",
    "num": "8",
    "group": "컵",
    "keywords": [
      "떠남",
      "의미 탐색"
    ],
    "symbolism": "인물이 쌓인 잔들을 뒤로하고 산을 향해 걸어요.",
    "meaning": "이미 쏟은 노력만으로 머물기보다 계속할 이유를 살펴요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups08.webp"
  },
  {
    "id": "cups-09",
    "name": "컵 9",
    "en": "9 OF CUPS",
    "num": "9",
    "group": "컵",
    "keywords": [
      "만족",
      "소망"
    ],
    "symbolism": "인물 뒤에 잔 아홉 개가 늘어서 있어요.",
    "meaning": "남의 평가와 별개로 내가 만족하는 조건을 확인해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups09.webp"
  },
  {
    "id": "cups-10",
    "name": "컵 10",
    "en": "10 OF CUPS",
    "num": "10",
    "group": "컵",
    "keywords": [
      "유대",
      "공동의 행복"
    ],
    "symbolism": "무지개 아래 가족과 잔 열 개가 보여요.",
    "meaning": "함께하고 싶은 삶을 일상의 구체적인 모습으로 말해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups10.webp"
  },
  {
    "id": "cups-11",
    "name": "컵 시종",
    "en": "PAGE OF CUPS",
    "num": "시종",
    "group": "컵",
    "keywords": [
      "호기심",
      "감정 표현"
    ],
    "symbolism": "잔 속 물고기를 바라보는 젊은 인물이 있어요.",
    "meaning": "새로운 감정을 단정하지 않고 조심스럽게 표현해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups11.webp"
  },
  {
    "id": "cups-12",
    "name": "컵 기사",
    "en": "KNIGHT OF CUPS",
    "num": "기사",
    "group": "컵",
    "keywords": [
      "제안",
      "낭만"
    ],
    "symbolism": "말을 탄 인물이 잔을 앞으로 내밀어요.",
    "meaning": "매력적인 말과 실제로 이어지는 행동을 함께 살펴요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups12.webp"
  },
  {
    "id": "cups-13",
    "name": "컵 여왕",
    "en": "QUEEN OF CUPS",
    "num": "여왕",
    "group": "컵",
    "keywords": [
      "공감",
      "감정 돌봄"
    ],
    "symbolism": "물가의 여왕이 장식된 잔을 바라봐요.",
    "meaning": "상대에게 공감하면서도 내 감정의 경계를 지켜요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups13.webp"
  },
  {
    "id": "cups-14",
    "name": "컵 왕",
    "en": "KING OF CUPS",
    "num": "왕",
    "group": "컵",
    "keywords": [
      "감정의 균형",
      "성숙"
    ],
    "symbolism": "파도 속 왕좌의 인물이 잔과 홀을 들어요.",
    "meaning": "감정이 흔들려도 반응할 방식은 고를 수 있어요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Cups14.webp"
  },
  {
    "id": "wands-01",
    "name": "완드 에이스",
    "en": "ACE OF WANDS",
    "num": "에이스",
    "group": "완드",
    "keywords": [
      "시작",
      "추진력"
    ],
    "symbolism": "구름 속 손에 싹이 돋은 지팡이가 들려 있어요.",
    "meaning": "의욕이 있을 때 작은 실험 하나로 옮겨봐요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands01.webp"
  },
  {
    "id": "wands-02",
    "name": "완드 2",
    "en": "2 OF WANDS",
    "num": "2",
    "group": "완드",
    "keywords": [
      "계획",
      "시야 확장"
    ],
    "symbolism": "지구본을 든 인물이 성벽 너머를 바라봐요.",
    "meaning": "가능성을 생각하는 단계에서 실제 조건 비교로 나아가요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands02.webp"
  },
  {
    "id": "wands-03",
    "name": "완드 3",
    "en": "3 OF WANDS",
    "num": "3",
    "group": "완드",
    "keywords": [
      "확장",
      "전망"
    ],
    "symbolism": "세 지팡이 곁에서 인물이 바다를 바라봐요.",
    "meaning": "이미 시작한 일의 반응을 확인하고 다음 준비를 해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands03.webp"
  },
  {
    "id": "wands-04",
    "name": "완드 4",
    "en": "4 OF WANDS",
    "num": "4",
    "group": "완드",
    "keywords": [
      "안정",
      "축하"
    ],
    "symbolism": "네 지팡이에 화환이 걸리고 사람들이 모여 있어요.",
    "meaning": "완벽한 끝을 기다리기보다 함께 이룬 작은 기반을 인정해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands04.webp"
  },
  {
    "id": "wands-05",
    "name": "완드 5",
    "en": "5 OF WANDS",
    "num": "5",
    "group": "완드",
    "keywords": [
      "경쟁",
      "의견 충돌"
    ],
    "symbolism": "다섯 인물이 서로 다른 방향으로 지팡이를 들어요.",
    "meaning": "갈등을 한 사람의 잘못으로 정하기 전에 목표 차이를 봐요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands05.webp"
  },
  {
    "id": "wands-06",
    "name": "완드 6",
    "en": "6 OF WANDS",
    "num": "6",
    "group": "완드",
    "keywords": [
      "인정",
      "성취"
    ],
    "symbolism": "월계관을 쓴 기수가 사람들 사이를 지나가요.",
    "meaning": "인정받은 성과를 구체적으로 기록하고 다음 책임도 살펴요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands06.webp"
  },
  {
    "id": "wands-07",
    "name": "완드 7",
    "en": "7 OF WANDS",
    "num": "7",
    "group": "완드",
    "keywords": [
      "입장 지키기",
      "대응"
    ],
    "symbolism": "높은 곳의 인물이 아래에서 오는 지팡이에 맞서요.",
    "meaning": "모든 요구를 받아들이기보다 지킬 기준을 분명히 해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands07.webp"
  },
  {
    "id": "wands-08",
    "name": "완드 8",
    "en": "8 OF WANDS",
    "num": "8",
    "group": "완드",
    "keywords": [
      "속도",
      "소식"
    ],
    "symbolism": "여덟 지팡이가 하늘을 가로질러 날아가요.",
    "meaning": "일이 빨리 움직일수록 확인할 핵심 조건을 놓치지 않아요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands08.webp"
  },
  {
    "id": "wands-09",
    "name": "완드 9",
    "en": "9 OF WANDS",
    "num": "9",
    "group": "완드",
    "keywords": [
      "경계",
      "끈기"
    ],
    "symbolism": "붕대를 맨 인물이 지팡이들 앞에 서 있어요.",
    "meaning": "버텨온 힘을 인정하되 쉬어야 할 신호도 살펴요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands09.webp"
  },
  {
    "id": "wands-10",
    "name": "완드 10",
    "en": "10 OF WANDS",
    "num": "10",
    "group": "완드",
    "keywords": [
      "부담",
      "과중"
    ],
    "symbolism": "인물이 열 개의 지팡이를 한꺼번에 들고 있어요.",
    "meaning": "끝까지 혼자 들기보다 줄이거나 나눌 일을 찾아요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands10.webp"
  },
  {
    "id": "wands-11",
    "name": "완드 시종",
    "en": "PAGE OF WANDS",
    "num": "시종",
    "group": "완드",
    "keywords": [
      "탐색",
      "열정"
    ],
    "symbolism": "젊은 인물이 지팡이의 끝을 바라봐요.",
    "meaning": "관심을 바로 진로로 확정하기보다 직접 경험해봐요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands11.webp"
  },
  {
    "id": "wands-12",
    "name": "완드 기사",
    "en": "KNIGHT OF WANDS",
    "num": "기사",
    "group": "완드",
    "keywords": [
      "추진",
      "성급함"
    ],
    "symbolism": "말을 탄 기사가 지팡이를 들고 나아가요.",
    "meaning": "시작의 속도에 맞춰 후속 계획도 준비해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands12.webp"
  },
  {
    "id": "wands-13",
    "name": "완드 여왕",
    "en": "QUEEN OF WANDS",
    "num": "여왕",
    "group": "완드",
    "keywords": [
      "자신감",
      "활력"
    ],
    "symbolism": "해바라기와 지팡이를 든 여왕 곁에 검은 고양이가 있어요.",
    "meaning": "나를 숨기지 않으면서도 상대의 공간을 존중해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands13.webp"
  },
  {
    "id": "wands-14",
    "name": "완드 왕",
    "en": "KING OF WANDS",
    "num": "왕",
    "group": "완드",
    "keywords": [
      "비전",
      "주도"
    ],
    "symbolism": "지팡이를 든 왕의 옷과 왕좌에 도마뱀 문양이 보여요.",
    "meaning": "큰 방향을 제시하되 실행을 맡을 사람의 여건도 살펴요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Wands14.webp"
  },
  {
    "id": "swords-01",
    "name": "소드 에이스",
    "en": "ACE OF SWORDS",
    "num": "에이스",
    "group": "소드",
    "keywords": [
      "명료함",
      "판단"
    ],
    "symbolism": "구름 속 손이 왕관을 꿴 검을 들어요.",
    "meaning": "문제의 핵심을 한 문장으로 정리하고 근거를 확인해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords01.webp"
  },
  {
    "id": "swords-02",
    "name": "소드 2",
    "en": "2 OF SWORDS",
    "num": "2",
    "group": "소드",
    "keywords": [
      "유보",
      "갈등하는 선택"
    ],
    "symbolism": "눈을 가린 인물이 검 두 자루를 교차해 들어요.",
    "meaning": "결정을 미루게 하는 정보의 빈칸을 먼저 찾아요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords02.webp"
  },
  {
    "id": "swords-03",
    "name": "소드 3",
    "en": "3 OF SWORDS",
    "num": "3",
    "group": "소드",
    "keywords": [
      "상처",
      "아픈 사실"
    ],
    "symbolism": "비구름 아래 심장에 검 세 자루가 꽂혀 있어요.",
    "meaning": "아픔을 좋은 일로 포장하지 않고 필요한 지지를 찾아요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords03.webp"
  },
  {
    "id": "swords-04",
    "name": "소드 4",
    "en": "4 OF SWORDS",
    "num": "4",
    "group": "소드",
    "keywords": [
      "휴식",
      "회복"
    ],
    "symbolism": "누운 인물 곁에 검 네 자루가 놓여 있어요.",
    "meaning": "결론을 더 생각하기 전에 충분히 쉬어볼 여지를 만들어요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords04.webp"
  },
  {
    "id": "swords-05",
    "name": "소드 5",
    "en": "5 OF SWORDS",
    "num": "5",
    "group": "소드",
    "keywords": [
      "소모적 갈등",
      "대가"
    ],
    "symbolism": "검을 모은 인물 뒤로 다른 사람들이 떠나요.",
    "meaning": "이기는 대화가 관계와 내 상태에 남길 대가도 살펴요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords05.webp"
  },
  {
    "id": "swords-06",
    "name": "소드 6",
    "en": "6 OF SWORDS",
    "num": "6",
    "group": "소드",
    "keywords": [
      "이동",
      "전환"
    ],
    "symbolism": "배가 사람들과 검을 싣고 물을 건너요.",
    "meaning": "모든 문제가 해결되지 않아도 더 안전한 환경을 찾을 수 있어요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords06.webp"
  },
  {
    "id": "swords-07",
    "name": "소드 7",
    "en": "7 OF SWORDS",
    "num": "7",
    "group": "소드",
    "keywords": [
      "우회",
      "전략"
    ],
    "symbolism": "인물이 검을 들고 야영지에서 빠져나가요.",
    "meaning": "숨기는 것이 실제로 필요한 전략인지 대화를 미루는 일인지 살펴요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords07.webp"
  },
  {
    "id": "swords-08",
    "name": "소드 8",
    "en": "8 OF SWORDS",
    "num": "8",
    "group": "소드",
    "keywords": [
      "제약",
      "갇힌 시야"
    ],
    "symbolism": "눈을 가리고 묶인 인물 주변에 검들이 서 있어요.",
    "meaning": "제약을 내 탓으로만 돌리지 말고 도움과 선택지를 확인해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords08.webp"
  },
  {
    "id": "swords-09",
    "name": "소드 9",
    "en": "9 OF SWORDS",
    "num": "9",
    "group": "소드",
    "keywords": [
      "불안",
      "밤의 생각"
    ],
    "symbolism": "침대에서 얼굴을 감싼 인물 위에 검 아홉 자루가 보여요.",
    "meaning": "반복되는 걱정과 확인된 사실을 나누고 혼자 버티지 않아요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords09.webp"
  },
  {
    "id": "swords-10",
    "name": "소드 10",
    "en": "10 OF SWORDS",
    "num": "10",
    "group": "소드",
    "keywords": [
      "종결",
      "소진"
    ],
    "symbolism": "쓰러진 인물과 검 열 자루, 멀리 밝아오는 하늘이 보여요.",
    "meaning": "실제 죽음을 예고하지 않아요. 더 버티기 어려운 패턴을 점검해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords10.webp"
  },
  {
    "id": "swords-11",
    "name": "소드 시종",
    "en": "PAGE OF SWORDS",
    "num": "시종",
    "group": "소드",
    "keywords": [
      "관찰",
      "질문"
    ],
    "symbolism": "바람 속 젊은 인물이 검을 들고 주변을 살펴요.",
    "meaning": "성급히 결론 내리기보다 구체적인 질문을 준비해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords11.webp"
  },
  {
    "id": "swords-12",
    "name": "소드 기사",
    "en": "KNIGHT OF SWORDS",
    "num": "기사",
    "group": "소드",
    "keywords": [
      "결단",
      "과속"
    ],
    "symbolism": "기사가 검을 들고 바람을 가르며 달려요.",
    "meaning": "논리가 맞아도 말의 속도와 전달 방식은 조절해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords12.webp"
  },
  {
    "id": "swords-13",
    "name": "소드 여왕",
    "en": "QUEEN OF SWORDS",
    "num": "여왕",
    "group": "소드",
    "keywords": [
      "분별",
      "경계"
    ],
    "symbolism": "한 손에 검을 든 여왕이 다른 손을 앞으로 펼쳐요.",
    "meaning": "이해하려는 태도와 분명한 경계를 함께 유지해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords13.webp"
  },
  {
    "id": "swords-14",
    "name": "소드 왕",
    "en": "KING OF SWORDS",
    "num": "왕",
    "group": "소드",
    "keywords": [
      "원칙",
      "객관성"
    ],
    "symbolism": "정면을 향한 왕이 곧게 검을 들어요.",
    "meaning": "기준을 분명히 하되 사람의 사정까지 지워버리지는 않아요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Swords14.webp"
  },
  {
    "id": "pentacles-01",
    "name": "펜타클 에이스",
    "en": "ACE OF PENTACLES",
    "num": "에이스",
    "group": "펜타클",
    "keywords": [
      "현실의 기회",
      "기반"
    ],
    "symbolism": "구름 속 손이 동전을 내밀고 아래 정원 길이 보여요.",
    "meaning": "가능성을 실제 일정과 비용으로 확인해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents01.webp"
  },
  {
    "id": "pentacles-02",
    "name": "펜타클 2",
    "en": "2 OF PENTACLES",
    "num": "2",
    "group": "펜타클",
    "keywords": [
      "균형",
      "유연함"
    ],
    "symbolism": "인물이 두 동전을 무한대 모양의 끈으로 연결해요.",
    "meaning": "모든 일을 동시에 하기보다 조절할 우선순위를 정해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents02.webp"
  },
  {
    "id": "pentacles-03",
    "name": "펜타클 3",
    "en": "3 OF PENTACLES",
    "num": "3",
    "group": "펜타클",
    "keywords": [
      "협업",
      "숙련"
    ],
    "symbolism": "건물 안에서 세 사람이 작업과 도면을 함께 살펴요.",
    "meaning": "역할을 나누고 서로의 전문성을 활용해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents03.webp"
  },
  {
    "id": "pentacles-04",
    "name": "펜타클 4",
    "en": "4 OF PENTACLES",
    "num": "4",
    "group": "펜타클",
    "keywords": [
      "보유",
      "통제"
    ],
    "symbolism": "인물이 동전을 꼭 쥐고 발밑에도 두고 있어요.",
    "meaning": "지킬 자원과 과도하게 움켜쥐는 것을 구분해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents04.webp"
  },
  {
    "id": "pentacles-05",
    "name": "펜타클 5",
    "en": "5 OF PENTACLES",
    "num": "5",
    "group": "펜타클",
    "keywords": [
      "결핍",
      "도움 필요"
    ],
    "symbolism": "눈 속 두 인물이 밝은 창문 옆을 지나가요.",
    "meaning": "어려움을 숨기기보다 이용할 수 있는 지원을 확인해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents05.webp"
  },
  {
    "id": "pentacles-06",
    "name": "펜타클 6",
    "en": "6 OF PENTACLES",
    "num": "6",
    "group": "펜타클",
    "keywords": [
      "나눔",
      "주고받음"
    ],
    "symbolism": "저울을 든 인물이 다른 사람들에게 동전을 나눠요.",
    "meaning": "도움의 조건과 주는 쪽·받는 쪽의 힘 차이도 살펴요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents06.webp"
  },
  {
    "id": "pentacles-07",
    "name": "펜타클 7",
    "en": "7 OF PENTACLES",
    "num": "7",
    "group": "펜타클",
    "keywords": [
      "기다림",
      "중간 점검"
    ],
    "symbolism": "인물이 동전이 열린 나무 곁에서 기대어 쉬어요.",
    "meaning": "투입한 노력만큼 계속할 가치가 있는지 점검해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents07.webp"
  },
  {
    "id": "pentacles-08",
    "name": "펜타클 8",
    "en": "8 OF PENTACLES",
    "num": "8",
    "group": "펜타클",
    "keywords": [
      "연습",
      "꾸준한 기술"
    ],
    "symbolism": "인물이 동전을 하나씩 새기고 있어요.",
    "meaning": "막연한 재능 평가보다 반복해서 개선할 기술을 정해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents08.webp"
  },
  {
    "id": "pentacles-09",
    "name": "펜타클 9",
    "en": "9 OF PENTACLES",
    "num": "9",
    "group": "펜타클",
    "keywords": [
      "자립",
      "여유"
    ],
    "symbolism": "포도밭의 인물이 새와 함께 서 있어요.",
    "meaning": "내가 만든 기반을 인정하고 유지할 생활을 살펴요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents09.webp"
  },
  {
    "id": "pentacles-10",
    "name": "펜타클 10",
    "en": "10 OF PENTACLES",
    "num": "10",
    "group": "펜타클",
    "keywords": [
      "지속",
      "공동의 기반"
    ],
    "symbolism": "문 안의 가족과 개, 노인 주변에 동전 열 개가 보여요.",
    "meaning": "개인의 성과뿐 아니라 오래 유지할 공동의 조건을 생각해요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents10.webp"
  },
  {
    "id": "pentacles-11",
    "name": "펜타클 시종",
    "en": "PAGE OF PENTACLES",
    "num": "시종",
    "group": "펜타클",
    "keywords": [
      "배움",
      "실용적 시작"
    ],
    "symbolism": "젊은 인물이 동전 하나를 집중해서 바라봐요.",
    "meaning": "작은 목표를 정하고 실제 자료와 기술을 배워요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents11.webp"
  },
  {
    "id": "pentacles-12",
    "name": "펜타클 기사",
    "en": "KNIGHT OF PENTACLES",
    "num": "기사",
    "group": "펜타클",
    "keywords": [
      "성실",
      "안정된 실행"
    ],
    "symbolism": "멈춘 말 위의 기사가 동전을 들고 있어요.",
    "meaning": "빠른 변화보다 꾸준히 지킬 실행 계획을 만들어봐요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents12.webp"
  },
  {
    "id": "pentacles-13",
    "name": "펜타클 여왕",
    "en": "QUEEN OF PENTACLES",
    "num": "여왕",
    "group": "펜타클",
    "keywords": [
      "돌봄",
      "생활의 안정"
    ],
    "symbolism": "정원의 여왕이 무릎 위 동전을 바라봐요.",
    "meaning": "몸과 돈, 주변을 돌보는 일을 지속 가능한 범위로 맞춰요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents13.webp"
  },
  {
    "id": "pentacles-14",
    "name": "펜타클 왕",
    "en": "KING OF PENTACLES",
    "num": "왕",
    "group": "펜타클",
    "keywords": [
      "관리",
      "현실적 성취"
    ],
    "symbolism": "포도와 황소 문양 곁의 왕이 동전과 홀을 들어요.",
    "meaning": "성과를 유지할 운영 방식과 책임을 함께 살펴요.",
    "question": "이 관점에서 지금 확인하거나 바꿀 수 있는 것은 무엇인가요?",
    "image": "assets/tarot/Pents14.webp"
  }
];
