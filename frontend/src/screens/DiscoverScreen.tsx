// 발견 탭 — 시각 위계 + 8px 그리드 + 통일된 카드 (v2)
//
// 구조 원칙:
//   · 8px 디자인 그리드 — 모든 패딩·마진은 4/8/12/16/20/24/32 단위
//   · 섹션 단위: pt-6 pb-6 px-4, 각 섹션 사이는 시각적 분리 (border + bg subtle 변화)
//   · 카드 통일: 같은 종류는 같은 높이·너비 (overflow는 truncate / line-clamp)
//   · 위→아래 위계: Hero(1개 강조) → 가로 캐러셀 → 세로 리스트 (밀도 점진 증가)
//
// 디자인 토큰:
//   · 섹션 헤더: 16px 굵은 타이틀 + 11px subtitle/카운트 + 우측 action
//   · 카드 radius: 16px (rounded-2xl)
//   · 그림자: shadow-soft (전 카드 통일)
//   · 본문 트렁케이트: 한 줄 truncate / 다중 line-clamp-2|3

import { motion } from "framer-motion";
import { type ReactNode } from "react";
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
import TabLayout from "../components/TabLayout";

// 옛 토글 API 호환용 — 더 이상 안 쓰지만 props 시그니처 유지
export type DiscoverSubTab = "stories" | "residences";

type Props = {
  subTab?: DiscoverSubTab;
  onSubTabChange?: (sub: DiscoverSubTab) => void;
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
    <TabLayout
      preLabel="Discover"
      title="둘러보기"
      subtitle="마음에 드는 마을과 다른 사람들의 이야기"
    >
      {/* ===== Section 1 · Hero ===== */}
      <Section>
        <SectionHeader title="오늘의 청년마을" subtitle="가장 추천하는 한 곳" />
        {hero && (
          <HeroCard
            residence={hero}
            liked={liked.has(hero.id)}
            onToggleLike={() => onToggleLike(hero.id)}
            onSelect={() => onSelectResidence(hero)}
          />
        )}
      </Section>

      {/* ===== Section 2 · Stories — 가로 캐러셀 ===== */}
      <SectionDivider />
      <Section>
        <SectionHeader
          title="오늘의 이야기"
          subtitle={`${featuredStories.length}개`}
          action={
            <button
              type="button"
              onClick={onSeeAllStories}
              className="text-[12px] font-extrabold text-primary active:opacity-70"
            >
              전체 보기 →
            </button>
          }
        />
        <div
          className="-mx-4 px-4 flex gap-3 overflow-x-auto no-scrollbar"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {featuredStories.map((post, i) => (
            <StoryCard key={post.id} post={post} index={i} />
          ))}
        </div>
      </Section>

      {/* ===== Section 3 · 청년마을 리스트 ===== */}
      <SectionDivider />
      <Section className="pb-10">
        <SectionHeader
          title="청년마을 둘러보기"
          subtitle={`${restResidences.length}곳`}
          action={
            <button
              type="button"
              onClick={onSeeAllResidences}
              className="text-[12px] font-extrabold text-primary active:opacity-70"
            >
              전체 보기 →
            </button>
          }
        />
        <div className="space-y-2">
          {restResidences.map((r, i) => (
            <ResidenceListItem
              key={r.id}
              residence={r}
              index={i}
              liked={liked.has(r.id)}
              onToggleLike={() => onToggleLike(r.id)}
              onSelect={() => onSelectResidence(r)}
            />
          ))}
        </div>
      </Section>
    </TabLayout>
  );
}

// =====================================================================
// 레이아웃 빌딩 블록 — 디자인 시스템 일관성용
// =====================================================================

function Section({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  // 모든 섹션: 좌우 16px, 상하 24px
  return (
    <section className={`px-4 pt-6 pb-6 ${className ?? ""}`}>{children}</section>
  );
}

function SectionDivider() {
  // 섹션 간 시각적 분리 — 1px 헤어라인 + 양쪽 16px 마진
  return (
    <div className="mx-4 border-t border-cream-200/70" role="presentation" />
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <div className="flex-1 min-w-0">
        <h2 className="text-ink text-[16px] font-extrabold leading-tight truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-ink-mute text-[11.5px] font-bold tracking-wide">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// =====================================================================
// Hero 카드 — 큰 강조 카드. 본문 truncate.
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
      className="relative w-full rounded-2xl overflow-hidden bg-white
                 border border-cream-200 shadow-soft text-left"
    >
      {/* 이미지 — 통일 비율 16:11 */}
      <div className="relative aspect-[16/11] bg-cream-100">
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
        <div className="absolute inset-x-0 bottom-0 px-4 pt-12 pb-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent text-white">
          <p className="text-[11px] font-bold opacity-90 uppercase tracking-widest truncate">
            {residence.region}
          </p>
          <p className="mt-0.5 text-[20px] font-extrabold leading-tight truncate">
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
      {/* 카드 하단 — 한 줄 소개. 다중 라인 line-clamp-2 */}
      {residence.blurb && (
        <p className="px-4 py-3 text-ink-soft text-[12.5px] leading-relaxed line-clamp-2 border-t border-cream-100">
          {residence.blurb}
        </p>
      )}
    </motion.button>
  );
}

// =====================================================================
// 이야기 카드 — 가로 캐러셀. 모든 카드 동일 사이즈 (240×196).
// =====================================================================

function StoryCard({ post, index }: { post: CommunityPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 + index * 0.04, duration: 0.3 }}
      className="shrink-0 w-[240px] h-[196px] rounded-2xl bg-white border border-cream-200 shadow-soft p-4
                 flex flex-col"
      style={{ scrollSnapAlign: "start" }}
    >
      {/* 발신자 */}
      <div className="flex items-center gap-2">
        <span
          className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-50 to-nature-50
                     border border-cream-200 flex items-center justify-center text-[14px] shrink-0"
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
      {/* 카테고리 칩 */}
      <span className="self-start mt-2 px-2 py-0.5 rounded-full bg-cream-100 text-[10px] font-bold text-ink-soft">
        {CATEGORY_LABEL[post.category]}
      </span>
      {/* 본문 — line-clamp-3 로 균일 높이 보장 */}
      <p className="mt-2 text-ink text-[12.5px] leading-relaxed line-clamp-3 flex-1">
        {post.body}
      </p>
      {/* 풋터 — 좋아요·댓글 */}
      <div className="mt-2 pt-2 border-t border-cream-100 flex items-center gap-3 text-ink-mute text-[10.5px] font-bold">
        <span>♥ {post.likes}</span>
        <span>💬 {post.comments}</span>
      </div>
    </motion.div>
  );
}

// =====================================================================
// 청년마을 리스트 아이템 — 모든 카드 동일 높이 (88px). truncate 일관.
// =====================================================================

function ResidenceListItem({
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
      className="w-full h-[88px] flex items-center gap-3 rounded-2xl bg-white
                 border border-cream-200 shadow-soft p-2 text-left"
    >
      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-cream-100 shrink-0 relative">
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
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-mute font-bold">
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
