// 하단 고정 네비게이션 — 4탭 구조
// 탭1: 홈 / 탭2: 나의 여정 / 탭3: 커뮤니티 / 탭4: 레지던스

export type TabKey = "home" | "journey" | "community" | "booking";

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px]
                 bg-white/90 backdrop-blur border-t border-cream-200
                 px-2 pt-2.5 pb-[max(env(safe-area-inset-bottom),12px)]
                 flex justify-around items-center"
      aria-label="하단 탭"
    >
      <TabButton
        label="홈"
        isActive={active === "home"}
        onClick={() => onChange("home")}
        icon={<HomeIcon active={active === "home"} />}
      />
      <TabButton
        label="나의 여정"
        isActive={active === "journey"}
        onClick={() => onChange("journey")}
        icon={<MapIcon active={active === "journey"} />}
      />
      <TabButton
        label="커뮤니티"
        isActive={active === "community"}
        onClick={() => onChange("community")}
        icon={<CommunityIcon active={active === "community"} />}
      />
      <TabButton
        label="레지던스"
        isActive={active === "booking"}
        onClick={() => onChange("booking")}
        icon={<BookingIcon active={active === "booking"} />}
      />
    </nav>
  );
}

// 개별 탭 버튼 — 아이콘 + 메인 라벨만, 빈 공간을 살린 균형 배치
function TabButton({
  label,
  isActive,
  onClick,
  icon,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 px-2 py-1.5 rounded-2xl transition
        ${isActive ? "text-primary" : "text-ink-mute"}`}
      aria-pressed={isActive}
    >
      {icon}
      <span
        className={`text-[12px] font-semibold leading-none ${
          isActive ? "text-primary" : "text-ink-soft"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

// 홈(봇짐) 아이콘
function HomeIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <path
        d="M4 12.5 13 5l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5h-4V16h-7v6.5h-4A1.5 1.5 0 0 1 4 21v-8.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? "#FFE0D3" : "none"}
      />
    </svg>
  );
}

// 아트맵(여정) 아이콘
function MapIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <path
        d="m3 6 6-2 8 2 6-2v16l-6 2-8-2-6 2V6Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? "#FFE0D3" : "none"}
      />
      <path d="M9 4v16M17 6v16" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

// 커뮤니티(말풍선 2개) 아이콘
function CommunityIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      {/* 뒤쪽 말풍선 */}
      <path
        d="M15 4h5a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 20 14h-1v3l-3-3h-3a1.5 1.5 0 0 1-1.5-1.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? "#FFE0D3" : "none"}
      />
      {/* 앞쪽 말풍선 */}
      <path
        d="M5 8h8A1.5 1.5 0 0 1 14.5 9.5v6A1.5 1.5 0 0 1 13 17h-2l-3 3v-3H5a1.5 1.5 0 0 1-1.5-1.5v-6A1.5 1.5 0 0 1 5 8Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? "#FFFFFF" : "none"}
      />
    </svg>
  );
}

// 예약(캘린더) 아이콘
function BookingIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      {/* 캘린더 본체 */}
      <rect
        x="4"
        y="6"
        width="18"
        height="16"
        rx="2"
        stroke={color}
        strokeWidth="1.8"
        fill={active ? "#FFE0D3" : "none"}
      />
      {/* 상단 헤더 줄 */}
      <path d="M4 11h18" stroke={color} strokeWidth="1.8" />
      {/* 윗쪽 고리 2개 */}
      <path d="M9 4v4M17 4v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* 내부 날짜 점 */}
      <circle cx="9" cy="15.5" r="1.2" fill={color} />
      <circle cx="13" cy="15.5" r="1.2" fill={color} />
      <circle cx="17" cy="15.5" r="1.2" fill={color} />
      <circle cx="9" cy="19" r="1.2" fill={color} />
      <circle cx="13" cy="19" r="1.2" fill={color} />
    </svg>
  );
}
