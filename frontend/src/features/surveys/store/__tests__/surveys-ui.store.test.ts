import { beforeEach, describe, expect, it } from "vitest";
import { useSurveysUiStore } from "../surveys-ui.store";

const resetStore = () => {
  useSurveysUiStore.setState(
    {
      surveysSearch: "",
      activeSurveyId: null,
      activePageBySurvey: {},
      setSurveysSearch: useSurveysUiStore.getState().setSurveysSearch,
      setActiveSurveyId: useSurveysUiStore.getState().setActiveSurveyId,
      setActivePageForSurvey: useSurveysUiStore.getState().setActivePageForSurvey,
      clearSurveyUi: useSurveysUiStore.getState().clearSurveyUi,
    },
    true,
  );
};

describe("useSurveysUiStore", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it("updates search and active survey", () => {
    useSurveysUiStore.getState().setSurveysSearch("voice of customer");
    useSurveysUiStore.getState().setActiveSurveyId("survey-1");

    expect(useSurveysUiStore.getState().surveysSearch).toBe("voice of customer");
    expect(useSurveysUiStore.getState().activeSurveyId).toBe("survey-1");
  });

  it("tracks active page per survey", () => {
    useSurveysUiStore.getState().setActivePageForSurvey("survey-1", "page-1");
    useSurveysUiStore.getState().setActivePageForSurvey("survey-2", "page-9");

    expect(useSurveysUiStore.getState().activePageBySurvey).toEqual({
      "survey-1": "page-1",
      "survey-2": "page-9",
    });
  });

  it("clears UI state", () => {
    useSurveysUiStore.getState().setSurveysSearch("text");
    useSurveysUiStore.getState().setActiveSurveyId("survey-1");
    useSurveysUiStore.getState().setActivePageForSurvey("survey-1", "page-1");

    useSurveysUiStore.getState().clearSurveyUi();

    expect(useSurveysUiStore.getState().surveysSearch).toBe("");
    expect(useSurveysUiStore.getState().activeSurveyId).toBeNull();
    expect(useSurveysUiStore.getState().activePageBySurvey).toEqual({});
  });
});
