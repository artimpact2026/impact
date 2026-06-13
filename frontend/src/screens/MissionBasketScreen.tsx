// 강화풍물시장 미션 — 실제 시장 동선 그대로 1층(장보기) → 2층(밴댕이) 2단계.
//
// ── 1층 (MarketFloor1) ──────────────────────────────
//  · 좌판에 7장의 카드 (처음 뒷면)
//  · 탭 → 3D 뒤집기 → 강화 사실 정보 노출
//  · 뒤집힌 카드를 "장바구니 zone" 으로 드래그 → 흥정 모달
//  · 흥정 성공/실패 (랜덤) → 깎인 가격 또는 정가에 담김
//  · 예산 빠듯하게(10k) — 다 못 가짐 = 골라야 함
//
// ── 2층 (MarketFloor2) ──────────────────────────────
//  · 사장님이 회무침 한 그릇 차려줌
//  · 화면을 빙글빙글 문지르면 비비기 진행도 0 → 100%
//  · 다 비벼지면 그릇에 회 조각 5점 표시
//  · 탭으로 한 점씩 먹기 — 사장님이 한 입마다 다른 반응
//  · 다 먹으면 한 줄 감상 → onComplete (밴댕이는 acquiredItems 가 아니라 SavedQuote 로 기록)
//
// 인터랙션 기준 충족: 카드 뒤집기 / 드래그 / 빙글빙글 문지르기 / 탭 — 모두 손맛 동작.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  type PanInfo,
} from "framer-motion";
import type {
  BasketItem,
  DiningStop,
  Mission,
} from "../data/missions";
import MarketIllust from "../components/MarketIllust";

type PickedEntry = { item: BasketItem; paidPrice: number };

type BargainState =
  | { phase: "ask"; item: BasketItem }
  | { phase: "rolling"; item: BasketItem }
  | { phase: "result"; item: BasketItem; success: boolean }
  | null;

type Phase = "intro" | "floor1" | "ascend" | "floor2" | "done";

// 인트로 시퀀스 — 도착(정문) → 지도 → 1층 입장. 풀스크린 이미지 + 캐릭터 멘트.
//   · 이미지는 public/mission/ganghwa-market/ 에 보관
//   · 캐릭터 멘트는 화면에 맞춰 살짝 둥실
//   · 탭/CTA 로 다음 step
type IntroStep = {
  image: string;
  preLabel: string;
  title: string;
  npc: string;       // 캐릭터(바람) 한 줄
  cta: string;
};

// 2층 식당가 첫 진입 시 1회 풀스크린 스플래쉬 — "와~ 2층은 전부 밴댕이네!" 인식 → 비비기로.
const GANGHWA_FLOOR2_INTRO: IntroStep = {
  image: "/mission/ganghwa-market/04-floor2.png",
  preLabel: "2층 식당가",
  title: "와~ 2층은 전부 밴댕이네!",
  npc: "강화 사람들은 밴댕이를 시장 안에서 바로 무쳐 먹는대. 우리도 한 그릇 비벼볼까?",
  cta: "밴댕이 먹어볼까?",
};

const GANGHWA_MARKET_INTRO: IntroStep[] = [
  {
    image: "/mission/ganghwa-market/01-entrance.png",
    preLabel: "정문 도착",
    title: "여긴 강화풍물시장 정문!",
    npc: "아까 로드뷰에서 본 건 후문이었고, 한 골목 돌아 정문에 도착했어요! 한옥 지붕 보이죠? 들어가봐요.",
    cta: "들어가기",
  },
  {
    image: "/mission/ganghwa-market/02-map.png",
    preLabel: "1층 입구",
    title: "오! 지도가 있어요!",
    npc: "1층은 특산물·반찬·젓갈, 2층은 먹거리예요. 1층부터 둘러봐요.",
    cta: "1층으로 가기",
  },
  {
    image: "/mission/ganghwa-market/03-floor1.png",
    preLabel: "1층 좌판",
    title: "강화 특산물들이 한가득!",
    npc: "예산 안에서 골라 담아봐요. 음식 탭하면 자세히, 길게 잡고 장바구니로 끌면 담겨요.",
    cta: "장보기 시작!",
  },
];

type Props = {
  mission: Mission;
  onClose: () => void;
  // 1층에서 산 아이템들 + 2층 식당 경험 멘트(있으면) 함께 전달
  onComplete: (picked: BasketItem[], diningMemoir?: string) => void;
};

