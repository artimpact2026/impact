// 꾸미기 아이템 트랙 — B-1 (별도 트랙)
//
// 청풍의 의도:
//   · 기념품(Item)은 "여정의 흔적" — 미션을 마치면 떨어지는 자그마한 회상.
//   · 꾸미기 아이템(DecorItem)은 "내 마당에 두는 물건" — 미션 보상으로 또 하나, 마당에 쌓임.
//   · 두 트랙은 의도적으로 분리: 기념품은 일차 탭 그리드, 꾸미기는 마당 화면.
//
// 카테고리 5종:
//   화분(plant) / 돌·디딤돌(stone) / 평상·의자(seat) / 등불·풍경(light) / 작은 친구(friend)
//
// 매핑:
//   미션 id 를 해시해서 카테고리·이모지를 결정 — 같은 미션은 항상 같은 아이템.
//   데모 단계에서는 미션 데이터에 카테고리 필드를 추가하지 않고도 작동.
//
// 저장:
//   localStorage `cheongpung.decorItems.v1` → 획득한 DecorItem 배열.

const DECOR_KEY = "cheongpung.decorItems.v1";

export type DecorCategory = "plant" | "stone" | "seat" | "light" | "friend";

export const DECOR_CATEGORY_META: Record<
  DecorCategory,
  {
    label: string;     // 한국어 라벨 — UI 표시용
    emoji: string;     // 카테고리 대표 이모지 (빈 슬롯 placeholder)
    palette: string;   // 슬롯 톤 (cream / sage / amber 등)
    variants: string[]; // 미션마다 살짝 다른 표현
  }
> = {
  plant: {
    label: "화분",
    emoji: "🌿",
    palette: "#D8E8C8",
    variants: ["🌱", "🌿", "🪴", "🌷", "🌼", "🪻"],
  },
  stone: {
    label: "돌·디딤돌",
    emoji: "🪨",
    palette: "#E6E0D0",
    variants: ["🪨", "🥌"],
  },
  seat: {
    label: "평상·의자",
    emoji: "🪑",
    palette: "#EAD9C2",
    variants: ["🪑", "🛋️"],
  },
  light: {
    label: "등불·풍경",
    emoji: "🏮",
    palette: "#F5D9B0",
    variants: ["🏮", "🕯️", "💡"],
  },
  friend: {
    label: "작은 친구",
    emoji: "🐱",
    palette: "#F4D6DC",
    variants: ["🐱", "🐦", "🐶", "🦊", "🐰", "🐢"],
  },
};

export type DecorItem = {
  id: string;
  category: DecorCategory;
  emoji: string;
  name: string;          // "강화 차밭의 평상" 같은 자동 생성 라벨
  residenceId: string;
  regionName: string;    // residence.region — 표시용
  missionId: string;
  missionTitle: string;  // "어느 미션에서 왔는지" 카피용
  acquiredAt: string;    // ISO timestamp
};

// === 해시 (deterministic) ================================================
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const ALL_CATEGORIES: DecorCategory[] = [
  "plant",
  "stone",
  "seat",
  "light",
  "friend",
];

// === 드롭 규칙 ============================================================
// 미션 + 마을 조합으로 deterministic 하게 한 개 생성.
// 동일 미션 재완료 시 같은 id 가 나오므로 호출부에서 중복 방지 가능.
export function getDecorDropFor(
  missionId: string,
  residenceId: string,
  regionName: string,
  missionTitle: string
): DecorItem {
  const seed = hash(`${missionId}::${residenceId}`);
  const category = ALL_CATEGORIES[seed % ALL_CATEGORIES.length];
  const meta = DECOR_CATEGORY_META[category];
  const emoji = meta.variants[seed % meta.variants.length];
  return {
    id: `${missionId}__${residenceId}__decor`,
    category,
    emoji,
    name: `${regionName}의 ${meta.label}`,
    residenceId,
    regionName,
    missionId,
    missionTitle,
    acquiredAt: new Date().toISOString(),
  };
}

// === localStorage 영속 ===================================================
export function loadAcquiredDecor(): DecorItem[] {
  try {
    const raw = localStorage.getItem(DECOR_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DecorItem[];
  } catch {
    return [];
  }
}

export function saveAcquiredDecor(items: DecorItem[]) {
  try {
    localStorage.setItem(DECOR_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export const DECOR_STORAGE_KEY = DECOR_KEY;

// === 마당 배치 — 어느 슬롯에 어떤 아이템을 놓았는지 ====================
//
// 데모 단계: 슬롯 5개(=카테고리 5종) 고정. 같은 카테고리 아이템만 그 슬롯에 들어감.
// 구조: { [residenceId]: { [SlotKey]: decorItemId } }
// 슬롯 비어있으면 키 없음.

const PLACED_KEY = "cheongpung.placedDecor.v1";

export type PlacedDecorMap = Record<string, Partial<Record<DecorCategory, string>>>;

export function loadPlacedDecor(): PlacedDecorMap {
  try {
    const raw = localStorage.getItem(PLACED_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PlacedDecorMap;
  } catch {
    return {};
  }
}

export function savePlacedDecor(map: PlacedDecorMap) {
  try {
    localStorage.setItem(PLACED_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export const PLACED_STORAGE_KEY = PLACED_KEY;
