// 편지함 — 마을 주민 NPC / 시스템 알림 / 커뮤니티 소식 통합 인박스
//
// 사용자 친화 설계 원칙:
//   - 모든 종류를 한 인박스에 모음(편지·알림·소식 다 같은 timeline)
//   - 시각으로만 구별: NPC 편지=warm 톤, 시스템=cool 톤, 커뮤니티=pink 톤
//   - 필터 칩으로 카테고리 빠른 전환 (전체 / 편지 / 알림 / 소식)
//   - unread 빨간 점 + BottomNav 배지로 새 소식 인지
//   - 본문은 청풍 톤(쌓이다·머무르다·자리잡다) 일관

import type { Residence } from "./residences";

// =====================================================================
// 타입
// =====================================================================

export type LetterCategory = "npc" | "system" | "community";

export type LetterTrigger =
  | "welcome"             // 첫 진입 환영
  | "arrival"             // 레지던스 도착
  | "day_complete"        // 일차 미션 모두 완료
  | "next_day"            // 다음 일차 시작
  | "report"              // 이주 리포트 생성 후
  | "booking_confirmed"   // 청년마을 예약 완료
  | "community";          // 커뮤니티 좋아요·댓글 (mock)

export type Letter = {
  id: string;
  category: LetterCategory;
  trigger: LetterTrigger;
  sender: {
    name: string;
    role?: string;
    emoji?: string;  // 아바타 폴백
  };
  title: string;
  preview: string;     // 카드 미리보기 한 줄 (~32자)
  body: string;        // 모달 본문
  createdAt: string;   // ISO timestamp
  read: boolean;
  residenceId?: string;
};

// =====================================================================
// localStorage 영속화
// =====================================================================

const STORAGE_KEY = "cheongpung.letters.v1";

export function loadLetters(): Letter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Letter[];
  } catch {
    return [];
  }
}

export function saveLetters(letters: Letter[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
  } catch {
    /* ignore */
  }
}

// =====================================================================
// 헬퍼 — id, sender
// =====================================================================

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 지역별 운영자(레지던스 대표) — NPC 편지의 주된 발신자
// 미정 지역은 generic 폴백.
const RESIDENCE_REP: Record<
  string,
  { name: string; role: string; emoji: string }
> = {
  ganghwa: { name: "민지", role: "강화도 운영자", emoji: "🌿" },
  yeongwol: { name: "지호", role: "영월 운영자", emoji: "🍃" },
  gwangyang: { name: "수민", role: "광양 운영자", emoji: "🌸" },
  geoje: { name: "유진", role: "거제 운영자", emoji: "🌊" },
  taean: { name: "도윤", role: "태안 운영자", emoji: "🏝" },
  yangyang: { name: "서연", role: "양양 운영자", emoji: "🏄" },
  jindo: { name: "한나", role: "진도 운영자", emoji: "🍵" },
  uiseong: { name: "재현", role: "의성 운영자", emoji: "🌾" },
};

function repOf(residence: Residence) {
  return (
    RESIDENCE_REP[residence.id] ?? {
      name: `${residence.region} 운영자`,
      role: `${residence.region} 청년마을`,
      emoji: residence.themeEmoji,
    }
  );
}

const SYSTEM_SENDER = {
  name: "청풍 운영팀",
  role: "운영팀",
  emoji: "🌬",
} as const;

// =====================================================================
// 팩토리 — 트리거별 편지 생성
// =====================================================================

