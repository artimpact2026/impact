// 하단 고정 네비게이션 — 5탭 구조 + 중앙 솟은 시뮬레이션 버튼
//
// 슬롯: [발견] [여정] (◉ 시뮬레이션) [편지] [내정보]
// 중앙 버튼은 64px 주황 원형이 탭 바 상단으로 솟아 떠 있는 느낌(그림자).
// "booking" 등 hidden 탭이 active일 땐 시각적으로 "발견"을 강조해줌.

export type TabKey =
  | "discover"     // 발견 — 커뮤니티 + 청년마을(예약). 첫 단계는 community만, 후속에서 통합
  | "journey"      // 여정 — 다녀온 지역 기록·적합도·이주 리포트
  | "simulation"   // 시뮬레이션 — 옛 home 탭. 떠나기 / 도착 / 미션 / 찐 홈 등
  | "letter"       // 편지 — 우편함 모음 (NEW, placeholder)
  | "profile"      // 내 정보 — 프로필·설정 (NEW, placeholder)
  | "booking";     // 예약 — BottomNav 미노출, CTA로만 도달

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  // 편지 탭 unread 배지 — 0이면 미노출
  letterUnread?: number;
};

// "booking" 같은 hidden 탭이 active일 때 시각적으로 어느 탭을 강조할지
function visibleActive(active: TabKey): TabKey {
  if (active === "booking") return "discover"; // 청년마을 둘러보기 = 발견
  return active;
}

export default function BottomNav({ active, onChange, letterUnread = 0 }: Props) {
  const vActive = visibleActive(active);
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px]
                 bg-white/95 backdrop-blur border-t border-cream-200
                 px-2 pt-2 pb-[max(env(safe-area-inset-bottom),12px)]
                 flex justify-around items-end"
      aria-label="하단 탭"
    >
      <TabButton
        label="발견"
        isActive={vActive === "discover"}
        onClick={() => onChange("discover")}
        icon={<DiscoverIcon active={vActive === "discover"} />}
      />
      <TabButton
        label="여정"
        isActive={vActive === "journey"}
        onClick={() => onChange("journey")}
        icon={<MapIcon active={vActive === "journey"} />}
      />

      {/* 중앙 — 솟은 원형 시뮬레이션 버튼 */}
      <CenterSimulationButton
        active={vActive === "simulation"}
        onClick={() => onChange("simulation")}
      />

      <TabButton
        label="편지"
        isActive={vActive === "letter"}
        onClick={() => onChange("letter")}
        icon={
          <span className="relative inline-block">
            <LetterIcon active={vActive === "letter"} />
            {letterUnread > 0 && (
              <span
                aria-label={`안 읽은 편지 ${letterUnread}통`}
                className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full
                           bg-primary text-white text-[9.5px] font-extrabold
                           flex items-center justify-center
                           border-[1.5px] border-white shadow-soft"
              >
                {letterUnread > 9 ? "9+" : letterUnread}
              </span>
            )}
          </span>
        }
      />
      <TabButton
        label="내 정보"
        isActive={vActive === "profile"}
        onClick={() => onChange("profile")}
        icon={<ProfileIcon active={vActive === "profile"} />}
      />
    </nav>
  );
}

// 일반 탭 버튼 — 아이콘 + 메인 라벨
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
        className={`text-[11.5px] font-semibold leading-none ${
          isActive ? "text-primary" : "text-ink-soft"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

// 중앙 시뮬레이션 — 64px 원형, 위로 솟음 + 그림자 (떠 있는 느낌)
function CenterSimulationButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label="시뮬레이션"
      // 다른 탭과 baseline 맞추기 위해 의도적으로 키 작게.
      // -mt 값으로 원이 탭바 위로 솟아오르는 정도 조절. 64px 원이 더 떠보이게.
      className="flex flex-col items-center px-2 -mt-16 pb-0.5"
    >
      <span
        className={`w-16 h-16 rounded-full flex items-center justify-center
                    text-white text-[11.5px] font-extrabold leading-tight tracking-tight
                    text-center transition active:scale-95
                    ${
                      active
                        ? "bg-primary ring-4 ring-primary/15"
                        : "bg-primary"
                    }
                    shadow-[0_10px_22px_-6px_rgba(255,112,67,0.65),0_2px_4px_rgba(0,0,0,0.08)]
                    border-[3px] border-white`}
      >
        {/* 두 줄로 두면 64px 안에 깔끔히 들어감. 아래 중복 라벨은 의도적으로 생략 */}
        시뮬
        <br />
        레이션
      </span>
    </button>
  );
}

// =====================================================================
// 아이콘들
// =====================================================================

// 발견(나침반) 아이콘
function DiscoverIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle
        cx="13"
        cy="13"
        r="9"
        stroke={color}
        strokeWidth="1.8"
        fill={active ? "#FFE0D3" : "none"}
      />
      {/* 나침반 바늘 */}
      <path
        d="M13 7 L15 13 L13 19 L11 13 Z"
        fill={color}
      />
      <circle cx="13" cy="13" r="1.3" fill="#FFFFFF" />
    </svg>
  );
}

// 여정(아트맵) 아이콘
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

// 편지(우편봉투) 아이콘
function LetterIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <rect
        x="3.5"
        y="6.5"
        width="19"
        height="14"
        rx="2"
        stroke={color}
        strokeWidth="1.8"
        fill={active ? "#FFE0D3" : "none"}
      />
      <path
        d="m3.5 8 9.5 7 9.5-7"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 내 정보(사람) 아이콘
function ProfileIcon({ active }: { active: boolean }) {
  const color = active ? "#FF7043" : "#9A8778";
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle
        cx="13"
        cy="9"
        r="4"
        stroke={color}
        strokeWidth="1.8"
        fill={active ? "#FFE0D3" : "none"}
      />
      <path
        d="M5 22c0-4 3.5-7 8-7s8 3 8 7"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill={active ? "#FFE0D3" : "none"}
      />
    </svg>
  );
}
