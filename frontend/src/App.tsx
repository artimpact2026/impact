// 청풍 앱 shell — 온보딩 게이트 + 탭/서브 라우트 관리
import { useEffect, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import DepartureScreen from "./screens/DepartureScreen";
import TravelingScreen from "./screens/TravelingScreen";
import ArrivalScreen from "./screens/ArrivalScreen";
import MissionListScreen from "./screens/MissionListScreen";
import MissionTravelingScreen from "./screens/MissionTravelingScreen";
import MissionExecuteScreen from "./screens/MissionExecuteScreen";
import DailySummaryScreen from "./screens/DailySummaryScreen";
import DayEndCeremonyScreen from "./screens/DayEndCeremonyScreen";
import MigrationReportCinematic from "./screens/MigrationReportCinematic";
import JourneyScreen from "./screens/JourneyScreen";
import MigrationReportScreen from "./screens/MigrationReportScreen";
import MoveInScreen from "./screens/MoveInScreen";
import ResidenceListScreen from "./screens/ResidenceListScreen";
import ResidenceDetailScreen from "./screens/ResidenceDetailScreen";
import SettingsScreen from "./screens/SettingsScreen";
import CommunityScreen from "./screens/CommunityScreen";
import BookingScreen from "./screens/BookingScreen";
import BookingDetailScreen from "./screens/BookingDetailScreen";
import BookingFormScreen from "./screens/BookingFormScreen";
import BookingDoneScreen from "./screens/BookingDoneScreen";
import MailboxModal from "./components/MailboxModal";
import { storiesByResidenceId } from "./data/stories";
import HospitalMissionScreen from "./screens/mission/HospitalMissionScreen";
import OnboardingShell, {
  type OnboardingResult,
} from "./screens/onboarding/OnboardingShell";
import BottomNav, { type TabKey } from "./components/BottomNav";
import {
  recommendedResidences,
  residences,
  type Residence,
  type LifeStyleType,
} from "./data/residences";
import { HOME_POSITIONS, type RegionPos } from "./data/regions";
import { resolveRegionPos } from "./data/koreaRegions";
import { type Mission } from "./data/missions";
import {
  advanceDay,
  bumpVisit,
  calculateMatch,
  completeMissionFor,
  type RegionRecord,
} from "./data/journey";
import {
  generateMigrationReport,
  markReportViewed,
  saveReport,
} from "./data/migrationReport";
import { missionsForResidence } from "./data/regionMissions";
import {
  buildDayPlan,
  houseStageFromProgress,
  isDayComplete,
} from "./data/dayPlan";

// hash 라우팅 — #hospital 해시로 단독 프리뷰
function useHashRoute() {
  const [hash, setHash] = useState(
    typeof window !== "undefined" ? window.location.hash : ""
  );
  useEffect(() => {
    const handler = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return hash;
}

// 탭1 화면 흐름
type Tab1Route =
  | "home"
  | "departure"
  | "traveling"
  | "arrival"
  | "mission-list"
  | "mission-traveling"
  | "mission-execute"
  | "daily-summary"
  | "traveling-back"
  | "day-end-ceremony";

// 탭2 화면 흐름
type Tab2Route =
  | "journey"
  | "report"
  | "move-in"
  | "settings"
  | "residence-list"
  | "residence-detail";

// 탭3(커뮤니티) 화면 흐름 — 골격 단계, 추후 detail/write 등 확장
type Tab3Route = "community";

// 탭4(레지던스 예약) 화면 흐름
type Tab4Route = "booking" | "booking-detail" | "booking-form" | "booking-done";

// localStorage 키
const PROFILE_KEY = "cheongpung.onboarding.v1";
const PROGRESS_KEY = "cheongpung.progress.v1";

type SavedProfile = {
  homeRegionName: string;
  lifestyle: LifeStyleType;
  // v2: 새 유형 시스템 — 추천 매칭과 결과 화면에서 사용
  profileV2?: import("./data/lifestyle").LifestyleProfile;
  email?: string;
  nickname?: string;
};

function loadProfile(): SavedProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedProfile;
  } catch {
    return null;
  }
}

function loadProgress(): Record<string, RegionRecord> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, RegionRecord>;
  } catch {
    return {};
  }
}

