// 온보딩 진입부 — 캐릭터가 앱을 소개하는 인트로
// 바람이·지음이가 번갈아 등장해 '바람을 짓다'를 안내한다: 인사 → 취지 → 콘텐츠 → 결과물(집 짓기).
// 말하는 캐릭터가 강조되고, 그 캐릭터의 말풍선으로 한 컷씩 소개한다.
// 마지막 컷의 "떠나기 🎒" 버튼을 누르면 본 온보딩(취향 분석)으로 진입한다.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PrimaryButton from "../../components/PrimaryButton";
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

// 말하는 주체 — 둘 중 하나 또는 함께
type Speaker = "barami" | "jieumi" | "both";

type Slide = {
  key: string;
  speaker: Speaker; // 이 컷에서 말하는(강조되는) 캐릭터
  chip: string; // 상단 라벨 칩
  text: string; // 캐릭터가 건네는 소개 대사(말풍선)
  // 콘텐츠 컷의 아이콘 리스트
  items?: { emoji: string; label: string }[];
};

const SPEAKER_NAME: Record<Speaker, string> = {
  barami: "바람이",
  jieumi: "지음이",
  both: "바람이 & 지음이",
};

const SLIDES: Slide[] = [
  {
    key: "hello",
    speaker: "both",
    chip: "반가워요 👋",
    text: "안녕! 우리는 바람이랑 지음이야.\n'바람을 짓다'가 어떤 앱인지 소개해 줄게!",
  },
  {
    key: "purpose",
    speaker: "barami",
    chip: "어떤 서비스예요?",
    text: "나에게 딱 맞는 지역에서 살아보는 체험이야.\n살아보기 전에, 실질적인 정보까지 얻어가!",
  },
  {
    key: "content",
    speaker: "jieumi",
    chip: "무엇을 할 수 있어요?",
    text: "미션 수행, 편지, 커뮤니티,\n레지던스 예약까지 직접 해볼 수 있어!",
    items: [
      { emoji: "🎯", label: "미션 수행" },
      { emoji: "✉️", label: "편지 주고받기" },
      { emoji: "💬", label: "커뮤니티" },
      { emoji: "🏡", label: "레지던스 예약" },
    ],
  },
  {
    key: "result",
    speaker: "both",
    chip: "그래서 남는 건?",
    text: "체험을 쌓을수록 나만의 집이 지어져.\n자, 이제 진짜 떠나볼까?",
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

  const baramiActive = slide.speaker === "both" || slide.speaker === "barami";
  const jieumiActive = slide.speaker === "both" || slide.speaker === "jieumi";

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden
                    bg-gradient-to-b from-[#FBF4DF] via-cream to-nature-50">
      {/* 상단: 진행 점 + 건너뛰기 */}
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

      {/* 캐릭터의 소개 말풍선 (상단) */}
      <section className="relative px-6 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <span className="inline-block bg-white/80 text-primary text-[12px]
                             font-bold px-3 py-1 rounded-full shadow-soft">
              {slide.chip}
            </span>

            {/* 말풍선 — 이름표 + 대사, 아래로 꼬리 */}
            <div className="relative mt-3 w-full max-w-[300px]">
              <div className="bg-white rounded-3xl shadow-soft border border-cream-200 px-5 py-4">
                <SpeakerTag speaker={slide.speaker} />
                <p className="mt-1.5 text-ink text-[17px] font-extrabold leading-snug whitespace-pre-line">
                  {slide.text}
                </p>
              </div>
              {/* 말풍선 꼬리 (아래 방향) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-4 h-4
                           bg-white border-r border-b border-cream-200 rotate-45"
                aria-hidden
              />
            </div>

            {/* 콘텐츠 컷: 아이콘 칩 리스트 */}
            {slide.items && (
              <ul className="mt-5 grid grid-cols-2 gap-2.5 w-full max-w-[300px]">
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
                active={baramiActive}
                speaking={slide.speaker === "barami"}
                align="left"
              />
              {/* 지음이 (오른쪽) */}
              <CharacterFigure
                img={jieumiImg}
                name="지음이"
                active={jieumiActive}
                speaking={slide.speaker === "jieumi"}
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

// 말풍선 이름표 — 누가 말하는지 + 색 강조
function SpeakerTag({ speaker }: { speaker: Speaker }) {
  const color =
    speaker === "jieumi"
      ? "text-primary"
      : speaker === "barami"
        ? "text-nature-600"
        : "text-ink-soft";
  return (
    <span className={`text-[12px] font-extrabold ${color}`}>
      {SPEAKER_NAME[speaker]}
    </span>
  );
}

// 캐릭터 1명 — 강조 여부에 따라 크기/투명도/둥실 애니메이션
function CharacterFigure({
  img,
  name,
  active,
  speaking,
  align,
}: {
  img: string;
  name: string;
  active: boolean;
  speaking: boolean; // 혼자 말하는 컷이면 통통 튀게
  align: "left" | "right";
}) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      animate={{
        scale: active ? 1 : 0.8,
        opacity: active ? 1 : 0.4,
        y: active ? 0 : 10,
      }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <motion.img
        src={img}
        alt={name}
        className={`w-[128px] object-contain drop-shadow-md
          ${align === "right" ? "-ml-2" : "-mr-2"}`}
        animate={
          speaking
            ? { y: [-5, 2, -5] } // 말하는 캐릭터는 좀 더 크게 통통
            : active
              ? { y: [-3, 3, -3] }
              : { y: 0 }
        }
        transition={
          active
            ? { duration: speaking ? 2.2 : 3, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      />
    </motion.div>
  );
}
