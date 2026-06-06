// 하단 고정 네비게이션 — 4탭 균등 + 분리된 floating 시뮬레이션 버튼
//
// 레이아웃 원칙:
//   1) <nav> 는 viewport 기준 fixed, 고정 높이(--nav-h), 4개 탭만 flex-1 균등 배분.
//   2) 중앙 시뮬레이션 버튼은 <nav> 트리 바깥의 형제로 별도 fixed 위치
//      → nav 의 height/정렬에 영향 X.
//   3) nav 안쪽 5번째 슬롯은 'notch spacer' — 시각적 빈 영역을 시뮬레이션 버튼이 덮음.
//      덕분에 4개 탭 라벨이 버튼에 가려지지 않음 (각 탭은 420/5 = 84px 슬롯 확보).
//   4) 콘텐츠가 nav/버튼에 가려지지 않도록, 모든 페이지는 PageShell or TabLayout 사용
//      → `padding-bottom: var(--content-bottom)` 자동 적용.
//
// 슬롯 시각화:
//   |  발견  |  여정  | (notch) |  편지  | 내정보 |   ← <nav>
//                    ◉ 시뮬                       ← 분리된 floating button
//
// "booking" 등 hidden 탭이 active일 땐 시각적으로 "발견" 강조.

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
    // Fragment — nav 와 floating 버튼은 형제 관계. 트리·레이아웃·z-index 모두 독립.
    <>
      {/* ===== 하단 탭바 ===== */}
      <nav
        // · viewport 기준 fixed (좌우 max-w-[420px] 중앙 정렬)
        // · z-40: 콘텐츠 위, 모달(z-50)/시뮬 버튼(z-50) 아래
        // · 고정 높이 = --nav-h + safe-area
        // · overflow-visible 불필요 — floating 버튼이 형제로 분리됐기 때문
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-40
                   bg-white/95 backdrop-blur border-t border-cream-200
                   pb-[var(--safe-b)]"
        aria-label="하단 탭"
      >
        {/* 안쪽: 고정 높이 --nav-h.
            children 모두 flex-1 → 5칸 균등(420/5 = 84px). 4개 탭 + 1 notch. */}
        <div className="h-[var(--nav-h)] flex items-stretch">
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

          {/* notch — 시뮬레이션 버튼이 시각적으로 차지할 자리.
              flex-1 로 84px 슬롯 예약. 실제 버튼은 이 nav 바깥의 sibling. */}
          <div className="flex-1" aria-hidden />

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
        </div>
      </nav>

      {/* ===== 분리된 floating 시뮬레이션 버튼 ===== */}
      {/* 래퍼: 420px 프레임을 viewport 하단에 복제. pointer-events-none 이라 콘텐츠 클릭 방해 X.
          버튼은 이 래퍼 기준 absolute → 데스크톱 미리보기에서도 앱 프레임 중앙 정렬 보장. */}
      <div
        aria-hidden
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 pointer-events-none"
      >
        <CenterSimulationButton
          active={vActive === "simulation"}
          onClick={() => onChange("simulation")}
        />
      </div>
    </>
  );
}

// 일반 탭 버튼 — flex-1 로 균등 너비. 컨테이너 안에서 수직 중앙 정렬.
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
      className={`flex-1 flex flex-col items-center justify-center gap-1 transition
        ${isActive ? "text-primary" : "text-ink-mute"}`}
      aria-pressed={isActive}
    >
      {icon}
      <span
        className={`text-[11px] font-semibold leading-none ${
          isActive ? "text-primary" : "text-ink-soft"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

// 중앙 시뮬레이션 — 부모(420px 래퍼) 기준 absolute. pointer-events-auto 로 클릭 복원.
// 위치/크기 모두 CSS var 단일 출처: nav 높이·돌출·safe-area·버튼 크기 변경 시 자동 재계산.
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
      // · absolute — 부모(viewport bottom 의 420px 래퍼) 기준 위치 계산
      // · left-1/2 -translate-x-1/2 — 앱 프레임 가로 중앙
      // · bottom = --center-btn-bottom — viewport bottom 으로부터 정확한 높이
      // · pointer-events-auto — 래퍼는 none, 버튼만 활성화
      style={{
        bottom: "var(--center-btn-bottom)",
        width: "var(--center-btn-size)",
        height: "var(--center-btn-size)",
      }}
      className={`absolute left-1/2 -translate-x-1/2 pointer-events-auto
                  rounded-full flex items-center justify-center
                  text-white text-[11.5px] font-extrabold leading-tight tracking-tight
                  text-center transition active:scale-95
                  border-[3px] border-white
                  shadow-[0_10px_22px_-6px_rgba(255,112,67,0.65),0_2px_4px_rgba(0,0,0,0.08)]
                  ${
                    active
                      ? "bg-primary ring-4 ring-primary/15"
                      : "bg-primary"
                  }`}
    >
      시뮬
      <br />
      레이션
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
