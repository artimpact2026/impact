// 발견 탭 — Hero + 두 섹션 (Option C)
//
// 구조:
//   1) Hero — "오늘의 청년마을" 큰 카드 (첫 추천)
//   2) 오늘의 이야기 — 가로 스와이프 캐러셀 (커뮤니티 게시글)
//   3) 청년마을 둘러보기 — 작은 카드 리스트
//
// 한 화면에 둘 다 들어있어 첫 사용자도 "이야기·청년마을 둘 다 있구나" 즉시 인지.

import { motion } from "framer-motion";
import {
  recommendedResidences,
  type Residence,
} from "../data/residences";
import { pickResidenceImage, ratings } from "../data/bookingExtras";
import {
  communityPosts,
  CATEGORY_LABEL,
  type CommunityPost,
} from "../data/communityPosts";

// 옛 토글 API 호환용 — 더 이상 안 쓰지만 props 시그니처 유지
export type DiscoverSubTab = "stories" | "residences";

type Props = {
  subTab?: DiscoverSubTab; // 미사용
  onSubTabChange?: (sub: DiscoverSubTab) => void; // 미사용
  onSelectResidence: (r: Residence) => void;
  liked: Set<string>;
  onToggleLike: (residenceId: string) => void;
  onSeeAllStories: () => void;
  onSeeAllResidences: () => void;
};

