// 레지던스 상세 화면용 콘텐츠 — 8개 ID
// 한 줄 소개 / 어떤 곳이에요 설명 / 이런 걸 해요 프로그램 / 다녀온 사람들 후기

export type ResidenceReview = {
  stars: number;     // 1~5 (0.5 단위 가능)
  nickname: string;
  text: string;
};

export type ResidenceContent = {
  oneLiner: string;       // ③ 한 줄 (굵게)
  description: string;    // ④ "어떤 곳이에요" 문단
  programs: string[];     // ⑤ "이런 걸 해요" — 아이콘은 programIcon()으로 자동
  reviews: ResidenceReview[];  // ⑦
};

export const residenceContent: Record<string, ResidenceContent> = {
  ganghwa: {
    oneLiner: "바다를 곁에 두고 함께 쉬어가는 청년마을",
    description:
      "폐교를 고친 공간에서 바다를 보며 느슨하게 쉬어가는 곳이에요. 혼자 와도 자연스럽게 어울릴 수 있는 거리감이 매력이에요.",
    programs: ["바다 산책·모닥불", "로컬 식자재 요리", "주민과의 저녁 모임"],
    reviews: [
      {
        stars: 4.5,
        nickname: "섬살이_2주차",
        text: "바다 보면서 멍때리기 좋아요. 저녁마다 모닥불 피웠던 게 기억에 남아요.",
      },
      {
        stars: 5.0,
        nickname: "도시탈출",
        text: "조용한데 외롭진 않아요. 적당한 거리감이 딱 좋았어요.",
      },
    ],
  },
  yeongdeok: {
    oneLiner: "차 없이 뚜벅뚜벅, 바닷가 혼자 쉼",
    description:
      "차 없어도 다 걸어다닐 수 있는 해안 마을. 잔잔한 바다를 따라 혼자만의 시간을 보내기 좋아요.",
    programs: ["해안 도보 산책", "대게·해산물 체험", "바닷가 사색"],
    reviews: [
      {
        stars: 4.0,
        nickname: "혼자가좋아",
        text: "차 없어도 다 걸어다녀요. 아침 해안 산책이 루틴이 됐어요.",
      },
      {
        stars: 4.5,
        nickname: "대게러버",
        text: "혼자만의 시간이 필요했는데 딱 맞았어요.",
      },
    ],
  },
  yeongwol: {
    oneLiner: "밭일하고 멍때리며 나를 비우는 산속",
    description:
      "산속에서 밭을 가꾸고 별을 보며 머리를 비우는 회복형 마을이에요. 도시의 속도를 잠시 내려놓을 수 있어요.",
    programs: ["텃밭 가꾸기", "밤하늘 별 관측", "사색 산책"],
    reviews: [
      {
        stars: 5.0,
        nickname: "산속의하루",
        text: "밭일하고 멍때리는 게 이렇게 좋을 줄 몰랐어요.",
      },
      {
        stars: 4.5,
        nickname: "별보러옴",
        text: "밤하늘 별이 쏟아져요. 도시에선 못 보던 풍경.",
      },
    ],
  },
  muju: {
    oneLiner: "산속 작업실에서 손으로 만드는 시간",
    description:
      "공예·창작에 몰입할 수 있는 메이커 청년마을. 산 공기 마시며 작업에 집중하기 좋은 환경과 장비를 갖췄어요.",
    programs: ["목공·공예 작업", "창작 몰입 작업실", "산속 워케이션"],
    reviews: [
      {
        stars: 4.5,
        nickname: "만드는사람",
        text: "작업에 집중하기 최고예요. 손으로 만드는 재미가 있어요.",
      },
      {
        stars: 4.0,
        nickname: "무주정착희망",
        text: "조용하고 작업실 환경이 좋아요.",
      },
    ],
  },
  sejong: {
    oneLiner: "넓은 들판에서 푹 쉬는 농땡이 라이프",
    description:
      "이름처럼 제대로 쉬어가는 곳. 넓은 들판을 보며 마음을 트고, 편한 사람들과 어울리기 좋아요.",
    programs: ["들판 산책·피크닉", "느린 하루 루틴", "함께하는 식사"],
    reviews: [
      {
        stars: 4.5,
        nickname: "농땡이중",
        text: "이름값 해요ㅋㅋ 진짜 푹 쉬다 갑니다.",
      },
      {
        stars: 4.0,
        nickname: "들판러",
        text: "넓은 들판 보면 마음이 트여요.",
      },
    ],
  },
  uiseong: {
    oneLiner: "다 같이 만들어가는 마을, 나만의 성",
    description:
      "혼자였으면 못 했을 일을 함께 만들어가는 공동 창작 마을. 따뜻한 주민들과 정착을 그려볼 수 있어요.",
    programs: ["공동 프로젝트", "로컬 창업 체험", "마을 주민 교류"],
    reviews: [
      {
        stars: 5.0,
        nickname: "마늘마을",
        text: "다 같이 만들어가는 분위기가 좋아요. 혼자였으면 못 했을 일들.",
      },
      {
        stars: 4.5,
        nickname: "의성라이프",
        text: "주민들이 따뜻해요. 진짜 살아볼까 고민 중.",
      },
    ],
  },
  hongseong: {
    oneLiner: "머리 맞대고 함께 짓는 공동체",
    description:
      "다 같이 아이디어를 모아 무언가 만들어가는 에너지 좋은 마을. 적당한 거리의 공동체 생활을 경험해요.",
    programs: ["집단 워크숍", "공동 거주 체험", "로컬 네트워킹"],
    reviews: [
      {
        stars: 4.5,
        nickname: "같이짓기",
        text: "다들 머리 맞대고 뭔가 만들어요. 에너지가 좋아요.",
      },
      {
        stars: 5.0,
        nickname: "홍성댁",
        text: "공동체 생활 걱정했는데 딱 적당한 거리예요.",
      },
    ],
  },
  daejeon: {
    oneLiner: "도심 속 조용한 작업 거점",
    description:
      "도심인데 조용히 작업할 수 있는 공간. 혼자 일하다 필요하면 사람들과 어울릴 수 있는 유연한 곳이에요.",
    programs: ["도심 코워킹", "독립 작업 공간", "원할 때 커뮤니티"],
    reviews: [
      {
        stars: 4.0,
        nickname: "도심노마드",
        text: "도심인데 조용한 작업 공간이 있어요. 카페도 가깝고.",
      },
      {
        stars: 4.5,
        nickname: "weaver",
        text: "혼자 일하기 좋은데 필요하면 어울릴 수도 있어요.",
      },
    ],
  },
};

