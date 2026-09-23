export default function SectionBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-28 -left-24 w-[30rem] h-[30rem] rounded-full bg-teal-400/10 dark:bg-teal-500/10 blur-[120px]" />
      <div className="absolute top-1/4 -right-28 w-[26rem] h-[26rem] rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-[120px]" />
      <div className="absolute -bottom-28 left-1/3 w-[24rem] h-[24rem] rounded-full bg-amber-300/10 dark:bg-amber-500/10 blur-[120px]" />
    </div>
  );
}