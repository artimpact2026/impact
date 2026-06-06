// 레지던스 진입 직후 "찐 홈" — 시뮬레이션의 중심지.
//
// 디자인 톤 (v2 — 감성 여행 몰입):
//   · 풀블리드 풍경 + 상하 그라데이션 마스크 → "지금 여기" 분위기 우선
//   · 작은 메타("DAY 4 / 6") 제거 → 일차는 상단 도트 인디케이터로만 표현
//   · 메인 타이틀은 중앙 상단의 큰 감성 헤드라인: "영월에서의 / 4일째 밤"
//   · 환영문구 한 문장 — "{닉}님, 지금 {지역}의 {시간대}을 여행 중이에요"
//   · 하단은 단 하나의 글래스 카드 — '오늘의 주요 일정' (진행률 텍스트 노출 X)
//   · 본가로 돌아가기는 헤더 좌측 back 버튼으로 흡수 → 본문 정보 다이어트
//
// 레이아웃:
//   · min-h-[100dvh] + paddingBottom: var(--content-bottom)
//     → 하단 floating 시뮬레이션 버튼/탭바와 절대 겹치지 않음

import { motion } from "framer-motion";
import type { Residence } from "../data/residences";

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
};

// 지역별 풀스크린 배경 — 자산 있는 곳만 매핑, 없으면 그라데이션 폴백
const HOME_BG_IMAGE: Record<string, string> = {
  ganghwa: "/home_ganghwa.png",
  yeongwol: "/home_yeongwol.png",
};

type TimeOfDay = "아침" | "오후" | "저녁" | "밤";
function pickTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "아침";
  if (h >= 11 && h < 17) return "오후";
  if (h >= 17 && h < 21) return "저녁";
  return "밤";
}

// "을/를" 자동 — 마지막 음절 받침 유무로 결정
function objParticle(word: string): "을" | "를" {
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return "를";
  const jong = (last - 0xac00) % 28;
  return jong === 0 ? "를" : "을";
}

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
}: Props) {
  const bgImage = HOME_BG_IMAGE[residence.id];
  const tod = pickTimeOfDay();
  const remaining = Math.max(0, todayMissionCount - todayMissionDoneCount);
  const allDone = todayMissionCount > 0 && remaining === 0;
  const todPart = objParticle(tod);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      {/* ===== 풀블리드 배경 — 100dvh 전체 (floating 버튼 뒤까지 이어짐) ===== */}
      <div
        aria-hidden
        className="absolute inset-0
                   bg-[linear-gradient(to_bottom,#1B2545_0%,#3B4566_45%,#574438_100%)]"
      />
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* 상하 가독성 마스크 — 텍스트 영역 안정적으로 어둡게 */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none
                   bg-gradient-to-b from-black/40 via-black/10 to-black/50"
      />

      {/* ===== 콘텐츠 — paddingBottom 으로 nav/floating 버튼 클리어런스 보장 ===== */}
      <div
        className="relative z-10 flex flex-col min-h-[100dvh] px-7"
        style={{ paddingBottom: "var(--content-bottom)" }}
      >
        {/* ── 헤더 — 작은 인디케이터 두 개 (왼: 본가 / 오: 일차 도트) ────── */}
        <header className="pt-12 flex items-center justify-between">
          <motion.button
            type="button"
            onClick={onReturnHome}
            aria-label={`${homeRegion}로 돌아가기`}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileTap={{ scale: 0.94 }}
            className="w-10 h-10 rounded-full
                       bg-white/15 backdrop-blur-md border border-white/25
                       flex items-center justify-center
                       text-white text-[16px] font-bold
                       shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25)]"
          >
            ←
          </motion.button>

          {/* 일차 도트 — 활성 일차만 길쭉. dayCount 만큼만 표시 */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="flex items-center gap-1.5"
            role="status"
            aria-label={`총 ${dayCount}일 중 ${currentDay}일째`}
          >
            {Array.from({ length: dayCount }).map((_, i) => {
              const day = i + 1;
              const past = day < currentDay;
              const now = day === currentDay;
              return (
                <span
                  key={day}
                  aria-hidden
                  className={`h-1 rounded-full transition-all duration-300
                    ${
                      now
                        ? "w-6 bg-white"
                        : past
                        ? "w-1.5 bg-white/70"
                        : "w-1.5 bg-white/25"
                    }`}
                />
              );
            })}
          </motion.div>
        </header>

        {/* ── 메인 — 중앙 상단 감성 헤드라인 ───────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="mt-16 text-center"
        >
          <h1
            className="text-white font-extrabold leading-[1.05] tracking-[-0.02em]
                       drop-shadow-[0_4px_14px_rgba(0,0,0,0.4)]"
          >
            <span className="block text-[22px] font-bold opacity-80">
              {residence.region}에서의
            </span>
            <span className="block mt-2.5 text-[54px]">
              {currentDay}일째 {tod}
            </span>
          </h1>

          {/* 환영 문구 — 두 줄 부제 */}
          <p
            className="mt-8 text-white/90 text-[14.5px] leading-[1.75]
                       drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
          >
            <span className="font-extrabold">{nickname}</span>님, 지금
            <br />
            {residence.region}의 {tod}
            {todPart} 여행 중이에요
          </p>
        </motion.section>

        {/* 본문은 비워둠 — 풍경이 호흡하는 공간 */}
        <div className="flex-1" />

        {/* ── 오늘의 주요 일정 — 글래스모피즘 카드 한 장 ──────────────── */}
        <motion.button
          type="button"
          onClick={onGoMissionList}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-[28px] text-left
                     bg-white/[0.14] backdrop-blur-2xl
                     border border-white/25
                     px-5 py-4 flex items-center gap-4
                     shadow-[0_12px_30px_-8px_rgba(0,0,0,0.35)]
                     transition active:bg-white/20"
        >
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-[10px] font-extrabold tracking-[0.24em] uppercase">
              Today's plan
            </p>
            <p className="mt-1.5 text-white text-[16px] font-extrabold leading-tight">
              오늘의 주요 일정
            </p>
            <p className="mt-1 text-white/75 text-[11.5px] leading-relaxed">
              {todayMissionCount === 0
                ? "오늘은 비워둔 하루예요"
                : allDone
                ? "오늘의 일정 모두 마쳤어요 ✓"
                : `${todayMissionCount}개의 만남이 기다려요`}
            </p>
          </div>
          <span
            aria-hidden
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur
                       border border-white/30
                       flex items-center justify-center text-white text-[16px]"
          >
            →
          </span>
        </motion.button>
      </div>
    </div>
  );
}
