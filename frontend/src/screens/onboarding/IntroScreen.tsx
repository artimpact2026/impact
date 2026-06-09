// 온보딩 진입부 — 서비스 소개 인트로
// 캐릭터(바람이·지음이) 등장 인사 → 취지 → 콘텐츠 → 결과물(집 짓기) 순서의 카드뉴스.
// 마지막 컷의 "떠나기 🎒" 버튼을 누르면 본 온보딩(취향 분석)으로 진입한다.
// 첫 진입 시 앱 설명이 부족하다는 피드백을 보완하기 위한 화면.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PrimaryButton from "../../components/PrimaryButton";
import SpeechBubble from "../../components/SpeechBubble";
import baramiImg from "../../assets/char-barami-front.webp";
import jieumiImg from "../../assets/char-jieumi-front.webp";

// ─────────────────────────────────────────────────────────────
// 컷별 전용 일러스트 끼우는 곳 (선택)
// 새 일러스트를 받으면 src/assets/intro/ 에 넣고 아래처럼 import 후
// SLIDE_ART에 슬라이드 key로 매핑하면 됩니다. 비워두면 캐릭터 피규어로 폴백.
//   예) import artPurpose from "../../assets/intro/purpose.webp";
//       const SLIDE_ART = { purpose: artPurpose };
// ─────────────────────────────────────────────────────────────
const SLIDE_ART: Partial<Record<string, string>> = {
  // hello: artHello,
  // purpose: artPurpose,
  // content: artContent,
  // result: artResult,
};

type Props = {
  onDone: () => void; // 인트로 끝 → 본 온보딩으로
};

// 한 컷(슬라이드) 정의 — 어느 캐릭터를 강조할지 + 카피
type Focus = "both" | "barami" | "jieumi";

type Slide = {
  key: string;
  focus: Focus;
  chip?: string; // 상단 라벨 칩
  // 인사 컷일 때 캐릭터 머리 위 말풍선
  baramiSay?: string;
  jieumiSay?: string;
  title: string;
  // 본문(두 줄 글귀 등)
  body?: string;
  // 콘텐츠 컷의 아이콘 리스트
  items?: { emoji: string; label: string }[];
};

const SLIDES: Slide[] = [
  {
    key: "hello",
    focus: "both",
    chip: "반가워요 👋",
    baramiSay: "안녕! 나는 바람이",
    jieumiSay: "나는 지음이야",
    title: "우리가 청풍을\n소개해 줄게!",
    body: "잠시, 다른 지역의 바람을 짓고 와볼래요?",
  },
  {
    key: "purpose",
    focus: "barami",
    chip: "어떤 서비스예요?",
    title: "나에게 딱 맞는 지역에서\n살아보는 체험",
    body: "살아보기 위한 체험부터 실질적인 정보까지,\n귀촌을 미리 겪어보는 시뮬레이션이에요.",
  },
  {
    key: "content",
    focus: "jieumi",
    chip: "무엇을 할 수 있어요?",
    title: "직접 부딪히며\n마을을 알아가요",
    items: [
      { emoji: "🎯", label: "미션 수행" },
      { emoji: "✉️", label: "편지 주고받기" },
      { emoji: "💬", label: "커뮤니티" },
      { emoji: "🏡", label: "레지던스 예약" },
    ],
  },
  {
    key: "result",
    focus: "both",
    chip: "그래서 남는 건?",
    title: "나만의 집이\n한 채 지어져요",
    body: "체험을 쌓을수록 집이 완성돼요.\n어떤 지역이 나와 맞는지 한눈에 보여요.",
  },
];

