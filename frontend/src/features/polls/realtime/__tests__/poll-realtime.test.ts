import { describe, expect, it, vi, beforeEach } from "vitest";
import { connectPollRealtime } from "../poll-realtime";

const emitMock = vi.fn();
const onMock = vi.fn();
const disconnectMock = vi.fn();

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    emit: emitMock,
    on: onMock,
    disconnect: disconnectMock,
    connected: true,
  })),
}));

describe("connectPollRealtime", () => {
  beforeEach(() => {
    emitMock.mockClear();
    onMock.mockClear();
    disconnectMock.mockClear();
  });

  it("joins poll room on connect and on immediate connection", () => {
    connectPollRealtime("poll-1");

    expect(emitMock).toHaveBeenCalledWith("join_poll", { pollId: "poll-1" });
  });

  it("guards handlers by poll id and cleans up", () => {
    const onVoteUpdate = vi.fn();
    const disconnect = connectPollRealtime("poll-1", { onVoteUpdate });

    const voteHandler = onMock.mock.calls.find(
      ([event]) => event === "vote_update",
    )?.[1];

    voteHandler?.({ pollId: "poll-2", questionId: "q1", totalVotes: 1 });
    expect(onVoteUpdate).not.toHaveBeenCalled();

    voteHandler?.({ pollId: "poll-1", questionId: "q1", totalVotes: 2 });
    expect(onVoteUpdate).toHaveBeenCalledWith({
      pollId: "poll-1",
      questionId: "q1",
      totalVotes: 2,
    });

    disconnect();
    expect(emitMock).toHaveBeenCalledWith("leave_poll", { pollId: "poll-1" });
    expect(disconnectMock).toHaveBeenCalled();
  });
});
