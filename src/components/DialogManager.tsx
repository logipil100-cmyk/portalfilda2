/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

import React, { useState, useEffect } from "react";
import { AlertCircle, HelpCircle, X } from "lucide-react";
import { setDialogListeners } from "../lib/dialogs";

export function DialogManager() {
  const [confirmState, setConfirmState] = useState<{
    msg: string;
    resolve: (res: boolean) => void;
  } | null>(null);
  const [alertState, setAlertState] = useState<{ msg: string; resolve: () => void } | null>(null);

  useEffect(() => {
    setDialogListeners(
      (msg, resolve) => setConfirmState({ msg, resolve }),
      (msg, resolve) => setAlertState({ msg, resolve }),
    );
    return () => setDialogListeners(null, null);
  }, []);

  return (
    <>
      {/* Modal de Confirmação */}
      {confirmState && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass bg-[#111118]/95 border border-dourado/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-dourado/10 relative text-center">
            <button
              onClick={() => {
                confirmState.resolve(false);
                setConfirmState(null);
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-dourado/10 border border-dourado/30 flex items-center justify-center mx-auto mb-4 text-dourado shadow-inner">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="font-anton text-xl text-white mb-3 tracking-wide">CONFIRMAÇÃO</h3>
            <p className="text-sm text-white/80 leading-relaxed mb-6 whitespace-pre-wrap font-medium">
              {confirmState.msg}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  confirmState.resolve(false);
                  setConfirmState(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmState.resolve(true);
                  setConfirmState(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-red-600/30"
              >
                Sim, confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alerta */}
      {alertState && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="glass bg-[#111118]/95 border border-dourado/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-dourado/10 relative text-center">
            <button
              onClick={() => {
                alertState.resolve();
                setAlertState(null);
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-dourado/10 border border-dourado/30 flex items-center justify-center mx-auto mb-4 text-dourado shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-anton text-xl text-white mb-3 tracking-wide">AVISO</h3>
            <p className="text-sm text-white/80 leading-relaxed mb-6 whitespace-pre-wrap font-medium">
              {alertState.msg}
            </p>
            <button
              onClick={() => {
                alertState.resolve();
                setAlertState(null);
              }}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-dourado to-yellow-600 text-black font-anton tracking-wider text-base hover:brightness-110 transition-all shadow-lg shadow-dourado/20"
            >
              ENTENDIDO
            </button>
          </div>
        </div>
      )}
    </>
  );
}
