// 레지던스 문화 미션 데이터 — village_archive.json(실제 아카이브)을 화면용으로 가공
// 텍스트(제목/설명/지역/태그)는 아카이브 실제 값만 사용한다.
// 썸네일/이미지는 아카이브에 비어있어, 태그 기반 파스텔 그라데이션 + 이모지 플레이스홀더로 대체한다.

import archive from "./village_archive.json";
import type { RegionPos } from "./regions";

// ─── 원본 JSON 타입(필요 필드만) ─────────────────────────
type RawVillage = {
  name: string;
  tagline?: string;
  description?: string;
  region?: { sido?: string; sigungu?: string };
  tags?: string[];
  category?: string;
  is_pilot?: boolean;
};

// ─── 화면용 미션 타입 ───────────────────────────────────
export type VillageMission = {
  key: string; // 고유 키 (마커/카드 식별)
  name: string; // 미션 제목 = 마을 이름
  tagline: string; // 한 줄 설명
  description: string; // 상세 설명
  sido: string;
  sigungu: string;
  regionLabel: string; // "강원 춘천시"
  tags: string[];
  category: string;
  xPct: number; // 지도 좌표(KoreaMap viewBox 기준 %)
  yPct: number;
  emoji: string; // 대표 태그 이모지 (썸네일용)
  colorFrom: string; // 썸네일 그라데이션 시작색
  colorTo: string; // 썸네일 그라데이션 끝색
};

// 시도 → 지도 대표 좌표(%) — KoreaMap(/korea-map.png, 남한 지도) 위 육지에 위치하도록 보정
const SIDO_POSITIONS: Record<string, RegionPos> = {
  경기: { xPct: 42.5, yPct: 27.7 },
  인천: { xPct: 33.6, yPct: 24.7 },
  강원: { xPct: 64.9, yPct: 29.5 },
  충북: { xPct: 48.1, yPct: 44.7 },
  세종: { xPct: 42.5, yPct: 48.3 },
  충남: { xPct: 33.6, yPct: 49.2 },
  대전: { xPct: 45.9, yPct: 51.0 },
  전북: { xPct: 36.9, yPct: 59.0 },
  광주: { xPct: 35.3, yPct: 69.4 },
  전남: { xPct: 33.6, yPct: 75.1 },
  경북: { xPct: 60.4, yPct: 51.9 },
  대구: { xPct: 60.9, yPct: 64.0 },
  경남: { xPct: 54.8, yPct: 71.6 },
  부산: { xPct: 68.2, yPct: 77.3 },
  울산: { xPct: 71.6, yPct: 69.8 },
  제주: { xPct: 29.1, yPct: 91.2 },
};

// 대표 태그 우선순위 — 가장 시각적으로 구분되는 태그를 썸네일에 사용
const TAG_PRIORITY = [
  "어업/바다",
  "산촌",
  "농업",
  "치유/힐링",
  "예술/창작",
  "음식/요리",
  "전통",
  "문화/책",
  "꽃/정원",
  "축제",
  "환경/지속가능",
  "워케이션",
  "디지털/IT",
  "글로벌/다문화",
  "창업",
  "도전/실험",
  "물놀이/계곡",
  "농산물수확",
  "여행/체험",
  "교육/배움",
  "느린삶",
  "가족여행",
  "정착/이주",
  "공동체",
];

// 태그 → 이모지 + 파스텔 그라데이션 (썸네일 플레이스홀더)
const TAG_STYLE: Record<string, { emoji: string; from: string; to: string }> = {
  "어업/바다": { emoji: "🌊", from: "#CDE8F6", to: "#A9D6EF" },
  산촌: { emoji: "⛰️", from: "#DDEAD7", to: "#B7D3AC" },
  농업: { emoji: "🌾", from: "#FBEFC9", to: "#F4DC9A" },
  "치유/힐링": { emoji: "🌿", from: "#DCEFE0", to: "#BBE0C4" },
  "예술/창작": { emoji: "🎨", from: "#F4DDEC", to: "#E8BFD9" },
  "음식/요리": { emoji: "🍲", from: "#FCE3D2", to: "#F8C7A8" },
  전통: { emoji: "🏯", from: "#F1E2D2", to: "#E0C6AC" },
  "문화/책": { emoji: "📖", from: "#E3E1F6", to: "#C7C2EC" },
  "꽃/정원": { emoji: "🌸", from: "#FBE0EA", to: "#F6BFD3" },
  축제: { emoji: "🎉", from: "#FDE2D6", to: "#FBC4AE" },
  "환경/지속가능": { emoji: "🌱", from: "#DCF0DA", to: "#B6E0B2" },
  워케이션: { emoji: "💻", from: "#DCEBF7", to: "#B7D6F0" },
  "디지털/IT": { emoji: "💡", from: "#E5E8F4", to: "#C5CCEA" },
  "글로벌/다문화": { emoji: "🌏", from: "#DEEBF2", to: "#BCD8E6" },
  창업: { emoji: "🚀", from: "#FDE6D2", to: "#FAC8A4" },
  "도전/실험": { emoji: "🧪", from: "#E8E6F6", to: "#CBC6EC" },
  "물놀이/계곡": { emoji: "💧", from: "#D6EEF5", to: "#AEDCEC" },
  농산물수확: { emoji: "🧺", from: "#FBEBCB", to: "#F2D696" },
  "여행/체험": { emoji: "🧭", from: "#FBE8D0", to: "#F5CDA0" },
  "교육/배움": { emoji: "📚", from: "#E6E9F5", to: "#C8CEEC" },
  느린삶: { emoji: "🍃", from: "#E0EFD9", to: "#BFDFB0" },
  가족여행: { emoji: "👨‍👩‍👧", from: "#FCE6DA", to: "#F8C9B2" },
  "정착/이주": { emoji: "🏡", from: "#FCEAD6", to: "#F6CFA6" },
  공동체: { emoji: "🤝", from: "#FBE6DD", to: "#F4C9B8" },
};

