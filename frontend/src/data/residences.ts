// 청풍 추천 청년마을 8개 카탈로그
// 행정안전부 청년마을 프로그램 + 청풍 시뮬레이션용 mock 데이터
//
// xPct / yPct는 KoreaMap(public/korea-map.png) 내부 상대 좌표(%)
// 좌상단 (0%, 0%) → 우하단 (100%, 100%) 기준, 남한+제주 일러스트
// 가격은 월 단위(만원), price는 mock

import type { EnvType, Stance } from "./lifestyle";

// 옛 LifeStyleType — 미션 옵션 traits 호환용 (점진 마이그레이션)
export type LifeStyleType =
  | "레저형"
  | "자연탐험형"
  | "디지털노마드형"
  | "집돌이형";

export type Residence = {
  id: string;
  region: string;
  name: string;             // 청년마을 브랜드명
  duration: string;
  // 옛 매칭 (호환용 — 미션 traits 점진 마이그레이션 위해 유지)
  matchType: LifeStyleType;
  matchReason: string;
  xPct: number;
  yPct: number;
  themeEmoji: string;
  // 새 매칭 (v2)
  envType: EnvType;         // 환경 유형 — 추천 매칭 메인
  stance: Stance;           // 주된 자세 — 추천 매칭 부제
  stanceAlt?: Stance[];     // 보조로 어울리는 자세
  isYouthVillage?: boolean; // 청년마을 프로그램 여부
  // 보강 필드 — Optional
  recommended?: boolean;    // 떠나기 추천 토글 노출
  price?: number;           // 월 비용 (만원)
  hasSupport?: boolean;     // 정부 지원금
  blurb?: string;           // 한 줄 소개
  capacity?: number;        // 정원 (명)
  contactUrl?: string;      // 신청 외부 링크 (mock)
  provides?: string[];      // 제공 사항
  // 카카오 로드뷰 fallback 좌표 — 마을 중심부.
  // 미션 개별 kakaoPosition 이 없을 때 이 좌표를 써서 로드뷰를 띄움.
  // (모든 map-* 미션이 좌표 없어도 실제 로드뷰가 뜨도록 보장)
  kakaoPosition?: { lat: number; lng: number };
};

const FALLBACK_URL = "https://www.youthvillage.kr";

