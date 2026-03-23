import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastState = {
  toasts: ToastItem[];
  push: (toast: ToastItem) => void;
  remove: (id: string) => void;
};

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, toast],
    })),
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

const enqueue = (message: string, tone: ToastTone) => {
  const id = crypto.randomUUID();
  useToastStore.getState().push({ id, message, tone });

  setTimeout(() => {
    useToastStore.getState().remove(id);
  }, 4000);
};

export const toast = {
  success: (message: string) => enqueue(message, "success"),
  error: (message: string) => enqueue(message, "error"),
  info: (message: string) => enqueue(message, "info"),
};

export { useToastStore };
