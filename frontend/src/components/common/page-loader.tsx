import { Loader2 } from "lucide-react";

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
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
};