export default function IntroScreen({ onDone }: Props) {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  const next = () => {
    if (isLast) onDone();
    else setIdx((i) => i + 1);
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden
                    bg-gradient-to-b from-[#FBF4DF] via-cream to-nature-50">
      {/* 상단: 건너뛰기 + 진행 점 */}
      <header className="relative pt-12 px-6 flex items-center justify-between">
        <div className="flex gap-1.5">
          {SLIDES.map((s, i) => (
            <span
              key={s.key}
              className={`h-1.5 rounded-full transition-all duration-300
                ${i === idx ? "w-5 bg-primary" : "w-1.5 bg-cream-200"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onDone}
          className="text-ink-mute text-[13px] font-semibold"
        >
          건너뛰기
        </button>
      </header>

      {/* 텍스트 블록 (상단) */}
      <section className="relative px-6 pt-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.3 }}
          >
            {slide.chip && (
              <span className="inline-block bg-white/80 text-primary text-[12px]
                               font-bold px-3 py-1 rounded-full shadow-soft">
                {slide.chip}
              </span>
            )}
            <h1 className="mt-3 text-ink text-[26px] font-extrabold leading-snug whitespace-pre-line">
              {slide.title}
            </h1>
            {slide.body && (
              <p className="mt-3 text-ink-soft text-[14px] leading-relaxed whitespace-pre-line">
                {slide.body}
              </p>
            )}

            {/* 콘텐츠 컷: 아이콘 칩 리스트 */}
            {slide.items && (
              <ul className="mt-5 grid grid-cols-2 gap-2.5 px-2">
                {slide.items.map((it, i) => (
                  <motion.li
                    key={it.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.3 }}
                    className="bg-white border border-cream-200 rounded-2xl
                               py-3 flex flex-col items-center gap-1 shadow-soft"
                  >
                    <span className="text-[24px]" aria-hidden>
                      {it.emoji}
                    </span>
                    <span className="text-ink text-[13px] font-bold">
                      {it.label}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 캐릭터 영역 (하단) */}
      <section className="relative flex-1 flex items-end justify-center">
        {/* 뒤쪽 언덕 장식 */}
        <svg
          className="absolute bottom-0 w-full h-40"
          viewBox="0 0 375 160"
          preserveAspectRatio="none"
          aria-hidden
        >
          <ellipse cx="110" cy="170" rx="180" ry="80" fill="#CDE8CD" opacity="0.7" />
          <ellipse cx="300" cy="180" rx="170" ry="78" fill="#B7DEB8" opacity="0.7" />
        </svg>

        <div className="relative flex items-end justify-center gap-1 pb-2 w-full px-6">
          {SLIDE_ART[slide.key] ? (
            // 컷 전용 일러스트가 있으면 그걸 크게 노출
            <AnimatePresence mode="wait">
              <motion.img
                key={slide.key}
                src={SLIDE_ART[slide.key]}
                alt=""
                aria-hidden
                className="w-[230px] max-h-[300px] object-contain drop-shadow-md"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </AnimatePresence>
          ) : (
            <>
              {/* 바람이 (왼쪽) */}
              <CharacterFigure
                img={baramiImg}
                name="바람이"
                say={slide.baramiSay}
                active={slide.focus === "both" || slide.focus === "barami"}
                align="left"
              />
              {/* 지음이 (오른쪽) */}
              <CharacterFigure
                img={jieumiImg}
                name="지음이"
                say={slide.jieumiSay}
                active={slide.focus === "both" || slide.focus === "jieumi"}
                align="right"
              />
            </>
          )}
        </div>
      </section>

      {/* 하단 CTA */}
      <footer className="relative px-6 pb-8 pt-2">
        <PrimaryButton onClick={next}>
          {isLast ? "떠나기 🎒" : "다음"}
        </PrimaryButton>
      </footer>
    </div>
  );
}

// 캐릭터 1명 — 강조 여부에 따라 크기/투명도/둥실 애니메이션
function CharacterFigure({
  img,
  name,
  say,
  active,
  align,
}: {
  img: string;
  name: string;
  say?: string;
  active: boolean;
  align: "left" | "right";
}) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      animate={{
        scale: active ? 1 : 0.82,
        opacity: active ? 1 : 0.45,
        y: active ? 0 : 8,
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* 말풍선 (인사 컷에서만) */}
      <AnimatePresence>
        {say && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="mb-3"
          >
            <SpeechBubble className="text-[13px]">{say}</SpeechBubble>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 둥실 떠오르는 캐릭터 */}
      <motion.img
        src={img}
        alt={name}
        className={`w-[124px] object-contain drop-shadow-md
          ${align === "right" ? "-ml-2" : "-mr-2"}`}
        animate={active ? { y: [-3, 3, -3] } : { y: 0 }}
        transition={
          active
            ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      />
    </motion.div>
  );
}
