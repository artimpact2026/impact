// 청풍 온보딩 — 10단계 답안 → 라이프스타일 유형 산출
// 라이프스타일 4유형: 레저형 / 자연탐험형 / 디지털노마드형 / 집돌이형

import type { LifeStyleType } from "./residences";

// =====================================================================
// OnboardingData — 사용자가 채워가는 누적 답안
// =====================================================================

export type BalanceA = "mountain" | "sea";
export type BalanceB = "read" | "chat";
export type BalanceC = "hanok" | "modern";

export type OnboardingData = {
  email: string;
  birth: { year: string; month: string; day: string };
  homeRegion: string;              // 현재 거주 지역 (서울/부산/...)
  interests: string[];            // 취미/관심사 (multi)
  balanceA?: BalanceA;             // 산 vs 바다
  balanceB?: BalanceB;             // 혼자 책 vs 친구와 수다
  balanceC?: BalanceC;             // 한옥민박 vs 모던게스트하우스
  values: string[];                // 소중히 여기는 가치 (multi, max 5)
  dayScene?: string;               // 풍경의 하루 (single)
  healing?: string;                // 힐링 (single)
  regionDesc: string;              // 살고싶은 지역의 특징 (주관식)
};

export const initialOnboardingData: OnboardingData = {
  email: "",
  birth: { year: "", month: "", day: "" },
  homeRegion: "",
  interests: [],
  values: [],
  regionDesc: "",
};

// =====================================================================
// 옵션 목록 — 각 객관식 화면에서 사용
// =====================================================================

// 취미/관심사 칩 (단순 수집용 — 스코어링에 영향 X)
export const interestOptions: string[] = [
  "영화", "독서", "공연", "전시", "음악", "여행",
  "맛집투어", "캠핑", "반려동물", "뜨개질", "공예",
  "러닝", "바이크", "테니스", "등산", "요가/명상",
];

// 가치 칩 (multi, max 5)
export const valueOptions: { label: string; weight: Partial<Record<LifeStyleType, number>> }[] = [
  { label: "건강", weight: { 자연탐험형: 1 } },
  { label: "시간", weight: { 디지털노마드형: 1 } },
  { label: "자기계발", weight: { 디지털노마드형: 1 } },
  { label: "도전", weight: { 레저형: 1 } },
  { label: "안정감", weight: { 집돌이형: 1 } },
  { label: "자기 표현", weight: { 디지털노마드형: 1 } },
  { label: "가족", weight: { 집돌이형: 1 } },
  { label: "우정", weight: { 레저형: 1 } },
  { label: "공동체", weight: { 레저형: 1 } },
  { label: "봉사/나눔", weight: { 자연탐험형: 1 } },
  { label: "취미생활", weight: { 디지털노마드형: 1 } },
  { label: "자기관리", weight: { 집돌이형: 1 } },
  { label: "사랑", weight: { 레저형: 1 } },
  { label: "사회적 영향력", weight: { 디지털노마드형: 1 } },
];

// 풍경의 하루 (single)
export type DaySceneOption = { label: string; weight: Partial<Record<LifeStyleType, number>> };
export const dayScenes: DaySceneOption[] = [
  {
    label: "새벽 안개 속에서 천천히 산책하기",
    weight: { 자연탐험형: 3 },
  },
  {
    label: "카페에서 일하고 점심엔 도시락",
    weight: { 디지털노마드형: 3 },
  },
  {
    label: "작업실에서 작업, 저녁엔 시장 들르기",
    weight: { 디지털노마드형: 2, 자연탐험형: 1 },
  },
  {
    label: "친구들과 늦은 점심, 바닷가 산책",
    weight: { 레저형: 3 },
  },
  {
    label: "텃밭 가꾸고 조용한 저녁 보내기",
    weight: { 집돌이형: 3 },
  },
];

