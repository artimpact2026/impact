// 강화도 한설 튜토리얼 — 안내자(한설) 대사·이미지 한 곳에 모음.
// 메인 9 미션만 라인 정의. 보너스 미션은 의도적으로 미포함.
//
// 얹는 곳 3군데:
//   · ResidenceHomeScreen — Day 1 첫 진입 환영 모달 (HANSEOL_INTRO)
//   · MissionInfoScreen   — "한설의 한마디" 섹션 (HANSEOL_MISSION_LINES[m.id])
//   · DayEndCeremonyScreen — 하루 끝 마무리 (HANSEOL_DAY_CLOSE[finishedDay])

// 임시 이미지 — 나중에 한설 전용 이미지로 교체 시 이 한 줄만 바꾸면 됨.
export const HANSEOL_IMAGE = "/mission/yoga.webp";
export const HANSEOL_NAME = "한설";

// Day 1 첫 진입 환영 인사 — 영속 1회 노출 (RegionRecord.storyIntroShown 추적)
export const HANSEOL_INTRO =
  "잘 왔어. 나는 한설, 여기 3년 차야. 나도 처음엔 '진짜 살 수 있을까' 싶었거든. 처음 며칠은 옆에 있을게. 천천히 가보자.";

// 미션 정보 화면 "한설의 한마디" 섹션 — 매번 노출.
//   배치(GANGHWA_PLAN, 3박 4일):
//     Day 1 첫인상 — shop / ganghwa-mudflat / food
//     Day 2 관계 — ganghwa-market / ganghwa-farm(텃밭 클럽) / neighbor(사랑방 펍)
//     Day 3 생업 — cheongpung-socheang / -yoga / -record
//     Day 4 인프라·작별 — hospital / cheongpung-onsen / ganghwa-sunset
//   보너스 — ganghwa-dolmen / cost / market / transit / cheongpung-fortress / -bookstore
export const HANSEOL_MISSION_LINES: Record<string, string> = {
  // === Day 1 — 첫인상 ===
  "cheongpung-bookstore":
    "첫 아침은 조용히 책방부터. 함민복 시인 같은 강화 작가들 책이 거기 다 있어. 갯벌 시 한 편 챙겨서 낮에 갯벌 갈 때 들고 가봐 — 풍경이 달라져.",
  "ganghwa-mudflat":
    "물 빠질 시간이네. 갯벌 한번 걸어봐. 나도 여기서 멍 때리다가 '아, 여기 살아도 되겠다' 했거든.",
  food:
    "저녁은 동네 카페에서 가볍게. 하루 먹는 데 얼마쯤 드나 그려보면 '아 살 만하겠네' 감 잡혀.",
  // === Day 2 — 관계 ===
  "ganghwa-market":
    "풍물시장에선 1층 순무김치 시식 꼭 해봐. 잠시섬 다녀간 분이 '쿰쿰한 순무김치에 반했다'고 글 남기고 갔거든. 밴댕이·약쑥떡도 잊지 말고.",
  "ganghwa-farm":
    "텃밭 클럽 한 번 가봐. 한 평 빌려서 흙 만져보면 그게 또 묘하게 좋아져.",
  neighbor:
    "저녁은 동네 사람 모이는 펍이 있어. 거기 가봐. 강화 온 이유 들어보면 재밌어.",
  // === Day 3 — 생업·손으로 만들기 ===
  "cheongpung-socheang":
    "소창 한 장 직접 짜봐. 손으로 뭘 만든다는 게 도시에선 잊고 산 감각이거든.",
  "cheongpung-yoga":
    "오후엔 마당뷰에서 요가. 강화 공기랑 같이 호흡하는 거, 한 번 해봐야 알아.",
  "cheongpung-record":
    "오늘 잠시섬 방명록에 한 줄. 다녀간 사람들 흔적이 다 거기에 남아. 너도 그 책장에 끼는 거고.",
  // === Day 4 — 인프라·정착 상상·작별 ===
  hospital:
    "마지막 날엔 현실도 봐야지. 병원 어디 있는지, 얼마나 걸리는지. 여기서 진짜 살 수 있을지 가늠해보는 거야.",
  "cheongpung-onsen":
    "낮엔 미네랄 온천 한 시간. 사흘 동안 쌓인 거 풀고 가. 강화 분들도 일주일에 한 번씩 와.",
  "ganghwa-sunset":
    "강화 마지막 밤이네. 노을 보러 가자. 이거 보면 왜 사람들이 여기 남는지 알 거야.",
  // === 보너스 — 시간대 가정 없는 일반 톤 ===
  "ganghwa-dolmen":
    "여유 있으면 고인돌도 가봐. 천 년 묵은 풍경이 마음을 가라앉혀.",
  cost:
    "한 달 생활비 한 번 계산해봐. 숫자가 손에 잡혀야 결정이 단단해져.",
  market:
    "풍물장 말고 가까운 시장도 한 번 들러봐. 가격표 보면 도시 감각이 슬며시 무너져.",
  transit:
    "차 없으면 어떻게 다니나 궁금하지? 직접 한번 확인해봐. 생각보다 다닐 만해.",
  "cheongpung-fortress":
    "성곽 한 바퀴 30분이면 돌아. 사람 거의 없고 길이 조용해. 혼자만의 시간 필요할 때 좋아.",
  shop:
    "여유 있으면 동네 가게 한 곳 들러봐. 사장님이랑 인사 트는 게 진짜 단골 되는 길이야.",
  "cheongpung-jeotguk":
    "강화에서 한 끼는 젓국갈비. 고려 임금이 천도했을 때 올렸던 음식이야. 새우젓으로 간 맞춰서 다른 데선 못 먹어.",
  "cheongpung-eel":
    "갯벌 한 바퀴 돌고 좀 무거우면 갯벌장어 한 끼. 세계 3대 갯벌에서 자란 장어라 살이 통통해.",
  "cheongpung-snack":
    "시장 들렀으면 강화 속노란 고구마말랭이 한 봉지 꼭 사. 갯벌 가서 노을 보며 먹으면 진짜야.",
};

