// 시뮬레이션 흐름 등 TabLayout 을 쓰지 않는 페이지의 베이스 레이아웃.
//
// 역할:
//   - 모든 페이지의 하단 콘텐츠가 BottomNav (+ 중앙 돌출 버튼) 에 가려지지 않도록
//     `--content-bottom` 만큼 padding-bottom 을 자동 적용.
//   - 페이지마다 동일한 cream 바탕 + min-height 보장.
//
// 사용 패턴:
//   <PageShell>
//     <header>...</header>
//     <main>...</main>
//     <button>다음</button>   // 이 버튼이 nav/돌출 버튼에 가려지지 않음
//   </PageShell>
//
// 변형:
//   - `noPad`  : 전체 풀블리드 (예: TravelingScreen 의 지도 애니메이션 — 직접 padding 관리)
//   - `scroll` : 내부에 자체 스크롤 컨테이너로 동작 (TabLayout 와 동일 동작)
//   - `bg`     : 바탕 색 override (히어로 컬러 페이지 등)

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  // padding 제거 — 풀블리드 화면 (TravelingScreen 등)
  noPad?: boolean;
  // 내부 스크롤 영역으로 동작 (height 고정, overflow-y-auto)
  scroll?: boolean;
  // 바탕색 override — 미지정 시 bg-cream
  bg?: string;
};

export default function PageShell({
  children,
  className = "",
  noPad = false,
  scroll = false,
  bg = "bg-cream",
}: Props) {
  // 스크롤 모드: TabLayout 과 동일한 height 계산 (100dvh - content-bottom)
  if (scroll) {
    return (
      <div
        className={`overflow-y-auto ${bg} ${className}`}
        style={{ height: "calc(100dvh - var(--content-bottom))" }}
      >
        {children}
      </div>
    );
  }

  // 기본 모드: min-height + 하단 padding 으로 nav/돌출 버튼 클리어런스 확보
  return (
    <div
      className={`min-h-[100dvh] ${bg} ${className}`}
      style={noPad ? undefined : { paddingBottom: "var(--content-bottom)" }}
    >
      {children}
    </div>
  );
}
