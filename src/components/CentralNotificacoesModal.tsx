/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

import React from "react";
import {
  X,
  Bell,
  Calendar,
  Trophy,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";

interface CentralNotificacoesModalProps {
  aberto: boolean;
  onFechar: () => void;
}

export function CentralNotificacoesModal({ aberto, onFechar }: CentralNotificacoesModalProps) {
  const { db } = useStore();

  if (!aberto) return null;

  const notificacoes = [
    {
      id: "1",
      titulo: "Pré-Matrículas Abetas 2026",
      mensagem:
        "Vagas limitadas para as categorias Sub-11, Sub-13, Sub-15, Sub-17, Sub-20 e Adulto.",
      data: "Hoje, 09:30",
      tipo: "urgente",
      icon: Sparkles,
    },
    {
      id: "2",
      titulo: "Próximo Treino de Avaliação",
      mensagem:
        "Campo da FILDA II - Sextas e Sábados às 08:00. Compareça com equipamento desportivo.",
      data: "Ontem, 16:45",
      tipo: "info",
      icon: Calendar,
    },
    {
      id: "3",
      titulo: "Top 10 Atletas do Mês",
      mensagem: "Consulte o ranking de assiduidade e disciplina no aplicativo.",
      data: "Há 2 dias",
      tipo: "sucesso",
      icon: Trophy,
    },
    {
      id: "4",
      titulo: "Pagamento de Mensalidades",
      mensagem:
        "Lembramos a todos os encarregados que as mensalidades expiram no dia 10 de cada mês.",
      data: "Há 3 dias",
      tipo: "alerta",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-dourado/40 rounded-3xl p-6 max-w-md w-full text-white relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          type="button"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-dourado/20 border border-dourado/40 flex items-center justify-center text-dourado shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-dourado/20 text-dourado border border-dourado/30 px-2 py-0.5 rounded-full">
              App Central
            </span>
            <h3 className="font-anton text-xl text-dourado tracking-wide mt-0.5">
              Notificações & Avisos
            </h3>
          </div>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {notificacoes.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-3.5 hover:border-dourado/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-dourado/20 text-dourado flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs text-white">{notif.titulo}</h4>
                  </div>
                  <span className="text-[10px] text-white/40 shrink-0">{notif.data}</span>
                </div>
                <p className="text-xs text-white/70 mt-2 leading-relaxed pl-9">{notif.mensagem}</p>
              </div>
            );
          })}
        </div>

        <button
          onClick={onFechar}
          type="button"
          className="w-full mt-5 btn-gold rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider"
        >
          Fechar Notificações
        </button>
      </div>
    </div>
  );
}
