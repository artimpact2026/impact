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

// =====================================================================
// 새 청년마을 7곳 (영덕·영월·무주·세종·의성·홍성·대전)
// =====================================================================

const yeongdeokConfig: VillageConfig = {
  headerTitle: "뚜벅이마을",
  arrivalTitle: "영덕에 도착했어요!",
  subtitle: "천천히 걷고 싶은 청년의 터전, 동해 바람 사이로.",
  signLabel: "영덕",
  speechBubble: "차 없이도 다 닿아요. 천천히 걸어볼까요?",
  missionTitle: "오늘의 미션",
  missionDescription: "블루로드와 강구항을 만나봐요",
  progressCurrent: 0,
  progressTotal: 3,
  rewardShells: 50,
  rewardTickets: 1,
  theme: "coastal",
};

const yeongwolConfig: VillageConfig = {
  headerTitle: "밭멍 마을",
  arrivalTitle: "영월 밭멍에 도착했어요!",
  subtitle: "산과 밭, 하늘과 흙, 볕과 바람 사이의 시간.",
  signLabel: "영월",
  speechBubble: "잠시 멍 때려도 괜찮아요. 그게 일상이에요.",
  missionTitle: "오늘의 미션",
  missionDescription: "퍼머컬처 밭과 비움의 시간",
  progressCurrent: 0,
  progressTotal: 3,
  rewardShells: 50,
  rewardTickets: 1,
  theme: "valley",
};

const mujuConfig: VillageConfig = {
  headerTitle: "산타지 마을",
  arrivalTitle: "무주 산타지에 도착했어요!",
  subtitle: "산골의 하루가 판타지가 되는 곳.",
  signLabel: "무주",
  speechBubble: "도시의 속도에서 벗어나, 산골의 시간으로.",
  missionTitle: "오늘의 미션",
  missionDescription: "폐교에서 시작하는 산골 판타지",
  progressCurrent: 0,
  progressTotal: 3,
  rewardShells: 50,
  rewardTickets: 1,
  theme: "valley",
};

const sejongConfig: VillageConfig = {
  headerTitle: "농땡이월드",
  arrivalTitle: "세종 연서에 도착했어요!",
  subtitle: "농촌에서 땡잡는 이야기, 농촌이 땡기는 이유.",
  signLabel: "세종 연서",
  speechBubble: "키친가든에서 함께 농땡이 한 번?",
  missionTitle: "오늘의 미션",
  missionDescription: "농부의 달력과 달빛 레시피",
  progressCurrent: 0,
  progressTotal: 3,
  rewardShells: 50,
  rewardTickets: 1,
  theme: "village",
};

const uiseongConfig: VillageConfig = {
  headerTitle: "나만의-성",
  arrivalTitle: "의성에 도착했어요!",
  subtitle: "나만의 뜻을 이루어 가는 곳, 의성캠퍼스.",
  signLabel: "의성",
  speechBubble: "로컬프러너로 한번 살아볼까요?",
  missionTitle: "오늘의 미션",
  missionDescription: "금강장과 로컬러닝랩",
  progressCurrent: 0,
  progressTotal: 3,
  rewardShells: 50,
  rewardTickets: 1,
  theme: "village",
};

const hongseongConfig: VillageConfig = {
  headerTitle: "집단지성",
  arrivalTitle: "홍성에 도착했어요!",
  subtitle: "단단한 성취를 쌓아가는 로컬 워커의 베이스 캠프.",
  signLabel: "홍성",
  speechBubble: "골목에서 함께 짓는 무언가, 시작해볼까요?",
  missionTitle: "오늘의 미션",
  missionDescription: "베이스 캠프와 골목 마켓",
  progressCurrent: 0,
  progressTotal: 3,
  rewardShells: 50,
  rewardTickets: 1,
  theme: "village",
};

const daejeonConfig: VillageConfig = {
  headerTitle: "weave on 중촌",
  arrivalTitle: "대전 중촌동에 도착했어요!",
  subtitle: "패션과 창작이 만나는 골목, 옛 손기술 위에 새 디자인.",
  signLabel: "대전 중촌",
  speechBubble: "내 아이디어가 옷이 되는 경험, 해볼까요?",
  missionTitle: "오늘의 미션",
  missionDescription: "맞춤복 거리와 패션메이킹",
  progressCurrent: 0,
  progressTotal: 3,
  rewardShells: 50,
  rewardTickets: 1,
  theme: "village",
};

// Object.assign으로 새 청년마을 추가
Object.assign(VILLAGE_CONFIG, {
  yeongdeok: yeongdeokConfig,
  yeongwol: yeongwolConfig,
  muju: mujuConfig,
  sejong: sejongConfig,
  uiseong: uiseongConfig,
  hongseong: hongseongConfig,
  daejeon: daejeonConfig,
});

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
