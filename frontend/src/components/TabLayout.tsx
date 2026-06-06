// 탭 화면 공통 레이아웃 — 모든 탭(발견·여정·편지·내 정보 등)에 일관된 상단 헤더 + 스크롤 컨테이너 제공.
//
// 사용 패턴:
//   <TabLayout preLabel="Discover" title="둘러보기" subtitle="..." rightActions={...}>
//     {내용}
//   </TabLayout>
//
// 헤더만 따로 쓰고 싶은 경우(예: 외부 스크롤 구조 가진 JourneyScreen):
//   <TabHeader preLabel="..." title="..." />
//
// 디자인 토큰 (전 탭 공통):
//   · 헤더 패딩: px-5 pt-6 pb-3
//   · preLabel: 10px ink-mute uppercase tracking-[0.18em]
//   · title: 24px ink extrabold
//   · subtitle: 12px ink-soft
//   · 스크롤 영역: h-[calc(100dvh-6rem)] overflow-y-auto bg-cream
//   · 헤더 아래 본문 사이 자연 spacing — 본문 wrapper에 mt-1~mt-3 권장.

import type { ReactNode } from "react";

// =====================================================================
// TabHeader — 헤더만 (재사용)
// =====================================================================

type HeaderProps = {
  preLabel?: string;
  title: string;
  subtitle?: string;
  rightActions?: ReactNode;
};

export function TabHeader({
  preLabel,
  title,
  subtitle,
  rightActions,
}: HeaderProps) {
  return (
    <header className="px-5 pt-6 pb-3 relative">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {preLabel && (
            <p className="text-[10px] font-bold text-ink-mute tracking-[0.18em] uppercase">
              {preLabel}
            </p>
          )}
          <h1 className="mt-1 text-[24px] font-extrabold text-ink leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-[12px] text-ink-soft leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {rightActions && (
          <div className="shrink-0 pt-1">{rightActions}</div>
        )}
      </div>
    </header>
  );
}

// =====================================================================
// TabLayout — 헤더 + 스크롤 컨테이너 (기본 사용)
// =====================================================================

type LayoutProps = HeaderProps & {
  children: ReactNode;
  // 추가 className — 스크롤 컨테이너에 적용 (배경 override 등)
  className?: string;
};

export default function TabLayout({
  preLabel,
  title,
  subtitle,
  rightActions,
  children,
  className,
}: LayoutProps) {
  return (
    // 높이 = 100dvh - (nav 높이 + 시뮬 돌출 + safe-area). CSS var 단일 출처.
    // BottomNav 가 fixed 라 따로 padding-bottom 필요 없음 — 잘라낸 높이만큼 안전 확보.
    <div
      className={`overflow-y-auto bg-cream ${className ?? ""}`}
      style={{ height: "calc(100dvh - var(--content-bottom))" }}
    >
      <TabHeader
        preLabel={preLabel}
        title={title}
        subtitle={subtitle}
        rightActions={rightActions}
      />
      {children}
    </div>
  );
}
