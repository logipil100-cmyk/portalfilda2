/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

import React from "react";
import { Home, Sparkles, Trophy, QrCode, Shield, Bell, UserCheck } from "lucide-react";

interface MobileBottomNavProps {
  abaAtiva: string;
  setAbaAtiva: (aba: string) => void;
  onAbrirCarteira: () => void;
  onAbrirNotificacoes: () => void;
  notificacoesNaoLidasCount?: number;
}

export function MobileBottomNav({
  abaAtiva,
  setAbaAtiva,
  onAbrirCarteira,
  onAbrirNotificacoes,
  notificacoesNaoLidasCount = 2,
}: MobileBottomNavProps) {
  const vibrate = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15);
    }
  };

  const tabs = [
    {
      id: "inicio",
      label: "Início",
      icon: Home,
      action: () => {
        vibrate();
        setAbaAtiva("inicio");
        const el = document.getElementById("hero");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      id: "matricula",
      label: "Matrícula",
      icon: Sparkles,
      highlight: true,
      action: () => {
        vibrate();
        setAbaAtiva("matricula");
        const el = document.getElementById("matricula");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      id: "carteira",
      label: "Carteira QR",
      icon: QrCode,
      action: () => {
        vibrate();
        vibrate();
        onAbrirCarteira();
      },
    },
    {
      id: "ranking",
      label: "Ranking",
      icon: Trophy,
      action: () => {
        vibrate();
        setAbaAtiva("ranking");
        const el = document.getElementById("ranking");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      id: "painel",
      label: "Painel",
      icon: Shield,
      action: () => {
        vibrate();
        setAbaAtiva("painel");
        window.location.href = "/painel";
      },
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#0b1220]/95 backdrop-blur-xl border-t border-dourado/20 pb-safe pt-1 px-2 shadow-2xl">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = abaAtiva === tab.id;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                onClick={tab.action}
                type="button"
                className="relative -top-3 flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-dourado to-yellow-300 text-black flex items-center justify-center shadow-lg shadow-dourado/40 border-2 border-[#0b1220] transform active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-dourado mt-0.5 tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={tab.action}
              type="button"
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 active:scale-95 ${
                isSelected ? "text-dourado font-bold" : "text-white/60 hover:text-white/90"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isSelected ? "stroke-[2.5]" : "stroke-2"}`} />
                {isSelected && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-dourado" />
                )}
              </div>
              <span className="text-[10px] font-medium mt-1 truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
