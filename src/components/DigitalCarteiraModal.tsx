/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  QrCode,
  ShieldCheck,
  UserCheck,
  Calendar,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
} from "lucide-react";
import { useStore, formatKZ, type Aluno } from "@/lib/store";
import { CartaoAtletaOficial } from "@/routes/painel";

interface DigitalCarteiraModalProps {
  aberto: boolean;
  onFechar: () => void;
}

export function DigitalCarteiraModal({ aberto, onFechar }: DigitalCarteiraModalProps) {
  const { db } = useStore();
  const [idDigitado, setIdDigitado] = useState("");
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [erro, setErro] = useState("");

  const handleBuscarPorId = (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    const termo = idDigitado.trim();
    if (!termo) {
      setErro("Por favor, digite o ID do atleta ou da pré-matrícula.");
      return;
    }

    // Match by full ID, or last digits, or exact match
    const encontrado = db.alunos.find(
      (a) =>
        a.id.toLowerCase() === termo.toLowerCase() ||
        a.id.toLowerCase().endsWith(termo.toLowerCase()) ||
        a.nif?.toLowerCase() === termo.toLowerCase() ||
        a.telefoneEncarregado.replaceAll(" ", "") === termo.replaceAll(" ", ""),
    );

    if (encontrado) {
      setAlunoSelecionado(encontrado);
    } else {
      setErro("Nenhum atleta encontrado com o ID informado. Verifique e tente novamente.");
    }
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-dourado/40 rounded-3xl p-5 sm:p-6 max-w-lg w-full text-white relative shadow-2xl my-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          type="button"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-dourado/20 border border-dourado/40 flex items-center justify-center text-dourado shadow-inner">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-dourado/20 text-dourado border border-dourado/30 px-2 py-0.5 rounded-full">
              Passe de Acesso
            </span>
            <h3 className="font-anton text-xl text-dourado tracking-wide mt-0.5">
              Carteira Digital do Atleta
            </h3>
          </div>
        </div>

        {alunoSelecionado ? (
          <div>
            <button
              onClick={() => setAlunoSelecionado(null)}
              type="button"
              className="text-xs text-dourado font-bold flex items-center gap-1 mb-3 hover:underline"
            >
              ← Consultar outro atleta
            </button>

            <div className="bg-[#0b1220] p-4 rounded-2xl border border-dourado/30 shadow-xl">
              <CartaoAtletaOficial aluno={alunoSelecionado} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => window.print()}
                type="button"
                className="flex-1 btn-gold rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Guardar Carteira
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 text-dourado text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Consulta Privada Protegida</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Para proteger os dados e privacidade de cada atleta e evitar exposição pública,
                digite o <strong>ID do Atleta / Número da Pré-Matrícula</strong> de forma
                confidencial.
              </p>
            </div>

            <form onSubmit={handleBuscarPorId} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1.5">
                  ID do Atleta ou Telefone do Encarregado:
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={idDigitado}
                    onChange={(e) => {
                      setIdDigitado(e.target.value);
                      setErro("");
                    }}
                    placeholder="Ex: ALT-84920, 923000111..."
                    className="w-full bg-white/5 border border-white/15 focus:border-dourado rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {erro && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs font-medium">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-gold rounded-xl py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-dourado/20 active:scale-98 transition-all"
              >
                <QrCode className="w-4 h-4" />
                Acessar Carteira Digital
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
