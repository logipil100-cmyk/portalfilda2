/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, Sparkles, CheckCircle2, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mostrarBanner, setMostrarBanner] = useState(false);
  const [mostrarInstrucoesIOS, setMostrarInstrucoesIOS] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [instalado, setInstalado] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Detect standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        Boolean((window.navigator as unknown as { standalone: boolean }).standalone));

    if (isStandalone) {
      setInstalado(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if user hasn't dismissed it in this session
      const fechado = sessionStorage.getItem("pwa_banner_fechado");
      if (!fechado) {
        setMostrarBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If iOS and not installed and not closed, show iOS prompt after 2 seconds
    if (iosDevice && !isStandalone) {
      const fechado = sessionStorage.getItem("pwa_banner_fechado");
      if (!fechado) {
        const timer = setTimeout(() => setMostrarBanner(true), 2000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstalar = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalado(true);
        setMostrarBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setMostrarInstrucoesIOS(true);
    } else {
      // Direct instruction fallback for other browsers
      alert(
        "Para instalar o Aplicativo FILDA II:\n\n1. Abra o menu do seu navegador (⋮ ou ⚙️)\n2. Selecione 'Instalar Aplicativo' ou 'Adicionar à Tela Principal'.",
      );
    }
  };

  const fecharBanner = () => {
    setMostrarBanner(false);
    sessionStorage.setItem("pwa_banner_fechado", "true");
  };

  if (instalado || !mostrarBanner) return null;

  return (
    <>
      {/* Floating PWA Banner */}
      <div className="fixed top-16 inset-x-3 z-50 md:top-20 md:right-4 md:left-auto md:max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="bg-[#0f172a]/95 backdrop-blur-xl border-2 border-dourado/50 rounded-2xl p-4 shadow-2xl text-white relative overflow-hidden group">
          {/* Subtle gold glow */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-dourado/20 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={fecharBanner}
            className="absolute top-3 right-3 text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Fechar"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-dourado to-yellow-300 text-black flex items-center justify-center font-anton text-xl font-bold shadow-lg shadow-dourado/30 shrink-0">
              F2
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-dourado/20 text-dourado border border-dourado/30 px-2 py-0.5 rounded-full">
                  App Oficial
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Pronto a instalar
                </span>
              </div>

              <h4 className="font-anton text-base text-white mt-1 tracking-wide">
                Instalar App FILDA II
              </h4>
              <p className="text-xs text-white/80 mt-0.5 leading-relaxed">
                Aceda rapidamente à pré-matrícula, cartão digital do atleta e notificações sem usar
                navegador.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleInstalar}
                  type="button"
                  className="btn-gold rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-dourado/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  Instalar Agora
                </button>
                <button
                  onClick={fecharBanner}
                  type="button"
                  className="text-xs text-white/60 hover:text-white font-medium px-2 py-1"
                >
                  Agora Não
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Instruções iOS */}
      {mostrarInstrucoesIOS && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-dourado/40 rounded-3xl p-6 max-w-sm w-full text-white relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setMostrarInstrucoesIOS(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-full bg-white/10"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-dourado/20 border border-dourado/40 flex items-center justify-center text-dourado mb-4">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="font-anton text-xl text-dourado tracking-wide">
              Instalar no iPhone / iPad
            </h3>
            <p className="text-xs text-white/80 mt-1">
              Siga os passos simples para adicionar o App FILDA II à sua Tela de Início:
            </p>

            <div className="mt-5 space-y-3.5 text-xs text-white/90">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <span>
                  <strong>1.</strong> Toque no botão <strong>Compartilhar</strong> na barra do
                  Safari.
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-dourado/20 text-dourado flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>
                  <strong>2.</strong> Role para baixo e selecione{" "}
                  <strong>"Adicionar à Tela de Início"</strong>.
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>
                  <strong>3.</strong> Confirme clicando em <strong>"Adicionar"</strong> no canto
                  superior.
                </span>
              </div>
            </div>

            <button
              onClick={() => setMostrarInstrucoesIOS(false)}
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
