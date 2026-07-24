import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { RuntimeSnapshot } from "../runtime/orchestrator/orchestrator-runtime.js";

export class JsonRuntimeSnapshotStore {
  constructor(readonly filePath: string) {}

  async load(): Promise<RuntimeSnapshot | null> {
    try {
      const content = await readFile(this.filePath, "utf8");
      const snapshot = JSON.parse(content) as RuntimeSnapshot;
      if (snapshot.version !== 1) {
        throw new Error(`Version de mémoire NOVA non prise en charge : ${String(snapshot.version)}`);
      }
      return snapshot;
    } catch (error) {
      if (isMissingFile(error)) {
        return null;
      }
      throw error;
    }
  }

  async save(snapshot: RuntimeSnapshot): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    await rename(temporaryPath, this.filePath);
  }
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
