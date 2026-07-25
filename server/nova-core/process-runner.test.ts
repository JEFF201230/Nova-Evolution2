import assert from "node:assert/strict";
import { access, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runCommand } from "./nova-core.execution.js";

test("runner aborts a process tree and reports TIMEOUT", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-process-tree-"));
  const marker = join(directory, "grandchild-survived.txt");
  const grandchild = `setTimeout(() => require("node:fs").writeFileSync(process.argv[1], "alive"), 1200)`;
  const parent = [
    `require("node:child_process").spawn(process.execPath, ["-e", ${JSON.stringify(grandchild)}, ${JSON.stringify(marker)}], { stdio: "ignore" })`,
    `process.stdout.write("grandchild-started\\n")`,
    "setInterval(() => {}, 1000)",
  ].join(";");
  const controller = new AbortController();
  const safetyTimer = setTimeout(() => controller.abort("TIMEOUT"), 2_000);

  const result = await runCommand(process.execPath, ["-e", parent], directory, {
    signal: controller.signal,
    maxOutputBytes: 4_096,
    onOutput: (stream, chunk) => {
      if (stream === "stdout" && chunk.includes("grandchild-started")) controller.abort("TIMEOUT");
    },
  });
  clearTimeout(safetyTimer);
  assert.equal(result.terminationReason, "TIMEOUT");

  await new Promise((resolvePromise) => setTimeout(resolvePromise, 1_500));
  await assert.rejects(() => access(marker));
});

test("runner bounds stdout and stderr independently", async () => {
  const result = await runCommand(
    process.execPath,
    ["-e", `process.stdout.write("x".repeat(5000));process.stderr.write("y".repeat(5000))`],
    process.cwd(),
    { maxStdoutBytes: 1_024, maxStderrBytes: 1_024 },
  );
  assert.equal(result.exitCode, 0);
  assert.equal(result.outputTruncated, true);
  assert.ok(Buffer.byteLength(result.stdout) <= 1_024);
  assert.ok(Buffer.byteLength(result.stderr) <= 1_024);
});

test("runner force-kills a process that ignores graceful termination", async () => {
  const directory = await mkdtemp(join(tmpdir(), "nova-process-ignore-signal-"));
  const marker = join(directory, "ignored-signal-survived.txt");
  const script = [
    `process.on("SIGTERM",()=>process.stdout.write("ignored-sigterm\\n"))`,
    `process.stdout.write("ready\\n")`,
    `setTimeout(()=>require("node:fs").writeFileSync(process.argv[1],"alive"),3000)`,
    `setInterval(()=>{},1000)`,
  ].join(";");
  const controller = new AbortController();
  const result = await runCommand(process.execPath, ["-e", script, marker], directory, {
    signal: controller.signal,
    onOutput: (stream, chunk) => {
      if (stream === "stdout" && chunk.includes("ready")) controller.abort("TIMEOUT");
    },
  });
  assert.equal(result.terminationReason, "TIMEOUT");
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 3_300));
  await assert.rejects(() => access(marker));
});
