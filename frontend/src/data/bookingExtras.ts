// 레지던스 예약 탭 mock 보강 데이터
// - 평점(rating), 후기(reviews) — 서버 미연결, 화면 표시용
// - 본문(blurb/provides/region) 키워드 기반 클레이 씬 이미지 자동 매칭

import type { Residence } from "./residences";

export type ResidenceReview = {
  nickname: string;
  stars: number; // 1-5
  text: string;
};

// 추천 8곳 평점 (mock)
// 새 8개 ID는 residenceContent의 후기 평균값. 옛 ID는 호환용으로 보존.
export const ratings: Record<string, number> = {
  // 현재 사용 중인 8개 ID — residenceContent 후기 평균
  ganghwa: 4.75,
  yeongdeok: 4.25,
  yeongwol: 4.75,
  muju: 4.25,
  sejong: 4.25,
  uiseong: 4.75,
  hongseong: 4.75,
  daejeon: 4.25,
  // 옛 ID — 호환용 보존 (현재 residences 데이터엔 없음)
  gwangyang: 4.6,
  geoje: 4.7,
  jindo: 4.5,
  taean: 4.7,
  jeongseon: 4.6,
  yangyang: 4.9,
};

// 후기 — 곳당 2~3개
export const reviewsByResidence: Record<string, ResidenceReview[]> = {
  ganghwa: [
    {
      nickname: "느린아침",
      stars: 5,
      text: "갯벌이랑 한옥, 다 좋았어요. 아침 산책이 일과가 됐어요.",
    },
    {
      nickname: "섬바람_3주차",
      stars: 5,
      text: "한 달은 살아봐야 강화가 보이더라구요. 또 갈 거예요.",
    },
    {
      nickname: "조용한오후",
      stars: 4,
      text: "조식이 진짜 정성이에요. 와이파이도 빵빵.",
    },
  ],
  gwangyang: [
    {
      nickname: "코드와꽃",
      stars: 5,
      text: "전용 작업실에서 일하고 매화길 산책하는 루틴, 최고였어요.",
    },
    {
      nickname: "봄을기다린",
      stars: 4,
      text: "3월에 가시면 매화 만개. 도시에선 못 보는 풍경이에요.",
    },
  ],
  geoje: [
    {
      nickname: "바람과파도",
      stars: 5,
      text: "카약·등산 가이드까지 다 챙겨주셔서 진짜 편하게 즐겼어요.",
    },
    {
      nickname: "거제로간개발자",
      stars: 5,
      text: "원격근무 환경 너무 좋아서 결국 정착했습니다.",
    },
    {
      nickname: "주말러",
      stars: 4,
      text: "수상 액티비티 처음인데 강습이 친절해요.",
    },
  ],
  jindo: [
    {
      nickname: "그림그리는노마드",
      stars: 5,
      text: "운림산방 근처 한옥에서 한국화 그리며 보낸 5일. 조용해서 작업 진짜 잘됐어요.",
    },
    {
      nickname: "차한잔",
      stars: 4,
      text: "다도 체험 인상적. 한옥 마루에서 마시는 차 한 잔이 다였어요.",
    },
  ],
  taean: [
    {
      nickname: "노을수집가",
      stars: 5,
      text: "만리포 산책 루틴이 됐어요. 한 달 만에 마음이 다시 채워졌습니다.",
    },
    {
      nickname: "파도좋아",
      stars: 5,
      text: "서핑 강습 초보도 안전하게. 바다 가까워서 동선 짧고 좋아요.",
    },
    {
      nickname: "느린만리포",
      stars: 4,
      text: "조식이 매일 다르게 나와요. 작은 디테일이 만족도를 올려줍니다.",
    },
  ],
  yeongwol: [
    {
      nickname: "별보러왔어요",
      stars: 5,
      text: "별마로 천문대 가까운 입지. 밤하늘이 진짜 쏟아져요.",
    },
    {
      nickname: "동강러버",
      stars: 4,
      text: "동강 트레킹 코스 안내 받아 갔어요. 깊은 산속 분위기 좋아요.",
    },
  ],
  jeongseon: [
    {
      nickname: "고요한방",
      stars: 5,
      text: "완전한 고요가 필요할 때 추천. 한옥의 결이 좋고 다도가 일품.",
    },
    {
      nickname: "정선토박이_손님",
      stars: 4,
      text: "조식과 차 한 잔, 깊은 산속 한옥. 도시 소음 잊고 싶을 때.",
    },
  ],
  yangyang: [
    {
      nickname: "코딩하며쉼",
      stars: 5,
      text: "오전엔 일하고 오후엔 서핑. 일과 쉼 밸런스가 이렇게 좋을 일인가 싶었음.",
    },
    {
      nickname: "양양정착_시우",
      stars: 5,
      text: "전용 작업실+서핑 강습+조식까지. 워케이션 표준안 같아요.",
    },
    {
      nickname: "파도와노트북",
      stars: 5,
      text: "와이파이 진짜 빵빵. 화상회의도 문제없었고 동료들도 좋아함.",
    },
  ],
};

// 레지던스 id → 실사 사진 경로 (public/residences/<id>.<ext>)
// 8곳 모두 직접 매핑. 확장자는 실제 파일에 맞춤 (yeongwol만 AVIF, ganghwa만 JPEG, 나머지 JPG)
const RESIDENCE_PHOTO: Record<string, string> = {
  ganghwa: "/residences/ganghwa.jpeg",
  yeongdeok: "/residences/yeongdeok.jpg",
  yeongwol: "/residences/yeongwol.avif",
  muju: "/residences/muju.jpg",
  sejong: "/residences/sejong.jpg",
  uiseong: "/residences/uiseong.jpg",
  hongseong: "/residences/hongseong.jpg",
  daejeon: "/residences/daejeon.jpg",
};

// 폴백 — 알 수 없는 id일 때만 사용. 본문(blurb)/provides/region 키워드 → 클레이 씬 일러스트
const FALLBACK_IMAGE_RULES: Array<{ keywords: string[]; image: string }> = [
  {
    keywords: ["한옥", "차밭", "운림산방", "다도"],
    image: "/character1/clay-hanok-nap.png",
  },
  {
    keywords: ["갯벌", "해변", "바다", "만리포", "인구해변", "서핑", "청산도", "해안"],
    image: "/character1/clay-beach.png",
  },
  {
    keywords: ["시장", "5일장", "오일장"],
    image: "/character1/clay-market.png",
  },
  {
    keywords: ["카페", "작업실", "코워킹", "프린터"],
    image: "/character1/clay-barbershop.png",
  },
  {
    keywords: ["정류장", "버스"],
    image: "/character1/clay-bus-stop.png",
  },
  {
    keywords: ["계곡", "매화", "섬진강", "동강"],
    image: "/character1/clay-stream-watermelon.png",
  },
  {
    keywords: ["천문대", "별", "지도", "안내", "산속"],
    image: "/character1/clay-village-map.png",
  },
];

export function pickResidenceImage(residence: Residence): string {
  // 등록된 id면 항상 사진 우선
  const photo = RESIDENCE_PHOTO[residence.id];
  if (photo) return photo;
  // 모르는 id는 키워드 기반 클레이 일러스트 폴백
  const haystack = `${residence.blurb ?? ""} ${(residence.provides ?? []).join(" ")} ${residence.region}`;
  for (const rule of FALLBACK_IMAGE_RULES) {
    if (rule.keywords.some((k) => haystack.includes(k))) return rule.image;
  }
  return "/character1/clay-village-map.png";
}