export const residences: Residence[] = [
  // ─── 🌊 바다 2 ──────────────────────────────
  {
    id: "ganghwa",
    region: "강화도",
    name: "청풍",
    duration: "3박 4일",
    matchType: "자연탐험형",
    matchReason: "갯벌과 한옥, 사람들과 함께 쉬어가는 시간이 어울려요",
    xPct: 23,
    yPct: 18,
    themeEmoji: "🌿",
    envType: "sea",
    stance: "together_rest",
    stanceAlt: ["alone_rest"],
    isYouthVillage: true,
    recommended: true,
    price: 38,
    hasSupport: true,
    blurb: "갯벌과 한옥이 어우러진 섬마을 잠시 살기",
    capacity: 6,
    contactUrl: FALLBACK_URL,
    provides: ["조식", "자전거", "주민 모임", "와이파이"],
    kakaoPosition: { lat: 37.7468, lng: 126.4845 }, // 강화 읍내
  },
  {
    id: "yeongdeok",
    region: "영덕",
    name: "뚜벅이마을",
    duration: "4박 5일",
    matchType: "자연탐험형",
    matchReason: "해안 트레킹과 천천히 걷는 시간이 어울려요",
    xPct: 68,
    yPct: 50,
    themeEmoji: "🥾",
    envType: "sea",
    stance: "alone_rest",
    stanceAlt: ["together_rest"],
    isYouthVillage: true,
    recommended: true,
    price: 36,
    hasSupport: true,
    blurb: "해파랑길 따라 두 발로 한 동네",
    capacity: 6,
    contactUrl: FALLBACK_URL,
    provides: ["조식", "트레킹 가이드", "공용공간", "와이파이"],
    kakaoPosition: { lat: 36.4146, lng: 129.3650 }, // 영덕읍
  },

  // ─── 🏔 산 2 ────────────────────────────────
  {
    id: "yeongwol",
    region: "영월",
    name: "밭멍",
    duration: "5박 6일",
    matchType: "자연탐험형",
    matchReason: "혼자 밭에서 멍 때리는 시간이 회복이 돼요",
    xPct: 55,
    yPct: 38,
    themeEmoji: "🌱",
    envType: "mountain",
    stance: "alone_rest",
    stanceAlt: ["together_rest"],
    isYouthVillage: true,
    recommended: true,
    price: 34,
    hasSupport: true,
    blurb: "산 사이 밭과 동강, 멍 때리는 일상",
    capacity: 8,
    contactUrl: FALLBACK_URL,
    provides: ["조식", "텃밭 체험", "공용공간", "주민 모임"],
    kakaoPosition: { lat: 37.1836, lng: 128.4612 }, // 영월읍
  },
  {
    id: "muju",
    region: "무주",
    name: "산타지",
    duration: "5박 6일",
    matchType: "디지털노마드형",
    matchReason: "덕유산 자락에서 혼자 무언가 만들고 빚는 시간",
    xPct: 47,
    yPct: 53,
    themeEmoji: "🏔️",
    envType: "mountain",
    stance: "alone_make",
    stanceAlt: ["alone_rest"],
    isYouthVillage: true,
    recommended: true,
    price: 42,
    hasSupport: true,
    blurb: "덕유산 자락, 같이 만들고 같이 노는 산골",
    capacity: 8,
    contactUrl: FALLBACK_URL,
    provides: ["조식", "프로그램 운영", "공용 작업실", "공동체 모임"],
    kakaoPosition: { lat: 36.0066, lng: 127.6611 }, // 무주읍
  },

  // ─── 🌾 들 2 ────────────────────────────────
  {
    id: "sejong",
    region: "세종 연서",
    name: "농땡이월드",
    duration: "4박 5일",
    matchType: "집돌이형",
    matchReason: "들녘 분위기 속 농땡이 부리며 어울리는 시간",
    xPct: 38,
    yPct: 40,
    themeEmoji: "🌾",
    envType: "field",
    stance: "together_rest",
    stanceAlt: ["alone_rest"],
    isYouthVillage: true,
    recommended: true,
    price: 32,
    hasSupport: true,
    blurb: "세종 연서 들녘, 농땡이 부리는 청년 마을",
    capacity: 6,
    contactUrl: FALLBACK_URL,
    provides: ["조식", "공용공간", "주민 모임", "와이파이"],
    kakaoPosition: { lat: 36.5878, lng: 127.2400 }, // 세종 연서면
  },
  {
    id: "uiseong",
    region: "의성",
    name: "나만의성",
    duration: "5박 6일",
    matchType: "레저형",
    matchReason: "들녘 한가운데 함께 모여 무언가 짓는 시간",
    xPct: 60,
    yPct: 50,
    themeEmoji: "🏰",
    envType: "field",
    stance: "together_make",
    stanceAlt: ["together_rest"],
    isYouthVillage: true,
    recommended: true,
    price: 38,
    hasSupport: true,
    blurb: "의성 들녘, 나만의 성 같은 작업실",
    capacity: 4,
    contactUrl: FALLBACK_URL,
    provides: ["전용 작업실", "조식", "프린터", "와이파이"],
    kakaoPosition: { lat: 36.3527, lng: 128.6973 }, // 의성읍
  },

  // ─── 🏘 도시 2 ──────────────────────────────
  {
    id: "hongseong",
    region: "홍성",
    name: "집단지성",
    duration: "5박 6일",
    matchType: "레저형",
    matchReason: "함께 모여 사업·기획을 짓는 청년 커뮤니티",
    xPct: 32,
    yPct: 42,
    themeEmoji: "💡",
    envType: "village",
    stance: "together_make",
    stanceAlt: ["alone_make"],
    isYouthVillage: true,
    recommended: true,
    price: 36,
    hasSupport: true,
    blurb: "홍성 도심, 함께 짓는 청년 커뮤니티",
    capacity: 8,
    contactUrl: FALLBACK_URL,
    provides: ["코워킹", "공용공간", "주민 모임", "와이파이"],
    kakaoPosition: { lat: 36.6018, lng: 126.6604 }, // 홍성읍
  },
  {
    id: "daejeon",
    region: "대전 중구",
    name: "weave on",
    duration: "4박 5일",
    matchType: "디지털노마드형",
    matchReason: "도심 골목에서 혼자 짜고 이어가는 시간",
    xPct: 40,
    yPct: 47,
    themeEmoji: "🧵",
    envType: "village",
    stance: "alone_make",
    stanceAlt: ["together_make"],
    isYouthVillage: true,
    recommended: true,
    price: 40,
    hasSupport: false,
    blurb: "대전 중촌동, 짜는 일·만드는 일을 잇는 도심 마을",
    capacity: 5,
    contactUrl: FALLBACK_URL,
    provides: ["전용 작업실", "공용공간", "프린터", "와이파이"],
    kakaoPosition: { lat: 36.3258, lng: 127.4216 }, // 대전 중구 (중촌동)
  },
];

// 추천만 필터한 배열 — 떠나기 화면 기본 노출
export const recommendedResidences = residences.filter((r) => r.recommended);

// 매칭 점수 (사용자 라이프스타일과의 일치도, 0-100) — 옛 호환용
// 새 추천 점수는 lifestyle.ts의 matchResidenceScore 사용
export function matchScore(
  lifestyle: LifeStyleType | null | undefined,
  residence: Residence
): number {
  if (!lifestyle) return 65;
  if (lifestyle === residence.matchType) return 92;
  return 65;
}
