// 레지던스 진입 직후 "찐 홈" — 시뮬레이션의 중심지 (카카오 다육이 톤)
//
// 디자인 (refe.png 레퍼런스):
//   · 상단 좌: "내 집이 자라고 있어요" 헤드라인
//   · 상단 우: 본가로 돌아가기 버튼
//   · 우측 floating 버튼 2개 (알아보기 → 미션리스트, 편지)
//   · 중앙: 둥근 흙무더기 위 클레이 집 + 떠다니는 나비/꽃잎
//   · 하단 카드: Day N · 페르소나 + 진행률 + 액션 2개 (알아보기, 마당 가꾸기)
//
// 본가로 돌아가지 않는 한 시뮬레이션 흐름의 중심지로 남음.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Residence } from "../data/residences";
import {
  HANSEOL_IMAGE,
  HANSEOL_INTRO,
  HANSEOL_NAME,
} from "../data/ganghwaStory";
import {
  DECOR_CATEGORY_META,
  type DecorCategory,
  type DecorItem,
} from "../data/decorItems";

type Props = {
  residence: Residence;
  nickname: string;
  homeRegion: string;
  currentDay: number;
  dayCount: number;
  todayMissionCount: number;
  todayMissionDoneCount: number;
  onGoMissionList: () => void;
  onReturnHome: () => void;
  // 편지함 진입 — 편지 탭 제거 후 ResidenceHomeScreen 의 floating 버튼이 유일 진입점
  onOpenLetters?: () => void;
  letterUnread?: number;
  // === B-1 별도 트랙 — 집 위에 꾸미기 자재 배치 ===
  decorInventory?: DecorItem[];
  // 슬롯별 배치 (현재 레지던스의 것만 받음)
  placedDecor?: Partial<Record<DecorCategory, string>>;
  onUpdatePlaced?: (next: Partial<Record<DecorCategory, string>>) => void;
  // 바람이지음 마스코트 — 하루 종료 임박/충족 알림. 하루 1회 노출은 부모가 게이팅.
  mascot?:
    | { variant: "urgent"; remaining: number; onDismiss: () => void }
    | { variant: "complete"; onDismiss: () => void };
  // 한설 환영 모달 — Day 1 첫 진입 시만 true. 닫으면 onDismissIntro 영속 처리.
  showHanseolIntro?: boolean;
  onDismissHanseolIntro?: () => void;
};

// 슬롯 위치 — SceneStage 320x250 박스 안의 상대 좌표(%).
// 구조: 흙무더기(높이 130) 하단 정렬, 집(폭 200) 중앙. 우편함 우측, 바람·지음 앞쪽.
// 우편함과 우측 슬롯 분리 위해 seat 을 좌측으로, light 만 우상단 유지.
// transform: translate(-50%, -50%) 적용 — 좌표는 슬롯 중심.
const SLOT_POSITIONS: Record<
  DecorCategory,
  { top: string; left: string; size: number; z: number }
> = {
  light:  { top: "8%",  left: "86%", size: 38, z: 5 }, // 지붕 위 우측 등불
  friend: { top: "28%", left: "10%", size: 34, z: 5 }, // 집 좌측 위 작은 친구
  seat:   { top: "62%", left: "14%", size: 44, z: 4 }, // 집 좌측 평상 (우편함과 멀리)
  plant:  { top: "82%", left: "20%", size: 48, z: 4 }, // 마당 좌하단 화분
  stone:  { top: "92%", left: "78%", size: 30, z: 3 }, // 마당 우하단 디딤돌
};

const CATEGORY_ORDER: DecorCategory[] = [
  "plant",
  "seat",
  "stone",
  "light",
  "friend",
];

