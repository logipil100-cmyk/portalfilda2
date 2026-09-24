/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto.
 */

// ============================================================================
//  PERSISTÊNCIA EM COLEÇÕES SEPARADAS (Cloud Firestore)
//  Substitui o documento único `escola/dados` por coleções independentes,
//  permitindo regras de segurança granulares por perfil.
//
//  Coleções: usuarios, categorias, alunos, pagamentos, galeria, videos,
//            planos, faq, auditoria, jogos, anuncios
//  Config:   configuracoes/escola (documento único de configuração do site)
//
//  A migração a partir de `escola/dados` é feita uma única vez e NÃO apaga
//  o documento antigo (fica como cópia de segurança).
// ============================================================================

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { dbFirestore, auth } from "./firebase";

type Perfil = "admin" | "secretaria" | "mister" | "pai" | "visitante";

const PUBLICAS: ChaveListaExt[] = ["galeria", "videos", "planos", "faq", "categorias", "jogos", "anuncios"];
type ChaveListaExt = Exclude<keyof DB, "config">;

export function colecoesPermitidas(perfil: Perfil): ChaveListaExt[] {
  const lista = [...PUBLICAS];
  if (perfil === "admin" || perfil === "secretaria" || perfil === "mister") lista.push("alunos", "usuarios");
  if (perfil === "admin" || perfil === "secretaria") lista.push("pagamentos");
  if (perfil === "admin") lista.push("auditoria");
  return lista;
}

export async function obterPerfilAtual(): Promise<Perfil> {
  const u = auth.currentUser;
  if (!u || u.isAnonymous) return "visitante";
  try {
    const snap = await getDoc(doc(dbFirestore, "papeis", u.uid));
    const p = snap.exists() ? (snap.data().perfil ?? snap.data().papel) : null;
    return (["admin", "secretaria", "mister", "pai"].includes(p) ? p : "visitante") as Perfil;
  } catch {
    return "visitante";
  }
}
import type { DB, ConfigEscola } from "./store";

type ChaveLista = Exclude<keyof DB, "config">;

export const COLECOES: ChaveLista[] = [
  "usuarios",
  "categorias",
  "alunos",
  "pagamentos",
  "galeria",
  "videos",
  "planos",
  "faq",
  "auditoria",
  "jogos",
  "anuncios",
];

const DOC_CONFIG = () => doc(dbFirestore, "configuracoes", "escola");
const DOC_LEGADO = () => doc(dbFirestore, "escola", "dados");

type ComId = { id: string } & Record<string, unknown>;

function limpar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor));
}

function porId(lista: ComId[] | undefined): Map<string, ComId> {
  const mapa = new Map<string, ComId>();
  (lista ?? []).forEach((item) => {
    if (item && typeof item.id === "string") mapa.set(item.id, item);
  });
  return mapa;
}

// ---------------------------------------------------------------------------
//  Migração única do documento `escola/dados` para coleções
// ---------------------------------------------------------------------------

let migracaoIniciada = false;

