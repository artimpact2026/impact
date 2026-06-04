// 추천 레지던스 + 전체 레지던스 (PRD 떠나기 화면 토글, 추천/전체 분기)
// 추후 백엔드 API 연결 시 매칭 알고리즘 결과로 교체

// xPct / yPct는 KoreaMap(/korea-map.png, 남한 지도) 내부 상대 좌표(%)
// 'recommended' = true는 떠나기 화면의 "추천" 토글에 노출
// 가격은 월 단위(만원), price는 mock

export type LifeStyleType =
  | "레저형"
  | "자연탐험형"
  | "디지털노마드형"
  | "집돌이형";

export type Residence = {
  id: string;
  region: string;
  name: string;
  duration: string;
  matchType: LifeStyleType;
  matchReason: string;
  xPct: number;
  yPct: number;
  themeEmoji: string;
  // 보강 필드 — Optional이라 기존 화면 호환
  recommended?: boolean;     // 추천 지역
  price?: number;            // 월 비용 (만원)
  hasSupport?: boolean;      // 정부 지원금 여부
  blurb?: string;            // 한 줄 소개
  capacity?: number;         // 정원 (명)
  contactUrl?: string;       // 신청/문의 외부 링크 (mock)
  provides?: string[];       // 제공 사항
};

const FALLBACK_URL = "https://example.com/residence-apply";

