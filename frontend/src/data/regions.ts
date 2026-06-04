// "본 지역" (출발지) 좌표 — KoreaMap(/korea-map.png, 남한 지도) 기준 상대 좌표(%)
// residences.ts와 같은 좌표계 사용 → 마커/경로/캐릭터 위치 일관 유지
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
    pos: { xPct: 41.4, yPct: 22.9 },
    emoji: "🌆",
    blurb: "수도권의 중심",
  },
  {
    name: "인천",
    pos: { xPct: 33.6, yPct: 24.7 },
    emoji: "⚓️",
    blurb: "서해 항구도시",
  },
  {
    name: "대전",
    pos: { xPct: 45.9, yPct: 51.0 },
    emoji: "🌳",
    blurb: "중부 내륙",
  },
  {
    name: "대구",
    pos: { xPct: 60.9, yPct: 64.0 },
    emoji: "🌶️",
    blurb: "영남 내륙",
  },
  {
    name: "광주",
    pos: { xPct: 35.3, yPct: 69.4 },
    emoji: "🍃",
    blurb: "호남의 중심",
  },
  {
    name: "부산",
    pos: { xPct: 68.2, yPct: 77.3 },
    emoji: "🌊",
    blurb: "동남 해안",
  },
];

// 이름으로 좌표 조회 (호환용)
export const HOME_POSITIONS: Record<string, RegionPos> = Object.fromEntries(
  HOME_REGIONS.map((r) => [r.name, r.pos])
);
