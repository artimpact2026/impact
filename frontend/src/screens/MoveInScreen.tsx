// 이주 결정 엔딩 화면 — PRD 4.엔딩
// "이 지역으로 이주할게요" 결정 후 셀러브레이션 + 본 지역 변경 안내
// 홈으로 가기 클릭 시 App에서 profile.homeRegionName 변경

import { motion } from "framer-motion";
import Character from "../components/Character";
import type { Residence } from "../data/residences";

type Props = {
  residence: Residence;
  onGoHome: () => void;
};

export default function MoveInScreen({ residence, onGoHome }: Props) {
  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col overflow-hidden">
      {/* 따뜻한 배경 그라데이션 */}
      <div
        className="absolute inset-0 -z-10
                   bg-gradient-to-b from-primary-50 via-cream to-nature-50"
        aria-hidden
      />

      {/* 컨페티 — 위에서 떨어지는 작은 점들 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-lg"
            style={{ left: `${(i * 19) % 100}%` }}
            initial={{ y: -40, opacity: 0, rotate: 0 }}
            animate={{
              y: ["−40%", "120vh"],
              opacity: [0, 1, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 5 + (i % 4),
              repeat: Infinity,
              delay: (i * 0.4) % 3,
              ease: "linear",
            }}
            aria-hidden
          >
            {["🎉", "✨", "🌸", "🍃"][i % 4]}
          </motion.span>
        ))}
      </div>

      {/* 메인 컨텐츠 */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-ink-soft text-[12px] font-bold uppercase tracking-widest"
        >
          새로운 본 지역
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.55, ease: "easeOut" }}
          className="mt-2 text-ink text-[30px] font-extrabold leading-tight"
        >
          {residence.region}에서의
          <br />
          새로운 시작! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-4 max-w-[280px] text-ink-soft text-[14px] leading-relaxed"
        >
          지금까지 쌓은 미션과 관계가
          <br />
          나의 아트지도에 영구 기록으로 남았어요.
        </motion.p>

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          className="mt-6 w-44"
        >
          <Character className="w-full h-auto" />
        </motion.div>
        <div className="w-32 h-1.5 rounded-full bg-nature-200/60 -mt-2 mx-auto" />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                     bg-white border border-cream-200 shadow-soft
                     text-ink text-[13px] font-bold"
        >
          <span aria-hidden>📍</span>
          본 지역이 <span className="text-primary">{residence.region}</span>(으)로 바뀌었어요
        </motion.div>
      </section>

      {/* 하단 CTA */}
      <footer className="px-6 pb-8 pt-3">
        <motion.button
          type="button"
          onClick={onGoHome}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="w-full py-4 rounded-2xl bg-primary text-white text-[16px] font-extrabold
                     shadow-soft active:scale-[0.99] transition"
        >
          홈으로 가기 🍃
        </motion.button>
      </footer>
    </div>
  );
}
