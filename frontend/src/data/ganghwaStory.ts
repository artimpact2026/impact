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
  "왔구나, 새내기. 나는 한설, 여기 3년 차야. 나도 처음엔 '진짜 살 수 있을까' 싶었어. 처음 며칠은 내가 옆에 있을게. 천천히 가보자.";

// 메인 9 미션 시작 전 한마디 — 매번 노출
export const HANSEOL_MISSION_LINES: Record<string, string> = {
  shop:
    "첫날은 거창한 거 말고 동네부터. 저 가게 사장님이랑 인사 한번 터봐. 여기선 그게 시작이야.",
  "ganghwa-mudflat":
    "물 빠질 시간이네. 갯벌 한번 걸어봐. 나도 여기서 멍 때리다가 '아, 여기 살아도 되겠다' 했거든.",
  market:
    "저녁은 시장 밥집에서. 물가 한번 봐봐. 서울이랑 얼마나 다른지 몸으로 느껴질 거야.",
  "ganghwa-market":
    "둘째 날이네. 풍물시장 가봐. 여기 사장님들 정 많아. 한 바퀴 돌다 보면 단골 생긴다?",
  "ganghwa-farm":
    "흙 한번 만져봐. 처음엔 손에 흙 묻는 게 어색한데, 그게 또 묘하게 좋아져.",
  neighbor:
    "오늘은 나 말고 다른 이주자 만나봐. 사람마다 강화 온 이유가 다르거든. 들어보면 재밌어.",
  hospital:
    "셋째 날은 현실적인 것도 봐야지. 병원 어디 있는지, 얼마나 걸리는지. 살려면 꼭 알아둬야 해.",
  transit:
    "차 없으면 어떻게 다니나 궁금하지? 직접 한번 확인해봐. 생각보다 다닐 만해.",
  "ganghwa-sunset":
    "강화 마지막 밤이네. 노을 보러 가자. 이거 보면 왜 사람들이 여기 남는지 알 거야.",
};

// 하루 끝 마무리 — day 1/2/3 별. day 3 는 작별 톤.
export const HANSEOL_DAY_CLOSE: Record<1 | 2 | 3, string> = {
  1: "첫날 잘 버텼네. 별거 아닌 것 같아도, 오늘 네가 강화랑 처음 인사한 거야. 내일 또 보자.",
  2: "이틀째인데 벌써 동네 사람 다 됐네. 슬슬 강화가 편해지지? 내일이 마지막 날이야.",
  3: "잘 가, 새내기. 강화는 늘 여기 있어. 언제든 또 와. 그땐 네가 누구 안내해줄 차례야.",
};

// 강화 외 지역은 한설 튜토리얼 적용 X — 가드용 헬퍼
export const GANGHWA_ID = "ganghwa";
