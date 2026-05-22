// 미션 수행 화면 — 말해보카 스타일 대화 UI
// 옵션 분기 + 수치 입력 + 적합도 누적 + {amount}/{compare} 치환 지원
// 마지막 turn에서 옵션/입력 종료 시 점수 +N 애니메이션 후 onComplete(fitDelta) 호출.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fitDeltaForOption,
  type BackgroundVariant,
  type Mission,
} from "../data/missions";
import type { LifeStyleType } from "../data/residences";

type Props = {
  mission: Mission;
  residenceMatchType: LifeStyleType;
  onClose: () => void;
  // 누적 적합도 변화량을 함께 전달
  onComplete: (fitDelta: number) => void;
};

export default function MissionExecuteScreen({
  mission,
  residenceMatchType,
  onClose,
  onComplete,
}: Props) {
  const [turnIdx, setTurnIdx] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [picks, setPicks] = useState<string[]>([]);
  // 누적 적합도 변화
  const [fitDelta, setFitDelta] = useState(0);
  // 수치 입력 단계의 임시 값
  const [numericInput, setNumericInput] = useState("");
  // 마지막 수치 입력값 (NPC 텍스트 치환용)
  const [lastAmount, setLastAmount] = useState<number | null>(null);
  // 수치 입력 비교 결과 ("절약형" / "보통" / "풍족형")
  const [lastCompare, setLastCompare] = useState<string>("");

  const turn = mission.dialogues[turnIdx];

  // {amount} / {compare} 치환
  const npcText = turn.npc
    .replace(
      "{amount}",
      lastAmount !== null ? lastAmount.toLocaleString() : ""
    )
    .replace("{compare}", lastCompare);

  const finish = (extraDelta: number) => {
    const total = fitDelta + extraDelta;
    setFitDelta(total);
    setShowReward(true);
    window.setTimeout(() => onComplete(total), 1800);
  };

  const handlePick = (optionIdx: number) => {
    const opt = turn.options?.[optionIdx];
    if (!opt) return;
    const delta = fitDeltaForOption(opt, residenceMatchType);
    setPicks((p) => [...p, opt.label]);

    if (opt.next === undefined) {
      finish(delta);
      return;
    }
    setFitDelta((d) => d + delta);
    setTurnIdx(opt.next);
  };

  const handleNumericSubmit = () => {
    if (!turn.numeric) return;
    const v = Number(numericInput.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(v) || v <= 0) return;
    setLastAmount(v);
    // 벤치마크 기반 비교 라벨
    const bm = turn.numeric.benchmarks;
    if (bm) {
      if (v < bm.low) setLastCompare("이 동네 평균보다 절약형이에요.");
      else if (v > bm.high) setLastCompare("이 동네 평균보단 좀 많이 쓰셨어요.");
      else setLastCompare("이 동네 평균 정도예요.");
    }
    setNumericInput("");
    setTurnIdx(turn.numeric.next);
  };

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col overflow-hidden bg-cream">
      {/* 상단 헤더 */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 pb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow-soft
                     flex items-center justify-center text-ink"
        >
          ✕
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-ink-soft uppercase tracking-widest">
            미션 수행
          </p>
          <p className="text-[14px] font-extrabold text-ink leading-tight truncate">
            {mission.icon} {mission.title}
          </p>
        </div>
        <span className="px-2 py-1 rounded-full bg-white/95 text-primary text-[10px] font-extrabold shadow-soft">
          +{mission.reward}점
        </span>
      </header>

      {/* 배경 + NPC */}
      <section className="relative flex-1 flex items-end justify-center pb-4">
        <Background variant={mission.background} />

        {/* NPC 캐릭터 (배경 위 가운데) */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: [0, -3, 0], opacity: 1 }}
          transition={{
            y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.4 },
          }}
          className="relative z-10 mb-16 flex flex-col items-center"
        >
          {/* 캐릭터 — 이모지 + 그림자 (SVG 일러스트 대체) */}
          <div className="text-[88px] leading-none drop-shadow-lg" aria-hidden>
            {mission.npc.emoji}
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-full bg-white/95 text-ink-soft text-[10px] font-bold shadow-soft">
            {mission.npc.name}
          </span>
        </motion.div>
      </section>

      {/* 하단 대화 패널 */}
      <AnimatePresence mode="wait">
        <motion.section
          key={turnIdx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative z-20 bg-white rounded-t-3xl
                     shadow-[0_-12px_30px_-12px_rgba(80,70,40,0.18)]
                     px-5 pt-4 pb-[max(env(safe-area-inset-bottom),20px)]"
        >
          {/* 말풍선 */}
          <div className="relative">
            <div
              className="absolute left-6 -top-3 w-5 h-5 bg-cream-100 border-l border-t border-cream-200 rotate-45"
              aria-hidden
            />
            <div className="relative bg-cream-100 rounded-2xl px-4 py-3 border border-cream-200">
              <p className="text-[10px] font-bold text-ink-mute mb-1">
                {mission.npc.name}
              </p>
              <p className="text-ink text-[14px] leading-relaxed whitespace-pre-line">
                {npcText}
              </p>
            </div>
          </div>

          {/* 옵션 분기 OR 수치 입력 */}
          {turn.options && (
            <div className="mt-3 space-y-2">
              {turn.options.map((opt, i) => (
                <button
                  key={`${turnIdx}-${i}`}
                  type="button"
                  onClick={() => handlePick(i)}
                  className="w-full text-left px-4 py-3 rounded-2xl
                             bg-white border border-cream-200 text-ink text-[13px] font-semibold
                             hover:bg-cream-50 active:scale-[0.99] transition"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {turn.numeric && (
            <div className="mt-3">
              <label className="text-[11px] font-bold text-ink-soft block mb-1.5">
                {turn.numeric.prompt}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={numericInput}
                  onChange={(e) =>
                    setNumericInput(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder={turn.numeric.placeholder}
                  className="flex-1 px-4 py-3 rounded-2xl border border-cream-200
                             bg-white text-ink text-[14px] focus:outline-none
                             focus:border-primary placeholder:text-ink-mute"
                />
                <span className="self-center text-ink-soft text-[12px] font-bold pr-1">
                  {turn.numeric.unit}
                </span>
              </div>
              <button
                type="button"
                onClick={handleNumericSubmit}
                disabled={!numericInput}
                className="mt-2 w-full py-3 rounded-2xl bg-primary text-white
                           text-[14px] font-extrabold shadow-soft
                           active:scale-[0.99] transition
                           disabled:opacity-40 disabled:active:scale-100"
              >
                기록하기
              </button>
            </div>
          )}

          {/* 진행 인디케이터 */}
          <p className="mt-3 text-center text-[10px] text-ink-mute">
            대화 {turnIdx + 1} / {mission.dialogues.length}
          </p>
        </motion.section>
      </AnimatePresence>

      {/* 미션 완료 보상 오버레이 */}
      <AnimatePresence>
        {showReward && (
          <RewardOverlay reward={mission.reward} />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================================
// 배경 — variant별 단순 SVG 일러스트
// =====================================================================

function Background({ variant }: { variant: BackgroundVariant }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="bgSky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFE4C8" />
          <stop offset="1" stopColor="#FFF8F0" />
        </linearGradient>
        <linearGradient id="bgFloor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#EDDFC2" />
          <stop offset="1" stopColor="#D8C49E" />
        </linearGradient>
      </defs>
      {/* 공통 배경 */}
      <rect width="100" height="65" fill="url(#bgSky)" />
      <rect y="65" width="100" height="35" fill="url(#bgFloor)" />
      {/* 호라이즌 */}
      <line x1="0" y1="65" x2="100" y2="65" stroke="#B89E78" strokeWidth="0.3" />

      {variant === "market" && (
        <g>
          {/* 시장 차양 */}
          <path d="M 8 28 L 92 28 L 88 38 L 12 38 Z" fill="#E76F51" />
          <path d="M 12 38 L 88 38" stroke="#FFFFFF" strokeWidth="0.6" strokeDasharray="2 3" />
          {/* 좌판 박스 */}
          <rect x="14" y="56" width="22" height="12" fill="#A8755A" />
          <rect x="14" y="54" width="22" height="3" fill="#7B5640" />
          <rect x="40" y="56" width="22" height="12" fill="#A8755A" />
          <rect x="40" y="54" width="22" height="3" fill="#7B5640" />
          <rect x="66" y="56" width="22" height="12" fill="#A8755A" />
          <rect x="66" y="54" width="22" height="3" fill="#7B5640" />
          {/* 채소 */}
          <circle cx="20" cy="52" r="2" fill="#7BB57F" />
          <circle cx="26" cy="51" r="2.5" fill="#A8D5A8" />
          <circle cx="46" cy="52" r="2" fill="#FF7043" />
          <circle cx="52" cy="51" r="2.5" fill="#FFC53D" />
          <circle cx="72" cy="51" r="2" fill="#7BB57F" />
        </g>
      )}

      {variant === "hospital" && (
        <g>
          {/* 병원 로비 */}
          <rect x="0" y="20" width="100" height="45" fill="#F4F4F4" />
          <rect x="20" y="30" width="60" height="20" fill="#E55A30" rx="1" />
          <rect x="34" y="34" width="6" height="12" fill="#FFFFFF" />
          <rect x="29" y="38" width="16" height="4" fill="#FFFFFF" />
          <rect x="55" y="35" width="22" height="3" fill="#FFFFFF" />
          <text x="50" y="60" fontSize="3" fill="#3E2C20" textAnchor="middle" fontWeight="bold">
            거제 종합병원
          </text>
          {/* 접수 데스크 */}
          <rect x="14" y="70" width="72" height="10" fill="#D9C2A2" />
          <rect x="14" y="68" width="72" height="3" fill="#7B5640" />
        </g>
      )}

      {variant === "cafe" && (
        <g>
          {/* 카페 인테리어 */}
          <rect x="0" y="20" width="100" height="45" fill="#EFE0CB" />
          {/* 선반 */}
          <rect x="8" y="30" width="84" height="2" fill="#7B5640" />
          <circle cx="14" cy="36" r="2.5" fill="#FFFFFF" />
          <circle cx="22" cy="36" r="2.5" fill="#A8755A" />
          <circle cx="30" cy="36" r="2.5" fill="#FFFFFF" />
          <rect x="40" y="33" width="6" height="6" fill="#5A4630" />
          <rect x="50" y="33" width="6" height="6" fill="#5A4630" />
          {/* 카운터 */}
          <rect x="10" y="56" width="80" height="12" fill="#A8755A" />
          <rect x="10" y="54" width="80" height="3" fill="#7B5640" />
        </g>
      )}

      {variant === "home" && (
        <g>
          {/* 거실 */}
          <rect x="0" y="20" width="100" height="45" fill="#FBE6C2" />
          {/* 창문 */}
          <rect x="22" y="28" width="22" height="18" fill="#A4C8DE" />
          <line x1="33" y1="28" x2="33" y2="46" stroke="#FFFFFF" strokeWidth="0.6" />
          <line x1="22" y1="37" x2="44" y2="37" stroke="#FFFFFF" strokeWidth="0.6" />
          {/* 액자 */}
          <rect x="58" y="30" width="12" height="14" fill="#7B5640" />
          <rect x="59" y="31" width="10" height="12" fill="#F4E5C0" />
          {/* 소파 */}
          <rect x="10" y="60" width="80" height="8" fill="#A8755A" rx="1" />
        </g>
      )}

      {variant === "office" && (
        <g>
          <rect x="0" y="20" width="100" height="45" fill="#E8F0F4" />
          {/* 책상 */}
          <rect x="14" y="58" width="72" height="10" fill="#A8755A" />
          <rect x="14" y="56" width="72" height="3" fill="#7B5640" />
          {/* 노트북 */}
          <rect x="40" y="50" width="22" height="8" fill="#3E2C20" />
          <rect x="40" y="50" width="22" height="2" fill="#5A4630" />
          {/* 컵 */}
          <rect x="68" y="50" width="6" height="8" fill="#FFFFFF" />
          {/* 보드 */}
          <rect x="22" y="28" width="56" height="18" fill="#FFFFFF" />
          <line x1="28" y1="34" x2="72" y2="34" stroke="#B89E78" strokeWidth="0.3" />
          <line x1="28" y1="38" x2="72" y2="38" stroke="#B89E78" strokeWidth="0.3" />
          <line x1="28" y1="42" x2="60" y2="42" stroke="#B89E78" strokeWidth="0.3" />
        </g>
      )}

      {variant === "transit" && (
        <g>
          {/* 도로 */}
          <rect x="0" y="55" width="100" height="20" fill="#A8755A" />
          <path
            d="M 0 65 L 100 65"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeDasharray="6 6"
          />
          {/* 버스 정류장 */}
          <rect x="60" y="36" width="28" height="3" fill="#5A4630" />
          <path d="M 60 36 L 64 32 L 84 32 L 88 36 Z" fill="#7B5640" />
          <rect x="61" y="39" width="2" height="22" fill="#5A5D60" />
          <rect x="85" y="39" width="2" height="22" fill="#5A5D60" />
          <rect x="64" y="42" width="20" height="14" fill="#FFFFFF" />
          {/* 버스 (멀리서) */}
          <rect x="6" y="58" width="22" height="9" fill="#FFC53D" rx="1" />
          <rect x="8" y="60" width="6" height="4" fill="#A4C8DE" />
          <rect x="16" y="60" width="6" height="4" fill="#A4C8DE" />
          <circle cx="11" cy="68" r="1.4" fill="#3E2C20" />
          <circle cx="23" cy="68" r="1.4" fill="#3E2C20" />
        </g>
      )}

      {variant === "library" && (
        <g>
          <rect x="0" y="20" width="100" height="45" fill="#F4E5C0" />
          {/* 책장들 */}
          {[0, 1, 2].map((row) =>
            Array.from({ length: 4 }, (_, col) => (
              <g key={`shelf-${row}-${col}`}>
                <rect
                  x={10 + col * 20}
                  y={28 + row * 12}
                  width="16"
                  height="10"
                  fill="#7B5640"
                />
                {Array.from({ length: 5 }, (_, b) => (
                  <rect
                    key={b}
                    x={10 + col * 20 + 1 + b * 3}
                    y={29 + row * 12}
                    width="2.5"
                    height="8"
                    fill={
                      b % 3 === 0
                        ? "#E55A30"
                        : b % 3 === 1
                        ? "#7BB57F"
                        : "#A4C8DE"
                    }
                  />
                ))}
              </g>
            ))
          )}
        </g>
      )}

      {variant === "neighbor" && (
        <g>
          <rect x="0" y="20" width="100" height="45" fill="#EFE0CB" />
          {/* 거실 큰 창 */}
          <rect x="20" y="26" width="60" height="22" fill="#A4C8DE" />
          <line x1="50" y1="26" x2="50" y2="48" stroke="#FFFFFF" strokeWidth="0.6" />
          {/* 식탁 */}
          <rect x="22" y="60" width="56" height="8" fill="#A8755A" rx="1" />
          {/* 찻주전자 */}
          <rect x="40" y="54" width="8" height="6" fill="#7B5640" rx="1" />
          <rect x="52" y="55" width="4" height="5" fill="#FFFFFF" />
          <rect x="58" y="55" width="4" height="5" fill="#FFFFFF" />
        </g>
      )}
    </svg>
  );
}

// =====================================================================
// 미션 완료 보상 오버레이 — +N 점 애니메이션
// =====================================================================

function RewardOverlay({ reward }: { reward: number }) {
  return (
    <>
      <motion.div
        className="absolute inset-0 bg-black/55 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      {/* 중앙 정렬은 wrapper, 등장 애니메이션은 안쪽 motion에서 — transform 충돌 회피 */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 16, stiffness: 220 }}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 10 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-nature-300 to-nature-500
                     flex items-center justify-center text-5xl text-white shadow-soft"
          aria-hidden
        >
          ✓
        </motion.div>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-white text-[18px] font-extrabold"
        >
          미션 완료!
        </motion.p>
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: [0, -8, 0], opacity: 1 }}
          transition={{
            opacity: { delay: 0.5, duration: 0.4 },
            y: { delay: 0.5, duration: 1.2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="mt-2 px-4 py-2 rounded-full bg-primary text-white text-[20px] font-extrabold shadow-soft"
        >
          축적 점수 +{reward}
        </motion.div>
      </motion.div>
      </div>
    </>
  );
}
