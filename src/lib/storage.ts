/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto.
 */

// ============================================================================
//  STORAGE — Upload e remoção de imagens no Firebase Cloud Storage.
//  Nunca guardamos imagens em Base64 no Firestore: apenas URL + storagePath.
// ============================================================================

import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, garantirSessaoFirebase } from "./firebase";

export const TIPOS_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const TAMANHO_MAXIMO_MB = 5;

export interface ImagemEnviada {
  url: string;
  storagePath: string;
  tamanho: number;
  tipo: string;
}

export function validarImagem(file: File): string | null {
  if (!TIPOS_PERMITIDOS.includes(file.type.toLowerCase())) {
    return "Formato inválido. Aceitamos apenas JPG, JPEG, PNG ou WEBP.";
  }
  if (file.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
    return `A imagem é demasiado grande (máx. ${TAMANHO_MAXIMO_MB} MB).`;
  }
  return null;
}

function nomeSeguro(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "-")
    .toLowerCase();
}

/**
 * Envia uma imagem para o Firebase Storage e devolve a URL pública + caminho.
 * @param pasta pasta lógica (ex: "galeria", "atletas", "config")
 */
export async function enviarImagem(
  file: File,
  pasta: string,
  onProgresso?: (percentagem: number) => void,
): Promise<ImagemEnviada> {
  const erro = validarImagem(file);
  if (erro) throw new Error(erro);

  await garantirSessaoFirebase();

  const storagePath = `${pasta}/${Date.now()}-${nomeSeguro(file.name)}`;
  const referencia = ref(storage, storagePath);
  const tarefa = uploadBytesResumable(referencia, file, { contentType: file.type });

  await new Promise<void>((resolve, reject) => {
    tarefa.on(
      "state_changed",
      (snap) => {
        const pct = snap.totalBytes ? (snap.bytesTransferred / snap.totalBytes) * 100 : 0;
        onProgresso?.(Math.round(pct));
      },
      (err) => reject(new Error(traduzirErroStorage(err))),
      () => resolve(),
    );
  });

  const url = await getDownloadURL(tarefa.snapshot.ref);
  return { url, storagePath, tamanho: file.size, tipo: file.type };
}

/** Remove o ficheiro do Storage (evita ficheiros órfãos ao apagar da galeria). */
export async function apagarImagem(storagePath?: string) {
  if (!storagePath) return;
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (err) {
    console.warn("Não foi possível remover o ficheiro do Storage:", err);
  }
}

function traduzirErroStorage(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  if (code.includes("unauthorized")) return "Sem permissão para enviar imagens. Inicie sessão como Administração.";
  if (code.includes("canceled")) return "Envio cancelado.";
  if (code.includes("quota")) return "Espaço de armazenamento esgotado no Firebase Storage.";
  if (code.includes("retry-limit")) return "Ligação instável. Tente novamente.";
  return "Falha ao enviar a imagem. Verifique a ligação à internet.";
}
