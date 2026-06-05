// 탭1 홈 화면 (기본 상태) — 청풍 PRD 2.홈/떠나기
// 중앙: 봇짐 캐릭터 + 말풍선, 하단: 현재 본 지역, 떠나기 CTA → 떠나기 화면으로 전환

import { motion } from "framer-motion";
import SpeechBubble from "../components/SpeechBubble";
import LocationBadge from "../components/LocationBadge";
import PrimaryButton from "../components/PrimaryButton";

type Props = {
  homeRegion: string;
  onDepart: () => void;
};

export default function HomeScreen({ homeRegion, onDepart }: Props) {
  return (
    // BottomNav(고정 ~80px)에 가려지지 않도록 화면 높이를 nav만큼 줄임
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col overflow-hidden">
      {/* 배경 색 — 이미지 주변을 채우는 톤 */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-cream via-cream to-nature-50"
        aria-hidden
      />
      {/* 배경 이미지 — 원본 비율 유지, 아래쪽에 정렬 */}
      <img
        src="/baram_jieum.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-contain object-bottom"
      />

      <header className="relative pt-12 px-6">
        <p className="text-ink-soft text-[13px] font-medium">바람을 짓다</p>
        <h1 className="mt-1 text-ink text-[22px] font-extrabold leading-snug">
          잠시, 다른 지역의 바람을<br />짓고 와볼래요?
        </h1>
      </header>

      <section className="relative flex-1 flex flex-col items-center justify-start px-6 pt-20">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <SpeechBubble>오늘도 어디론가 떠나볼까?</SpeechBubble>
        </motion.div>
      </section>

      <footer className="relative px-6 pb-8 flex flex-col items-center gap-4">
        <LocationBadge region={homeRegion} />
        <PrimaryButton onClick={onDepart}>
          떠나기 🎒
        </PrimaryButton>
      </footer>
    </div>
  );
}
