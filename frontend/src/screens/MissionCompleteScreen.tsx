// 미션 완료 후 결과 화면 (v2 — 감정·여운 살린 디자인)
//
// 구조:
//   상단 — 풀블리드 히어로 (카테고리별 컬러 + 인용구)
//   하단 — 크림 시트가 히어로 아래로 슬라이드업
//          · 점수 2칸 (축적 + 적합도 + 게이지)
//          · NPC가 알려준 것들 (아이콘 + 정보)
//          · 내가 고른 답들 (칩, 부정 답변 회색)
//          · CTA
//
// 인용구는 mission.dialogues 의 마지막 NPC 발화에서 발췌 (placeholder 토큰 제거).

import { motion, AnimatePresence } from "framer-motion";
import type { Mission, MissionCategory } from "../data/missions";

export type MissionKeyInfo = { icon: string; text: string };

type Props = {
  mission: Mission;
  reward: number;
  totalScore: number;
  fitScore: number;
  fitScoreDelta: number;
  keyInfos: MissionKeyInfo[];
  pickedLabels: string[];
  isLastMissionToday: boolean;
  onNext: () => void;
};

// 카테고리 → 히어로 배경색
const HERO_COLOR: Record<MissionCategory, string> = {
  관계형성형: "#FF7043",
  생활현실형: "#66BB6A",
  "감정/분위기형": "#5C9BD6",
};

// 마지막 NPC 발화 — 인용구로. {amount}/{compare} 같은 동적 토큰 제거.
function pickLastNpcLine(mission: Mission): string {
  for (let i = mission.dialogues.length - 1; i >= 0; i--) {
    const raw = mission.dialogues[i]?.npc?.trim();
    if (raw) return raw.replace(/\{amount\}|\{compare\}/g, "").trim();
  }
  return "";
}

