// 튜토리얼 오버레이 — 쿠키런식 가이드.
// 화면을 어둡게 깔고, 지정한 엘리먼트만 스포트라이트로 노출하고,
// 캐릭터 + 말풍선 + 손가락 포인터로 "여기 눌러봐" 안내.
//
// 동작 원리
//   · createPortal로 document.body에 마운트해 앱 z-index 충돌 회피
//   · 어둠은 위/아래/좌/우 4개 div로 깔고, hole(스포트라이트)만 비워둠
//     → hole 안은 자연스럽게 pointer-events 통과 → 원래 버튼이 눌림
//   · 어둠 div는 pointer-events: auto + stopPropagation으로 외곽 클릭 차단
//     → 사용자는 스포트라이트 버튼만 누를 수 있음 (튜토리얼 강제 진행)
//   · ResizeObserver + scroll/resize/visualViewport 리스너로 좌표 재계산
//     → 모바일 주소창 토글, 회전, 키보드 등에서도 좌표 안 어긋남
//
// 미션 진행 로직은 손대지 않음. 사용자가 스포트라이트 안의 진짜 버튼을 누르면
// 그 버튼의 기존 onClick이 실행되고, 부모가 onClick 안에서 dismiss 콜백을 호출.

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

type Rect = { top: number; left: number; width: number; height: number };

type Props = {
  visible: boolean;
  targetRef: React.RefObject<HTMLElement | null>;
  caption: string;                           // "여기 눌러봐"
  characterSrc: string;                      // "/character1/clay-baram-solo.png"
  characterSide?: "left" | "right";          // 기본 left
  padding?: number;                          // 스포트라이트 hole 여유(px), 기본 6
};

