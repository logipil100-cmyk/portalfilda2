// Gera public/version.json a cada build para o aviso de "nova versão disponível".
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const destino = resolve(raiz, "public/version.json");

const versao =
  process.env.COMMIT_REF?.slice(0, 8) ||
  process.env.BUILD_ID ||
  new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);

mkdirSync(dirname(destino), { recursive: true });
writeFileSync(
  destino,
  JSON.stringify({ versao, geradoEm: new Date().toISOString() }, null, 2) + "\n",
);

console.log(`[FILDA II] Versão do build: ${versao}`);