const DEFAULT_STYLE = { emoji: "🏘️", from: "#F1E8DC", to: "#DCCBB4" };

// 대표 태그 선택 — 우선순위 목록에서 가장 먼저 등장하는 태그
function pickPrimaryTag(tags: string[]): string {
  for (const t of TAG_PRIORITY) {
    if (tags.includes(t)) return t;
  }
  return tags[0] ?? "";
}

// 원본 → 화면용 미션 변환 (시도 좌표 있는 항목만)
// 좌표는 일단 시도 중심으로 두고(거리 정렬용), 표시 좌표는 선택 후 펼쳐 배치한다.
function toMission(raw: RawVillage, idx: number): VillageMission | null {
  const sido = raw.region?.sido?.trim() ?? "";
  const base = SIDO_POSITIONS[sido];
  if (!base) return null; // 좌표를 모르는(미확인) 시도는 지도에서 제외

  const sigungu = raw.region?.sigungu?.trim() ?? "";
  const tags = raw.tags ?? [];
  const primary = pickPrimaryTag(tags);
  const style = TAG_STYLE[primary] ?? DEFAULT_STYLE;

  return {
    key: `${raw.name}-${idx}`,
    name: raw.name,
    tagline: raw.tagline?.trim() || raw.description?.trim() || "",
    description: raw.description?.trim() || raw.tagline?.trim() || "",
    sido,
    sigungu,
    regionLabel: [sido, sigungu].filter(Boolean).join(" "),
    tags,
    category: raw.category ?? "",
    xPct: base.xPct,
    yPct: base.yPct,
    emoji: style.emoji,
    colorFrom: style.from,
    colorTo: style.to,
  };
}

// 전체 미션(좌표 매핑 가능한 것) — 모듈 로드시 1회 계산
const allMissions: VillageMission[] = (archive.villages as RawVillage[])
  .map(toMission)
  .filter((m): m is VillageMission => m !== null);

// 두 좌표 간 거리(제곱) — 정렬용이라 sqrt 생략
function dist2(a: RegionPos, b: { xPct: number; yPct: number }): number {
  const dx = a.xPct - b.xPct;
  const dy = a.yPct - b.yPct;
  return dx * dx + dy * dy;
}

// 같은 시도에 여러 미션이 몰리면 마커가 겹친다.
// 시도 중심을 기준으로 링(원형)으로 펼쳐 마커가 고르게 분산되도록 표시 좌표 보정.
function spreadOverlaps(list: VillageMission[]): VillageMission[] {
  const groups = new Map<string, VillageMission[]>();
  for (const m of list) {
    const g = groups.get(m.sido) ?? [];
    g.push(m);
    groups.set(m.sido, g);
  }

  const result: VillageMission[] = [];
  for (const [, group] of groups) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }
    // 시도 중심 주변에 격자(grid)로 펼쳐 균일 분산 (지도 % 좌표 기준)
    const n = group.length;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const sx = 5; // 열 간격(%)
    const sy = 5.5; // 행 간격(%)
    group.forEach((m, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const dx = (col - (cols - 1) / 2) * sx;
      const dy = (row - (rows - 1) / 2) * sy;
      result.push({
        ...m,
        xPct: Math.min(92, Math.max(8, m.xPct + dx)),
        yPct: Math.min(96, Math.max(6, m.yPct + dy)),
      });
    });
  }
  return result;
}

// 홈 좌표에서 가까운 순으로 N개 선택 (떠나기 화면 "전체" 토글용)
export function selectNearbyMissions(
  home: RegionPos,
  count = 15
): VillageMission[] {
  const nearest = [...allMissions]
    .sort((a, b) => dist2(home, a) - dist2(home, b))
    .slice(0, count);
  return spreadOverlaps(nearest);
}
