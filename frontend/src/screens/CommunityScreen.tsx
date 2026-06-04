// 커뮤니티(이야기) 탭 — 이미지 중심 SNS 피드
// 카테고리 필터 + hero 이미지 카드 + 좋아요 토글(화면 상태로만)

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORY_LABEL,
  communityPosts,
  type CommunityPost,
  type PostCategory,
} from "../data/communityPosts";

// 필터 칩 정의 — null = "전체"
const FILTERS: Array<{ key: PostCategory | null; label: string }> = [
  { key: null, label: "전체" },
  { key: "mission", label: "미션후기" },
  { key: "experience", label: "체험후기" },
  { key: "migration", label: "이주스토리" },
  { key: "place", label: "지역이야기" },
];

// 아바타 파스텔 팔레트 (닉네임 해시로 선택)
const AVATAR_PALETTE = [
  "#FFD0BB",
  "#C9E1EF",
  "#B1DCB5",
  "#FFE9A8",
  "#FFC4DC",
  "#E8C8A4",
  "#A8CFB5",
  "#FFB6A8",
];

// 카테고리별 칩 스타일 (카드 본문 위)
const CATEGORY_CHIP_STYLE: Record<PostCategory, { bg: string; text: string }> = {
  mission: { bg: "bg-primary-100", text: "text-primary-600" },
  experience: { bg: "bg-nature-100", text: "text-nature-600" },
  migration: { bg: "bg-[#FFE9D2]", text: "text-[#B8973F]" },
  place: { bg: "bg-[#E8F0F4]", text: "text-[#5E8FA8]" },
};

// 본문/지역 키워드 → 클레이 씬 이미지 자동 매칭
const IMAGE_RULES: Array<{ keywords: string[]; image: string }> = [
  {
    keywords: ["갯벌", "해변", "바다", "만리포", "인구해변", "서핑", "청산도"],
    image: "/character1/clay-beach.png",
  },
  {
    keywords: ["시장", "5일장", "오일장", "매대", "장 구경"],
    image: "/character1/clay-market.png",
  },
  {
    keywords: ["한옥", "차밭", "운림산방", "한국화", "다도"],
    image: "/character1/clay-hanok-nap.png",
  },
  {
    keywords: ["카페", "이발소", "가게", "사장", "코워킹", "작업실"],
    image: "/character1/clay-barbershop.png",
  },
  {
    keywords: ["정류장", "버스"],
    image: "/character1/clay-bus-stop.png",
  },
  {
    keywords: ["시내", "계곡", "매화", "섬진강"],
    image: "/character1/clay-stream-watermelon.png",
  },
  {
    keywords: ["천문대", "별이", "별마로", "지도", "안내소", "산속"],
    image: "/character1/clay-village-map.png",
  },
];

function pickImage(post: CommunityPost): string {
  const haystack = `${post.body} ${post.region}`;
  for (const rule of IMAGE_RULES) {
    if (rule.keywords.some((k) => haystack.includes(k))) return rule.image;
  }
  return "/character1/clay-village-map.png";
}

