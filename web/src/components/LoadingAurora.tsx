export const LoadingAurora = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[200px] w-full bg-black/50 backdrop-blur-xs rounded-lg border border-white/10 overflow-hidden relative">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,#00ff9d_120deg,transparent_180deg)] blur-3xl" />
        <div className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] animate-[spin_12s_linear_infinite_reverse] bg-[conic-gradient(from_180deg,transparent_0deg,#9d00ff_120deg,transparent_180deg)] blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Simple undulating wave using CSS animation if we had it, but for now spinning borders/glows */}
        <div className="w-16 h-16 rounded-full border-4 border-t-neo-green border-r-neo-pink border-b-neo-blue border-l-transparent animate-spin" />
        <span className="font-mono text-neo-green animate-pulse font-bold tracking-widest text-sm">
          SEARCHING SKIES...
        </span>
      </div>
    </div>
  );
};
