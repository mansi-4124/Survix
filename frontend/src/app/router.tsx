import { Suspense, lazy, type ReactElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { PageLoader } from "@/components/common/page-loader";
import { AppLayout } from "@/layouts/appLayout";
import { RequireAuth } from "@/app/require-auth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useOrganizationStore } from "@/features/organization/store/organization.store";
import { useMyOrganizations } from "@/features/organization/hooks";

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
const SurveyCreatePage = lazy(() => import("@/pages/surveys/surveyCreatePage"));
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
  <Suspense fallback={<PageLoader fullScreen message="" />}>{element}</Suspense>
);

const RootIndex = () => {
  const isAuthenticated = useAuthStore((s) => Boolean(s.user));
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }
  return withSuspense(<LandingPage />);
};

const AppIndexRedirect = () => {
  const activeOrganizationId = useOrganizationStore(
    (s) => s.activeOrganizationId,
  );
  const { data: organizations, isLoading } = useMyOrganizations();
  if (isLoading) {
    return <PageLoader fullScreen message="" />;
  }
  if (activeOrganizationId) {
    return (
      <Navigate to={`/app/org/${activeOrganizationId}/dashboard`} replace />
    );
  }
  if (organizations?.length) {
    return (
      <Navigate to={`/app/org/${organizations[0].id}/dashboard`} replace />
    );
  }
  return <Navigate to="/app/onboarding" replace />;
};

const OrganizationRedirect = () => {
  const activeOrganizationId = useOrganizationStore(
    (s) => s.activeOrganizationId,
  );
  if (activeOrganizationId) {
    return (
      <Navigate to={`/app/org/${activeOrganizationId}/organization`} replace />
    );
  }
  return <Navigate to="/app/onboarding" replace />;
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
          { index: true, element: <AppIndexRedirect /> },
          { path: "onboarding", element: withSuspense(<OnboardingPage />) },
          { path: "profile", element: withSuspense(<ProfilePage />) },
          { path: "organization", element: <OrganizationRedirect /> },
          {
            path: "organization/create",
            element: withSuspense(<OrganizationCreatePage />),
          },
          {
            path: "org/:orgId/dashboard",
            element: withSuspense(<DashboardPage />),
          },
          {
            path: "org/:orgId/organization",
            element: withSuspense(<OrganizationPage />),
          },
          {
            path: "org/:orgId/organization/edit",
            element: withSuspense(<OrganizationEditPage />),
          },
          {
            path: "org/:orgId/surveys",
            element: withSuspense(<SurveysPage />),
          },
          {
            path: "org/:orgId/surveys/create",
            element: withSuspense(<SurveyCreatePage />),
          },
          {
            path: "org/:orgId/surveys/:surveyId/members",
            element: withSuspense(<SurveyMembersPage />),
          },
          {
            path: "org/:orgId/surveys/:surveyId/results",
            element: withSuspense(<SurveyPrivateResultsPage />),
          },
          {
            path: "org/:orgId/surveys/:surveyId",
            element: withSuspense(<SurveyPage />),
          },
          { path: "org/:orgId/polls", element: withSuspense(<PollsPage />) },
          {
            path: "org/:orgId/polls/create",
            element: withSuspense(<PollCreatePage />),
          },
          {
            path: "org/:orgId/polls/history",
            element: withSuspense(<PollHistoryPage />),
          },
          {
            path: "org/:orgId/polls/:pollId/live",
            element: withSuspense(<PollLivePage />),
          },
          { path: "org/:orgId/search", element: withSuspense(<SearchPage />) },
        ],
      },
    ],
  },
]);