export default function TutorialOverlay({
  visible,
  targetRef,
  caption,
  characterSrc,
  characterSide = "left",
  padding = 6,
}: Props) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [vh, setVh] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerHeight : 0
  );

  // 타겟 좌표 측정 — 모바일 주소창 토글, 키보드, 회전 등 모든 변화 대응
  useLayoutEffect(() => {
    if (!visible) return;
    const el = targetRef.current;
    if (!el) return;

    let raf = 0;
    const measure = () => {
      const t = targetRef.current;
      if (!t) return;
      const r = t.getBoundingClientRect();
      // 아직 레이아웃 안 됐으면 다음 프레임으로 미룸
      if (r.width === 0 && r.height === 0) {
        raf = requestAnimationFrame(measure);
        return;
      }
      setRect({
        top: r.top - padding,
        left: r.left - padding,
        width: r.width + padding * 2,
        height: r.height + padding * 2,
      });
      setVh(window.innerHeight);
    };

    // 1프레임 뒤 첫 측정 — 레이아웃 정착 후
    raf = requestAnimationFrame(measure);

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.documentElement);

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { capture: true, passive: true });

    const vv = window.visualViewport;
    vv?.addEventListener("resize", measure);
    vv?.addEventListener("scroll", measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, { capture: true });
      vv?.removeEventListener("resize", measure);
      vv?.removeEventListener("scroll", measure);
    };
  }, [visible, targetRef, padding]);

  // visible 꺼지면 rect 초기화 — 다음 노출 시 깔끔하게
  useEffect(() => {
    if (!visible) setRect(null);
  }, [visible]);

  if (typeof document === "undefined") return null;

  // 어둠 영역 클릭/터치 차단 — 버튼을 눌러야만 진행
  const block = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const dim = "rgba(0,0,0,0.58)";

  return createPortal(
    <AnimatePresence>
      {visible && rect && (
        <motion.div
          key="tutorial-overlay"
          role="dialog"
          aria-live="polite"
          aria-label={caption}
          className="fixed inset-0 z-[60] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* ===== 4-사각형 어둠 — hole만 비워둠 ===== */}
          {/* 위 */}
          <div
            className="absolute pointer-events-auto"
            style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top), background: dim }}
            onMouseDown={block}
            onClick={block}
            onTouchStart={block}
          />
          {/* 아래 */}
          <div
            className="absolute pointer-events-auto"
            style={{
              top: rect.top + rect.height,
              left: 0,
              right: 0,
              bottom: 0,
              background: dim,
            }}
            onMouseDown={block}
            onClick={block}
            onTouchStart={block}
          />
          {/* 좌 */}
          <div
            className="absolute pointer-events-auto"
            style={{
              top: rect.top,
              left: 0,
              width: Math.max(0, rect.left),
              height: rect.height,
              background: dim,
            }}
            onMouseDown={block}
            onClick={block}
            onTouchStart={block}
          />
          {/* 우 */}
          <div
            className="absolute pointer-events-auto"
            style={{
              top: rect.top,
              left: rect.left + rect.width,
              right: 0,
              height: rect.height,
              background: dim,
            }}
            onMouseDown={block}
            onClick={block}
            onTouchStart={block}
          />

          {/* ===== 4 코너 웻지 — hole의 모서리를 둥글게(pill 모양)로.
                radial-gradient로 각 코너의 곡면 바깥쪽만 어둡게 칠함.
                pointer-events-none — 버튼 자체의 border-radius가 hit-test를 처리. ===== */}
          {(() => {
            const r = Math.min(50, rect.height / 2, rect.width / 2);
            const wedge = {
              position: "absolute" as const,
              width: r,
              height: r,
            };
            return (
              <>
                {/* TL */}
                <div
                  className="pointer-events-none"
                  style={{
                    ...wedge,
                    top: rect.top,
                    left: rect.left,
                    background: `radial-gradient(circle at bottom right, transparent ${r - 0.5}px, ${dim} ${r}px)`,
                  }}
                />
                {/* TR */}
                <div
                  className="pointer-events-none"
                  style={{
                    ...wedge,
                    top: rect.top,
                    left: rect.left + rect.width - r,
                    background: `radial-gradient(circle at bottom left, transparent ${r - 0.5}px, ${dim} ${r}px)`,
                  }}
                />
                {/* BL */}
                <div
                  className="pointer-events-none"
                  style={{
                    ...wedge,
                    top: rect.top + rect.height - r,
                    left: rect.left,
                    background: `radial-gradient(circle at top right, transparent ${r - 0.5}px, ${dim} ${r}px)`,
                  }}
                />
                {/* BR */}
                <div
                  className="pointer-events-none"
                  style={{
                    ...wedge,
                    top: rect.top + rect.height - r,
                    left: rect.left + rect.width - r,
                    background: `radial-gradient(circle at top left, transparent ${r - 0.5}px, ${dim} ${r}px)`,
                  }}
                />
              </>
            );
          })()}

          {/* ===== 스포트라이트 외곽 빛 — 살짝 펄스. pointer-events 통과 ===== */}
          <motion.div
            aria-hidden
            className="absolute pointer-events-none rounded-full"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              boxShadow:
                "0 0 0 3px rgba(255,255,255,0.9), 0 0 28px 6px rgba(255,255,255,0.45)",
            }}
            animate={{ scale: [1, 1.025, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ===== 캐릭터 + 말풍선 — 스포트라이트 위쪽 공간에 배치 ===== */}
          <CharacterBubble
            caption={caption}
            characterSrc={characterSrc}
            spotlightTop={rect.top}
            viewportHeight={vh}
            side={characterSide}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ───────── 캐릭터 + 말풍선 — 스포트라이트 위 공간에 자동 배치 ─────────
function CharacterBubble({
  caption,
  characterSrc,
  spotlightTop,
  viewportHeight,
  side,
}: {
  caption: string;
  characterSrc: string;
  spotlightTop: number;       // rect.top (스포트라이트 상단)
  viewportHeight: number;     // 현재 뷰포트 높이
  side: "left" | "right";
}) {
  // 캐릭터 발이 스포트라이트 약간 위(28px)에 닿도록.
  // 너무 작은 공간이면 최소 70px는 띄움.
  const bottomOffset = Math.max(70, viewportHeight - spotlightTop + 28);

  return (
    <motion.div
      className={`absolute pointer-events-none flex items-end gap-2 ${
        side === "left" ? "left-3" : "right-3"
      }`}
      style={{ bottom: bottomOffset }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.28, ease: "easeOut" }}
    >
      <motion.img
        src={characterSrc}
        alt=""
        aria-hidden
        className="w-[110px] h-[170px] object-contain object-bottom select-none
                   drop-shadow-[0_8px_14px_rgba(0,0,0,0.4)]"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        draggable={false}
      />
      <div
        className="relative mb-24 max-w-[190px] rounded-2xl bg-white px-3.5 py-2.5
                   text-ink text-[13.5px] font-extrabold leading-snug shadow-soft
                   border border-cream-200 whitespace-pre-line"
      >
        {caption}
        {/* 말풍선 꼬리 — 캐릭터 쪽으로 */}
        <span
          aria-hidden
          className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white
                     border-l border-b border-cream-200 rotate-45"
        />
      </div>
    </motion.div>
  );
}
