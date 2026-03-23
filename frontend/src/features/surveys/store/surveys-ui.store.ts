import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SurveysUiState = {
  surveysSearch: string;
  activeSurveyId: string | null;
  activePageBySurvey: Record<string, string>;
  setSurveysSearch: (value: string) => void;
  setActiveSurveyId: (surveyId: string | null) => void;
  setActivePageForSurvey: (surveyId: string, pageId: string) => void;
  clearSurveyUi: () => void;
};

export const useSurveysUiStore = create<SurveysUiState>()(
  persist(
    (set) => ({
      surveysSearch: "",
      activeSurveyId: null,
      activePageBySurvey: {},
      setSurveysSearch: (value) => set({ surveysSearch: value }),
      setActiveSurveyId: (surveyId) => set({ activeSurveyId: surveyId }),
      setActivePageForSurvey: (surveyId, pageId) =>
        set((state) => ({
          activePageBySurvey: {
            ...state.activePageBySurvey,
            [surveyId]: pageId,
          },
        })),
      clearSurveyUi: () =>
        set({
          surveysSearch: "",
          activeSurveyId: null,
          activePageBySurvey: {},
        }),
    }),
    {
      name: "survix-surveys-ui",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