// 힐링 (single)
export type HealingOption = { label: string; weight: Partial<Record<LifeStyleType, number>> };
export const healings: HealingOption[] = [
  { label: "완전한 고요", weight: { 집돌이형: 3 } },
  {
    label: "마음 맞는 사람과의 대화",
    weight: { 레저형: 2, 디지털노마드형: 1 },
  },
  { label: "가벼운 산책", weight: { 자연탐험형: 3 } },
  {
    label: "따뜻한 차 한 잔",
    weight: { 집돌이형: 2, 자연탐험형: 1 },
  },
  { label: "푹 자기", weight: { 집돌이형: 3 } },
];

// =====================================================================
// 라이프스타일 유형 메타 — ResultScreen에서 사용
// =====================================================================

export const lifestyleMeta: Record<
  LifeStyleType,
  { emoji: string; tagline: string; description: string }
> = {
  레저형: {
    emoji: "🌊",
    tagline: "움직임으로 풀리는 사람",
    description:
      "몸을 움직이고 새로운 경험을 즐기는 당신. 활동적인 자연이 있는 지역이 잘 맞아요.",
  },
  자연탐험형: {
    emoji: "🌿",
    tagline: "계절의 결을 모으는 사람",
    description:
      "느린 호흡 속에서 자연을 관찰하는 당신. 산과 들이 가까운 곳에서 충전돼요.",
  },
  디지털노마드형: {
    emoji: "💻",
    tagline: "일과 쉼의 균형을 짓는 사람",
    description:
      "어디서나 일하지만 쉼은 도시 밖에서 찾는 당신. 작업과 자연이 공존하는 곳이 좋아요.",
  },
  집돌이형: {
    emoji: "🏠",
    tagline: "자기만의 리듬이 또렷한 사람",
    description:
      "익숙한 공간에서 안정감을 찾는 당신. 한적하고 자기 페이스대로 살기 좋은 곳이 어울려요.",
  },
};

// =====================================================================
// 스코어링 — 답안 데이터 → 라이프스타일 유형
// =====================================================================

export function scoreOnboarding(data: OnboardingData): LifeStyleType {
  const tally: Record<LifeStyleType, number> = {
    레저형: 0,
    자연탐험형: 0,
    디지털노마드형: 0,
    집돌이형: 0,
  };

  // balanceA (산 vs 바다)
  if (data.balanceA === "mountain") tally.자연탐험형 += 2;
  if (data.balanceA === "sea") tally.레저형 += 2;

  // balanceB (책 vs 수다)
  if (data.balanceB === "read") {
    tally.집돌이형 += 1;
    tally.디지털노마드형 += 1;
  }
  if (data.balanceB === "chat") {
    tally.레저형 += 1;
    tally.자연탐험형 += 1;
  }

  // balanceC (한옥 vs 모던)
  if (data.balanceC === "hanok") {
    tally.자연탐험형 += 1;
    tally.집돌이형 += 1;
  }
  if (data.balanceC === "modern") tally.디지털노마드형 += 2;

  // values (multi)
  for (const v of data.values) {
    const opt = valueOptions.find((o) => o.label === v);
    if (!opt) continue;
    for (const [k, w] of Object.entries(opt.weight) as [
      LifeStyleType,
      number
    ][]) {
      tally[k] += w;
    }
  }

  // dayScene (single)
  if (data.dayScene) {
    const opt = dayScenes.find((d) => d.label === data.dayScene);
    if (opt) {
      for (const [k, w] of Object.entries(opt.weight) as [
        LifeStyleType,
        number
      ][]) {
        tally[k] += w;
      }
    }
  }

  // healing (single)
  if (data.healing) {
    const opt = healings.find((h) => h.label === data.healing);
    if (opt) {
      for (const [k, w] of Object.entries(opt.weight) as [
        LifeStyleType,
        number
      ][]) {
        tally[k] += w;
      }
    }
  }

  // 최고점 유형 (동점 시 자연탐험형 기본)
  let best: LifeStyleType = "자연탐험형";
  let max = -1;
  for (const k of Object.keys(tally) as LifeStyleType[]) {
    if (tally[k] > max) {
      max = tally[k];
      best = k;
    }
  }
  return best;
}