export default function ResidenceHomeScreen({
  residence,
  nickname,
  homeRegion,
  currentDay,
  dayCount,
  todayMissionCount,
  todayMissionDoneCount,
  onGoMissionList,
  onReturnHome,
  onOpenLetters,
  letterUnread = 0,
  decorInventory = [],
  placedDecor = {},
  onUpdatePlaced,
  mascot,
  showHanseolIntro = false,
  onDismissHanseolIntro,
}: Props) {
  // === 마당 꾸미기 편집 모드 ===
  const [editMode, setEditMode] = useState(false);
  // 편집 모드에서 슬롯 탭 → 어느 카테고리 자재를 고를지 picker 열림
  const [pickingFor, setPickingFor] = useState<DecorCategory | null>(null);
  // 보기 모드에서 배치된 아이템 탭 → 스토리 툴팁
  const [inspecting, setInspecting] = useState<DecorItem | null>(null);

  // 배치 가능한 자재 카운트 — 마당 가꾸기 버튼 sub 표시용
  const decorCount = decorInventory.length;

  // slotKey → DecorItem (배치된 아이템 lookup)
  const placedItems: Partial<Record<DecorCategory, DecorItem>> = {};
  for (const cat of CATEGORY_ORDER) {
    const id = placedDecor[cat];
    if (!id) continue;
    const found = decorInventory.find((d) => d.id === id);
    if (found) placedItems[cat] = found;
  }

  const handlePickItem = (item: DecorItem) => {
    if (!onUpdatePlaced || !pickingFor) return;
    onUpdatePlaced({ ...placedDecor, [pickingFor]: item.id });
    setPickingFor(null);
  };

  const handleRemoveFromSlot = (cat: DecorCategory) => {
    if (!onUpdatePlaced) return;
    const next = { ...placedDecor };
    delete next[cat];
    onUpdatePlaced(next);
  };

  const todayPercent =
    todayMissionCount === 0
      ? 0
      : Math.round((todayMissionDoneCount / todayMissionCount) * 100);

  return (
    <div
      className="relative min-h-[calc(100dvh-6rem)] overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #E8F1FB 0%, #F4F9FB 60%, #FCFAF4 100%)",
      }}
    >
      {/* ===== 상단 헤더 ===== */}
      <header className="relative z-10 pt-12 px-5">
        <h1 className="text-ink text-[22px] font-extrabold leading-tight">
          {nickname}님의 집이
          <br />
          자라고 있어요
        </h1>
        <p className="mt-2 text-ink-soft text-[12.5px]">
          {residence.region}에서 잠시 머무는 중
        </p>
      </header>

      {/* ===== 중앙 씬 — 흙무더기 + 집 + 우편함 + 떠다니는 장식 + 슬롯 ===== */}
      <section className="absolute inset-0 z-0 flex items-center justify-center pt-28 pb-44">
        <SceneStage
          placedItems={placedItems}
          editMode={editMode}
          onTapSlot={(cat) => {
            if (!editMode) return;
            // 비어있으면 picker, 차있으면 그 자리에서 토글 — 어차피 picker 안에서 교체 가능
            setPickingFor(cat);
          }}
          onTapPlaced={(item) => {
            if (editMode) return; // 편집 모드에서는 슬롯 핸들러가 우선
            setInspecting(item);
          }}
          onOpenLetters={onOpenLetters}
          letterUnread={letterUnread}
        />
      </section>


      {/* ===== 하단 — 편집 모드면 편집 바, 아니면 진행률 카드 ===== */}
      <footer className="absolute bottom-4 left-3 right-3 z-10">
        {editMode ? (
          <EditModeBar
            decorCount={decorCount}
            placedCount={Object.keys(placedDecor).length}
            onDone={() => {
              setEditMode(false);
              setPickingFor(null);
            }}
          />
        ) : (
          <div className="bg-white rounded-3xl shadow-[0_8px_24px_-4px_rgba(80,60,40,0.12)] border border-cream-200 p-4">
            {/* 헤더 — 페르소나 + 진행률 */}
            <div className="flex items-baseline justify-between">
              <p className="text-ink text-[15px] font-extrabold">
                Day {currentDay} / {dayCount} · {residence.region}
              </p>
              <p className="text-primary text-[15px] font-extrabold tabular-nums">
                {todayPercent}%
              </p>
            </div>
            {/* 진행 바 */}
            <div className="mt-2 h-1.5 rounded-full bg-cream-200 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-nature-300 to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${todayPercent}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            {/* 오늘 미션 카운트 */}
            <p className="mt-1 text-ink-mute text-[11px]">
              오늘 미션 {todayMissionDoneCount} / {todayMissionCount}
            </p>
            {/* 액션 2개 — grid */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <ActionCard
                emoji="🎯"
                label="알아보기"
                sub={`${todayMissionCount - todayMissionDoneCount}개 미션 남음`}
                onClick={onGoMissionList}
                accent="primary"
              />
              <ActionCard
                emoji="🌿"
                label="마당 가꾸기"
                sub={
                  decorCount > 0
                    ? `자재 ${decorCount}개 · 배치 ${
                        Object.keys(placedDecor).length
                      }개`
                    : "미션 마치면 자재가 쌓여요"
                }
                onClick={
                  decorCount > 0 ? () => setEditMode(true) : undefined
                }
                locked={decorCount === 0}
              />
            </div>
          </div>
        )}
      </footer>

      {/* ===== 자재 picker — 편집 모드에서 빈 슬롯 탭 시 ===== */}
      <DecorPicker
        category={pickingFor}
        inventory={decorInventory}
        currentlyPlacedId={pickingFor ? placedDecor[pickingFor] : undefined}
        onPick={handlePickItem}
        onRemove={() => {
          if (pickingFor) handleRemoveFromSlot(pickingFor);
          setPickingFor(null);
        }}
        onClose={() => setPickingFor(null)}
      />

      {/* ===== 스토리 툴팁 — 보기 모드에서 배치된 아이템 탭 시 ===== */}
      <StoryTooltip
        item={inspecting}
        onClose={() => setInspecting(null)}
      />

      {/* ===== 바람이지음 마스코트 — 종료 임박/충족 안내 ===== */}
      {mascot?.variant === "urgent" && (
        <BaramiMascotUrgent
          remaining={mascot.remaining}
          onDismiss={mascot.onDismiss}
        />
      )}
      {mascot?.variant === "complete" && (
        <BaramiMascotComplete onDismiss={mascot.onDismiss} />
      )}

      {/* ===== 한설 환영 모달 — Day 1 첫 진입 시 1회 ===== */}
      {showHanseolIntro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6
                     bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-[340px] rounded-3xl bg-white shadow-soft
                       overflow-hidden flex flex-col items-center"
          >
            <div
              className="w-full h-[180px] bg-cover bg-center"
              style={{ backgroundImage: `url(${HANSEOL_IMAGE})` }}
              aria-hidden
            />
            <div className="px-6 pt-5 pb-6 w-full text-center">
              <p className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-primary">
                먼저 입주한 선배
              </p>
              <p className="mt-1 text-ink text-[18px] font-extrabold">
                {HANSEOL_NAME}
              </p>
              <p className="mt-3 text-ink-soft text-[13.5px] leading-relaxed">
                {HANSEOL_INTRO}
              </p>
              <button
                type="button"
                onClick={onDismissHanseolIntro}
                className="mt-5 w-full h-12 rounded-full bg-primary text-white
                           text-[14px] font-extrabold
                           shadow-[0_6px_16px_-4px_rgba(255,112,67,0.5)]
                           active:scale-[0.98] transition"
              >
                알겠어요
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// 하단 액션 카드 (알아보기 / 마당 가꾸기)
// ─────────────────────────────────────────────────────────────
function ActionCard({
  emoji,
  label,
  sub,
  onClick,
  accent,
  locked,
}: {
  emoji: string;
  label: string;
  sub: string;
  onClick?: () => void;
  accent?: "primary";
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-left transition
        ${
          accent === "primary"
            ? "bg-primary text-white shadow-[0_4px_12px_-2px_rgba(255,112,67,0.4)]"
            : "bg-cream-50 border border-cream-200 text-ink"
        }
        ${locked ? "opacity-60" : "active:scale-[0.98]"}`}
    >
      <span className="text-[26px] leading-none" aria-hidden>
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12.5px] font-extrabold leading-tight
            ${accent === "primary" ? "text-white" : "text-ink"}`}
        >
          {label}
        </p>
        <p
          className={`text-[10.5px] mt-0.5 leading-tight
            ${accent === "primary" ? "text-white/80" : "text-ink-mute"}`}
        >
          {sub}
        </p>
      </div>
      {locked && (
        <span aria-hidden className="text-[12px] text-ink-mute">
          🔒
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 중앙 씬 — 둥근 흙무더기 + 집 SVG + 떠다니는 나비/꽃잎 + 꾸미기 슬롯
// ─────────────────────────────────────────────────────────────
function SceneStage({
  placedItems,
  editMode,
  onTapSlot,
  onTapPlaced,
  onOpenLetters,
  letterUnread = 0,
}: {
  placedItems: Partial<Record<DecorCategory, DecorItem>>;
  editMode: boolean;
  onTapSlot: (cat: DecorCategory) => void;
  onTapPlaced: (item: DecorItem) => void;
  onOpenLetters?: () => void;
  letterUnread?: number;
}) {
  // 고정 사이즈 컨테이너 — 슬롯 좌표(%)가 집·마당 위에 정확히 맞도록.
  // 흙무더기는 하단에 정렬, 집은 그 위에 얹힘. 슬롯은 % 좌표로 이 박스 안에서 배치.
  return (
    <div className="relative w-[320px] h-[250px]">
      {/* 둥근 흙무더기 platform — 컨테이너 하단 정렬 */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* 흙 그림자 */}
        <div
          aria-hidden
          className="absolute -inset-2 rounded-[50%] blur-md opacity-30"
          style={{ background: "rgba(120, 90, 60, 0.4)" }}
        />
        {/* 흙 본체 — 위에서 본 타원 */}
        <svg
          viewBox="0 0 280 110"
          className="relative w-[320px] h-auto drop-shadow-[0_8px_12px_rgba(80,60,40,0.18)]"
          aria-hidden
        >
          <defs>
            <radialGradient id="dirtTop" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#B7DEB8" />
              <stop offset="70%" stopColor="#8FBC9C" />
              <stop offset="100%" stopColor="#6B9A7A" />
            </radialGradient>
            <linearGradient id="dirtSide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C29470" />
              <stop offset="100%" stopColor="#9A6E4F" />
            </linearGradient>
          </defs>
          {/* 흙 옆면 (땅 단면) */}
          <ellipse cx="140" cy="80" rx="125" ry="25" fill="url(#dirtSide)" />
          <rect x="15" y="55" width="250" height="25" fill="url(#dirtSide)" />
          {/* 흙 윗면 (잔디 위) */}
          <ellipse cx="140" cy="55" rx="125" ry="30" fill="url(#dirtTop)" />
          {/* 작은 풀잎 데코 */}
          <g fill="#5C9B6B" opacity="0.85">
            <ellipse cx="35" cy="58" rx="3" ry="6" />
            <ellipse cx="58" cy="48" rx="2.5" ry="5" />
            <ellipse cx="240" cy="60" rx="3" ry="6" />
            <ellipse cx="220" cy="50" rx="2.5" ry="5" />
            <ellipse cx="100" cy="68" rx="2" ry="4" />
            <ellipse cx="180" cy="70" rx="2" ry="4" />
          </g>
          {/* 작은 자갈 */}
          <g fill="#6B5446" opacity="0.5">
            <circle cx="50" cy="68" r="2" />
            <circle cx="230" cy="65" r="1.5" />
            <circle cx="160" cy="72" r="1.5" />
          </g>
        </svg>
      </div>

      {/* 집 이미지 — 컨테이너 정중앙.
          wrapper 가 translate 로 중앙 정렬, img 는 안에서 framer-motion y 둥실 애니메이션.
          (motion.img 에 inline transform 을 주면 animate.y 가 덮어써서 중앙 정렬이 깨짐) */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <motion.img
          src="/character1/home1.png"
          alt=""
          aria-hidden
          animate={{ y: [-3, 1, -3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="block w-[200px] h-auto select-none
                     drop-shadow-[0_6px_8px_rgba(62,44,32,0.25)]"
        />
      </div>

      {/* 떠다니는 나비 + 꽃잎 */}
      <FloatingDecorations />

      {/* === 집 앞 거주 캐릭터 — 바람이 + 지음이. 마당 정중앙 앞쪽에 둘이 나란히. === */}
      <ResidentCharacter
        src="/character1/clay-baram-solo.png"
        top="84%"
        left="42%"
        width={40}
        animOffset={0}
      />
      <ResidentCharacter
        src="/character1/clay-jieum-solo.png"
        top="84%"
        left="58%"
        width={40}
        animOffset={0.6}
      />

      {/* === 우편함 — 집 오른쪽. unread > 0 일 때 바람이 CTA 도 같이 노출 === */}
      {onOpenLetters && (
        <>
          <Mailbox onClick={onOpenLetters} unread={letterUnread} />
          {letterUnread > 0 && (
            <LetterArrivedCTA unread={letterUnread} onOpen={onOpenLetters} />
          )}
        </>
      )}

      {/* === 꾸미기 슬롯 레이어 — 집 위에 자재 배치 === */}
      <DecorSlotLayer
        placedItems={placedItems}
        editMode={editMode}
        onTapSlot={onTapSlot}
        onTapPlaced={onTapPlaced}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ResidentCharacter — 집 앞 마당의 거주 캐릭터 (바람·지음).
//   · 살짝 둥실 모션, 인터랙션 없음 (장식용).
//   · animOffset 으로 둘이 다른 박자로 흔들리게.
// ─────────────────────────────────────────────────────────────
function ResidentCharacter({
  src,
  top,
  left,
  width,
  animOffset = 0,
}: {
  src: string;
  top: string;
  left: string;
  width: number;
  animOffset?: number;
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top,
        left,
        transform: "translate(-50%, -50%)",
        width,
        zIndex: 4,
      }}
    >
      <motion.img
        src={src}
        alt=""
        aria-hidden
        animate={{
          y: [0, -3, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: animOffset,
        }}
        className="block w-full h-auto select-none
                   drop-shadow-[0_3px_5px_rgba(62,44,32,0.25)]"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mailbox — 마당 좌측에 놓인 우편함.
//   · post1.png 사용. 탭하면 onOpenLetters → 우편함 화면으로.
//   · 안 읽은 편지가 있으면 우측 상단에 카운트 배지.
// ─────────────────────────────────────────────────────────────
function Mailbox({
  onClick,
  unread = 0,
}: {
  onClick: () => void;
  unread?: number;
}) {
  const hasUnread = unread > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={hasUnread ? `우편함 — 새 편지 ${unread}통` : "우편함"}
      className="absolute active:scale-95 transition-transform"
      style={{
        top: "60%",
        left: "90%",
        transform: "translate(-50%, -50%)",
        width: 82,
        zIndex: 6,
      }}
    >
      {/* unread 시 펄스 링 — 우편함 강조 */}
      {hasUnread && (
        <motion.span
          aria-hidden
          animate={{ scale: [1, 1.25, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,112,67,0.55) 0%, transparent 70%)",
          }}
        />
      )}
      <motion.img
        src="/character1/post1.png"
        alt=""
        aria-hidden
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative block w-full h-auto select-none
                   drop-shadow-[0_4px_6px_rgba(62,44,32,0.28)]"
      />
      {hasUnread && (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full
                     bg-primary text-white text-[10px] font-extrabold
                     flex items-center justify-center
                     border-2 border-white shadow-soft z-10"
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// LetterArrivedCTA — 집 앞 바람·지음 거주 캐릭터 위에 떠오르는 말풍선.
//   · 캐릭터 이미지는 따로 안 가짐 — 집 앞 ResidentCharacter 들이 말하는 톤.
//   · 말풍선 꼬리는 아래쪽(거주 캐릭터 향함).
//   · 탭 → 우편함 화면. 우체통 자체는 별도 펄스로 강조.
// ─────────────────────────────────────────────────────────────
function LetterArrivedCTA({
  unread,
  onOpen,
}: {
  unread: number;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 6, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 18, stiffness: 240 }}
      aria-label={`새 편지 ${unread}통 — 우편함 열기`}
      className="absolute z-10 active:scale-[0.96] transition-transform"
      style={{
        top: "62%",
        left: "50%",
        transform: "translate(-50%, -100%)", // 거주 캐릭터(top 84%) 바로 위에 붙도록
      }}
    >
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative bg-white rounded-2xl shadow-[0_4px_10px_-2px_rgba(80,60,40,0.25)]
                   border border-cream-200 px-3 py-1.5 max-w-[160px]"
      >
        <p className="text-ink text-[11.5px] font-extrabold leading-tight whitespace-nowrap">
          편지가 왔어!
        </p>
        <p className="text-ink-soft text-[10.5px] font-bold leading-tight whitespace-nowrap">
          확인해보자!
        </p>
        {/* 말풍선 꼬리 — 아래쪽 중앙(바람·지음 향함) */}
        <span
          aria-hidden
          className="absolute -bottom-[5px] left-1/2 w-2.5 h-2.5 bg-white
                     border-r border-b border-cream-200"
          style={{ transform: "translateX(-50%) rotate(45deg)" }}
        />
      </motion.div>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────
// DecorSlotLayer — SceneStage 위에 슬롯을 절대 좌표로 배치
//   · 편집 모드: 빈 슬롯은 점선 원(탭 가능), 채워진 슬롯은 작은 X 표식 + 이모지
//   · 보기 모드: 채워진 슬롯만 표시. 탭하면 스토리 툴팁.
// ─────────────────────────────────────────────────────────────
function DecorSlotLayer({
  placedItems,
  editMode,
  onTapSlot,
  onTapPlaced,
}: {
  placedItems: Partial<Record<DecorCategory, DecorItem>>;
  editMode: boolean;
  onTapSlot: (cat: DecorCategory) => void;
  onTapPlaced: (item: DecorItem) => void;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {CATEGORY_ORDER.map((cat) => {
        const pos = SLOT_POSITIONS[cat];
        const item = placedItems[cat];
        const meta = DECOR_CATEGORY_META[cat];
        // 보기 모드 + 빈 슬롯이면 렌더 안 함
        if (!editMode && !item) return null;
        return (
          <button
            key={cat}
            type="button"
            aria-label={item ? `${meta.label} — ${item.name}` : `${meta.label} 자리`}
            onClick={() => {
              if (item && !editMode) onTapPlaced(item);
              else onTapSlot(cat);
            }}
            className="absolute pointer-events-auto active:scale-95 transition-transform"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.size,
              height: pos.size,
              transform: "translate(-50%, -50%)",
              zIndex: pos.z,
            }}
          >
            {item ? (
              <span className="relative w-full h-full flex items-center justify-center">
                <motion.span
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 14, stiffness: 240 }}
                  className="leading-none drop-shadow-[0_3px_5px_rgba(80,60,40,0.3)]"
                  style={{ fontSize: pos.size * 0.78 }}
                >
                  {item.emoji}
                </motion.span>
                {editMode && (
                  <span
                    aria-hidden
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white
                               border border-cream-300 shadow-soft
                               flex items-center justify-center text-[8px] font-extrabold text-ink-soft"
                  >
                    ✎
                  </span>
                )}
              </span>
            ) : (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="block w-full h-full rounded-full border-2 border-dashed
                           border-[#A8A085] flex items-center justify-center"
                style={{
                  backgroundColor: `${meta.palette}80`, // 50% alpha
                }}
              >
                <span
                  className="text-ink-mute font-extrabold"
                  style={{ fontSize: pos.size * 0.4 }}
                >
                  +
                </span>
              </motion.span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 편집 모드 하단 바 — 안내 카피 + 완료 버튼
// ─────────────────────────────────────────────────────────────
function EditModeBar({
  decorCount,
  placedCount,
  onDone,
}: {
  decorCount: number;
  placedCount: number;
  onDone: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-3xl shadow-[0_8px_24px_-4px_rgba(80,60,40,0.12)]
                 border border-cream-200 p-4 flex items-center gap-3"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10.5px] font-extrabold tracking-[0.16em] uppercase text-primary">
          꾸미는 중
        </p>
        <p className="mt-0.5 text-ink text-[13.5px] font-extrabold leading-tight">
          빈 자리(+)를 눌러 자재를 놓아보세요
        </p>
        <p className="mt-0.5 text-ink-mute text-[11px]">
          배치 {placedCount} / 5 · 보유 {decorCount}개
        </p>
      </div>
      <button
        type="button"
        onClick={onDone}
        className="shrink-0 bg-primary text-white text-[13px] font-extrabold
                   px-5 py-3 rounded-full shadow-[0_4px_12px_-2px_rgba(255,112,67,0.5)]
                   active:scale-95 transition"
      >
        완료
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// DecorPicker — 편집 모드에서 슬롯 탭 시 떠오르는 바텀시트
//   해당 카테고리 자재 목록 + 현재 배치된 것 옆에 ✓ 표시.
// ─────────────────────────────────────────────────────────────
function DecorPicker({
  category,
  inventory,
  currentlyPlacedId,
  onPick,
  onRemove,
  onClose,
}: {
  category: DecorCategory | null;
  inventory: DecorItem[];
  currentlyPlacedId?: string;
  onPick: (item: DecorItem) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const items = category
    ? inventory.filter((d) => d.category === category)
    : [];
  const meta = category ? DECOR_CATEGORY_META[category] : null;

  return (
    <AnimatePresence>
      {category && meta && (
        <>
          <motion.button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/35"
          />
          <motion.div
            initial={{ x: "-50%", y: "100%" }}
            animate={{ x: "-50%", y: "0%" }}
            exit={{ x: "-50%", y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            role="dialog"
            className="fixed bottom-0 left-1/2 w-full max-w-[420px] z-[60]
                       bg-white rounded-t-3xl shadow-[0_-12px_30px_-12px_rgba(80,70,40,0.18)]
                       px-5 pt-3 pb-[max(env(safe-area-inset-bottom),20px)]"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-cream-200" />
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.16em] uppercase text-ink-mute">
                  Pick
                </p>
                <p className="text-ink text-[16px] font-extrabold leading-tight">
                  <span className="mr-1">{meta.emoji}</span>
                  {meta.label} 자리
                </p>
              </div>
              {currentlyPlacedId && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="text-[11px] font-extrabold text-ink-mute underline underline-offset-2"
                >
                  자리에서 빼기
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="bg-cream-50 border border-cream-200 rounded-2xl p-6 text-center mt-2">
                <p className="text-[28px]" aria-hidden>
                  {meta.emoji}
                </p>
                <p className="mt-2 text-ink-soft text-[12.5px] leading-relaxed">
                  아직 {meta.label} 자재가 없어요.
                  <br />
                  미션을 마치고 다시 와주세요.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
                {items.map((it) => {
                  const isPicked = currentlyPlacedId === it.id;
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => onPick(it)}
                      className={`relative rounded-2xl border p-3 flex flex-col items-center gap-1
                                  active:scale-95 transition text-center
                                  ${
                                    isPicked
                                      ? "border-primary bg-primary/5"
                                      : "border-cream-200 bg-cream-50"
                                  }`}
                    >
                      <span className="text-[32px] leading-none">{it.emoji}</span>
                      <p className="text-[10.5px] font-extrabold text-ink leading-tight line-clamp-2">
                        {it.regionName}
                      </p>
                      <p className="text-[9.5px] font-bold text-ink-mute leading-tight line-clamp-1">
                        {it.missionTitle}
                      </p>
                      {isPicked && (
                        <span
                          aria-hidden
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary
                                     text-white text-[9px] font-extrabold
                                     flex items-center justify-center"
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
// StoryTooltip — 보기 모드에서 배치된 아이템 탭 시 떠오르는 작은 카드
//   "강화도에서 만난 이웃이 준 화분" 같은 스토리텔링 카피.
// ─────────────────────────────────────────────────────────────
function StoryTooltip({
  item,
  onClose,
}: {
  item: DecorItem | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/35"
          />
          <motion.div
            initial={{ x: "-50%", y: 20, opacity: 0, scale: 0.94 }}
            animate={{ x: "-50%", y: 0, opacity: 1, scale: 1 }}
            exit={{ x: "-50%", y: 20, opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", damping: 22, stiffness: 320 }}
            role="dialog"
            className="fixed left-1/2 bottom-32 w-[min(320px,90vw)] z-[60]
                       bg-white rounded-3xl shadow-[0_12px_30px_-8px_rgba(80,60,40,0.25)]
                       border border-cream-200 p-5 text-center"
          >
            <span className="block text-[56px] leading-none mb-2">
              {item.emoji}
            </span>
            <p className="text-[10.5px] font-extrabold tracking-[0.16em] uppercase text-primary">
              {item.regionName}에서
            </p>
            <p className="mt-1 text-ink text-[15px] font-extrabold leading-snug">
              만난 이웃이 준 {DECOR_CATEGORY_META[item.category].label}
            </p>
            <p className="mt-2 text-ink-soft text-[12px] leading-relaxed">
              "{item.missionTitle}" 미션을 마치고 받았어요.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full bg-cream-50 border border-cream-200 text-ink-soft
                         text-[12.5px] font-extrabold py-2.5 rounded-2xl active:scale-95 transition"
            >
              잘 봤어요
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
// 떠다니는 나비 + 꽃잎 (clay tone)
// ─────────────────────────────────────────────────────────────
function FloatingDecorations() {
  return (
    <>
      <motion.span
        aria-hidden
        className="absolute text-[22px] select-none"
        style={{ left: "-10%", top: "10%" }}
        animate={{
          x: [0, 12, 0],
          y: [0, -8, 0],
          rotate: [-8, 8, -8],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🦋
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute text-[18px] select-none"
        style={{ right: "-5%", top: "0%" }}
        animate={{
          x: [0, -10, 0],
          y: [0, 6, 0],
          rotate: [10, -10, 10],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        🦋
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute text-[14px] select-none"
        style={{ right: "5%", top: "55%" }}
        animate={{ y: [0, -6, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        🌸
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute text-[14px] select-none"
        style={{ left: "-2%", top: "60%" }}
        animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        🌼
      </motion.span>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// BaramiMascotUrgent — 종료 임박 (남은 미션 1~2개) 독려
//   · 우하단 floating 말풍선 + 바람이 캐릭터
//   · 탭하면 닫힘 (부모가 하루 1회 게이팅)
// ─────────────────────────────────────────────────────────────
function BaramiMascotUrgent({
  remaining,
  onDismiss,
}: {
  remaining: number;
  onDismiss: () => void;
}) {
  const copy =
    remaining <= 1
      ? "한 개만 더 하면\n오늘 하루 끝!"
      : `${remaining}개만 더 완성해서\n오늘 하루를 마쳐봐!`;
  return (
    <motion.button
      type="button"
      onClick={onDismiss}
      initial={{ opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.92 }}
      transition={{ type: "spring", damping: 22, stiffness: 260 }}
      aria-label="바람이지음 — 닫기"
      className="absolute bottom-32 right-3 z-30 flex items-end gap-2
                 active:scale-[0.97] transition-transform"
    >
      {/* 말풍선 — 우체통 CTA 와 같은 톤(말풍선 + 꼬리) */}
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative bg-white rounded-2xl shadow-[0_4px_10px_-2px_rgba(80,60,40,0.22)]
                   border border-cream-200 px-3 py-2 max-w-[170px] text-left"
      >
        <p className="text-[10px] font-extrabold tracking-[0.16em] uppercase text-primary">
          바람이지음
        </p>
        <p className="mt-0.5 text-ink text-[12px] font-extrabold leading-tight whitespace-pre-line">
          {copy}
        </p>
        {/* 꼬리 — 오른쪽 캐릭터 방향 */}
        <span
          aria-hidden
          className="absolute -right-[5px] bottom-3 w-2.5 h-2.5 bg-white
                     border-r border-b border-cream-200"
          style={{ transform: "rotate(-45deg)" }}
        />
      </motion.div>
      {/* 바람이 — 조금 흔들리며 호소 */}
      <motion.img
        src="/character1/clay-baram-solo.png"
        alt=""
        aria-hidden
        animate={{ y: [-2, 2, -2], rotate: [-4, 4, -4] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="block w-[48px] h-auto select-none
                   drop-shadow-[0_3px_6px_rgba(62,44,32,0.28)]"
      />
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────
// BaramiMascotComplete — 하루 종료 충족 마무리
//   · 중앙 모달 + 바람이/지음이 둘 다 등장
//   · "좋아" 탭하면 onDismiss → 부모가 day-end-ceremony 진입 처리
//   · Phase 4 에서 dismiss 후 퍼즐 조각 애니메이션이 끼움
// ─────────────────────────────────────────────────────────────
function BaramiMascotComplete({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6
                 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 240 }}
        className="w-full max-w-[340px] rounded-3xl bg-white shadow-soft
                   overflow-hidden flex flex-col items-center px-6 pt-6 pb-5"
      >
        <p className="text-[10.5px] font-extrabold tracking-[0.18em] uppercase text-primary">
          바람이지음
        </p>
        {/* 두 캐릭터 — 살짝 다른 박자로 둥실 */}
        <div className="mt-3 flex items-end gap-2">
          <motion.img
            src="/character1/clay-baram-solo.png"
            alt=""
            aria-hidden
            animate={{ y: [-3, 1, -3], rotate: [-3, 3, -3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-[80px] h-auto drop-shadow-[0_4px_8px_rgba(62,44,32,0.28)]"
          />
          <motion.img
            src="/character1/clay-jieum-solo.png"
            alt=""
            aria-hidden
            animate={{ y: [-1, 3, -1], rotate: [3, -3, 3] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
            className="w-[80px] h-auto drop-shadow-[0_4px_8px_rgba(62,44,32,0.28)]"
          />
        </div>
        <h2 className="mt-4 text-ink text-[18px] font-extrabold text-center leading-tight">
          오늘 하루도 잘 보냈어!
        </h2>
        <p className="mt-1.5 text-ink-soft text-[13px] text-center leading-relaxed">
          조각 하나 더 끼워줄게
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 w-full h-12 rounded-full bg-primary text-white
                     text-[14px] font-extrabold
                     shadow-[0_6px_16px_-4px_rgba(255,112,67,0.5)]
                     active:scale-[0.98] transition"
        >
          좋아
        </button>
      </motion.div>
    </div>
  );
}