export default function CommunityScreen() {
  const [filter, setFilter] = useState<PostCategory | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  // 필터 변경 시 피드 상단으로 자동 스크롤 (내부 스크롤 컨테이너 기준)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [filter]);

  const visiblePosts = useMemo(
    () =>
      filter ? communityPosts.filter((p) => p.category === filter) : communityPosts,
    [filter]
  );

  const toggleLike = (id: string) =>
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div ref={scrollRef} className="h-screen overflow-y-auto bg-cream">
      {/* 상단 sticky 헤더 + 필터 */}
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur">
        <div className="px-6 pt-7 pb-4 relative">
          <p className="text-[10px] font-bold text-ink-mute tracking-[0.18em] uppercase">
            Community
          </p>
          <h1 className="mt-1 text-[28px] font-extrabold text-ink leading-tight">
            이야기
          </h1>
          <p className="mt-1 text-[12px] text-ink-soft">
            먼저 다녀온 사람들의 한 줄 기록
          </p>
          <img
            src="/character1/clay-jieum-solo.png"
            alt=""
            aria-hidden
            className="absolute top-3 right-5 w-[52px] h-auto drop-shadow-[0_6px_10px_rgba(62,44,32,0.22)] pointer-events-none"
          />
        </div>
        <CategoryFilter value={filter} onChange={setFilter} />
      </header>

      {/* 피드 */}
      <section className="pt-4 pb-32">
        {visiblePosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={liked.has(post.id)}
            onToggleLike={() => toggleLike(post.id)}
          />
        ))}

        {visiblePosts.length === 0 && (
          <div className="mx-4 mt-6 bg-white rounded-[28px] px-5 py-10 shadow-soft border border-cream-200 text-center">
            <p className="text-[28px]" aria-hidden>
              📭
            </p>
            <p className="mt-2 text-[13px] font-bold text-ink">
              아직 이 카테고리의 이야기가 없어요
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// =====================================================================
// 카테고리 필터 — 미니멀: 선택 칩만 강조
// =====================================================================
function CategoryFilter({
  value,
  onChange,
}: {
  value: PostCategory | null;
  onChange: (next: PostCategory | null) => void;
}) {
  return (
    <div className="overflow-x-auto no-scrollbar px-5 pb-4">
      <div className="flex gap-1.5 w-max">
        {FILTERS.map((f) => {
          const isActive = value === f.key;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => onChange(f.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] transition active:scale-[0.97]
                ${
                  isActive
                    ? "bg-primary text-white font-extrabold shadow-soft"
                    : "bg-transparent text-ink-mute font-semibold"
                }`}
              aria-pressed={isActive}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// 게시글 카드 — hero 이미지 중심
// =====================================================================
function PostCard({
  post,
  liked,
  onToggleLike,
}: {
  post: CommunityPost;
  liked: boolean;
  onToggleLike: () => void;
}) {
  const displayLikes = post.likes + (liked ? 1 : 0);
  const heroImage = useMemo(() => pickImage(post), [post]);

  return (
    <article className="mx-4 mb-6 bg-white rounded-[28px] shadow-soft border border-cream-200/80 overflow-hidden">
      {/* 프로필 줄 */}
      <header className="px-5 pt-4 pb-3 flex items-center gap-3">
        <Avatar nickname={post.nickname} />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-extrabold text-ink leading-tight truncate">
            {post.nickname}
          </p>
          <p className="text-[10.5px] text-ink-mute mt-0.5 tracking-wider uppercase">
            {post.region} · {CATEGORY_LABEL[post.category]}
          </p>
        </div>
        <button
          type="button"
          aria-label="더보기"
          className="text-ink-mute text-[20px] leading-none px-2 py-1 active:scale-[0.94]"
        >
          ⋯
        </button>
      </header>

      {/* 히어로 이미지 — 카드 안쪽에 큼직하게, 우상단 지역 pill */}
      <div className="mx-4 relative">
        <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-cream-200">
          <img
            src={heroImage}
            alt={`${post.region} 일러스트`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <span
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full
                     bg-white/95 backdrop-blur text-ink text-[10.5px] font-extrabold
                     shadow-soft border border-white/70"
        >
          📍 {post.region}
        </span>
      </div>

      {/* 본문 */}
      <div className="px-5 pt-4 pb-2">
        <CategoryChip category={post.category} />
        <p className="mt-2.5 text-ink text-[14.5px] leading-[1.65] whitespace-pre-line">
          {post.body}
        </p>
      </div>

      {/* 액션 바 */}
      <ActionBar
        liked={liked}
        likes={displayLikes}
        comments={post.comments}
        onToggleLike={onToggleLike}
      />
    </article>
  );
}

// =====================================================================
// 아바타 — 닉네임 이니셜 + 해시로 파스텔 배경 자동
// =====================================================================
function Avatar({ nickname }: { nickname: string }) {
  const initial = nickname.charAt(0).toUpperCase();
  const hash = Array.from(nickname).reduce(
    (acc, c) => acc + c.charCodeAt(0),
    0
  );
  const bg = AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center
                 text-ink text-[14px] font-extrabold shrink-0
                 ring-2 ring-white shadow-soft"
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      {initial}
    </div>
  );
}

// =====================================================================
// 카테고리 칩 (카드 본문 위)
// =====================================================================
function CategoryChip({ category }: { category: PostCategory }) {
  const { bg, text } = CATEGORY_CHIP_STYLE[category];
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${bg} ${text}`}
    >
      {CATEGORY_LABEL[category]}
    </span>
  );
}

// =====================================================================
// 액션 바 — ♡ / 💬 / 🔖 + "좋아요 N개"
// =====================================================================
function ActionBar({
  liked,
  likes,
  comments,
  onToggleLike,
}: {
  liked: boolean;
  likes: number;
  comments: number;
  onToggleLike: () => void;
}) {
  return (
    <div className="px-4 pt-3 pb-4 mt-1 border-t border-cream-200/70">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleLike}
          aria-pressed={liked}
          aria-label={liked ? "좋아요 취소" : "좋아요"}
          className="p-2 active:scale-[0.86] transition"
        >
          <HeartIcon filled={liked} />
        </button>
        <button
          type="button"
          aria-label="댓글"
          className="p-2 flex items-center gap-1.5 active:scale-[0.94]"
        >
          <CommentIcon />
          <span className="text-[12.5px] font-bold text-ink-soft">{comments}</span>
        </button>
        <button
          type="button"
          aria-label="저장"
          className="ml-auto p-2 active:scale-[0.94]"
        >
          <BookmarkIcon />
        </button>
      </div>
      <p className="mt-1 px-2 text-[12.5px] font-extrabold text-ink">
        좋아요 {likes.toLocaleString("ko-KR")}개
      </p>
    </div>
  );
}

// =====================================================================
// 아이콘들 — outline/filled SVG
// =====================================================================
function HeartIcon({ filled }: { filled: boolean }) {
  const stroke = "#FF7043";
  const fill = filled ? "#FF7043" : "none";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={fill} aria-hidden>
      <path
        d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 3.3c0 5.6-7.5 10.2-7.5 10.2Z"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8A2.5 2.5 0 0 1 17.5 17H12l-4 3.5V17H6.5A2.5 2.5 0 0 1 4 14.5v-8Z"
        stroke="#6B5446"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z"
        stroke="#6B5446"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
