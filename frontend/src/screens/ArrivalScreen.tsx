// 지역 마을 도착 홈 — 동물의 숲 톤의 홈 화면
// 상단 헤더(마을명) + 도착 메시지 + 마을 씬 위에 단순 "○○ 알아보기" CTA

import { useState } from "react";
import { motion } from "framer-motion";
import RegionHeader from "../components/arrival/RegionHeader";
import RegionHeroScene from "../components/arrival/RegionHeroScene";
import MailboxModal from "../components/MailboxModal";
import { storiesByResidenceId } from "../data/stories";
import {
  VILLAGE_CONFIG,
  DEFAULT_VILLAGE,
  type VillageConfig,
} from "../data/villageConfig";
import type { Residence } from "../data/residences";

type Props = {
  residence: Residence;
  onBack: () => void;
  onStartMissions: () => void;
};

export default function ArrivalScreen({
  residence,
  onBack,
  onStartMissions,
}: Props) {
  const [showMail, setShowMail] = useState(false);

  const config: VillageConfig =
    VILLAGE_CONFIG[residence.id] ?? DEFAULT_VILLAGE;
  const story = storiesByResidenceId[residence.id] ?? null;
  const unreadLetters = story ? 1 : 0;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col overflow-hidden">
      {/* 배경 — 지역 톤 그라데이션 */}
      <div
        className="absolute inset-0 -z-10
                   bg-[linear-gradient(to_bottom,#BDE7FF_0%,#FFF6E8_45%,#F6EAD8_100%)]"
        aria-hidden
      />

      {/* 헤더 (단순 — 뒤로가기 + 마을명) */}
      <RegionHeader headerTitle={config.headerTitle} onBack={onBack} />

      {/* 도착 메시지 */}
      <div className="px-5 mt-1">
        <p className="text-[11px] font-extrabold tracking-widest uppercase text-[#FF7043]">
          오늘의 마을
        </p>
        <h2 className="mt-0.5 text-[#4A3326] text-[20px] font-extrabold leading-tight">
          📍 {config.arrivalTitle}
        </h2>
        <p className="mt-1 text-[#7A6254] text-[12px] leading-relaxed">
          {config.subtitle}
        </p>
      </div>

      {/* 마을 씬 + 그 위에 단순 CTA */}
      <section className="relative px-4 mt-2 pb-12">
        <RegionHeroScene
          theme={config.theme}
          signLabel={config.signLabel}
          speechBubble={config.speechBubble}
          unreadLetters={unreadLetters}
          onMailboxClick={() => setShowMail(true)}
        />

        {/* 단순 CTA — "○○ 알아보기" */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 z-10">
          <motion.button
            type="button"
            onClick={onStartMissions}
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3.5 rounded-full bg-primary text-white
                       text-[15px] font-extrabold whitespace-nowrap
                       shadow-[0_10px_24px_-8px_rgba(255,112,67,0.5)]
                       border-2 border-white transition"
          >
            {residence.region} 알아보기 →
          </motion.button>
        </div>
      </section>

      {/* 우편함 모달 */}
      <MailboxModal
        open={showMail}
        story={story}
        onClose={() => setShowMail(false)}
      />
    </div>
  );
}
