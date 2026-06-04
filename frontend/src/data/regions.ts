// "본 지역" (출발지) 좌표 — KoreaMap(public/korea-map.png) 기준 상대 좌표(%)
// 좌상단 (0%, 0%) → 우하단 (100%, 100%) — 남한+제주 일러스트.
// residences.ts와 같은 좌표계 사용 → 마커/경로/캐릭터 위치 일관 유지.
// 온보딩 "본 지역 선택"의 카드 옵션이기도 하다.

export type RegionPos = { xPct: number; yPct: number };

export type HomeRegion = {
  name: string;
  pos: RegionPos;
  emoji: string;
  blurb: string; // 카드에 보여줄 한 줄 설명
};

export const HOME_REGIONS: HomeRegion[] = [
  {
    name: "서울",
    pos: { xPct: 33, yPct: 22 },
    emoji: "🌆",
    blurb: "수도권의 중심",
  },
  {
    name: "인천",
    pos: { xPct: 27, yPct: 22 },
    emoji: "⚓️",
    blurb: "서해 항구도시",
  },
  {
    name: "대전",
    pos: { xPct: 40, yPct: 42 },
    emoji: "🌳",
    blurb: "중부 내륙",
  },
  {
    name: "대구",
    pos: { xPct: 52, yPct: 58 },
    emoji: "🌶️",
    blurb: "영남 내륙",
  },
  {
    name: "광주",
    pos: { xPct: 35, yPct: 70 },
    emoji: "🍃",
    blurb: "호남의 중심",
  },
  {
    name: "부산",
    pos: { xPct: 60, yPct: 75 },
    emoji: "🌊",
    blurb: "동남 해안",
  },
];

// 이름으로 좌표 조회 (호환용)
export const HOME_POSITIONS: Record<string, RegionPos> = Object.fromEntries(
  HOME_REGIONS.map((r) => [r.name, r.pos])
);