// =====================================================================
// 헬퍼
// =====================================================================

// 프로그램 라벨 → 아이콘 키워드 자동 매핑. 매칭 안 되면 ✦
const PROGRAM_ICON_RULES: Array<[string[], string]> = [
  [["모닥불"], "🔥"],
  [["요리", "식자재"], "🍳"],
  [["저녁 모임", "함께하는 식사", "함께 식사"], "🍱"],
  [["대게", "해산물"], "🦀"],
  [["바닷가", "바다"], "🌊"],
  [["텃밭", "밭"], "🌱"],
  [["별 관측", "별"], "⭐"],
  [["목공", "공예"], "🪵"],
  [["창작", "작업실"], "🛠️"],
  [["워케이션", "원격"], "💻"],
  [["들판", "피크닉"], "🌾"],
  [["느린", "루틴"], "🌤️"],
  [["공동 프로젝트", "협업"], "🤝"],
  [["창업"], "💡"],
  [["교류", "마을 주민", "주민"], "🗣️"],
  [["워크숍"], "📋"],
  [["공동 거주", "거주"], "🏘️"],
  [["네트워킹"], "🔗"],
  [["코워킹"], "🖥️"],
  [["독립 작업"], "✍️"],
  [["커뮤니티"], "☕"],
  [["산책"], "🚶"],
  [["사색"], "🍃"],
];

export function programIcon(label: string): string {
  for (const [keywords, icon] of PROGRAM_ICON_RULES) {
    if (keywords.some((k) => label.includes(k))) return icon;
  }
  return "✦";
}

// 후기 평균 별점 (소수 첫째자리). 후기 없으면 4.5 (안전 폴백)
export function avgRating(id: string): number {
  const reviews = residenceContent[id]?.reviews;
  if (!reviews || reviews.length === 0) return 4.5;
  const sum = reviews.reduce((acc, r) => acc + r.stars, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}
