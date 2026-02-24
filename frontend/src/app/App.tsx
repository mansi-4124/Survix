import { useAuthInit } from "@/features/auth/hooks/useAuthInit";
import { useAuthStore } from "@/features/auth/store/auth.store";

function App() {
  useAuthInit();

  const isInitializing = useAuthStore((s) => s.isInitializing);

  if (isInitializing) {
    return <div>Loading...</div>;
  }

  return <div>Your App Routes Here</div>;
}

export default App;
