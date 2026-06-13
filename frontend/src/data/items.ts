// 기념품 아이템 시스템 — 미션 완료 시 작은 일러스트 카드를 획득
//
// 청풍의 톤: "도장 깨기"가 아니라 "여정의 흔적".
//   · 점수/적합도는 정량 지표, 아이템은 정성 회상 매개
//   · 미션 완료 시 미션 id + residence id 조합으로 정해진 아이템 1개 드롭
//     (확률 X — 시연용 일관성)
//   · 마을 × 5~10개 정도. 데모용으로 영월 / 강화도 두 곳만 풀로 채움.
//
// 저장:
//   · localStorage `cheongpung.items.v1` → 획득한 item id 배열
//   · reset api 에서 함께 제거

const ITEMS_KEY = "cheongpung.items.v1";

// MarketIllust 키와 동일한 유니온 — 순환 import 피하려 inline 으로 둠.
// 실제 정의는 data/missions.ts 의 MarketIllustKey. 추가 시 양쪽 동기화 필요.
export type ItemIllustKey =
  | "sunmu-kimchi"
  | "saeujeot"
  | "sweet-potato"
  | "ssuk-tteok"
  | "gukhwa-bbang"
  | "goguma-mallaengi"
  | "raw-sunmu"
  | "bandaegi-bowl"
  | "bandaegi-sashimi"
  | "rice-bowl"
  | "card-back"
  | "basket-bag";

export type Item = {
  id: string;
  name: string;
  emoji: string;        // 임시 시각화 — 일러스트 자산 들어가기 전 placeholder
  residenceId: string;
  // 어느 미션에서 떨어지는지 — 미션 id 와 매칭됨 (공통 미션 id 사용)
  missionId: string;
  hint: string;         // 한 줄 — 어디서·어떻게 얻었는지 풍경
  // 정의되면 emoji 대신 SVG(MarketIllust 컴포넌트)로 표시.
  // 풍물시장 미션처럼 이모지가 부정확/품위 안 맞는 케이스용.
  illustration?: ItemIllustKey;
};

// === 카탈로그 ============================================================
//
// 마을당 5개 (시연용). 공통 미션 id 와 묶어서 데모 흐름이 한 마을 안에서
// 자연스럽게 5개 아이템 컬렉션을 채울 수 있게 했음.

// 미션 id 기준 매핑.
//   · 공통 미션 9개: hospital / market / cost / transit / routine / food / shop / neighbor / mailbox
//   · 영월 region: yeongwol-stars / -river / -trek / -elder / -batmeong 등
//   · 강화 region: ganghwa-mudflat / -dolmen / -farm / -market / -sunset
export const ITEMS: Item[] = [
  // ─── 영월 (밭멍 — 산속 들녘) ────────────────────────
  {
    id: "yeongwol-stars-item",
    name: "영월 밤하늘 별자리",
    emoji: "✨",
    residenceId: "yeongwol",
    missionId: "yeongwol-stars",
    hint: "산 너머 별 무리를 손글씨로 적어왔어요",
  },
  {
    id: "yeongwol-pebble",
    name: "동강의 매끄러운 돌",
    emoji: "🪨",
    residenceId: "yeongwol",
    missionId: "yeongwol-river",
    hint: "물 흐름이 천천히 깎은 자갈 하나",
  },
  {
    id: "yeongwol-tea",
    name: "산골 약초차 레시피",
    emoji: "🍵",
    residenceId: "yeongwol",
    missionId: "yeongwol-elder",
    hint: "어르신이 알려주신 비법",
  },
  {
    id: "yeongwol-spinach",
    name: "시금치 한 단",
    emoji: "🥬",
    residenceId: "yeongwol",
    missionId: "yeongwol-batmeong",
    hint: "밭에서 갓 뽑아 흙 묻은 채로",
  },
  {
    id: "yeongwol-mailbox",
    name: "빨간 우체통 그림",
    emoji: "📮",
    residenceId: "yeongwol",
    missionId: "market",
    hint: "장보러 가는 골목 끝, 손그림으로",
  },

  // ─── 강화도 (청풍 — 갯벌과 한옥) ────────────────────
  {
    id: "ganghwa-shell",
    name: "갯벌 조개껍데기",
    emoji: "🐚",
    residenceId: "ganghwa",
    missionId: "ganghwa-mudflat",
    hint: "썰물 때 발 끝에 닿은 작은 한 조각",
  },
  {
    id: "ganghwa-dolmen-item",
    name: "고인돌 탁본",
    emoji: "🗿",
    residenceId: "ganghwa",
    missionId: "ganghwa-dolmen",
    hint: "한적한 벌판에 천 년의 흔적, 종이에 부드럽게",
  },
  {
    id: "ganghwa-soil",
    name: "강화 들녘 흙 한 줌",
    emoji: "🌾",
    residenceId: "ganghwa",
    missionId: "ganghwa-farm",
    hint: "텃밭 한 평, 흙이 부드러웠어요",
  },
  {
    // 강화풍물시장 미션 대표 아이템 — 1층 좌판에서 골라 담은 보따리.
    //   id 는 호환 위해 유지(기존 저장 데이터). 이름/일러스트는 풍물시장 톤으로.
    id: "ganghwa-ginseng",
    name: "강화풍물시장 한 보따리",
    emoji: "",
    illustration: "basket-bag",
    residenceId: "ganghwa",
    missionId: "ganghwa-market",
    hint: "1층 좌판에서 골라 담은 강화 특산물",
  },
  {
    id: "ganghwa-sunset-item",
    name: "동막해변 일몰 사진",
    emoji: "🌅",
    residenceId: "ganghwa",
    missionId: "ganghwa-sunset",
    hint: "주황으로 물든 갯벌과 바다",
  },

  // ─── 공통 미션 — 모든 마을에서 드롭되는 보너스 아이템 ─────────────
  // 마을 어디서 시장 미션을 마쳐도 시장 영수증이 떨어지게.
  // (residenceId 가 "" 이면 모든 마을에서 드롭)
];

