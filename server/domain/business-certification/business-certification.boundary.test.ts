import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const DOMAIN_DIRECTORY = dirname(fileURLToPath(import.meta.url));

async function productionSources(): Promise<Array<Readonly<{ name: string; text: string }>>> {
  const names = (await readdir(DOMAIN_DIRECTORY))
    .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
    .sort();
  return Promise.all(names.map(async (name) => ({
    name,
    text: await readFile(join(DOMAIN_DIRECTORY, name), "utf8"),
  })));
}

test("product sources have no CEREBRAU, development-certificate or protected-domain dependency", async () => {
  const sources = await productionSources();
  const prohibited = [
    /tools[\\/]cerebrau/i,
    /tools[\\/]nova-core-runtime[\\/]Cerebrau/i,
    /Docs[\\/]12_CERTIFICATION/i,
    /OfficialStatus/,
    /server[\\/]domain[\\/](?:evidence|work|actions|planning|people|intelligence)/i,
  ];
  for (const source of sources) {
    for (const pattern of prohibited) {
      assert.doesNotMatch(source.text, pattern, `${source.name} must not contain ${pattern.source}`);
    }
    const specifiers = [...source.text.matchAll(/\b(?:import|export)\b[^;]*?\bfrom\s+["']([^"']+)["']/gs)]
      .map((match) => match[1]!);
    for (const specifier of specifiers) {
      assert.match(specifier, /^(?:node:|\.\/business-certification(?:[.-]))/);
    }
  }
});

test("the bounded context declares one authority and only a read-only Evidence port", async () => {
  const sources = await productionSources();
  const combined = sources.map((source) => source.text).join("\n");
  assert.equal((combined.match(/class\s+BusinessCertificationAuthority\b/g) ?? []).length, 1);
  assert.equal((combined.match(/BUSINESS_CERTIFICATION_AUTHORITY\s*=\s*"BUSINESS_CERTIFICATION_AUTHORITY"/g) ?? []).length, 1);

  const port = /interface\s+EvidenceIdentityReader\s*\{(?<body>[\s\S]*?)\n\}/.exec(combined)?.groups?.body;
  assert.ok(port);
  assert.match(port, /resolveEvidenceIdentity\s*\(/);
  assert.doesNotMatch(port, /\b(?:write|create|update|delete|append|record|command)\w*\s*\(/i);
});
