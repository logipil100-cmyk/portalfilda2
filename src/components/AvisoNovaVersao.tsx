/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto.
 */

// ============================================================================
//  AVISO DE NOVA VERSÃO — detecta um novo deploy e convida o utilizador a
//  actualizar. A actualização apenas recarrega a aplicação e limpa a cache
//  antiga: os dados locais (sessão e base local) são preservados.
// ============================================================================

import { useEffect, useState } from "react";
import { RefreshCw, X, Sparkles } from "lucide-react";

const INTERVALO_MS = 60_000; // verifica a cada 60 segundos

async function lerVersao(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const dados = (await res.json()) as { versao?: string };
    return dados.versao ?? null;
  } catch {
    return null;
  }
}

export function AvisoNovaVersao() {
  const [novaVersao, setNovaVersao] = useState<string | null>(null);
  const [dispensado, setDispensado] = useState(false);
  const [aActualizar, setAActualizar] = useState(false);

  useEffect(() => {
    let activo = true;
    let versaoAtual: string | null = null;

    const verificar = async () => {
      const versao = await lerVersao();
      if (!activo || !versao) return;
      if (versaoAtual === null) {
        versaoAtual = versao;
        return;
      }
      if (versao !== versaoAtual) setNovaVersao(versao);
    };

    verificar();
    const timer = setInterval(verificar, INTERVALO_MS);
    const aoFocar = () => verificar();
    window.addEventListener("focus", aoFocar);

    return () => {
      activo = false;
      clearInterval(timer);
      window.removeEventListener("focus", aoFocar);
    };
  }, []);

  async function actualizarAgora() {
    setAActualizar(true);
    try {
      // Limpa apenas caches de rede/PWA — nunca localStorage (dados do utilizador).
      if ("caches" in window) {
        const chaves = await caches.keys();
        await Promise.all(chaves.map((c) => caches.delete(c)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update().catch(() => undefined)));
      }
    } catch {
      /* segue para o reload de qualquer forma */
    }
    window.location.reload();
  }

  if (!novaVersao || dispensado) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-[70] w-[min(92vw,26rem)] -translate-x-1/2 sm:bottom-6 sm:left-6 sm:translate-x-0">
      <div className="glass flex items-start gap-3 rounded-2xl border border-dourado/40 bg-[#0f172a]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-md">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-dourado/40 bg-dourado/20 text-dourado">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-anton text-sm uppercase tracking-wide text-dourado">
            Nova versão disponível
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-white/80">
            Já existe uma actualização do app da FILDA II. Actualize para receber as novidades — os
            seus dados são mantidos.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={actualizarAgora}
              disabled={aActualizar}
              className="btn-gold flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${aActualizar ? "animate-spin" : ""}`} />
              {aActualizar ? "A actualizar…" : "Actualizar agora"}
            </button>
            <button
              type="button"
              onClick={() => setDispensado(true)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70 hover:bg-white/10"
            >
              Mais tarde
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDispensado(true)}
          aria-label="Fechar aviso"
          className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
