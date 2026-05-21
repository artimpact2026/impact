// 지역(레지던스)별 마을 홈 화면 텍스트 + 테마 설정
// residence.id를 키로 — 'ganghwa' | 'gwangyang' | 'geoje'

export type VillageTheme = "coastal" | "village" | "valley";

export type VillageConfig = {
  headerTitle: string;       // 헤더 좌측 — "거제 마을"
  arrivalTitle: string;      // "거제도에 도착했어요!"
  subtitle: string;          // 한 줄 부연
  signLabel: string;         // 표지판 텍스트
  speechBubble: string;      // 캐릭터 말풍선
  missionTitle: string;      // 오늘의 미션 카드 타이틀
  missionDescription: string; // 미션 설명
  progressCurrent: number;
  progressTotal: number;
  rewardShells: number;      // 🐚 보상
  rewardTickets: number;     // 🎟️ 보상
  theme: VillageTheme;       // 일러스트 테마
};

export const VILLAGE_CONFIG: Record<string, VillageConfig> = {
  geoje: {
    headerTitle: "거제 마을",
    arrivalTitle: "거제도에 도착했어요!",
    subtitle: "아름다운 섬, 거제에서의 여정이 시작됐어요.",
    signLabel: "거제도",
    speechBubble: "도착했어요! 날씨도 좋고 기분도 좋아요 :)",
    missionTitle: "오늘의 미션",
    missionDescription: "거제도의 아름다운 장소 3곳을 방문해요",
    progressCurrent: 1,
    progressTotal: 3,
    rewardShells: 50,
    rewardTickets: 1,
    theme: "coastal",
  },
  ganghwa: {
    headerTitle: "강화 마을",
    arrivalTitle: "강화도에 도착했어요!",
    subtitle: "오래된 시간과 바다가 만나는 강화에서의 하루가 시작됐어요.",
    signLabel: "강화도",
    speechBubble: "잠시 살아볼 준비 완료! 마을을 둘러볼까요?",
    missionTitle: "오늘의 미션",
    missionDescription: "강화 마을의 생활 단서 3가지를 찾아봐요",
    progressCurrent: 0,
    progressTotal: 3,
    rewardShells: 50,
    rewardTickets: 1,
    theme: "village",
  },
  gwangyang: {
    headerTitle: "광양 마을",
    arrivalTitle: "광양에 도착했어요!",
    subtitle: "매화 향이 흐르는 작은 마을에서의 하루가 시작됐어요.",
    signLabel: "광양",
    speechBubble: "여기 바람 진짜 좋네요. 천천히 둘러봐요.",
    missionTitle: "오늘의 미션",
    missionDescription: "광양 마을의 봄 향기 3가지를 모아봐요",
    progressCurrent: 0,
    progressTotal: 3,
    rewardShells: 50,
    rewardTickets: 1,
    theme: "valley",
  },
};

// 기본값 — 정의되지 않은 residence.id에 대한 fallback
export const DEFAULT_VILLAGE: VillageConfig = {
  headerTitle: "잠시섬 마을",
  arrivalTitle: "도착했어요!",
  subtitle: "새로운 마을에서의 하루가 시작됐어요.",
  signLabel: "마을",
  speechBubble: "도착했어요! 마을을 둘러볼까요?",
  missionTitle: "오늘의 미션",
  missionDescription: "마을의 단서 3가지를 찾아봐요",
  progressCurrent: 0,
  progressTotal: 3,
  rewardShells: 50,
  rewardTickets: 1,
  theme: "village",
};