export async function migrarParaColecoes(dbLocal: DB): Promise<void> {
  if (migracaoIniciada) return;
  if ((await obterPerfilAtual()) !== "admin") return; // só o admin migra
  migracaoIniciada = true;

  try {
    const cfgSnap = await getDoc(DOC_CONFIG());
    if (cfgSnap.exists()) return; // já migrado

    const legadoSnap = await getDoc(DOC_LEGADO());
    const origem: DB = legadoSnap.exists() ? ({ ...dbLocal, ...legadoSnap.data() } as DB) : dbLocal;

    let lote = writeBatch(dbFirestore);
    let operacoes = 0;
    const enviar = async () => {
      if (operacoes === 0) return;
      await lote.commit();
      lote = writeBatch(dbFirestore);
      operacoes = 0;
    };

    for (const nome of COLECOES) {
      const itens = (origem[nome] as unknown as ComId[]) ?? [];
      for (const item of itens) {
        if (!item?.id) continue;
        lote.set(doc(dbFirestore, nome, String(item.id)), limpar(item));
        operacoes++;
        if (operacoes >= 400) await enviar();
      }
    }
    await enviar();

    await setDoc(DOC_CONFIG(), {
      ...limpar(origem.config),
      migradoEm: new Date().toISOString(),
    });

    if (legadoSnap.exists()) {
      // Marca o documento antigo como migrado (mantido como cópia de segurança).
      await setDoc(DOC_LEGADO(), { migradoEm: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    console.warn("Migração para coleções não concluída:", err);
    migracaoIniciada = false;
  }
}

// ---------------------------------------------------------------------------
//  Leitura em tempo real
// ---------------------------------------------------------------------------

export function subscreverColecoes(
  base: DB,
  aoActualizar: (db: DB) => void,
  aoFalhar?: (err: unknown) => void,
): () => void {
  const acumulado: DB = limpar(base);
  let agendado: ReturnType<typeof setTimeout> | null = null;

  const emitir = () => {
    if (agendado) clearTimeout(agendado);
    agendado = setTimeout(() => aoActualizar(limpar(acumulado)), 60);
  };

  const cancelar: Array<() => void> = [];

  cancelar.push(
    onSnapshot(
      DOC_CONFIG(),
      (snap) => {
        if (snap.exists()) {
          acumulado.config = { ...acumulado.config, ...(snap.data() as ConfigEscola) };
          emitir();
        }
      },
      (err) => aoFalhar?.(err),
    ),
  );

  let cancelarColecoes: Array<() => void> = [];
  const pararColecoes = () => {
    cancelarColecoes.forEach((fn) => {
      try { fn(); } catch { /* ignora */ }
    });
    cancelarColecoes = [];
  };

  const subscrever = (nomes: ChaveLista[]) => {
    pararColecoes();
    for (const nome of nomes) {
      cancelarColecoes.push(
        onSnapshot(
          collection(dbFirestore, nome),
          (snap) => {
            (acumulado as unknown as Record<string, ComId[]>)[nome] = snap.docs.map(
              (d) => ({ ...(d.data() as Record<string, unknown>), id: d.id }) as ComId,
            );
            emitir();
          },
          (err) => aoFalhar?.(err),
        ),
      );
    }
  };

  let chaveAtual = "";
  cancelar.push(
    onAuthStateChanged(auth, async () => {
      const perfil = await obterPerfilAtual();
      const nomes = colecoesPermitidas(perfil);
      const chave = nomes.join(",");
      if (chave === chaveAtual) return;
      chaveAtual = chave;
      subscrever(nomes);
      if (perfil === "admin") void migrarParaColecoes(base);
    }),
  );
  cancelar.push(pararColecoes);

  return () => {
    if (agendado) clearTimeout(agendado);
    cancelar.forEach((fn) => {
      try {
        fn();
      } catch {
        /* ignora */
      }
    });
  };
}

// ---------------------------------------------------------------------------
//  Escrita apenas do que mudou
// ---------------------------------------------------------------------------

export async function gravarDiferencas(antigo: DB | null, novo: DB): Promise<void> {
  try {
    const tarefas: Array<Promise<unknown>> = [];

    if (!antigo || JSON.stringify(antigo.config) !== JSON.stringify(novo.config)) {
      tarefas.push(setDoc(DOC_CONFIG(), limpar(novo.config), { merge: true }));
    }

    for (const nome of COLECOES) {
      const antes = porId(antigo ? ((antigo[nome] as unknown as ComId[]) ?? []) : []);
      const depois = porId((novo[nome] as unknown as ComId[]) ?? []);

      depois.forEach((item, id) => {
        const anterior = antes.get(id);
        if (!anterior || JSON.stringify(anterior) !== JSON.stringify(item)) {
          tarefas.push(setDoc(doc(dbFirestore, nome, id), limpar(item)));
        }
      });

      antes.forEach((_item, id) => {
        if (!depois.has(id)) {
          tarefas.push(deleteDoc(doc(dbFirestore, nome, id)));
        }
      });
    }

    await Promise.all(tarefas);
  } catch (err) {
    console.error("Erro ao sincronizar com o Firestore:", err);
  }
}

/** Útil para diagnóstico: conta documentos existentes em cada coleção. */
export async function contarColecoes(): Promise<Record<string, number>> {
  const resultado: Record<string, number> = {};
  for (const nome of COLECOES) {
    const snap = await getDocs(collection(dbFirestore, nome));
    resultado[nome] = snap.size;
  }
  return resultado;
}
