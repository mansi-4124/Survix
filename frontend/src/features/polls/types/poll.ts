export type PollType = "MCQ" | "ONE_WORD";
export type PollStatus = "DRAFT" | "LIVE" | "CLOSED";

export type PollOption = {
  id: string;
  text: string;
};

export type PollSummary = {
  id: string;
  code: string;
  organizationId: string;
  title: string;
  description?: string | null;
  status: PollStatus;
  isActive: boolean;
  expiresAt: string;
  totalVotes: number;
  createdAt: string;
};

export type PollQuestion = {
  id: string;
  text: string;
  type: PollType;
  options: PollOption[];
};

export type PollDetails = {
  id: string;
  code: string;
  organizationId: string;
  title: string;
  description?: string | null;
  status: PollStatus;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
  allowAnonymous: boolean;
  allowMultipleVotes: boolean;
  showLiveResults: boolean;
  createdBy: string;
  createdAt: string;
  questions: PollQuestion[];
};

export type PollOptionResult = {
  optionId: string;
  text: string;
  votes: number;
  percentage: number;
  momentum: "SURGE" | "TRENDING" | "LOSING" | "STABLE";
};

export type PollWordCount = {
  word: string;
  count: number;
};

export type PollQuestionResult = {
  questionId: string;
  text: string;
  type: PollType;
  totalVotes: number;
  optionResults: PollOptionResult[];
  wordCounts: PollWordCount[];
  surgeDetected?: boolean;
};

export type PollResults = {
  pollId: string;
  status: PollStatus;
  isActive: boolean;
  expiresAt: string;
  timeRemainingMs: number;
  totalVotes: number;
  questions: PollQuestionResult[];
  participation: {
    viewers: number;
    votes: number;
    participationPercent: number;
  };
};

export type VotePayload = {
  questionId: string;
  optionId?: string;
  wordAnswer?: string;
  sessionId?: string;
  participantName?: string;
};
