type PageLoaderProps = {
  message?: string;
  fullScreen?: boolean;
};

export const PageLoader = ({ message = "Loading...", fullScreen = false }: PageLoaderProps) => {
  const wrapperClass = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "w-full py-16 flex items-center justify-center";

  return (
    <div className={wrapperClass}>
      <div className="flex flex-col items-center gap-4 text-slate-600">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,_#7c3aed,_#a855f7,_#6366f1,_#7c3aed)] animate-spin p-1 shadow-[0_0_30px_rgba(124,58,237,0.35)]" />
          <div className="absolute inset-1 rounded-full bg-white/80 backdrop-blur" />
          <div className="absolute inset-0 rounded-full border border-purple-300/60 animate-ping" />
        </div>
        <span className="text-sm font-medium tracking-wide">{message}</span>
      </div>
    </div>
  );
};
