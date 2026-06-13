// 미션 완료 후 결과 카드에서 "NPC가 알려준 것들" 섹션에 표시할 정보 발췌.
// commonMissions 9개 + 일부 지역 미션 기준. dialogues의 npc 발화에서 핵심 사실만 추출.
// 향후 AI로 자동 추출 가능하게 함수 시그니처 단순 유지 (input: missionId → output: bullets).

export type MissionKeyInfo = { icon: string; text: string };

export const MISSION_KEY_INFOS: Record<string, MissionKeyInfo[]> = {
  // ── 공통 미션 ──────────────────────────────
  hospital: [
    { icon: "🏥", text: "종합병원까지 도보 12분, 약 850m" },
    { icon: "🕐", text: "응급실 24시간 운영" },
    { icon: "💊", text: "병원 바로 옆에 약국" },
    { icon: "🚌", text: "버스 한 정류장, 단 배차는 35분" },
  ],
  market: [
    { icon: "🍚", text: "동네 백반 한 끼 7천원 (도시의 절반)" },
    { icon: "🚫", text: "배달이 거의 없어 직접 가서 먹어야 함" },
    { icon: "🥬", text: "시장 채소·생선은 30% 저렴" },
    { icon: "🕔", text: "시장은 오후 5시면 절반 마감" },
  ],
  cost: [
    { icon: "🏠", text: "1인 월세 25~40만원, 관리비 5만원" },
    { icon: "💰", text: "월 평균 80만원 (도시의 약 절반)" },
    { icon: "🚗", text: "차 유지비는 별도 +월 15만원" },
    { icon: "🍴", text: "외식·여가는 도시의 60% 수준" },
  ],
  transit: [
    { icon: "🚌", text: "시내 버스 배차 35분, 막차 21:30" },
    { icon: "🚄", text: "KTX역 차로 40분, 공항 1시간 30분" },
    { icon: "🚲", text: "동네 안은 자전거로 다 닿음" },
    { icon: "⏰", text: "출퇴근 시간이 없어지는 게 가장 큰 변화" },
  ],
  routine: [
    { icon: "🌅", text: "7시쯤 일어나면 동네는 이미 분주" },
    { icon: "🛒", text: "새벽 시장이 가장 활기참" },
    { icon: "💬", text: "오후 5시쯤 사람들이 마실 나옴" },
    { icon: "🌙", text: "밤 10시면 동네 전체가 잠듦" },
  ],
  food: [
    { icon: "🍱", text: "동네 한 끼 평균 9,500원" },
    { icon: "📊", text: "도시 14,000원 대비 약 30% 저렴" },
    { icon: "🥘", text: "직접 해 먹으면 월 10~15만원 절약" },
  ],
  shop: [
    { icon: "🏪", text: "30년 넘게 한 자리에 있는 가게" },
    { icon: "👋", text: "안 사도 인사만으로 동네 사람 됨" },
    { icon: "📅", text: "세 번 가면 얼굴, 다섯 번이면 이름을 묻기" },
  ],
  neighbor: [
    { icon: "⏳", text: "첫 3개월은 답답할 수 있음" },
    { icon: "🤝", text: "4개월쯤부터 동네 사람들과 친해짐" },
    { icon: "🌾", text: "함께 농사·잡곡 키우는 모임 있음" },
    { icon: "❄️", text: "첫 겨울이 가장 견디기 힘든 시기" },
  ],

  // ── 지역 미션 일부 (예시) ───────────────────
  "ganghwa-market": [
    { icon: "🦐", text: "전국 젓새우의 70%가 강화 앞바다에서 잡혀요" },
    { icon: "🥬", text: "강화 순무김치 3kg 33,000원, 시장 소포장 5~10천원" },
    { icon: "🐟", text: "밴댕이는 선도 약해 시장에서 바로 무쳐 먹는 음식" },
    { icon: "🏛️", text: "풍물시장 구조 — 1층 특산물, 2층 밴댕이 먹거리" },
  ],
  "ganghwa-farm": [
    { icon: "🌾", text: "강화 갯벌과 논이 만나는 농업 풍경" },
    { icon: "🥬", text: "텃밭 한 평이면 한 가족 채소가 됨" },
  ],
  "geoje-leisure": [
    { icon: "🌊", text: "거제 바닷가 산책 30분이 하루 리듬" },
    { icon: "🏄", text: "액티비티가 풍부해 주말이 짧게 느껴짐" },
  ],
  "taean-community": [
    { icon: "🏝", text: "갯벌 + 해변 = 태안만의 결" },
    { icon: "👥", text: "이주민 모임이 활발해 적응 빠름" },
  ],
};

export function keyInfosFor(missionId: string): MissionKeyInfo[] {
  return MISSION_KEY_INFOS[missionId] ?? [];
}