export const residences: Residence[] = [
  // ─── 추천 3개 ─────────────────────────────
  {
    id: "ganghwa",
    region: "강화도",
    name: "강화 잠시섬 하우스",
    duration: "4박 5일",
    matchType: "자연탐험형",
    matchReason: "조용한 분위기와 산책 코스를 선호하는 당신에게 잘 맞아요",
    xPct: 30.9,
    yPct: 19.3,
    themeEmoji: "🌿",
    recommended: true,
    price: 38,
    hasSupport: true,
    blurb: "갯벌과 한옥이 어우러진 섬마을 한 달 살기",
    capacity: 6,
    contactUrl: FALLBACK_URL,
    provides: ["조식", "자전거", "주민 모임", "와이파이"],
  },
  {
    id: "gwangyang",
    region: "광양",
    name: "광양 매화마을 레지던스",
    duration: "5박 6일",
    matchType: "디지털노마드형",
    matchReason: "느린 호흡 속에서 일과 쉼이 함께 흐르는 곳이에요",
    xPct: 53.7,
    yPct: 74.1,
    themeEmoji: "🌸",
    recommended: true,
    price: 42,
    hasSupport: false,
    blurb: "매화 향기와 작업실, 일과 쉼의 균형",
    capacity: 4,
    contactUrl: FALLBACK_URL,
    provides: ["전용 작업실", "와이파이", "주방", "프린터"],
  },
  {
    id: "geoje",
    region: "거제도",
    name: "거제 바람마루 하우스",
    duration: "4박 5일",
    matchType: "레저형",
    matchReason: "바닷가 산책과 액티비티를 즐기는 당신을 위해",
    xPct: 62.2,
    yPct: 79.8,
    themeEmoji: "🌊",
    recommended: true,
    price: 45,
    hasSupport: true,
    blurb: "거제 앞바다, 카약과 등산로가 가까운 곳",
    capacity: 8,
    contactUrl: FALLBACK_URL,
    provides: ["조식", "수상 액티비티", "등산 가이드", "와이파이"],
  },

  // ─── 전체(추가 12개) ─────────────────────────
  {
    id: "tongyeong",
    region: "통영",
    name: "통영 동피랑 게스트하우스",
    duration: "3박 4일",
    matchType: "레저형",
    matchReason: "예술 마을과 바다 풍경을 모두 가까이",
    xPct: 58.6,
    yPct: 79.4,
    themeEmoji: "🎨",
    recommended: false,
    price: 36,
    hasSupport: false,
    blurb: "벽화마을과 바다가 어우러진 작은 항구도시",
    capacity: 4,
    contactUrl: FALLBACK_URL,
    provides: ["조식", "주변 투어", "와이파이"],
  },
  {
    id: "namhae",
    region: "남해",
    name: "남해 죽방마을 한옥",
    duration: "5박 6일",
    matchType: "자연탐험형",
    matchReason: "다랭이논과 죽방렴을 따라 걷는 시간",
    xPct: 52.1,
    yPct: 80.1,
    themeEmoji: "🏞️",
    recommended: false,
    price: 40,
    hasSupport: true,
    blurb: "다랭이논 풍경과 전통 어로 문화 체험",
    capacity: 6,
    contactUrl: FALLBACK_URL,
    provides: ["조식", "전통 한옥", "주민 워크숍"],
  },
  {
    id: "jindo",
    region: "진도",
    name: "진도 운림산방 스테이",
    duration: "4박 5일",
    matchType: "집돌이형",
    matchReason: "조용한 섬에서 그림과 차를 마시며 쉬어가는 곳",
    xPct: 24.2,
    yPct: 80.9,
    themeEmoji: "🌅",
    recommended: true,
    price: 34,
    hasSupport: false,
    blurb: "한국화의 고향, 운림산방 인근 한옥 스테이",
    capacity: 4,
    contactUrl: FALLBACK_URL,
    provides: ["다도 체험", "전통 한옥", "조식"],
  },
  {
    id: "wando",
    region: "완도",
    name: "완도 청산도 슬로우 빌리지",
    duration: "5박 6일",
    matchType: "자연탐험형",
    matchReason: "느린 섬, 슬로시티 인증 마을에서의 한 주",
    xPct: 33.6,
    yPct: 81.4,
    themeEmoji: "🐚",
    recommended: false,
    price: 38,
    hasSupport: true,
    blurb: "슬로시티 청산도, 보리밭 사이를 걷는 한 주",
    capacity: 5,
    contactUrl: FALLBACK_URL,
    provides: ["자전거", "트레킹 가이드", "조식"],
  },
  {
    id: "yeonggwang",
    region: "영광",
    name: "영광 백수 해안도로 하우스",
    duration: "4박 5일",
    matchType: "레저형",
    matchReason: "노을이 아름다운 해안도로를 따라 달리는 곳",
    xPct: 26.4,
    yPct: 63.0,
    themeEmoji: "🌇",
    recommended: false,
    price: 32,
    hasSupport: false,
    blurb: "백수 해안도로의 노을 명소, 라이딩 코스 인근",
    capacity: 4,
    contactUrl: FALLBACK_URL,
    provides: ["자전거", "조식", "와이파이"],
  },
  {
    id: "gunsan",
    region: "군산",
    name: "군산 근대거리 라이프",
    duration: "3박 4일",
    matchType: "디지털노마드형",
    matchReason: "근대 건축과 카페가 어우러진 작업 친화 도시",
    xPct: 28.6,
    yPct: 56.9,
    themeEmoji: "🏛️",
    recommended: false,
    price: 35,
    hasSupport: false,
    blurb: "근대 건축이 남은 골목, 카페·작업 공간 풍부",
    capacity: 4,
    contactUrl: FALLBACK_URL,
    provides: ["전용 작업실", "프린터", "와이파이"],
  },
  {
    id: "buan",
    region: "부안",
    name: "부안 변산반도 스테이",
    duration: "5박 6일",
    matchType: "자연탐험형",
    matchReason: "변산반도 국립공원, 산과 바다를 함께",
    xPct: 27.3,
    yPct: 60.1,
    themeEmoji: "🏖️",
    recommended: false,
    price: 38,
    hasSupport: true,
    blurb: "변산 채석강 일원, 산과 바다가 가까운 휴식처",
    capacity: 5,
    contactUrl: FALLBACK_URL,
    provides: ["트레킹 가이드", "조식", "와이파이"],
  },
  {
    id: "boryeong",
    region: "보령",
    name: "보령 죽도 무인섬 캠프",
    duration: "2박 3일",
    matchType: "레저형",
    matchReason: "무인도 체험과 머드 페스티벌의 도시",
    xPct: 25.3,
    yPct: 51.2,
    themeEmoji: "🌊",
    recommended: false,
    price: 30,
    hasSupport: false,
    blurb: "갯벌과 무인섬 체험, 짧고 강한 자연 액티비티",
    capacity: 8,
    contactUrl: FALLBACK_URL,
    provides: ["수상 액티비티", "조식"],
  },
  {
    id: "taean",
    region: "태안",
    name: "태안 만리포 빌리지",
    duration: "4박 5일",
    matchType: "레저형",
    matchReason: "서핑과 해변 산책이 일상이 되는 곳",
    xPct: 19.7,
    yPct: 44.4,
    themeEmoji: "🏄",
    recommended: true,
    price: 40,
    hasSupport: false,
    blurb: "만리포 해변 앞, 서핑·해변 산책 친화 스테이",
    capacity: 6,
    contactUrl: FALLBACK_URL,
    provides: ["서핑 강습", "조식", "와이파이"],
  },
  {
    id: "yeongwol",
    region: "영월",
    name: "영월 별마로 천문대 스테이",
    duration: "3박 4일",
    matchType: "자연탐험형",
    matchReason: "밤하늘과 동강이 가까운 깊은 산속 마을",
    xPct: 63.1,
    yPct: 35.8,
    themeEmoji: "✨",
    recommended: true,
    price: 36,
    hasSupport: true,
    blurb: "동강과 별마로 천문대, 밤하늘이 일상이 되는 곳",
    capacity: 4,
    contactUrl: FALLBACK_URL,
    provides: ["천문 관측", "조식", "트레킹"],
  },
  {
    id: "jeongseon",
    region: "정선",
    name: "정선 화암 깊은산 한옥",
    duration: "5박 6일",
    matchType: "집돌이형",
    matchReason: "깊은 산속, 외부와 단절된 조용한 한 주",
    xPct: 67.1,
    yPct: 30.8,
    themeEmoji: "⛰️",
    recommended: true,
    price: 42,
    hasSupport: false,
    blurb: "화암동굴 인근 산속 한옥, 완전한 고요",
    capacity: 4,
    contactUrl: FALLBACK_URL,
    provides: ["다도 체험", "전통 한옥", "조식"],
  },
  {
    id: "yangyang",
    region: "양양",
    name: "양양 인구해변 워케이션",
    duration: "1주",
    matchType: "디지털노마드형",
    matchReason: "서핑 성지에서 일하고 쉬는 워케이션",
    xPct: 72.0,
    yPct: 22.9,
    themeEmoji: "🌊",
    recommended: true,
    price: 55,
    hasSupport: true,
    blurb: "서핑 성지 양양, 코워킹·해변 동시에",
    capacity: 6,
    contactUrl: FALLBACK_URL,
    provides: ["전용 작업실", "서핑 강습", "와이파이", "조식"],
  },
  {
    id: "hadong",
    region: "하동",
    name: "하동 화개골 차밭 한옥",
    duration: "5박 6일",
    matchType: "자연탐험형",
    matchReason: "지리산 자락 차밭과 섬진강의 봄",
    xPct: 50.6,
    yPct: 72.6,
    themeEmoji: "🍃",
    recommended: false,
    price: 38,
    hasSupport: true,
    blurb: "지리산 자락 차밭, 섬진강 봄꽃길이 가까운 한옥",
    capacity: 5,
    contactUrl: FALLBACK_URL,
    provides: ["다도 체험", "전통 한옥", "조식"],
  },
];

// 추천만 필터한 배열 — 떠나기 화면 기본 노출
export const recommendedResidences = residences.filter((r) => r.recommended);

// 매칭 점수 (사용자 라이프스타일과의 일치도, 0-100)
export function matchScore(
  lifestyle: LifeStyleType | null | undefined,
  residence: Residence
): number {
  if (!lifestyle) return 65;
  if (lifestyle === residence.matchType) return 92;
  return 65;
}
