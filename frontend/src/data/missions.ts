// 잠시섬 미션 — 공통 9개 (모든 지역) + 지역별(regionMissions.ts) 4개
//
// 사용자는 실내에서 스마트폰으로 시뮬레이션만 하므로, 대부분의 현실 정보(물가/거리/배차 등)는
// NPC 말풍선으로 우리가 알려준다. 사용자는 선택지로 자신의 판단을 표현한다.
//
// 적합도(fit)는 각 옵션의 traits — 사용자가 표현한 라이프스타일 성향 — 으로 계산된다.
// 옵션이 해당 지역의 matchType과 일치하면 +2, 보조적으로 일치하면 +1, 어긋나면 -1.

import type { LifeStyleType } from "./residences";

// ── 미션 카테고리 ────────────────────────────────
export type MissionCategory = "생활현실형" | "관계형성형" | "감정/분위기형";

// ── 미션 진행 모드 ────────────────────────────────
// dialogue       : 말해보카 대화만
// map-dialogue   : 지도 이동 트랜지션 → 말해보카
// map-info       : 지도 이동 트랜지션 → 정보형 안내 (말해보카로 짧게)
// numeric        : 말해보카 + 도중에 숫자 입력 단계
// mailbox        : 우편함 — 매일 카드 1장 (외부 모달)
// final          : 자동 생성 최종 리포트
export type MissionMode =
  | "dialogue"
  | "map-dialogue"
  | "map-info"
  | "numeric"
  | "mailbox"
  | "final";

// ── 배경 일러스트 키 ─────────────────────────────
export type BackgroundVariant =
  | "market"
  | "hospital"
  | "cafe"
  | "home"
  | "office"
  | "transit"
  | "library"
  | "neighbor";

// ── 말해보카 대화 ────────────────────────────────
export type DialogueOption = {
  label: string;
  next?: number; // 다음 turn 인덱스 — undefined면 미션 종료
  // 이 답변이 반영하는 라이프스타일 — 적합도 계산에 사용
  traits?: LifeStyleType[];
};

export type NumericInputSpec = {
  prompt: string;       // "오늘 식비 얼마 쓰셨어요?"
  unit: string;         // "원"
  placeholder?: string; // "예) 12000"
  // 입력값을 다음 turn에 표시할 수 있도록 next 지정
  next: number;
  // 기준값 — 이보다 적으면 절약형, 많으면 풍족형 (분기에 활용)
  benchmarks?: { low: number; high: number };
};

export type DialogueTurn = {
  npc: string;
  // 일반 분기 (있으면 options 사용)
  options?: DialogueOption[];
  // 수치 입력 단계
  numeric?: NumericInputSpec;
};

// ── 미션 ─────────────────────────────────────────
export type Mission = {
  id: string;
  title: string;
  icon: string;
  category: MissionCategory;
  mode: MissionMode;
  reward: number;            // 축적 점수
  background: BackgroundVariant;
  npc: { name: string; emoji: string };
  dialogues: DialogueTurn[];
  description?: string;      // 카드 보조 설명
  // 실제 로드뷰 사진(캡처) 배열 — 슬라이드 순서대로 [출발, 골목, 다가옴, 도착]
  // 길이가 4 미만이거나 일부 undefined여도 OK — 있는 슬라이드에만 📷 버튼이 뜸
  realRoadview?: (string | undefined)[];
  // 도착 지점에서 "🗺️ 로드뷰로 확인해보기" 버튼이 새 탭으로 여는 네이버/카카오 공유링크
  arrivalRoadviewUrl?: string;
  // 정의되면 4슬라이드 카드 대신 미니 로드뷰(5-6 지점 화살표 네비)로 진행
  // 마지막 step이 도착 지점
  roadviewSteps?: RoadviewStep[];
};

