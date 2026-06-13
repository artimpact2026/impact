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
    // 카카오 로드뷰 임베드 좌표 — 동막해수욕장 (강화군청 관광 페이지 출처)
    // agents/frontend/arrival-roadview-links.md 참고
    kakaoPosition: { lat: 37.593115, lng: 126.457175 },
    // 능동: 갯벌 안내인께 먼저 묻기
    opener: {
      prompt: "갯벌 안내인께 뭐가 가장 궁금해?",
      options: [
        {
          emoji: "🦀",
          label: "발이 푹푹 빠진다던데, 직접 걸어도 안 위험해요?",
          nextTurn: 0,
        },
        {
          emoji: "🌬️",
          label: "바닷가라 바람이 세지 않아요?",
          nextTurn: 1,
        },
        {
          emoji: "🌊",
          label: "갯벌이 매일 풍경이면 어떤 느낌일까요?",
          nextTurn: 2,
        },
      ],
    },
    dialogues: [
      // turn 0 — 갯벌 걷기 분기 (신규)
      {
        npc:
          "강화 갯벌은 람사르 습지예요. 썰물 때 1.5km까지 걸어 나갈 수 있어요. 발이 푹푹 빠지지만, 그 자체가 명상이에요.",
        options: [
          { label: "직접 걸어보면 좋겠어요", next: 2, traits: ["자연탐험형"] },
        ],
      },
      // turn 1 — 바람 분기
      {
        npc:
          "바람은 진짜 세요. 그래도 그 바람 맞으면서 걷다 보면, 도시에서 쌓인 게 다 날아가요. 농게도 보이고요. 한 시간 정도면 충분해요.",
        options: [
          { label: "그런 시간이 필요했어요", next: 2, traits: ["자연탐험형"] },
          { label: "한 번쯤은 좋겠어요", next: 2, traits: ["레저형"] },
        ],
      },
      // turn 2 — 일상 분기 (공통 마무리)
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
    // 카카오 로드뷰 임베드 좌표 — 강화 부근리 고인돌 (강화역사박물관 부지)
    kakaoPosition: { lat: 37.7472, lng: 126.4310 },
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
    title: "텃밭 클럽 — 한 평 시작",
    icon: "🌾",
    category: "관계형성형",
    mode: "dialogue",
    reward: 15,
    background: "neighbor",
    npc: { name: "텃밭 클럽 호스트", emoji: "🧑‍🌾" },
    npcScene: { src: "/mission/youngfarmer.webp" },
    description: "잠시섬 텃밭 클럽 한 평 — 강화 텃밭 호스트와 함께",
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
    id: "ganghwa-market",
    title: "강화풍물시장 — 오늘의 장바구니",
    icon: "🛒",
    category: "관계형성형",
    mode: "map-dialogue",
    reward: 12,
    background: "market",
    npc: { name: "풍물시장 사장님", emoji: "🧓" },
    description: "예산 안에서 강화 먹거리 골라 담기 — 좌판 인터랙션",
    // 카카오 로드뷰 임베드 좌표 — 강화풍물시장 정문 (visitkorea 기준)
    // startPosition 명시 안 함 → KakaoRoadview 가 도착지 기준 100m 8방위 중
    //   첫 번째 panoId 잡히는 곳에서 시작. 화살표 따라 걸으면 자연스럽게 정문으로 진입.
    kakaoPosition: { lat: 37.741370, lng: 126.492831 },
    // 로드뷰 도착지는 후문 — 정문 panoId 가 미등록이라 후문까지가 자연스러운 동선.
    // 60m 안 들어오면 자동 도착 오버레이 "🎉 도착! 강화풍물시장 후문" 노출 → 인트로(정문 사진) 풀스크린.
    destinationLabel: "강화풍물시장 후문",
    travelGuide:
      "강화 골목 한 번 둘러보면서 가봐요. 옛 길이 정겨워요.",
    travelGuideArrival:
      "이제 다 왔어요. 곧 시장 후문이 보일 거예요!",
    // 강화풍물시장 인터랙션 — 실제 동선 그대로 1층(장보기) → 2층(밴댕이).
    // 1층 좌판: 7품목, 예산 10,000원 — 시세 비율 반영(소포장 기준). 빠듯해서 골라야 함.
    //   · 새우젓 8000 / 순무김치 5000 / 속노란 고구마 3500 / 약쑥떡 3000
    //   · 국화빵 2000 / 고구마말랭이 2500 / 생순무 2000
    // 흥정 성공률: 깎기 쉬운 간식류는 높게, 무게 있는 항목은 보수적.
    // fact 는 모두 실제 사실 — 출처: visitkorea 강화풍물시장, 강화군 농산물 정보 등.
    basket: {
      npcName: "1층 사장님",
      npcOpener:
        "어서 와요~ 강화 특산물 다 모여 있어요. 카드 한 번 뒤집어 보고, 마음에 드는 거 장바구니로 끌어 담아요.",
      budget: 10000,
      items: [
        {
          id: "ganghwa-saeujeot",
          name: "새우젓",
          illustration: "saeujeot",
          price: 8000,
          bargainPrice: 6500,
          bargainSuccessRate: 0.45,
          // 시세: 강화 새우젓 1kg ≈ 16,300원. 일반 새우젓도 12,000~17,000원대. 소포장은 더 저렴.
          fact:
            "전국 젓새우의 70%가 강화 앞바다에서 잡혀요. 외포리 새우젓이 특히 유명하고, 1kg에 약 16,300원 — 소포장이면 더 저렴해요.",
        },
        {
          id: "ganghwa-sunmu-kimchi",
          name: "순무김치",
          illustration: "sunmu-kimchi",
          price: 5000,
          bargainPrice: 4000,
          bargainSuccessRate: 0.6,
          // 시세: 강화도 순무김치 3kg ≈ 33,000원 (1kg 약 11,000원). 시장 소포장은 5,000~10,000원 선.
          fact:
            "갯벌 미네랄 머금은 강화 순무로 담가요. 3kg 통은 33,000원, 시장 소포장은 5,000~10,000원 선이에요.",
        },
        {
          id: "ganghwa-ssuk-tteok",
          name: "약쑥떡",
          illustration: "ssuk-tteok",
          price: 3000,
          bargainPrice: 2500,
          bargainSuccessRate: 0.7,
          fact: "강화 약쑥으로 만든 쫀득한 떡이에요. 향이 진해 한 입에 알 수 있어요.",
        },
        {
          id: "ganghwa-goguma-mallaengi",
          name: "고구마말랭이",
          illustration: "goguma-mallaengi",
          price: 2500,
          bargainPrice: 2000,
          bargainSuccessRate: 0.75,
          fact: "강화 속노란 고구마를 햇볕에 말려 만든 간식이에요.",
        },
        {
          id: "ganghwa-gukhwa-bbang",
          name: "국화빵",
          illustration: "gukhwa-bbang",
          price: 2000,
          bargainPrice: 1500,
          bargainSuccessRate: 0.8,
          fact: "장 보다 손에 쥐는 국민 시장 간식이에요. 갓 구워 따끈해요.",
        },
        {
          id: "ganghwa-raw-sunmu",
          name: "생순무",
          illustration: "raw-sunmu",
          price: 2000,
          bargainPrice: 1500,
          bargainSuccessRate: 0.75,
          // 시세: 10kg 단위 무료배송으로 팔릴 만큼 개당 단가는 저렴 (몇백~천원대).
          fact:
            "강화에서만 잘 자라는 알싸한 순무. 10kg 단위로 팔릴 만큼 개당은 몇백~천원대로 저렴해요.",
        },
      ],
      dining: {
        ctaToAscend: "2층 올라가서 밴댕이 한 입 하기",
        npcName: "2층 식당 사장님",
        npcOpener:
          "오셨어요? 자리 잡고 앉아요. 밴댕이 정식이 2인 기준 32,000~35,000원이에요~",
        // 시세 + 왜 시장에서 먹는지 한 번에 — "사오는 게 아니라 여기서 먹는 음식"
        npcFact:
          "밴댕이는 성질이 급해서 잡히자마자 죽어버려요. 선도가 약해서 사가는 게 아니라 강화 시장에서 바로 무쳐 먹는 게 별미죠~",
        dish: {
          name: "밴댕이회무침",
          illustration: "bandaegi-bowl",
        },
        bites: 5,
        biteReactions: [
          "오 고소해요!",
          "양념이 착 감겨요",
          "씹을수록 단맛이…",
          "한 점 더!",
          "이거 진짜 별미네요",
        ],
        memoir:
          "강화풍물시장 2층에서 비빈 밴댕이회무침 한 그릇. 시장에서 바로 먹는다는 게 이런 거구나.",
      },
    },
    dialogues: [
      {
        npc:
          "어머, 처음 보는 얼굴이네요? 강화 순무 보러 오셨어요? 강화 순무는 진짜 다른 데랑 달라요.",
        options: [
          { label: "순무가 그렇게 유명한가요?", next: 1, traits: ["자연탐험형"] },
          { label: "그냥 시장 분위기 보러 왔어요", next: 2, traits: ["자연탐험형", "집돌이형"] },
        ],
      },
      {
        npc:
          "강화 순무는 갯벌 미네랄 머금어서 아삭아삭 맛이 진해요. 한 개 1,500원 정도예요. 11월~2월이 제일 좋고요.",
        options: [
          { label: "겨울에 다시 오고 싶어요", next: 3, traits: ["자연탐험형"] },
          { label: "한 개 살게요", next: 3, traits: ["자연탐험형", "집돌이형"] },
        ],
      },
      {
        npc:
          "1층 가면 순무김치 직접 버무리는 거 시식해볼 수 있어요. 잠시섬 다녀간 분이 '쿰쿰한 순무김치에 반했다'고 글 남겼던 거예요. 밴댕이·약쑥떡도 빠뜨리지 말고요.",
        options: [
          { label: "순무김치 한 입 해볼게요", next: 3, traits: ["자연탐험형", "집돌이형"] },
          { label: "약쑥떡 한 봉지 사고 싶어요", next: 3, traits: ["자연탐험형"] },
          { label: "그냥 구경만 할래요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "다음에 또 와요. 한 번 오면 우리 집 단골이에요. 매주 토요일이 5일장이라 더 활기차요.",
        options: [
          { label: "꼭 다시 올게요", traits: ["자연탐험형", "집돌이형"] },
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
    // 카카오 로드뷰 임베드 좌표 — 동막해수욕장 진입로 (mudflat 좌표와 살짝 다른 지점)
    kakaoPosition: { lat: 37.5904, lng: 126.4600 },
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

  // ─── Day 3 (생업·손으로 만들기) + Day 4 (인프라·정착 상상) ────────────
  // 신규 미션 (잠시섬 실제 활동 모티프) — 2026-06-13

  {
    id: "cheongpung-socheang",
    title: "소창 한 장, 직접 짜보기",
    icon: "🧵",
    category: "관계형성형",
    mode: "dialogue",
    reward: 15,
    background: "neighbor",
    npc: { name: "소창 장인", emoji: "🪡" },
    npcScene: { src: "/mission/restaurantgrandma.webp" },
    description: "강화 소창 — 손으로 짜는 면직물 한 장",
    dialogues: [
      {
        npc:
          "어서 와요. 여기 있는 게 소창이에요. 강화 100년 면직물. 직접 한 번 짜볼래요? 어렵지 않아요.",
        options: [
          { label: "처음인데 괜찮을까요?", next: 1, traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
          { label: "손으로 만드는 거 좋아해요", next: 2, traits: ["디지털노마드형"], stanceAlign: ["alone_make"] },
          { label: "어떻게 짜는지 보여주세요", next: 1, traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "한 줄씩 손으로 넘기는 거예요. 30분이면 손수건 한 장 만들어요. 도시에서 손으로 뭔가 짜본 적 있어요? 그 감각이 손에 남아요.",
        options: [
          { label: "오랜만에 손이 바쁘네요", next: 3, traits: ["디지털노마드형"], stanceAlign: ["alone_make"] },
          { label: "이게 명상이네요", next: 3, traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "맞아요, 손으로 짜는 게 머리도 비워줘요. 강화 사람들은 이걸 일상으로 해요. 한 시간 짜면 한 장. 식탁보, 행주, 손수건 다 돼요.",
        options: [
          { label: "내가 만든 거 가져갈 수 있어요?", next: 3, traits: ["디지털노마드형"], stanceAlign: ["alone_make"] },
          { label: "이거 일주일에 한 번씩 와도 좋겠어요", next: 3, traits: ["자연탐험형"] },
        ],
      },
      {
        npc:
          "다 만들었네요. 본인이 짠 거니까 가져가요. 다음에 또 와요. 친구도 데려와요. 같이 짜면 더 재밌어요.",
        options: [
          { label: "꼭 다시 올게요", traits: ["자연탐험형", "집돌이형"] },
        ],
      },
    ],
  },

  {
    id: "cheongpung-yoga",
    title: "마당뷰에서 섬요가",
    icon: "🧘",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 12,
    background: "home",
    npc: { name: "섬요가 강사", emoji: "🧘‍♀️" },
    npcScene: { src: "/mission/yoga.webp" },
    description: "잠시섬 빌리지 마당에서 하타요가 한 시간",
    dialogues: [
      {
        npc:
          "안녕하세요. 오늘은 마당뷰에서 진행해요. 강화도에서 하타요가를 한다는 게, 도시 요가랑은 또 달라요. 자세 잡기 전에 한 번 둘러봐요.",
        options: [
          { label: "마당이 정말 넓네요", next: 1, traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
          { label: "혼자 와도 어색하지 않을까요?", next: 1, traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
          { label: "처음이라 따라갈 수 있을지...", next: 2, traits: ["디지털노마드형"], stanceAlign: ["alone_make"] },
        ],
      },
      {
        npc:
          "다들 처음엔 그래요. 우리 클래스는 5명 안쪽이라 혼자여도 편해요. 일단 매트 위에 누워요. 천천히 호흡부터.",
        options: [
          { label: "호흡만으로도 다른데요?", next: 2, traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
          { label: "이 공기 좋네요", next: 2, traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "강화 공기에 바람 소리가 섞여서 자연이 같이 호흡해요. 한 시간 끝나면 몸이 가벼워져 있을 거예요. 매주 화·목 오후예요. 또 와요.",
        options: [
          { label: "여기 살면 이게 일상이 되겠네요", traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
          { label: "매주 오고 싶을 만큼 좋네요", traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
        ],
      },
    ],
  },

  {
    id: "cheongpung-record",
    title: "오늘 하루, 방명록에 한 줄",
    icon: "📓",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 10,
    background: "home",
    npc: { name: "레지던스 호스트", emoji: "🧑" },
    npcScene: { src: "/mission/residentowner.webp" },
    description: "오늘 본 풍경·만난 사람을 짧게 기록 — 잠시섬 인증 모티프",
    dialogues: [
      {
        npc:
          "오늘 하루 어땠어요? 잠시섬엔 방명록 노트가 있어요. 다녀간 사람마다 한 줄씩 남겨요. 오늘 가장 기억에 남은 거 뭐예요?",
        options: [
          { label: "갯벌에 발 빠진 거", next: 1, traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
          { label: "사람들이랑 어울린 시간", next: 1, traits: ["레저형"], stanceAlign: ["together_rest", "together_make"] },
          { label: "마당뷰에서 멍 때린 거", next: 1, traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
          { label: "손으로 뭔가 만든 거", next: 1, traits: ["디지털노마드형"], stanceAlign: ["alone_make"] },
        ],
      },
      {
        npc:
          "좋네요. 그 한 줄 적으면, 다음에 누가 와서 읽어요. 여기 책장 봐요. 18기 이주자가 남긴 거예요: '이 동네는 사람이 사람한테 기대도 되는 곳' 이라고 적었어요.",
        options: [
          { label: "그 말이 마음에 들어요", next: 2, traits: ["자연탐험형", "집돌이형"], stanceAlign: ["alone_rest", "together_rest"] },
          { label: "다른 사람 글도 읽어보고 싶어요", next: 2, traits: ["레저형"], stanceAlign: ["together_rest"] },
        ],
      },
      {
        npc:
          "방명록은 강화도가 보내는 답장 같은 거예요. 한 줄 쓰면 진짜로 인증돼요. 잠시 보낸 시간이 어딘가에 남는다는 거. 그게 우리가 환대받는 방식이에요.",
        options: [
          { label: "한 줄 쓰고 갈게요", traits: ["자연탐험형", "집돌이형", "디지털노마드형", "레저형"] },
        ],
      },
    ],
  },

  {
    id: "cheongpung-onsen",
    title: "미네랄 온천 한 시간",
    icon: "♨️",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 10,
    background: "home",
    npc: { name: "온천 사장님", emoji: "♨️" },
    npcScene: { src: "/mission/villagemanager.webp" },
    description: "마지막 날 — 몸을 천천히 데우며 사흘을 정리",
    dialogues: [
      {
        npc:
          "어서 와요. 강화 미네랄 온천이에요. 지하 천 미터에서 끌어 올린 물. 몸이 노곤한 분들 많이 와요. 사흘 어땠어요?",
        options: [
          { label: "많이 걸어서 다리가 무거워요", next: 1, traits: ["자연탐험형", "레저형"], stanceAlign: ["alone_rest"] },
          { label: "마음이 좀 차분해졌어요", next: 1, traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
          { label: "어색하다가 점점 익숙해졌어요", next: 1, traits: ["디지털노마드형"], stanceAlign: ["alone_make"] },
        ],
      },
      {
        npc:
          "그게 강화예요. 도시랑 시간이 다르게 가요. 여기 물 좀 따뜻해요. 30분쯤 천천히 담그면 사흘이 풀려요. 강화 분들도 일주일에 한 번씩 와요.",
        options: [
          { label: "이게 일상이라니 부럽네요", next: 2, traits: ["자연탐험형", "집돌이형"], stanceAlign: ["alone_rest"] },
          { label: "여기 가까이 살면 좋겠어요", next: 2, traits: ["디지털노마드형"], stanceAlign: ["alone_make"] },
        ],
      },
      {
        npc:
          "오늘 저녁 일몰 보러 가신댔죠? 몸 덥혀서 가요. 노을 보면서 사흘 정리하면 진짜 가져갈 게 손에 잡혀요.",
        options: [
          { label: "일몰까지 안 미루고 가볼게요", traits: ["자연탐험형", "집돌이형"], stanceAlign: ["alone_rest"] },
        ],
      },
    ],
  },

  {
    id: "cheongpung-fortress",
    title: "읍내 성곽 야경 한 바퀴",
    icon: "🏯",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 8,
    background: "neighbor",
    npc: { name: "읍내 산책꾼", emoji: "🚶" },
    description: "강화읍 성곽 — 사람 적은 밤의 길",
    dialogues: [
      {
        npc:
          "읍내 성곽 한 바퀴, 30분이면 돌아요. 사람 거의 없어요. 밤엔 등이 켜져서 길이 보이고요. 같이 걸을래요?",
        options: [
          { label: "혼자 조용히 걷고 싶어요", next: 1, traits: ["집돌이형", "자연탐험형"], stanceAlign: ["alone_rest"] },
          { label: "같이 걸으면 좋겠어요", next: 1, traits: ["레저형"], stanceAlign: ["together_rest"] },
        ],
      },
      {
        npc:
          "성곽에서 읍내 내려다보면, 이 동네가 얼마나 작은지 보여요. 작은 게 답답한 분도 있고, 작아서 좋다는 분도 있고요.",
        options: [
          { label: "작아서 손에 잡히는 게 좋아요", traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
          { label: "이 정도면 살 만하겠다 싶어요", traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
        ],
      },
    ],
  },

  {
    id: "cheongpung-bookstore",
    title: "강화 이야기 한 권",
    icon: "📚",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 12,
    background: "cafe",
    npc: { name: "책방지기", emoji: "📖" },
    description: "동네 책방 들러 강화를 담은 책 한 권 만나기 — 첫날 아침의 조용한 톤",
    dialogues: [
      {
        npc:
          "어서 와요~ 첫날이세요? 우리 책방은 강화에서 사는 작가들 책이 절반이에요. 함민복 시인이 여기 갯벌을 시로 썼는데, 그 책도 있고요. 어떤 톤이 좋으세요?",
        options: [
          { label: "갯벌 시 한번 들어보고 싶어요", next: 1, traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
          { label: "조용한 자연 에세이", next: 2, traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
          { label: "강화 이주민이 쓴 글", next: 2, traits: ["디지털노마드형"], stanceAlign: ["alone_make"] },
        ],
      },
      {
        npc:
          "함민복 시인 같은 강화 작가들이, 사실 도시에선 잘 안 알려진 결을 써요. 갯벌이 어떻게 호흡하는지 한 줄로 잡는 사람들이거든요. 오늘 낮에 갯벌 가시면, 시 한 편 머릿속에 두고 가보세요. 풍경이 달라져요.",
        options: [
          { label: "갯벌 가기 전에 한 편 챙길게요", next: 3, traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
          { label: "한 권 사서 마당에서 읽고 싶어요", next: 3, traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "그쪽 책장 보세요. 강화에서 십 년 산 분이 쓴 책, 떠나는 사람이 두고 간 책, 메모 적힌 책도 있어요. 사람의 흔적이 남은 책이죠. 잠시 머무신다면, 손 가는 한 권 고르고 오늘 만난 한 문장 적어 두세요.",
        options: [
          { label: "한 문장 기록하고 갈게요", next: 3, traits: ["디지털노마드형", "자연탐험형"], stanceAlign: ["alone_make"] },
          { label: "조용히 한 권 골라볼게요", next: 3, traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "또 와요. 책방 페스티벌도 가끔 해요. 강화 책방들끼리 같이 여는데, 그땐 더 풍성해요. 첫날부터 책방 들른 분, 사흘 동안 한 번 더 와요. 보통 그러시거든요.",
        options: [
          { label: "다음에 다시 들를게요", traits: ["자연탐험형", "집돌이형", "디지털노마드형", "레저형"] },
        ],
      },
    ],
  },

  // ─── 강화 향토음식 (Day 1 저녁 메인 + 보너스 2) ──────────────
  // 잠시섬 발표용 reality anchor — 고려 천도(1232)·갯벌장어·시장 간식.
  // 출처: TravieIncheon (젓국갈비), Outdoornews (갯벌장어), Brunch (잠시섬 후기 시장 미션).
  {
    id: "cheongpung-jeotguk",
    title: "젓국갈비 한 그릇",
    icon: "🍲",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 13,
    background: "cafe",
    npc: { name: "동네 식당 사장님", emoji: "👩‍🍳" },
    npcScene: { src: "/mission/restaurantgrandma.webp" },
    description: "강화 향토음식 — 고려 임금에게 올렸던 맑은 갈비탕",
    dialogues: [
      {
        npc:
          "어서 와요. 첫 끼는 젓국갈비 어때요? 강화 와서 이거 안 먹고 가면 섭섭해요. 다른 데선 못 먹어요.",
        options: [
          { label: "처음 들어봐요. 어떤 음식이에요?", next: 1, traits: ["자연탐험형", "집돌이형"] },
          { label: "좋아요, 한 그릇 주세요", next: 2, traits: ["레저형", "디지털노마드형"] },
        ],
      },
      {
        npc:
          "고려 임금이 강화 천도(1232년) 했을 때 진상으로 올렸던 음식이에요. 돼지갈비 탕에 강화 새우젓으로 간 맞춰서, 소금 안 써도 시원해요. 시래기·배추·호박 다 들어가요.",
        options: [
          { label: "역사 이야기까지 있네요", next: 2, traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
          { label: "맑은 국물 좋아해요", next: 2, traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "강화 앞바다가 전국 젓새우 70% 잡히는 데예요. 그러니까 새우젓이 워낙 좋아서, 이 한 그릇이 곧 강화 한 동네예요. 천천히 드세요.",
        options: [
          { label: "이 한 그릇에 강화가 다 들었네요", next: 3, traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
          { label: "또 와서 먹고 싶어요", next: 3, traits: ["집돌이형", "디지털노마드형"] },
        ],
      },
      {
        npc:
          "또 와요. 우리집은 점심·저녁 다 해요. 다음엔 친구도 데려와요. 같이 먹으면 더 맛있어요.",
        options: [
          { label: "꼭 다시 올게요", traits: ["자연탐험형", "집돌이형", "디지털노마드형", "레저형"] },
        ],
      },
    ],
  },

  {
    id: "cheongpung-eel",
    title: "갯벌장어 한 끼",
    icon: "🦪",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 10,
    background: "neighbor",
    npc: { name: "장어집 사장님", emoji: "🍢" },
    npcScene: { src: "/mission/villagemanager.webp" },
    description: "강화 갯벌에서 자란 장어 — 갯벌 미션의 연장선",
    dialogues: [
      {
        npc:
          "갯벌 한 바퀴 도셨다구요? 그럼 보양은 갯벌장어로 해야지. 강화 갯벌이 세계 3대 갯벌인 거 아세요? 거기서 자란 장어라 살이 통통하고 비린내가 없어요.",
        options: [
          { label: "민물장어랑 뭐가 달라요?", next: 1, traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
          { label: "보양 좀 해야겠어요", next: 2, traits: ["집돌이형", "디지털노마드형"], stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "민물장어는 부드러운데 좀 물려요. 갯벌장어는 갯벌 미네랄 머금어서 쫄깃해요. 처음은 소금구이로, 마무리는 양념구이로. 그게 정석이에요.",
        options: [
          { label: "소금구이부터 시작할게요", next: 2, traits: ["자연탐험형", "집돌이형"], stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "강화 분들도 일주일에 한 번씩 와요. 사흘 다니면 몸이 좀 무거워질 때, 이거 한 끼 하면 다시 가벼워져요. 천천히 드세요.",
        options: [
          { label: "여기 살면 일상이 보양이네요", traits: ["자연탐험형", "집돌이형"], stanceAlign: ["alone_rest"] },
        ],
      },
    ],
  },

  {
    id: "cheongpung-snack",
    title: "시장 간식 한 봉지",
    icon: "🍠",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 7,
    background: "market",
    npc: { name: "시장 노점 할머니", emoji: "🍡" },
    description: "강화 속노란 고구마말랭이·국화빵·약쑥떡 — 들고 다니며 한 입",
    dialogues: [
      {
        npc:
          "시장 한 바퀴 도시다 출출하지? 우리 군고구마말랭이 한 봉지 사 갈래요? 강화 속노란 고구마라 단맛이 진해요.",
        options: [
          { label: "한 봉지 주세요", next: 1, traits: ["자연탐험형", "집돌이형"] },
          { label: "국화빵도 있나요?", next: 2, traits: ["디지털노마드형", "레저형"] },
        ],
      },
      {
        npc:
          "잘 골랐어. 이거 들고 갯벌 가서 노을 보면서 먹으면 진짜 좋아요. 강화 분들도 그렇게 해요. 가방에 한 봉지 항상 들어 있어요.",
        options: [
          { label: "갯벌 가는 길에 들고 갈게요", next: 3, traits: ["자연탐험형"], stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "국화빵도 좋고, 약쑥떡도 좋고. 다 가져갈래요? 잠시 머무는 분들이 우리집 거 사서 게스트하우스 친구들이랑 나눠 먹어요. 그러면서 친해져요.",
        options: [
          { label: "두 봉지로 할게요. 나눠 먹으려고요", next: 3, traits: ["레저형"], stanceAlign: ["together_rest"] },
          { label: "한 봉지면 충분해요", next: 3, traits: ["집돌이형"], stanceAlign: ["alone_rest"] },
        ],
      },
      {
        npc:
          "또 와요. 우리는 풍물장 (2일·7일)에 더 다양하게 펴요. 그날 오면 더 재밌어요.",
        options: [
          { label: "장날 맞춰 다시 올게요", traits: ["자연탐험형", "레저형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 광양 — 디지털노마드형 (4개)
// =====================================================================
export const gwangyangMissions: Mission[] = [
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
export const geojeMissions: Mission[] = [
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
// 태안 — 레저형 (4개)
// =====================================================================
export const taeanMissions: Mission[] = [
  {
    id: "taean-sunset",
    title: "만리포 노을 산책",
    icon: "🌅",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "노을 사진가", emoji: "📸" },
    description: "서해 노을이 가장 길게 머무는 해변",
    // 카카오 로드뷰 임베드 좌표 — 만리포해수욕장 (위키백과 임베드 지도 출처)
    kakaoPosition: { lat: 36.786417, lng: 126.142333 },
    dialogues: [
      {
        npc:
          "만리포는 서해에서 노을이 가장 오래 머무는 해변 중 하나예요. 일몰 30분 전에 와서 한 시간 정도 머물러요.",
        options: [
          { label: "매일 가도 좋겠어요", next: 1, traits: ["레저형", "자연탐험형"] },
          { label: "주말 의식처럼 보고 싶어요", next: 1, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "해변 끝에 자전거 거치대가 있어요. 자전거 타고 와서 노을 보고 카페에서 차 한 잔. 동네 사람들이 그렇게 하루를 마무리해요.",
        options: [
          { label: "그 일과 진짜 좋네요", next: 2, traits: ["레저형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "사진 찍는 분도 많지만, 그냥 멍 때리며 보는 분이 제일 많아요. 핸드폰 안 보고 30분만 있어 봐요.",
        options: [
          { label: "마음 가라앉히기 좋겠어요", traits: ["레저형", "자연탐험형"] },
        ],
      },
    ],
  },

  {
    id: "taean-bike",
    title: "안면도 자전거 일주",
    icon: "🚲",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "transit",
    npc: { name: "자전거 가게 사장님", emoji: "🧑‍🔧" },
    description: "꽃지~만리포 해변길, 라이딩 명코스",
    dialogues: [
      {
        npc:
          "안면도 일주는 35km 정도예요. 평지 위주라 초보도 무리 없어요. 자전거 대여 4시간에 1만 5천원이에요.",
        options: [
          { label: "도전해 보고 싶어요", next: 1, traits: ["레저형"] },
          { label: "절반 코스도 있나요?", next: 2, traits: ["레저형", "집돌이형"] },
        ],
      },
      {
        npc:
          "꽃지해변에서 출발해서 만리포까지 갔다가 돌아오면 한나절 코스예요. 카페 두 번 들르고 사진 찍으면 딱이에요.",
        options: [
          { label: "여유롭게 한 바퀴 돌고 싶어요", next: 3, traits: ["레저형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "꽃지해변 한 바퀴만 도는 짧은 코스도 있어요. 15km 정도라 두 시간이면 충분해요. 처음엔 짧게 시작해도 좋아요.",
        options: [
          { label: "짧게 시작해 볼게요", next: 3, traits: ["집돌이형", "레저형"] },
        ],
      },
      {
        npc:
          "라이딩 끝에 동네 분식집에서 떡볶이 한 그릇. 그게 안면도 자전거의 진짜 마무리예요.",
        options: [
          { label: "그런 하루 좋네요", traits: ["레저형"] },
        ],
      },
    ],
  },

  {
    id: "taean-surf",
    title: "만리포 서핑 강습",
    icon: "🏄",
    category: "생활현실형",
    mode: "map-dialogue",
    reward: 8,
    background: "neighbor",
    npc: { name: "서핑 강사", emoji: "🧑‍🏫" },
    description: "초보도 한 번에 일어선다는 만리포 파도",
    dialogues: [
      {
        npc:
          "만리포는 초보용 파도가 좋아요. 입문 강습이 2시간에 8만원, 보드·웻슈트 다 포함이에요. 처음이세요?",
        options: [
          { label: "완전 처음이에요", next: 1, traits: ["레저형"] },
          { label: "한두 번 해봤어요", next: 2, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "그러면 첫 한 시간은 모래에서 자세 잡고, 한 시간은 바다에 들어가요. 90%는 첫날 일어서요. 너무 걱정 마요.",
        options: [
          { label: "도전해 보고 싶어요", next: 3, traits: ["레저형"] },
          { label: "혼자 가도 강습 받을 수 있나요?", next: 3, traits: ["레저형", "집돌이형"] },
        ],
      },
      {
        npc:
          "그러면 중급 1대1로 가요. 시간당 6만원이에요. 자세 교정만 잡아드리면 금방 잘 타실 거예요.",
        options: [
          { label: "그게 효율 좋겠어요", next: 3, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "5월부터 10월까지가 시즌이에요. 한 번 시작하면 매주 와요. 도시 사람이 여기 정착하는 이유 중 하나예요.",
        options: [
          { label: "주말마다 와도 좋겠어요", traits: ["레저형"] },
        ],
      },
    ],
  },

  {
    id: "taean-community",
    title: "해변 라이프 커뮤니티",
    icon: "🤝",
    category: "관계형성형",
    mode: "dialogue",
    reward: 15,
    background: "cafe",
    npc: { name: "만리포 정착 4년차", emoji: "👩" },
    description: "서울에서 내려와 정착한 사람들의 모임",
    dialogues: [
      {
        npc:
          "저도 서울에서 4년 전에 왔어요. 디자이너 일 하다가요. 만리포에 비슷한 사람 의외로 많아요.",
        options: [
          { label: "어떻게 적응하셨어요?", next: 1, traits: ["레저형", "자연탐험형"] },
          { label: "모임이 자주 있나요?", next: 2, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "처음 한 달은 사람도 안 만나고 그냥 바다만 봤어요. 그 다음에 서핑 강습 들으면서 자연스럽게 친구 생겼어요.",
        options: [
          { label: "그 흐름 좋네요", next: 3, traits: ["레저형", "집돌이형"] },
        ],
      },
      {
        npc:
          "주말마다 서핑 끝나면 누군가 카페에서 만나자고 해요. 격주에 한 번씩 같이 저녁도 먹고요. 부담 없이 시작할 수 있어요.",
        options: [
          { label: "그런 자연스러움이 좋아요", next: 3, traits: ["레저형"] },
        ],
      },
      {
        npc:
          "만리포는 다 그래요. 도시처럼 빡빡한 약속이 없어요. 같이 파도 타고, 같이 노을 보고. 그게 다예요.",
        options: [
          { label: "그런 관계가 진짜 그리웠어요", traits: ["레저형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 영월 — 자연탐험형 (구버전, 미사용) - 별마로 천문대 컨셉
// =====================================================================
export const yeongwolMissionsOld: Mission[] = [
  {
    id: "yeongwol-stars",
    title: "별마로 천문대 야간 관측",
    icon: "✨",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "library",
    npc: { name: "천문 해설사", emoji: "🔭" },
    description: "도시에선 못 본다는 진짜 별하늘",
    realRoadview: [
      "https://picsum.photos/seed/yeongwol-stars-depart/800/600",
      "https://picsum.photos/seed/yeongwol-stars-alley/800/600",
      "https://picsum.photos/seed/yeongwol-stars-approach/800/600",
      "https://picsum.photos/seed/yeongwol-stars-arrive/800/600",
    ],
    dialogues: [
      {
        npc:
          "별마로 천문대는 해발 800m 산 위에 있어요. 광공해가 거의 없어서 도시에선 못 보는 별까지 보여요. 4월~10월이 관측 좋아요.",
        options: [
          { label: "은하수도 보여요?", next: 1, traits: ["자연탐험형"] },
          { label: "겨울에도 갈 만한가요?", next: 2, traits: ["자연탐험형", "집돌이형"] },
        ],
      },
      {
        npc:
          "여름엔 은하수가 진짜 선명해요. 망원경 안 봐도 그냥 눈으로 봐요. 도시 사람들이 처음 보면 다 충격받아요.",
        options: [
          { label: "그런 충격 한번 받고 싶어요", next: 3, traits: ["자연탐험형"] },
        ],
      },
      {
        npc:
          "겨울엔 추워서 짧게 봐요. 대신 공기가 맑아서 오리온자리가 진짜 또렷해요. 별 보고 산막에서 차 한 잔.",
        options: [
          { label: "그게 진짜 사치네요", next: 3, traits: ["자연탐험형", "집돌이형"] },
        ],
      },
      {
        npc:
          "여기 사는 분들은 매주 봐요. 도시면 특별한 행사인데, 영월에선 그냥 저녁 산책 같은 거예요.",
        options: [
          { label: "그런 일상이 부럽네요", traits: ["자연탐험형"] },
        ],
      },
    ],
  },

  {
    id: "yeongwol-river",
    title: "동강 따라 걷기",
    icon: "🏞️",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "강가 어른", emoji: "🧓" },
    description: "굽이굽이 동강을 따라 걷는 한 시간",
    // 능동: 강가에 누가 앉아 있고, 내가 다가가 묻는 그림.
    opener: {
      prompt: "강가에 앉아 있는 분께 뭐라고 말 걸까?",
      options: [
        {
          emoji: "🚶",
          label: "혼자 걷기 좋은 길이라고 들었어요",
          nextTurn: 0,
        },
        {
          emoji: "📷",
          label: "사진 찍는 분들도 많이 오나요?",
          nextTurn: 1,
        },
        {
          emoji: "☕",
          label: "동강 옆에 사는 분들 아침은 어떻게 시작해요?",
          nextTurn: 2,
        },
      ],
    },
    dialogues: [
      // turn 0 — 혼자 걷기 분기
      {
        npc:
          "평일엔 거의 혼자 걸어요. 강물 소리만 나고. 가다 보면 새 우는 소리, 바람 소리, 그게 다예요.",
        options: [
          { label: "그런 시간이 진짜 필요했어요", next: 3, traits: ["자연탐험형", "집돌이형"] },
        ],
      },
      // turn 1 — 사진가 분기
      {
        npc:
          "주말엔 사진가들이 와요. 그래도 사람 많은 건 아니고요. 새벽 안개 낀 동강 사진 찍으러 오는 분들이에요.",
        options: [
          { label: "새벽에 가보고 싶어요", next: 3, traits: ["자연탐험형"] },
        ],
      },
      // turn 2 — 아침 일상 분기 (신규 진입점)
      {
        npc:
          "강 따라 걷고 산막 카페에서 커피 한 잔, 그게 동강 사는 사람의 오전이에요. 도시에서 못 누리는 호사예요.",
        options: [
          { label: "그 시간이 그리웠어요", next: 3, traits: ["자연탐험형"] },
        ],
      },
      // turn 3 — 공통 마무리
      {
        npc:
          "강을 매일 본다는 거, 별거 아닌 것 같지만 일 년 지나면 사람을 바꿔놓아요.",
        options: [
          { label: "그 변화를 받아보고 싶어요", traits: ["자연탐험형"] },
        ],
      },
    ],
  },

  {
    id: "yeongwol-trek",
    title: "한반도 지형 트레킹",
    icon: "🗺️",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "산악 가이드", emoji: "🧗" },
    description: "지도와 똑같이 생긴 한반도 지형 전망대",
    dialogues: [
      {
        npc:
          "선암마을 한반도 지형은 우리나라 지도랑 똑같이 생겼어요. 전망대까지 트레킹 1시간이고, 초보도 가능해요.",
        options: [
          { label: "그 풍경 꼭 보고 싶어요", next: 1, traits: ["자연탐험형"] },
          { label: "더 힘든 코스도 있나요?", next: 2, traits: ["자연탐험형", "레저형"] },
        ],
      },
      {
        npc:
          "위에서 내려다보면 정말 한반도 모양이에요. 봄엔 벚꽃, 여름엔 초록, 가을엔 단풍. 사계절 다 좋아요.",
        options: [
          { label: "사계절 다 가보고 싶어요", next: 3, traits: ["자연탐험형"] },
        ],
      },
      {
        npc:
          "더 본격적인 분은 마대산 코스를 가요. 5시간 코스인데 등산 좋아하는 분들이 많이 가세요.",
        options: [
          { label: "체력 길러서 가보고 싶어요", next: 3, traits: ["자연탐험형", "레저형"] },
        ],
      },
      {
        npc:
          "영월은 산이 많은 도시예요. 코스 골라가는 재미가 있어요. 한 달이면 4-5코스 다 가볼 수 있어요.",
        options: [
          { label: "한 달이 부족하겠어요", traits: ["자연탐험형"] },
        ],
      },
    ],
  },

  {
    id: "yeongwol-elder",
    title: "산골 어르신 만나기",
    icon: "🤝",
    category: "관계형성형",
    mode: "dialogue",
    reward: 15,
    background: "home",
    npc: { name: "5대째 영월 어르신", emoji: "👴" },
    description: "영월에서만 5대를 산 어르신의 이야기",
    // 능동: 어르신은 마루에 앉아 계시고, 내가 먼저 다가가 묻는 그림.
    opener: {
      prompt: "어르신께 무엇을 물어볼까?",
      options: [
        {
          emoji: "❄️",
          label: "겨울이 그렇게 춥다던데, 살기 어렵진 않으세요?",
          nextTurn: 0,
        },
        {
          emoji: "🌱",
          label: "외지에서 내려온 분들도 있어요?",
          nextTurn: 1,
        },
        {
          emoji: "🪶",
          label: "5대째 사신 분만 알 수 있는 게 있을까요?",
          nextTurn: 2,
        },
      ],
    },
    dialogues: [
      // turn 0 — 추위/계절 분기
      {
        npc:
          "어렵죠. 겨울이 길고 추워요. 그런데 봄 되면 다 잊어요. 동강에 얼음 풀리고 새가 오고, 그 시간이 한 1년 같아요.",
        options: [
          { label: "그런 계절감이 진짜 멋지네요", next: 3, traits: ["자연탐험형"] },
        ],
      },
      // turn 1 — 외지인 분기
      {
        npc:
          "요즘은 도시에서 내려오는 젊은 분들도 있어요. 천문대 좋아서, 강 좋아서. 처음엔 의아했는데 이젠 익숙해요.",
        options: [
          { label: "받아주시는 게 감사하네요", next: 3, traits: ["자연탐험형", "집돌이형"] },
        ],
      },
      // turn 2 — 5대째 분기 (신규)
      {
        npc:
          "5대째 살다 보니, 산이 어디서 어떻게 그늘지는지 다 알아요. 동강이 어느 해엔 더 차고 어느 해엔 늦게 풀리는지도. 그건 책에 안 나와요.",
        options: [
          { label: "그 감각이 진짜 부럽네요", next: 3, traits: ["자연탐험형", "집돌이형"] },
        ],
      },
      // turn 3 — 공통 마무리
      {
        npc:
          "여기서 살려면 욕심을 좀 줄여야 해요. 빠른 거 적은 거. 그 대신 깊은 거 많아요. 별, 강, 산.",
        options: [
          { label: "꼭 그 깊이를 배우고 싶어요", traits: ["자연탐험형", "집돌이형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 양양 — 디지털노마드형 (4개)
// =====================================================================
export const yangyangMissions: Mission[] = [
  {
    id: "yangyang-coworking",
    title: "인구해변 코워킹 입주",
    icon: "💼",
    category: "생활현실형",
    mode: "map-dialogue",
    reward: 8,
    background: "office",
    npc: { name: "코워킹 매니저", emoji: "🧑‍💻" },
    description: "해변 옆 공유 작업실 — 한 달 살이 가능",
    dialogues: [
      {
        npc:
          "인구해변에 코워킹 세 곳이 있어요. 데일리 1만 5천원, 월정액 18만원이에요. 와이파이는 기가급, 회의실도 있어요.",
        options: [
          { label: "한 달 정도 살아보고 싶어요", next: 1, traits: ["디지털노마드형"] },
          { label: "처음엔 데일리로 가볍게요", next: 2, traits: ["디지털노마드형", "집돌이형"] },
        ],
      },
      {
        npc:
          "한 달 살이 하면 코워킹 이용권에 숙소 할인까지 같이 줘요. 80~100만원에 한 달 워케이션 가능해요.",
        options: [
          { label: "그게 진짜 가성비네요", next: 3, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc:
          "데일리 일주일 써보고 결정해도 돼요. 다른 입주자들이랑 자연스럽게 친해지는 시간이기도 해요.",
        options: [
          { label: "느슨하게 시작해 볼게요", next: 3, traits: ["디지털노마드형", "집돌이형"] },
        ],
      },
      {
        npc:
          "양양은 일하고 쉬는 게 자연스럽게 섞여요. 도시처럼 분리되어 있지 않아요. 그게 진짜 매력이에요.",
        options: [
          { label: "그 흐름이 필요했어요", traits: ["디지털노마드형"] },
        ],
      },
    ],
  },

  {
    id: "yangyang-surf-dawn",
    title: "새벽 서핑 한 시간",
    icon: "🏄‍♀️",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "새벽 서퍼", emoji: "🏄" },
    description: "출근 전 1시간, 일과 같이 가는 서핑",
    dialogues: [
      {
        npc:
          "양양 서퍼들은 새벽에 많이 나가요. 5시 반~7시 반. 그러고 코워킹으로 출근해요. 아침이 진짜 달라져요.",
        options: [
          { label: "그런 루틴 부러워요", next: 1, traits: ["디지털노마드형", "레저형"] },
          { label: "새벽엔 사람 적어요?", next: 2, traits: ["디지털노마드형", "집돌이형"] },
        ],
      },
      {
        npc:
          "한 달만 해 봐도 몸이 달라져요. 운동 따로 안 해도 돼요. 코어가 잡혀요.",
        options: [
          { label: "운동까지 한 번에 되겠네요", next: 3, traits: ["레저형", "디지털노마드형"] },
        ],
      },
      {
        npc:
          "새벽엔 거의 단골들만 있어요. 5명 정도. 다 비슷한 시간에 와서 30분만 타고 가요.",
        options: [
          { label: "그 분위기가 좋아요", next: 3, traits: ["집돌이형", "디지털노마드형"] },
        ],
      },
      {
        npc:
          "장비는 사기 전에 일주일만 렌탈 해 봐요. 입문자 셋트 7천원에 3시간이에요. 자기 보드 사면 더 자유로워지고요.",
        options: [
          { label: "차근차근 갖춰 볼게요", traits: ["디지털노마드형"] },
        ],
      },
    ],
  },

  {
    id: "yangyang-cafe-work",
    title: "해변 카페 작업",
    icon: "☕",
    category: "생활현실형",
    mode: "numeric",
    reward: 8,
    background: "cafe",
    npc: { name: "해변 카페 사장", emoji: "👨‍🍳" },
    description: "양양 해변 카페에서 일해보기 — 한 잔 예산은?",
    dialogues: [
      {
        npc:
          "양양 해변 카페는 좀 비싼 편이에요. 코워킹 같은 분위기인데 한 잔 가격이 평균 얼마쯤일 것 같으세요?",
        numeric: {
          prompt: "예상 카페 가격",
          unit: "원",
          placeholder: "예) 6500",
          next: 1,
          benchmarks: { low: 5500, high: 7500 },
        },
      },
      {
        npc:
          "{amount}원으로 예상하셨네요. 실제 평균은 6,500원이에요. {compare} 도시 카페랑 거의 비슷하죠.",
        options: [
          { label: "그래도 분위기 값은 하네요", next: 2, traits: ["디지털노마드형", "레저형"] },
          { label: "한 잔 시키고 오래 앉으려구요", next: 2, traits: ["디지털노마드형", "집돌이형"] },
        ],
      },
      {
        npc:
          "주중엔 자리도 많고 콘센트도 다 있어요. 주말은 관광객 많아서 작업하기 좀 어려워요. 평일 위주로 와요.",
        options: [
          { label: "워케이션엔 평일이 맞네요", traits: ["디지털노마드형"] },
        ],
      },
    ],
  },

  {
    id: "yangyang-nomad",
    title: "양양 노마드 모임",
    icon: "🤝",
    category: "관계형성형",
    mode: "dialogue",
    reward: 15,
    background: "cafe",
    npc: { name: "양양 노마드 운영자", emoji: "👩" },
    description: "양양에 정착·체류 중인 디지털노마드들의 모임",
    dialogues: [
      {
        npc:
          "양양 노마드 모임이 매월 한 번 있어요. 코워킹이나 카페에서 모이고, 자유롭게 일 얘기, 동네 얘기 해요.",
        options: [
          { label: "그런 자리 좋아요", next: 1, traits: ["디지털노마드형", "레저형"] },
          { label: "혼자만의 시간도 필요해요", next: 2, traits: ["디지털노마드형", "집돌이형"] },
        ],
      },
      {
        npc:
          "다들 그렇게 시작했어요. 한 번 와서 분위기 보고 결정하세요. 부담 갖지 않아도 돼요.",
        options: [
          { label: "한번 가볼게요", next: 3, traits: ["디지털노마드형", "레저형"] },
        ],
      },
      {
        npc:
          "맞아요, 모임만이 답은 아니죠. 양양은 혼자 있어도 외롭지 않은 동네예요. 코워킹에서 가볍게 인사만 해도 좋고요.",
        options: [
          { label: "그 거리감이 마음에 들어요", next: 3, traits: ["집돌이형", "디지털노마드형"] },
        ],
      },
      {
        npc:
          "여기 있는 사람들은 도시 친구들이랑 결이 좀 달라요. 일 얘기보다 어떻게 살까 얘기를 더 많이 해요.",
        options: [
          { label: "그런 대화가 필요했어요", traits: ["디지털노마드형", "자연탐험형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 진도 — 집돌이형 (4개)
// =====================================================================
export const jindoMissions: Mission[] = [
  {
    id: "jindo-art",
    title: "운림산방 한국화 감상",
    icon: "🎨",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "library",
    npc: { name: "미술관 해설사", emoji: "👨‍🎨" },
    description: "한국화의 고향, 운림산방에서 한 시간",
    // 카카오 로드뷰 임베드 좌표 — 운림산방 (위키백과 DMS → 10진수)
    kakaoPosition: { lat: 34.466110, lng: 126.308060 },
    dialogues: [
      {
        npc:
          "운림산방은 조선 후기 화가 소치 허련의 화실이었어요. 지금은 미술관이고, 입장료 3천원에 한 시간 정도 둘러보면 좋아요.",
        options: [
          { label: "조용히 둘러보고 싶어요", next: 1, traits: ["집돌이형", "자연탐험형"] },
          { label: "해설도 듣고 싶어요", next: 2, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "혼자 가도 좋아요. 평일엔 사람이 거의 없어요. 마당이 정말 예뻐서 거기서 30분 정도 앉아 있어도 좋고요.",
        options: [
          { label: "그런 시간이 진짜 좋아요", next: 3, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "해설 시간이 오전 11시, 오후 3시예요. 30분 정도인데 한국화 입문으로 좋아요. 그림 보는 눈이 달라져요.",
        options: [
          { label: "꼭 시간 맞춰 가야겠어요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "그림 보고 나면 옆 카페에서 차 한 잔. 그게 운림산방의 마무리예요. 도시에선 못 누리는 한가함이에요.",
        options: [
          { label: "그런 오후가 그리웠어요", traits: ["집돌이형", "자연탐험형"] },
        ],
      },
    ],
  },

  {
    id: "jindo-tea",
    title: "진도 다도 한 잔",
    icon: "🍵",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 10,
    background: "neighbor",
    npc: { name: "다도 선생", emoji: "🧘" },
    description: "차 한 잔의 시간 — 진도 한옥에서",
    dialogues: [
      {
        npc:
          "진도엔 다도 체험을 할 수 있는 한옥이 세 곳 있어요. 한 시간에 2만원이고, 차 우리는 법부터 천천히 배워요.",
        options: [
          { label: "처음이라 다 배우고 싶어요", next: 1, traits: ["집돌이형"] },
          { label: "혼자 마시는 시간 좋아해요", next: 2, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "처음엔 차 종류부터 알려드려요. 녹차, 우롱차, 보이차. 향이 다 달라요. 한 시간이 금방 가요.",
        options: [
          { label: "그런 깊이 좋네요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "그러면 셀프 코너 추천해요. 차랑 다구만 빌려서 마당에 앉아 마시는 거예요. 한 시간에 1만원이고 혼자만의 시간 가능해요.",
        options: [
          { label: "그게 진짜 좋겠어요", next: 3, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "다도는 빨리 익히는 게 아니에요. 한 잔 한 잔 마시다 보면 어느 날 마음이 가라앉아요. 그게 다도예요.",
        options: [
          { label: "그 느낌 진짜 필요해요", traits: ["집돌이형", "자연탐험형"] },
        ],
      },
    ],
  },

  {
    id: "jindo-market",
    title: "진도 5일장 둘러보기",
    icon: "🛒",
    category: "관계형성형",
    mode: "map-dialogue",
    reward: 15,
    background: "market",
    npc: { name: "5일장 단골", emoji: "🧓" },
    description: "2·7일에 열리는 진도 5일장 — 섬의 진짜 일상",
    dialogues: [
      {
        npc:
          "어머, 처음 보는 얼굴이에요. 진도 5일장은 2일, 7일에 열려요. 작지만 정겨워요. 뭐 보러 오셨어요?",
        options: [
          { label: "그냥 분위기 보러요", next: 1, traits: ["집돌이형", "자연탐험형"] },
          { label: "특산물 보고 싶어요", next: 2, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "천천히 한 바퀴 돌아봐요. 어르신들이 정말 친절해요. 안 사도 괜찮으니까 인사만 해도 동네 사람 돼요.",
        options: [
          { label: "그런 정 좋아해요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "진도 흑미, 진도 멸치, 진도 매생이. 다른 데랑 진짜 달라요. 한 봉지씩 사가서 한 달 두고 먹어요.",
        options: [
          { label: "한 달 살 거리 되겠네요", next: 3, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "5일에 한 번 오는 게 진도 사람들 일상의 리듬이에요. 그 리듬에 맞춰 살면 마음이 편해져요.",
        options: [
          { label: "그 리듬이 부럽네요", traits: ["집돌이형"] },
        ],
      },
    ],
  },

  {
    id: "jindo-dog",
    title: "진돗개 보러 가기",
    icon: "🐕",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "진돗개 사육사", emoji: "👨‍🌾" },
    description: "천연기념물 진돗개를 가까이서",
    dialogues: [
      {
        npc:
          "진돗개 시험연구소에 천연기념물 진돗개 100마리 정도 있어요. 무료 입장이고 30분 정도 보면 충분해요.",
        options: [
          { label: "진돗개 가까이서 보고 싶어요", next: 1, traits: ["집돌이형", "자연탐험형"] },
          { label: "산책 시간도 있나요?", next: 2, traits: ["레저형", "집돌이형"] },
        ],
      },
      {
        npc:
          "케이지 너머로 보는데, 진짜 똑똑한 눈빛이에요. 외부인 한참 지켜봐요. 그 눈 마주치면 잊혀지지 않아요.",
        options: [
          { label: "그 느낌 진짜 궁금하네요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "산책 체험은 안 돼요. 보호 동물이라서요. 다만 진돗개 키우는 동네 분들 있어서 거기서 만나 볼 수는 있어요.",
        options: [
          { label: "동네에서 자연스럽게 만나면 좋겠어요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "진도 사람들은 거의 진돗개 한 마리씩 키워요. 동네 산책 가면 같이 인사하는 진돗개 천지예요.",
        options: [
          { label: "그런 동네 풍경 좋네요", traits: ["집돌이형", "자연탐험형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 정선 — 집돌이형 (4개)
// =====================================================================
export const jeongseonMissions: Mission[] = [
  {
    id: "jeongseon-market",
    title: "정선 5일장 체험",
    icon: "🛒",
    category: "생활현실형",
    mode: "map-dialogue",
    reward: 8,
    background: "market",
    npc: { name: "5일장 어르신", emoji: "🧓" },
    description: "전국 5일장 중 가장 유명한 곳 — 2·7일",
    dialogues: [
      {
        npc:
          "정선 5일장은 우리나라에서 가장 유명한 5일장이에요. 2일·7일에 열리고, 산나물·곤드레·황기 같은 강원도 특산물이 많아요.",
        options: [
          { label: "도시랑 가격이 많이 달라요?", next: 1, traits: ["집돌이형", "자연탐험형"] },
          { label: "구경만 해도 좋겠어요", next: 2, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "산나물은 도시 절반 가격이에요. 5월·6월에 막 캔 나물이 나와요. 한 봉지에 5천원 정도 하니까 한 달 식비 확 줄어요.",
        options: [
          { label: "그런 절약 진짜 좋아요", next: 3, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "메밀전·곤드레밥 같은 정선 음식 맛볼 수 있어요. 5천원에 한 끼 해결되고, 어르신들 이야기까지 듣고 가요.",
        options: [
          { label: "그런 한 끼 좋겠네요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "5일장 다녀오는 게 정선 사람들 가장 큰 일과예요. 외지인 와도 똑같이 대해줘요. 한 번 가면 또 가게 돼요.",
        options: [
          { label: "단골 어른들 만들고 싶어요", traits: ["집돌이형"] },
        ],
      },
    ],
  },

  {
    id: "jeongseon-cave",
    title: "화암동굴 탐방",
    icon: "🕳️",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "library",
    npc: { name: "동굴 안내자", emoji: "👨‍🔬" },
    description: "5억년 전 자연의 흔적 — 한 시간 산책",
    realRoadview: [
      "https://picsum.photos/seed/jeongseon-cave-depart/800/600",
      "https://picsum.photos/seed/jeongseon-cave-alley/800/600",
      "https://picsum.photos/seed/jeongseon-cave-approach/800/600",
      "https://picsum.photos/seed/jeongseon-cave-arrive/800/600",
    ],
    dialogues: [
      {
        npc:
          "화암동굴은 5억 년 된 석회동굴이에요. 동굴 안 온도가 사계절 13도. 여름엔 시원하고 겨울엔 따뜻해요.",
        options: [
          { label: "여름 더위 피하기 좋겠어요", next: 1, traits: ["집돌이형", "레저형"] },
          { label: "혼자 둘러보고 싶어요", next: 2, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "한 시간 코스고, 그 안에서 정말 시간이 멈춰요. 종유석·석순·지하수가 다 살아 있어요.",
        options: [
          { label: "그 자연의 시간 좋네요", next: 3, traits: ["자연탐험형", "집돌이형"] },
        ],
      },
      {
        npc:
          "평일 오전엔 정말 한가해요. 입구에서 5천원에 표 받고 들어가서 혼자 한 시간 돌아도 돼요.",
        options: [
          { label: "혼자만의 시간이 진짜 좋아요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "동굴 나와서 산막 카페에서 따뜻한 차. 그게 정선의 오후예요. 도시에서 잃어버린 시간 감각이 돌아와요.",
        options: [
          { label: "그 시간 진짜 필요했어요", traits: ["집돌이형", "자연탐험형"] },
        ],
      },
    ],
  },

  {
    id: "jeongseon-quiet",
    title: "산속 한 시간 명상",
    icon: "🧘",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 10,
    background: "home",
    npc: { name: "산막 주인", emoji: "🧓" },
    description: "외부와 단절된 산속, 마음만 비우는 한 시간",
    dialogues: [
      {
        npc:
          "정선엔 산막이 많아요. 화암동굴 위쪽 산막에 가면 정말 아무 소리도 안 나요. 명상 한 시간 추천해요.",
        options: [
          { label: "그런 단절 진짜 필요해요", next: 1, traits: ["집돌이형", "자연탐험형"] },
          { label: "명상은 어렵게 느껴져요", next: 2, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "산막에 도착하면 휴대폰 끄고 한 시간 그냥 앉아 있어요. 처음엔 답답한데 30분쯤 지나면 마음이 가라앉아요.",
        options: [
          { label: "그 시간을 일상으로 만들고 싶어요", next: 3, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "명상이 어려우면 그냥 책 읽거나 글 써도 돼요. 산막은 그저 외부와 단절된 공간일 뿐이에요. 그 단절이 핵심이에요.",
        options: [
          { label: "글 쓰기엔 진짜 좋겠어요", next: 3, traits: ["집돌이형", "디지털노마드형"] },
        ],
      },
      {
        npc:
          "정선은 그런 동네예요. 빠른 게 없어요. 빠르게 살던 사람이 와서 천천히 사는 걸 배우는 곳이에요.",
        options: [
          { label: "그걸 배우러 왔어요", traits: ["집돌이형"] },
        ],
      },
    ],
  },

  {
    id: "jeongseon-hanok-tea",
    title: "한옥 다도 체험",
    icon: "🍵",
    category: "관계형성형",
    mode: "dialogue",
    reward: 15,
    background: "home",
    npc: { name: "한옥 다도 선생", emoji: "🧓" },
    description: "정선 한옥에서 다도 한 시간 + 이야기",
    dialogues: [
      {
        npc:
          "정선 한옥에서 다도 체험 30년 했어요. 차 한 잔 같이 마시면서 정선 이야기도 같이 나눠요.",
        options: [
          { label: "차 잘 모르는데 괜찮을까요?", next: 1, traits: ["집돌이형"] },
          { label: "이야기 듣고 싶어요", next: 2, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "모르셔도 괜찮아요. 그게 다도예요. 함께 마시는 것 그 자체가 다도예요. 격식 따지지 마요.",
        options: [
          { label: "마음 편하네요", next: 3, traits: ["집돌이형"] },
        ],
      },
      {
        npc:
          "정선 사람이 어떻게 살아왔는지, 왜 여기를 떠나지 않는지. 그런 이야기를 차 한 잔과 같이 나눠요. 한 시간이 짧아요.",
        options: [
          { label: "그런 이야기 진짜 듣고 싶어요", next: 3, traits: ["집돌이형", "자연탐험형"] },
        ],
      },
      {
        npc:
          "정선은 머무는 사람이 가져가는 게 많은 동네예요. 차 한 잔, 이야기 한 토막. 그게 평생 남아요.",
        options: [
          { label: "그런 시간 만들고 싶어요", traits: ["집돌이형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 🌊 영덕 뚜벅이마을 — 천천히 걷기 (sea / alone_rest)
// =====================================================================
const yeongdeokMissions: Mission[] = [
  {
    id: "yeongdeok-blueroad",
    title: "블루로드 첫 구간 걷기",
    icon: "🥾",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "뚜벅이마을 호스트", emoji: "🥾" },
    description: "동해안 트레킹 명소 — 천천히 걷기 시작",
    // 카카오 로드뷰 임베드 좌표 — 강구항 (블루로드 1코스 시점)
    kakaoPosition: { lat: 36.3625, lng: 129.3938 },
    dialogues: [
      {
        npc: "영덕 블루로드는 64km 동해안 도보 코스예요. 강구에서 시작해 고래불해변까지 이어져요. 한 번에 다 못 걸어요. 천천히, 조금씩 걷는 게 뚜벅이 라이프예요.",
        options: [
          { label: "오늘은 한 구간만 걸어볼게요", next: 1, traits: ["자연탐험형"] },
          { label: "한 번에 다 걷고 싶은데요", next: 1, traits: ["레저형"] },
        ],
      },
      {
        npc: "조급할 필요 없어요. 동해 바람 맞으면서 한 시간씩 천천히 걷다 보면, 도시에서 쌓인 게 다 날아가요. 마을 사람들 인사 받으면서 걷는 게 진짜예요.",
        options: [
          { label: "그런 시간이 필요했어요", traits: ["자연탐험형", "집돌이형"] },
          { label: "걸으면서 마음도 정리되겠네요", traits: ["자연탐험형"] },
        ],
      },
    ],
  },
  {
    id: "yeongdeok-walking-day",
    title: "차 없는 하루 살아보기",
    icon: "🚶",
    category: "생활현실형",
    mode: "dialogue",
    reward: 8,
    background: "transit",
    npc: { name: "정착 청년", emoji: "🧑" },
    description: "차 없이 영덕에서 일상 보내기",
    dialogues: [
      {
        npc: "저도 도시에서 차 없이 살아본 적 없었거든요. 처음엔 답답했는데 영덕에서는 모든 게 걸어서 닿아요. 시장도 우체국도 카페도 10분 안에요.",
        options: [
          { label: "그게 가능하다니 신기해요", next: 1, traits: ["자연탐험형"] },
          { label: "정말 시내까지 다 걸어가요?", next: 1, traits: ["집돌이형"] },
        ],
      },
      {
        npc: "시내는 좀 멀어요. 한 달에 두세 번 일 있을 때만 버스 타요. 동네 안은 무조건 걸어요. 자전거 없는 사람도 많아요. 발이 그냥 익숙해져요.",
        options: [
          { label: "걷는 게 일상이 되겠네요", traits: ["자연탐험형", "집돌이형"] },
          { label: "차 한 대는 있어야 마음 편할 것 같아요", traits: ["디지털노마드형", "레저형"] },
        ],
      },
    ],
  },
  {
    id: "yeongdeok-daege",
    title: "강구항에서 대게 한 마리",
    icon: "🦀",
    category: "관계형성형",
    mode: "map-dialogue",
    reward: 10,
    background: "market",
    npc: { name: "강구항 어부", emoji: "🧓" },
    description: "강구항 대게 — 영덕의 대표 음식",
    // 카카오 로드뷰 임베드 좌표 — 강구항 대게거리
    kakaoPosition: { lat: 36.3680, lng: 129.3936 },
    dialogues: [
      {
        npc: "강구항은 새벽 4시부터 어선이 들어와요. 대게철이 11월부터 5월까지예요. 그때는 전국에서 사람 와요. 비철엔 한가하고 좋아요.",
        options: [
          { label: "비철에 와서 한적할 때 보고 싶어요", next: 1, traits: ["집돌이형", "자연탐험형"] },
          { label: "대게철 활기 느껴보고 싶어요", next: 1, traits: ["레저형"] },
        ],
      },
      {
        npc: "한 번 단골 식당 정해두면 사장님이 얼굴 기억해요. 식사 끝나고 항구 한 바퀴 도는 게 영덕 사람들 일상이에요.",
        options: [
          { label: "단골 만들고 싶어요", traits: ["레저형", "자연탐험형"] },
          { label: "그 일상이 부럽네요", traits: ["집돌이형"] },
        ],
      },
    ],
  },
  {
    id: "yeongdeok-sunrise",
    title: "해맞이공원에서 멍 때리기",
    icon: "🌅",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 12,
    background: "neighbor",
    npc: { name: "동네 산책자", emoji: "👵" },
    description: "동해 일출 + 풍력단지 풍경",
    // 카카오 로드뷰 임베드 좌표 — 영덕 해맞이공원 (창포말등대 인근)
    kakaoPosition: { lat: 36.4172, lng: 129.4222 },
    dialogues: [
      {
        npc: "해맞이공원은 영덕에서 일출 가장 잘 보이는 곳이에요. 풍력발전기들도 함께 보여요. 거대한 날개가 천천히 돌아가는 풍경, 한 번 보면 잊을 수 없어요.",
        options: [
          { label: "그 풍경 진짜 보고 싶어요", next: 1, traits: ["자연탐험형"] },
          { label: "풍력단지가 일상에 있다니", next: 1, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc: "거기 벤치에 앉아서 한 시간씩 멍 때리는 분이 많아요. 도시에서 받은 자극이 거기서 다 빠져나가요.",
        options: [
          { label: "그런 시간이 진짜 필요해요", traits: ["자연탐험형", "집돌이형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 🏔 영월 밭멍 — 퍼머컬처·비움 (mountain / alone_rest)
// =====================================================================
const yeongwolMissions: Mission[] = [
  {
    id: "yeongwol-leaf-garden",
    title: "하늘에서 보이는 나뭇잎밭",
    icon: "🍃",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "neighbor",
    npc: { name: "밭멍 호스트", emoji: "🌱" },
    description: "옛 공장 자리에 그려진 나뭇잎 모양 밭",
    // 카카오 로드뷰 임베드 좌표 — 영월읍 외곽 도로변 (밭멍 정확 위치 미상, 영월 풍경으로 대체)
    kakaoPosition: { lat: 37.1850, lng: 128.4640 },
    dialogues: [
      {
        npc: "여기 보이는 게 밭멍의 '나뭇잎밭'이에요. 옛 절임배추공장이랑 메주공장 자리예요. 위에서 보면 진짜 나뭇잎 모양이에요. 땅에서는 잘 안 보여요.",
        options: [
          { label: "공장 자리가 밭이 됐다니 신기해요", next: 1, traits: ["자연탐험형"] },
          { label: "왜 나뭇잎 모양이에요?", next: 1, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc: "퍼머컬처 설계예요. 보행로엔 낮은 클로버, 그 옆에 메리골드(벌레 쫓는 꽃), 컴프리(영양분 끌어올림). 다 의미가 있어요. 자연이 스스로 자라요.",
        options: [
          { label: "자연을 따라 짓는 거네요", traits: ["자연탐험형"] },
          { label: "한 번 직접 걸어보고 싶어요", traits: ["자연탐험형", "집돌이형"] },
        ],
      },
    ],
  },
  {
    id: "yeongwol-permaculture",
    title: "퍼머컬처 첫 수업",
    icon: "🌾",
    category: "관계형성형",
    mode: "dialogue",
    reward: 12,
    background: "office",
    npc: { name: "PDC 강사", emoji: "🧑‍🌾" },
    description: "경운 없는 농법 철학",
    dialogues: [
      {
        npc: "퍼머컬처(Permaculture)는 땅을 '갈지' 않아요. 관행농업은 땅을 갈아 부드럽게 만드는데, 그게 토양 생태를 망쳐요. 우리는 그냥 둬요.",
        options: [
          { label: "갈지 않아도 자라나요?", next: 1, traits: ["디지털노마드형"] },
          { label: "지구에 무해한 농법이네요", next: 1, traits: ["자연탐험형"] },
        ],
      },
      {
        npc: "겨울이 흙을 부드럽게 만들어요. 만물이 잠드는 계절을 지나면 봄에 자생력이 깨어나요. 사람이 강제로 힘 가하는 게 아니라, 땅이 스스로 회복해요.",
        options: [
          { label: "이런 농법이 있다니", traits: ["자연탐험형"] },
          { label: "여기서 배워보고 싶어요", traits: ["디지털노마드형"] },
        ],
      },
    ],
  },
  {
    id: "yeongwol-social-garden",
    title: "사회적 밭 함께 만들기",
    icon: "🌻",
    category: "관계형성형",
    mode: "dialogue",
    reward: 10,
    background: "neighbor",
    npc: { name: "동료 청년 농부", emoji: "👩‍🌾" },
    description: "주민들과 함께 짓는 밭",
    dialogues: [
      {
        npc: "첫 해 나뭇잎밭은 식용작물로 채웠어요. 다 못 먹어서 아쉬웠어요. 그래서 이듬해는 약용식물이랑 꽃들로 바꿨어요. 주민들도 보러 오시고요.",
        options: [
          { label: "주민들과 함께 짓는 거네요", next: 1, traits: ["레저형"] },
          { label: "혼자만 갖는 게 아니라 좋네요", next: 1, traits: ["자연탐험형"] },
        ],
      },
      {
        npc: "여기서는 '동료'가 필요해요. 농사가 혼자선 안 돼요. 같이 손 모으고, 같이 수확하고, 같이 나눠요. 그게 청년마을 컨셉이에요.",
        options: [
          { label: "그런 동료가 그리웠어요", traits: ["레저형", "자연탐험형"] },
          { label: "함께 짓는 의미가 크네요", traits: ["레저형"] },
        ],
      },
    ],
  },
  {
    id: "yeongwol-batmeong",
    title: "밭에서 진짜 멍 때리기",
    icon: "🌅",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 12,
    background: "neighbor",
    npc: { name: "이었던 대표", emoji: "👩" },
    description: "비움의 경험 — 산·하늘·바람",
    dialogues: [
      {
        npc: "산과 밭, 하늘과 흙, 볕과 바람. 밭멍의 슬로건이에요. 여기서는 그냥 멍 때리는 게 일상이에요. 도시에서는 그 시간이 없잖아요.",
        options: [
          { label: "그 시간이 진짜 필요했어요", next: 1, traits: ["자연탐험형", "집돌이형"] },
          { label: "멍 때리기가 일이 되는 곳", next: 1, traits: ["집돌이형"] },
        ],
      },
      {
        npc: "비움이 채움이에요. 머리 비우면 보이는 게 달라져요. 흙 만져보고, 바람 들어보고, 볕 받아보고. 그게 다예요.",
        options: [
          { label: "그런 단순함이 그리웠어요", traits: ["자연탐험형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 🏔 무주 산타지 — 산골 판타지 (mountain / alone_make)
// =====================================================================
const mujuMissions: Mission[] = [
  {
    id: "muju-school",
    title: "비워진 폐교에 발걸음",
    icon: "🏫",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "library",
    npc: { name: "산타지 호스트", emoji: "🌳" },
    description: "무풍면 폐교 — 비워진 건물에 청년 상상력 채우기",
    // 카카오 로드뷰 임베드 좌표 — 무풍면사무소 인근 (산타지 폐교 정확 위치 미상, 무풍면 풍경으로 대체)
    kakaoPosition: { lat: 35.9606, lng: 127.8175 },
    dialogues: [
      {
        npc: "여기가 산타지 폐교예요. 무풍면 외진 산골에 있어요. 학교는 닫혔지만 건물은 살아 있어요. 청년들이 들어와서 채워가는 중이에요.",
        options: [
          { label: "비워진 공간이 매력이네요", next: 1, traits: ["디지털노마드형"] },
          { label: "산골 한가운데 폐교라니", next: 1, traits: ["자연탐험형"] },
        ],
      },
      {
        npc: "도시의 속도에서 벗어난 시간이에요. 산이 둘러싸고 있어서 자기 호흡으로 살게 돼요. 폐교 안에서 작업하고, 밖에 나가서 산 보고.",
        options: [
          { label: "그런 환경에서 작업하면 좋겠어요", traits: ["디지털노마드형"] },
          { label: "산골에서의 판타지같아요", traits: ["자연탐험형"] },
        ],
      },
    ],
  },
  {
    id: "muju-jeongchak",
    title: "정착 요정의 이야기",
    icon: "🧚",
    category: "관계형성형",
    mode: "dialogue",
    reward: 12,
    background: "cafe",
    npc: { name: "서선아 대표", emoji: "👩" },
    description: "여성 귀농인 리더의 정착 이야기",
    dialogues: [
      {
        npc: "안녕하세요, 산타지 대표 서선아예요. 사람들이 저를 '정착 요정'이라고 불러요. 청년이 무풍면 정착하려면 도와줄 게 많아요.",
        options: [
          { label: "정착이 그렇게 어렵나요?", next: 1, traits: ["디지털노마드형"] },
          { label: "도와주는 사람 있으면 든든하겠어요", next: 1, traits: ["집돌이형"] },
        ],
      },
      {
        npc: "혼자 시골에 들어오면 정말 외로워요. 동네 사람 얼굴 익히는 데 시간 걸리고, 행정 절차도 어렵고. 산타지는 그 모든 걸 함께 해요.",
        options: [
          { label: "그런 손길이 그리웠어요", traits: ["집돌이형", "디지털노마드형"] },
          { label: "정착하려면 동료가 필요하네요", traits: ["레저형"] },
        ],
      },
    ],
  },
  {
    id: "muju-sangol-walk",
    title: "무풍면 산골 한 바퀴",
    icon: "🏔",
    category: "감정/분위기형",
    mode: "map-dialogue",
    reward: 10,
    background: "neighbor",
    npc: { name: "동네 어르신", emoji: "🧓" },
    description: "덕유산 자락 산골 풍경",
    // 카카오 로드뷰 임베드 좌표 — 무풍면 다른 도로변 (덕유산 자락 산골 풍경 의도)
    kakaoPosition: { lat: 35.9650, lng: 127.8230 },
    dialogues: [
      {
        npc: "무풍은 깊은 산골이에요. 덕유산 자락이에요. 새벽엔 안개가 산 사이로 흐르고, 저녁엔 별이 쏟아져요. 도시 사람들 처음 오면 너무 조용해서 놀라요.",
        options: [
          { label: "그 조용함이 좋아요", next: 1, traits: ["자연탐험형", "집돌이형"] },
          { label: "별 보러 가고 싶어요", next: 1, traits: ["자연탐험형"] },
        ],
      },
      {
        npc: "여기 살면 시간 흐름이 달라져요. 하늘 보고, 산 보고, 흙 만지고. 그러다 보면 하루가 어떻게 가는지 몰라요. 도시에선 못 누리는 시간이에요.",
        options: [
          { label: "그런 시간이 그리웠어요", traits: ["자연탐험형"] },
        ],
      },
    ],
  },
  {
    id: "muju-myseat",
    title: "폐교 안에 내 자리 만들기",
    icon: "🪑",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 12,
    background: "home",
    npc: { name: "산타지 운영진", emoji: "🧑‍🎨" },
    description: "비워둔 공간에 내 흔적 더하기",
    dialogues: [
      {
        npc: "산타지는 '완성형'이 아니에요. 머무는 사람마다 다른 모습이에요. 한 청년이 작업실로 쓰고, 다음엔 카페로 바뀌고. 비워둔 공간이라 변신해요.",
        options: [
          { label: "내 색깔로 채우고 싶어요", next: 1, traits: ["디지털노마드형"] },
          { label: "다음 사람을 위해 비워두는 거네요", next: 1, traits: ["자연탐험형"] },
        ],
      },
      {
        npc: "그래서 산타지는 살아 있어요. 사람이 바뀔 때마다 공간도 바뀌어요. 당신 차례가 오면, 어떤 공간으로 만들 거예요?",
        options: [
          { label: "조용한 작업실이요", traits: ["디지털노마드형", "집돌이형"] },
          { label: "사람들 모이는 곳이요", traits: ["레저형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 🌾 세종 농땡이월드 — 농사+문화 (field / together_rest)
// =====================================================================
const sejongMissions: Mission[] = [
  {
    id: "sejong-kitchen-garden",
    title: "키친가든에서 농땡이",
    icon: "🥬",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "market",
    npc: { name: "농땡이월드 호스트", emoji: "🌾" },
    description: "직접 재배·바로 요리하는 호주식 셰프 컨셉",
    // 카카오 로드뷰 임베드 좌표 — 세종 연동면사무소 인근 (농땡이월드 정확 위치 미상, 농촌 풍경으로 대체)
    kakaoPosition: { lat: 36.5408, lng: 127.3128 },
    dialogues: [
      {
        npc: "농땡이월드 키친가든이에요. 호주식이에요 — 농사 짓는 셰프 컨셉. 직접 키운 채소로 바로 요리해요. 5월부터 감자 캐고, 7월에 땡초, 9월에 전부치기 해요.",
        options: [
          { label: "직접 키워서 바로 먹는 거 신기해요", next: 1, traits: ["자연탐험형"] },
          { label: "농사 셰프라니, 멋지네요", next: 1, traits: ["레저형"] },
        ],
      },
      {
        npc: "농땡이 부린다고 게으른 거 아니에요. 농사가 얼마나 부지런해야 하는데요. 그저 농촌에서 '땡잡는' 거예요 — 좋은 일 만나는 거요.",
        options: [
          { label: "농촌이 땡기네요", traits: ["레저형", "자연탐험형"] },
          { label: "농사 짓는 일상 부러워요", traits: ["자연탐험형"] },
        ],
      },
    ],
  },
  {
    id: "sejong-moonlight",
    title: "달빛레시피 함께 먹기",
    icon: "🌙",
    category: "관계형성형",
    mode: "dialogue",
    reward: 12,
    background: "cafe",
    npc: { name: "농킴", emoji: "🧑‍🍳" },
    description: "달빛바비큐 — 농촌의 사회망",
    dialogues: [
      {
        npc: "안녕하세요, 농킴이에요. 농땡이월드 생산기획팀장이에요. 달빛레시피 시식회 잘 오셨어요. 오늘 메뉴는 직접 키운 땡초로 만든 땡초버거예요.",
        options: [
          { label: "버거에 땡초가 들어가요?", next: 1, traits: ["레저형"] },
          { label: "직접 키운 재료라니 기대돼요", next: 1, traits: ["자연탐험형"] },
        ],
      },
      {
        npc: "땡초가 매운 풋고추 같은 거예요. 여기 사람들과 같이 먹는 게 진짜예요. 혼자 먹는 음식이랑 달라요. 농촌의 사회망이 음식에서 시작해요.",
        options: [
          { label: "그런 분위기 좋네요", traits: ["레저형"] },
          { label: "같이 먹는 게 진짜 식사네요", traits: ["레저형", "자연탐험형"] },
        ],
      },
    ],
  },
  {
    id: "sejong-farmer-calendar",
    title: "농부의 달력 한 페이지",
    icon: "📅",
    category: "생활현실형",
    mode: "dialogue",
    reward: 8,
    background: "office",
    npc: { name: "농땡이월드 운영진", emoji: "🧑‍🌾" },
    description: "월별 문화농사 십오야 이야기",
    dialogues: [
      {
        npc: "농촌은 도시랑 달리 계절에 맞춰 살아요. 5월 감자, 7월 땡초, 8월 신서유기, 9월 명절 전부치기, 10월 가래떡. 매달 다른 콘텐츠가 있어요.",
        options: [
          { label: "달마다 다른 일상이라니 재밌어요", next: 1, traits: ["자연탐험형"] },
          { label: "지금이 무슨 달인가요?", next: 1, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc: "달력 따라가다 보면 1년이 어떻게 가는지 모를 정도예요. 도시 달력이랑 농촌 달력은 완전 다른 시간이에요.",
        options: [
          { label: "농촌 달력 따라 살고 싶어요", traits: ["자연탐험형"] },
        ],
      },
    ],
  },
  {
    id: "sejong-gobok",
    title: "고복저수지 메기매운탕",
    icon: "🍜",
    category: "관계형성형",
    mode: "map-dialogue",
    reward: 10,
    background: "market",
    npc: { name: "메기집 사장님", emoji: "👩‍🍳" },
    description: "동네에서 가장 유명한 단골집",
    // 카카오 로드뷰 임베드 좌표 — 고복저수지 식당가
    kakaoPosition: { lat: 36.5950, lng: 127.1850 },
    dialogues: [
      {
        npc: "여기 고복저수지 메기매운탕이에요. 동네에서 가장 유명한 집이에요. 청년마을 사람들도 자주 와요. 매운탕에 청양고추 더 넣어도 돼요?",
        options: [
          { label: "매운 거 좋아해요!", next: 1, traits: ["레저형"] },
          { label: "보통 맛으로 부탁드려요", next: 1, traits: ["집돌이형"] },
        ],
      },
      {
        npc: "여기 단골 되면 청양고추 얼마나 넣을지 자동으로 알아요. 세종은 청년 이주민 많아서, 우리도 그분들 다 알아요.",
        options: [
          { label: "단골 가게가 있는 일상", traits: ["레저형"] },
          { label: "그런 거리감이 좋아요", traits: ["집돌이형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 🌾 의성 나만의-성 — 로컬프러너 (field / together_make)
// =====================================================================
const uiseongMissions: Mission[] = [
  {
    id: "uiseong-geumgang",
    title: "옛 여관 금강장 도착",
    icon: "🏨",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "home",
    npc: { name: "현지인 페이스메이커", emoji: "🧑" },
    description: "옛 여관이 청년 주거공간으로 변신",
    // 카카오 로드뷰 임베드 좌표 — 의성역 인근 (금강장 정확 위치 미상, 의성역 도로 풍경으로 대체)
    kakaoPosition: { lat: 36.3465, lng: 128.6975 },
    dialogues: [
      {
        npc: "금강장이라는 옛 여관이에요. 의성역 가까이 있어요. 청년들이 들어와서 주거공간으로 바꿨어요. 화장실 한쪽 벽면이 황금으로 장식돼 있어요. 부럽죠? 😁",
        options: [
          { label: "옛 여관이 청년 공간으로 바뀌다니", next: 1, traits: ["디지털노마드형"] },
          { label: "황금 화장실은 처음 들어봐요", next: 1, traits: ["레저형"] },
        ],
      },
      {
        npc: "의성은 시골빈집 수리·리모델링이 자연스러운 곳이에요. 청년마을의 전유물이라고 할 정도예요. 손때 묻은 공간이 다시 살아나요.",
        options: [
          { label: "공간을 살리는 일", traits: ["디지털노마드형", "레저형"] },
          { label: "여기서 머물러보고 싶어요", traits: ["집돌이형"] },
        ],
      },
    ],
  },
  {
    id: "uiseong-running-lab",
    title: "로컬러닝랩 첫 모임",
    icon: "💡",
    category: "관계형성형",
    mode: "dialogue",
    reward: 12,
    background: "office",
    npc: { name: "나만의성 운영진", emoji: "🧑‍💼" },
    description: "문제 발견→솔루션 개발 — 로컬프러너 양성",
    dialogues: [
      {
        npc: "로컬러닝랩이에요. 문제 발견→정의→솔루션 개발 과정이에요. 의성 동네 문제를 직접 찾아 해결해요. 노인 낙상사고, 버스정류소 더위, 보청기 수리 같은 것들.",
        options: [
          { label: "지역 문제 해결, 의미 있네요", next: 1, traits: ["레저형"] },
          { label: "직접 부딪쳐서 해보는 거네요", next: 1, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc: "여기서는 '로컬프러너'라고 불러요. 정착보다 경험을 통해 청년이 지역에서 성장하는 게 우선이에요. 같이 하면 더 빨라요.",
        options: [
          { label: "로컬프러너 한 번 해보고 싶어요", traits: ["레저형", "디지털노마드형"] },
          { label: "함께하는 사람들이 매력이에요", traits: ["레저형"] },
        ],
      },
    ],
  },
  {
    id: "uiseong-star-club",
    title: "근의 공식 — 별 관측 모임",
    icon: "⭐",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 10,
    background: "neighbor",
    npc: { name: "프러너 '근'", emoji: "🧑‍🚀" },
    description: "'별 볼 일밖에 없는' 의성의 반전 명소",
    dialogues: [
      {
        npc: "안녕하세요, 별 보는 근이에요. 의성은 '별 볼 일밖에 없는 동네'잖아요. 그래서 별 관측 모임을 만들었어요. 이름이 '근의 공식'이에요.",
        options: [
          { label: "이름이 진짜 ㅋㅋ", next: 1, traits: ["레저형"] },
          { label: "별 보러 가고 싶어요", next: 1, traits: ["자연탐험형"] },
        ],
      },
      {
        npc: "도시는 별이 안 보여요. 의성은 밤하늘이 보석이에요. 매주 만나서 같이 별 봐요. 망원경 있어도 좋고, 없으면 빌려드려요.",
        options: [
          { label: "같이 별 보는 사람들", traits: ["레저형"] },
          { label: "그런 모임이 일상이라니", traits: ["자연탐험형"] },
        ],
      },
    ],
  },
  {
    id: "uiseong-yongju",
    title: "용주밥상 단골 되기",
    icon: "🍚",
    category: "관계형성형",
    mode: "map-dialogue",
    reward: 10,
    background: "market",
    npc: { name: "용주밥상 사장님", emoji: "👵" },
    description: "마늘이 가득한 의성 백반",
    // 카카오 로드뷰 임베드 좌표 — 의성읍 도로변 (용주밥상 정확 위치 미상, 의성읍 풍경으로 대체)
    kakaoPosition: { lat: 36.3540, lng: 128.6995 },
    dialogues: [
      {
        npc: "어서와요! 의성 용주밥상이에요. 청년들이 자주 와요. 백반에 마늘이 들어가요 — 의성=마늘이에요. 정성 가득한 밑반찬이에요. 두번, 세번 드세요!",
        options: [
          { label: "마늘 정말 가득이네요", next: 1, traits: ["레저형"] },
          { label: "사장님 인심이 좋아요", next: 1, traits: ["집돌이형"] },
        ],
      },
      {
        npc: "여기 단골 되면 얼굴 보고 인사해요. 청년마을 친구들도 자주 와요. 의성 동네 사람 되는 거예요.",
        options: [
          { label: "단골이라니 좋네요", traits: ["레저형"] },
          { label: "동네 사람이 되는 거", traits: ["집돌이형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 🏘 홍성 집단지성 — 로컬스타트업 빌리지 (village / together_make)
// =====================================================================
const hongseongMissions: Mission[] = [
  {
    id: "hongseong-basecamp",
    title: "베이스 캠프 입장",
    icon: "🏕",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "office",
    npc: { name: "집단지성 운영진", emoji: "🧑‍💻" },
    description: "골목 한가운데 로컬 워커의 베이스 캠프",
    // 카카오 로드뷰 임베드 좌표 — 홍성읍 홍주성 인근 골목 (집단지성 정확 위치 미상, 홍주읍성 골목 풍경으로 대체)
    kakaoPosition: { lat: 36.6020, lng: 126.6620 },
    dialogues: [
      {
        npc: "집단지성이에요. 홍성 골목 한가운데에 있는 '로컬 워커의 베이스 캠프'예요. 여기 모인 사람들은 다 자기 브랜드, 자기 공간, 자기 업을 만들어가는 사람들이에요.",
        options: [
          { label: "로컬 창업 베이스 캠프네요", next: 1, traits: ["디지털노마드형"] },
          { label: "골목 한가운데 모임이라니", next: 1, traits: ["레저형"] },
        ],
      },
      {
        npc: "단단한 성취는 큰 결과가 아니에요. 과정을 함께 버텨내는 힘이에요. 골목에서 만들어지는 작은 변화들이 쌓여요.",
        options: [
          { label: "그 과정이 진짜 자산이네요", traits: ["디지털노마드형"] },
          { label: "함께 버티는 사람들", traits: ["레저형"] },
        ],
      },
    ],
  },
  {
    id: "hongseong-localworker",
    title: "로컬워커 한 명 만나기",
    icon: "🧑‍💼",
    category: "관계형성형",
    mode: "dialogue",
    reward: 12,
    background: "cafe",
    npc: { name: "로컬워커", emoji: "👩" },
    description: "도시에서 온 사람의 정착 이야기",
    dialogues: [
      {
        npc: "저는 작년에 서울에서 왔어요. 디자인 일했었는데, 이제 홍성 골목에서 작은 가게를 만들어가요. 처음엔 막막했는데 집단지성에 들어와서 친구 생겼어요.",
        options: [
          { label: "어떤 가게에요?", next: 1, traits: ["디지털노마드형"] },
          { label: "친구 생기는 게 큰 변화예요", next: 1, traits: ["레저형"] },
        ],
      },
      {
        npc: "원래는 작은 카페 만들고 싶었는데, 집단지성에서 다른 사람들 보면서 생각이 넓어졌어요. 지금은 카페 + 작업 공간으로 만들고 있어요.",
        options: [
          { label: "같이 있으면 시야가 넓어지네요", traits: ["레저형", "디지털노마드형"] },
        ],
      },
    ],
  },
  {
    id: "hongseong-market",
    title: "골목 마켓 함께 준비",
    icon: "🎪",
    category: "관계형성형",
    mode: "dialogue",
    reward: 10,
    background: "market",
    npc: { name: "마켓 기획자", emoji: "🧑‍🎨" },
    description: "골목 자체가 브랜드가 되는 일",
    dialogues: [
      {
        npc: "이번 주말에 골목 마켓 열어요. 집단지성 사람들이 다 같이 셀러로 참여해요. 한 분이 빵 굽고, 다른 분이 비누 만들고, 또 다른 분이 옷 팔아요.",
        options: [
          { label: "같이 만드는 시장이네요", next: 1, traits: ["레저형"] },
          { label: "어떤 상품 만들고 계세요?", next: 1, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc: "이런 마켓이 모여서 홍성 골목이 살아나요. 한 사람 가게가 아니라 골목 자체가 브랜드가 돼요. 그게 우리가 하는 일이에요.",
        options: [
          { label: "골목 자체가 브랜드", traits: ["레저형", "디지털노마드형"] },
          { label: "함께 만드는 의미가 크네요", traits: ["레저형"] },
        ],
      },
    ],
  },
  {
    id: "hongseong-achievement",
    title: "단단한 성취란",
    icon: "🪨",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 10,
    background: "office",
    npc: { name: "집단지성 대표", emoji: "🧑‍💼" },
    description: "과정을 함께 버텨내는 힘",
    dialogues: [
      {
        npc: "단단한 성취는 큰 결과가 아니에요. 골목에서 작은 변화 하나하나, 그걸 함께 버텨내는 힘이에요. 그 과정이 자산이에요.",
        options: [
          { label: "과정 중심의 가치네요", next: 1, traits: ["디지털노마드형"] },
          { label: "함께 버티는 힘이 진짜 자산", next: 1, traits: ["레저형"] },
        ],
      },
      {
        npc: "혼자 큰 성과 만드는 것보다, 여럿이 작은 성과 쌓아가는 게 오래 가요. 그게 로컬에서 일하는 방식이에요.",
        options: [
          { label: "오래 갈 일이 진짜 일이에요", traits: ["레저형"] },
        ],
      },
    ],
  },
];

// =====================================================================
// 🏘 대전 weave on 중촌 — 패션·창작 실험 (village / alone_make)
// =====================================================================
const daejeonMissions: Mission[] = [
  {
    id: "daejeon-jungchon",
    title: "중촌동 맞춤패션 거리",
    icon: "🧵",
    category: "감정/분위기형",
    mode: "map-info",
    reward: 10,
    background: "market",
    npc: { name: "weave on 호스트", emoji: "🧵" },
    description: "60년대부터 이어진 맞춤복 골목",
    // 카카오 로드뷰 임베드 좌표 — 대전 중구 중촌동 맞춤패션 특화거리
    kakaoPosition: { lat: 36.3306, lng: 127.4216 },
    dialogues: [
      {
        npc: "대전 중구 중촌동 '맞춤패션 특화거리'예요. 양복점, 한복집, 셔츠 가게가 골목 따라 줄지어 있어요. 60년대부터 있던 거리예요. 옛 손기술이 살아 있어요.",
        options: [
          { label: "역사 깊은 거리네요", next: 1, traits: ["자연탐험형"] },
          { label: "맞춤복은 처음 봐요", next: 1, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc: "weave on은 이 장인들과 청년 창작자를 연결해요. 옛 기술이랑 새로운 디자인이 만나요. 그게 weave on의 '직조'예요.",
        options: [
          { label: "장인과 청년이 만나는 거네요", traits: ["디지털노마드형"] },
          { label: "그 연결이 의미있어요", traits: ["레저형"] },
        ],
      },
    ],
  },
  {
    id: "daejeon-master",
    title: "맞춤복 장인과의 대화",
    icon: "👴",
    category: "관계형성형",
    mode: "dialogue",
    reward: 12,
    background: "market",
    npc: { name: "맞춤복 장인", emoji: "🧓" },
    description: "40년 손기술의 세계",
    dialogues: [
      {
        npc: "내 가게 40년 됐어요. 양복 한 벌 짓는 데 일주일 걸려요. 옷감 고르고, 재단하고, 박음질하고, 다림질하고. 손이 익어야 옷이 사람한테 맞아요.",
        options: [
          { label: "한 벌에 일주일이라니", next: 1, traits: ["자연탐험형"] },
          { label: "손기술의 세계군요", next: 1, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc: "요즘 청년들이 들어와서 같이 일해요. 디자인은 청년이, 손기술은 내가. 옛 거 살리는 거랑 새 거 만드는 거랑 다르지 않아요.",
        options: [
          { label: "세대를 잇는 작업이네요", traits: ["자연탐험형", "디지털노마드형"] },
        ],
      },
    ],
  },
  {
    id: "daejeon-fashion-making",
    title: "내 아이디어가 옷이 되기",
    icon: "✂️",
    category: "감정/분위기형",
    mode: "dialogue",
    reward: 12,
    background: "office",
    npc: { name: "패션메이킹 강사", emoji: "🧑‍🎨" },
    description: "AI 스케치부터 박음질까지",
    dialogues: [
      {
        npc: "패션메이킹 입문과정이에요. 본인이 그린 아이디어를 옷으로 만들어요. AI로 아이디어 스케치하고, 패턴 뽑고, 직접 박음질해요.",
        options: [
          { label: "내가 그린 게 옷이 된다니", next: 1, traits: ["디지털노마드형"] },
          { label: "AI도 쓴다니 흥미로워요", next: 1, traits: ["디지털노마드형"] },
        ],
      },
      {
        npc: "혼자가 아니에요. 다른 창작자들이 옆에서 같이 작업해요. 의상 만드는 사람, 그래픽 디자인하는 사람, 영상 찍는 사람. 영감이 흐르는 곳이에요.",
        options: [
          { label: "그 분위기에서 일해보고 싶어요", traits: ["디지털노마드형"] },
        ],
      },
    ],
  },
  {
    id: "daejeon-showcase",
    title: "콜라보 쇼케이스 참가",
    icon: "🎭",
    category: "관계형성형",
    mode: "dialogue",
    reward: 12,
    background: "office",
    npc: { name: "콘텐츠 제작자", emoji: "🎬" },
    description: "의상·예술·콘텐츠 협업 페스티벌",
    dialogues: [
      {
        npc: "weave on의 페스티벌이에요. 의상 창작자가 옷 만들고, 예술가가 퍼포먼스 하고, 콘텐츠 제작자가 영상으로 남겨요. 하나의 브랜드 콜라보예요.",
        options: [
          { label: "한 자리에 다양한 창작자가", next: 1, traits: ["디지털노마드형", "레저형"] },
          { label: "주민들도 같이 참여해요?", next: 1, traits: ["레저형"] },
        ],
      },
      {
        npc: "주민들과 함께하는 지역 축제로 마무리돼요. 청년 창작 + 동네 문화가 만나요. 혼자보다 함께 만드는 창작의 힘이에요.",
        options: [
          { label: "함께 만드는 창작", traits: ["디지털노마드형", "레저형"] },
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
  yeongdeok: yeongdeokMissions,
  yeongwol: yeongwolMissions,
  muju: mujuMissions,
  sejong: sejongMissions,
  uiseong: uiseongMissions,
  hongseong: hongseongMissions,
  daejeon: daejeonMissions,
};

// 특정 지역(residence.id)에서 풀어볼 미션 = 공통 + 지역 미션
import { commonMissions } from "./missions";
import type { TimeOfDay, MissionTier } from "./missions";

// ────────────────────────────────────────────────────────────
// Phase A — 강화도 미션 plan (3박 4일)
// 12 main (4일 × 3시간대) + 6 bonus.
// 미션 id 를 key 로 timeOfDay/tier/day 만 정의.
// missionsForResidence("ganghwa") 가 이걸로 미션 메타를 enrichment.
//
// 서사 아크 (잠시섬 모티프):
//   Day 1 — 첫인상 (도착·바다)
//   Day 2 — 관계 (사람 만나기)
//   Day 3 — 생업 (손으로 만들기)
//   Day 4 — 인프라·정착 상상·작별
//
// mailbox 미션은 제거 — 시뮬레이션 우체통은 LetterScreen 진입점으로 살아있음.
// ────────────────────────────────────────────────────────────
type MissionPlanEntry = {
  timeOfDay?: TimeOfDay;
  tier: MissionTier;
  day?: number; // 1~4 (main 만)
};

const GANGHWA_PLAN: Record<string, MissionPlanEntry> = {
  // ─── Day 1 — 첫인상 (도착·시장) ─────────
  //   아침 = 강화풍물시장 (퀄리티 가장 높은 인터랙티브 미션 — 시연 임팩트용 D1 아침으로).
  //   낮  = 갯벌, 저녁 = food.
  "ganghwa-market":      { timeOfDay: "아침", tier: "main", day: 1 }, // 1층 장보기 + 2층 밴댕이
  "ganghwa-mudflat":     { timeOfDay: "낮",   tier: "main", day: 1 },
  food:                  { timeOfDay: "저녁", tier: "main", day: 1 },

  // ─── Day 2 — 관계 (사람 만나기) ─────────
  "cheongpung-bookstore":{ timeOfDay: "아침", tier: "main", day: 2 }, // 강화 로컬 책방 — 사람 이야기
  "ganghwa-farm":        { timeOfDay: "낮",   tier: "main", day: 2 }, // 텃밭 클럽 톤
  neighbor:              { timeOfDay: "저녁", tier: "main", day: 2 }, // 사랑방 펍 톤

  // ─── Day 3 — 생업 (손으로 만들기) ───────
  "cheongpung-socheang": { timeOfDay: "아침", tier: "main", day: 3 },
  "cheongpung-yoga":     { timeOfDay: "낮",   tier: "main", day: 3 },
  "cheongpung-record":   { timeOfDay: "저녁", tier: "main", day: 3 },

  // ─── Day 4 — 인프라·정착 상상·작별 ──────
  hospital:              { timeOfDay: "아침", tier: "main", day: 4 }, // 이주 현실 톤
  "cheongpung-onsen":    { timeOfDay: "낮",   tier: "main", day: 4 },
  "ganghwa-sunset":      { timeOfDay: "저녁", tier: "main", day: 4 },

  // ─── 보너스 ─────────────────────────────
  //   기존 6개 + 향토음식 후속 2개 + food (격하). 총 9개.
  "ganghwa-dolmen":      { tier: "bonus" },
  cost:                  { tier: "bonus" },
  market:                { tier: "bonus" },
  transit:               { tier: "bonus" },
  "cheongpung-fortress": { tier: "bonus" },
  shop:                  { tier: "bonus" }, // 동네 가게 — 아침 메인이 책방으로 바뀌면서 격하
  "cheongpung-jeotguk":  { tier: "bonus" }, // 강화 향토음식 (젓국갈비) — 향토 reality anchor 보너스
  "cheongpung-eel":      { tier: "bonus" }, // 갯벌장어 — 갯벌 미션과 연결
  "cheongpung-snack":    { tier: "bonus" }, // 시장 군고구마말랭이·국화빵
};

// plan 적용 헬퍼 — 미션 객체에 timeOfDay/tier/day 메타 enrichment
function applyPlan(
  missions: Mission[],
  plan: Record<string, MissionPlanEntry>
): Mission[] {
  return missions
    .filter((m) => plan[m.id])  // plan 에 없는 미션은 제외
    .map((m) => ({ ...m, ...plan[m.id] }));
}

export function missionsForResidence(residenceId: string): Mission[] {
  const region = regionMissions[residenceId] ?? [];

  // 영월 데모 — "산골 어르신 만나기" (opener 적용된 미션) 를 1일차에 노출.
  // yeongwolMissionsOld 의 elder 데이터를 가져와 맨 앞에 prepend.
  if (residenceId === "yeongwol") {
    const elder = yeongwolMissionsOld.find((m) => m.id === "yeongwol-elder");
    if (elder) {
      return [elder, ...commonMissions, ...region];
    }
  }

  // 강화 — Phase A plan 적용 (9 main + 5 bonus). 시간대·일차·tier 자동 부여.
  if (residenceId === "ganghwa") {
    const all = [...commonMissions, ...region];
    return applyPlan(all, GANGHWA_PLAN);
  }

  return [...commonMissions, ...region];
}
