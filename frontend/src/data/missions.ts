// 잠시섬 미션 — 공통 9개 (모든 지역) + 지역별(regionMissions.ts) 4개
//
// 사용자는 실내에서 스마트폰으로 시뮬레이션만 하므로, 대부분의 현실 정보(물가/거리/배차 등)는
// NPC 말풍선으로 우리가 알려준다. 사용자는 선택지로 자신의 판단을 표현한다.
//
// 적합도(fit)는 각 옵션의 traits — 사용자가 표현한 라이프스타일 성향 — 으로 계산된다.
// 옵션이 해당 지역의 matchType과 일치하면 +2, 보조적으로 일치하면 +1, 어긋나면 -1.

import type { LifeStyleType } from "./residences";
import type { EnvType, Stance } from "./lifestyle";

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
  // 이 답변이 반영하는 라이프스타일 — 적합도 계산에 사용 (옛 시스템 호환)
  traits?: LifeStyleType[];
  // v2 — 명시적 정렬 힌트. 없으면 traits에서 자동 derive.
  // envAlign: 이 답이 어울리는 환경 (mountain/sea/field/village)
  // stanceAlign: 이 답이 어울리는 자세 (alone_rest 등)
  envAlign?: EnvType[];
  stanceAlign?: Stance[];
};

export type NumericInputSpec = {
  prompt: string;       // "오늘 식비 얼마 쓰셨어요?"
  unit: string;         // "원"
  placeholder?: string; // "예) 12000"
  // 입력값을 다음 turn에 표시할 수 있도록 next 지정
  next: number;
  // 기준값 — 이보다 적으면 절약형, 많으면 풍족형 (분기에 활용)
  benchmarks?: { low: number; high: number };
  // 능동: "추측 → 정답 비교" 카드용. 정의되면 NPC 응답과 함께
  // 시각적 reveal 카드가 나타나 사용자 추측 vs 마을 평균 vs 도시 평균을 보여줌.
  villageActual?: number;   // 이 동네 평균
  cityActual?: number;       // 도시(서울) 평균
};

export type DialogueTurn = {
  npc: string;
  // 일반 분기 (있으면 options 사용)
  options?: DialogueOption[];
  // 수치 입력 단계
  numeric?: NumericInputSpec;
};

// ── 시장 좌판 아이템 (basket 모드) ──────────────
// 한 미션에 7개 정도 — 가격 차이로 예산 게임이 성립.
// 사용자가 고른 BasketItem 들은 onComplete 시 acquiredItems(찬장) 으로 주입됨.
//
// 인터랙션 (강화풍물시장 1층):
//   1) 카드 좌판 — 처음엔 뒷면. 탭 → 3D 뒤집기로 강화 사실(fact) 정보 노출.
//   2) 뒤집힌 카드를 장바구니로 "드래그" → 흥정 모달 (가격 부름 → 깎아주세요)
//   3) 깎기 성공 → 깎인 가격, 실패/안 함 → 정가로 담김
// 이모지는 사용 금지 — illustration 키로 SVG 컴포넌트(MarketIllust)에 매핑.
export type MarketIllustKey =
  | "sunmu-kimchi"
  | "saeujeot"
  | "sweet-potato"
  | "ssuk-tteok"
  | "gukhwa-bbang"
  | "goguma-mallaengi"
  | "raw-sunmu"
  | "bandaegi-bowl"       // 2층 회무침 (산처럼 쌓인 양념)
  | "bandaegi-sashimi"    // 2층 밴댕이 회 (깻잎 위 흰 살)
  | "rice-bowl"           // 2층 밥공기
  | "card-back"           // (구) 카드 뒷면 — 현재 미사용
  | "basket-bag";         // 장바구니 라탄 가방