// 모든 마을에서 드롭되는 공통 보너스 아이템 — 시연 안정성 위해 추가
// "시장 미션" 만 마쳐도 뭔가 떨어지도록.
const COMMON_BONUS_ITEMS: Record<string, Omit<Item, "residenceId">> = {
  market: {
    id: "common-market-receipt",
    name: "장날 영수증 한 장",
    emoji: "🧾",
    missionId: "market",
    hint: "오늘 산 것들, 가격이 적힌 손글씨",
  },
  hospital: {
    id: "common-hospital-pill",
    name: "약국 처방 봉투",
    emoji: "💊",
    missionId: "hospital",
    hint: "병원 옆 약국, 친절하셨어요",
  },
  transit: {
    id: "common-transit-ticket",
    name: "마을 버스 승차권",
    emoji: "🎫",
    missionId: "transit",
    hint: "출발 시각이 적힌 한 장",
  },
  neighbor: {
    id: "common-neighbor-note",
    name: "이웃이 건넨 쪽지",
    emoji: "💌",
    missionId: "neighbor",
    hint: "처음 보는 사이, 짧은 한 줄",
  },
};

// === 드롭 규칙 ===========================================================

// 특정 미션 + 마을 조합에서 떨어지는 아이템 1개 — 없으면 null.
// 우선순위:
//   1) 마을·미션 둘 다 정확히 매칭되는 region item
//   2) 공통 보너스 (어느 마을이든 같은 공통 미션 마치면 떨어짐).
//      마을별로 prefix 붙여 고유화: e.g. "common-market-receipt__yeongwol"
export function getItemDropFor(
  missionId: string,
  residenceId: string
): Item | null {
  const exact = ITEMS.find(
    (it) => it.missionId === missionId && it.residenceId === residenceId
  );
  if (exact) return exact;

  const bonus = COMMON_BONUS_ITEMS[missionId];
  if (bonus) {
    return {
      ...bonus,
      id: `${bonus.id}__${residenceId}`,
      residenceId,
    };
  }
  return null;
}

export function getItem(itemId: string): Item | null {
  return ITEMS.find((it) => it.id === itemId) ?? null;
}

// 마을별 카탈로그 (정원 표시용 — "수집한 5개 중 3개")
export function itemsForResidence(residenceId: string): Item[] {
  return ITEMS.filter((it) => it.residenceId === residenceId);
}

// === localStorage 영속 ===================================================

// 획득한 아이템 — 객체 자체를 저장. 합성된 공통 보너스 아이템 id 도 보존됨.
export function loadAcquiredItems(): Item[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Item[];
  } catch {
    return [];
  }
}

export function saveAcquiredItems(items: Item[]) {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export const ITEMS_STORAGE_KEY = ITEMS_KEY;
