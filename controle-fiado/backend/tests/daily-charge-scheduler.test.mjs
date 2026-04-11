import test from "node:test";
import assert from "node:assert/strict";

const { computeNextRunAt, parseScheduleTime } = await import("../dist/infra/jobs/daily-charge-scheduler.js");

test("parseScheduleTime reads valid HH:MM values", () => {
  const result = parseScheduleTime("09:30");
  assert.deepEqual(result, { hour: 9, minute: 30 });
});

test("computeNextRunAt schedules later today when time is still ahead", () => {
  const referenceDate = new Date(2026, 3, 11, 8, 0, 0, 0);
  const nextRunAt = computeNextRunAt(referenceDate, "09:30");

  assert.equal(nextRunAt.getFullYear(), 2026);
  assert.equal(nextRunAt.getMonth(), 3);
  assert.equal(nextRunAt.getDate(), 11);
  assert.equal(nextRunAt.getHours(), 9);
  assert.equal(nextRunAt.getMinutes(), 30);
});

test("computeNextRunAt schedules tomorrow when time already passed", () => {
  const referenceDate = new Date(2026, 3, 11, 10, 0, 0, 0);
  const nextRunAt = computeNextRunAt(referenceDate, "09:30");

  assert.equal(nextRunAt.getFullYear(), 2026);
  assert.equal(nextRunAt.getMonth(), 3);
  assert.equal(nextRunAt.getDate(), 12);
  assert.equal(nextRunAt.getHours(), 9);
  assert.equal(nextRunAt.getMinutes(), 30);
});
