// 미션별 발견 정보 — 사용자가 미션을 통해 알게 된 핵심 사실 한 줄
// 선택과 무관하게 NPC 대사에서 공통으로 전달되는 정보만 모았어요.
// 이주 결정 리포트의 "미션에서 발견한 것" 섹션에서 사용.

export type MissionInsight = {
  icon: string;
  category: string;  // "의료 접근성" / "교통" 등 짧은 라벨
  headline: string;  // 한 줄 핵심 — 굵게 표시
  detail: string;    // 보조 설명 한 줄
};

export const missionInsights: Record<string, MissionInsight> = {
  hospital: {
    icon: "🏥",
    category: "의료 접근성",
    headline: "병원까지 도보 12분, 응급실 24시간",
    detail: "약국이 병원 바로 옆 — 도시 대비 1시간 빠른 응급 대응.",
  },
  market: {
    icon: "🛒",
    category: "전통시장",
    headline: "채소·해산물 30% 저렴, 오후 5시 마감",
    detail: "계절 채소만 시장에서 사도 한 달 식비 약 15만원 절약.",
  },
  cost: {
    icon: "💰",
    category: "한 달 생활비",
    headline: "검소 65 / 적당 80 / 여유 110만원",
    detail: "도시의 약 절반. 차가 있으면 월 15만원 추가 예상.",
  },
  transit: {
    icon: "🚌",
    category: "교통",
    headline: "시내 버스 35분 배차, 막차 21:30",
    detail: "동네 안은 자전거로 도착. 시내·마트·병원 차로 10분.",
  },
  routine: {
    icon: "📝",
    category: "하루 리듬",
    headline: "밤 10시면 잠드는 동네",
    detail: "도시에선 못 누리는 깊은 잠과 천천히 흐르는 하루.",
  },
  food: {
    icon: "🍽️",
    category: "식비",
    headline: "동네 평균 1일 9,500원",
    detail: "도시(1만 4천원) 대비 약 32% 낮음 — 외식 줄어드는 게 가장 큼.",
  },
  shop: {
    icon: "🏪",
    category: "관계 형성",
    headline: "5번 방문이면 단골",
    detail: "인사만 해도 동네 사람 — 도시에서 어려운 친밀함.",
  },
  neighbor: {
    icon: "🤝",
    category: "먼저 온 이주민의 말",
    headline: "첫 3개월 적응, 4개월부터 안정",
    detail: "첫 겨울이 가장 어렵지만 봄부터 다시 좋아짐.",
  },
  mailbox: {
    icon: "📮",
    category: "동네 분위기",
    headline: "주민들의 일상 이야기 한 통",
    detail: "편지로 전해진 이 동네 사람들의 마음.",
  },
};
