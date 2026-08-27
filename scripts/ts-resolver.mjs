/**
 * Node ESM çözümleyici kancası: uzantısız ("./errors") ve "@/..." biçimindeki
 * import'ları .ts dosyalarına eşler.
 *
 * Amaç: doğrulama/analiz script'lerinin lib/etsy içindeki GERÇEK TypeScript
 * kaynağını çalıştırabilmesi. Böylece kontroller kuralların kopyasını değil,
 * üretimde çalışan kodun ta kendisini sınar.
 *
 * Kullanım:
 *   node --experimental-strip-types --import ./scripts/ts-resolver.mjs script.mjs
 */

import { register } from "node:module";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";

const projectRoot = new URL("../", import.meta.url);

const HOOK_SOURCE = `
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = ${JSON.stringify(projectRoot.href)};
const EXTS = [".ts", ".tsx", "/index.ts", "/index.tsx"];

export async function resolve(specifier, context, nextResolve) {
  // "@/lib/foo" → proje kökünden çöz
  if (specifier.startsWith("@/")) {
    specifier = new URL(specifier.slice(2), ROOT).href;
  }

  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    // Uzantısız göreli/mutlak import: .ts varyantlarını dene
    const base = context.parentURL ?? ROOT;
    let url;
    try {
      url = new URL(specifier, base);
    } catch {
      throw err;
    }
    for (const ext of EXTS) {
      const candidate = new URL(url.href + ext);
      if (existsSync(fileURLToPath(candidate))) {
        return { url: candidate.href, shortCircuit: true };
      }
    }
    throw err;
  }
}
`;

register(`data:text/javascript,${encodeURIComponent(HOOK_SOURCE)}`, pathToFileURL("./"));

// existsSync burada sadece kancanın yüklendiğini doğrulamak için kullanılıyor.
if (!existsSync(new URL("lib/etsy", projectRoot).pathname)) {
  console.warn("Uyarı: lib/etsy bulunamadı, script proje kökünden çalıştırılmalı.");
}
