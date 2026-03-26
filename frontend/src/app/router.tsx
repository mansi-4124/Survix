import { Suspense, lazy, type ReactElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { PageLoader } from "@/components/common/page-loader";
import { AppLayout } from "@/layouts/appLayout";
import { RequireAuth } from "@/app/require-auth";
import { useAuthStore } from "@/features/auth/store/auth.store";

const LoginPage = lazy(() => import("@/pages/auth/loginPage"));
const SignupPage = lazy(() => import("@/pages/auth/signupPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/verifyEmailPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/resetPasswordPage"));
const LandingPage = lazy(() => import("@/pages/landing/landingPage"));

const DashboardPage = lazy(() => import("@/pages/dashboard/dashboardPage"));
const OnboardingPage = lazy(() => import("@/pages/onboarding/onboardingPage"));
const OrganizationPage = lazy(
  () => import("@/pages/organization/organizationPage"),
);
const OrganizationCreatePage = lazy(
  () => import("@/pages/organization/organizationCreatePage"),
);
const OrganizationEditPage = lazy(
  () => import("@/pages/organization/organizationEditPage"),
);
const ProfilePage = lazy(() => import("@/pages/profile/profilePage"));
const PublicProfilePage = lazy(
  () => import("@/pages/profile/publicProfilePage"),
);

const SurveysPage = lazy(() => import("@/pages/surveys/surveysPage"));
const SurveyCreatePage = lazy(
  () => import("@/pages/surveys/surveyCreatePage"),
);
const SurveyPage = lazy(() => import("@/pages/surveys/surveyPage"));
const SurveyMembersPage = lazy(
  () => import("@/pages/surveys/surveyMembersPage"),
);
const SurveyResponsePage = lazy(
  () => import("@/pages/surveys/surveyResponsePage"),
);
const SurveyPublicResultsPage = lazy(
  () => import("@/pages/surveys/surveyPublicResultsPage"),
);
const SurveyPrivateResultsPage = lazy(
  () => import("@/pages/surveys/surveyPrivateResultsPage"),
);

const PollsPage = lazy(() => import("@/pages/polls/pollsPage"));
const PollCreatePage = lazy(() => import("@/pages/polls/pollCreatePage"));
const PollHistoryPage = lazy(() => import("@/pages/polls/pollHistoryPage"));
const PollLivePage = lazy(() => import("@/pages/polls/pollLivePage"));
const PollPublicResultsPage = lazy(
  () => import("@/pages/polls/pollPublicResultsPage"),
);
const PollJoinPage = lazy(() => import("@/pages/polls/pollJoinPage"));
const PollParticipatePage = lazy(
  () => import("@/pages/polls/pollParticipatePage"),
);
const SearchPage = lazy(() => import("@/pages/search/searchPage"));
const PublicOrganizationPage = lazy(
  () => import("@/pages/organization/publicOrganizationPage"),
);

const withSuspense = (element: ReactElement) => (
  <Suspense
    fallback={<PageLoader fullScreen message="Loading page..." />}
  >
    {element}
  </Suspense>
);

const RootIndex = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }
  return withSuspense(<LandingPage />);
};

export const router = createBrowserRouter([
  {
      path: "/",
      element: <App />,
      children: [
      { index: true, element: <RootIndex /> },
      { path: "signup", element: withSuspense(<SignupPage />) },
      { path: "verify-email", element: withSuspense(<VerifyEmailPage />) },
      { path: "login", element: withSuspense(<LoginPage />) },
      { path: "reset-password", element: withSuspense(<ResetPasswordPage />) },
      { path: "u/:username", element: withSuspense(<PublicProfilePage />) },
      { path: "org/:slug", element: withSuspense(<PublicOrganizationPage />) },
      { path: "respond/:id", element: withSuspense(<SurveyResponsePage />) },
      {
        path: "survey/results/:surveyId",
        element: withSuspense(<SurveyPublicResultsPage />),
      },
      {
        path: "poll/results/:pollId",
        element: withSuspense(<PollPublicResultsPage />),
      },
      { path: "poll/join", element: withSuspense(<PollJoinPage />) },
      { path: "poll/join/:code", element: withSuspense(<PollJoinPage />) },
      {
        path: "poll/participate/:pollId",
        element: withSuspense(<PollParticipatePage />),
      },
      {
        path: "app",
        element: (
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: withSuspense(<DashboardPage />) },
          { path: "onboarding", element: withSuspense(<OnboardingPage />) },
          { path: "profile", element: withSuspense(<ProfilePage />) },
          { path: "organization", element: withSuspense(<OrganizationPage />) },
          {
            path: "organization/create",
            element: withSuspense(<OrganizationCreatePage />),
          },
          {
            path: "organization/edit",
            element: withSuspense(<OrganizationEditPage />),
          },
          { path: "surveys", element: withSuspense(<SurveysPage />) },
          {
            path: "surveys/create",
            element: withSuspense(<SurveyCreatePage />),
          },
          {
            path: "surveys/:surveyId/members",
            element: withSuspense(<SurveyMembersPage />),
          },
          {
            path: "surveys/:surveyId/results",
            element: withSuspense(<SurveyPrivateResultsPage />),
          },
          {
            path: "surveys/:surveyId",
            element: withSuspense(<SurveyPage />),
          },
          { path: "polls", element: withSuspense(<PollsPage />) },
          {
            path: "polls/create",
            element: withSuspense(<PollCreatePage />),
          },
          {
            path: "polls/history",
            element: withSuspense(<PollHistoryPage />),
          },
          {
            path: "polls/:pollId/live",
            element: withSuspense(<PollLivePage />),
          },
          { path: "search", element: withSuspense(<SearchPage />) },
        ],
      },
    ],
  },
]);
