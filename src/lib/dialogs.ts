/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

import { traduzirErroParaPortugues } from "./error-translator";

type ConfirmListener = (msg: string, resolve: (res: boolean) => void) => void;
type AlertListener = (msg: string, resolve: () => void) => void;

let confirmListener: ConfirmListener | null = null;
let alertListener: AlertListener | null = null;

export function setDialogListeners(c: ConfirmListener | null, a: AlertListener | null) {
  confirmListener = c;
  alertListener = a;
}

export function pedirConfirmacao(titulo: string, texto?: string): Promise<boolean> {
  const mensagem = texto ? `${titulo}\n\n${texto}` : titulo;
  return new Promise((resolve) => {
    if (confirmListener) {
      confirmListener(mensagem, resolve);
    } else {
      // Fallback em ambientes fora do React ou sem modal montado
      const res = window.confirm(mensagem);
      resolve(res);
    }
  });
}

export function mostrarAlerta(mensagem: unknown, texto?: string): Promise<void> {
  const bruto = texto ? `${String(mensagem)}\n\n${texto}` : mensagem;
  const msgFormatada = traduzirErroParaPortugues(
    bruto,
    typeof bruto === "string" ? bruto : "Aviso do sistema.",
  );
  return new Promise((resolve) => {
    if (alertListener) {
      alertListener(msgFormatada, resolve);
    } else {
      window.alert(msgFormatada);
      resolve();
    }
  });
}
