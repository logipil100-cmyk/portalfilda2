/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

/**
 * Traduz e converte mensagens de erro técnicas para português claro, amigável e não técnico.
 */
export function traduzirErroParaPortugues(error: unknown, fallbackPadrao?: string): string {
  if (!error) {
    return fallbackPadrao || "Ocorreu um erro inesperado. Por favor, tenta novamente.";
  }

  let mensagem = "";
  let codigo = "";

  if (typeof error === "string") {
    mensagem = error;
  } else if (typeof error === "object" && error !== null) {
    const errObj = error as { code?: string; message?: string; name?: string };
    codigo = errObj.code || "";
    mensagem = errObj.message || "";
  }

  const erroStr = `${codigo} ${mensagem}`.toLowerCase();

  // Mapeamento de erros do Firebase Auth / Google Auth
  if (codigo === "auth/popup-closed-by-user" || erroStr.includes("popup-closed-by-user")) {
    return "A janela de início de sessão foi fechada antes de concluir o acesso com a conta Google.";
  }
  if (codigo === "auth/cancelled-popup-request" || erroStr.includes("cancelled-popup-request")) {
    return "O pedido de início de sessão foi cancelado.";
  }
  if (codigo === "auth/popup-blocked" || erroStr.includes("popup-blocked")) {
    return "O navegador bloqueou a janela de início de sessão. Por favor, permite janelas pop-up no teu navegador e tenta de novo.";
  }
  if (
    codigo === "auth/user-not-found" ||
    codigo === "auth/invalid-credential" ||
    codigo === "auth/wrong-password" ||
    erroStr.includes("invalid-credential") ||
    erroStr.includes("user-not-found") ||
    erroStr.includes("wrong-password")
  ) {
    return "Os dados de acesso (e-mail ou palavra-passe) estão incorretos.";
  }
  if (codigo === "auth/invalid-email" || erroStr.includes("invalid-email")) {
    return "O endereço de e-mail introduzido não é válido.";
  }
  if (codigo === "auth/email-already-in-use" || erroStr.includes("email-already-in-use")) {
    return "Este endereço de e-mail já está associado a outra conta.";
  }
  if (codigo === "auth/weak-password" || erroStr.includes("weak-password")) {
    return "A palavra-passe escolhida é demasiado fraca. Deve ter pelo menos 6 caracteres.";
  }
  if (codigo === "auth/network-request-failed" || erroStr.includes("network-request-failed")) {
    return "Sem ligação à rede. Verifica a tua ligação à Internet e tenta novamente.";
  }
  if (codigo === "auth/too-many-requests" || erroStr.includes("too-many-requests")) {
    return "Demasiadas tentativas de acesso. Por favor, aguarda uns momentos e tenta de novo.";
  }
  if (codigo === "auth/operation-not-allowed" || erroStr.includes("operation-not-allowed")) {
    return "Esta opção de início de sessão não está ativa de momento.";
  }
  if (
    codigo === "auth/account-exists-with-different-credential" ||
    erroStr.includes("account-exists-with-different-credential")
  ) {
    return "Já existe uma conta associada a este e-mail através de outro método de acesso.";
  }

  // Erros do Firestore / Banco de Dados / Permissões
  if (
    codigo === "permission-denied" ||
    erroStr.includes("permission-denied") ||
    erroStr.includes("insufficient permissions")
  ) {
    return "Não tens permissão para realizar esta ação.";
  }
  if (codigo === "unavailable" || erroStr.includes("service unavailable")) {
    return "O serviço está temporariamente indisponível. Tenta novamente mais tarde.";
  }

  // Erros de Rede e Conectividade
  if (erroStr.includes("failed to fetch") || erroStr.includes("networkerror")) {
    return "Falha de ligação ao servidor. Por favor, verifica a tua ligação à Internet.";
  }

  // Se for uma mensagem customizada já em português simples
  if (
    mensagem &&
    !mensagem.startsWith("Firebase:") &&
    !mensagem.includes("Error") &&
    !mensagem.includes("HTTPError") &&
    !mensagem.includes("TypeError") &&
    !mensagem.includes("ReferenceError") &&
    !mensagem.includes("SyntaxError") &&
    !mensagem.includes("Uncaught") &&
    !mensagem.includes("stack")
  ) {
    return mensagem;
  }

  return fallbackPadrao || "Ocorreu um problema inesperado no sistema. Por favor, tenta novamente.";
}
