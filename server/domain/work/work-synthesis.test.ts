import assert from "node:assert/strict";
import test from "node:test";
import type { WorkSynthesis } from "../synthesis/index.js";
import { WorkSynthesisQuery, type WorkSynthesisReadSource } from "./index.js";

const WORK = Object.freeze({ projectId: "NOVA", workId: "WORK-1" });
function synthesis(elements: readonly unknown[] = [], lifecycle: "CURRENT" | "WITHDRAWN" = "CURRENT"): WorkSynthesis {
  const event = { type: "SYNTHESIS_ESTABLISHED" as const, synthesisId: "synthesis-1", idempotencyIdentity: "establish-1", at: "2026-09-17T08:00:00.000Z", actor: "owner", workReference: WORK };
  return { synthesisId: "synthesis-1", workReference: WORK, lifecycle, currentRevision: { revision: 1, content: { scope: "work", audience: "ops", observationDate: event.at, elements: elements as never, sources: [], conflicts: [], limits: [] }, provenance: { producer: "SYNTHESIS_AUTHORITY", actor: "owner", causationIdentity: "cause", producedAt: event.at }, reason: null }, revisions: [], history: [event], withdrawal: lifecycle === "WITHDRAWN" ? { reason: "withdrawn", actor: "owner", at: event.at } : null };
}
function query(current: ReturnType<WorkSynthesisReadSource["currentByWork"]>, history: readonly WorkSynthesis[] = []): WorkSynthesisQuery {
  return new WorkSynthesisQuery({ currentByWork: () => current, historyByWork: () => history });
}

test("Work association distinguishes absent, empty, unavailable, available and withdrawn", () => {
  assert.equal(query({ state: "ABSENT" }).get(WORK).status, "SYNTHESIS_ABSENT");
  assert.equal(query({ state: "FOUND", synthesis: synthesis() }).get(WORK).status, "SYNTHESIS_AVAILABLE_EMPTY");
  assert.equal(query({ state: "FOUND", synthesis: synthesis([{}]) }).get(WORK).status, "SYNTHESIS_AVAILABLE");
  assert.equal(query({ state: "AUTHORITY_UNAVAILABLE", cause: new Error("offline") }).get(WORK).status, "SYNTHESIS_UNAVAILABLE");
  assert.equal(query({ state: "ABSENT" }, [synthesis([], "WITHDRAWN")]).get(WORK).status, "SYNTHESIS_WITHDRAWN");
});

test("Work association is reference-only and exposes no mutation capability", () => {
  const owner = synthesis([{}]);
  const before = JSON.stringify(owner);
  const projection = query({ state: "FOUND", synthesis: owner });
  const first = projection.get(WORK); const second = projection.get(WORK);
  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(owner), before);
  assert.deepEqual(Object.keys(projection), ["source"]);
  assert.equal("establish" in projection, false);
  assert.equal("revise" in projection, false);
  assert.equal("withdraw" in projection, false);
});