export type BasketItem = {
  id: string;
  name: string;
  illustration: MarketIllustKey;
  price: number;                // 원 — 정가 (실제 시세 비율 반영)
  bargainPrice: number;         // 흥정 성공 시 가격
  bargainSuccessRate?: number;  // 흥정 성공 확률 0~1. 미정의 시 0.6
  fact: string;                 // 카드 뒤집힘 시 노출되는 강화 사실 한 줄
};

// ── 2층 식당 (basket 미션의 후반부) ──────────────
// 1층 장보기 완료 후 자연스럽게 연결. "비비기 → 먹기" 의 별도 인터랙션 단계.
// 사가는 게 아니라 먹는 경험으로 끝남 (acquiredItems 에는 안 들어가고, SavedQuote 로 기록).
export type DiningStop = {
  ctaToAscend: string;          // "2층 올라가서 한 입 하기" 등
  npcName: string;              // "2층 식당 사장님"
  npcOpener: string;            // 상에 차려질 때 한 줄
  npcFact: string;              // 비비는 동안/먹은 후 한 줄 — 실제 사실
  dish: {
    name: string;               // "밴댕이회무침"
    illustration: MarketIllustKey;
  };
  bites: number;                // 한 입씩 사라지는 횟수
  biteReactions: string[];      // 한 입마다 캐릭터 반응 (bites 만큼 순환)
  memoir: string;               // 다 먹은 후 한 줄 감상 — SavedQuote 로 저장
};

// ── 시간대 / tier (Phase A — 하루 흐름 설계용) ─────
// timeOfDay: 미션 카드에 칩으로 표시. "아침 / 낮 / 저녁"
// tier: "main" = 일자별 메인 9개, "bonus" = 추가/선택 미션
export type TimeOfDay = "아침" | "낮" | "저녁";
export type MissionTier = "main" | "bonus";

