// 지역 마을 도착 홈 — 동물의 숲 톤의 홈 화면
// 상단 헤더(마을명) + 도착 메시지 + 마을 씬 위에 단순 "○○ 알아보기" CTA

import { motion } from "framer-motion";
import RegionHeader from "../components/arrival/RegionHeader";
import {
  VILLAGE_CONFIG,
  DEFAULT_VILLAGE,
  type VillageConfig,
} from "../data/villageConfig";
import type { Residence } from "../data/residences";

type Props = {
  residence: Residence;
  homeRegion: string;
  // 헤더 뒤로가기/푸터 CTA에서 호출 — 서울 등 본 지역으로 역방향 애니메이션 시작
  onReturnHome: () => void;
  onStartMissions: () => void;
};

export default function ArrivalScreen({
  residence,
  homeRegion,
  onReturnHome,
  onStartMissions,
}: Props) {
  const config: VillageConfig =
    VILLAGE_CONFIG[residence.id] ?? DEFAULT_VILLAGE;

  // 지역별 풀배경 이미지 — 매핑된 경우 이미지로, 없으면 그라데이션 폴백
  const HOME_BG_IMAGE: Record<string, string> = {
    ganghwa: "/home_ganghwa.png",
  };
  const bgImage = HOME_BG_IMAGE[residence.id];

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col overflow-hidden">
      {/* 배경 — 지역 톤 그라데이션 (폴백) */}
      <div
        className="absolute inset-0
                   bg-[linear-gradient(to_bottom,#BDE7FF_0%,#FFF6E8_45%,#F6EAD8_100%)]"
        aria-hidden
      />
      {/* 배경 이미지 — 지역별 풀배경 */}
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* 헤더 — 마을명만 */}
      <div className="relative">
        <RegionHeader headerTitle={config.headerTitle} />
      </div>

      {/* 도착 메시지 */}
      <div className="relative px-5 mt-1">
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

      {/* 빈 영역 — 배경 이미지가 보이도록 */}
      <div className="flex-1" />

      {/* 단순 CTA — "○○ 알아보기" */}
      <div className="relative z-10 flex justify-center pb-4">
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

      {/* 본 지역으로 돌아가기 — 작은 보조 액션 */}
      <div className="relative px-5 pt-8 pb-6 flex justify-center">
        <motion.button
          type="button"
          onClick={onReturnHome}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full
                     bg-white/80 backdrop-blur border border-white/70
                     text-[#7A6254] text-[12px] font-bold shadow-soft"
        >
          <span aria-hidden>←</span>
          {homeRegion}로 돌아가기
        </motion.button>
      </div>

    </div>
  );
}
