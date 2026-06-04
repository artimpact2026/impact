// 레지던스 마커 — 집 모양 아이콘 + 지역명 칩
// PRD: "마커 디자인: 집 모양 아이콘 + 지역명"
// 부모 컨테이너 기준 좌상단(0,0)에서 (x%, y%) 위치에 마커의 '핀 끝'이 오도록 배치

type Props = {
  xPct: number;
  yPct: number;
  region: string;
  isActive: boolean;
  onClick: () => void;
};

export default function ResidenceMarker({
  xPct,
  yPct,
  region,
  isActive,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`${region} 레지던스 마커`}
      className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-full
                 focus:outline-none"
      style={{ left: `${xPct}%`, top: `${yPct}%` }}
    >
      {/* 지역명 칩 — 활성/비활성 톤 분기 */}
      <span
        className={`mb-1.5 px-3 py-1 rounded-full text-[14px] font-bold leading-none
          transition shadow-soft
          ${
            isActive
              ? "bg-primary text-white"
              : "bg-white text-ink border border-cream-200"
          }`}
      >
        {region}
      </span>

      {/* 집 모양 마커 + 핀 */}
      <span
        className={`relative inline-flex items-center justify-center
          w-14 h-14 rounded-full shadow-soft transition
          ${isActive ? "bg-primary scale-110" : "bg-white"}`}
      >
        <HouseIcon active={isActive} />
        {/* 핀 끝 (작은 삼각형) */}
        <span
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2
            w-3.5 h-3.5 rotate-45
            ${isActive ? "bg-primary" : "bg-white"}`}
          aria-hidden
        />
      </span>
    </button>
  );
}

// 집 아이콘 — 마커 상태에 따라 컬러 분기
function HouseIcon({ active }: { active: boolean }) {
  const stroke = active ? "#FFFFFF" : "#FF7043";
  const fill = active ? "#FF7043" : "#FFE0D3";
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={fill}
      />
    </svg>
  );
}