// ── 미션 ─────────────────────────────────────────
export type Mission = {
  id: string;
  title: string;
  icon: string;
  category: MissionCategory;
  mode: MissionMode;
  reward: number;            // 축적 점수
  background: BackgroundVariant;
  // Phase A — 하루 흐름 톤
  timeOfDay?: TimeOfDay;
  tier?: MissionTier;        // 미정의 시 main 으로 간주 (백워드 호환)
  day?: number;              // 명시적 일차 할당 (1~3). 미정의 시 chunkByDay 가 균등 분배
  npc: { name: string; emoji: string };
  dialogues: DialogueTurn[];
  description?: string;      // 카드 보조 설명
  // NPC 풀씬 일러스트 — 정의되면 미션 수행 화면을 풀스크린 씬 + 글래스 대화창으로 표시
  // src는 public 기준 절대 경로(예: "/mission/restaurantgrandma.webp")
  npcScene?: { src: string; caption?: string };
  // 미션 정보 화면(MissionInfoScreen) 상단 커버 이미지 — public 기준 절대 경로.
  // 정의되면 npcScene/그룹 일러스트보다 우선해서 헤더 배경으로 쓰인다.
  cover?: string;
  // 실제 로드뷰 사진(캡처) 배열 — 슬라이드 순서대로 [출발, 골목, 다가옴, 도착]
  // 길이가 4 미만이거나 일부 undefined여도 OK — 있는 슬라이드에만 📷 버튼이 뜸
  realRoadview?: (string | undefined)[];
  // 도착 지점에서 "🗺️ 로드뷰로 확인해보기" 버튼이 새 탭으로 여는 네이버/카카오 공유링크
  arrivalRoadviewUrl?: string;
  // 정의되면 4슬라이드 카드 대신 미니 로드뷰(5-6 지점 화살표 네비)로 진행
  // 마지막 step이 도착 지점
  roadviewSteps?: RoadviewStep[];
  // 카카오 로드뷰 임베드용 좌표 — 정의되면 RoadviewWithFallback이 SDK로 panoId 조회 후 임베드
  // panoId 못 잡으면 자동으로 roadviewSteps(사진) 폴백으로 빠짐
  kakaoPosition?: { lat: number; lng: number };
  // 로드뷰 출발 좌표 — 정의되면 도착지(kakaoPosition) 기준 100m 자동 offset 대신 명시 좌표에서 시작.
  // "어디 → 어디" 가 서사적으로 중요한 미션 (예: 순무민박 → 강화풍물시장) 에 사용.
  startPosition?: { lat: number; lng: number };
  // 상단 헤더에 뜨는 도착지 짧은 라벨. 미정의 시 mission.title 사용.
  destinationLabel?: string;
  // 도착 전 좌하단 가이드 말풍선 텍스트. 정의되면 NPC 인사 대신 안내 톤으로 표시
  //   (NPC 가 도착도 전에 말풍선 뱉는 어색함을 없애기 위함)
  travelGuide?: string;
  // 도착지 100m 이내 진입 시 좌하단 가이드 멘트 교체용. 미정의 시 travelGuide 그대로.
  //   (예: 골목 둘러보기 → 도착 지점이 어떻게 보이는지 안내)
  travelGuideArrival?: string;
  // 능동성 강화 — "내가 먼저 묻기" 단계.
  //   · 정의되면 미션 시작 시 NPC 는 침묵, 사용자가 질문 카드 골라 던짐
  //   · 선택 → opener.options[i].nextTurn 으로 dialogue 진입 (= NPC 가 그 질문에 답)
  //   · 미정의 시 기존 동작(NPC 가 dialogue[0] 부터 먼저 말 검) 그대로
  opener?: {
    prompt: string;          // 헤더 문구 — "어르신께 무엇을 물어볼래요?"
    options: {
      label: string;         // 사용자 질문 — "여기 살기 어렵지 않으세요?"
      emoji?: string;        // 카드 좌측 아이콘 (선택)
      nextTurn: number;      // 진입할 dialogue turn 인덱스
    }[];
  };
  // 시장 좌판 인터랙션 — 정의되면 dialogue 대신 MissionBasketScreen 으로 진입
  //   · 1층: 카드 뒤집기 → 드래그 → 흥정 → 담기. 구매 → acquiredItems(찬장).
  //   · 2층 (옵셔널 dining): 비비기 → 먹기. SavedQuote 로 기록.
  basket?: {
    npcName: string;         // 1층 사장님 이름
    npcOpener: string;       // 시작 시 NPC 한 줄
    budget: number;          // 원 단위 예산 — 빠듯하게
    items: BasketItem[];
    dining?: DiningStop;     // 정의되면 1층 종료 후 자연 연결
  };
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
    cover: "/character1/mission_cover/hospital.png",
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
          { label: "병원이 어디 있는지 좀 알아두려고요", next: 1, traits: ["집돌이형"],
            stanceAlign: ["alone_rest", "together_rest"] },
          { label: "그냥 동네 한 바퀴 돌고 있어요", next: 4, traits: ["자연탐험형"],
            stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "병원이요? 종합병원은 이 길로 쭉 가서 12분 정도 걸어요. 약 850m? 응급실은 24시간 열고요. 어떻게 가실 생각이에요?",
        options: [
          { label: "걸어가볼게요. 운동 삼아 좋잖아요", next: 2, traits: ["자연탐험형", "레저형"],
            stanceAlign: ["alone_make", "together_make"] },
          { label: "버스 타고 가는 게 낫지 않을까요?", next: 3, traits: ["디지털노마드형", "집돌이형"],
            stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "잘 생각하셨어요. 약국이 병원 바로 옆이라 진료 끝나면 약도 한 자리에서. 도시면 한 시간 잡았을 일이 여긴 30분이면 다 돼요.",
        options: [
          { label: "그 점이 진짜 좋네요", next: 5, traits: ["자연탐험형", "집돌이형"],
            stanceAlign: ["alone_rest", "together_rest"] },
          { label: "다행이에요, 응급 때 가까운 게 제일이죠", next: 5, traits: ["집돌이형"],
            stanceAlign: ["alone_rest", "together_rest"] },
        ],
      },
      {
        npc:
          "버스는 한 정류장이에요. 다만 배차가 35분쯤이라 기다리는 시간이 더 걸릴 때가 많아요. 35분 기다리느니 12분 걷는 게 낫더라구요.",
        options: [
          { label: "그럼 걷는 게 답이네요", next: 5, traits: ["자연탐험형"],
            stanceAlign: ["alone_rest"] },
          { label: "차가 있으면 마음이 더 편하겠어요", next: 5, traits: ["레저형", "디지털노마드형"],
            stanceAlign: ["alone_make", "together_make"] },
        ],
      },
      {
        npc:
          "그러세요. 천천히 둘러봐요. 이 길로 가시면 시장이 나오고, 그 너머가 병원이에요. 한 시간이면 동네가 그려져요.",
        options: [
          { label: "안내 감사드려요", traits: ["자연탐험형", "집돌이형"],
            stanceAlign: ["alone_rest", "together_rest"] },
        ],
      },
      {
        npc:
          "여기 사는 게 도시랑 다른 게 그거예요. 시간이 천천히 가요. 아플 때 걱정이 좀 덜한 동네예요.",
        options: [
          { label: "잘 알아두고 갈게요", traits: ["집돌이형", "자연탐험형"],
            stanceAlign: ["alone_rest", "together_rest"] },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────
  {
    id: "market",
    title: "동네 밥집 물가 체험",
    icon: "🍚",
    category: "생활현실형",
    mode: "map-dialogue",
    reward: 5,
    background: "market",
    npc: { name: "식당 아주머니", emoji: "👩‍🍳" },
    npcScene: { src: "/mission/restaurantgrandma.webp" },
    description: "이 동네 진짜 밥값 — 도시와 얼마나 다를까",
    dialogues: [
      {
        npc:
          "어서 와요~ 오늘 백반 한 상 차렸어요. 여기선 한 끼 7천원, 반찬은 매일 바뀌고. 도시 밥값 생각하면 싸죠?",
        options: [
          { label: "와, 진짜 싸네요", next: 1, traits: ["자연탐험형", "집돌이형"],
            stanceAlign: ["together_rest", "alone_rest"], envAlign: ["village"] },
          { label: "이게 평소 가격이에요?", next: 2, traits: ["디지털노마드형"],
            stanceAlign: ["alone_make"] },
        ],
      },
      {
        npc:
          "한 끼 7~8천원이면 도시 절반이죠. 대신 배달은 잘 안 와요. 그래서 다들 여기 와서 먹거나, 집에서 해 먹어요.",
        options: [
          { label: "매일 사 먹어도 부담 없겠네요", next: 3, traits: ["집돌이형"],
            stanceAlign: ["alone_rest", "together_rest"] },
          { label: "배달 안 되는 건 좀 아쉽네요", next: 3, traits: ["디지털노마드형"],
            stanceAlign: ["alone_make"] },
        ],
      },
      {
        npc:
          "평소에도 이 가격이에요. 장 봐서 해 먹으면 더 싸고요. 채소·생선은 시장이 확실히 싸서, 한 달 식비가 도시보다 한참 덜 들어요.",
        options: [
          { label: "직접 해 먹는 재미가 있겠어요", next: 3, traits: ["자연탐험형"],
            stanceAlign: ["alone_rest", "together_rest"] },
          { label: "그래도 가끔 외식은 하고 싶죠", next: 3, traits: ["디지털노마드형"],
            stanceAlign: ["alone_make"] },
        ],
      },
      {
        npc:
          "한 달 살아보면 알아요. 사 먹는 돈 줄어드는 게 제일 커요. 도시선 자꾸 시켜 먹잖아요?",
        options: [
          { label: "맞아요, 집밥이 좋아져요", traits: ["자연탐험형", "집돌이형"],
            stanceAlign: ["alone_rest", "alone_make"] },
          { label: "그래도 외식은 종종 필요하죠", traits: ["레저형", "디지털노마드형"],
            stanceAlign: ["together_make", "together_rest"] },
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
    npcScene: { src: "/mission/villagemanager.webp" },
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
    npcScene: { src: "/mission/residentowner.webp" },
    description: "여기서의 하루를 머릿속에 그려보기",
    dialogues: [
      {
        npc:
          "여기서 하루를 보낸다고 상상해볼게요. 7시쯤 일어나면 동네는 이미 분주해요. 새벽 시장도 열고요. 아침은 어떻게 시작하실래요?",
        options: [
          { label: "아침 산책으로 시작할래요", next: 1, traits: ["자연탐험형"],
            stanceAlign: ["alone_rest"] },
          { label: "조용히 차 한 잔 마시면서", next: 1, traits: ["집돌이형"],
            stanceAlign: ["alone_rest"] },
          { label: "바로 일 시작해도 좋아요", next: 1, traits: ["디지털노마드형"],
            stanceAlign: ["alone_make"] },
        ],
      },
      {
        npc:
          "좋네요. 오전엔 집중이 잘 되는 시간이고, 점심엔 가벼운 외출을 많이 해요. 마트나 카페 가는 거죠. 점심은 어떻게요?",
        options: [
          { label: "직접 해 먹는 게 좋아요", next: 2, traits: ["집돌이형", "자연탐험형"],
            stanceAlign: ["alone_rest", "alone_make"] },
          { label: "동네 식당 한 곳에서", next: 2, traits: ["레저형", "디지털노마드형"],
            stanceAlign: ["together_rest"] },
          { label: "샌드위치 하나로 간단히", next: 2, traits: ["디지털노마드형"],
            stanceAlign: ["alone_make"] },
        ],
      },
      {
        npc:
          "오후엔 사람들이 자기 일하다가 5시쯤 마실 나와요. 약속이 자연스럽게 생겨요. 저녁은요?",
        options: [
          { label: "주민들과 어울려보고 싶어요", next: 3, traits: ["레저형"],
            stanceAlign: ["together_rest", "together_make"] },
          { label: "집에서 조용히 보내는 게 좋아요", next: 3, traits: ["집돌이형"],
            stanceAlign: ["alone_rest"] },
          { label: "산책하고 일찍 자고 싶어요", next: 3, traits: ["자연탐험형"],
            stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "그 리듬, 여기 분들이랑 비슷해요. 밤 10시면 동네가 다 잠들어요. 도시에선 못 누리는 깊은 잠을 자게 되더라구요.",
        options: [
          { label: "그런 일상이 진짜 필요했어요", traits: ["자연탐험형", "집돌이형"],
            stanceAlign: ["alone_rest"] },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────
  {
    id: "food",
    title: "하루 식비, 얼마쯤일까?",
    icon: "🍽️",
    category: "생활현실형",
    mode: "numeric",
    reward: 5,
    background: "cafe",
    npc: { name: "동네 식당 사장님", emoji: "👩‍🍳" },
    description: "도시 감각으로 추측해보고, 실제와 비교해보기",
    dialogues: [
      {
        // 능동: 정답을 먼저 안 알려주고, 사용자가 추측하게 함.
        npc:
          "이 동네에서 하루 세 끼 다 먹으면 얼마쯤 쓸 것 같아요? 도시 감각으로 한 번 추측해봐요.",
        numeric: {
          prompt: "내 추측 — 이 동네 하루 식비",
          unit: "원",
          placeholder: "예) 12000",
          next: 1,
          benchmarks: { low: 8000, high: 13000 },
          villageActual: 9500,
          cityActual: 14000,
        },
      },
      {
        // {amount}/{compare} 는 MissionExecuteScreen 에서 치환.
        // 옆에 추측 비교 카드가 같이 떠 있어서 NPC 는 짧게 코멘트만.
        npc:
          "{amount}원으로 추측하셨네요. {compare} 사실 시장에서 채소 사다가 직접 해 먹기 시작하면 더 줄어요. 도시 살 때랑 가장 크게 바뀌는 부분이에요.",
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
          { label: "뭐가 맛있어요? 추천해주세요", next: 1, traits: ["레저형", "자연탐험형"],
            stanceAlign: ["together_rest", "together_make"] },
          { label: "그냥 둘러보러 왔어요", next: 2, traits: ["집돌이형", "디지털노마드형"],
            stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "오늘 떡볶이가 잘 나왔어요. 우리 집은 30년째 이 자리예요. 동네 어르신들 다 우리 집에서 떡볶이 드시고 자라셨어요.",
        options: [
          { label: "와, 동네의 역사네요", next: 3, traits: ["자연탐험형"],
            stanceAlign: ["alone_rest", "together_rest"] },
          { label: "단골이 되면 좋겠네요", next: 3, traits: ["레저형"],
            stanceAlign: ["together_rest"] },
        ],
      },
      {
        npc:
          "천천히 봐요~ 안 사도 괜찮아요. 매번 들러서 인사만 해도 동네 사람 돼요. 이 동네는 그렇게 친해져요.",
        options: [
          { label: "그런 동네 분위기 좋아요", next: 3, traits: ["레저형", "자연탐험형"],
            stanceAlign: ["together_rest"] },
          { label: "조용히 다닐 수 있어 마음 편해요", next: 3, traits: ["집돌이형"],
            stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "세 번만 와도 얼굴 기억해요. 다섯 번 오면 이름 묻고요. 도시에선 그런 거 어렵잖아요?",
        options: [
          { label: "그런 친밀함이 그리웠어요", traits: ["레저형", "자연탐험형"],
            stanceAlign: ["together_rest", "together_make"] },
          { label: "부담스럽지 않을 정도면 좋아요", traits: ["집돌이형", "디지털노마드형"],
            stanceAlign: ["alone_rest"] },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────
  {
    id: "neighbor",
    title: "이주민 만나기",
    cover: "/character1/mission_cover/neighbor.png",
    icon: "🤝",
    category: "관계형성형",
    mode: "dialogue",
    reward: 15,
    background: "neighbor",
    npc: { name: "먼저 온 이주자", emoji: "👩" },
    npcScene: { src: "/mission/yoga.webp" },
    description: "1년 차 이주민의 솔직한 경험",
    // 능동: 처음 보는 이주자라 더 어울림 — 내가 먼저 말 걸기
    opener: {
      prompt: "1년 차 이주자께 뭐가 가장 궁금해?",
      options: [
        {
          emoji: "⏳",
          label: "처음 6개월은 어떠셨어요?",
          nextTurn: 0,
        },
        {
          emoji: "🌿",
          label: "지금은 만족하세요?",
          nextTurn: 1,
        },
        {
          emoji: "😔",
          label: "후회한 적 없으세요?",
          nextTurn: 2,
        },
      ],
    },
    dialogues: [
      // turn 0 — 처음 6개월
      {
        npc:
          "솔직히 처음 3개월은 너무 조용해서 답답했어요. 도시 친구들이랑도 멀어지는 느낌이었고. 4개월쯤부터 동네 사람들이랑 친해지면서 마음이 잡혔어요.",
        options: [
          { label: "그 적응 기간이 진짜 필요하겠어요", next: 3, traits: ["자연탐험형", "집돌이형"],
            stanceAlign: ["alone_rest"] },
          { label: "사람들이 도와주셨군요", next: 3, traits: ["레저형"],
            stanceAlign: ["together_rest"] },
        ],
      },
      // turn 1 — 지금 만족
      {
        npc:
          "지금이 1년 차인데, 일하는 시간 빼면 거의 다 동네 사람들이랑 보내요. 농사 한번 도와봐요? 같이 잡곡 키우는 모임이 있어요.",
        options: [
          { label: "꼭 한번 참여해보고 싶어요", next: 3, traits: ["자연탐험형", "레저형"],
            stanceAlign: ["together_make"], envAlign: ["field"] },
          { label: "조용히 지내는 게 더 좋을 것 같아요", next: 3, traits: ["집돌이형"],
            stanceAlign: ["alone_rest"] },
        ],
      },
      // turn 2 — 후회
      {
        npc:
          "후회는 안 해요. 다만 첫 겨울은 진짜 우울했어요. 도시처럼 자극이 없고. 그걸 견디면 봄부터는 다시 좋아져요.",
        options: [
          { label: "마음의 준비를 단단히 해야겠네요", next: 3, traits: ["집돌이형", "자연탐험형"],
            stanceAlign: ["alone_rest"] },
        ],
      },
      // turn 3 — 공통 마무리
      {
        npc:
          "준비 잘 하고 오세요. 너무 빨리 어울리려 하지 말고, 너무 동떨어지지도 말고. 천천히 한 사람씩 알게 되는 게 좋아요.",
        options: [
          { label: "꼭 그렇게 해볼게요", traits: ["자연탐험형", "집돌이형"],
            stanceAlign: ["alone_rest", "together_rest"] },
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

// 옵션의 traits를 거주지의 matchType과 비교해 적합도 변화량(±) 산출 — 옛 시스템
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

// v2 — 옵션 traits를 새 Stance로 매핑 후 거주지 stance와 비교
// 옛 LifeStyleType 트레이트를 그대로 두고 시스템만 stance 기반으로 진화
// 같은 stance 그룹 매칭: 첫 번째 +2, 그 외 +1, 보조(stanceAlt) +1, 어긋남 0
import { oldToStance } from "./lifestyle";

export function fitDeltaForOptionV2(
  option: DialogueOption | undefined,
  residenceStance: Stance,
  residenceStanceAlt?: Stance[]
): number {
  if (!option || !option.traits || option.traits.length === 0) return 0;
  const traitStances: Stance[] = option.traits.map((t) => oldToStance[t]);
  if (traitStances[0] === residenceStance) return 2;
  if (traitStances.includes(residenceStance)) return 1;
  if (residenceStanceAlt && traitStances.some((s) => residenceStanceAlt.includes(s))) {
    return 1;
  }
  return 0;
}

// 적합도 v2 — 옵션 정렬 가중치 (3단계).
//   1.0 = 완전 일치 : stanceAlign이 region.stance와 일치 (또는 traits derive 시 동일)
//   0.5 = 부분 일치 : stanceAlign이 region.stanceAlt와 일치, envAlign 매칭, 혹은
//                    traits derive로 stanceAlt 매칭
//   0   = 안 맞음   : 매칭 없음 (부정 답변 버튼은 호출하지 않고 직접 0 누적)
// 명시 stanceAlign/envAlign 이 있으면 그게 우선, 없으면 traits → oldToStance derive 폴백.
export function optionAlignWeight(
  option: DialogueOption | undefined,
  region: { stance: Stance; stanceAlt?: Stance[]; envType: EnvType }
): 0 | 0.5 | 1 {
  if (!option) return 0;

  // 1) 명시 stanceAlign — 메인 일치
  if (option.stanceAlign?.includes(region.stance)) return 1;
  // 2) 명시 stanceAlign — 보조 일치
  if (region.stanceAlt && option.stanceAlign?.some((s) => region.stanceAlt!.includes(s))) {
    return 0.5;
  }
  // 3) 명시 envAlign — 환경 일치 (부분)
  if (option.envAlign?.includes(region.envType)) return 0.5;

  // 4) traits fallback — derive 후 동일 판정
  if (option.traits?.length) {
    const ss: Stance[] = option.traits.map((t) => oldToStance[t]);
    if (ss.includes(region.stance)) return 1;
    if (region.stanceAlt && ss.some((s) => region.stanceAlt!.includes(s))) return 0.5;
  }

  return 0;
}

// 기존 호환용 alias (다른 화면에서 baseMissions 임포트하는 경우 대비)
export const baseMissions = commonMissions;
