/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, Share, PlusSquare, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PWAInstallButtonProps {
  /** compact = apenas ícone (para a barra de topo) */
  variant?: "compact" | "full";
  className?: string;
}

export function PWAInstallButton({ variant = "full", className = "" }: PWAInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        Boolean((window.navigator as unknown as { standalone: boolean }).standalone));
    if (standalone) setInstalado(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalado(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const instalar = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalado(true);
      setDeferredPrompt(null);
      return;
    }
    setMostrarInstrucoes(true);
  };

  if (instalado) return null;

  return (
    <>
      <button
        onClick={instalar}
        type="button"
        title="Baixar o Aplicativo FILDA II"
        aria-label="Baixar o Aplicativo FILDA II"
        className={
          variant === "compact"
            ? `p-2 rounded-xl bg-dourado/15 border border-dourado/40 text-dourado hover:bg-dourado/25 transition-all active:scale-95 ${className}`
            : `btn-gold rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md shadow-dourado/20 hover:scale-[1.02] active:scale-95 transition-all ${className}`
        }
      >
        <Download className="w-4 h-4 stroke-[2.5]" />
        {variant === "full" && <span>Baixar o Aplicativo</span>}
      </button>

      {mostrarInstrucoes && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-dourado/40 rounded-3xl p-6 max-w-sm w-full text-white relative shadow-2xl">
            <button
              onClick={() => setMostrarInstrucoes(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-full bg-white/10"
              type="button"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-dourado/20 border border-dourado/40 flex items-center justify-center text-dourado mb-4">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="font-anton text-xl text-dourado tracking-wide">
              Instalar o App FILDA II
            </h3>
            <p className="text-xs text-white/80 mt-1">
              {isIOS
                ? "No iPhone / iPad siga estes passos no Safari:"
                : "No seu navegador siga estes passos:"}
            </p>

            <div className="mt-5 space-y-3.5 text-xs text-white/90">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  {isIOS ? <Share className="w-4 h-4" /> : <PlusSquare className="w-4 h-4" />}
                </div>
                <span>
                  <strong>1.</strong>{" "}
                  {isIOS ? (
                    <>
                      Toque em <strong>Compartilhar</strong> na barra do Safari.
                    </>
                  ) : (
                    <>
                      Abra o menu do navegador (<strong>⋮</strong>).
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-dourado/20 text-dourado flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>
                  <strong>2.</strong> Escolha{" "}
                  <strong>
                    {isIOS ? '"Adicionar à Tela de Início"' : '"Instalar aplicativo"'}
                  </strong>
                  .
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>
                  <strong>3.</strong> Confirme em <strong>"Adicionar"</strong> e o ícone fica no seu
                  telemóvel.
                </span>
              </div>
            </div>

            <button
              onClick={() => setMostrarInstrucoes(false)}
              type="button"
              className="w-full mt-6 btn-gold rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
