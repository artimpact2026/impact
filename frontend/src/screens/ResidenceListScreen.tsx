// 레지던스 추천 카드 리스트 — 지역 단위로 필터해서 표시
// 진입: DailySummary "이 지역 레지던스 보기" 또는 나의 여정 바텀시트 → "이주 리포트" 다음 단계

import { motion } from "framer-motion";
import {
  residences,
  matchScore,
  type LifeStyleType,
  type Residence,
} from "../data/residences";

type Props = {
  // 특정 지역만 보고싶을 때(region 이름 or residence.id)
  filterRegion?: string;
  // null이면 전체 추천 + 비추천 모두 표시
  lifestyle: LifeStyleType | null;
  onBack: () => void;
  onSelectResidence: (r: Residence) => void;
  title?: string;
};

export default function ResidenceListScreen({
  filterRegion,
  lifestyle,
  onBack,
  onSelectResidence,
  title,
}: Props) {
  // 같은 region 또는 같은 id로 필터링
  const list = filterRegion
    ? residences.filter(
        (r) => r.region === filterRegion || r.id === filterRegion
      )
    : residences;

  // 매칭 점수 높은 순 정렬
  const sorted = [...list].sort(
    (a, b) => matchScore(lifestyle, b) - matchScore(lifestyle, a)
  );

  return (
    <div className="min-h-[calc(100dvh-6rem)] flex flex-col bg-cream">
      <header className="pt-12 px-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="w-9 h-9 rounded-full bg-white shadow-soft
                     flex items-center justify-center text-ink"
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
        <div className="flex-1 min-w-0">
          <p className="text-ink-soft text-[11px] font-bold uppercase tracking-widest">
            레지던스
          </p>
          <h1 className="text-ink text-[20px] font-extrabold leading-tight">
            {title ??
              (filterRegion
                ? `${filterRegion}에서 머물 수 있는 곳`
                : "추천 레지던스")}
          </h1>
        </div>
      </header>

      <p className="px-5 mt-2 text-ink-soft text-[12px] leading-relaxed">
        {lifestyle
          ? `${lifestyle}에 가까운 곳부터 보여드려요.`
          : "여러 지역의 레지던스를 둘러볼 수 있어요."}
      </p>

      <main className="flex-1 px-5 mt-3 pb-6 overflow-y-auto">
        <ul className="space-y-2.5">
          {sorted.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              <ResidenceCard
                residence={r}
                lifestyle={lifestyle}
                onClick={() => onSelectResidence(r)}
              />
            </motion.li>
          ))}
        </ul>
      </main>
    </div>
  );
}

// =====================================================================
// 레지던스 카드 (썸네일 + 정보 + 매칭점수 + 가격/지원금)
// =====================================================================

export function ResidenceCard({
  residence,
  lifestyle,
  onClick,
}: {
  residence: Residence;
  lifestyle: LifeStyleType | null;
  onClick: () => void;
}) {
  const match = matchScore(lifestyle, residence);
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white border border-cream-200 rounded-2xl
                 overflow-hidden shadow-soft active:scale-[0.99] transition"
    >
      {/* 썸네일 영역 (대표 사진 자리) — 데모: 그라데이션 + 이모지 */}
      <div
        className="relative h-32 flex items-center justify-center"
        style={{
          background: getThumbGradient(residence.themeEmoji),
        }}
      >
        <span className="text-5xl drop-shadow" aria-hidden>
          {residence.themeEmoji}
        </span>
        {/* 매칭 점수 뱃지 */}
        <span
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full
                     bg-white/95 text-primary text-[11px] font-extrabold shadow-soft"
        >
          {lifestyle ? `${lifestyle}과 ${match}%` : `매칭 ${match}%`}
        </span>
        {/* 지원금 뱃지 */}
        {residence.hasSupport && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full
                           bg-nature-500 text-white text-[10px] font-extrabold shadow-soft">
            정부 지원금
          </span>
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-1.5">
          <p className="text-ink text-[15px] font-extrabold leading-tight">
            {residence.name}
          </p>
        </div>
        <p className="mt-0.5 text-ink-soft text-[11px]">
          📍 {residence.region} · {residence.duration}
        </p>
        {residence.blurb && (
          <p className="mt-1.5 text-ink text-[12px] leading-relaxed line-clamp-2">
            {residence.blurb}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-1.5">
            {residence.price !== undefined && (
              <span className="px-2 py-0.5 rounded-full bg-cream-100 text-ink text-[11px] font-bold">
                월 {residence.price}만원~
              </span>
            )}
            {residence.capacity !== undefined && (
              <span className="px-2 py-0.5 rounded-full bg-cream-100 text-ink-soft text-[11px] font-bold">
                정원 {residence.capacity}명
              </span>
            )}
          </div>
          <span className="text-primary text-[11px] font-extrabold">자세히 ›</span>
        </div>
      </div>
    </button>
  );
}

function getThumbGradient(emoji: string): string {
  // 테마에 따라 그라데이션 자동 매핑
  const sea = ["🌊", "🏖️", "🏄", "🐚"];
  const flower = ["🌸", "🌷"];
  const mountain = ["⛰️", "🏞️", "🌅", "✨", "🍃"];
  if (sea.includes(emoji))
    return "linear-gradient(135deg,#A8C8DE 0%,#B8D4E8 60%,#F4E5C0 100%)";
  if (flower.includes(emoji))
    return "linear-gradient(135deg,#F4C5D8 0%,#FFE0CC 100%)";
  if (mountain.includes(emoji))
    return "linear-gradient(135deg,#A8D5A8 0%,#DDEBC8 100%)";
  return "linear-gradient(135deg,#FFE0CC 0%,#FFF6E8 100%)";
}
