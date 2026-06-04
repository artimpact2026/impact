// 커뮤니티(이야기) 탭 mock 게시글
// 카테고리 4종: 미션후기 / 체험후기 / 이주스토리 / 지역이야기
// comments는 장식용 mock 수치 (서버 미연결)

export type PostCategory = "mission" | "experience" | "migration" | "place";

export type CommunityPost = {
  id: string;
  nickname: string;
  region: string;
  category: PostCategory;
  body: string;
  likes: number;
  comments: number;
};

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  mission: "미션후기",
  experience: "체험후기",
  migration: "이주스토리",
  place: "지역이야기",
};

export const communityPosts: CommunityPost[] = [
  // 미션후기
  {
    id: "post-1",
    nickname: "섬바람_3주차",
    region: "강화",
    category: "mission",
    body: "강화 갯벌 미션 하다가 진짜 그 자리 가보고 싶어졌어요. 바람이가 한 시간이면 충분하다던 말, 직접 걸어보니 맞더라구요. 쌓인 게 다 날아가는 기분.",
    likes: 42,
    comments: 7,
  },
  {
    id: "post-2",
    nickname: "영월러버",
    region: "영월",
    category: "mission",
    body: "별마로 천문대 미션 보고 충동적으로 영월행 버스 탔습니다. 도시에선 안 보이던 별이 머리 위로 쏟아져요. 미션이 사람을 움직이네요.",
    likes: 88,
    comments: 14,
  },
  {
    id: "post-3",
    nickname: "첫달살이",
    region: "진도",
    category: "mission",
    body: "진도 5일장 미션, 화면으로만 봤는데도 장 구경 가고 싶어서 혼났어요. 결국 다녀옴. 귤 한 봉지 사들고 왔습니다 🍊",
    likes: 27,
    comments: 5,
  },
  // 체험후기
  {
    id: "post-4",
    nickname: "노을수집가",
    region: "태안",
    category: "experience",
    body: "태안 한 달 살기 끝났어요. 아침마다 만리포 산책이 루틴이 됐는데, 도시에선 상상도 못 한 여백이었어요. 떠나기 싫다…",
    likes: 119,
    comments: 22,
  },
  {
    id: "post-5",
    nickname: "그림그리는노마드",
    region: "진도",
    category: "experience",
    body: "진도 운림산방 근처 레지던스 추천. 조용해서 작업 진짜 잘되고 와이파이도 빵빵합니다. 한국화 보러 다녀온 건 보너스.",
    likes: 64,
    comments: 11,
  },
  {
    id: "post-6",
    nickname: "코딩하며쉼",
    region: "양양",
    category: "experience",
    body: "인구해변 코워킹 레지던스 2주 살았어요. 오전엔 일하고 오후엔 서핑. 일과 쉼 밸런스가 이렇게 좋을 일인가 싶었음.",
    likes: 73,
    comments: 13,
  },
  // 이주스토리
  {
    id: "post-7",
    nickname: "양양정착_시우",
    region: "양양",
    category: "migration",
    body: "3년 차 양양 이주민입니다. 처음엔 서핑 하나 보고 왔는데, 지금은 동네 카페 사장이 됐네요. 돌아보면 그 첫 한 달이 전부였어요. 겁먹지 말고 일단 한 달만 살아보세요.",
    likes: 204,
    comments: 38,
  },
  {
    id: "post-8",
    nickname: "거제로간개발자",
    region: "거제",
    category: "migration",
    body: "서울 직장 그만두고 거제로 내려온 지 1년 반. 바다 보며 원격근무 합니다. 수입은 줄었는데 삶의 만족은 두 배. 후회 없어요.",
    likes: 156,
    comments: 29,
  },
  // 지역이야기
  {
    id: "post-9",
    nickname: "정선토박이",
    region: "정선",
    category: "place",
    body: "정선은 5일장이 진짜입니다. 곤드레밥 한 그릇이면 하루가 행복해요. 겨울 눈 풍경은 덤이고요. 외지분들 오면 제가 안내해드릴게요.",
    likes: 91,
    comments: 16,
  },
  {
    id: "post-10",
    nickname: "광양매화댁",
    region: "광양",
    category: "place",
    body: "봄에 광양 한번 와보세요. 매화마을 온통 하얗게 물들 때, 그 길 걸으면 다른 세상이에요. 섬진강 재첩국도 꼭 드시고.",
    likes: 58,
    comments: 9,
  },
];