// ── 미니 로드뷰 한 지점 ────────────────────────
export type RoadviewStep = {
  photo: string;        // 캡처 사진 URL
  caption: string;      // 짧은 위치 라벨 — "강화 읍내 진입"
  story?: string;       // 이 지점에서 자동으로 뜨는 NPC 멘트 (선택)
  // 이 지점에서 다음으로 가는 방향 — UI 화살표를 회전시켜 동선 감각 부여
  // 생략 시 "straight" (직진)
  forwardDirection?: "straight" | "left" | "right";
};

// =====================================================================
// 공통 미션 9개 (모든 지역 공통)
// 우편함과 최종 리포트는 mode 'mailbox' / 'final' 로 표기 — 별도 UI 흐름
// =====================================================================

export const commonMissions: Mission[] = [
  // ───────────────────────────────────────────────
  {
    id: "hospital",
    title: "병원 접근성 확인",
    icon: "🏥",
    category: "생활현실형",
    mode: "map-dialogue",
    reward: 5,
    background: "hospital",
    npc: { name: "동네 어르신", emoji: "👵" },
    description: "걸어서 병원까지 — 응급 상황 감각 잡기",
    dialogues: [
      {
        npc:
          "어, 처음 보는 얼굴이네요. 어디 찾고 있어요? 이 동네 지리 잘 모르시죠.",
        options: [
          { label: "병원이 어디 있는지 좀 알아두려고요", next: 1, traits: ["집돌이형"] },
          { label: "그냥 동네 한 바퀴 돌고 있어요", next: 4, traits: ["자연탐험형"] },
        ],
      },
      {
        npc:
          "병원이요? 종합병원은 이 길로 쭉 가서 12분 정도 걸어요. 약 850m? 응급실은 24시간 열고요. 어떻게 가실 생각이에요?",
        options: [
          { label: "걸어가볼게요. 운동 삼아 좋잖아요", next: 2, traits: ["자연탐험형", "레저형"] },
          { label: "버스 타고 가는 게 낫지 않을까요?", next: 3, traits: ["디지털노마드형", "집돌이형"] },
        ],
      },
      {
        npc:
          "잘 생각하셨어요. 약국이 병원 바로 옆이라 진료 끝나면 약도 한 자리에서. 도시면 한 시간 잡았을 일이 여긴 30분이면 다 돼요.",
        options: [
          { label: "그 점이 진짜 좋네요", next: 5, traits: ["자연탐험형", "집돌이형"] },
          { label: "다행이에요, 응급 때 가까운 게 제일이죠", next: 5, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "버스는 한 정류장이에요. 다만 배차가 35분쯤이라 기다리는 시간이 더 걸릴 때가 많아요. 35분 기다리느니 12분 걷는 게 낫더라구요.",
        options: [
          { label: "그럼 걷는 게 답이네요", next: 5, traits: ["자연탐험형"] },
          { label: "차가 있으면 마음이 더 편하겠어요", next: 5, traits: ["레저형", "디지털노마드형"] },
        ],
      },
      {
        npc:
          "그러세요. 천천히 둘러봐요. 이 길로 가시면 시장이 나오고, 그 너머가 병원이에요. 한 시간이면 동네가 그려져요.",
        options: [
          { label: "안내 감사드려요", traits: ["자연탐험형", "집돌이형"] },
        ],
      },
      {
        npc:
          "여기 사는 게 도시랑 다른 게 그거예요. 시간이 천천히 가요. 아플 때 걱정이 좀 덜한 동네예요.",
        options: [
          { label: "잘 알아두고 갈게요", traits: ["집돌이형", "자연탐험형"] },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────
  {
    id: "market",
    title: "전통시장 물가 체험",
    icon: "🛒",
    category: "생활현실형",
    mode: "map-dialogue",
    reward: 5,
    background: "market",
    npc: { name: "반찬가게 사장님", emoji: "🧓" },
    description: "이 동네 진짜 물가 — 도시와 얼마나 다를까",
    dialogues: [
      {
        npc:
          "어서 오세요~ 오늘 채소가 진짜 잘 나왔어요. 시금치 한 단 1,500원, 오이 한 박스 6,000원. 이 정도면 도시 절반이죠?",
        options: [
          { label: "와, 진짜 싸네요", next: 1, traits: ["자연탐험형", "집돌이형"] },
          { label: "이게 평소 가격이에요?", next: 2, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc:
          "절반은 못 돼도 30% 정도는 싸요. 대신 마트 가격이랑 비슷한 것도 있어요. 통조림이나 공산품은 별 차이 없고, 채소·해산물만 확실히 달라요.",
        options: [
          { label: "그래도 매일 먹는 게 채소니까 큰 차이네요", next: 3, traits: ["집돌이형"] },
          { label: "공산품은 마트가 낫겠네요", next: 3, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc:
          "맞아요. 계절 채소만 시장에서 사도 한 달 식비가 도시보다 15만원쯤은 덜 들어요. 대신 시장은 일찍 닫아요. 오후 5시면 절반은 마감.",
        options: [
          { label: "오전이나 점심에 들러야겠네요", next: 3, traits: ["자연탐험형"] },
          { label: "퇴근하고는 못 오겠네...", next: 3, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc:
          "한 달 살아보면 감이 와요. 식비 줄어드는 만큼 외식 줄어드는 게 큰 거예요. 도시는 자꾸 사 먹잖아요?",
        options: [
          { label: "맞아요, 직접 해 먹는 게 좋아져요", traits: ["자연탐험형", "집돌이형"] },
          { label: "그래도 외식은 종종 필요하죠", traits: ["레저형", "디지털노마드형"] },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────
  {
    id: "cost",
    title: "생활비 시뮬레이션",
    icon: "💰",
    category: "생활현실형",
    mode: "dialogue",
    reward: 5,
    background: "office",
    npc: { name: "먼저 온 이주자", emoji: "🧑" },
    description: "고정비·식비·기타 — 이 동네 한 달 얼마면 살까",
    dialogues: [
      {
        npc:
          "여기서 한 달 살아본 데이터를 정리해봤어요. 1인 기준 월세 25~40만원, 관리비 5만원, 식비 25~35만원, 통신·구독 8만원. 합쳐서 약 80만원선이에요.",
        options: [
          { label: "도시보다 훨씬 가볍네요", next: 1, traits: ["자연탐험형", "집돌이형"] },
          { label: "외식이나 활동비는 따로죠?", next: 2, traits: ["레저형", "디지털노마드형"] },
        ],
      },
      {
        npc:
          "맞아요. 통신비·보험·구독은 어디 살아도 비슷한데, 차이는 식비랑 외식이 크게 나요. 마트보다 시장이 30% 싸고, 외식 빈도가 자연스레 줄어들어요.",
        options: [
          { label: "절약형으로 살면 60만원도 가능하겠어요", next: 3, traits: ["자연탐험형", "집돌이형"] },
          { label: "그래도 가끔은 도시 갈 거잖아요", next: 3, traits: ["디지털노마드형", "레저형"] },
        ],
      },
      {
        npc:
          "외식·여가는 도시의 60% 수준이에요. 카페가 적고 약속이 줄어드는 게 커요. 대신 차 유지비가 들 수 있어요 — 차 있으면 월 15만원 더 잡으세요.",
        options: [
          { label: "차 없이 살아볼게요", next: 3, traits: ["자연탐험형", "집돌이형"] },
          { label: "차는 있어야 마음이 편해요", next: 3, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "정리하면 검소하게 65만원, 적당히 80만원, 여유롭게 110만원이 평균이에요. 도시 절반 정도라 본전이 빨라요.",
        options: [
          { label: "한 번 살아볼 만하겠는데요", traits: ["자연탐험형"] },
          { label: "예산이 진짜 큰 차이네요", traits: ["집돌이형", "디지털노마드형"] },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────
  {
    id: "transit",
    title: "교통 접근성 확인",
    icon: "🚌",
    category: "생활현실형",
    mode: "map-info",
    reward: 5,
    background: "transit",
    npc: { name: "마을 안내원", emoji: "🧑‍💼" },
    description: "버스 배차, 시내 진출 시간 — 이동의 현실",
    dialogues: [
      {
        npc:
          "이 동네 교통 정리해드릴게요. 시내까지 버스 평균 배차 35분, 막차 21시 30분. KTX역까지는 차로 40분, 공항은 1시간 30분이에요.",
        options: [
          { label: "막차가 빠른 게 좀 걸리네요", next: 1, traits: ["디지털노마드형", "레저형"] },
          { label: "차 없으면 좀 불편할 것 같은데", next: 2, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "맞아요. 저녁 약속을 시내에서 잡으면 마지막 버스 시간을 봐야 해요. 도시처럼 늦게 끝나는 술자리는 어렵죠. 대신 동네 안에서는 자전거로 다 닿아요.",
        options: [
          { label: "동네 안에서 다 해결되면 괜찮아요", next: 3, traits: ["자연탐험형", "집돌이형"] },
          { label: "그래도 가끔 도시 가야 할 일이 있죠", next: 3, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc:
          "차가 있으면 훨씬 편해요. 시내·마트·병원이 모두 차로 10분 안이에요. 차 없으면 자전거 + 버스 조합으로 다니는 분이 많고요.",
        options: [
          { label: "차 한 대 정도는 있어야겠네요", next: 3, traits: ["레저형", "디지털노마드형"] },
          { label: "자전거로 살아볼게요", next: 3, traits: ["자연탐험형"] },
        ],
      },
      {
        npc:
          "이동 패턴만 익히면 도시보다 짧은 거리에서 다 끝나요. 출퇴근 거리가 없어지는 게 진짜 크고요.",
        options: [
          { label: "출퇴근 시간이 없는 게 최고네요", traits: ["자연탐험형", "디지털노마드형"] },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────
  {
    id: "routine",
    title: "하루 루틴 체험",
    icon: "📝",
    category: "생활현실형",
    mode: "dialogue",
    reward: 8,
    background: "home",
    npc: { name: "레지던스 호스트", emoji: "🧑" },
    description: "여기서의 하루를 머릿속에 그려보기",
    dialogues: [
      {
        npc:
          "여기서 하루를 보낸다고 상상해볼게요. 7시쯤 일어나면 동네는 이미 분주해요. 새벽 시장도 열고요. 아침은 어떻게 시작하실래요?",
        options: [
          { label: "아침 산책으로 시작할래요", next: 1, traits: ["자연탐험형"] },
          { label: "조용히 차 한 잔 마시면서", next: 1, traits: ["집돌이형"] },
          { label: "바로 일 시작해도 좋아요", next: 1, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc:
          "좋네요. 오전엔 집중이 잘 되는 시간이고, 점심엔 가벼운 외출을 많이 해요. 마트나 카페 가는 거죠. 점심은 어떻게요?",
        options: [
          { label: "직접 해 먹는 게 좋아요", next: 2, traits: ["집돌이형", "자연탐험형"] },
          { label: "동네 식당 한 곳에서", next: 2, traits: ["레저형", "디지털노마드형"] },
          { label: "샌드위치 하나로 간단히", next: 2, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc:
          "오후엔 사람들이 자기 일하다가 5시쯤 마실 나와요. 약속이 자연스럽게 생겨요. 저녁은요?",
        options: [
          { label: "주민들과 어울려보고 싶어요", next: 3, traits: ["레저형"] },
          { label: "집에서 조용히 보내는 게 좋아요", next: 3, traits: ["집돌이형"] },
          { label: "산책하고 일찍 자고 싶어요", next: 3, traits: ["자연탐험형"] },
        ],
      },
      {
        npc:
          "그 리듬, 여기 분들이랑 비슷해요. 밤 10시면 동네가 다 잠들어요. 도시에선 못 누리는 깊은 잠을 자게 되더라구요.",
        options: [
          { label: "그런 일상이 진짜 필요했어요", traits: ["자연탐험형", "집돌이형"] },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────
  {
    id: "food",
    title: "하루 식비 기록",
    icon: "🍽️",
    category: "생활현실형",
    mode: "numeric",
    reward: 5,
    background: "cafe",
    npc: { name: "동네 식당 사장님", emoji: "👩‍🍳" },
    description: "오늘 식비, 이 동네 평균과 비교",
    dialogues: [
      {
        npc:
          "오늘 식비 좀 기록해볼까요? 아침·점심·저녁 다 합쳐서 얼마쯤 쓰셨어요? 도시 평균이 1만 4천원, 이 동네 평균이 9천 5백원이에요.",
        numeric: {
          prompt: "오늘 식비",
          unit: "원",
          placeholder: "예) 12000",
          next: 1,
          benchmarks: { low: 8000, high: 13000 },
        },
      },
      {
        // 동적 응답은 MissionExecuteScreen에서 placeholder 치환
        npc:
          "{amount}원 쓰셨네요. {compare} 시장에서 채소 사다가 직접 해 먹기 시작하면 자연스럽게 더 줄어요. 외식 줄이는 게 가장 큰 변화예요.",
        options: [
          { label: "직접 해 먹는 게 좋겠어요", next: 2, traits: ["자연탐험형", "집돌이형"] },
          { label: "한 끼 정도는 사 먹어도 돼요", next: 2, traits: ["레저형", "디지털노마드형"] },
        ],
      },
      {
        npc:
          "한 달이면 도시보다 10~15만원 차이가 나요. 그 돈으로 좋은 차 한 잔, 좋은 책 한 권 사 보는 거죠.",
        options: [
          { label: "그 차이가 마음에 드네요", traits: ["자연탐험형", "집돌이형"] },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────
  {
    id: "shop",
    title: "동네 가게 들르기",
    icon: "🏪",
    category: "관계형성형",
    mode: "map-dialogue",
    reward: 15,
    background: "market",
    npc: { name: "동네 분식집 이모", emoji: "👩" },
    description: "단골이 된다는 감각 — 도시에선 못 느끼는 친밀함",
    dialogues: [
      {
        npc:
          "어머, 새 얼굴이네요? 이 동네 처음이세요? 뭐 드시러 오셨어요?",
        options: [
          { label: "뭐가 맛있어요? 추천해주세요", next: 1, traits: ["레저형", "자연탐험형"] },
          { label: "그냥 둘러보러 왔어요", next: 2, traits: ["집돌이형", "디지털노마드형"] },
        ],
      },
      {
        npc:
          "오늘 떡볶이가 잘 나왔어요. 우리 집은 30년째 이 자리예요. 동네 어르신들 다 우리 집에서 떡볶이 드시고 자라셨어요.",
        options: [
          { label: "와, 동네의 역사네요", next: 3, traits: ["자연탐험형"] },
          { label: "단골이 되면 좋겠네요", next: 3, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "천천히 봐요~ 안 사도 괜찮아요. 매번 들러서 인사만 해도 동네 사람 돼요. 이 동네는 그렇게 친해져요.",
        options: [
          { label: "그런 동네 분위기 좋아요", next: 3, traits: ["레저형", "자연탐험형"] },
          { label: "조용히 다닐 수 있어 마음 편해요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "세 번만 와도 얼굴 기억해요. 다섯 번 오면 이름 묻고요. 도시에선 그런 거 어렵잖아요?",
        options: [
          { label: "그런 친밀함이 그리웠어요", traits: ["레저형", "자연탐험형"] },
          { label: "부담스럽지 않을 정도면 좋아요", traits: ["집돌이형", "디지털노마드형"] },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────
  {
    id: "neighbor",
    title: "이주민 만나기",
    icon: "🤝",
    category: "관계형성형",
    mode: "dialogue",
    reward: 15,
    background: "neighbor",
    npc: { name: "먼저 온 이주자", emoji: "👩" },
    description: "1년 차 이주민의 솔직한 경험",
    dialogues: [
      {
        npc:
          "저도 작년에 서울에서 왔어요. 마케팅 일했었는데. 지금은 여기서 작업하면서 동네 일도 조금씩 도와요. 뭐 궁금한 거 있어요?",
        options: [
          { label: "처음 6개월 어떠셨어요?", next: 1, traits: ["집돌이형", "디지털노마드형"] },
          { label: "지금은 만족하세요?", next: 2, traits: ["레저형", "자연탐험형"] },
          { label: "후회한 적 없으세요?", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "솔직히 처음 3개월은 너무 조용해서 답답했어요. 도시 친구들이랑도 멀어지는 느낌이었고. 4개월쯤부터 동네 사람들이랑 친해지면서 마음이 잡혔어요.",
        options: [
          { label: "그 적응 기간이 진짜 필요하겠어요", next: 4, traits: ["자연탐험형", "집돌이형"] },
          { label: "사람들이 도와주셨군요", next: 4, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "지금이 1년 차인데, 일하는 시간 빼면 거의 다 동네 사람들이랑 보내요. 농사 한번 도와봐요? 같이 잡곡 키우는 모임이 있어요.",
        options: [
          { label: "꼭 한번 참여해보고 싶어요", next: 4, traits: ["자연탐험형", "레저형"] },
          { label: "조용히 지내는 게 더 좋을 것 같아요", next: 4, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "후회는 안 해요. 다만 첫 겨울은 진짜 우울했어요. 도시처럼 자극이 없고. 그걸 견디면 봄부터는 다시 좋아져요.",
        options: [
          { label: "마음의 준비를 단단히 해야겠네요", next: 4, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "준비 잘 하고 오세요. 너무 빨리 어울리려 하지 말고, 너무 동떨어지지도 말고. 천천히 한 사람씩 알게 되는 게 좋아요.",
        options: [
          { label: "꼭 그렇게 해볼게요", traits: ["자연탐험형", "집돌이형"] },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────
  {
    id: "mailbox",
    title: "우편함 — 주민 이야기",
    icon: "📮",
    category: "감정/분위기형",
    mode: "mailbox",
    reward: 3,
    background: "cafe",
    npc: { name: "주민", emoji: "📨" },
    description: "오늘 도착한 편지 한 통 — 동네 마음 들여다보기",
    dialogues: [
      // 우편함은 MailboxModal로 분기. dialogues는 표시되지 않음.
      // 모달이 닫히면 완료 처리.
      {
        npc: "(우편함 열어보세요)",
        options: [{ label: "편지 읽기" }],
      },
    ],
  },
];

// 최종 미션 — 모든 다른 미션 완료 시 활성화
export const finalMission = {
  id: "final-report",
  title: "이주 결정 리포트",
  icon: "📋",
  reward: 100,
  description:
    "지금까지의 체험을 바탕으로 이주 결정 리포트가 자동으로 만들어져요.",
  mode: "final" as const,
};

// 옵션의 traits를 거주지의 matchType과 비교해 적합도 변화량(±) 산출
// - traits에 matchType 포함: +2
// - traits에 보조 lifestyle 포함(나열 중 첫 번째 외): +1
// - 비어 있거나 어긋남: 0
export function fitDeltaForOption(
  option: DialogueOption | undefined,
  residenceMatchType: LifeStyleType
): number {
  if (!option || !option.traits || option.traits.length === 0) return 0;
  if (option.traits[0] === residenceMatchType) return 2;
  if (option.traits.includes(residenceMatchType)) return 1;
  return 0;
}

// 기존 호환용 alias (다른 화면에서 baseMissions 임포트하는 경우 대비)
export const baseMissions = commonMissions;
