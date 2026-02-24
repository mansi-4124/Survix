import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import SignupPage from "@/pages/signupPage";
import VerifyEmailPage from "@/pages/verifyEmailPage";
import LoginPage from "@/pages/loginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);