// 게임식 튜토리얼 말풍선 — 정보 화면 "체험하기" 버튼 위에 짧게 띄움.
// HANSEOL_MISSION_LINES와 분리한 이유: 정보 패널 라인은 미션 동기·맥락 설명이라 길고,
// 말풍선은 행동 유도(CTA) 톤이라 짧고 단호한 카피가 적합. 시제품은 shop 1줄만 정의.
export const HANSEOL_TUTORIAL_LINES: Record<string, string> = {
  shop: "여기 눌러봐.\n동네부터 시작이야.",
};
export const HANSEOL_TUTORIAL_FALLBACK = "여기 눌러봐!";

// 시간대 안내 — 미션 완료 후 다음 시간대 탭으로 자연스럽게 넘어가게.
// 한설이 안내자처럼 아침→점심→저녁 흐름을 잡아줌. Day 1/2/3 공통.
export const HANSEOL_LUNCH_HINT = "이제 점심 시간이야.\n여기 눌러봐.";
export const HANSEOL_EVENING_HINT = "해 질 시간이야.\n저녁으로 가자.";

// 하루 끝 마무리 — day 1/2/3 별. day 3 는 작별 톤.
export const HANSEOL_DAY_CLOSE: Record<1 | 2 | 3, string> = {
  1: "첫날 잘 버텼네. 별거 아닌 것 같아도, 오늘 네가 강화랑 처음 인사한 거야. 내일 또 보자.",
  2: "이틀째인데 벌써 동네 사람 다 됐네. 슬슬 강화가 편해지지? 내일이 마지막 날이야.",
  3: "잘 가. 강화는 늘 여기 있어. 언제든 또 와. 그땐 네가 누구 안내해줄 차례야.",
};

// 강화 외 지역은 한설 튜토리얼 적용 X — 가드용 헬퍼
export const GANGHWA_ID = "ganghwa";
