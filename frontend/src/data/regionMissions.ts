// 지역별 미션 — 강화도/광양/거제도 각 4개
// 모든 미션은 동일한 Mission 타입 (data/missions.ts)
//
// 적합도: 각 옵션의 traits가 거주지 matchType과 일치하면 가산점
// - 강화도: 자연탐험형
// - 광양: 디지털노마드형
// - 거제도: 레저형

import type { Mission } from "./missions";

// =====================================================================
// 강화도 — 자연탐험형 (4개)
// =====================================================================
const ganghwaMissions: Mission[] = [
  {
    id: "ganghwa-mudflat",
    title: "갯벌 걸어가보기",
    icon: "🌊",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "갯벌 안내인", emoji: "🦀" },
    description: "썰물 시간의 갯벌 — 강화의 가장 강한 풍경",
    dialogues: [
      {
        npc:
          "강화 갯벌은 람사르 습지로 등록된 곳이에요. 썰물 때 1.5km까지 걸어 나갈 수 있어요. 발이 푹푹 빠지지만, 그 자체가 명상이에요.",
        options: [
          { label: "직접 걸어보면 좋겠어요", next: 1, traits: ["자연탐험형"] },
          { label: "바람이 셀 것 같은데?", next: 1, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "바람은 진짜 세요. 그래도 그 바람 맞으면서 걷다 보면, 도시에서 쌓인 게 다 날아가요. 농게도 보이고요. 한 시간 정도면 충분해요.",
        options: [
          { label: "그런 시간이 필요했어요", next: 2, traits: ["자연탐험형"] },
          { label: "한 번쯤은 좋겠어요", next: 2, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "이 풍경을 일상으로 만들 수 있는 곳이에요. 매일 다른 색깔의 갯벌을 봐요. 그게 강화의 매력이에요.",
        options: [
          { label: "이런 일상이 부럽네요", traits: ["자연탐험형", "집돌이형"] },
        ],
      },
    ],
  },

  {
    id: "ganghwa-dolmen",
    title: "강화 고인돌 탐방",
    icon: "🗿",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "library",
    npc: { name: "역사 해설사", emoji: "🧓" },
    description: "유네스코 세계유산 — 4천 년의 흔적 곁에서",
    dialogues: [
      {
        npc:
          "강화 고인돌군은 유네스코 세계문화유산이에요. 100기 이상이 한 자리에 모여 있어요. 4천 년 전 사람들이 세운 거예요.",
        options: [
          { label: "역사가 가까운 동네네요", next: 1, traits: ["자연탐험형"] },
          { label: "한적해서 좋을 것 같아요", next: 1, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "관광지 같은 번잡함은 없어요. 들판에 그냥 서 있어요. 그래서 더 좋아요. 책 한 권 들고 와서 한 시간씩 앉아 있는 분도 많아요.",
        options: [
          { label: "그런 시간 진짜 좋겠어요", next: 2, traits: ["자연탐험형", "집돌이형"] },
          { label: "한가한 게 매력이네요", next: 2, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc:
          "강화도는 도시랑 다른 시간 흐름이에요. 4천 년 전 사람이 봤던 풍경이 거의 그대로예요.",
        options: [
          { label: "그 깊이가 마음에 들어요", traits: ["자연탐험형"] },
        ],
      },
    ],
  },

  {
    id: "ganghwa-farm",
    title: "농사 체험",
    icon: "🌾",
    category: "관계형성형",
    mode: "dialogue",
    reward: 15,
    background: "neighbor",
    npc: { name: "농사 선배", emoji: "🧑‍🌾" },
    description: "텃밭 한 평 빌려보기 — 동네 사람들과 함께",
    dialogues: [
      {
        npc:
          "강화엔 이주민 텃밭 프로그램이 있어요. 한 평에 월 5천원, 강화 농부가 하나씩 코칭해줘요. 같이 해보실래요?",
        options: [
          { label: "꼭 해보고 싶어요", next: 1, traits: ["자연탐험형", "레저형"] },
          { label: "잘할 수 있을지 걱정돼요", next: 2, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "처음엔 다 그래요. 시금치·상추 같은 거부터 시작해요. 한 달이면 수확해요. 자기가 키운 거 먹는 맛, 그게 진짜예요.",
        options: [
          { label: "직접 키운 채소가 식탁에...", next: 3, traits: ["자연탐험형", "집돌이형"] },
          { label: "주말마다 가야 할 텐데 괜찮을까요?", next: 3, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc:
          "코칭이 있어서 처음도 잘해요. 그리고 농사하다 보면 옆 텃밭 분들이랑 자연스럽게 친해져요. 그게 더 큰 이득이에요.",
        options: [
          { label: "그 관계가 좋네요", next: 3, traits: ["자연탐험형", "레저형"] },
          { label: "조용히 혼자 가꿔도 괜찮나요?", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "본인 속도대로 해요. 강화 사람들은 안 보채요. 봄에 한 평, 가을에 두 평. 그렇게 늘려가는 분도 많아요.",
        options: [
          { label: "마음 편해요. 해볼게요", traits: ["자연탐험형", "집돌이형"] },
        ],
      },
    ],
  },

  {
    id: "ganghwa-sunset",
    title: "일몰 보러 가기",
    icon: "🌅",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "동네 산책자", emoji: "🚶" },
    description: "동막해변·석모도 일몰 명소 — 매일의 마무리",
    dialogues: [
      {
        npc:
          "동막해변, 석모도, 오두돈대. 강화 일몰 명소가 세 군데인데 다 차로 20분 안이에요. 일몰 시간은 계절마다 달라요.",
        options: [
          { label: "매일 가도 좋겠어요", next: 1, traits: ["자연탐험형", "집돌이형"] },
          { label: "주말에만 가도 충분할 것 같아요", next: 1, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc:
          "동네 분들은 일주일에 두세 번 가요. 같은 자리도 매일 다르거든요. 안개·구름·계절에 따라.",
        options: [
          { label: "그런 변화가 좋네요", next: 2, traits: ["자연탐험형"] },
          { label: "사진 찍는 사람도 많겠어요", next: 2, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "일몰 보고 동막 카페에서 따뜻한 차 한 잔. 그게 강화의 저녁이에요.",
        options: [
          { label: "그런 저녁이 매일이라니...", traits: ["자연탐험형", "집돌이형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 광양 — 디지털노마드형 (4개)
// =====================================================================
const gwangyangMissions: Mission[] = [
  {
    id: "gwangyang-cafework",
    title: "카페에서 일해보기",
    icon: "☕",
    category: "생활현실형",
    mode: "numeric",
    reward: 8,
    background: "cafe",
    npc: { name: "단골 카페 사장님", emoji: "👨‍🍳" },
    description: "이 동네 카페의 작업 환경 + 한 잔당 예산",
    dialogues: [
      {
        npc:
          "이 동네 카페는 와이파이도 빠르고 좌석도 넓어요. 도시 카페보다 한적해요. 평일 오전엔 자리 다 비어요. 한 잔 가격이 평균 얼마쯤일 것 같으세요?",
        numeric: {
          prompt: "예상 카페 가격",
          unit: "원",
          placeholder: "예) 5500",
          next: 1,
          benchmarks: { low: 4000, high: 6500 },
        },
      },
      {
        npc:
          "{amount}원 예상하셨네요. 실제 평균은 5,000원이에요. {compare} 4시간 자리 잡고 작업해도 눈치 안 줘요. 콘센트도 다 있고요.",
        options: [
          { label: "도시보다 자리 잡기 좋겠어요", next: 2, traits: ["디지털노마드형"] },
          { label: "느긋해서 좋네요", next: 2, traits: ["자연탐험형", "집돌이형"] },
        ],
      },
      {
        npc:
          "근처에 카페 다섯 곳이 다 비슷해요. 매일 다른 카페에서 작업하면 기분 전환도 돼요. 매화마을 카페는 봄에 꽃 핀 풍경이 진짜예요.",
        options: [
          { label: "워케이션 환경으로 좋네요", next: 3, traits: ["디지털노마드형"] },
          { label: "기분 전환이 자연스럽게 되겠어요", next: 3, traits: ["자연탐험형"] },
        ],
      },
      {
        npc:
          "도시처럼 사람 많고 시끄러운 카페가 부담스러웠다면, 광양은 진짜 마음에 들 거예요.",
        options: [
          { label: "딱 제 스타일이에요", traits: ["디지털노마드형"] },
        ],
      },
    ],
  },

  {
    id: "gwangyang-walk",
    title: "매화마을 산책",
    icon: "🌸",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "매화마을 안내자", emoji: "🌸" },
    description: "3월의 매화·5월의 신록 — 사계절 다른 산책길",
    dialogues: [
      {
        npc:
          "광양 매화마을은 3월 매화축제로 유명하지만, 사계절이 다 좋아요. 5월엔 신록, 7월엔 매실, 가을엔 단풍. 매일 30분 산책 코스로 충분해요.",
        options: [
          { label: "매일의 산책이 일상이 되겠어요", next: 1, traits: ["자연탐험형", "디지털노마드형"] },
          { label: "축제 시기에 사람 많지 않아요?", next: 2, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "맞아요. 일하다가 점심에 잠깐, 저녁에 한 번. 그 산책이 머리를 정리해줘요. 도시 점심시간에 카페 들르는 거랑 비교가 안 돼요.",
        options: [
          { label: "작업에 정말 좋겠어요", next: 3, traits: ["디지털노마드형"] },
          { label: "조용한 일상이 마음에 들어요", next: 3, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "축제 시기엔 사람 좀 있어요. 한 달 정도. 그 외엔 한적해요. 매화꽃 진 4월 중순부터가 진짜 매화마을 사람들의 시간이에요.",
        options: [
          { label: "그 비수기가 더 좋겠네요", next: 3, traits: ["집돌이형", "자연탐험형"] },
          { label: "축제 시기 활기도 좋겠어요", next: 3, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "광양은 도시 사람을 쉬게 해주는 동네예요. 빠르게 보내는 게 아니라 천천히 머무는 곳이에요.",
        options: [
          { label: "그런 시간이 필요했어요", traits: ["자연탐험형", "디지털노마드형"] },
        ],
      },
    ],
  },

  {
    id: "gwangyang-coworking",
    title: "코워킹 스페이스 찾기",
    icon: "💼",
    category: "생활현실형",
    mode: "map-dialogue",
    reward: 5,
    background: "office",
    npc: { name: "코워킹 매니저", emoji: "🧑‍💻" },
    description: "광양의 작업 공간들 — 월정액과 시설",
    dialogues: [
      {
        npc:
          "광양에 코워킹 두 곳이 있어요. 월정액 8만원~15만원, 일일권 1만원. 작은 회의실도 있고 프린터도 다 있어요. 어떻게 쓰실 거예요?",
        options: [
          { label: "월정액으로 꾸준히요", next: 1, traits: ["디지털노마드형"] },
          { label: "주 1-2회 정도면 충분해요", next: 2, traits: ["자연탐험형"] },
        ],
      },
      {
        npc:
          "잘 생각하셨어요. 매일 다른 카페보다 한 공간에 익숙해지는 게 일에 좋아요. 다른 입주자들이랑 자연스럽게 알게 되고요.",
        options: [
          { label: "사람들과 어울리는 것도 좋아요", next: 3, traits: ["레저형", "디지털노마드형"] },
          { label: "조용히 작업할 수 있나요?", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "일일권으로 가볍게 와도 좋아요. 사실 광양 코워킹은 그렇게 빡빡하지 않아요. 다들 자기 페이스로 일해요.",
        options: [
          { label: "느슨한 분위기가 좋네요", next: 3, traits: ["자연탐험형", "디지털노마드형"] },
          { label: "필요할 때만 와도 되겠네요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "일과 쉼이 분리되는 게 진짜 커요. 집에서 쉬고, 코워킹에서 일하고. 도시에선 그게 잘 안 됐을 거예요.",
        options: [
          { label: "그 구분이 진짜 필요해요", traits: ["디지털노마드형", "집돌이형"] },
        ],
      },
    ],
  },

  {
    id: "gwangyang-creator",
    title: "로컬 크리에이터 만나기",
    icon: "🎨",
    category: "관계형성형",
    mode: "dialogue",
    reward: 15,
    background: "cafe",
    npc: { name: "지역 크리에이터", emoji: "👨‍🎨" },
    description: "광양에 정착한 디지털 작업자들의 네트워크",
    dialogues: [
      {
        npc:
          "광양엔 도시에서 내려온 크리에이터·작가·개발자가 의외로 많아요. 한 달에 한 번씩 모이는 모임이 있어요. 가볍게 참석해보실래요?",
        options: [
          { label: "꼭 참석해보고 싶어요", next: 1, traits: ["디지털노마드형", "레저형"] },
          { label: "잘 어울릴 수 있을지 모르겠어요", next: 2, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "그 모임 다들 그렇게 시작했어요. 처음엔 어색해도 두 번째부터는 친구가 돼요. 다들 도시에서 와서 비슷한 고민을 했거든요.",
        options: [
          { label: "비슷한 사람이 있는 게 큰 위로네요", next: 3, traits: ["디지털노마드형", "집돌이형"] },
          { label: "협업도 가능할까요?", next: 3, traits: ["디지털노마드형", "레저형"] },
        ],
      },
      {
        npc:
          "부담 갖지 않아도 돼요. 한 달에 한 번 정도면 너무 자주도 아니고. 못 가는 달은 안 가도 아무도 뭐라 안 해요.",
        options: [
          { label: "그 거리감이 마음에 들어요", next: 3, traits: ["집돌이형", "자연탐험형"] },
          { label: "한번 보고 결정할게요", next: 3, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc:
          "여기 사람들은 도시 친구들이랑 조금 달라요. 일 얘기보다 일상 얘기를 더 해요. 그게 광양 디지털노마드 커뮤니티의 특징이에요.",
        options: [
          { label: "그런 분위기가 진짜 필요했어요", traits: ["디지털노마드형", "자연탐험형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 거제도 — 레저형 (4개)
// =====================================================================
const geojeMissions: Mission[] = [
  {
    id: "geoje-walk-sea",
    title: "바다까지 걸어가기",
    icon: "🌊",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "동네 러너", emoji: "🏃" },
    description: "레지던스에서 바다까지 — 매일 가능한 코스",
    dialogues: [
      {
        npc:
          "레지던스에서 바다까지 도보 15분, 1.2km예요. 평지라 산책으로 충분해요. 매일 가는 분도 많아요.",
        options: [
          { label: "매일 가도 좋겠어요", next: 1, traits: ["레저형", "자연탐험형"] },
          { label: "주말에 한 번 정도?", next: 1, traits: ["집돌이형", "디지털노마드형"] },
        ],
      },
      {
        npc:
          "거제도는 바다가 일상이에요. 매일 다른 바다를 봐요. 잔잔한 날, 거친 날, 안개 낀 날. 그게 매력이에요.",
        options: [
          { label: "그런 매일이 부럽네요", next: 2, traits: ["자연탐험형", "레저형"] },
          { label: "조깅 코스로도 좋겠어요", next: 2, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "도시 사람이 처음 오면 일주일은 매일 가요. 그 후엔 자연스럽게 일상이 돼요. 바다 안 봐도 마음이 편해진 거죠.",
        options: [
          { label: "그 변화 자체가 좋네요", traits: ["레저형", "자연탐험형"] },
        ],
      },
    ],
  },

  {
    id: "geoje-beach",
    title: "해수욕장 환경 체험",
    icon: "🏖️",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "해변 사장님", emoji: "🏄" },
    description: "성수기·비수기 분위기, 시즌별 활동",
    dialogues: [
      {
        npc:
          "거제 해수욕장은 7-8월 성수기엔 활기차요. 외지 관광객 많고. 9월부터는 다시 동네 사람들의 바다예요. 두 가지 분위기가 다 있어요.",
        options: [
          { label: "성수기 분위기 좋네요", next: 1, traits: ["레저형"] },
          { label: "비수기 한적함이 끌려요", next: 2, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "성수기엔 카약·서핑·해수욕 다 해요. 매일이 휴가예요. 다만 펜션·식당 가격이 좀 올라요. 그건 감안하셔야 해요.",
        options: [
          { label: "그런 활기 진짜 좋아해요", next: 3, traits: ["레저형"] },
          { label: "사람 많은 건 좀 부담돼요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "9월부터 12월까지가 진짜 거제예요. 바다는 잔잔하고 동네는 조용하고. 외지인 거의 없어요.",
        options: [
          { label: "그 시기가 진짜 매력적이네요", next: 3, traits: ["자연탐험형", "집돌이형"] },
          { label: "한 해 두 가지 풍경이 다 좋네요", next: 3, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "사계절 바다가 있는 동네예요. 도시에선 휴가 가야 보던 풍경이 일상이 돼요.",
        options: [
          { label: "이게 진짜 변화네요", traits: ["레저형", "자연탐험형"] },
        ],
      },
    ],
  },

  {
    id: "geoje-fishing",
    title: "낚시 포인트 찾기",
    icon: "🎣",
    category: "생활현실형",
    mode: "map-dialogue",
    reward: 8,
    background: "neighbor",
    npc: { name: "낚시꾼 어르신", emoji: "🎣" },
    description: "초보자도 가능한 동네 낚시 스팟",
    dialogues: [
      {
        npc:
          "거제엔 갯바위 낚시 포인트가 다섯 군데, 선상 낚시 두 군데 있어요. 초보면 갯바위부터 시작해요. 장비 빌리는 데도 있고요.",
        options: [
          { label: "처음이라 다 도움 필요해요", next: 1, traits: ["레저형"] },
          { label: "혼자 조용히 해보고 싶어요", next: 2, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "초보 강습이 주말마다 있어요. 3만원에 장비+안내까지. 잡은 고기 가져가도 돼요. 큰 거 안 나와도 재미는 있어요.",
        options: [
          { label: "강습 받고 시작할게요", next: 3, traits: ["레저형"] },
          { label: "친구들이랑 와도 좋겠어요", next: 3, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "혼자 가도 좋아요. 새벽 6시쯤 가면 사람 없어요. 파도 소리 들으면서 두세 시간. 머리가 비어요.",
        options: [
          { label: "그 시간이 진짜 좋아요", next: 3, traits: ["자연탐험형", "집돌이형"] },
          { label: "조용한 취미로 좋겠어요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "거제 사람들에겐 낚시가 취미가 아니라 일상이에요. 한 번 시작하면 매주 가요.",
        options: [
          { label: "취미가 자연스럽게 생기겠네요", traits: ["레저형", "자연탐험형"] },
        ],
      },
    ],
  },

  {
    id: "geoje-leisure",
    title: "레저 커뮤니티 만나기",
    icon: "🤝",
    category: "관계형성형",
    mode: "dialogue",
    reward: 15,
    background: "neighbor",
    npc: { name: "거제 액티비티 클럽장", emoji: "🏄‍♂️" },
    description: "서핑·카약·자전거 — 같이 즐기는 사람들",
    dialogues: [
      {
        npc:
          "거제엔 서핑 동호회, 자전거 동호회, 등산 동호회가 다 있어요. 월 회비 1-3만원이고, 주말마다 모여요. 어떤 거 관심 있어요?",
        options: [
          { label: "서핑 한번 배워보고 싶어요", next: 1, traits: ["레저형"] },
          { label: "자전거가 좋을 것 같아요", next: 2, traits: ["레저형", "자연탐험형"] },
          { label: "다 좋아 보이는데... 일단 하나만 시작해보고 싶어요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "서핑은 거제 학동흑진주몽돌해변에서 강습해요. 5월부터 9월까지. 거제 서핑 클럽이 진짜 활발해요. 다들 친해요.",
        options: [
          { label: "여름이 기다려져요", next: 4, traits: ["레저형"] },
          { label: "그런 활기 진짜 그리웠어요", next: 4, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "자전거는 거제 일주 코스가 60km예요. 하루 잡고 가요. 동호회는 매주 일요일 아침에 출발해요. 30km짜리 짧은 코스도 있고요.",
        options: [
          { label: "체력 따라 고르면 되겠네요", next: 4, traits: ["레저형", "자연탐험형"] },
          { label: "혼자서도 가능한가요?", next: 4, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "맞아요, 천천히 적응해봐요. 다들 처음엔 그래요. 한 번 가보고 나랑 맞는 사람들 있으면 그때 정식 가입하시면 돼요.",
        options: [
          { label: "그렇게 시작할게요", next: 4, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "거제 레저 커뮤니티의 진짜 매력은 '같이 즐기는 사람' 만나는 거예요. 도시에선 진짜 안 만나지는 사람들이에요.",
        options: [
          { label: "그런 인연이 진짜 필요했어요", traits: ["레저형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 통합 매핑
// =====================================================================

export const regionMissions: Record<string, Mission[]> = {
  ganghwa: ganghwaMissions,
  gwangyang: gwangyangMissions,
  geoje: geojeMissions,
};

// 특정 지역(residence.id)에서 풀어볼 미션 = 공통 + 지역 미션
import { commonMissions } from "./missions";
export function missionsForResidence(residenceId: string): Mission[] {
  const region = regionMissions[residenceId] ?? [];
  return [...commonMissions, ...region];
}
