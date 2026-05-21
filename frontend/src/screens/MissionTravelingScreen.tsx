// 미션 이동 연출 화면 — 미션 선택 후 실제 장소로 걸어가는 감각을 주는 1.5초 트랜지션
// 캐릭터 걷기 모션 + 길 위 발걸음 + 진행 바 + 도착지 라벨

import { useEffect } from "react";
import { motion } from "framer-motion";
import Character from "../components/Character";
import type { Mission } from "../data/missions";

type Props = {
  mission: Mission;
  onComplete: () => void;
};

const TRAVEL_MS = 1500;

// 미션별 도착지 라벨 (말해보카 배경과 매칭)
function getDestinationLabel(mission: Mission): string {
  const m: Record<string, string> = {
    market: "전통시장",
    hospital: "동네 종합병원",
    cafe: "주민 카페",
    home: "레지던스",
    office: "공유 작업실",
    transit: "버스 정류장",
    library: "마을 안내소",
    neighbor: "이주자 댁",
  };
  return m[mission.background] ?? "장소";
}

export default function MissionTravelingScreen({ mission, onComplete }: Props) {
  // 1.5초 후 자동으로 미션 수행 화면으로
  useEffect(() => {
    const t = setTimeout(onComplete, TRAVEL_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  const destination = getDestinationLabel(mission);

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] overflow-hidden flex flex-col">
      {/* 배경 — 하늘 → 잔디 → 길 */}
      <div
        className="absolute inset-0 -z-10
                   bg-[linear-gradient(to_bottom,#BDE7FF_0%,#FFF6E8_40%,#D8E8C8_100%)]"
        aria-hidden
      />

      {/* 마을 길 SVG (사다리꼴 + 측면 디테일) */}
      <svg
        viewBox="0 0 200 240"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        {/* 먼 산 */}
        <path
          d="M -10 110 Q 40 80 90 100 Q 130 84 170 100 Q 195 92 210 105 L 210 120 L -10 120 Z"
          fill="#A8C8B0"
          opacity="0.6"
        />
        {/* 잔디 */}
        <rect y="118" width="200" height="125" fill="#D8E8C8" />
        {/* 길 (사다리꼴 퍼스펙티브) */}
        <path
          d="M 85 118 L 10 240 L 190 240 L 115 118 Z"
          fill="#EBD9B5"
        />
        <path
          d="M 85 118 L 10 240 L 14 240 L 87 118 Z"
          fill="#B89E78"
          opacity="0.5"
        />
        <path
          d="M 115 118 L 190 240 L 186 240 L 113 118 Z"
          fill="#B89E78"
          opacity="0.5"
        />
        {/* 길 중앙선 — 점선이 카메라 쪽으로 흐르는 모션 */}
        <motion.g
          animate={{ y: [0, 40] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        >
          <line x1="100" y1="120" x2="100" y2="135" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7" />
          <line x1="100" y1="155" x2="100" y2="175" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.7" />
          <line x1="100" y1="195" x2="100" y2="220" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.7" />
        </motion.g>

        {/* 길가 나무들 — 살짝 흔들림 */}
        {[
          { x: 35, y: 150 },
          { x: 165, y: 152 },
          { x: 20, y: 200 },
          { x: 180, y: 205 },
        ].map((t, i) => (
          <motion.g
            key={i}
            transform={`translate(${t.x} ${t.y})`}
            animate={{ rotate: [-1, 1, -1] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
            style={{ transformOrigin: "0 8px" }}
          >
            <ellipse cx="2" cy="9" rx="9" ry="2" fill="#000" opacity="0.18" />
            <rect x="-1" y="-2" width="3" height="10" fill="#7B5640" />
            <circle r="11" fill="#7BA86F" />
            <circle cx="-4" cy="-2" r="7" fill="#A0C690" />
          </motion.g>
        ))}
      </svg>

      {/* 상단 — 이동 중 안내 */}
      <header className="relative z-10 pt-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-[10px] font-extrabold tracking-widest uppercase text-[#FF7043]">
            이동 중
          </p>
          <h1 className="mt-1 text-ink text-[20px] font-extrabold leading-tight">
            {mission.icon} {destination}로 가는 길
          </h1>
          <p className="mt-1 text-ink-soft text-[12px]">
            {mission.npc.name}을(를) 만나러 가고 있어요
          </p>
        </motion.div>
      </header>

      {/* 가운데 — 캐릭터 걷기 (제자리 까닥) */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <motion.div
          animate={{ y: [-2, 1, -2] }}
          transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
          className="w-28"
        >
          <Character className="w-full h-auto" />
        </motion.div>
        {/* 발 그림자 — 걷기 리듬에 맞춰 살짝 줄어듦/커짐 */}
        <motion.div
          className="w-16 h-2 rounded-full bg-black/15 -mt-1.5"
          animate={{ scale: [1, 0.85, 1], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />

        {/* 발걸음 이모지 — 좌우 번갈아 */}
        <div className="mt-4 flex gap-3">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="text-xl"
              animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
              aria-hidden
            >
              {i % 2 === 0 ? "👣" : "🥾"}
            </motion.span>
          ))}
        </div>
      </section>

      {/* 하단 — 진행 바 */}
      <footer className="relative z-10 px-8 pb-12">
        <div className="bg-white/90 backdrop-blur rounded-2xl px-4 py-3 shadow-soft">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-ink-soft text-[11px] font-bold">
              잠시만 기다려주세요...
            </span>
            <span className="text-primary text-[11px] font-extrabold">
              {Math.round(TRAVEL_MS / 1000)}초
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FFB089] to-[#FF7043]"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: TRAVEL_MS / 1000, ease: "easeOut" }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
