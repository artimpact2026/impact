// 문화 미션 마커 — 떠나기 "전체" 토글에서 지도 위에 표시
// 레지던스 마커(집+지역칩)와 달리, 다수를 흩뿌리므로 작은 이모지 핀.
// 선택(활성) 시 확대 + 주황 링 + 지역명 노출.

type Props = {
  xPct: number;
  yPct: number;
  emoji: string;
  region: string;
  isActive: boolean;
  onClick: () => void;
};

export default function MissionMarker({
  xPct,
  yPct,
  emoji,
  region,
  isActive,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`${region} 문화 미션 마커`}
      className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-full
                 focus:outline-none"
      style={{ left: `${xPct}%`, top: `${yPct}%`, zIndex: isActive ? 20 : 10 }}
    >
      {/* 활성일 때만 지역명 칩 노출 (비활성은 점만 → 클러스터 깔끔) */}
      {isActive && (
        <span
          className="mb-1.5 px-2.5 py-1 rounded-full text-[12px] font-extrabold leading-none
                     bg-primary text-white shadow-soft whitespace-nowrap"
        >
          {region}
        </span>
      )}

      {/* 이모지 핀 */}
      <span
        className={`relative inline-flex items-center justify-center rounded-full
          shadow-soft transition-all
          ${
            isActive
              ? "w-11 h-11 bg-white ring-2 ring-primary scale-100"
              : "w-6 h-6 bg-white/90 ring-1 ring-cream-200"
          }`}
      >
        <span className={isActive ? "text-[20px]" : "text-[13px]"} aria-hidden>
          {emoji}
        </span>
        {/* 핀 끝 */}
        <span
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45
            ${isActive ? "bg-primary" : "bg-white/90"}`}
          aria-hidden
        />
      </span>
    </button>
  );
}