function saveProgress(p: Record<string, RegionRecord>) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export default function App() {
  // 훅은 모두 조건부 리턴보다 먼저
  const hash = useHashRoute();
  const [profile, setProfile] = useState<SavedProfile | null>(() => loadProfile());
  const [tab, setTab] = useState<TabKey>("home");
  const [tab1Route, setTab1Route] = useState<Tab1Route>("home");
  const [tab2Route, setTab2Route] = useState<Tab2Route>("journey");
  const [tab3Route, setTab3Route] = useState<Tab3Route>("community");
  const [tab4Route, setTab4Route] = useState<Tab4Route>("booking");
  const [selected, setSelected] = useState<Residence | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [regionProgress, setRegionProgress] = useState<
    Record<string, RegionRecord>
  >(() => loadProgress());
  const [reportResidenceId, setReportResidenceId] = useState<string | null>(null);
  const [moveInResidenceId, setMoveInResidenceId] = useState<string | null>(null);
  // 레지던스 상세 화면용
  const [viewingResidenceId, setViewingResidenceId] = useState<string | null>(null);
  // 레지던스 리스트 진입 시 필터(지역)
  const [residenceListRegion, setResidenceListRegion] = useState<string | null>(null);
  // 상세에서 뒤로 갈 때 list로 갈지 report로 갈지 추적
  const [detailEntry, setDetailEntry] = useState<"list" | "report">("list");
  // 미션 리스트에서 우편함 미션을 누른 경우 (모달로 노출)
  const [mailboxFromMission, setMailboxFromMission] = useState(false);
  // 예약 탭 — 선택된 레지던스 id + 진행 중인 예약 폼 데이터(완료 화면에서 사용)
  const [bookingResidenceId, setBookingResidenceId] = useState<string | null>(null);
  const [bookingDraft, setBookingDraft] = useState<{
    startDate: string;
    durationMonths: number;
  } | null>(null);
  // 예약 찜(하트) — 화면 상태만, 영속 X
  const [bookingLiked, setBookingLiked] = useState<Set<string>>(new Set());
  // 이주 리포트 시네마틱 — 풀스크린 모달 (열려있는 청년마을 id)
  const [cinematicResidenceId, setCinematicResidenceId] = useState<string | null>(null);
  const [cinematicLoading, setCinematicLoading] = useState(false);

  // 진행 상태 localStorage 영속
  useEffect(() => {
    saveProgress(regionProgress);
  }, [regionProgress]);

  // 데모 리셋 + mock 진행도 채우기 (콘솔 헬퍼)
  useEffect(() => {
    const api = {
      // 모든 상태 초기화 → 온보딩부터
      reset: () => {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(PROGRESS_KEY);
        setProfile(null);
        setSelected(null);
        setTab1Route("home");
        setTab2Route("journey");
        setTab3Route("community");
        setTab4Route("booking");
        setBookingResidenceId(null);
        setBookingDraft(null);
        setBookingLiked(new Set());
        setTab("home");
        setActiveMission(null);
        setRegionProgress({});
        setReportResidenceId(null);
        setMoveInResidenceId(null);
        setViewingResidenceId(null);
        setResidenceListRegion(null);
      },
      // 지역의 8개 미션을 모두 완료 처리하고 '하루 요약' 화면으로 점프
      // 사용법: cheongpung.skipTo()  → 첫 번째 지역
      //        cheongpung.skipTo("ganghwa") → 특정 지역
      skipTo: (residenceId?: string) => {
        const target = residenceId
          ? residences.find((r) => r.id === residenceId)
          : residences[0];
        if (!target) {
          console.warn(
            `[cheongpung] 지역을 찾을 수 없어요: ${residenceId}. 사용 가능한 id:`,
            residences.map((r) => r.id)
          );
          return;
        }
        // 전체 미션 완료(공통+지역) + 적합도 보너스 + 마지막 일차로 점프
        const missions = missionsForResidence(target.id);
        const { dayCount } = buildDayPlan(target, missions);
        const filled: RegionRecord = {
          residenceId: target.id,
          visitCount: 1,
          completedMissionIds: missions.map((m) => m.id),
          score: missions.reduce((sum, m) => sum + m.reward, 0),
          fitScore: 12,
          currentDay: dayCount,
        };
        setRegionProgress((p) => ({ ...p, [target.id]: filled }));
        setSelected(target);
        setActiveMission(null);
        setTab("home");
        setTab1Route("daily-summary");
        console.log(
          `[cheongpung] ${target.region} 8/8 미션 완료 mock 적용 → 하루 요약 화면`
        );
      },
      // 사용 가능한 지역 id 목록 출력
      regions: () => {
        const list = residences.map((r) => ({ id: r.id, region: r.region }));
        console.table(list);
        return list;
      },
    };
    (window as unknown as { cheongpung?: typeof api }).cheongpung = api;
    console.log(
      "%c[cheongpung] 데모 헬퍼 준비됨 — reset() / skipTo(id?) / regions()",
      "color:#FF7043;font-weight:bold"
    );
  }, []);

  if (hash === "#hospital") return <HospitalMissionScreen />;

  const handleOnboardingComplete = (r: OnboardingResult) => {
    const email = r.data.email || "";
    const nickname = email.split("@")[0] || "여행자";
    const next: SavedProfile = {
      homeRegionName: r.data.homeRegion || "서울",
      lifestyle: r.lifestyle,
      profileV2: r.profile,
      email,
      nickname,
    };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setProfile(next);
  };

  if (!profile) {
    return <OnboardingShell onComplete={handleOnboardingComplete} />;
  }

  const homeRegion = profile.homeRegionName;
  const nickname = profile.nickname ?? "여행자";
  const matchedResidence = residences.find((r) => r.region === homeRegion);
  const homePos: RegionPos =
    resolveRegionPos(homeRegion) ??
    HOME_POSITIONS[homeRegion] ??
    (matchedResidence
      ? { xPct: matchedResidence.xPct, yPct: matchedResidence.yPct }
      : HOME_POSITIONS["서울"]);

  // 현재 지역 진행 데이터
  const currentRecord = selected ? regionProgress[selected.id] : undefined;
  const currentCompletedIds = new Set(currentRecord?.completedMissionIds ?? []);
  const currentScore = currentRecord?.score ?? 0;

  // 현재 지역의 일차 계획
  const currentDayPlan = selected
    ? buildDayPlan(selected, missionsForResidence(selected.id))
    : null;
  const currentDay = currentRecord?.currentDay ?? 1;

  const handleTabChange = (next: TabKey) => {
    // 이동 애니메이션 중에는 무시
    const inTransit = tab1Route === "traveling" || tab1Route === "traveling-back";
    if (next === "home" && !inTransit) {
      // 강화도 등 마을에 체류 중이면 '홈'은 마을 홈(ArrivalScreen)
      if (selected) setTab1Route("arrival");
      else setTab1Route("home");
    }
    if (next === "journey") setTab2Route("journey");
    if (next === "community") setTab3Route("community");
    if (next === "booking") setTab4Route("booking");
    setTab(next);
  };

  const handleTravelComplete = () => {
    if (selected) setRegionProgress((p) => bumpVisit(p, selected.id));
    setTab1Route("arrival");
  };

  // 마을 → 본 지역 역방향 이동 완료
  const handleReturnHomeComplete = () => {
    setSelected(null);
    setActiveMission(null);
    setTab1Route("home");
  };

  const handleMissionComplete = (
    fitDelta = 0,
    pickStats?: { totalPicks: number; alignedPicks: number }
  ) => {
    if (!activeMission || !selected) return;
    const newProgress = completeMissionFor(
      regionProgress,
      selected.id,
      activeMission,
      fitDelta,
      pickStats
    );
    setRegionProgress(newProgress);
    setActiveMission(null);

    // 현재 일차의 모든 미션이 끝났는지 확인 → 하루 끝 의식으로
    const updatedRecord = newProgress[selected.id];
    const completedSet = new Set(updatedRecord?.completedMissionIds ?? []);
    const { missionsByDay } = buildDayPlan(
      selected,
      missionsForResidence(selected.id)
    );
    const day = updatedRecord?.currentDay ?? 1;
    const dayDone = isDayComplete(missionsByDay, day, completedSet);
    setTab1Route(dayDone ? "day-end-ceremony" : "mission-list");
  };

  // 하루 끝 의식에서 어디론가 떠날 때 — 일차 +1 후 목적지로
  // 마지막 날 닫기는 일차 진행 없이 하루 요약으로 (체류 종료 흐름)
  const finishDayAnd = (then: () => void) => {
    if (!selected) return;
    const { dayCount } = buildDayPlan(
      selected,
      missionsForResidence(selected.id)
    );
    const cur = currentRecord?.currentDay ?? 1;
    if (cur < dayCount) {
      setRegionProgress((p) => advanceDay(p, selected.id, dayCount));
    }
    then();
  };

  const handleDayCeremonyClose = () => {
    if (!selected) return;
    const { dayCount } = buildDayPlan(
      selected,
      missionsForResidence(selected.id)
    );
    const cur = currentRecord?.currentDay ?? 1;
    if (cur >= dayCount) {
      // 마지막 날 닫기 — 여정 마무리(하루 요약)
      setTab1Route("daily-summary");
      return;
    }
    finishDayAnd(() => setTab1Route("arrival"));
  };

  const handleCeremonyGoJourney = () =>
    finishDayAnd(() => {
      setTab("journey");
      setTab2Route("journey");
    });

  const handleCeremonyGoCommunity = () =>
    finishDayAnd(() => {
      setTab("community");
      setTab3Route("community");
    });

  // 이주 리포트 시네마틱 열기 — 캐시 없으면 생성
  const handleOpenCinematic = async (residence: Residence) => {
    const rec = regionProgress[residence.id];
    if (!rec) return;
    setCinematicLoading(true);
    try {
      let report = rec.migrationReport;
      if (!report) {
        const missions = missionsForResidence(residence.id);
        report = await generateMigrationReport(
          residence,
          rec,
          missions,
          profile?.lifestyle ?? null
        );
        setRegionProgress((p) => saveReport(p, residence.id, report!));
      }
      setCinematicResidenceId(residence.id);
    } finally {
      setCinematicLoading(false);
    }
  };

  // 의식 화면 추천에서 시네마틱 열기
  const handleCeremonyOpenCinematic = () =>
    finishDayAnd(() => {
      if (selected) void handleOpenCinematic(selected);
    });

  const handleCloseCinematic = () => {
    if (cinematicResidenceId) {
      setRegionProgress((p) => markReportViewed(p, cinematicResidenceId));
    }
    setCinematicResidenceId(null);
  };

  // 미션 선택 시 mode에 따라 라우팅 분기
  const handleSelectMission = (m: Mission) => {
    setActiveMission(m);
    if (m.mode === "mailbox") {
      // 우편함은 별도 — 도착 화면의 모달 흐름과 동일하게 모달 노출
      setMailboxFromMission(true);
      return;
    }
    if (m.mode === "map-dialogue" || m.mode === "map-info") {
      setTab1Route("mission-traveling");
    } else {
      // dialogue / numeric — 바로 수행 화면
      setTab1Route("mission-execute");
    }
  };

  // 우편함 모달 닫힐 때 — 미션 완료 처리
  const handleMailboxMissionClose = () => {
    if (activeMission) {
      // 우편함 미션: 보상 +3 고정, fitDelta 0
      handleMissionComplete(0);
    }
    setMailboxFromMission(false);
  };

  const handleOpenReport = (residence: Residence) => {
    setReportResidenceId(residence.id);
    setTab2Route("report");
    // 탭1(하루 요약)에서 진입해도 탭2 리포트로 전환되도록
    setTab("journey");
  };

  const handleDecideMove = () => {
    if (!reportResidenceId) return;
    setMoveInResidenceId(reportResidenceId);
    setTab2Route("move-in");
  };

  const handleMoveInDone = () => {
    if (!moveInResidenceId) return;
    const res = residences.find((r) => r.id === moveInResidenceId);
    if (!res) return;
    const next: SavedProfile = { ...profile, homeRegionName: res.region };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setProfile(next);
    setMoveInResidenceId(null);
    setReportResidenceId(null);
    setSelected(null);
    setTab1Route("home");
    setTab("home");
    setTab2Route("journey");
  };

  // 하루 요약 → "이 지역 레지던스 보기" → tab2 residence-list
  const handleSeeResidencesFromSummary = () => {
    if (!selected) return;
    setResidenceListRegion(selected.region);
    setTab("journey");
    setTab2Route("residence-list");
  };

  // 리스트에서 카드 탭 → 상세
  const handleSelectResidenceFromList = (r: Residence) => {
    setViewingResidenceId(r.id);
    setDetailEntry("list");
    setTab("journey");
    setTab2Route("residence-detail");
  };

  // 리포트에서 "신청하기" → 상세 (back은 report로)
  const handleApplyFromReport = (r: Residence) => {
    setViewingResidenceId(r.id);
    setDetailEntry("report");
    setTab2Route("residence-detail");
  };

  // 설정 화면 진입
  const handleOpenSettings = () => {
    setTab("journey");
    setTab2Route("settings");
  };

  const reportResidence = reportResidenceId
    ? residences.find((r) => r.id === reportResidenceId)
    : null;
  const moveInResidence = moveInResidenceId
    ? residences.find((r) => r.id === moveInResidenceId)
    : null;
  const viewingResidence = viewingResidenceId
    ? residences.find((r) => r.id === viewingResidenceId)
    : null;

  return (
    <div className="relative w-full max-w-[420px] min-h-screen bg-cream shadow-soft overflow-hidden">
      <main className="min-h-screen pb-24">
        {/* ===== 탭1 ===== */}
        {tab === "home" && tab1Route === "home" && (
          <HomeScreen
            homeRegion={homeRegion}
            onDepart={() => setTab1Route("departure")}
          />
        )}

        {tab === "home" && tab1Route === "departure" && (
          <DepartureScreen
            homeRegion={homeRegion}
            lifestyle={profile.lifestyle}
            profile={profile.profileV2}
            onBack={() => setTab1Route("home")}
            onDepart={(r: Residence) => {
              setSelected(r);
              setTab1Route("traveling");
            }}
          />
        )}

        {tab === "home" && tab1Route === "traveling" && selected && (
          <TravelingScreen
            origin={{ ...homePos, region: homeRegion }}
            destination={selected}
            onComplete={handleTravelComplete}
          />
        )}

        {tab === "home" && tab1Route === "arrival" && selected && (
          <ArrivalScreen
            residence={selected}
            homeRegion={homeRegion}
            onReturnHome={() => setTab1Route("traveling-back")}
            onStartMissions={() => setTab1Route("mission-list")}
          />
        )}

        {tab === "home" && tab1Route === "traveling-back" && selected && (
          <TravelingScreen
            origin={{
              xPct: selected.xPct,
              yPct: selected.yPct,
              region: selected.region,
            }}
            destination={{ ...homePos, region: homeRegion }}
            caption="집으로 돌아가는 중"
            onComplete={handleReturnHomeComplete}
          />
        )}

        {tab === "home" && tab1Route === "mission-list" && selected && (
          <MissionListScreen
            region={selected.region}
            residence={selected}
            completedIds={currentCompletedIds}
            totalScore={currentScore}
            fitScore={currentRecord?.fitScore ?? 0}
            currentDay={currentDay}
            onBack={() => setTab1Route("arrival")}
            onSelectMission={handleSelectMission}
          />
        )}

        {tab === "home" && tab1Route === "day-end-ceremony" && selected && currentDayPlan && (
          <DayEndCeremonyScreen
            region={selected.region}
            finishedDay={currentDay}
            totalDays={currentDayPlan.dayCount}
            prevStage={houseStageFromProgress(
              currentDay - 1,
              currentDayPlan.dayCount
            )}
            newStage={houseStageFromProgress(
              currentDay,
              currentDayPlan.dayCount
            )}
            onClose={handleDayCeremonyClose}
            suggestions={
              currentDay >= currentDayPlan.dayCount
                ? [
                    {
                      icon: cinematicLoading ? "⏳" : "🎬",
                      title: cinematicLoading
                        ? "이주 리포트 만드는 중..."
                        : "이주 리포트 열기",
                      subtitle: "당신의 시간을 한 편의 시퀀스로",
                      onClick: handleCeremonyOpenCinematic,
                    },
                    {
                      icon: "🗺️",
                      title: "나의 여정에서 돌아보기",
                      subtitle: "다녀온 지역과 짓고 있는 집",
                      onClick: handleCeremonyGoJourney,
                    },
                  ]
                : [
                    {
                      icon: "🗺️",
                      title: "나의 여정에서 진행 보기",
                      subtitle: "오늘까지 쌓인 흔적과 자라는 집",
                      onClick: handleCeremonyGoJourney,
                    },
                    {
                      icon: "💬",
                      title: "커뮤니티 가보기",
                      subtitle: "다른 사람들의 잠시섬 이야기",
                      onClick: handleCeremonyGoCommunity,
                    },
                  ]
            }
          />
        )}

        {tab === "home" && tab1Route === "mission-traveling" && activeMission && (
          <MissionTravelingScreen
            mission={activeMission}
            onBack={() => {
              // 이동 화면 닫고 미션 리스트로 복귀
              setActiveMission(null);
              setTab1Route("mission-list");
            }}
            onComplete={() => {
              // 지도 안내 미션은 도착 후 바로 완료 처리(짧은 정보 카드만 짚고)
              if (activeMission.mode === "map-info") {
                setTab1Route("mission-execute");
              } else {
                setTab1Route("mission-execute");
              }
            }}
          />
        )}

        {tab === "home" && tab1Route === "mission-execute" && activeMission && selected && (
          <MissionExecuteScreen
            mission={activeMission}
            residenceStance={selected.stance}
            residenceStanceAlt={selected.stanceAlt}
            residenceEnv={selected.envType}
            onClose={() => {
              setActiveMission(null);
              setTab1Route("mission-list");
            }}
            onComplete={handleMissionComplete}
          />
        )}

        {tab === "home" && tab1Route === "daily-summary" && selected && (
          <DailySummaryScreen
            region={selected.region}
            completedIds={currentCompletedIds}
            totalScore={currentScore}
            todayScore={currentScore}
            prevMatch={Math.max(
              0,
              calculateMatch(profile.lifestyle, selected, currentRecord) - 7
            )}
            newMatch={calculateMatch(
              profile.lifestyle,
              selected,
              currentRecord
            )}
            allMissionsDone={missionsForResidence(selected.id).every((m) =>
              currentCompletedIds.has(m.id)
            )}
            onSeeReport={() => handleOpenReport(selected)}
            onSeeResidences={handleSeeResidencesFromSummary}
            onSeeJourney={() => {
              setTab("journey");
              setTab2Route("journey");
            }}
            onClose={() => setTab1Route("mission-list")}
          />
        )}

        {/* ===== 탭2 ===== */}
        {tab === "journey" && tab2Route === "journey" && (
          <JourneyScreen
            regionProgress={regionProgress}
            lifestyle={profile.lifestyle}
            profile={profile.profileV2}
            nickname={nickname}
            homeRegion={homeRegion}
            onOpenSettings={handleOpenSettings}
            onOpenReport={handleOpenReport}
            onOpenCinematic={(r) => void handleOpenCinematic(r)}
          />
        )}

        {tab === "journey" && tab2Route === "settings" && (
          <SettingsScreen
            nickname={nickname}
            email={profile.email}
            lifestyle={profile.lifestyle}
            profile={profile.profileV2}
            homeRegion={homeRegion}
            onBack={() => setTab2Route("journey")}
            onReset={() => {
              (window as unknown as { cheongpung?: { reset: () => void } })
                .cheongpung?.reset();
            }}
          />
        )}

        {tab === "journey" &&
          tab2Route === "report" &&
          reportResidence &&
          regionProgress[reportResidence.id] && (
            <MigrationReportScreen
              residence={reportResidence}
              record={regionProgress[reportResidence.id]}
              lifestyle={profile.lifestyle}
              allProgress={regionProgress}
              onBack={() => {
                setReportResidenceId(null);
                setTab2Route("journey");
              }}
              onDecideMove={handleDecideMove}
              onApplyResidence={handleApplyFromReport}
            />
          )}

        {tab === "journey" && tab2Route === "move-in" && moveInResidence && (
          <MoveInScreen
            residence={moveInResidence}
            onGoHome={handleMoveInDone}
          />
        )}

        {tab === "journey" && tab2Route === "residence-list" && (
          <ResidenceListScreen
            filterRegion={residenceListRegion ?? undefined}
            lifestyle={profile.lifestyle}
            onBack={() => {
              setResidenceListRegion(null);
              setTab2Route("journey");
            }}
            onSelectResidence={handleSelectResidenceFromList}
          />
        )}

        {tab === "journey" && tab2Route === "residence-detail" && viewingResidence && (
          <ResidenceDetailScreen
            residence={viewingResidence}
            lifestyle={profile.lifestyle}
            record={regionProgress[viewingResidence.id]}
            onBack={() => {
              setViewingResidenceId(null);
              setTab2Route(detailEntry === "report" ? "report" : "residence-list");
            }}
          />
        )}

        {/* ===== 탭3: 커뮤니티(이야기) — 골격 ===== */}
        {tab === "community" && tab3Route === "community" && <CommunityScreen />}

        {/* ===== 탭4: 레지던스 예약 ===== */}
        {tab === "booking" && tab4Route === "booking" && (
          <BookingScreen
            residences={recommendedResidences}
            onSelectResidence={(r) => {
              setBookingResidenceId(r.id);
              setTab4Route("booking-detail");
            }}
          />
        )}

        {tab === "booking" &&
          tab4Route === "booking-detail" &&
          bookingResidenceId &&
          (() => {
            const r = recommendedResidences.find(
              (x) => x.id === bookingResidenceId
            );
            if (!r) return null;
            return (
              <BookingDetailScreen
                residence={r}
                liked={bookingLiked.has(r.id)}
                onToggleLike={() =>
                  setBookingLiked((prev) => {
                    const next = new Set(prev);
                    if (next.has(r.id)) next.delete(r.id);
                    else next.add(r.id);
                    return next;
                  })
                }
                onBack={() => {
                  setBookingResidenceId(null);
                  setTab4Route("booking");
                }}
                onBook={() => setTab4Route("booking-form")}
              />
            );
          })()}

        {tab === "booking" &&
          tab4Route === "booking-form" &&
          bookingResidenceId &&
          (() => {
            const r = recommendedResidences.find(
              (x) => x.id === bookingResidenceId
            );
            if (!r) return null;
            return (
              <BookingFormScreen
                residence={r}
                onBack={() => setTab4Route("booking-detail")}
                onSubmit={(draft) => {
                  setBookingDraft(draft);
                  setTab4Route("booking-done");
                }}
              />
            );
          })()}

        {tab === "booking" &&
          tab4Route === "booking-done" &&
          bookingResidenceId &&
          bookingDraft &&
          (() => {
            const r = recommendedResidences.find(
              (x) => x.id === bookingResidenceId
            );
            if (!r) return null;
            return (
              <BookingDoneScreen
                residence={r}
                draft={bookingDraft}
                onBackToList={() => {
                  setBookingResidenceId(null);
                  setBookingDraft(null);
                  setTab4Route("booking");
                }}
                onGoHome={() => {
                  setBookingResidenceId(null);
                  setBookingDraft(null);
                  setTab4Route("booking");
                  setTab("home");
                }}
              />
            );
          })()}
      </main>

      <BottomNav active={tab} onChange={handleTabChange} />

      {/* 우편함 미션 모달 — 미션 리스트에서 우편함 카드 누른 경우 */}
      <MailboxModal
        open={mailboxFromMission}
        story={selected ? storiesByResidenceId[selected.id] ?? null : null}
        onClose={handleMailboxMissionClose}
      />

      {/* 이주 리포트 시네마틱 — 풀스크린 모달 */}
      {cinematicResidenceId && (() => {
        const residence = residences.find((r) => r.id === cinematicResidenceId);
        const rec = regionProgress[cinematicResidenceId];
        const report = rec?.migrationReport;
        if (!residence || !report) return null;
        return (
          <MigrationReportCinematic
            residence={residence}
            report={report}
            missions={missionsForResidence(residence.id)}
            isFirstView={!report.hasBeenViewed}
            onClose={handleCloseCinematic}
            onApplyResidence={() => {
              handleCloseCinematic();
              setMoveInResidenceId(residence.id);
              setTab("journey");
              setTab2Route("move-in");
            }}
          />
        );
      })()}
    </div>
  );
}