export default function MissionBasketScreen({
  mission,
  // onClose 는 props 로 받지만 현재 화면에선 사용 X (SKIP 제거 — 사용자 피드백).
  // 추후 다른 닫기 동선이 필요해질 수 있어 시그니처는 유지.
  onClose: _onClose,
  onComplete,
}: Props) {
  const basket = mission.basket!;
  // 풍물시장 미션이면 intro 시퀀스(정문 → 지도 → 1층)부터, 아니면 바로 좌판.
  const hasIntro = mission.id === "ganghwa-market";
  const [phase, setPhase] = useState<Phase>(hasIntro ? "intro" : "floor1");
  const [introStep, setIntroStep] = useState(0);
  const [picked, setPicked] = useState<PickedEntry[]>([]);

  const finishWithoutDining = () => onComplete(picked.map((p) => p.item));
  const finishWithDining = () =>
    onComplete(
      picked.map((p) => p.item),
      basket.dining?.memoir
    );

  return (
    <div
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#FFF4E0] via-cream to-[#FFE8D2]"
      style={{ minHeight: "calc(100dvh - var(--content-bottom))" }}
    >
      {/* (SKIP 버튼 제거 — 사용자 피드백) */}

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key={`intro-${introStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <MarketIntroSplash
              step={GANGHWA_MARKET_INTRO[introStep]}
              stepIndex={introStep}
              totalSteps={GANGHWA_MARKET_INTRO.length}
              onNext={() => {
                if (introStep < GANGHWA_MARKET_INTRO.length - 1) {
                  setIntroStep((s) => s + 1);
                } else {
                  setPhase("floor1");
                }
              }}
            />
          </motion.div>
        )}

        {phase === "floor1" && (
          <motion.div
            key="floor1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MarketFloor1
              basket={basket}
              picked={picked}
              setPicked={setPicked}
              onNoDiningFinish={finishWithoutDining}
              onAscend={() => setPhase("ascend")}
            />
          </motion.div>
        )}

        {phase === "ascend" && (
          <motion.div
            key="ascend"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 1.1, ease: [0.6, 0, 0.4, 1] }}
            // in 애니메이션(1.1s) + hold(1.5s) → 총 ≈ 2.6s. 계단 오르는 호흡 느끼게.
            onAnimationComplete={() => {
              window.setTimeout(() => setPhase("floor2"), 1500);
            }}
            className="absolute inset-0 bg-gradient-to-b from-[#3A2A1F] to-[#1F1612]
                       flex flex-col items-center justify-center text-cream"
          >
            <p className="text-[12px] font-extrabold tracking-[0.3em] uppercase opacity-70">
              계단 오르는 중
            </p>
            <p className="mt-3 text-cream text-[24px] font-extrabold">
              2층 식당으로
            </p>
            <p className="mt-2 opacity-70 text-[12.5px]">밴댕이 한 상 보러 가요</p>
            <motion.div
              className="mt-7 flex flex-col gap-1.5"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  className="w-32 h-1.5 rounded-full bg-cream/70"
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {phase === "floor2" && basket.dining && (
          <motion.div
            key="floor2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <MarketFloor2
              dining={basket.dining}
              onFinish={finishWithDining}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================================================================
// 1층 — 카드 뒤집기 + 드래그 + 흥정
// ===========================================================================

function MarketFloor1({
  basket,
  picked,
  setPicked,
  onAscend,
  onNoDiningFinish,
}: {
  basket: NonNullable<Mission["basket"]>;
  picked: PickedEntry[];
  setPicked: React.Dispatch<React.SetStateAction<PickedEntry[]>>;
  onAscend: () => void;
  onNoDiningFinish: () => void;
}) {
  // 활성 아이템 — 탭하면 컬러로 깨어나고 중앙 정보 카드에 표시.
  // null = 아무것도 안 골라본 상태(좌판 전체 회색).
  const [activeId, setActiveId] = useState<string | null>(null);
  const [bargain, setBargain] = useState<BargainState>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);

  // 장바구니 이미지 영역 — onDragEnd 에서 충돌 검사
  const basketZoneRef = useRef<HTMLDivElement | null>(null);

  const spent = picked.reduce((s, p) => s + p.paidPrice, 0);
  const ratio = Math.min(1, spent / basket.budget);
  const pickedIds = useMemo(
    () => new Set(picked.map((p) => p.item.id)),
    [picked]
  );
  const activeItem = basket.items.find((i) => i.id === activeId) ?? null;

  // === 일러스트 동작 =======================================================
  const tapIllust = (item: BasketItem) => {
    if (pickedIds.has(item.id)) {
      // 이미 담긴 아이템 탭 → 빼기
      setPicked((prev) => prev.filter((p) => p.item.id !== item.id));
      if (activeId === item.id) setActiveId(null);
      return;
    }
    // 같은 거 다시 탭하면 토글로 꺼주기
    setActiveId((prev) => (prev === item.id ? null : item.id));
  };

  // 드래그 종료 — 장바구니 zone 위면 흥정 모달
  const handleDragEnd =
    (item: BasketItem) =>
    (_e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
      if (pickedIds.has(item.id)) return;
      const zone = basketZoneRef.current?.getBoundingClientRect();
      if (!zone) return;
      const { x, y } = info.point;
      if (
        x >= zone.left &&
        x <= zone.right &&
        y >= zone.top &&
        y <= zone.bottom
      ) {
        setBargain({ phase: "ask", item });
      }
    };

  // === 흥정 ================================================================
  const tryBargain = () => {
    if (!bargain || bargain.phase !== "ask") return;
    const item = bargain.item;
    setBargain({ phase: "rolling", item });
    window.setTimeout(() => {
      const rate = item.bargainSuccessRate ?? 0.6;
      const success = Math.random() < rate;
      setBargain({ phase: "result", item, success });
    }, 650);
  };

  const addToPicked = (paidPrice: number) => {
    if (!bargain) return;
    const item = bargain.item;
    if (spent + paidPrice > basket.budget) {
      setBargain(null);
      setShakeId(item.id);
      window.setTimeout(() => setShakeId(null), 500);
      return;
    }
    setPicked((prev) => [...prev, { item, paidPrice }]);
    setBargain(null);
    setActiveId(null);
  };

  // 바람이가 등장해 다음 단계 안내하는 기준 — 예산의 75% 채워야 "충분히 담은" 톤.
  //   · 10,000원 예산 기준 7,500원. 임계값 미달이면 바람이 미등장 (조용히 더 담아보세요).
  //   · dining 미션 (강화풍물시장) → "2층 올라가볼까?"
  //   · dining 없는 미션 → "이제 구매하자!" (해당 미션 추가 시 onNoDiningFinish 로 정리)
  const ASCEND_THRESHOLD = 7500;
  const canAdvance = spent >= ASCEND_THRESHOLD;
  const hasDining = !!basket.dining;

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100dvh - var(--content-bottom))" }}>
      {/* === 상단 — "장바구니에 끌어 담아보세요" 만 큼지막 (NPC 없음 — 흥정에서만 등장) === */}
      <header className="pt-10 px-5">
        <h1 className="text-center text-ink text-[22px] font-extrabold leading-snug">
          ✋ 좌판 음식을 <span className="text-primary">장바구니</span>에<br />
          끌어 담아보세요
        </h1>
      </header>

      {/* === 좌판 — 일러스트만 (회색 ↔ 컬러) === */}
      <section className="px-5 mt-3">
        <div className="grid grid-cols-3 gap-x-2 gap-y-1">
          {basket.items.map((item) => {
            const isActive = activeId === item.id;
            const isPicked = pickedIds.has(item.id);
            const isShaking = shakeId === item.id;
            return (
              <MarketStallIllust
                key={item.id}
                item={item}
                isActive={isActive}
                isPicked={isPicked}
                isShaking={isShaking}
                onTap={() => tapIllust(item)}
                onDragEnd={handleDragEnd(item)}
              />
            );
          })}
        </div>
      </section>

      {/* === 중앙 — 활성 아이템 정보 (선택 시 큼지막) === */}
      <section className="px-5 mt-2">
        <AnimatePresence mode="wait">
          {activeItem ? (
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-cream-200 shadow-soft
                         px-4 py-3 flex items-center gap-3"
            >
              <MarketIllust variant={activeItem.illustration} size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-ink text-[15px] font-extrabold leading-tight">
                    {activeItem.name}
                  </p>
                  <p className="text-primary text-[13px] font-extrabold tabular-nums">
                    {activeItem.price.toLocaleString()}원
                  </p>
                </div>
                <p className="mt-1 text-ink-soft text-[11.5px] leading-snug">
                  {activeItem.fact}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-ink-mute text-[11.5px] font-bold py-2"
            >
              먹거리를 한 번 탭해 볼까요?
            </motion.p>
          )}
        </AnimatePresence>
      </section>

      {/* === 예산 게이지 === */}
      <section className="px-5 mt-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10.5px] font-extrabold text-ink-mute tracking-[0.14em] uppercase">
            오늘 예산
          </p>
          <p className="text-[12px] font-extrabold text-ink tabular-nums">
            <span className="text-primary">{spent.toLocaleString()}</span>
            <span className="text-ink-mute"> / {basket.budget.toLocaleString()}원</span>
          </p>
        </div>
        <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${ratio * 100}%` }}
            transition={{ type: "spring", damping: 18 }}
          />
        </div>
      </section>

      {/* === 장바구니 + 바람이 유도 — 하단 CTA 버튼 없이, spent ≥ 임계 시 바람이가 떠올라 안내 === */}
      <section className="px-5 mt-1 flex-1 flex flex-col justify-end pb-4 relative">
        {/* 바람이 floating — spent ≥ 7,500 시 장바구니 위로 떠오름 (탭하면 다음 단계) */}
        <AnimatePresence>
          {canAdvance && (
            <motion.button
              type="button"
              onClick={() => (hasDining ? onAscend() : onNoDiningFinish())}
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.9 }}
              transition={{ type: "spring", damping: 18 }}
              className="absolute left-0 right-0 mx-auto z-20 flex items-end gap-2 pl-3 pr-2 max-w-[320px]
                         active:scale-[0.98] transition"
              style={{ top: 0 }}
            >
              <motion.img
                src="/character1/clay-baram-solo.png"
                alt=""
                aria-hidden
                animate={{ y: [-2, 1, -2] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="w-[58px] h-auto shrink-0 drop-shadow-[0_4px_8px_rgba(62,44,32,0.3)] select-none"
                draggable={false}
              />
              <div className="relative flex-1 bg-white rounded-2xl border border-cream-200
                              shadow-[0_8px_20px_-4px_rgba(0,0,0,0.18)] px-3.5 py-2.5">
                <p className="text-[10px] font-extrabold text-primary leading-none tracking-wider">
                  🧭 바람이
                </p>
                <p className="mt-1 text-ink text-[12.5px] font-extrabold leading-snug">
                  {hasDining
                    ? "한 상 충분히 채웠네!\n2층 올라가볼까?"
                    : `잘 골랐어! 이제 구매하자!`}
                  <span className="ml-1 text-primary">→</span>
                </p>
                <span
                  aria-hidden
                  className="absolute left-[-6px] bottom-4 w-3 h-3
                             bg-white border-l border-b border-cream-200 rotate-45"
                />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* 장바구니 SVG + 담긴 아이템 */}
        <div
          ref={basketZoneRef}
          className="relative w-full mx-auto"
          style={{ maxWidth: 320 }}
        >
          <div
            className="relative w-full flex items-center justify-center"
            style={{ aspectRatio: "1 / 0.7" }}
          >
            <MarketIllust
              variant="basket-bag"
              size={200}
              className="drop-shadow-[0_8px_16px_rgba(80,60,40,0.25)]"
            />
            <div
              className="absolute left-0 right-0 flex flex-wrap items-center justify-center gap-1 px-10"
              style={{ top: "38%", bottom: "30%" }}
            >
              <AnimatePresence>
                {picked.map((p) => (
                  <motion.div
                    key={p.item.id}
                    layout
                    initial={{ scale: 0, y: -16, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", damping: 14 }}
                    className="drop-shadow-[0_2px_4px_rgba(80,60,40,0.4)]"
                  >
                    <MarketIllust variant={p.item.illustration} size={28} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* === 흥정 모달 === */}
      <AnimatePresence>
        {bargain && (
          <BargainSheet
            bargain={bargain}
            npcName={basket.npcName}
            onTryBargain={tryBargain}
            onBuyFullPrice={() => addToPicked(bargain.item.price)}
            onBuyBargainPrice={() => addToPicked(bargain.item.bargainPrice)}
            onCancel={() => setBargain(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ===========================================================================
// MarketStallIllust — 좌판 한 칸 (일러스트만, 회색 ↔ 컬러)
//   · 미선택: grayscale + 살짝 투명 — "조용히 진열된" 톤
//   · 활성(탭): 컬러 + 살짝 큼 + 펄스 글로우
//   · 담김: 컬러 + ✓ 뱃지
//   · 활성 또는 담김 안 된 상태에서 드래그 가능 (탭과 구분은 framer-motion drag threshold)
// ===========================================================================

function MarketStallIllust({
  item,
  isActive,
  isPicked,
  isShaking,
  onTap,
  onDragEnd,
}: {
  item: BasketItem;
  isActive: boolean;
  isPicked: boolean;
  isShaking: boolean;
  onTap: () => void;
  onDragEnd: (e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => void;
}) {
  const showColor = isActive || isPicked;
  return (
    <motion.div
      animate={isShaking ? { x: [0, -6, 6, -4, 4, 0] } : undefined}
      transition={{ duration: 0.4 }}
      className="relative aspect-square flex items-center justify-center"
    >
      <motion.button
        type="button"
        onClick={() => onTap()}
        // 드래그 — 미담김 상태일 때만 활성
        drag={!isPicked}
        dragSnapToOrigin
        dragElastic={0.35}
        whileDrag={{ scale: 1.15, zIndex: 30 }}
        onDragEnd={onDragEnd}
        animate={{
          scale: isActive ? 1.08 : 1,
        }}
        transition={{ type: "spring", damping: 18 }}
        className="relative flex flex-col items-center justify-center
                   touch-none select-none"
        style={{
          filter: showColor
            ? "none"
            : "grayscale(1) opacity(0.55)",
          transition: "filter 0.3s ease",
        }}
      >
        <MarketIllust variant={item.illustration} size={48} />
        <p
          className={`mt-0.5 text-[10px] font-extrabold leading-none
                      ${
                        showColor ? "text-ink" : "text-ink-mute"
                      }`}
        >
          {item.name}
        </p>

        {/* 활성 펄스 글로우 */}
        {isActive && !isPicked && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0.6, scale: 0.9 }}
            animate={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,112,67,0.4) 0%, transparent 70%)",
            }}
          />
        )}

        {isPicked && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 14 }}
            className="absolute top-0 right-0 w-5 h-5 rounded-full
                       bg-primary text-white text-[10px] font-extrabold
                       flex items-center justify-center shadow-soft"
            aria-hidden
          >
            ✓
          </motion.span>
        )}
      </motion.button>
    </motion.div>
  );
}

// ===========================================================================
// BargainSheet — 흥정 바텀시트
// ===========================================================================

function BargainSheet({
  bargain,
  npcName,
  onTryBargain,
  onBuyFullPrice,
  onBuyBargainPrice,
  onCancel,
}: {
  bargain: NonNullable<BargainState>;
  npcName: string;
  onTryBargain: () => void;
  onBuyFullPrice: () => void;
  onBuyBargainPrice: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={() => bargain.phase !== "rolling" && onCancel()}
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        transition={{ type: "spring", damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-white rounded-t-3xl px-5 pt-5 pb-7
                   shadow-[0_-12px_30px_-6px_rgba(0,0,0,0.4)]"
      >
        {/* 상인 — 클레이 캐릭터 + 한 줄 (사장님은 흥정에서만 등장) */}
        <div className="mb-3 flex items-end gap-3">
          <motion.img
            src="/character1/clay-jieum-solo.png"
            alt=""
            aria-hidden
            animate={{ y: [-2, 1, -2] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-[70px] h-auto shrink-0 drop-shadow-[0_4px_8px_rgba(62,44,32,0.3)] select-none"
            draggable={false}
          />
          <div className="flex-1 min-w-0 mb-1">
            <p className="text-[10px] font-extrabold text-primary tracking-[0.14em] uppercase">
              {npcName}
            </p>
            <BargainSpeech bargain={bargain} />
          </div>
        </div>

        {/* 아이템 카드 — 일러스트 + 가격 */}
        <div className="bg-cream-50 rounded-2xl border border-cream-200 px-4 py-3 mb-4
                        flex items-center gap-3">
          <MarketIllust variant={bargain.item.illustration} size={42} />
          <div className="flex-1 min-w-0">
            <p className="text-ink text-[14px] font-extrabold leading-tight">
              {bargain.item.name}
            </p>
            <BargainPrice bargain={bargain} />
          </div>
        </div>

        <BargainButtons
          bargain={bargain}
          onTryBargain={onTryBargain}
          onBuyFullPrice={onBuyFullPrice}
          onBuyBargainPrice={onBuyBargainPrice}
          onCancel={onCancel}
        />
      </motion.div>
    </motion.div>
  );
}

function BargainSpeech({ bargain }: { bargain: NonNullable<BargainState> }) {
  if (bargain.phase === "ask")
    return (
      <p className="mt-1 text-ink text-[14px] font-extrabold leading-snug">
        "{bargain.item.name} {bargain.item.price.toLocaleString()}원이에요"
      </p>
    );
  if (bargain.phase === "rolling")
    return (
      <p className="mt-1 text-ink-soft text-[13px] leading-snug">
        음... 잠시만요...
      </p>
    );
  if (bargain.success)
    return (
      <p className="mt-1 text-primary text-[14px] font-extrabold leading-snug">
        "에이 그럼 특별히 {bargain.item.bargainPrice.toLocaleString()}원에 줄게요~"
      </p>
    );
  return (
    <p className="mt-1 text-ink text-[13.5px] font-extrabold leading-snug">
      "이건 못 깎아줘요 ㅎㅎ"
    </p>
  );
}

function BargainPrice({ bargain }: { bargain: NonNullable<BargainState> }) {
  if (bargain.phase === "result" && bargain.success)
    return (
      <p className="mt-0.5 text-[12px] font-extrabold">
        <span className="text-ink-mute line-through mr-1.5">
          {bargain.item.price.toLocaleString()}원
        </span>
        <span className="text-primary">
          {bargain.item.bargainPrice.toLocaleString()}원
        </span>
      </p>
    );
  return (
    <p className="mt-0.5 text-ink-mute text-[12px] font-extrabold">
      {bargain.item.price.toLocaleString()}원
    </p>
  );
}

function BargainButtons({
  bargain,
  onTryBargain,
  onBuyFullPrice,
  onBuyBargainPrice,
  onCancel,
}: {
  bargain: NonNullable<BargainState>;
  onTryBargain: () => void;
  onBuyFullPrice: () => void;
  onBuyBargainPrice: () => void;
  onCancel: () => void;
}) {
  if (bargain.phase === "ask")
    return (
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onTryBargain}
          className="h-12 rounded-full bg-primary text-white text-[13px] font-extrabold
                     shadow-[0_6px_16px_-4px_rgba(255,112,67,0.5)] active:scale-[0.98]"
        >
          💸 깎아주세요
        </button>
        <button
          type="button"
          onClick={onBuyFullPrice}
          className="h-12 rounded-full bg-cream-100 text-ink text-[13px] font-extrabold
                     border border-cream-200 active:scale-[0.98]"
        >
          🛒 그냥 살게요
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="col-span-2 mt-1 text-[11.5px] font-bold text-ink-mute py-1.5"
        >
          취소
        </button>
      </div>
    );
  if (bargain.phase === "rolling")
    return (
      <div className="h-12 rounded-full bg-cream-100 text-ink-mute text-[13px] font-extrabold
                      flex items-center justify-center gap-2">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block"
          aria-hidden
        >
          🪙
        </motion.span>
        흥정 중...
      </div>
    );
  if (bargain.success)
    return (
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onBuyBargainPrice}
          className="h-12 rounded-full bg-primary text-white text-[13px] font-extrabold
                     shadow-[0_6px_16px_-4px_rgba(255,112,67,0.5)] active:scale-[0.98]"
        >
          🛒 담기 ({bargain.item.bargainPrice.toLocaleString()}원)
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-12 rounded-full bg-cream-100 text-ink-soft text-[13px] font-extrabold
                     border border-cream-200 active:scale-[0.98]"
        >
          안 살래요
        </button>
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={onBuyFullPrice}
        className="h-12 rounded-full bg-primary text-white text-[13px] font-extrabold
                   shadow-[0_6px_16px_-4px_rgba(255,112,67,0.5)] active:scale-[0.98]"
      >
        🛒 정가에 담기
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-12 rounded-full bg-cream-100 text-ink-soft text-[13px] font-extrabold
                   border border-cream-200 active:scale-[0.98]"
      >
        안 살래요
      </button>
    </div>
  );
}

// ===========================================================================
// 2층 — 비비기 + 먹기
// ===========================================================================

// === 입자 물리 비빔 — 색칠 방식 폐기, 실제 입자가 손가락 따라 섞이는 톤 ===
//
// 그릇 안에 회·양념·야채 입자들이 흩어져 있고 사용자가 손가락으로 휘저으면
// 입자들이 손가락 속도/방향 따라 push + curl(소용돌이) 받아 유체처럼 섞임.
// 손가락 push 누적량이 임계 도달하면 mixed=true → 회 입자가 빨간 양념색으로 변환.
// 비빈 후 화면 탭하면 회 입자 하나가 위로 fly out (한 점 먹기).

const STAGE_SIZE = 220; // 그릇 안쪽 지름 (px). 사이드 그릇(밴댕이회·밥) 공간 확보 위해 축소.
const STAGE_R = STAGE_SIZE / 2;
const MIX_MOTION_TARGET = 950; // 손가락 push 누적량 임계

type PType = "sashimi" | "sauce" | "veg-g" | "veg-y";

type Particle = {
  type: PType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number; // 반지름
  eaten?: boolean;
};

// 비비기 전 색상
const COLOR_RAW: Record<PType, string> = {
  sashimi: "#F4D3CA",
  sauce: "#D14B3A",
  "veg-g": "#7FB069",
  "veg-y": "#FFC56A",
};
// 비빈 후 (회 입자만 양념 묻은 색으로)
const COLOR_MIXED_SASHIMI = "#E07050";

function spawnParticles(): Particle[] {
  const out: Particle[] = [];
  // 회 8개 — 한쪽에 무더기로 (비비기 전 그대로 배치)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    out.push({
      type: "sashimi",
      x: STAGE_R + Math.cos(angle) * 50 + (Math.random() - 0.5) * 12,
      y: STAGE_R + Math.sin(angle) * 22 + (Math.random() - 0.5) * 12,
      vx: 0,
      vy: 0,
      r: 9,
    });
  }
  // 양념 10개 — 중심 부근에 몰림 (비비기 전 = 한곳에 모인 양념)
  for (let i = 0; i < 10; i++) {
    out.push({
      type: "sauce",
      x: STAGE_R + (Math.random() - 0.5) * 36,
      y: STAGE_R + (Math.random() - 0.5) * 36,
      vx: 0,
      vy: 0,
      r: 5.5,
    });
  }
  // 야채 — 그릇 안 무작위
  for (let i = 0; i < 5; i++) {
    out.push({
      type: "veg-g",
      x: STAGE_R + (Math.random() - 0.5) * 130,
      y: STAGE_R + (Math.random() - 0.5) * 130,
      vx: 0,
      vy: 0,
      r: 4,
    });
  }
  for (let i = 0; i < 4; i++) {
    out.push({
      type: "veg-y",
      x: STAGE_R + (Math.random() - 0.5) * 110,
      y: STAGE_R + (Math.random() - 0.5) * 110,
      vx: 0,
      vy: 0,
      r: 4,
    });
  }
  return out;
}

// 사장님 실시간 응원 멘트 — push 누적량 0~100% 구간별. 진행 중 자동 전환.
const MIX_LINES: Array<{ minProgress: number; text: string }> = [
  { minProgress: 0, text: "자, 손목 힘 빼고 천천히~ 살살 비벼봐요" },
  { minProgress: 12, text: "그렇지, 그렇게 골고루 비벼야 제맛이지!" },
  { minProgress: 30, text: "어이 좋다 좋다, 손맛이야 손맛!" },
  { minProgress: 50, text: "양념이 착~ 감기네!" },
  { minProgress: 70, text: "조금만 더~ 한쪽으로 몰리지 않게" },
  { minProgress: 88, text: "오~ 거의 다 됐어요!" },
];

function pickLineIdx(p: number): number {
  let idx = 0;
  for (let i = 0; i < MIX_LINES.length; i++) {
    if (p >= MIX_LINES[i].minProgress) idx = i;
  }
  return idx;
}

function MarketFloor2({
  dining,
  onFinish,
}: {
  dining: DiningStop;
  onFinish: () => void;
}) {
  // 2층 첫 진입 시 1회 풀스크린 스플래쉬 — "밴댕이 먹어볼까?" CTA 누르면 비비기로.
  const [introShown, setIntroShown] = useState(true);
  const [mixed, setMixed] = useState(false);
  const [bitesEaten, setBitesEaten] = useState(0);
  // 밴댕이회 사이드 — 6점 깻잎 위. 비빈 후 한 점씩 탭으로 사라짐.
  const [sashimiEaten, setSashimiEaten] = useState(0);
  const SASHIMI_TOTAL = 6;
  const [reactionIdx, setReactionIdx] = useState(0);
  const [showReaction, setShowReaction] = useState(false);
  const [npcLineIdx, setNpcLineIdx] = useState(0);
  const [mixProgress, setMixProgress] = useState(0);

  // 회무침 + 밴댕이회 둘 다 다 먹어야 완료
  const allEaten = bitesEaten >= dining.bites && sashimiEaten >= SASHIMI_TOTAL;

  // === 입자 물리 비빔 ======================================================
  const particlesRef = useRef<Particle[]>([]);
  const particleElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const pointerRef = useRef<{ x: number; y: number; vx: number; vy: number; active: boolean } | null>(null);
  const accumMotionRef = useRef(0);
  const mixedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // RAF 루프 — 마운트 후 시작, 매 프레임 입자 물리/렌더 갱신
  useEffect(() => {
    // 처음 한 번만 입자 spawn
    if (particlesRef.current.length === 0) {
      particlesRef.current = spawnParticles();
    }

    const loop = () => {
      const particles = particlesRef.current;
      const p = pointerRef.current;

      for (const part of particles) {
        if (part.eaten) continue;

        // 손가락 영향 — 가까이 있는 입자에 push + curl(소용돌이) 추가
        if (p && p.active) {
          const dx = part.x - p.x;
          const dy = part.y - p.y;
          const d2 = dx * dx + dy * dy;
          const RADIUS = 52;
          if (d2 < RADIUS * RADIUS) {
            const d = Math.sqrt(d2) || 1;
            const falloff = 1 - d / RADIUS;
            // 손가락 속도 방향으로 push (직진 성분)
            part.vx += p.vx * falloff * 0.55;
            part.vy += p.vy * falloff * 0.55;
            // 회전 curl — 손가락 주변으로 도는 효과 (퍼펜디큘러)
            part.vx += (-dy / d) * falloff * 2.4;
            part.vy += (dx / d) * falloff * 2.4;
            // 비빔 누적 — 손가락 속도 크기 * falloff
            const speedMag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            accumMotionRef.current += speedMag * falloff * 0.12;
          }
        }

        // 마찰
        part.vx *= 0.86;
        part.vy *= 0.86;

        // 위치 업데이트
        part.x += part.vx;
        part.y += part.vy;

        // 그릇 원형 경계 — 안쪽에 가두기
        const cdx = part.x - STAGE_R;
        const cdy = part.y - STAGE_R;
        const maxR = STAGE_R - part.r - 6;
        const cd = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cd > maxR && cd > 0) {
          const s = maxR / cd;
          part.x = STAGE_R + cdx * s;
          part.y = STAGE_R + cdy * s;
          part.vx *= -0.32;
          part.vy *= -0.32;
        }
      }

      // 포인터 속도 감쇠 — pointermove 사이 자연스럽게 죽음
      if (p) {
        p.vx *= 0.72;
        p.vy *= 0.72;
      }

      // DOM transform 직접 갱신 — state 거치지 않음 (60fps)
      for (let i = 0; i < particles.length; i++) {
        const el = particleElsRef.current[i];
        const part = particles[i];
        if (!el || part.eaten) continue;
        el.style.transform = `translate3d(${part.x - part.r}px, ${part.y - part.r}px, 0)`;
      }

      // 진행도 + 멘트 갱신 (state 는 변화 시에만)
      const progress = Math.min(100, (accumMotionRef.current / MIX_MOTION_TARGET) * 100);
      setMixProgress((prev) => (Math.abs(prev - progress) > 0.5 ? progress : prev));
      const lineIdx = pickLineIdx(progress);
      setNpcLineIdx((prev) => (prev !== lineIdx ? lineIdx : prev));

      // 완성 체크 — 누적 push 임계 도달 시 회 입자 색 바꿈
      if (!mixedRef.current && accumMotionRef.current >= MIX_MOTION_TARGET) {
        mixedRef.current = true;
        setMixed(true);
        for (let i = 0; i < particles.length; i++) {
          if (particles[i].type !== "sashimi") continue;
          const el = particleElsRef.current[i];
          if (!el) continue;
          el.style.transition =
            "background 0.6s ease, border-color 0.6s ease, box-shadow 0.6s";
          el.style.background = COLOR_MIXED_SASHIMI;
          el.style.borderColor = "#A6311E";
          el.style.boxShadow = "0 2px 4px rgba(166, 49, 30, 0.35)";
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleStagePointerDown = (e: React.PointerEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      vx: 0,
      vy: 0,
      active: true,
    };
  };

  const handleStagePointerMove = (e: React.PointerEvent) => {
    if (!pointerRef.current) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // 손가락 속도 추정 — 새 위치와 직전 위치 차이. (RAF 와 비동기적이므로 그냥 차이 사용)
    pointerRef.current.vx = (x - pointerRef.current.x) * 0.55;
    pointerRef.current.vy = (y - pointerRef.current.y) * 0.55;
    pointerRef.current.x = x;
    pointerRef.current.y = y;
  };

  const handleStagePointerUp = () => {
    if (pointerRef.current) pointerRef.current.active = false;
  };

  // === 먹기 ================================================================
  // 회무침(메인 stage) 한 점 — 입자 sashimi 하나 fly out
  const eatOneBite = () => {
    if (!mixed || bitesEaten >= dining.bites) return;
    const idx = bitesEaten;
    setBitesEaten(idx + 1);
    setReactionIdx(idx % dining.biteReactions.length);
    setShowReaction(true);
    window.setTimeout(() => setShowReaction(false), 1200);

    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const part = particles[i];
      if (part.type !== "sashimi" || part.eaten) continue;
      part.eaten = true;
      const el = particleElsRef.current[i];
      if (el) {
        el.style.transition = "opacity 0.5s, transform 0.5s ease-out";
        el.style.opacity = "0";
        el.style.transform = `translate3d(${part.x - part.r}px, ${part.y - part.r - 60}px, 0) scale(1.8)`;
      }
      break;
    }
  };

  // 밴댕이회 (사이드 접시) 한 점 — sashimiEaten++ 와 함께 반응 멘트
  const eatOneSashimi = () => {
    if (!mixed || sashimiEaten >= SASHIMI_TOTAL) return;
    const idx = sashimiEaten;
    setSashimiEaten(idx + 1);
    setReactionIdx((bitesEaten + idx) % dining.biteReactions.length);
    setShowReaction(true);
    window.setTimeout(() => setShowReaction(false), 1200);
  };

  // 표시할 사장님 멘트 — 비비기 단계: 실시간 진행도별 멘트 / 비빈 후: npcFact / 다 먹은 후: 회상
  const currentNpcText = !mixed
    ? MIX_LINES[npcLineIdx].text
    : allEaten
    ? `잘 먹었지요? ${dining.npcFact}`
    : dining.npcFact;

  // 인트로 단계 — "와~ 2층은 전부 밴댕이네!" 풀스크린. CTA 누르면 비비기 진입.
  if (introShown) {
    return (
      <MarketIntroSplash
        step={GANGHWA_FLOOR2_INTRO}
        onNext={() => setIntroShown(false)}
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-[#FFF4E0] via-cream to-[#FFD9B0]">
      {/* 헤더 */}
      <header className="pt-12 px-5">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="text-[10px] font-extrabold text-primary tracking-[0.16em] uppercase">
            {dining.npcName} · 강화풍물시장 2층
          </p>
        </div>
        <h1 className="mt-2 text-ink text-[18px] font-extrabold leading-snug">
          {dining.dish.name} 한 상
        </h1>
        {/* 실시간 사장님 말풍선 — 멘트 바뀔 때 spring 으로 전환 */}
        <div className="mt-3 rounded-2xl bg-white border border-cream-200 shadow-soft px-4 py-3 min-h-[58px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentNpcText}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-ink text-[13.5px] font-bold leading-relaxed"
            >
              "{currentNpcText}"
            </motion.p>
          </AnimatePresence>
        </div>
      </header>

      {/* 한 상 — 메인 회무침 그릇(중앙) + 사이드 그릇 [밥, 밴댕이회] (하단) */}
      <section className="relative flex-1 flex flex-col items-center justify-center gap-3 px-5">
        <div
          className="relative aspect-square rounded-[40px]
                     bg-gradient-to-br from-[#8B5E3C] to-[#6A4528] shadow-inner
                     flex items-center justify-center select-none"
          style={{ width: STAGE_SIZE + 36 }}
        >
          {/* 그릇 — 위에서 본 큰 원형. 안쪽 stage 영역에서 입자 floating */}
          <div
            ref={stageRef}
            className="relative rounded-full overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
            style={{
              width: STAGE_SIZE,
              height: STAGE_SIZE,
              background:
                "radial-gradient(circle at 35% 30%, #FFF1E0 0%, #F2D9B6 55%, #D8AE7E 100%)",
              border: "6px solid #9A6A40",
              boxShadow:
                "inset 0 4px 12px rgba(80,40,10,0.18), inset 0 -3px 6px rgba(255,255,255,0.4)",
            }}
            onPointerDown={!allEaten ? handleStagePointerDown : undefined}
            onPointerMove={!allEaten ? handleStagePointerMove : undefined}
            onPointerUp={!allEaten ? handleStagePointerUp : undefined}
            onPointerCancel={!allEaten ? handleStagePointerUp : undefined}
            onClick={mixed && !allEaten ? eatOneBite : undefined}
          >
            {/* 입자들 — RAF 가 transform 으로 매 프레임 위치 갱신 */}
            {particlesRef.current.map((part, i) => (
              <div
                key={i}
                ref={(el) => {
                  particleElsRef.current[i] = el;
                }}
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: part.r * 2,
                  height: part.r * 2,
                  borderRadius: "50%",
                  background: COLOR_RAW[part.type],
                  border:
                    part.type === "sashimi"
                      ? "1.5px solid #C99084"
                      : part.type === "sauce"
                      ? "1px solid #A6311E"
                      : "none",
                  boxShadow:
                    part.type === "sashimi"
                      ? "0 1px 2px rgba(80,40,20,0.25)"
                      : "0 1px 1px rgba(0,0,0,0.18)",
                  transform: `translate3d(${part.x - part.r}px, ${part.y - part.r}px, 0)`,
                  pointerEvents: "none",
                  willChange: "transform, opacity, background",
                }}
              />
            ))}
          </div>
        </div>

        {/* === 사이드 그릇 — 밥 + 밴댕이회 한 상 톤 === */}
        <div className="flex items-end justify-center gap-5">
          {/* 밥공기 — 시각만 (비빈 후 회무침에 묻혀 자연스럽게 비빔밥 느낌) */}
          <div className="flex flex-col items-center">
            <MarketIllust variant="rice-bowl" size={64} />
            <p className="mt-0.5 text-[10px] font-extrabold text-ink-mute tracking-wide">밥</p>
          </div>
          {/* 밴댕이회 — 인터랙티브. 비빈 후 탭하면 한 점씩 사라짐 */}
          <button
            type="button"
            onClick={mixed && sashimiEaten < SASHIMI_TOTAL ? eatOneSashimi : undefined}
            disabled={!mixed || sashimiEaten >= SASHIMI_TOTAL}
            className="flex flex-col items-center relative active:scale-[0.96] transition select-none"
            aria-label="밴댕이회 한 점 먹기"
          >
            <div className="relative">
              <MarketIllust variant="bandaegi-sashimi" size={84} />
              {/* 먹은 만큼 회 살을 흰 점으로 가림 — 위치를 SVG 의 ellipse 좌표와 일치시킴 */}
              {[...Array(sashimiEaten)].map((_, i) => {
                // bandaegi-sashimi 의 회 살 6점 좌표(64 viewBox 기준)을 size 84 로 환산
                const xs = [13, 20.5, 28, 35.5, 43, 50.5];
                const xPct = (xs[i] / 64) * 100;
                return (
                  <span
                    key={i}
                    aria-hidden
                    className="absolute"
                    style={{
                      top: `${(40 / 64) * 100}%`,
                      left: `${xPct}%`,
                      width: 12,
                      height: 8,
                      transform: "translate(-50%, -50%)",
                      borderRadius: "50%",
                      background: "#6D8C4B",
                      boxShadow: "inset 0 0 2px rgba(0,0,0,0.2)",
                    }}
                  />
                );
              })}
              {/* mixed 후 안내 펄스 */}
              {mixed && sashimiEaten < SASHIMI_TOTAL && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full pointer-events-none"
                  initial={{ opacity: 0.5, scale: 0.95 }}
                  animate={{ opacity: 0, scale: 1.15 }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,112,67,0.4) 0%, transparent 70%)",
                  }}
                />
              )}
            </div>
            <p
              className={`mt-0.5 text-[10px] font-extrabold tracking-wide
                          ${
                            mixed && sashimiEaten < SASHIMI_TOTAL
                              ? "text-primary"
                              : "text-ink-mute"
                          }`}
            >
              밴댕이회 {mixed ? `(${SASHIMI_TOTAL - sashimiEaten})` : ""}
            </p>
          </button>
        </div>

        {/* 진행 안내 */}
        <p className="text-center text-ink-soft text-[11.5px] font-extrabold pointer-events-none">
          {!mixed
            ? `🥄 손가락으로 그릇 안을 휘저어 비벼봐요 — ${Math.round(mixProgress)}%`
            : !allEaten
            ? `👆 회무침 한 점, 밴댕이회 한 점 ㅡ 골고루 먹어봐요 (${
                dining.bites - bitesEaten + SASHIMI_TOTAL - sashimiEaten
              } 남음)`
            : "🥢 잘 먹었어요"}
        </p>

        {/* 한 입 반응 말풍선 */}
        <AnimatePresence>
          {showReaction && (
            <motion.div
              key={reactionIdx + ":" + bitesEaten}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", damping: 14 }}
              className="absolute top-16 left-1/2 -translate-x-1/2
                         px-4 py-2 rounded-full bg-white shadow-soft
                         border border-cream-200 z-20 pointer-events-none"
            >
              <p className="text-ink text-[13px] font-extrabold whitespace-nowrap">
                "{dining.biteReactions[reactionIdx]}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 하단 CTA — 다 먹은 뒤에만 활성 */}
      <section className="px-5 pb-11">
        <button
          type="button"
          disabled={!allEaten}
          onClick={onFinish}
          className={`w-full h-14 rounded-full text-[14.5px] font-extrabold
                      flex items-center justify-center gap-2 transition active:scale-[0.98]
                      ${
                        allEaten
                          ? "bg-primary text-white shadow-[0_8px_20px_-4px_rgba(255,112,67,0.55)]"
                          : "bg-cream-200 text-ink-mute cursor-not-allowed"
                      }`}
        >
          {allEaten ? "잘 먹었어요 — 한 줄 기록 남기기" : "다 먹고 나면 활성화돼요"}
        </button>
      </section>
    </div>
  );
}

// ===========================================================================
// MarketIntroSplash — 풀스크린 인트로 한 step
//   · 상단 작은 라벨 + 큼직한 타이틀
//   · 중앙: 이미지 (object-cover, 살짝 줌인 모션)
//   · 하단: 캐릭터(바람) 말풍선 + 다음 CTA
//   · 화면 어디 탭해도 다음 진행 (CTA 누르지 않아도 됨)
// ===========================================================================

function MarketIntroSplash({
  step,
  stepIndex,
  totalSteps,
  onNext,
}: {
  step: IntroStep;
  // STEP 카운터 표시용. 단독 인트로(2층 입장 등) 는 미정의로 두면 카운터 숨김.
  stepIndex?: number;
  totalSteps?: number;
  onNext: () => void;
}) {
  const showCounter = stepIndex !== undefined && totalSteps !== undefined;
  return (
    <div
      className="absolute inset-0 bg-ink overflow-hidden cursor-pointer"
      onClick={onNext}
      role="button"
      tabIndex={0}
      style={{ height: "calc(100dvh - var(--content-bottom))" }}
    >
      {/* 풀스크린 이미지 — 살짝 줌인으로 살아있음 */}
      <motion.img
        key={step.image}
        src={step.image}
        alt=""
        aria-hidden
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.3, 1] }}
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />

      {/* 상단 그라데이션 + 라벨 */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[28%]
                   bg-gradient-to-b from-black/65 via-black/20 to-transparent
                   pointer-events-none"
      />
      <header className="absolute top-0 left-0 right-0 pt-12 px-5 z-10 pointer-events-none">
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="text-[10.5px] font-extrabold text-cream tracking-[0.22em] uppercase
                     [text-shadow:0_2px_6px_rgba(0,0,0,0.5)]"
        >
          {showCounter
            ? `STEP ${(stepIndex as number) + 1} / ${totalSteps} · ${step.preLabel}`
            : step.preLabel}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-1 text-white text-[26px] font-extrabold leading-tight
                     [text-shadow:0_3px_10px_rgba(0,0,0,0.5)]"
        >
          {step.title}
        </motion.h1>
      </header>

      {/* 하단 그라데이션 + 캐릭터 말풍선 + CTA */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[44%]
                   bg-gradient-to-t from-black/80 via-black/40 to-transparent
                   pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute left-0 right-0 bottom-0 px-5 pb-7 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 안내자(바람) + 말풍선 */}
        <div className="flex items-end gap-2.5 mb-3">
          <motion.img
            src="/character1/clay-baram-solo.png"
            alt=""
            aria-hidden
            animate={{ y: [-2, 1, -2] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-[64px] h-auto drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] shrink-0"
          />
          <div className="relative flex-1 bg-white rounded-2xl border border-cream-200
                          px-3.5 py-2.5 shadow-[0_10px_24px_-6px_rgba(0,0,0,0.5)]
                          mb-1.5">
            <p className="text-[10px] font-extrabold text-primary leading-none tracking-wider">
              🧭 바람이
            </p>
            <p className="mt-1.5 text-ink text-[13px] leading-snug">
              {step.npc}
            </p>
            <span
              aria-hidden
              className="absolute left-[-6px] bottom-4 w-3 h-3
                         bg-white border-l border-b border-cream-200 rotate-45"
            />
          </div>
        </div>
        {/* CTA — 풀폭. 카드 다른 영역 탭해도 다음 진행되지만, 명시적 액션 강조. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="w-full h-14 rounded-full bg-primary text-white
                     text-[15px] font-extrabold
                     shadow-[0_10px_24px_-6px_rgba(255,112,67,0.65)]
                     active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          {step.cta}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </motion.div>
    </div>
  );
}
