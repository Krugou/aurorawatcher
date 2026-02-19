export const LoadingAurora = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[200px] w-full bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden relative">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,#00d4aa_120deg,transparent_180deg)] blur-3xl" />
        <div className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] animate-[spin_12s_linear_infinite_reverse] bg-[conic-gradient(from_180deg,transparent_0deg,#8b5cf6_120deg,transparent_180deg)] blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full border-4 border-t-aurora-teal border-r-aurora-rose border-b-aurora-blue border-l-transparent animate-spin" />
        <span className="font-mono text-aurora-teal animate-pulse font-bold tracking-widest text-sm">
          SEARCHING SKIES...
        </span>
      </div>
    </div>
  );
};
