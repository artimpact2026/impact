// 이동 애니메이션 화면 — PRD 2.이동 애니메이션
// 본 지역 → 목적지로 점선 화살표가 그려지고, 봇짐 캐릭터가 그 위를 따라 이동
// 도착 직전에 화면이 부드럽게 어두워지고(페이드 아웃), 부모가 ArrivalScreen으로 전환한다.

import { useEffect } from "react";
import { motion } from "framer-motion";
import KoreaMap from "../components/KoreaMap";
import type { RegionPos } from "../data/regions";

type Endpoint = RegionPos & { region: string };

type Props = {
  origin: Endpoint;
  destination: Endpoint;
  // 헤더 안내문(상단 작은 글씨). 역방향 시 "집으로 돌아가는 중" 등으로 사용
  caption?: string;
  onComplete: () => void;
};

// 애니메이션 타이밍 (ms) — 한 곳에서 관리
const TRAVEL_MS = 2400;
const FADE_MS = 700;
const TOTAL_MS = TRAVEL_MS + FADE_MS;

export default function TravelingScreen({
  origin,
  destination,
  caption = "바람을 따라 이동 중",
  onComplete,
}: Props) {
  // 애니메이션 종료 후 부모에게 알림 → 도착 화면으로 전환
  useEffect(() => {
    const t = setTimeout(onComplete, TOTAL_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  // 곡선 화살표용 컨트롤 포인트 — 두 점의 중간을 약간 위로 올려 부드러운 호 생성
  const midX = (origin.xPct + destination.xPct) / 2;
  const midY = (origin.yPct + destination.yPct) / 2 - 8;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col overflow-hidden">
      {/* 배경 그라데이션 */}
      <div
        className="absolute inset-0 -z-10
                   bg-gradient-to-b from-[#EAF4FB] via-cream to-cream"
        aria-hidden
      />

      {/* 상단 안내 */}
      <header className="pt-12 px-6 text-center">
        <p className="text-ink-soft text-[12px] font-medium">{caption}</p>
        <h1 className="mt-1 text-ink text-[20px] font-extrabold">
          {origin.region} <span className="text-primary">→</span> {destination.region}
        </h1>
      </header>

      {/* 지도 */}
      <section className="flex-1 px-3 mt-4 flex items-start justify-center">
        <div className="w-full max-w-[320px]">
          <KoreaMap>
            {/* 화살표 경로 (SVG 오버레이) — viewBox 100x100 + preserveAspectRatio=none 으로 % 좌표 그대로 사용 */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden
            >
              <motion.path
                d={`M ${origin.xPct} ${origin.yPct} Q ${midX} ${midY} ${destination.xPct} ${destination.yPct}`}
                fill="none"
                stroke="#FF7043"
                strokeWidth="0.5"
                strokeDasharray="1.5 1.8"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: TRAVEL_MS / 1000, ease: "easeInOut" }}
              />
            </svg>

            {/* 출발지(본 지역) 표시 */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
              style={{ left: `${origin.xPct}%`, top: `${origin.yPct}%` }}
            >
              <span className="text-[10px] font-bold text-ink-soft px-1.5 py-0.5 bg-white/90 rounded-full shadow-soft">
                {origin.region}
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-ink-soft border-2 border-white" />
            </div>

            {/* 목적지 마커 — 핀 + 펄스 */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${destination.xPct}%`, top: `${destination.yPct}%` }}
            >
              <motion.span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                           w-6 h-6 rounded-full bg-primary/40"
                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                aria-hidden
              />
              <span className="relative block w-3 h-3 rounded-full bg-primary border-2 border-white shadow-soft" />
            </div>

            {/* 이동하는 봇짐 캐릭터 — 곡선의 컨트롤 포인트를 키프레임 중간에 끼워 호를 따라가게 함 */}
            <motion.div
              className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow"
              initial={{
                left: `${origin.xPct}%`,
                top: `${origin.yPct}%`,
                opacity: 0,
                scale: 0.6,
              }}
              animate={{
                left: [`${origin.xPct}%`, `${midX}%`, `${destination.xPct}%`],
                top: [`${origin.yPct}%`, `${midY}%`, `${destination.yPct}%`],
                opacity: [0, 1, 1],
                scale: [0.6, 1, 1],
              }}
              transition={{
                duration: TRAVEL_MS / 1000,
                ease: "easeInOut",
                times: [0, 0.5, 1],
              }}
              aria-hidden
            >
              🎒
            </motion.div>
          </KoreaMap>
        </div>
      </section>

      {/* 페이드 아웃 오버레이 — TRAVEL_MS 직후 화면 어두워짐 */}
      <motion.div
        className="absolute inset-0 bg-ink pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: TRAVEL_MS / 1000,
          duration: FADE_MS / 1000,
          ease: "easeIn",
        }}
        aria-hidden
      />
    </div>
  );
}