export default function MissionCompleteScreen({
  mission,
  reward,
  totalScore,
  fitScore,
  fitScoreDelta,
  keyInfos,
  pickedLabels,
  isLastMissionToday,
  onNext,
}: Props) {
  const heroColor = HERO_COLOR[mission.category] ?? "#FF7043";
  const quote = pickLastNpcLine(mission);
  const deltaText =
    fitScoreDelta > 0
      ? `이전 대비 +${fitScoreDelta}`
      : fitScoreDelta < 0
      ? `이전 대비 ${fitScoreDelta}`
      : "이전과 동일";

  return (
    <div className="h-[calc(100dvh-6rem)] overflow-y-auto bg-[#FAF6EE]">
      {/* === 히어로 — 풀블리드 컬러 === */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative px-5 pt-9 pb-12 overflow-hidden text-white"
        style={{ backgroundColor: heroColor }}
      >
        {/* 우상단 반투명 원 장식 */}
        <div
          aria-hidden
          className="absolute -top-10 -right-12 w-48 h-48 rounded-full bg-white"
          style={{ opacity: 0.14 }}
        />
        <div
          aria-hidden
          className="absolute top-12 right-8 w-24 h-24 rounded-full bg-white"
          style={{ opacity: 0.09 }}
        />

        {/* 라벨 */}
        <p className="relative text-[11px] font-bold tracking-[0.22em] uppercase opacity-70">
          Mission · 완료
        </p>

        {/* NPC 행 */}
        <div className="relative mt-5 flex items-center gap-2.5">
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center text-[20px] shrink-0"
            style={{ background: "rgba(255,255,255,0.25)" }}
            aria-hidden
          >
            {mission.npc.emoji}
          </span>
          <span className="text-[14px] font-extrabold">{mission.npc.name}</span>
        </div>

        {/* 미션 제목 */}
        <h1 className="relative mt-3 text-[26px] font-extrabold leading-tight">
          {mission.title}
        </h1>

        {/* 인용구 */}
        {quote && (
          <div className="relative mt-4 pl-3 border-l-2 border-white/80">
            <p
              className="text-[13px] italic leading-relaxed"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              "{quote}"
            </p>
          </div>
        )}

        {/* === 즉각 피드백 — "이 지역의 조각이 +1 모임" 톤 ===
            말해보카처럼 미션 직후 시각/감정 reward 가 즉시 들어옴.
            모자이크 그리드(20칸) 중 1칸이 ✨와 함께 채워지는 애니메이션. */}
        <PieceCelebration />
      </motion.section>

      {/* === 바디 시트 — 히어로 아래로 슬라이드업 === */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="relative -mt-5 px-5 pt-5 pb-10 space-y-3 bg-[#FAF6EE] rounded-t-3xl"
      >
        {/* === 점수 카드 2칸 === */}
        <div className="grid grid-cols-2 gap-3">
          {/* 축적 점수 */}
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <p className="text-[11px] font-bold text-ink-mute tracking-wide uppercase">
              축적 점수
            </p>
            <p className="mt-1.5 text-[28px] font-extrabold leading-none tabular-nums text-[#FF7043]">
              +{reward}
              <span className="text-[14px] ml-0.5 font-bold">점</span>
            </p>
            <p className="mt-2 text-[11px] text-ink-soft">
              총{" "}
              <span className="text-ink font-bold tabular-nums">
                {totalScore}
              </span>
              점 누적
            </p>
          </div>

          {/* 적합도 + 게이지 */}
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <p className="text-[11px] font-bold text-ink-mute tracking-wide uppercase">
              이 지역 적합도
            </p>
            <p className="mt-1.5 text-[28px] font-extrabold leading-none tabular-nums text-[#66BB6A]">
              {fitScore}
            </p>
            <div className="mt-2 h-[6px] rounded-full bg-[#F0E8DF] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fitScore}%` }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full bg-[#66BB6A]"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-ink-soft">{deltaText}</p>
          </div>
        </div>

        {/* === NPC가 알려준 것들 === */}
        {keyInfos.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-soft">
            <h2 className="text-[15px] font-extrabold text-[#3D3530] mb-3">
              {mission.npc.name}이(가) 알려준 것들
            </h2>
            <ul>
              {keyInfos.map((info, i) => {
                const isLast = i === keyInfos.length - 1;
                return (
                  <li
                    key={i}
                    className={`flex items-center gap-3 py-2.5 ${
                      isLast ? "" : "border-b border-[#F5EFE8]"
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[15px] shrink-0"
                      style={{ background: "#FFF0EB" }}
                      aria-hidden
                    >
                      {info.icon}
                    </span>
                    <p className="flex-1 text-[14px] leading-relaxed text-[#3D3530]">
                      {info.text}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* === 내가 고른 답들 === */}
        {pickedLabels.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-soft">
            <h2 className="text-[15px] font-extrabold text-[#3D3530] mb-2.5">
              내가 고른 답들
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {pickedLabels.map((label, i) => {
                const isNeg = label === "(부정 답변)";
                return (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-[20px] text-[12px] font-bold border`}
                    style={
                      isNeg
                        ? {
                            background: "#F5F5F5",
                            color: "#999",
                            borderColor: "#E8E8E8",
                          }
                        : {
                            background: "#FAF6EE",
                            color: "#993C1D",
                            borderColor: "#FFD4C2",
                          }
                    }
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* === CTA === */}
        <button
          type="button"
          onClick={onNext}
          className="w-full mt-2 py-[18px] rounded-2xl text-white text-[15px] font-extrabold
                     shadow-soft active:scale-[0.99] transition"
          style={{ background: "#FF7043" }}
        >
          {isLastMissionToday ? "오늘 하루 마무리하기" : "다음 미션 보기 →"}
        </button>
      </motion.div>
    </div>
  );
}

// =====================================================================
// PieceCelebration — 미션 완료 즉시 피드백
//   · 캡션: "이 지역의 조각이 +1 모임 ✨"
//   · 모자이크 그리드: 20칸 중 무작위 한 칸이 ✨와 함께 sparkle pop
//   · 짧고 가벼운 모션 — 사용자가 화면에 도착하자마자 0.6s 정도 시선 끌고 끝
// =====================================================================

function PieceCelebration() {
  const TILES = 20;
  const newTileIndex = Math.floor(Math.random() * TILES);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="relative mt-5 flex items-center gap-3"
    >
      {/* 모자이크 그리드 — 5열 4행 */}
      <div className="grid grid-cols-5 gap-[3px] w-[88px]">
        {Array.from({ length: TILES }).map((_, i) => {
          const isNew = i === newTileIndex;
          // 이미 채워진 칸 — 살짝 옅게(약 35% 확률) → 누적된 느낌
          const alreadyFilled = !isNew && (i * 7) % 11 < 4;
          return (
            <motion.span
              key={i}
              aria-hidden
              className="block w-[14px] h-[14px] rounded-[3px]"
              style={{
                background: isNew
                  ? "rgba(255,255,255,0.95)"
                  : alreadyFilled
                  ? "rgba(255,255,255,0.55)"
                  : "rgba(255,255,255,0.18)",
              }}
              initial={isNew ? { scale: 0, opacity: 0 } : false}
              animate={
                isNew
                  ? {
                      scale: [0, 1.35, 1],
                      opacity: [0, 1, 0.95],
                      boxShadow: [
                        "0 0 0 0 rgba(255,255,255,0)",
                        "0 0 18px 4px rgba(255,255,255,0.7)",
                        "0 0 0 0 rgba(255,255,255,0)",
                      ],
                    }
                  : false
              }
              transition={
                isNew
                  ? { duration: 0.9, delay: 0.75, ease: "easeOut" }
                  : undefined
              }
            />
          );
        })}
      </div>

      {/* 우측 캡션 + sparkle */}
      <div className="relative flex-1 min-w-0">
        <AnimatePresence>
          <motion.span
            key="sparkle"
            aria-hidden
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.85, duration: 0.5, type: "spring" }}
            className="absolute -left-1 -top-2 text-[18px] select-none"
          >
            ✨
          </motion.span>
        </AnimatePresence>
        <motion.p
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="text-[12.5px] font-extrabold leading-tight"
          style={{ color: "rgba(255,255,255,0.95)" }}
        >
          이 지역의 조각이
          <br />
          <span className="text-[14.5px]">+1 모였어요</span>
        </motion.p>
      </div>
    </motion.div>
  );
}
