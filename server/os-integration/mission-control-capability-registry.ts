import type {
  MissionControlCapability,
} from "./mission-control-capability.js";

const registry = new Map<string, MissionControlCapability>();

export function registerMissionControlCapability(
  identifier: string,
  capability: MissionControlCapability,
): void {
  registry.set(identifier, capability);
}

export function getMissionControlCapability(
  identifier: string,
): MissionControlCapability | undefined {
  return registry.get(identifier);
}

export function listMissionControlCapabilities(): readonly string[] {
  return [...registry.keys()];
}
