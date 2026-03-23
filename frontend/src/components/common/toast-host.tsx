import { useToastStore } from "@/lib/toast";

const toneClassMap = {
  success: "bg-emerald-600 text-white border-emerald-500",
  error: "bg-rose-600 text-white border-rose-500",
  info: "bg-slate-900 text-white border-slate-700",
};

export const ToastHost = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 w-[320px] max-w-[92vw]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-md border shadow-lg px-4 py-3 text-sm ${toneClassMap[toast.tone]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};
