// 진단 결과 — PRD 1.온보딩 결과 화면
// 유형 이름 + 한 줄 설명 + 추천 지역 카드 2-3개 + "청풍 시작하기"

import { motion } from "framer-motion";
import { lifestyleMeta } from "../../data/quiz";
import { residences, type LifeStyleType, type Residence } from "../../data/residences";
import PrimaryButton from "../../components/PrimaryButton";

type Props = {
  type: LifeStyleType;
  onStart: () => void;
};

export default function ResultScreen({ type, onStart }: Props) {
  const meta = lifestyleMeta[type];

  // 추천 지역 = 매칭 유형 일치 우선 + 부족하면 다른 지역으로 채워 총 3개
  const matched = residences.filter((r) => r.matchType === type);
  const others = residences.filter((r) => r.matchType !== type);
  const recommended: Residence[] = [...matched, ...others].slice(0, 3);

  return (
    <div className="relative min-h-[100dvh] flex flex-col
                    bg-gradient-to-b from-primary-50 via-cream to-nature-50">
      {/* 상단 */}
      <header className="pt-12 px-6 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-ink-soft text-[12px] font-medium"
        >
          진단 결과
        </motion.p>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
          className="mt-3 text-[72px] leading-none"
          aria-hidden
        >
          {meta.emoji}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-3 text-ink text-[26px] font-extrabold"
        >
          {type}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-1 text-primary text-[14px] font-bold"
        >
          {meta.tagline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="mt-4 text-ink-soft text-[14px] leading-relaxed px-2"
        >
          {meta.description}
        </motion.p>
      </header>

      {/* 추천 지역 미리보기 */}
      <section className="flex-1 px-5 mt-7">
        <h2 className="text-ink text-[15px] font-extrabold mb-2.5">
          당신에게 추천하는 지역
        </h2>
        <ul className="space-y-2">
          {recommended.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
            >
              <div className="bg-white border border-cream-200 rounded-2xl
                              p-3.5 flex items-center gap-3 shadow-soft">
                <div className="w-11 h-11 rounded-2xl bg-nature-50
                                flex items-center justify-center text-xl shrink-0">
                  {r.themeEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ink text-[14px] font-bold leading-tight">
                    {r.region} · {r.name}
                  </p>
                  <p className="mt-0.5 text-ink-soft text-[12px] truncate">
                    {r.matchReason}
                  </p>
                </div>
                <span className="text-ink-mute text-[11px] shrink-0">
                  {r.duration}
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* 하단 CTA */}
      <footer className="px-6 pb-8 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          className="text-center mb-3"
        >
          <p className="text-ink text-[14px] font-bold leading-snug">
            잠시, 다른 지역의 바람을 짓고 와볼래요?
          </p>
          <p className="mt-1 text-ink-soft text-[12px]">
            살아보기 전에 먼저 살아봐요
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.4 }}
        >
          <PrimaryButton onClick={onStart}>시작하기 🍃</PrimaryButton>
        </motion.div>
      </footer>
    </div>
  );
}
