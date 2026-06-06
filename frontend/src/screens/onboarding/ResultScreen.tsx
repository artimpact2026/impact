// 진단 결과 — v2 (자세 메인 + 환경 부제 + 점수 기반 추천)
// 자세 = 진단으로 발견한 캐릭터 (메인)
// 환경 = 사용자가 직접 고른 풍경 (부제)
// 추천 = 매칭 점수 상위 N개 + strong/good/alt 라벨

import { motion } from "framer-motion";
import { residences, type Residence } from "../../data/residences";
import {
  envMeta,
  matchLabel,
  matchResidenceScore,
  stanceMeta,
  type LifestyleProfile,
} from "../../data/lifestyle";
import PrimaryButton from "../../components/PrimaryButton";

type Props = {
  profile: LifestyleProfile;
  onStart: () => void;
};

const MATCH_BADGE: Record<
  "strong" | "good" | "alt" | "weak",
  { label: string; tone: string }
> = {
  strong: { label: "⭐ 강력 추천", tone: "text-primary bg-primary/10" },
  good: { label: "이 분위기도 어울려요", tone: "text-nature-600 bg-nature-50" },
  alt: { label: "다른 풍경도 한번", tone: "text-ink-soft bg-cream-100" },
  weak: { label: "", tone: "" },
};

export default function ResultScreen({ profile, onStart }: Props) {
  const stanceM = stanceMeta[profile.stance];
  const envM = envMeta[profile.env];

  // 매칭 점수 계산 → 상위 2곳만 추천 (선택 부담 줄임)
  const ranked = residences
    .map((r) => ({
      residence: r,
      score: matchResidenceScore(profile, {
        envType: r.envType,
        stance: r.stance,
        stanceAlt: r.stanceAlt,
      }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col
                 bg-gradient-to-b from-primary-50 via-cream to-nature-50"
    >
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
          className="mt-3 text-[64px] leading-none"
          aria-hidden
        >
          {stanceM.emoji}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-3 text-ink text-[26px] font-extrabold"
        >
          {stanceM.name}
        </motion.h1>

        {/* 환경 부제 — 사용자가 직접 고른 풍경 */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5
                     rounded-full bg-white border border-cream-200 shadow-soft"
        >
          <span className="text-[14px]" aria-hidden>
            {envM.emoji}
          </span>
          <span className="text-ink text-[12px] font-bold">
            {envM.name}{" "}
            <span className="text-ink-mute">{envM.blurb}</span>
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-4 text-ink-soft text-[14px] leading-relaxed px-2"
        >
          {stanceM.description}
        </motion.p>
      </header>

      {/* 추천 청년마을 */}
      <section className="flex-1 px-5 mt-7">
        <h2 className="text-ink text-[15px] font-extrabold mb-2.5">
          잠시 살아볼 청년마을
        </h2>
        <ul className="space-y-2">
          {ranked.map(({ residence, score }, i) => (
            <RecommendationCard
              key={residence.id}
              residence={residence}
              score={score}
              delay={0.85 + i * 0.1}
            />
          ))}
        </ul>
      </section>

      {/* 하단 CTA */}
      <footer className="px-6 pb-8 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
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
          transition={{ delay: 1.35, duration: 0.4 }}
        >
          <PrimaryButton onClick={onStart}>시작하기 🍃</PrimaryButton>
        </motion.div>
      </footer>
    </div>
  );
}

function RecommendationCard({
  residence,
  score,
  delay,
}: {
  residence: Residence;
  score: number;
  delay: number;
}) {
  const badge = MATCH_BADGE[matchLabel(score)];
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div
        className="bg-white border border-cream-200 rounded-2xl
                   p-3.5 flex items-center gap-3 shadow-soft"
      >
        <div
          className="w-11 h-11 rounded-2xl bg-nature-50
                     flex items-center justify-center text-xl shrink-0"
        >
          {residence.themeEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-ink text-[14px] font-bold leading-tight truncate">
              {residence.region} · {residence.name}
            </p>
          </div>
          {badge.label && (
            <span
              className={`mt-1 inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded-full
                ${badge.tone}`}
            >
              {badge.label}
            </span>
          )}
          <p className="mt-1 text-ink-soft text-[12px] truncate">
            {residence.matchReason}
          </p>
        </div>
        <span className="text-ink-mute text-[11px] shrink-0">
          {residence.duration}
        </span>
      </div>
    </motion.li>
  );
}
