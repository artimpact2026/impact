// 마을 도착 홈 — 상단 헤더 (마을명)

type Props = {
  headerTitle: string;
};

export default function RegionHeader({ headerTitle }: Props) {
  return (
    <header className="px-4 pt-12 pb-2 flex items-center gap-2">
      <h1 className="text-[16px] font-extrabold text-[#4A3326]">
        {headerTitle}
      </h1>
    </header>
  );
}
