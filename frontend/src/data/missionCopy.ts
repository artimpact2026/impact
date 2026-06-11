// 미션 카드/정보 화면 공용 — 설명 + 호기심 카피.
// 카드: curiosityFor() — 박스 안 부제 한 줄용 (짧게, MISSION_INFO 의 curiosity 우선).
// 정보 화면: infoCopyFor() — 설명(2-3줄) + 호기심 둘다 반환.
//
// MISSION_INFO 에 없는 미션은 mission.description / 자동 생성 폴백.
// 현재 채워둔 항목 = 강화도 Phase A 플랜에 들어가는 14개 미션.

import type { Mission } from "./missions";

type InfoCopy = {
  description: string; // 정보 화면 "설명" 영역 — 2-3줄
  curiosity: string;   // 정보 화면 "호기심" + 카드 부제 공용
};

const MISSION_INFO: Record<string, InfoCopy> = {
  // ===== 공통 미션 (강화 플랜에서 사용되는 것) =====
  hospital: {
    description:
      "걸어서 병원까지 가는 동선을 따라 거리·시간을 직접 체감해보세요. 동네 어르신과 길을 걸으며, 도시였다면 한 시간 잡았을 일이 여기선 얼마나 다른지 마주합니다. 24시간 응급실 운영 여부도 함께 확인해요.",
    curiosity: "응급 상황엔 어디로, 얼마나 걸려서 갈까?",
  },
  market: {
    description:
      "동네 식당에 들러 한 끼 7천원짜리 백반 한 상을 받아봅니다. 식당 아주머니의 이야기를 들으며 도시 절반의 식비, 배달이 잘 안 오는 동네의 식생활을 직접 느끼는 시간이에요.",
    curiosity: "한 끼 7천원, 매일 사 먹어도 부담 없을까?",
  },
  cost: {
    description:
      "월세·식비·통신비·교통비를 정리해 한 달 살림을 구체적으로 그려봅니다. 먼저 이주한 이웃의 1년치 데이터를 토대로 검소형·평균형·여유형 세 시나리오를 비교해요.",
    curiosity: "이 동네에서 한 달, 얼마면 살 수 있을까?",
  },
  transit: {
    description:
      "버스 배차, 시내 진출 시간, KTX·공항까지의 거리를 짚어봅니다. 마을 안내원에게 자전거·차 없는 생활이 가능한지 물어보고, 출퇴근이 사라진 삶의 윤곽을 그려보는 시간이에요.",
    curiosity: "버스 한 대 놓치면 얼마나 기다려야 할까?",
  },
  routine: {
    description:
      "여기서의 하루를 머릿속에 구체적으로 그려봅니다. 아침 7시 풍경부터 저녁 약속, 밤 10시의 적막까지 — 레지던스 호스트와 함께 나에게 맞는 리듬을 찾아봐요.",
    curiosity: "여기서의 하루, 나에게 어떤 모습일까?",
  },
  food: {
    description:
      "이 동네 하루 세 끼 식비를 도시 감각으로 추측해보고, 실제 마을 평균·도시 평균과 비교해봅니다. 시장에서 직접 해 먹기 시작했을 때의 절약 폭도 함께 짚어요.",
    curiosity: "도시 감각으로 추측한 식비, 얼마나 맞을까?",
  },
  shop: {
    description:
      "30년 자리를 지킨 동네 분식집에 들릅니다. 떡볶이 한 그릇을 사이에 두고 단골이 된다는 감각, 동네의 인사 문화, 도시에선 못 느끼는 친밀함의 결을 듣게 돼요.",
    curiosity: "단골이 된다는 건 어떤 느낌일까?",
  },
  neighbor: {
    description:
      "1년 차 이주민의 솔직한 이야기를 듣습니다. 첫 3개월의 답답함, 4개월 차의 전환, 1년이 지난 지금의 만족을 직접 들으며 적응 곡선을 미리 그려봐요.",
    curiosity: "처음 보는 이웃이 나에게 뭐라고 할까?",
  },
  mailbox: {
    description:
      "오늘 도착한 편지 한 통을 열어봅니다. 동네 주민이 익명으로 적은 짧은 글 — 한 줄로 동네의 마음을 들여다보는 시간이에요. 매일 한 장씩 쌓여요.",
    curiosity: "오늘 도착한 편지엔 무슨 말이 적혀있을까?",
  },

  // ===== 강화 지역 미션 =====
  "ganghwa-mudflat": {
    description:
      "썰물 시간의 동막해수욕장 갯벌로 걸어 들어갑니다. 발이 푹푹 빠지는 진흙, 바람, 멀리 보이는 수평선 — 강화의 가장 강한 풍경을 직접 마주하는 시간이에요.",
    curiosity: "발 밑이 푹 꺼지는 갯벌, 정말 걸을 수 있을까?",
  },
  "ganghwa-dolmen": {
    description:
      "유네스코 세계유산으로 등재된 강화 부근리 고인돌 곁에 서봅니다. 4천 년의 시간이 굳어 있는 돌 앞에서, 역사 해설사의 짧은 이야기로 강화 땅의 깊이를 가늠해요.",
    curiosity: "4천 년 전 돌 앞에 서면 어떤 기분일까?",
  },
  "ganghwa-farm": {
    description:
      "동네 사람들이 같이 일구는 텃밭에 한 평 빌려봅니다. 농사 선배의 손을 빌려 한 줄 심어보고, '같이 키운다'는 감각이 도시의 어떤 모임과도 다른지 느끼는 시간이에요.",
    curiosity: "텃밭 한 평, 동네 사람들과 같이 키운다는 건?",
  },
  "ganghwa-market": {
    description:
      "아삭아삭 순무민박에서 강화풍물시장까지 골목을 따라 걸어 들어갑니다. 강화 대표 시장 안에서 사장님과 이야기 나누며 매대의 풍경·인심·물가를 한 번에 짚어요.",
    curiosity: "5일장 사장님, 처음 본 손님에게 뭐라고 할까?",
  },
  "ganghwa-sunset": {
    description:
      "동막해변·석모도 일몰 명소로 걸어 나갑니다. 마을 산책자와 함께 해가 떨어지는 시간을 기다리며 하루를 천천히 마무리하는, 강화에서 가장 흔하지만 가장 특별한 의식이에요.",
    curiosity: "여기 일몰, 매일 봐도 질리지 않을까?",
  },
};

// 정보 화면 — 설명 + 호기심 둘다 반환. MISSION_INFO 우선, 없으면 mission 필드 / 자동 생성.
export function infoCopyFor(m: Mission): InfoCopy {
  if (MISSION_INFO[m.id]) return MISSION_INFO[m.id];
  return {
    description: m.description ?? "",
    curiosity: curiosityFallback(m),
  };
}

// 카드 부제 — MISSION_INFO 있으면 그쪽 curiosity, 없으면 description / 자동 생성.
export function curiosityFor(m: Mission): string {
  if (MISSION_INFO[m.id]) return MISSION_INFO[m.id].curiosity;
  return curiosityFallback(m);
}

function curiosityFallback(m: Mission): string {
  if (m.description) return m.description;
  switch (m.category) {
    case "생활현실형":
      return `${m.title} — 서울이랑 어떻게 다를까?`;
    case "관계형성형":
      return `${m.title} — 어떤 사람을 만나게 될까?`;
    default:
      return `${m.title} — 어떤 분위기일까?`;
  }
}