export default function DiscoverScreen({
  onSelectResidence,
  liked,
  onToggleLike,
  onSeeAllStories,
  onSeeAllResidences,
}: Props) {
  const hero = recommendedResidences[0];
  const restResidences = recommendedResidences.slice(1);
  const featuredStories = communityPosts.slice(0, 6);

  return (
    <div className="h-[calc(100dvh-6rem)] overflow-y-auto bg-cream">
      {/* === 헤더 === */}
      <header className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-bold text-ink-mute tracking-[0.18em] uppercase">
          Discover · 발견
        </p>
        <h1 className="mt-1 text-[24px] font-extrabold text-ink leading-tight">
          둘러보기
        </h1>
        <p className="mt-1 text-[12px] text-ink-soft">
          마음에 드는 마을과 다른 사람들의 이야기를 만나보세요
        </p>
      </header>

      {/* === 1) Hero — 오늘의 청년마을 === */}
      {hero && (
        <section className="px-4 mt-3">
          <div className="flex items-baseline justify-between mb-2 px-1">
            <p className="text-[11px] font-extrabold text-ink-mute uppercase tracking-widest">
              오늘의 청년마을
            </p>
          </div>
          <HeroCard
            residence={hero}
            liked={liked.has(hero.id)}
            onToggleLike={() => onToggleLike(hero.id)}
            onSelect={() => onSelectResidence(hero)}
          />
        </section>
      )}

      {/* === 2) 오늘의 이야기 — 가로 스와이프 === */}
      <section className="mt-5">
        <div className="flex items-baseline justify-between mb-2 px-5">
          <p className="text-[11px] font-extrabold text-ink-mute uppercase tracking-widest">
            오늘의 이야기
          </p>
          <button
            type="button"
            onClick={onSeeAllStories}
            className="text-[11.5px] font-extrabold text-primary active:opacity-70"
          >
            전체 보기 →
          </button>
        </div>
        <div
          className="flex gap-2.5 overflow-x-auto no-scrollbar px-4 pb-1"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {featuredStories.map((post, i) => (
            <StoryCard key={post.id} post={post} index={i} />
          ))}
        </div>
      </section>

      {/* === 3) 청년마을 둘러보기 — 작은 카드 리스트 === */}
      <section className="px-4 mt-5 pb-10">
        <div className="flex items-baseline justify-between mb-2 px-1">
          <p className="text-[11px] font-extrabold text-ink-mute uppercase tracking-widest">
            청년마을 둘러보기
          </p>
          <button
            type="button"
            onClick={onSeeAllResidences}
            className="text-[11.5px] font-extrabold text-primary active:opacity-70"
          >
            전체 보기 →
          </button>
        </div>
        <div className="space-y-2">
          {restResidences.map((r, i) => (
            <ResidenceMiniCard
              key={r.id}
              residence={r}
              index={i}
              liked={liked.has(r.id)}
              onToggleLike={() => onToggleLike(r.id)}
              onSelect={() => onSelectResidence(r)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// =====================================================================
// Hero 카드 — 큰 이미지 + 정보 + ❤️
// =====================================================================

function HeroCard({
  residence,
  liked,
  onToggleLike,
  onSelect,
}: {
  residence: Residence;
  liked: boolean;
  onToggleLike: () => void;
  onSelect: () => void;
}) {
  const rating = ratings[residence.id];
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileTap={{ scale: 0.99 }}
      className="relative w-full rounded-3xl overflow-hidden bg-white border border-cream-200 shadow-soft text-left"
    >
      <div className="relative aspect-[4/3] bg-cream-100">
        <img
          src={pickResidenceImage(residence)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* 좌상단 추천 뱃지 */}
        <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/95 text-primary text-[10.5px] font-extrabold shadow-soft">
          ⭐ 가장 추천
        </span>
        {/* 우상단 좋아요 */}
        <button
          type="button"
          aria-label={liked ? "찜 취소" : "찜"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-soft
                     flex items-center justify-center text-[18px]"
        >
          {liked ? "❤️" : "🤍"}
        </button>
        {/* 하단 그라데이션 + 텍스트 */}
        <div className="absolute inset-x-0 bottom-0 px-4 pt-10 pb-4 bg-gradient-to-t from-black/65 via-black/30 to-transparent text-white">
          <p className="text-[11px] font-bold opacity-90 uppercase tracking-widest">
            {residence.region}
          </p>
          <p className="mt-0.5 text-[20px] font-extrabold leading-tight">
            {residence.name}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-[12px]">
            <span className="font-bold">📅 {residence.duration}</span>
            {rating && (
              <>
                <span className="opacity-50">·</span>
                <span className="font-bold">⭐ {rating.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>
      </div>
      {/* 카드 하단 — 한 줄 소개 */}
      {residence.blurb && (
        <p className="px-4 py-3 text-ink-soft text-[12.5px] leading-relaxed border-t border-cream-100">
          {residence.blurb}
        </p>
      )}
    </motion.button>
  );
}

// =====================================================================
// 이야기 카드 — 가로 스와이프 안의 한 장
// =====================================================================

function StoryCard({ post, index }: { post: CommunityPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 + index * 0.04, duration: 0.3 }}
      className="shrink-0 w-[240px] rounded-2xl bg-white border border-cream-200 shadow-soft p-3.5
                 flex flex-col"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-50 to-nature-50
                     border border-cream-200 flex items-center justify-center text-[14px]"
          aria-hidden
        >
          ✍
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-ink text-[12px] font-extrabold truncate">
            {post.nickname}
          </p>
          <p className="text-ink-mute text-[10px] truncate">
            📍 {post.region}
          </p>
        </div>
      </div>
      <span className="self-start mb-1.5 px-2 py-0.5 rounded-full bg-cream-100 text-[10px] font-bold text-ink-soft">
        {CATEGORY_LABEL[post.category]}
      </span>
      <p className="text-ink text-[12.5px] leading-relaxed line-clamp-4 flex-1">
        {post.body}
      </p>
      <div className="mt-2 pt-2 border-t border-cream-100 flex items-center gap-3 text-ink-mute text-[10.5px] font-bold">
        <span>♥ {post.likes}</span>
        <span>💬 {post.comments}</span>
      </div>
    </motion.div>
  );
}

// =====================================================================
// 작은 청년마을 카드 — 리스트용
// =====================================================================

function ResidenceMiniCard({
  residence,
  index,
  liked,
  onToggleLike,
  onSelect,
}: {
  residence: Residence;
  index: number;
  liked: boolean;
  onToggleLike: () => void;
  onSelect: () => void;
}) {
  const rating = ratings[residence.id];
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04, duration: 0.3 }}
      whileTap={{ scale: 0.99 }}
      className="w-full flex items-center gap-3 rounded-2xl bg-white border border-cream-200 shadow-soft
                 p-2.5 text-left"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-100 shrink-0 relative">
        <img
          src={pickResidenceImage(residence)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-ink text-[14.5px] font-extrabold leading-tight truncate">
          {residence.region}
        </p>
        <p className="mt-0.5 text-ink-soft text-[12px] truncate">
          {residence.name} · {residence.duration}
        </p>
        <div className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-mute font-bold">
          {rating && <span>⭐ {rating.toFixed(1)}</span>}
          {residence.hasSupport && (
            <>
              <span>·</span>
              <span className="text-nature-600">지원금</span>
            </>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-label={liked ? "찜 취소" : "찜"}
        onClick={(e) => {
          e.stopPropagation();
          onToggleLike();
        }}
        className="w-9 h-9 rounded-full bg-cream-50 border border-cream-200
                   flex items-center justify-center text-[16px] shrink-0"
      >
        {liked ? "❤️" : "🤍"}
      </button>
    </motion.button>
  );
}
