// 탭1 떠나기 화면 — PRD 2.떠나기
// 한반도 지도 + 마커 + 추천/전체 토글
// 추천: recommended:true 인 3개, 전체: 15개 모두

import { useState } from "react";
import { motion } from "framer-motion";
import KoreaMap from "../components/KoreaMap";
import ResidenceMarker from "../components/ResidenceMarker";
import ResidenceSheet from "../components/ResidenceSheet";
import { residences, type Residence } from "../data/residences";

type Props = {
  homeRegion: string;
  onBack: () => void;
  onDepart: (residence: Residence) => void;
};

type ViewMode = "recommended" | "all";

export default function DepartureScreen({ homeRegion, onBack, onDepart }: Props) {
  const [view, setView] = useState<ViewMode>("recommended");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = residences.find((r) => r.id === selectedId) ?? null;

  const visible =
    view === "recommended"
      ? residences.filter((r) => r.recommended)
      : residences;

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] flex flex-col">
      {/* 배경 */}
      <div
        className="absolute inset-0 -z-10
                   bg-gradient-to-b from-[#EAF4FB] via-cream to-cream"
        aria-hidden
      />

      {/* 헤더 */}
      <header className="pt-12 px-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="w-9 h-9 rounded-full bg-white shadow-soft
                     flex items-center justify-center text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 6 9 12l6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-ink-soft text-[12px] font-medium">
            📍 본 지역 {homeRegion}
          </p>
          <h1 className="text-ink text-[20px] font-extrabold leading-tight">
            어디로 가볼까?
          </h1>
        </div>
      </header>

      {/* 안내 + 토글 */}
      <div className="mt-2 px-5 flex items-center justify-between gap-2">
        <p className="text-ink-soft text-[12px] leading-relaxed">
          {view === "recommended"
            ? "취향에 맞춘 추천 레지던스예요."
            : `전국 ${residences.length}개 레지던스를 모두 보여드려요.`}
        </p>
        <div className="flex bg-white border border-cream-200 rounded-full p-0.5 shadow-soft shrink-0">
          <ToggleBtn
            label="추천"
            active={view === "recommended"}
            onClick={() => setView("recommended")}
          />
          <ToggleBtn
            label={`전체 ${residences.length}`}
            active={view === "all"}
            onClick={() => setView("all")}
          />
        </div>
      </div>

      {/* 지도 영역 */}
      <section className="flex-1 px-3 mt-3 mb-4 flex items-start justify-center">
        <div className="w-full max-w-[320px]">
          <KoreaMap>
            {visible.map((r) => (
              <ResidenceMarker
                key={r.id}
                xPct={r.xPct}
                yPct={r.yPct}
                region={r.region}
                isActive={selectedId === r.id}
                onClick={() => setSelectedId(r.id)}
              />
            ))}
          </KoreaMap>
        </div>
      </section>

      {/* 바텀시트 */}
      <ResidenceSheet
        residence={selected}
        onClose={() => setSelectedId(null)}
        onDepart={(r) => {
          setSelectedId(null);
          onDepart(r);
        }}
      />
    </div>
  );
}

function ToggleBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold transition
        ${active ? "bg-primary text-white shadow-soft" : "text-ink-soft"}`}
    >
      {label}
    </motion.button>
  );
}
