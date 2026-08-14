/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto.
 */

import React, { useRef, useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { enviarImagem, validarImagem, TAMANHO_MAXIMO_MB } from "@/lib/storage";

interface UploadImagemProps {
  /** Pasta no Firebase Storage (ex: "galeria") */
  pasta: string;
  /** Chamado quando o upload termina com sucesso */
  onConcluido: (dados: { url: string; storagePath: string }) => void;
  /** Pré-visualização actual (URL já existente) */
  previa?: string;
  label?: string;
  className?: string;
}

export function UploadImagem({
  pasta,
  onConcluido,
  previa,
  label = "Carregar imagem do dispositivo",
  className = "",
}: UploadImagemProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [progresso, setProgresso] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [previaLocal, setPreviaLocal] = useState<string | null>(null);

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    setSucesso(false);

    const invalido = validarImagem(file);
    if (invalido) {
      setErro(invalido);
      e.target.value = "";
      return;
    }

    setPreviaLocal(URL.createObjectURL(file));
    setProgresso(0);
    try {
      const res = await enviarImagem(file, pasta, setProgresso);
      onConcluido({ url: res.url, storagePath: res.storagePath });
      setSucesso(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha no envio da imagem.");
      setPreviaLocal(null);
    } finally {
      setProgresso(null);
      e.target.value = "";
    }
  }

  const imagem = previaLocal || previa;
  const aEnviar = progresso !== null;

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={aoEscolher}
        className="hidden"
      />

      {imagem && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <img src={imagem} alt="Pré-visualização" className="h-full w-full object-cover" />
          {aEnviar && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70">
              <Loader2 className="h-5 w-5 animate-spin text-dourado" />
              <span className="text-[11px] font-bold text-dourado">{progresso}%</span>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={aEnviar}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-dourado/40 bg-dourado/10 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-dourado transition-all hover:bg-dourado/20 disabled:opacity-60"
      >
        {aEnviar ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        {aEnviar ? `A enviar… ${progresso}%` : label}
      </button>

      {aEnviar && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-dourado transition-all"
            style={{ width: `${progresso ?? 0}%` }}
          />
        </div>
      )}

      {erro && (
        <p className="flex items-start gap-1.5 text-[10px] font-semibold text-red-400">
          <AlertTriangle className="mt-px h-3 w-3 shrink-0" /> {erro}
        </p>
      )}
      {sucesso && !erro && (
        <p className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
          <CheckCircle2 className="h-3 w-3" /> Imagem carregada com sucesso.
        </p>
      )}
      <p className="text-[9px] text-white/40">
        JPG, JPEG, PNG ou WEBP · máximo {TAMANHO_MAXIMO_MB} MB
      </p>
    </div>
  );
}