// 첫 진입 환영 편지 — 사용자가 처음 앱 열었을 때 시드로 들어감
export function makeWelcomeLetter(): Letter {
  return {
    id: uid(),
    category: "system",
    trigger: "welcome",
    sender: { ...SYSTEM_SENDER },
    title: "청풍에 오신 걸 환영해요",
    preview:
      "잠시 다른 지역에 머물며 당신의 결을 발견하는 시간이에요. 천천히 둘러봐요.",
    body: `안녕하세요, ${SYSTEM_SENDER.name}이에요.

청풍은 "이주 결정"을 위한 도구가 아니에요. 잠시 다른 지역의 바람을 짓고, 그곳의 사람들과 시간을 쌓아가며 당신의 결을 발견하는 시뮬레이션이에요.

여러 청년마을을 둘러보고, 마음에 자리잡는 곳을 만나보세요. 마을 운영자들이 종종 편지를 보낼 거예요. 이 편지함에서 함께 모이게 돼요.

서두르지 않아도 괜찮아요. 천천히 머물러요.`,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

export function makeArrivalLetter(residence: Residence): Letter {
  const rep = repOf(residence);
  return {
    id: uid(),
    category: "npc",
    trigger: "arrival",
    sender: { name: rep.name, role: rep.role, emoji: rep.emoji },
    title: `${residence.region}에 오신 걸 환영해요`,
    preview: `반가워요. 오늘부터 며칠 동안 이곳의 바람을 함께 마셔봐요.`,
    body: `안녕하세요, ${residence.region}의 ${rep.name}이에요.

오늘부터 며칠 동안 이곳의 바람을 함께 마시게 됐네요. 처음엔 모든 게 낯설겠지만, 너무 빠르지 않게 하나씩 만나가요.

먼저 가까운 정류장과 시장 위치부터 손에 익히면 마음이 한결 편해져요. 마을 사람들이 종종 말 걸어올 거예요. 부담 갖지 말고 인사만 해도 충분해요.

자리잡는 데 시간이 걸려도 괜찮아요. 천천히 머물러요.`,
    createdAt: new Date().toISOString(),
    read: false,
    residenceId: residence.id,
  };
}

export function makeDayCompleteLetter(
  residence: Residence,
  day: number,
  doneCount: number
): Letter {
  const rep = repOf(residence);
  return {
    id: uid(),
    category: "npc",
    trigger: "day_complete",
    sender: { name: rep.name, role: rep.role, emoji: rep.emoji },
    title: `오늘 하루, 잘 보내셨어요`,
    preview: `${day}일차에 ${doneCount}개의 미션을 마치셨네요. 하루씩 자리잡는 거예요.`,
    body: `오늘 동네를 도시는 걸 봤어요. ${residence.region}의 ${day}일차였죠.

${doneCount}개의 미션을 차곡차곡 채우신 게 마음에 남아요. 이렇게 하루씩 결이 쌓이는 거예요.

푹 쉬세요. 내일은 또 다른 결의 시간이 기다리고 있어요.`,
    createdAt: new Date().toISOString(),
    read: false,
    residenceId: residence.id,
  };
}

export function makeNextDayLetter(
  residence: Residence,
  nextDay: number
): Letter {
  const rep = repOf(residence);
  return {
    id: uid(),
    category: "npc",
    trigger: "next_day",
    sender: { name: rep.name, role: rep.role, emoji: rep.emoji },
    title: `${residence.region}의 아침이에요`,
    preview: `${nextDay}일차 아침. 창문을 한 번 열어보세요.`,
    body: `어제 푹 주무셨나요?

${residence.region}의 아침은 도시와 달라요. 새벽 시장이 열리고, 동네는 이미 분주해요.

오늘의 ${nextDay}일차, 너무 많은 걸 계획하지 말고 마음 가는 한 가지부터 둘러봐요. 산책이든 시장이든.

천천히 시작해도 늦지 않아요.`,
    createdAt: new Date().toISOString(),
    read: false,
    residenceId: residence.id,
  };
}

export function makeReportLetter(residence: Residence): Letter {
  return {
    id: uid(),
    category: "npc",
    trigger: "report",
    sender: {
      name: "먼저 온 이주자",
      role: "1년 차 이주민",
      emoji: "👩",
    },
    title: `그 시간이 어땠나요`,
    preview: `${residence.region}에서의 시간이 어땠어요? 저도 그랬어요.`,
    body: `당신의 ${residence.region} 이주 리포트를 봤어요.

저도 이주 결정 전에 짧게 살아본 적이 있어요. 그때 마음에 남았던 작은 것들 — 시장 아주머니가 덤으로 주신 마늘, 산책길에 만난 강아지, 옆집 어르신의 인사 — 그것들이 지금도 결을 만들고 있어요.

리포트에 적힌 게 전부가 아니에요. 글로 옮길 수 없는 시간들이 더 깊이 자리잡아요. 당신의 시간도 그렇기를.

언제든 다시 와요. 그땐 더 깊은 곳까지 보일 거예요.`,
    createdAt: new Date().toISOString(),
    read: false,
    residenceId: residence.id,
  };
}

export function makeBookingConfirmedLetter(
  residence: Residence,
  startDate: string,
  durationMonths: number
): Letter {
  const rep = repOf(residence);
  return {
    id: uid(),
    category: "system",
    trigger: "booking_confirmed",
    sender: { ...SYSTEM_SENDER },
    title: `${residence.region} ${residence.name} 예약이 확정됐어요`,
    preview: `${startDate} 시작 · ${durationMonths}개월. 잘 다녀오세요.`,
    body: `${residence.region}의 ${residence.name} 예약이 확정됐어요.

· 시작: ${startDate}
· 기간: ${durationMonths}개월
· 운영자: ${rep.name}

자세한 도착 안내는 시작 1주일 전 별도 메일로 전달드릴게요. 짐 가볍게 챙기시고, 마음만 든든히 가져오세요.

청풍 시뮬레이션과는 또 다른 결의 시간이 기다리고 있어요. 잘 다녀오세요.`,
    createdAt: new Date().toISOString(),
    read: false,
    residenceId: residence.id,
  };
}

// 커뮤니티 mock — 데모용 가짜 알림. 실제 백엔드 연동 시 교체.
export function makeCommunityMockLetter(): Letter {
  const messages = [
    {
      sender: { name: "지호", role: "광양 1년 차", emoji: "🌸" },
      title: "당신의 강화도 미션을 보고",
      preview: "비슷한 경험이 있어서 댓글 남겨봐요.",
      body:
        "안녕하세요. 저는 광양에서 1년째 살고 있어요.\n\n당신이 답한 \"걸어가볼게요\" 같은 답을 보고, 저도 처음에 비슷했던 게 떠올랐어요. 도시 습관이 천천히 풀려가는 그 시간이 사실 가장 좋은 시간이에요.\n\n응원해요.",
    },
    {
      sender: { name: "민지", role: "강화도 거주", emoji: "🌿" },
      title: "당신의 미션 후기에 좋아요를 눌렀어요",
      preview: "강화 사람으로서 반가운 글이었어요.",
      body:
        "당신의 강화도 미션 후기를 잘 봤어요. \n\n실제로 강화도 살면서 비슷한 풍경을 자주 봐요. 글로 옮기기 어려운 그 결을 잘 잡으신 것 같아요. 또 들러주세요.",
    },
  ];
  const pick = messages[Math.floor(Math.random() * messages.length)];
  return {
    id: uid(),
    category: "community",
    trigger: "community",
    sender: pick.sender,
    title: pick.title,
    preview: pick.preview,
    body: pick.body,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

// =====================================================================
// 시드 — 첫 진입 시 빈 인박스 대신 환영 편지 + 샘플 커뮤니티 1통
// =====================================================================

export function getInitialLetters(): Letter[] {
  const welcome = makeWelcomeLetter();
  return [welcome];
}

// =====================================================================
// 헬퍼 — unread 개수, 시간 표시
// =====================================================================

export function unreadCount(letters: Letter[]): number {
  return letters.reduce((n, l) => n + (l.read ? 0 : 1), 0);
}

// "방금 전" / "10분 전" / "2시간 전" / "어제" / "3일 전" / "2026-06-04"
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return new Date(iso).toISOString().slice(0, 10);
}
