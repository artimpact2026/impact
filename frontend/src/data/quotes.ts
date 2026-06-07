// 내 기록 — NPC 가 한 말 중 사용자가 "기억해둘래요" 한 인용구 모음.
//
// 청풍 톤:
//   · 점수/적합도 = 정량 지표
//   · 아이템 = 정성 회상
//   · 인용구 = 사용자가 *직접 고른* 회상 — 가장 능동적인 흔적
//
// 저장:
//   · localStorage `cheongpung.quotes.v1`
//   · ProfileScreen 의 "기억한 말들" 섹션에 누적 표시

const QUOTES_KEY = "cheongpung.quotes.v1";

export type SavedQuote = {
  id: string;             // 고유 id (timestamp 기반)
  text: string;           // NPC 발언 — placeholder 치환 완료된 최종 텍스트
  speaker: string;        // NPC 이름 — "5대째 영월 어르신"
  speakerEmoji: string;
  missionId: string;
  missionTitle: string;
  residenceId: string;
  residenceRegion: string; // "영월" 등
  savedAt: number;         // Unix epoch ms
};

export function loadQuotes(): SavedQuote[] {
  try {
    const raw = localStorage.getItem(QUOTES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedQuote[];
  } catch {
    return [];
  }
}

export function saveQuotes(qs: SavedQuote[]) {
  try {
    localStorage.setItem(QUOTES_KEY, JSON.stringify(qs));
  } catch {
    /* ignore */
  }
}

export const QUOTES_STORAGE_KEY = QUOTES_KEY;
