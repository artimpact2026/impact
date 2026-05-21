// 마을 도착 홈 — 상단 헤더 (뒤로가기 + 마을명)

type Props = {
  headerTitle: string;
  onBack: () => void;
};

export default function RegionHeader({ headerTitle, onBack }: Props) {
  return (
    <header className="px-4 pt-12 pb-2 flex items-center gap-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로가기"
        className="w-9 h-9 rounded-full bg-white/85 backdrop-blur shadow-soft
                   border border-white/60 flex items-center justify-center
                   text-[#4A3326]"
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

      <h1 className="text-[16px] font-extrabold text-[#4A3326]">
        {headerTitle}
      </h1>
    </header>
  );
}
