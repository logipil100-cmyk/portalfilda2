/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

import React from "react";
import { Bell, Smartphone, Sparkles, QrCode, Shield, LogIn, CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";

interface MobileAppHeaderProps {
  onAbrirCarteira: () => void;
  onAbrirNotificacoes: () => void;
  onAbrirLogin: () => void;
  modoApp: boolean;
  setModoApp: (val: boolean) => void;
}

export function MobileAppHeader({
  onAbrirCarteira,
  onAbrirNotificacoes,
  onAbrirLogin,
  modoApp,
  setModoApp,
}: MobileAppHeaderProps) {
  const { db, usuario, logout } = useStore();

  return (
    <div className="bg-[#0b1220]/95 backdrop-blur-md border-b border-dourado/20 sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {db.config.logoURL ? (
          <img
            src={db.config.logoURL}
            alt="Logo"
            className="w-8 h-8 rounded-full object-cover border border-dourado/50 shadow-md shadow-dourado/20"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-dourado/20 border border-dourado/50 flex items-center justify-center text-dourado font-anton text-sm shadow-md shadow-dourado/20">
            F2
          </div>
        )}

        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-anton text-lg text-dourado tracking-wider leading-none">
              {db.config.nome}
            </span>
            <span className="bg-dourado/20 text-dourado text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-dourado/30 uppercase tracking-widest">
              APP
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Nuvem Ativa</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle Mode Button */}
        <button
          onClick={() => setModoApp(!modoApp)}
          type="button"
          className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-dourado bg-dourado/10 border border-dourado/30 px-2.5 py-1 rounded-xl hover:bg-dourado/20 transition-all"
          title={modoApp ? "Alternar para Modo Website" : "Alternar para Modo App"}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{modoApp ? "Modo Web" : "Modo App"}</span>
        </button>

        {/* Carteira Button */}
        <button
          onClick={onAbrirCarteira}
          type="button"
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-dourado/40 text-dourado transition-all active:scale-95"
          title="Carteira Digital do Atleta"
        >
          <QrCode className="w-4 h-4" />
        </button>

        {/* Notifications Button */}
        <button
          onClick={onAbrirNotificacoes}
          type="button"
          className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:border-dourado/40 text-white hover:text-dourado transition-all active:scale-95"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-dourado animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-dourado" />
        </button>

        {/* User Login / Profile Button */}
        {usuario ? (
          <a
            href="/painel"
            className="flex items-center gap-1.5 bg-dourado/20 border border-dourado/50 text-dourado rounded-xl px-2.5 py-1.5 text-xs font-bold hover:bg-dourado/30 transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden xs:inline max-w-[80px] truncate">{usuario.nome}</span>
          </a>
        ) : (
          <button
            onClick={onAbrirLogin}
            type="button"
            className="btn-gold rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1 shadow-md shadow-dourado/10 active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
        )}
      </div>
    </div>
  );
}
