/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

// ============================================================================
//  PAINEL (/painel) — 4 painéis, um por perfil de utilizador.
//   • admin      -> "É DEUS" — muda TUDO (config, logo, utilizadores, turmas, alunos, pagamentos, CMS)
//   • secretaria -> gere alunos, pagamentos, expiração, CMS, cobrança WhatsApp em massa
//   • mister     -> chamada, pontuação e edição de alunos das suas turmas
//   • pai        -> vê os seus educandos
// ============================================================================

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { pedirConfirmacao, mostrarAlerta } from "@/lib/dialogs";
import { UploadImagem } from "@/components/UploadImagem";
import { apagarImagem } from "@/lib/storage";
import {
  useStore,
  formatKZ,
  novoId,
  formatarEmbedUrl,
  type Perfil,
  type Usuario,
  type Aluno,
  type Categoria,
  type DB,
  type PlanoItem,
  type GaleriaItem,
  type VideoItem,
  type FaqItem,
  type Jogo,
  type Anuncio,
  criptografarSenha,
} from "@/lib/store";
import {
  LogOut,
  Users,
  DollarSign,
  ClipboardList,
  Trophy,
  Home,
  Trash2,
  Plus,
  MessageCircle,
  Edit3,
  Image as ImageIcon,
  Settings,
  Layers,
  UserPlus,
  Save,
  X,
  History,
  Video,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Send,
  Bell,
  Phone,
  Download,
  BarChart2,
  Sliders,
  Award,
  CalendarDays,
  Activity,
  Shield,
  Check,
  Info,
  Megaphone,
  Volume2,
  Printer,
  Search,
  User,
  Clock,
  XCircle,
  UserCheck,
  UserX,
} from "lucide-react";

function exportarParaCSV(
  nomeArquivo: string,
  colunas: string[],
  linhas: (string | number | undefined)[][],
) {
  const conteudo = [
    colunas.join(";"),
    ...linhas.map((l) => l.map((item) => `"${String(item ?? "").replace(/"/g, '""')}"`).join(";")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${nomeArquivo}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel — FILDA II" },
      { name: "description", content: "Painel de gestão da escola de futebol FILDA II." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

function NotificacaoAnunciosModal() {
  const { db, atualizar, usuario } = useStore();
  const [anuncioAtual, setAnuncioAtual] = useState<Anuncio | null>(null);

  useMemo(() => {
    if (!usuario || !db.anuncios) return;
    // Mostrar anúncios não lidos apenas para quem não for admin nem secretaria, ou para encarregados
    const unread = db.anuncios.find((an) => !an.lidosPor || !an.lidosPor.includes(usuario.id));
    if (unread) {
      setAnuncioAtual(unread);
    } else {
      setAnuncioAtual(null);
    }
  }, [db.anuncios, usuario]);

  if (!anuncioAtual || !usuario) return null;

  function marcarComoLido() {
    if (!anuncioAtual || !usuario) return;
    atualizar(
      (d) => {
        if (!d.anuncios) return;
        const an = d.anuncios.find((x) => x.id === anuncioAtual.id);
        if (an) {
          if (!an.lidosPor) an.lidosPor = [];
          if (!an.lidosPor.includes(usuario.id)) {
            an.lidosPor.push(usuario.id);
          }
        }
      },
      {
        acao: "editar",
        entidade: "anuncio",
        detalhe: `Aviso "${anuncioAtual.titulo}" visualizado por ${usuario.nome}`,
      },
    );
    setAnuncioAtual(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass bg-slate-950/90 border border-dourado/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-dourado/20 border border-dourado flex items-center justify-center text-dourado animate-pulse">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-dourado/20 text-dourado border border-dourado/30">
              Notificação • Visualização Única
            </span>
            <h3 className="font-anton text-xl text-white mt-1">{anuncioAtual.titulo}</h3>
          </div>
        </div>

        <div className="text-sm text-white/90 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10 mb-4 whitespace-pre-wrap">
          {anuncioAtual.mensagem}
        </div>

        <div className="flex items-center justify-between text-xs text-white/50 mb-6">
          <span>
            Enviado por: <strong className="text-white/80">{anuncioAtual.criadoPor}</strong>
          </span>
          <span>Data: {anuncioAtual.data}</span>
        </div>

        <div className="bg-dourado/10 border border-dourado/30 rounded-lg p-3 text-xs text-dourado mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            Para poupar espaço no Firebase, esta mensagem tem visualização única e desaparecerá ao
            confirmar a leitura.
          </span>
        </div>

        <button
          onClick={marcarComoLido}
          className="w-full btn-gold rounded-xl py-3 font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all cursor-pointer"
        >
          <Check className="w-5 h-5" /> Li e Entendi (Marcar como Visto)
        </button>
      </div>
    </div>
  );
}

function Painel() {
  const { usuario, logout } = useStore();
  const navigate = useNavigate();

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <h1 className="font-anton text-2xl text-dourado mb-2">Acesso restrito</h1>
          <p className="text-sm text-white/70 mb-4">Faz login primeiro para aceder ao painel.</p>
          <button onClick={() => navigate({ to: "/" })} className="btn-gold rounded-lg px-4 py-2">
            Voltar ao site
          </button>
        </div>
      </div>
    );
  }

  // Tela de Conta Pendente de Aprovação do Administrador
  if (usuario.status === "pendente") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black/90">
        <div className="glass rounded-3xl p-8 text-center max-w-lg border border-yellow-500/40 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center text-yellow-400 mx-auto animate-pulse">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              🟡 Aguardando Autorização do Administrador
            </span>
            <h1 className="font-anton text-2xl text-white pt-2">Conta Registada com Sucesso</h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Olá, <strong className="text-dourado">{usuario.nome}</strong>! A sua conta foi
              registada no sistema da <strong className="text-white">FILDA II</strong>.
            </p>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left space-y-2 text-xs text-white/70">
            <p className="font-semibold text-dourado flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-dourado" /> O que falta para ter acesso total?
            </p>
            <p className="leading-relaxed">
              O Administrador do sistema precisa autorizar o seu cadastro e atribuir a sua função (
              <strong>Secretaria</strong>, <strong>Mister</strong> ou{" "}
              <strong>Encarregado de Educação</strong>).
            </p>
            <p className="text-white/50 italic pt-1">
              Assim que o Administrador aprovar, este painel será liberado automaticamente.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 btn-gold rounded-xl py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-dourado/20"
            >
              <RefreshCw className="w-4 h-4" /> Verificar Status
            </button>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de Conta Rejeitada
  if (usuario.status === "rejeitado") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black/90">
        <div className="glass rounded-3xl p-8 text-center max-w-lg border border-red-500/40 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              🔴 Acesso Não Autorizado
            </span>
            <h1 className="font-anton text-2xl text-white pt-2">Solicitação Rejeitada</h1>
            <p className="text-sm text-white/70 leading-relaxed">
              A sua solicitação de acesso não foi aprovada pelo Administrador. Contacte a Secretaria
              da FILDA II para esclarecimentos.
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const perfNorm = (usuario?.perfil || "").toLowerCase().trim();
  const Conteudo =
    perfNorm === "admin"
      ? PainelAdmin
      : perfNorm === "mister"
        ? PainelMister
        : perfNorm === "pai" || perfNorm === "encarregado" || perfNorm === "aluno"
          ? PainelPai
          : PainelSecretaria;

  return (
    <div className="min-h-screen">
      <header className="glass px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="font-anton text-lg text-dourado">
            Painel {(usuario?.perfil || "secretaria").toUpperCase()}
          </h1>
          <p className="text-xs text-muted-foreground">Bem-vindo, {usuario?.nome}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-white/5"
          >
            <Home className="w-4 h-4" /> Site
          </button>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        <NotificacaoAnunciosModal />
        <Conteudo />
      </main>
    </div>
  );
}

// ============================================================================
//  PAINEL DO ADMIN — "É DEUS" — pode mudar tudo
// ============================================================================
function PainelAdmin() {
  const { db, atualizar } = useStore();
  const [aba, setAba] = useState<
    | "visao"
    | "usuarios"
    | "turmas"
    | "alunos"
    | "cartao"
    | "jogos"
    | "pagamentos"
    | "cms"
    | "config"
    | "historico"
    | "anuncios"
  >("visao");

  const totalAlunos = db.alunos.length;
  const alunosAtivos = db.alunos.filter(
    (a) => a.status === "ativo" || a.statusPagamento === "PAGO",
  ).length;
  const inadimplentes = db.alunos.filter(
    (a) => a.status === "inadimplente" || a.statusPagamento === "NÃO PAGO",
  ).length;
  const mesAtualStr = new Date().toISOString().slice(0, 7);
  const receitaMes = db.pagamentos
    .filter((p) => p.status === "pago" && p.mesAno === mesAtualStr)
    .reduce((s, p) => s + (Number(p.valor) || 0), 0);

  return (
    <>
      <Tabs
        aba={aba}
        setAba={setAba as (s: string) => void}
        abas={[
          { id: "visao", label: "Visão Geral", icon: Trophy },
          { id: "usuarios", label: "Utilizadores", icon: Users },
          { id: "turmas", label: "Turmas", icon: Layers },
          { id: "alunos", label: "Alunos & Status", icon: UserPlus },
          { id: "cartao", label: "Cartões de Atleta (ID)", icon: Award },
          { id: "jogos", label: "Jogos & Convocatórias", icon: CalendarDays },
          { id: "pagamentos", label: "Mensalidades & Expiração", icon: DollarSign },
          { id: "anuncios", label: "Avisos aos Pais", icon: Megaphone },
          { id: "cms", label: "CMS Conteúdo", icon: ImageIcon },
          { id: "config", label: "Configuração", icon: Settings },
          { id: "historico", label: "Histórico", icon: History },
        ]}
      />

      {aba === "visao" && (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Alunos" valor={totalAlunos} />
            <StatCard label="Ativos / Pagos" valor={alunosAtivos} />
            <StatCard label="NÃO PAGOS" valor={inadimplentes} destaque />
            <StatCard label="Receita do Mês" valor={formatKZ(receitaMes)} />
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="font-anton text-lg text-dourado flex items-center gap-2">
                <Trophy className="w-5 h-5 text-dourado" /> Top 10 Melhores Alunos (Pontos & Menores
                Faltas)
              </h3>
              <span className="text-[11px] text-white/60 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                Maior Pontuação · Menor nº de Faltas
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {[...db.alunos]
                .sort((a, b) => {
                  const ptsA = a.pontos || 0;
                  const ptsB = b.pontos || 0;
                  if (ptsB !== ptsA) return ptsB - ptsA;
                  return (a.faltas || 0) - (b.faltas || 0);
                })
                .slice(0, 10)
                .map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                          i === 0
                            ? "bg-dourado text-black shadow-md shadow-dourado/20"
                            : i === 1
                              ? "bg-slate-300 text-black"
                              : i === 2
                                ? "bg-amber-700 text-white"
                                : "bg-white/10 text-white/70"
                        }`}
                      >
                        {i + 1}º
                      </span>
                      {a.fotoURL ? (
                        <img
                          src={a.fotoURL}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-white/15 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-dourado/10 border border-dourado/30 flex items-center justify-center text-dourado shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-white truncate">{a.nome}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {a.sub ||
                            db.categorias.find((c) => c.id === a.categoriaId)?.nome ||
                            "Sem turma"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-dourado text-xs bg-dourado/10 px-2 py-0.5 rounded border border-dourado/20">
                        ⚽ {a.pontos || 0} pts
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          (a.faltas || 0) > 0
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-green-500/10 text-green-400 border border-green-500/20"
                        }`}
                      >
                        {(a.faltas || 0) > 0 ? `${a.faltas} falta(s)` : "0 faltas"}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {aba === "usuarios" && <GestaoUsuarios />}
      {aba === "turmas" && <GestaoTurmas />}
      {aba === "alunos" && <GestaoAlunos podeApagar />}
      {aba === "cartao" && <GestaoCartoes />}
      {aba === "jogos" && <GestaoJogos />}
      {aba === "pagamentos" && <GestaoPagamentos />}
      {aba === "anuncios" && <GestaoAnuncios />}
      {aba === "cms" && <GestaoCMS />}
      {aba === "config" && <GestaoConfig />}
      {aba === "historico" && <HistoricoAuditoria />}
    </>
  );
}

// ---------- Gestão de Utilizadores (admin e secretaria) ------------------------
function GestaoUsuarios() {
  const { db, atualizar } = useStore();
  const [form, setForm] = useState<Partial<Usuario>>({ perfil: "secretaria" });
  const [mostrarSenhaForm, setMostrarSenhaForm] = useState(false);
  const [busca, setBusca] = useState("");

  const todosUsuarios = db?.usuarios || [];
  const totalUsuarios = todosUsuarios.length;
  const countAdmin = todosUsuarios.filter((u) => u?.perfil === "admin").length;
  const countSec = todosUsuarios.filter((u) => u?.perfil === "secretaria").length;
  const countMister = todosUsuarios.filter((u) => u?.perfil === "mister").length;
  const countPai = todosUsuarios.filter(
    (u) => u?.perfil === "pai" || u?.perfil === "encarregado",
  ).length;

  async function guardar() {
    if (!form.nome?.trim() || !form.user?.trim() || !form.senha?.trim()) {
      await mostrarAlerta("Preencha o Nome, Login e Senha para criar o utilizador.");
      return;
    }

    const loginTrim = form.user.trim();
    const loginExiste = todosUsuarios.some(
      (u) => u && u.user && u.user.toLowerCase() === loginTrim.toLowerCase(),
    );

    if (loginExiste) {
      await mostrarAlerta(`O login "${loginTrim}" já está em uso por outro utilizador.`);
      return;
    }

    const novo: Usuario = {
      id: novoId(),
      nome: form.nome.trim(),
      user: loginTrim,
      senha: criptografarSenha(form.senha.trim()),
      perfil: (form.perfil as Perfil) ?? "secretaria",
      telefone: form.telefone?.trim() ?? "",
      status: "ativo",
    };

    atualizar(
      (d) => {
        if (!Array.isArray(d.usuarios)) d.usuarios = [];
        d.usuarios.push(novo);
      },
      {
        acao: "criar",
        entidade: "utilizador",
        detalhe: `Criou ${novo.perfil} "${novo.nome}" (login: ${novo.user})`,
      },
    );

    setForm({ perfil: "secretaria" });
    setMostrarSenhaForm(false);
    await mostrarAlerta(`Utilizador "${novo.nome}" criado com sucesso!`);
  }

  const usuariosLista = todosUsuarios.filter((u) => {
    if (!u) return false;
    if (!busca.trim()) return true;
    const q = busca.toLowerCase().trim();
    return (
      (u.nome || "").toLowerCase().includes(q) ||
      (u.user || "").toLowerCase().includes(q) ||
      (u.perfil || "").toLowerCase().includes(q) ||
      (u.telefone || "").toLowerCase().includes(q)
    );
  });

  const usuariosPendentes = todosUsuarios.filter((u) => u && u.status === "pendente");

  async function aprovarUtilizador(uId: string, perfilEscolhido: Perfil) {
    const target = todosUsuarios.find((x) => x && x.id === uId);
    if (!target) return;

    atualizar(
      (d) => {
        if (!Array.isArray(d.usuarios)) return;
        const x = d.usuarios.find((y) => y && y.id === uId);
        if (x) {
          x.status = "ativo";
          x.perfil = perfilEscolhido;
        }
      },
      {
        acao: "editar",
        entidade: "utilizador",
        detalhe: `Aprovou o acesso de "${target.nome}" com o perfil de ${perfilEscolhido.toUpperCase()}`,
      },
    );
    await mostrarAlerta(`Acesso de "${target.nome}" aprovado com sucesso!`);
  }

  async function rejeitarUtilizador(uId: string) {
    const target = todosUsuarios.find((x) => x && x.id === uId);
    if (!target) return;

    if (await pedirConfirmacao(`Rejeitar o pedido de acesso de "${target.nome}"?`)) {
      atualizar(
        (d) => {
          if (!Array.isArray(d.usuarios)) return;
          const x = d.usuarios.find((y) => y && y.id === uId);
          if (x) {
            x.status = "rejeitado";
          }
        },
        {
          acao: "editar",
          entidade: "utilizador",
          detalhe: `Rejeitou acesso do utilizador "${target.nome}"`,
        },
      );
    }
  }

  return (
    <div className="grid gap-4">
      {/* Se existirem utilizadores pendentes de aprovação */}
      {usuariosPendentes.length > 0 && (
        <div className="glass rounded-2xl p-5 border-2 border-yellow-500/50 bg-yellow-500/10 shadow-xl space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500 flex items-center justify-center text-yellow-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-anton text-lg text-yellow-400 uppercase tracking-wide flex items-center gap-2">
                Utilizadores Aguardando Aprovação do Administrador ({usuariosPendentes.length})
              </h3>
              <p className="text-xs text-white/80 font-light">
                Contas criadas recentemente via registo ou Google Auth. Atribua o perfil e aprove o
                acesso.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {usuariosPendentes.map((p) => (
              <div
                key={p.id}
                className="bg-black/50 border border-yellow-500/30 rounded-xl p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-sm">{p.nome}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      Pendente
                    </span>
                  </div>
                  <p className="text-xs font-mono text-white/70 mt-1">E-mail / User: {p.user}</p>
                  {p.telefone && <p className="text-xs text-white/60">Tel: {p.telefone}</p>}
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-2 flex-wrap">
                  <select
                    id={`perfil_select_${p.id}`}
                    defaultValue={p.perfil || "pai"}
                    className="input text-xs py-1 px-2 border-white/20 bg-slate-900 text-white rounded flex-1"
                  >
                    <option value="pai">Pai / Encarregado</option>
                    <option value="secretaria">Secretaria</option>
                    <option value="mister">Mister (Treinador)</option>
                    <option value="admin">Admin (Administrador)</option>
                  </select>

                  <button
                    onClick={() => {
                      const sel = document.getElementById(
                        `perfil_select_${p.id}`,
                      ) as HTMLSelectElement;
                      const val = (sel?.value || "pai") as Perfil;
                      aprovarUtilizador(p.id, val);
                    }}
                    className="btn-gold rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Aprovar
                  </button>

                  <button
                    onClick={() => rejeitarUtilizador(p.id)}
                    className="px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/20 text-xs font-semibold cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumo de Utilizadores */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        <div className="glass rounded-xl p-3 border border-white/10 text-center">
          <div className="text-xs text-muted-foreground uppercase font-semibold">Total</div>
          <div className="font-anton text-2xl text-dourado">{totalUsuarios}</div>
        </div>
        <div className="glass rounded-xl p-3 border border-dourado/20 bg-dourado/5 text-center">
          <div className="text-xs text-dourado font-semibold">Administradores</div>
          <div className="font-anton text-2xl text-white">{countAdmin}</div>
        </div>
        <div className="glass rounded-xl p-3 border border-blue-500/20 bg-blue-500/5 text-center">
          <div className="text-xs text-blue-400 font-semibold">Secretaria</div>
          <div className="font-anton text-2xl text-white">{countSec}</div>
        </div>
        <div className="glass rounded-xl p-3 border border-emerald-500/20 bg-emerald-500/5 text-center">
          <div className="text-xs text-emerald-400 font-semibold">Treinadores</div>
          <div className="font-anton text-2xl text-white">{countMister}</div>
        </div>
        <div className="glass rounded-xl p-3 border border-purple-500/20 bg-purple-500/5 text-center">
          <div className="text-xs text-purple-400 font-semibold">Pais / Encarregados</div>
          <div className="font-anton text-2xl text-white">{countPai}</div>
        </div>
      </div>

      {/* Form de Criação */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-anton text-lg text-dourado mb-3 flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Adicionar Novo Utilizador
        </h3>
        <div className="grid md:grid-cols-5 gap-2">
          <input
            placeholder="Nome completo"
            value={form.nome ?? ""}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="input text-xs"
          />
          <input
            placeholder="Login (Nome de Acesso)"
            value={form.user ?? ""}
            onChange={(e) => setForm({ ...form, user: e.target.value })}
            className="input text-xs font-mono"
          />
          <div className="relative flex items-center">
            <input
              type={mostrarSenhaForm ? "text" : "password"}
              placeholder="Senha de acesso"
              value={form.senha ?? ""}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              className="input text-xs font-mono pr-8 w-full"
            />
            <button
              type="button"
              onClick={() => setMostrarSenhaForm(!mostrarSenhaForm)}
              className="absolute right-2 text-white/50 hover:text-white cursor-pointer"
              title={mostrarSenhaForm ? "Ocultar senha" : "Ver senha"}
            >
              {mostrarSenhaForm ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <input
            placeholder="Telefone (+244...)"
            value={form.telefone ?? ""}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            className="input text-xs"
          />
          <select
            value={form.perfil ?? "secretaria"}
            onChange={(e) => setForm({ ...form, perfil: e.target.value as Perfil })}
            className="input text-xs"
          >
            <option value="secretaria">Secretaria (Administrativo)</option>
            <option value="mister">Mister (Treinador)</option>
            <option value="admin">Admin (Administrador Geral)</option>
            <option value="pai">Pai / Encarregado</option>
          </select>
        </div>
        <button
          onClick={guardar}
          className="btn-gold rounded-lg px-4 py-2 mt-3 text-xs inline-flex items-center gap-1.5 shadow-lg cursor-pointer font-bold"
        >
          <Plus className="w-4 h-4" /> Criar Utilizador
        </button>
      </div>

      {/* Lista de Utilizadores */}
      <div className="glass rounded-2xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-anton text-lg text-dourado flex items-center gap-2">
            <Users className="w-5 h-5" /> Utilizadores e Acessos do Sistema
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar utilizadores..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="input pl-8 py-1 text-xs w-52 bg-black/40 border-white/15"
              />
            </div>
            <span className="text-[11px] bg-dourado/10 text-dourado px-2.5 py-1 rounded-lg border border-dourado/30 flex items-center gap-1.5 font-semibold">
              <Shield className="w-3.5 h-3.5" /> Edição Habilitada
            </span>
          </div>
        </div>
        <p className="text-xs text-white/70 mb-4 font-light">
          Pode alterar o <strong>Nome</strong>, o <strong>Login</strong>, a <strong>Senha</strong>,
          o <strong>Perfil</strong> e o <strong>Telefone</strong> de qualquer utilizador. Clique em{" "}
          <strong>Guardar</strong> ou pressione <strong>Enter</strong> para confirmar.
        </p>
        <table className="w-full text-sm min-w-[650px]">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border/80 text-xs">
              <th className="p-2">Nome Completo</th>
              <th className="p-2">Login</th>
              <th className="p-2">Nova Senha</th>
              <th className="p-2">Perfil</th>
              <th className="p-2">Status</th>
              <th className="p-2">Telefone</th>
              <th className="p-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {usuariosLista.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6 text-muted-foreground text-xs">
                  Nenhum utilizador encontrado para a pesquisa.
                </td>
              </tr>
            ) : (
              usuariosLista.map((u, idx) => <UsuarioRow key={u.id || idx} u={u} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsuarioRow({ u }: { u: Usuario }) {
  const { db, atualizar } = useStore();
  const [nome, setNome] = useState(u?.nome || "");
  const [user, setUser] = useState(u?.user || "");
  const [perfil, setPerfil] = useState<Perfil>(u?.perfil || "secretaria");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [telefone, setTelefone] = useState(u?.telefone || "");
  const [status, setStatus] = useState<"ativo" | "pendente" | "rejeitado">(u?.status || "ativo");

  useEffect(() => {
    if (u) {
      setNome(u.nome || "");
      setUser(u.user || "");
      setPerfil(u.perfil || "secretaria");
      setTelefone(u.telefone || "");
      setStatus(u.status || "ativo");
    }
  }, [u]);

  if (!u) return null;

  const isRootAdmin = u.id === "u1" || u.user === "admin";

  const mudou =
    nome !== (u.nome || "") ||
    user !== (u.user || "") ||
    perfil !== (u.perfil || "secretaria") ||
    status !== (u.status || "ativo") ||
    (senha.trim() !== "" && senha !== "••••••••") ||
    telefone !== (u.telefone || "");

  async function guardarModificacoes() {
    const novoNome = nome.trim();
    const novoUser = user.trim();
    const novaSenha = senha.trim();
    const novoTelefone = telefone.trim();
    const novoPerfil = perfil;
    const novoStatus = status;

    if (!novoNome || !novoUser) {
      await mostrarAlerta("O nome e o login não podem estar vazios.");
      return;
    }

    // Se o login mudou, verifica duplicidade
    if (novoUser.toLowerCase() !== (u.user || "").toLowerCase()) {
      const loginExiste = (db?.usuarios || []).some(
        (y) => y && y.id !== u.id && y.user && y.user.toLowerCase() === novoUser.toLowerCase(),
      );
      if (loginExiste) {
        await mostrarAlerta(`O login "${novoUser}" já está em uso por outro utilizador.`);
        return;
      }
    }

    atualizar(
      (d) => {
        if (!Array.isArray(d.usuarios)) d.usuarios = [];
        const x = d.usuarios.find((y) => y && (y.id === u.id || (y.user && y.user === u.user)));
        if (x) {
          x.nome = novoNome;
          x.user = novoUser;
          if (novaSenha && novaSenha !== "••••••••") {
            x.senha = criptografarSenha(novaSenha);
          }
          x.perfil = novoPerfil;
          x.telefone = novoTelefone;
          x.status = novoStatus;
        }
      },
      {
        acao: "editar",
        entidade: "utilizador",
        detalhe: `Atualizou utilizador "${novoNome}" (${novoUser}) — status: ${novoStatus}`,
      },
    );
    setSenha("");
    await mostrarAlerta(`Dados do utilizador "${novoNome}" guardados com sucesso!`);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && mudou) {
      guardarModificacoes();
    }
  };

  // Cores de badge conforme perfil
  const getPerfilBadgeClass = (p: string) => {
    switch (p) {
      case "admin":
        return "bg-dourado/20 text-dourado border-dourado/30";
      case "secretaria":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "mister":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "pai":
      case "encarregado":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-white/10 text-white/80 border-white/20";
    }
  };

  return (
    <tr className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
      <td className="p-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input text-xs"
          placeholder="Nome completo"
        />
      </td>
      <td className="p-2">
        <input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input font-mono text-xs"
          placeholder="Login"
        />
      </td>
      <td className="p-2 relative">
        <div className="relative flex items-center">
          <input
            type={mostrarSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nova senha (opcional)..."
            className="input font-mono text-xs pr-8"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="absolute right-2 text-white/50 hover:text-white cursor-pointer"
            title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
          >
            {mostrarSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </td>
      <td className="p-2">
        {isRootAdmin ? (
          <span className="bg-dourado/20 text-dourado font-bold text-xs px-2.5 py-1 rounded border border-dourado/30 inline-block">
            admin (root)
          </span>
        ) : (
          <select
            value={perfil}
            onChange={(e) => setPerfil(e.target.value as Perfil)}
            className={`input py-1 px-2 text-xs w-auto border rounded ${getPerfilBadgeClass(perfil)}`}
          >
            <option value="secretaria" className="bg-[#0b1220] text-blue-300">
              Secretaria (Recepção)
            </option>
            <option value="mister" className="bg-[#0b1220] text-emerald-300">
              Mister (Treinador)
            </option>
            <option value="admin" className="bg-[#0b1220] text-yellow-300">
              Admin (Administrador)
            </option>
            <option value="pai" className="bg-[#0b1220] text-purple-300">
              Pai / Encarregado
            </option>
          </select>
        )}
      </td>
      <td className="p-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "ativo" | "pendente" | "rejeitado")}
          className={`input py-1 px-2 text-xs w-auto border rounded font-semibold ${
            status === "ativo"
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : status === "pendente"
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                : "bg-red-500/20 text-red-400 border-red-500/30"
          }`}
        >
          <option value="ativo" className="bg-[#0b1220] text-emerald-300">
            🟢 Ativo
          </option>
          <option value="pendente" className="bg-[#0b1220] text-yellow-300">
            🟡 Pendente
          </option>
          <option value="rejeitado" className="bg-[#0b1220] text-red-300">
            🔴 Rejeitado
          </option>
        </select>
      </td>
      <td className="p-2">
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input text-xs"
          placeholder="+244..."
        />
      </td>
      <td className="p-2 flex items-center gap-2">
        {mudou && (
          <button
            onClick={guardarModificacoes}
            className="btn-gold text-xs px-2.5 py-1 rounded flex items-center gap-1 shrink-0 animate-pulse cursor-pointer font-bold"
            title="Guardar alterações no utilizador"
          >
            <Save className="w-3.5 h-3.5" /> Guardar
          </button>
        )}
        {!isRootAdmin ? (
          <button
            onClick={async () => {
              if (await pedirConfirmacao(`Apagar utilizador ${u.nome}?`))
                atualizar(
                  (d) => {
                    if (!Array.isArray(d.usuarios)) d.usuarios = [];
                    d.usuarios = d.usuarios.filter((x) => x && x.id !== u.id);
                  },
                  {
                    acao: "apagar",
                    entidade: "utilizador",
                    detalhe: `Apagou ${u.perfil} "${u.nome}"`,
                  },
                );
            }}
            className="text-red-400 hover:text-red-300 p-1.5 rounded border border-red-500/20 hover:bg-red-500/10 cursor-pointer"
            title="Apagar utilizador"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          !mudou && (
            <span className="text-[10px] text-dourado/70 font-bold px-2 py-1 bg-dourado/10 rounded border border-dourado/20 whitespace-nowrap">
              Root Protegido
            </span>
          )
        )}
      </td>
    </tr>
  );
}

// ---------- Gestão de Turmas (admin) ----------------------------------------
function GestaoTurmas() {
  const { db, atualizar } = useStore();
  const misters = (db?.usuarios || []).filter((u) => u && u.perfil === "mister");
  const [form, setForm] = useState<Partial<Categoria>>({});

  async function criar() {
    if (!form.nome) {
      await mostrarAlerta("O nome da turma é obrigatório.");
      return;
    }
    const nome = form.nome!;
    atualizar(
      (d) => {
        d.categorias.push({
          id: novoId(),
          nome,
          faixaEtaria: form.faixaEtaria ?? "",
          horario: form.horario ?? "",
          vagas: Number(form.vagas ?? 20),
          valor: Number(form.valor ?? 2500),
          misterId: form.misterId ?? "",
        });
      },
      { acao: "criar", entidade: "turma", detalhe: `Criou turma "${nome}"` },
    );
    setForm({});
  }

  return (
    <div className="grid gap-4">
      <div className="glass rounded-2xl p-4">
        <h3 className="font-anton text-lg text-dourado mb-3">Nova turma</h3>
        <div className="grid md:grid-cols-6 gap-2">
          <input
            placeholder="Nome (SUB-14)"
            value={form.nome ?? ""}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="input"
          />
          <input
            placeholder="Faixa etária"
            value={form.faixaEtaria ?? ""}
            onChange={(e) => setForm({ ...form, faixaEtaria: e.target.value })}
            className="input"
          />
          <input
            placeholder="Horário"
            value={form.horario ?? ""}
            onChange={(e) => setForm({ ...form, horario: e.target.value })}
            className="input"
          />
          <input
            type="number"
            placeholder="Vagas"
            value={form.vagas ?? ""}
            onChange={(e) => setForm({ ...form, vagas: Number(e.target.value) })}
            className="input"
          />
          <input
            type="number"
            placeholder="Valor (Kz)"
            value={form.valor ?? ""}
            onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })}
            className="input"
          />
          <select
            value={form.misterId ?? ""}
            onChange={(e) => setForm({ ...form, misterId: e.target.value })}
            className="input"
          >
            <option value="">— Mister —</option>
            {misters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={criar}
          className="btn-gold rounded-lg px-4 py-2 mt-3 text-sm inline-flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Criar turma
        </button>
      </div>

      <div className="glass rounded-2xl p-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-2">Turma</th>
              <th className="p-2">Faixa</th>
              <th className="p-2">Horário</th>
              <th className="p-2">Vagas</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Mister</th>
              <th className="p-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {db.categorias.map((c) => (
              <tr key={c.id} className="border-b border-border/50">
                <td className="p-2 font-semibold">{c.nome}</td>
                <td className="p-2">{c.faixaEtaria}</td>
                <td className="p-2">{c.horario}</td>
                <td className="p-2">{c.vagas}</td>
                <td className="p-2 text-dourado">{formatKZ(c.valor)}</td>
                <td className="p-2">
                  <select
                    defaultValue={c.misterId}
                    onChange={(e) => {
                      const mNovo = misters.find((m) => m.id === e.target.value)?.nome ?? "?";
                      atualizar(
                        (d) => {
                          const x = d.categorias.find((y) => y.id === c.id);
                          if (x) x.misterId = e.target.value;
                        },
                        {
                          acao: "editar",
                          entidade: "turma",
                          detalhe: `Turma "${c.nome}" → mister ${mNovo}`,
                        },
                      );
                    }}
                    className="input"
                  >
                    <option value="">Sem mister atribuído</option>
                    {misters.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <button
                    onClick={async () => {
                      if (await pedirConfirmacao(`Apagar turma ${c.nome}?`))
                        atualizar(
                          (d) => {
                            d.categorias = d.categorias.filter((x) => x.id !== c.id);
                          },
                          {
                            acao: "apagar",
                            entidade: "turma",
                            detalhe: `Apagou turma "${c.nome}"`,
                          },
                        );
                    }}
                    className="text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Configuração da escola (admin — muda logo, cores, textos) --------
function GestaoConfig() {
  const { db, atualizar } = useStore();
  const c = db.config;
  // Helper: cada gravação de campo de config também regista no histórico
  const setCampo = (campo: keyof typeof c, novo: string, num = false) =>
    atualizar(
      (d) => {
        (d.config as unknown as Record<string, string | number>)[campo] = num ? Number(novo) || 0 : novo;
      },
      {
        acao: "editar",
        entidade: "config",
        detalhe: `Alterou "${String(campo)}" → ${novo || "(vazio)"}`,
      },
    );

  const setRedeSocial = (rede: "facebook" | "instagram" | "youtube" | "tiktok", url: string) =>
    atualizar(
      (d) => {
        if (!d.config.redesSociais) d.config.redesSociais = {};
        d.config.redesSociais[rede] = url;
      },
      {
        acao: "editar",
        entidade: "config",
        detalhe: `Alterou rede social "${rede}" → ${url}`,
      },
    );
  return (
    <div className="glass rounded-2xl p-4 grid gap-3 max-w-3xl">
      <h3 className="font-anton text-lg text-dourado">Configuração da escola</h3>
      <div className="grid md:grid-cols-2 gap-3">
        <Campo label="Nome" valor={c.nome} onChange={(v) => setCampo("nome", v)} />
        <Campo label="Lema" valor={c.lema} onChange={(v) => setCampo("lema", v)} />
        <Campo label="Título Hero" valor={c.hero} onChange={(v) => setCampo("hero", v)} />
        <Campo
          label="Imagem Hero (URL)"
          valor={c.heroImageURL}
          onChange={(v) => setCampo("heroImageURL", v)}
        />
        <Campo
          label="Logotipo (URL da imagem)"
          valor={c.logoURL}
          onChange={(v) => setCampo("logoURL", v)}
        />
        <Campo
          label="Cor Dourado (hex)"
          valor={c.corDourado}
          onChange={(v) => setCampo("corDourado", v)}
        />
        <Campo
          label="WhatsApp (Mensagens)"
          valor={c.whatsapp}
          onChange={(v) => setCampo("whatsapp", v)}
        />
        <Campo
          label="Telefone (Ligações Normais)"
          valor={c.telefone || "+244 945 387 697"}
          onChange={(v) => setCampo("telefone", v)}
        />
        <Campo label="Email" valor={c.email} onChange={(v) => setCampo("email", v)} />
        <Campo label="NIF" valor={c.nif} onChange={(v) => setCampo("nif", v)} />
        <Campo
          label="Inscrição (Kz)"
          valor={String(c.valorInscricao ?? 5000)}
          onChange={(v) => setCampo("valorInscricao", v, true)}
        />
        <Campo
          label="Mensalidade Padrão (Kz)"
          valor={String(c.valorMensalidade ?? 2500)}
          onChange={(v) => setCampo("valorMensalidade", v, true)}
        />
        <Campo
          label="Mensalidade Irmãos (Kz)"
          valor={String(c.valorMensalidadeIrmaos ?? 2000)}
          onChange={(v) => setCampo("valorMensalidadeIrmaos", v, true)}
        />
        <Campo
          label="Equipamento Oficial (Kz)"
          valor={String(c.valorEquipamento ?? 6800)}
          onChange={(v) => setCampo("valorEquipamento", v, true)}
        />
        <Campo
          label="Dia de Vencimento"
          valor={String(c.diaVencimento ?? 5)}
          onChange={(v) => setCampo("diaVencimento", v, true)}
        />
        <Campo
          label="Multa de Atraso (Kz)"
          valor={String(c.valorMulta ?? 500)}
          onChange={(v) => setCampo("valorMulta", v, true)}
        />
      </div>
      <div className="pt-3 border-t border-white/10">
        <h4 className="font-anton text-sm text-dourado mb-2">🌐 Links das Redes Sociais</h4>
        <div className="grid md:grid-cols-2 gap-3">
          <Campo
            label="Facebook (URL)"
            valor={c.redesSociais?.facebook || ""}
            onChange={(v) => setRedeSocial("facebook", v)}
          />
          <Campo
            label="Instagram (URL)"
            valor={c.redesSociais?.instagram || ""}
            onChange={(v) => setRedeSocial("instagram", v)}
          />
          <Campo
            label="YouTube (URL)"
            valor={c.redesSociais?.youtube || ""}
            onChange={(v) => setRedeSocial("youtube", v)}
          />
          <Campo
            label="TikTok (URL)"
            valor={c.redesSociais?.tiktok || ""}
            onChange={(v) => setRedeSocial("tiktok", v)}
          />
        </div>
      </div>
      <Campo
        label="Título (Quem Somos / Missão)"
        valor={c.tituloQuemSomos || "Excelência, Disciplina e Cidadania"}
        onChange={(v) => setCampo("tituloQuemSomos", v)}
      />
      <label className="grid gap-1">
        <span className="text-xs text-muted-foreground">Quem Somos (Texto / Descrição)</span>
        <textarea
          rows={4}
          defaultValue={c.quemSomos}
          onBlur={(e) => setCampo("quemSomos", e.target.value)}
          className="input"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-xs text-muted-foreground">Termos</span>
        <textarea
          rows={3}
          defaultValue={c.termos}
          onBlur={(e) => setCampo("termos", e.target.value)}
          className="input"
        />
      </label>
      {c.logoURL && (
        <div className="flex items-center gap-2 text-xs text-white/70">
          <ImageIcon className="w-4 h-4" /> Pré-visualização:
          <img
            src={c.logoURL}
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover border border-dourado"
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Tudo guarda automaticamente ao sair da caixa (e fica registado no Histórico).
      </p>
    </div>
  );
}

// ============================================================================
//  GESTÃO DE ANÚNCIOS / AVISOS DA SECRETARIA AOS PAIS
// ============================================================================
function GestaoAnuncios() {
  const { db, atualizar, usuario } = useStore();
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");

  const lista = db.anuncios || [];
  const totalPais =
    (db?.usuarios || []).filter(
      (u) => u && (u.perfil === "encarregado" || u.perfil === "aluno" || u.perfil === "pai"),
    ).length || 1;

  async function publicarAnuncio(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !mensagem.trim()) {
      await mostrarAlerta("Aviso", "Preencha o título e a mensagem do anúncio.");
      return;
    }

    const novo: Anuncio = {
      id: novoId(),
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      data: new Date().toISOString().slice(0, 10),
      criadoPor: `${usuario?.nome || "Secretaria"} (${usuario?.perfil.toUpperCase() || "ADMIN"})`,
      lidosPor: [],
    };

    atualizar(
      (d) => {
        if (!d.anuncios) d.anuncios = [];
        d.anuncios.unshift(novo);
      },
      {
        acao: "criar",
        entidade: "anuncio",
        detalhe: `Publicou aviso aos pais: "${novo.titulo}"`,
      },
    );

    setTitulo("");
    setMensagem("");
    await mostrarAlerta(
      "Sucesso",
      "Anúncio publicado! Aparecerá como notificação de visualização única para os encarregados de educação.",
    );
  }

  async function apagarAnuncio(id: string, tit: string) {
    if (
      await pedirConfirmacao(
        "Apagar Anúncio",
        `Deseja apagar o anúncio "${tit}" para poupar espaço no Firebase?`,
      )
    ) {
      atualizar(
        (d) => {
          if (!d.anuncios) return;
          d.anuncios = d.anuncios.filter((x) => x.id !== id);
        },
        {
          acao: "apagar",
          entidade: "anuncio",
          detalhe: `Apagou o aviso "${tit}"`,
        },
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-dourado/10 border border-dourado/40 flex items-center justify-center text-dourado">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-anton text-xl text-white">Anúncios / Avisos aos Encarregados</h2>
            <p className="text-xs text-muted-foreground">
              Notificações de visualização única: desaparecem da conta do encarregado após
              confirmadas, poupando espaço no Firebase.
            </p>
          </div>
        </div>

        <form
          onSubmit={publicarAnuncio}
          className="space-y-4 max-w-2xl bg-white/5 p-4 rounded-xl border border-white/10"
        >
          <h3 className="font-bold text-sm text-dourado flex items-center gap-2">
            <Plus className="w-4 h-4" /> Criar Novo Aviso
          </h3>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/80">Título do Aviso</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Convocatória para Reunião Geral de Pais / Entrega de Kits"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-dourado"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/80">Mensagem / Conteúdo</label>
            <textarea
              rows={4}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Descreva aqui o aviso importante. Quando o encarregado aceder ao painel, esta mensagem aparecerá num painel emergente."
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-dourado resize-none"
            />
          </div>
          <button
            type="submit"
            className="btn-gold px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" /> Publicar Anúncio
          </button>
        </form>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/10">
        <h3 className="font-anton text-lg text-white mb-4 flex items-center justify-between">
          <span>Anúncios Ativos ({lista.length})</span>
          <span className="text-xs font-normal text-muted-foreground">
            Total de Encarregados no sistema: <strong className="text-white">{totalPais}</strong>
          </span>
        </h3>

        {lista.length === 0 ? (
          <div className="text-center py-8 text-white/50 text-sm border border-dashed border-white/10 rounded-xl">
            Nenhum anúncio ativo no momento.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lista.map((an) => {
              const lidos = an.lidosPor?.length || 0;
              const perc = Math.min(100, Math.round((lidos / totalPais) * 100));
              return (
                <div
                  key={an.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-white/20 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-white text-base leading-snug">{an.titulo}</h4>
                      <button
                        onClick={() => apagarAnuncio(an.id, an.titulo)}
                        title="Apagar para libertar espaço no Firebase"
                        className="text-white/40 hover:text-red-400 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-white/70 whitespace-pre-wrap mb-4 bg-black/30 p-3 rounded-lg border border-white/5">
                      {an.mensagem}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Por: {an.criadoPor}</span>
                      <span>{an.data}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-dourado">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Lidos por {lidos} de {totalPais} pais
                        </span>
                        <span>{perc}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-dourado h-full transition-all duration-300"
                          style={{ width: `${perc}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
//  PAINEL DA SECRETARIA — alunos, pagamentos, expiração, CMS e cobrança WhatsApp
// ============================================================================
function PainelSecretaria() {
  const [aba, setAba] = useState<
    | "alunos"
    | "usuarios"
    | "cartao"
    | "jogos"
    | "pagamentos"
    | "anuncios"
    | "cms"
    | "cobranca"
    | "historico"
  >("alunos");
  return (
    <>
      <Tabs
        aba={aba}
        setAba={setAba as (s: string) => void}
        abas={[
          { id: "alunos", label: "Atletas & Matrículas", icon: UserPlus },
          { id: "usuarios", label: "Utilizadores", icon: Users },
          { id: "cartao", label: "Cartões de Atleta (ID)", icon: Award },
          { id: "jogos", label: "Jogos & Convocatórias", icon: CalendarDays },
          { id: "pagamentos", label: "Mensalidades & Expiração", icon: DollarSign },
          { id: "anuncios", label: "Avisos aos Pais", icon: Megaphone },
          { id: "cms", label: "CMS Conteúdo", icon: ImageIcon },
          { id: "cobranca", label: "Cobrança WhatsApp", icon: MessageCircle },
          { id: "historico", label: "Histórico", icon: History },
        ]}
      />
      {aba === "alunos" && <GestaoAlunos podeApagar />}
      {aba === "usuarios" && <GestaoUsuarios />}
      {aba === "cartao" && <GestaoCartoes />}
      {aba === "jogos" && <GestaoJogos />}
      {aba === "pagamentos" && <GestaoPagamentos />}
      {aba === "anuncios" && <GestaoAnuncios />}
      {aba === "cms" && <GestaoCMS />}
      {aba === "cobranca" && <CobrancaWhatsApp />}
      {aba === "historico" && <HistoricoAuditoria />}
    </>
  );
}

// ---------- Cobrança WhatsApp em massa --------------------------------------
function CobrancaWhatsApp() {
  const { db, atualizar } = useStore();
  const inadimplentes = db.alunos.filter((a) => a.status === "inadimplente");
  const [msg, setMsg] = useState(
    `Olá! Da parte da ${db.config.nome}: verificámos que a mensalidade do seu educando está em atraso. ` +
      `Por favor regularize o pagamento o quanto antes. Obrigado! ${db.config.whatsapp}`,
  );
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setSelecionados((s) => ({ ...s, [id]: !s[id] }));
  }
  function toggleTodos() {
    const todos = inadimplentes.every((a) => selecionados[a.id]);
    const novo: Record<string, boolean> = {};
    if (!todos)
      inadimplentes.forEach((a) => {
        novo[a.id] = true;
      });
    setSelecionados(novo);
  }

  // Devolve o telefone do encarregado — só dígitos, para o link wa.me
  function telDoAluno(a: Aluno): string | null {
    const pai = (db?.usuarios || []).find((u) => u && u.id === a.encarregadoId);
    const tel = pai?.telefone?.replace(/\D/g, "");
    return tel || null;
  }

  async function enviarEmMassa() {
    const lista = inadimplentes.filter((a) => selecionados[a.id]);
    if (lista.length === 0) {
      await mostrarAlerta("Seleciona pelo menos um aluno.");
      return;
    }
    let abertos = 0;
    const nomes: string[] = [];
    for (const a of lista) {
      const tel = telDoAluno(a);
      if (!tel) continue;
      const texto = msg
        .replace(/{aluno}/g, a.nome)
        .replace(/{valor}/g, formatKZ(a.valorMensalidade));
      const url = `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
      window.open(url, "_blank");
      abertos++;
      nomes.push(a.nome);
    }
    // Regista no histórico apenas se realmente enviou algo
    if (abertos > 0) {
      atualizar(() => {}, {
        acao: "acao",
        entidade: "cobrança",
        detalhe: `Enviou cobrança WhatsApp para ${abertos} encarregado(s): ${nomes.join(", ")}`,
      });
    }
    await mostrarAlerta(
      `Abertas ${abertos} janelas do WhatsApp. Se algo bloqueou, permite pop-ups.`,
    );
  }

  function marcarTodosAtraso() {
    atualizar(
      (d) => {
        d.alunos.forEach((a) => {
          if (a.status !== "ativo") return;
          const mesAtual = new Date().toISOString().slice(0, 7);
          const pago = d.pagamentos.some(
            (p) => p.alunoId === a.id && p.mesAno === mesAtual && p.status === "pago",
          );
          if (!pago) {
            a.status = "inadimplente";
            a.mesesAtraso = (a.mesesAtraso || 0) + 1;
          }
        });
      },
      {
        acao: "acao",
        entidade: "cobrança",
        detalhe: "Marcou automaticamente inadimplentes do mês",
      },
    );
  }

  return (
    <div className="grid gap-4">
      <div className="glass rounded-2xl p-4">
        <h3 className="font-anton text-lg text-dourado mb-2 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" /> Cobrança WhatsApp em massa
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Marca os alunos em atraso, escreve a mensagem (usa <code>{"{aluno}"}</code> e{" "}
          <code>{"{valor}"}</code> como variáveis) e envia. Abre uma janela WhatsApp por cada
          encarregado.
        </p>
        <button
          onClick={marcarTodosAtraso}
          className="rounded-lg border border-red-500/50 text-red-400 px-3 py-1.5 text-xs hover:bg-red-500/10 mb-3"
        >
          Marcar automaticamente inadimplentes do mês
        </button>
        <textarea
          rows={3}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="input w-full"
        />
      </div>

      <div className="glass rounded-2xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-anton text-dourado">Alunos em atraso ({inadimplentes.length})</h4>
          <div className="flex gap-2">
            <button
              onClick={toggleTodos}
              className="rounded-lg border border-border px-3 py-1.5 text-xs"
            >
              Selecionar todos
            </button>
            <button
              onClick={enviarEmMassa}
              className="btn-gold rounded-lg px-4 py-1.5 text-xs inline-flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" /> Enviar cobranças
            </button>
          </div>
        </div>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-2">✓</th>
              <th className="p-2">Aluno</th>
              <th className="p-2">Encarregado</th>
              <th className="p-2">Telefone</th>
              <th className="p-2">Meses atraso</th>
              <th className="p-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {inadimplentes.map((a) => {
              const pai = (db?.usuarios || []).find((u) => u && u.id === a.encarregadoId);
              const tel = telDoAluno(a);
              return (
                <tr key={a.id} className="border-b border-border/50">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={!!selecionados[a.id]}
                      onChange={() => toggle(a.id)}
                    />
                  </td>
                  <td className="p-2">{a.nome}</td>
                  <td className="p-2">{pai?.nome ?? "—"}</td>
                  <td className="p-2 text-xs">
                    {tel ? `+${tel}` : <span className="text-red-400">sem tel.</span>}
                  </td>
                  <td className="p-2 text-red-400 font-bold">{a.mesesAtraso}</td>
                  <td className="p-2 text-dourado">{formatKZ(a.valorMensalidade)}</td>
                </tr>
              );
            })}
            {inadimplentes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
                  Nenhum aluno em atraso 🎉
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Funções Auxiliares de Cobrança / Lembrete WhatsApp --------------
function cleanPhoneAngola(telStr?: string): string | null {
  if (!telStr) return null;
  let clean = telStr.replace(/\D/g, "");
  if (!clean) return null;
  if (clean.length === 9 && clean.startsWith("9")) {
    clean = "244" + clean;
  }
  return clean;
}

function enviarLembreteWhatsAppAluno(
  aluno: Aluno,
  db: DB,
  atualizar: (
    fn: (d: DB) => void,
    log?: { acao: "criar" | "editar" | "apagar" | "acao"; entidade: string; detalhe: string },
  ) => void,
) {
  const pai = (db?.usuarios || []).find((u) => u && u.id === aluno.encarregadoId);
  const telRaw = aluno.telefoneEncarregado || pai?.telefone;
  const tel = cleanPhoneAngola(telRaw);

  if (!tel) {
    mostrarAlerta(
      `O atleta "${aluno.nome}" não possui um número de telefone/WhatsApp válido cadastrado.`,
    );
    return false;
  }

  const nomeEncarregado = aluno.nomeEncarregado || pai?.nome || "Encarregado(a)";
  const nomeAcademia = db.config.nome || "FILDA II - Escola de Futebol";
  const statusAtual =
    aluno.statusPagamento || (aluno.status === "inadimplente" ? "NÃO PAGO" : "PAGO");
  const vencido =
    aluno.dataExpiracao && aluno.dataExpiracao < new Date().toISOString().slice(0, 10);

  let texto = "";
  if (statusAtual === "NÃO PAGO" || vencido) {
    texto =
      `Olá *${nomeEncarregado}*! Da parte da *${nomeAcademia}*:\n\n` +
      `Informamos que a mensalidade do atleta *${aluno.nome}* (${aluno.sub || "Sub-11"}), no valor de *${formatKZ(aluno.valorMensalidade)}*, encontra-se *vencida/pendente*${aluno.dataExpiracao ? ` (expirou em ${aluno.dataExpiracao})` : ""}.\n\n` +
      `Por favor, regularize o pagamento o quanto antes para garantir a continuidade dos treinos e convocações oficiais.\n\n` +
      `Se já efetuou o pagamento, pedimos gentilmente que nos envie o comprovativo por aqui.\n\n` +
      `Agradecemos a colaboração e apoio ao esporte! ⚽🏆\n${db.config.whatsapp ? `Contato da Secretaria: ${db.config.whatsapp}` : ""}`;
  } else {
    texto =
      `Olá *${nomeEncarregado}*! Da parte da *${nomeAcademia}*:\n\n` +
      `Confirmamos que a situação da mensalidade do atleta *${aluno.nome}* (${aluno.sub || "Sub-11"}) está *REGULAR/PAGA*${aluno.dataExpiracao ? ` (válida até ${aluno.dataExpiracao})` : ""}.\n\n` +
      `Obrigado pela pontualidade e preferência em nossa academia! ⚽🔥`;
  }

  const url = `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");

  atualizar(() => {}, {
    acao: "acao",
    entidade: "cobrança",
    detalhe: `Enviou lembrete WhatsApp para "${aluno.nome}" (${tel})`,
  });

  return true;
}

async function enviarLembreteMassaVencidos(
  listaAlunos: Aluno[],
  db: DB,
  atualizar: (
    fn: (d: DB) => void,
    log?: { acao: "criar" | "editar" | "apagar" | "acao"; entidade: string; detalhe: string },
  ) => void,
) {
  const hojeStr = new Date().toISOString().slice(0, 10);
  const vencidos = listaAlunos.filter((a) => {
    const statusAtual = a.statusPagamento || (a.status === "inadimplente" ? "NÃO PAGO" : "PAGO");
    const vencido = a.dataExpiracao && a.dataExpiracao < hojeStr;
    return statusAtual === "NÃO PAGO" || vencido;
  });

  if (vencidos.length === 0) {
    await mostrarAlerta("🎉 Todos os atletas listados estão com as mensalidades em dia!");
    return;
  }

  if (
    !(await pedirConfirmacao(
      `Deseja iniciar o envio automático de lembrete de mensalidade vencida via WhatsApp para os ${vencidos.length} atleta(s) pendente(s)?\n\n(Será aberta uma janela do WhatsApp para cada encarregado com número válido.)`,
    ))
  ) {
    return;
  }

  let abertos = 0;
  const nomes: string[] = [];

  for (const a of vencidos) {
    const pai = (db?.usuarios || []).find((u) => u && u.id === a.encarregadoId);
    const telRaw = a.telefoneEncarregado || pai?.telefone;
    const tel = cleanPhoneAngola(telRaw);
    if (!tel) continue;

    const nomeEncarregado = a.nomeEncarregado || pai?.nome || "Encarregado(a)";
    const nomeAcademia = db.config.nome || "FILDA II - Escola de Futebol";
    const texto =
      `Olá *${nomeEncarregado}*! Da parte da *${nomeAcademia}*:\n\n` +
      `Informamos que a mensalidade do atleta *${a.nome}* (${a.sub || "Sub-11"}), no valor de *${formatKZ(a.valorMensalidade)}*, encontra-se *vencida/pendente*${a.dataExpiracao ? ` (expirou em ${a.dataExpiracao})` : ""}.\n\n` +
      `Por favor, regularize o pagamento para garantir a continuidade nos treinos. Se já pagou, envie-nos o comprovativo.\n\n` +
      `Obrigado! ⚽🏆`;

    const url = `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
    abertos++;
    nomes.push(a.nome);
  }

  if (abertos > 0) {
    atualizar(() => {}, {
      acao: "acao",
      entidade: "cobrança",
      detalhe: `Enviou lembrete em massa via WhatsApp para ${abertos} atleta(s): ${nomes.slice(0, 4).join(", ")}${nomes.length > 4 ? "..." : ""}`,
    });
    await mostrarAlerta(
      `✅ Lembretes enviados! Abertas ${abertos} janela(s) do WhatsApp.\nSe alguma não abriu, verifique se o seu navegador bloqueou pop-ups.`,
    );
  } else {
    await mostrarAlerta(
      "⚠️ Não foi possível abrir o WhatsApp: nenhum dos atletas pendentes possui telefone cadastrado.",
    );
  }
}

// ---------- Gestão de Pagamentos e Expiração --------------------------------
function GestaoPagamentos() {
  const { db, atualizar } = useStore();

  function registarPagamento(alunoId: string) {
    const nome = db.alunos.find((x) => x.id === alunoId)?.nome ?? "?";
    const valor = db.alunos.find((x) => x.id === alunoId)?.valorMensalidade ?? 2500;

    // Calcula 30 dias a partir de hoje
    const hoje = new Date();
    hoje.setDate(hoje.getDate() + 30);
    const dataExp = hoje.toISOString().slice(0, 10);

    atualizar(
      (d) => {
        const a = d.alunos.find((x) => x.id === alunoId);
        if (a) {
          a.status = "ativo";
          a.statusPagamento = "PAGO";
          a.mesesAtraso = 0;
          a.dataExpiracao = dataExp;
        }
        const mesAtual = new Date().toISOString().slice(0, 7);
        const jaTem = d.pagamentos.some(
          (p) => p.alunoId === alunoId && p.mesAno === mesAtual && p.status === "pago",
        );
        if (!jaTem) {
          d.pagamentos.push({
            id: novoId(),
            alunoId,
            tipo: "mensalidade",
            valor: a?.valorMensalidade ?? 2500,
            mesAno: mesAtual,
            status: "pago",
            data: new Date().toISOString().slice(0, 10),
          });
        }
      },
      {
        acao: "criar",
        entidade: "pagamento",
        detalhe: `Registou pagamento de "${nome}" — Expira em ${dataExp}`,
      },
    );
  }

  function alternarStatus(alunoId: string) {
    const aluno = db.alunos.find((x) => x.id === alunoId);
    if (!aluno) return;
    const atual = aluno.statusPagamento || (aluno.status === "inadimplente" ? "NÃO PAGO" : "PAGO");
    const novoStatus = atual === "PAGO" ? "NÃO PAGO" : "PAGO";

    atualizar(
      (d) => {
        const a = d.alunos.find((x) => x.id === alunoId);
        if (a) {
          a.statusPagamento = novoStatus;
          a.status = novoStatus === "PAGO" ? "ativo" : "inadimplente";
          const mesAtual = new Date().toISOString().slice(0, 7);
          if (
            novoStatus === "PAGO" &&
            (!a.dataExpiracao || a.dataExpiracao < new Date().toISOString().slice(0, 10))
          ) {
            const h = new Date();
            h.setDate(h.getDate() + 30);
            a.dataExpiracao = h.toISOString().slice(0, 10);
          }
          if (novoStatus === "PAGO") {
            const jaTem = d.pagamentos.some(
              (p) => p.alunoId === alunoId && p.mesAno === mesAtual && p.status === "pago",
            );
            if (!jaTem) {
              d.pagamentos.push({
                id: novoId(),
                alunoId,
                tipo: "mensalidade",
                valor: a.valorMensalidade || 2500,
                mesAno: mesAtual,
                status: "pago",
                data: new Date().toISOString().slice(0, 10),
              });
            }
          } else {
            d.pagamentos = d.pagamentos.filter(
              (p) => !(p.alunoId === alunoId && p.mesAno === mesAtual && p.status === "pago"),
            );
          }
        }
      },
      {
        acao: "editar",
        entidade: "aluno",
        detalhe: `Alterou status do aluno "${aluno.nome}" para ${novoStatus}`,
      },
    );
  }

  function mudarExpiracao(alunoId: string, novaData: string) {
    atualizar(
      (d) => {
        const a = d.alunos.find((x) => x.id === alunoId);
        if (a) a.dataExpiracao = novaData;
      },
      {
        acao: "editar",
        entidade: "aluno",
        detalhe: `Atualizou expiração para ${novaData}`,
      },
    );
  }

  const hojeStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="glass rounded-3xl p-6 border border-white/10 overflow-x-auto space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="font-anton text-xl text-dourado uppercase tracking-wide">
            Mensalidades, Status & Expiração
          </h3>
          <p className="text-xs text-muted-foreground font-light mt-0.5">
            Gerencie o status de pagamento e a data de expiração. Envie lembrete de mensalidade
            vencida diretamente via WhatsApp.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => {
              const colunas = [
                "ID",
                "Atleta",
                "Encarregado",
                "Telefone",
                "Status Pagamento",
                "Data Expiração",
                "Mensalidade (Kz)",
              ];
              const linhas = db.alunos.map((a) => {
                const statusAtual =
                  a.statusPagamento || (a.status === "inadimplente" ? "NÃO PAGO" : "PAGO");
                return [
                  a.id,
                  a.nome,
                  a.nomeEncarregado || "—",
                  a.telefoneEncarregado || "—",
                  statusAtual,
                  a.dataExpiracao || "Sem data",
                  a.valorMensalidade || 2500,
                ];
              });
              exportarParaCSV("pagamentos_expiracao_filda2", colunas, linhas);
            }}
            className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 text-white"
          >
            <Download className="w-4 h-4 text-dourado" /> Exportar Excel (CSV)
          </button>
          <button
            onClick={() => enviarLembreteMassaVencidos(db.alunos, db, atualizar)}
            className="btn-gold rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-dourado/20 shrink-0 hover:scale-105 transition-transform"
          >
            <MessageCircle className="w-4 h-4 text-black animate-pulse" />
            📲 Lembrete Automático WhatsApp (
            {
              db.alunos.filter(
                (a) =>
                  a.statusPagamento === "NÃO PAGO" ||
                  a.status === "inadimplente" ||
                  (a.dataExpiracao && a.dataExpiracao < hojeStr),
              ).length
            }{" "}
            Vencidos)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
        <div className="bg-gradient-to-br from-green-950/40 via-black to-zinc-900 border border-green-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-green-300 font-bold uppercase tracking-wider block">
              Receita do Mês ({new Date().toISOString().slice(0, 7)})
            </span>
            <span className="font-anton text-2xl text-green-400 mt-1 block">
              {formatKZ(
                db.pagamentos
                  .filter(
                    (p) => p.status === "pago" && p.mesAno === new Date().toISOString().slice(0, 7),
                  )
                  .reduce((s, p) => s + (Number(p.valor) || 0), 0),
              )}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-dourado/10 via-black to-zinc-900 border border-dourado/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-dourado/80 font-bold uppercase tracking-wider block">
              Atletas com Mensalidade Paga
            </span>
            <span className="font-anton text-2xl text-white mt-1 block">
              {db.alunos.filter((a) => a.statusPagamento === "PAGO" || a.status === "ativo").length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-dourado/10 border border-dourado/30 flex items-center justify-center text-dourado">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-950/40 via-black to-zinc-900 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider block">
              Mensalidades Pendentes
            </span>
            <span className="font-anton text-2xl text-red-400 mt-1 block">
              {
                db.alunos.filter(
                  (a) => a.statusPagamento === "NÃO PAGO" || a.status === "inadimplente",
                ).length
              }
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <table className="w-full text-sm min-w-[850px]">
        <thead>
          <tr className="text-left text-muted-foreground border-b border-white/10 text-xs uppercase tracking-wider">
            <th className="p-3">Atleta / Sub</th>
            <th className="p-3">Telefone / Encarregado</th>
            <th className="p-3">Status Pagamento</th>
            <th className="p-3">Data de Expiração</th>
            <th className="p-3">Valor Mensalidade</th>
            <th className="p-3">Ações Rápidas</th>
          </tr>
        </thead>
        <tbody>
          {db.alunos.map((a) => {
            const statusAtual =
              a.statusPagamento || (a.status === "inadimplente" ? "NÃO PAGO" : "PAGO");
            const vencido = a.dataExpiracao && a.dataExpiracao < hojeStr;
            const pai = (db?.usuarios || []).find((u) => u && u.id === a.encarregadoId);

            return (
              <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    {a.fotoURL ? (
                      <img
                        src={a.fotoURL}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-dourado/10 border border-dourado/30 flex items-center justify-center text-dourado shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-white text-xs">{a.nome}</p>
                      <span className="text-[10px] text-dourado font-medium uppercase">
                        {a.sub || "Sub-11"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-xs">
                  <p className="text-white/80">{a.nomeEncarregado || pai?.nome || "—"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {a.telefoneEncarregado || pai?.telefone || "—"}
                  </p>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alternarStatus(a.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105 shadow-md ${
                        statusAtual === "PAGO" && !vencido
                          ? "bg-green-500/20 text-green-400 border border-green-500/40"
                          : "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                      }`}
                    >
                      {vencido ? "⚠️ VENCIDO (NÃO PAGO)" : statusAtual}
                    </button>
                  </div>
                </td>
                <td className="p-3">
                  <input
                    type="date"
                    value={a.dataExpiracao || ""}
                    onChange={(e) => mudarExpiracao(a.id, e.target.value)}
                    className={`bg-black/50 border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-dourado ${
                      vencido
                        ? "border-red-500/60 text-red-400 font-bold"
                        : "border-white/15 text-white/90"
                    }`}
                  />
                  {vencido && <p className="text-[10px] text-red-400 mt-0.5">Prazo expirado</p>}
                </td>
                <td className="p-3 font-anton text-base text-dourado">
                  {formatKZ(a.valorMensalidade)}
                </td>
                <td className="p-3 flex items-center gap-2">
                  <button
                    onClick={() => enviarLembreteWhatsAppAluno(a, db, atualizar)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      statusAtual === "NÃO PAGO" || vencido
                        ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40"
                        : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                    }`}
                    title="Enviar Lembrete de Mensalidade via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                    <span className="hidden sm:inline">
                      {statusAtual === "NÃO PAGO" || vencido ? "Lembrete WhatsApp" : "WhatsApp"}
                    </span>
                  </button>
                  <button
                    onClick={() => registarPagamento(a.id)}
                    className="btn-gold rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-dourado/10 shrink-0"
                  >
                    <DollarSign className="w-3.5 h-3.5" /> Renovar (+30 dias)
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Modal de Avaliação Tática & Física do Atleta --------------------
function ModalAvaliacaoAtleta({ aluno, onClose }: { aluno: Aluno; onClose: () => void }) {
  const { atualizar } = useStore();
  const [tecnica, setTecnica] = useState(aluno.avaliacao?.tecnica ?? 8);
  const [tatica, setTatica] = useState(aluno.avaliacao?.tatica ?? 8);
  const [fisico, setFisico] = useState(aluno.avaliacao?.fisico ?? 8);
  const [disciplina, setDisciplina] = useState(aluno.avaliacao?.disciplina ?? 9);
  const [assiduidade, setAssiduidade] = useState(aluno.avaliacao?.assiduidade ?? 9);
  const [obs, setObs] = useState(
    aluno.avaliacao?.obs ?? "Atleta em bom ritmo de progressão técnica e tática.",
  );

  const media = Math.round(((tecnica + tatica + fisico + disciplina + assiduidade) / 5) * 10) / 10;

  function salvar() {
    atualizar(
      (d) => {
        const a = d.alunos.find((x) => x.id === aluno.id);
        if (a) {
          a.avaliacao = {
            tecnica,
            tatica,
            fisico,
            disciplina,
            assiduidade,
            obs,
            dataAtualizacao: new Date().toISOString().slice(0, 10),
          };
        }
      },
      {
        acao: "editar",
        entidade: "aluno",
        detalhe: `Atualizou avaliação técnica e tática de "${aluno.nome}"`,
      },
    );
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-3xl max-w-lg w-full p-6 border border-dourado/40 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            {aluno.fotoURL ? (
              <img
                src={aluno.fotoURL}
                alt=""
                className="w-12 h-12 rounded-full object-cover border-2 border-dourado"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-dourado/10 border-2 border-dourado flex items-center justify-center text-dourado shrink-0">
                <User className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="font-anton text-xl text-dourado">{aluno.nome}</h3>
              <p className="text-xs text-muted-foreground font-semibold">
                {aluno.sub} · Boletim Tático & Físico
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-black/40 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground uppercase font-semibold block">
              Nota Geral do Atleta (Média)
            </span>
            <span className="text-2xl font-anton text-dourado">{media} / 10</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-dourado/20 text-dourado border border-dourado/30">
              {media >= 8.5
                ? "⭐ Alto Rendimento"
                : media >= 7
                  ? "📈 Em Evolução"
                  : "⚠️ Precisa Reforçar"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              label: "⚽ Técnica Individual (Dribles, Passes, Domínio)",
              val: tecnica,
              set: setTecnica,
            },
            { label: "🧠 Tática & Leitura de Jogo (Posicionamento)", val: tatica, set: setTatica },
            {
              label: "⚡ Condição Física (Velocidade, Força, Resistência)",
              val: fisico,
              set: setFisico,
            },
            { label: "🛡️ Disciplina & Foco em Campo", val: disciplina, set: setDisciplina },
            { label: "📅 Assiduidade nos Treinos e Jogos", val: assiduidade, set: setAssiduidade },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white/90">{item.label}</span>
                <span className="text-dourado font-bold text-sm">{item.val} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={item.val}
                onChange={(e) => item.set(Number(e.target.value))}
                className="w-full accent-dourado bg-white/10 h-2 rounded-lg cursor-pointer"
              />
            </div>
          ))}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/80">
              📝 Observações do Mister / Comissão Técnica:
            </label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={3}
              placeholder="Ex: Atleta com grande evolução na perna esquerda..."
              className="input bg-black/50 border-white/15 text-xs resize-none w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/15 text-xs font-semibold hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            className="btn-gold rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-dourado/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Guardar Avaliação
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Gestão de Calendário de Jogos & Convocatórias -------------------
function GestaoJogos({
  filtroCategoria,
  apenasLeitura = false,
}: {
  filtroCategoria?: string;
  apenasLeitura?: boolean;
}) {
  const { db, atualizar } = useStore();
  const [modalNovo, setModalNovo] = useState(false);
  const [form, setForm] = useState<Partial<Jogo>>({
    status: "Agendado",
    categoriaId: db.categorias[0]?.id || "c1",
    convocados: [],
  });

  const jogosLista = filtroCategoria
    ? db.jogos.filter((j) => j.categoriaId === filtroCategoria)
    : db.jogos;

  async function criarJogo() {
    if (!form.titulo || !form.data || !form.adversario) {
      await mostrarAlerta("Preencha Título, Data e Adversário do jogo.");
      return;
    }
    atualizar(
      (d) => {
        d.jogos.push({
          id: novoId(),
          titulo: form.titulo!,
          data: form.data!,
          local: form.local || "Campo Principal FILDA II",
          adversario: form.adversario!,
          categoriaId: form.categoriaId || d.categorias[0]?.id || "c1",
          status: (form.status as "Agendado" | "Concluído" | "Cancelado") || "Agendado",
          resultado: form.resultado || "",
          convocados: form.convocados || [],
          resumo: form.resumo || "",
          imagem: form.imagem || "",
        });
      },
      { acao: "criar", entidade: "jogo", detalhe: `Agendou jogo "${form.titulo}"` },
    );
    setModalNovo(false);
    setForm({ status: "Agendado", categoriaId: db.categorias[0]?.id || "c1", convocados: [] });
  }

  function alternarConvocado(jogoId: string, alunoId: string) {
    if (apenasLeitura) return;
    atualizar(
      (d) => {
        const j = d.jogos.find((x) => x.id === jogoId);
        if (j) {
          if (j.convocados.includes(alunoId)) {
            j.convocados = j.convocados.filter((id) => id !== alunoId);
          } else {
            j.convocados.push(alunoId);
          }
        }
      },
      { acao: "editar", entidade: "jogo", detalhe: `Atualizou convocação para o jogo` },
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4 glass p-4 rounded-2xl border border-white/10">
        <div>
          <h3 className="font-anton text-xl text-dourado uppercase tracking-wide flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-dourado" /> Calendário de Jogos & Convocatórias
          </h3>
          <p className="text-xs text-muted-foreground font-light mt-0.5">
            Gerencie os jogos, torneios e selecione os atletas convocados para cada partida.
          </p>
        </div>
        {!apenasLeitura && (
          <button
            onClick={() => setModalNovo(true)}
            className="btn-gold rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-dourado/20"
          >
            <Plus className="w-4 h-4" /> Agendar Novo Jogo / Torneio
          </button>
        )}
      </div>

      {jogosLista.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center text-muted-foreground border border-white/10">
          Nenhum jogo ou torneio cadastrado no calendário para esta seleção.
        </div>
      )}

      <div className="grid gap-4">
        {jogosLista.map((j) => {
          const cat = db.categorias.find((c) => c.id === j.categoriaId);
          const alunosCat = db.alunos.filter(
            (a) => a.categoriaId === j.categoriaId || a.sub === cat?.nome,
          );
          const convocadosAlunos = db.alunos.filter((a) => j.convocados.includes(a.id));

          return (
            <div
              key={j.id}
              className="glass rounded-3xl p-5 border border-white/10 space-y-4 hover:border-white/20 transition-all"
            >
              {j.imagem && (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  <img
                    src={j.imagem}
                    alt={j.titulo}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-dourado/20 text-dourado border border-dourado/30">
                      {cat?.nome || "Sub-X"}
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        j.status === "Concluído"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : j.status === "Cancelado"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      {j.status}
                    </span>
                    {j.resultado && (
                      <span className="text-xs font-anton text-dourado bg-black/60 px-3 py-0.5 rounded-lg border border-white/15">
                        Placar: {j.resultado}
                      </span>
                    )}
                  </div>
                  <h4 className="font-anton text-xl text-white">{j.titulo}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-3">
                    <span>📅 {j.data}</span>
                    <span>📍 {j.local}</span>
                    <span>
                      ⚔️ Adversário: <strong>{j.adversario}</strong>
                    </span>
                  </p>
                </div>

                {!apenasLeitura && (
                  <button
                    onClick={async () => {
                      if (await pedirConfirmacao(`Remover o jogo "${j.titulo}"?`)) {
                        atualizar(
                          (d) => {
                            d.jogos = d.jogos.filter((x) => x.id !== j.id);
                          },
                          {
                            acao: "apagar",
                            entidade: "jogo",
                            detalhe: `Removeu jogo "${j.titulo}"`,
                          },
                        );
                      }
                    }}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors shrink-0"
                    title="Remover Jogo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {j.resumo && (
                <p className="text-xs text-white/80 bg-black/30 p-3 rounded-xl border border-white/5">
                  💬 <strong>Resumo/Destaque:</strong> {j.resumo}
                </p>
              )}

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-dourado uppercase flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-dourado" /> Lista de Convocados (
                    {convocadosAlunos.length} atletas)
                  </span>
                  {!apenasLeitura && (
                    <span className="text-[11px] text-muted-foreground">
                      Clique em um atleta abaixo para convocar ou desconvocar
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {alunosCat.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      Nenhum aluno nesta categoria.
                    </p>
                  )}
                  {alunosCat.map((al) => {
                    const convocado = j.convocados.includes(al.id);
                    return (
                      <button
                        key={al.id}
                        disabled={apenasLeitura}
                        onClick={() => alternarConvocado(j.id, al.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          convocado
                            ? "bg-dourado text-black border-dourado shadow-md shadow-dourado/20 font-bold"
                            : "bg-black/40 text-white/60 border-white/10 hover:border-white/30"
                        } ${apenasLeitura ? "cursor-default" : "cursor-pointer"}`}
                      >
                        {al.fotoURL ? (
                          <img
                            src={al.fotoURL}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-dourado/10 border border-dourado/30 flex items-center justify-center text-dourado shrink-0">
                            <User className="w-3 h-3" />
                          </div>
                        )}
                        <span>{al.nome}</span>
                        {convocado && <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalNovo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-3xl max-w-lg w-full p-6 border border-dourado/40 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-anton text-xl text-dourado">🗓️ Agendar Novo Jogo / Torneio</h3>
              <button
                onClick={() => setModalNovo(false)}
                className="p-2 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] uppercase font-semibold text-white/70 block mb-1">
                  Título do Jogo/Torneio *
                </label>
                <input
                  placeholder="Ex: Derby vs Interclube Sub-15"
                  value={form.titulo ?? ""}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="input bg-black/50 border-white/15 text-sm w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase font-semibold text-white/70 block mb-1">
                    Data e Hora *
                  </label>
                  <input
                    placeholder="Ex: 2026-08-15 15:30"
                    value={form.data ?? ""}
                    onChange={(e) => setForm({ ...form, data: e.target.value })}
                    className="input bg-black/50 border-white/15 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-semibold text-white/70 block mb-1">
                    Categoria/Sub *
                  </label>
                  <select
                    value={form.categoriaId ?? db.categorias[0]?.id}
                    onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                    className="input bg-black/50 border-white/15 text-sm w-full"
                  >
                    {db.categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome} ({c.faixaEtaria})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase font-semibold text-white/70 block mb-1">
                    Adversário *
                  </label>
                  <input
                    placeholder="Ex: Petro de Luanda"
                    value={form.adversario ?? ""}
                    onChange={(e) => setForm({ ...form, adversario: e.target.value })}
                    className="input bg-black/50 border-white/15 text-sm w-full"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase font-semibold text-white/70 block mb-1">
                    Local / Estádio
                  </label>
                  <input
                    placeholder="Ex: Campo Principal FILDA II"
                    value={form.local ?? ""}
                    onChange={(e) => setForm({ ...form, local: e.target.value })}
                    className="input bg-black/50 border-white/15 text-sm w-full"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase font-semibold text-white/70 block mb-1">
                  Resumo / Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Amistoso preparatório de sábado..."
                  value={form.resumo ?? ""}
                  onChange={(e) => setForm({ ...form, resumo: e.target.value })}
                  className="input bg-black/50 border-white/15 text-xs w-full resize-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-semibold text-white/70 block mb-1">
                  Imagem do Jogo / Torneio (opcional)
                </label>
                <UploadImagem
                  pasta="eventos"
                  previa={form.imagem || undefined}
                  onConcluido={({ url }) => setForm({ ...form, imagem: url })}
                  label="Carregar imagem do dispositivo"
                />
                <input
                  placeholder="Ou cole aqui uma URL de imagem (opcional)"
                  value={form.imagem ?? ""}
                  onChange={(e) => setForm({ ...form, imagem: e.target.value })}
                  className="input bg-black/50 border-white/15 text-sm w-full mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setModalNovo(false)}
                className="px-4 py-2 rounded-xl border border-white/15 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={criarJogo}
                className="btn-gold rounded-xl px-6 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Guardar Jogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
//  CARTÃO DE ATLETA OFICIAL — DURABILIDADE 1 ANO + DOWNLOAD EM PNG
// ============================================================================
function calcularDurabilidade1Ano(dataCadastro?: string): string {
  try {
    if (dataCadastro && dataCadastro.includes("-")) {
      const p = dataCadastro.split("-");
      if (p.length === 3) {
        const ano = parseInt(p[0], 10) + 1;
        return `${p[2]}/${p[1]}/${ano}`;
      }
    }
  } catch {
    /* data inválida */
  }
  const anoAtual = new Date().getFullYear() + 1;
  return `31/07/${anoAtual}`;
}

export function CartaoAtletaOficial({ aluno }: { aluno: Aluno }) {
  const { db, usuario } = useStore();
  const cartaoRef = useRef<HTMLDivElement>(null);
  const [baixando, setBaixando] = useState(false);

  const cat = db.categorias.find((c) => c.id === aluno.categoriaId);
  const numRegisto = `F2-2026-${aluno.id
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 6)}`;
  const ativo = aluno.status === "ativo" || aluno.statusPagamento === "PAGO";
  const dataFim1Ano = calcularDurabilidade1Ano(aluno.dataCadastro);

  async function gerarEBaixarCanvasFallback() {
    const canvas = document.createElement("canvas");
    canvas.width = 860;
    canvas.height = 520;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 860, 520);
    grad.addColorStop(0, "#18181b");
    grad.addColorStop(0.5, "#0f172a");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 860, 520);

    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 848, 508);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText("FILDA II — ESCOLA DE FUTEBOL", 30, 55);
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("LICENÇA OFICIAL • DURABILIDADE: 1 ANO", 30, 80);

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 20px monospace";
    ctx.fillText(numRegisto, 660, 55);
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "12px sans-serif";
    ctx.fillText("REGISTO OFICIAL F2", 680, 75);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 105);
    ctx.lineTo(830, 105);
    ctx.stroke();

    ctx.fillStyle = "#27272a";
    ctx.fillRect(30, 135, 160, 160);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 135, 160, 160);
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 50px sans-serif";
    ctx.fillText("F2", 80, 230);

    ctx.fillStyle = ativo ? "#22c55e" : "#ef4444";
    ctx.fillRect(40, 310, 140, 30);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(ativo ? "● ATIVO (1 ANO)" : "● PENDENTE", 55, 330);

    const leftX = 230;
    ctx.fillStyle = "#facc15";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("NOME COMPLETO DO ATLETA:", leftX, 150);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(aluno.nome.toUpperCase().slice(0, 32), leftX, 185);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "12px sans-serif";
    ctx.fillText("CATEGORIA / SUB:", leftX, 240);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(cat?.nome || aluno.sub || "Sub-11", leftX, 265);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "12px sans-serif";
    ctx.fillText("DATA DE NASCIMENTO:", leftX + 220, 240);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(aluno.dataNasc || "—", leftX + 220, 265);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "12px sans-serif";
    ctx.fillText("ENCARREGADO DE EDUCAÇÃO:", leftX, 315);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    const enc = (aluno.nomeEncarregado || usuario?.nome || "—").slice(0, 22);
    ctx.fillText(enc, leftX, 340);

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("DURABILIDADE (VAL. 1 ANO):", leftX + 220, 315);
    ctx.fillStyle = "#4ade80";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`1 ANO (Até ${dataFim1Ano})`, leftX + 220, 340);

    ctx.fillStyle = "#09090b";
    ctx.fillRect(10, 430, 840, 80);
    ctx.strokeStyle = "rgba(250, 204, 21, 0.3)";
    ctx.strokeRect(10, 430, 840, 80);

    ctx.fillStyle = "#facc15";
    ctx.font = "bold 16px monospace";
    ctx.fillText("🪪 VERIFICAÇÃO DIGITAL OFICIAL: FILDA2-AUTH-OK", 30, 465);
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "12px sans-serif";
    ctx.fillText(
      "Este cartão tem durabilidade de 1 (um) ano a partir da data de matrícula/emissão.",
      30,
      490,
    );

    const link = document.createElement("a");
    link.download = `Cartao-Atleta-1Ano-${aluno.nome.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    mostrarAlerta(
      "Sucesso",
      "Cartão de Atleta baixado com sucesso em formato PNG (Durabilidade: 1 Ano)!",
    );
  }

  async function baixarCartaoPNG() {
    if (!cartaoRef.current) return;
    try {
      setBaixando(true);
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cartaoRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#09090b",
        style: {
          transform: "none",
        },
      });
      const link = document.createElement("a");
      link.download = `Cartao-Atleta-1Ano-${aluno.nome.replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      mostrarAlerta("Sucesso", "Cartão de Atleta (1 Ano) baixado com sucesso!");
    } catch (err) {
      console.error("Erro no html-to-image, usando fallback canvas:", err);
      try {
        await gerarEBaixarCanvasFallback();
      } catch (e2) {
        console.error("Erro no canvas:", e2);
        mostrarAlerta(
          "Aviso",
          "Não foi possível gerar a imagem PNG. Use o botão Imprimir para salvar em PDF.",
        );
      }
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        ref={cartaoRef}
        className="relative rounded-3xl p-6 bg-gradient-to-br from-zinc-950 via-[#0f172a] to-black border-2 border-dourado/80 shadow-2xl shadow-dourado/20 overflow-hidden text-white flex flex-col justify-between min-h-[360px]"
      >
        <div className="absolute -right-8 -bottom-8 text-dourado/5 font-anton text-[150px] pointer-events-none select-none leading-none">
          1 ANO
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-dourado/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between border-b border-white/15 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-dourado to-yellow-600 flex items-center justify-center text-black font-anton text-xl shadow-md shadow-dourado/20">
              F2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-anton text-lg tracking-wider text-white block leading-tight">
                  FILDA II
                </span>
                <span className="bg-dourado text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-sm">
                  ⏱️ Durabilidade: 1 Ano
                </span>
              </div>
              <span className="text-[10px] text-dourado font-extrabold uppercase tracking-widest block mt-0.5">
                Escola de Futebol • Licença Desportiva Oficial
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-white/50 uppercase tracking-widest block font-semibold">
              REGISTO OFICIAL F2
            </span>
            <span className="font-mono text-sm font-bold text-dourado">{numRegisto}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-6 relative z-10 items-center">
          <div className="col-span-1 flex flex-col items-center justify-center border-r-0 sm:border-r border-white/10 pr-0 sm:pr-4">
            <div className="relative">
              {aluno.fotoURL ? (
                <img
                  src={aluno.fotoURL}
                  alt={aluno.nome}
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-dourado shadow-xl bg-zinc-800"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl border-2 border-dourado shadow-xl bg-zinc-900 flex flex-col items-center justify-center text-dourado">
                  <User className="w-12 h-12" />
                  <span className="text-[10px] font-bold mt-1">FILDA II</span>
                </div>
              )}
              <span
                className={`absolute -bottom-2.5 inset-x-0 mx-auto w-max text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shadow ${
                  ativo
                    ? "bg-green-500 text-black border-green-400"
                    : "bg-red-500 text-white border-red-400"
                }`}
              >
                {ativo ? "● ATIVO (1 ANO)" : "● PENDENTE"}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded font-bold">
                🟨 {aluno.cartoesAmarelos || 0}
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-bold">
                🟥 {aluno.cartoesVermelhos || 0}
              </span>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2 space-y-3 text-left pl-0 sm:pl-2">
            <div>
              <span className="text-[10px] text-dourado/80 font-bold uppercase tracking-wider block">
                Atleta Titular da Licença
              </span>
              <h4 className="font-anton text-xl sm:text-2xl text-white tracking-wide leading-tight uppercase">
                {aluno.nome}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 bg-white/5 p-3 rounded-xl border border-white/5">
              <div>
                <span className="text-[9px] text-white/50 uppercase block font-medium">
                  Categoria / Sub
                </span>
                <span className="text-sm font-bold text-white block">
                  {cat?.nome || aluno.sub || "Sub-11"}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-white/50 uppercase block font-medium">
                  Data de Nascimento
                </span>
                <span className="text-sm font-bold text-white block">{aluno.dataNasc || "—"}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/50 uppercase block font-medium">
                  Encarregado / Responsável
                </span>
                <span
                  className="text-xs font-semibold text-white/90 block truncate"
                  title={aluno.nomeEncarregado || usuario?.nome}
                >
                  {aluno.nomeEncarregado || usuario?.nome || "—"}
                </span>
              </div>
              <div className="bg-dourado/10 p-1.5 rounded-lg border border-dourado/30">
                <span className="text-[9px] text-dourado font-bold uppercase block">
                  Durabilidade / Validade
                </span>
                <span className="text-xs font-extrabold text-green-400 block">
                  1 ANO (Até {dataFim1Ano})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 pt-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10 bg-black/40 -mx-6 -mb-6 px-6 py-4 rounded-b-3xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white p-1 rounded-lg flex items-center justify-center shrink-0 shadow">
              <div className="w-full h-full bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:4px_4px] border border-black flex items-center justify-center text-[7px] font-bold text-black text-center leading-none">
                QR
                <br />
                F2
              </div>
            </div>
            <div>
              <span className="text-[9px] text-white/60 uppercase tracking-wider block font-semibold">
                Verificação Digital & Durabilidade
              </span>
              <span className="text-xs font-mono font-bold text-dourado">
                FILDA2-AUTH-OK • VÁLIDO POR 1 ANO
              </span>
            </div>
          </div>
          <div className="text-right text-[10px] text-white/50 hidden md:block">
            Emitido pela FILDA II • Angola
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 text-xs text-dourado font-medium">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            O cartão tem durabilidade oficial de <strong>1 ano</strong> e pode ser baixado em alta
            resolução.
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              try {
                window.print();
              } catch {
                mostrarAlerta(
                  "Aviso",
                  "Use a função de impressão do seu navegador para salvar em PDF.",
                );
              }
            }}
            className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-white/15 transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white/80" /> Imprimir / PDF
          </button>
          <button
            onClick={baixarCartaoPNG}
            disabled={baixando}
            className="flex-1 sm:flex-initial btn-gold text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-dourado/20 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {baixando ? "A gerar imagem..." : "⬇️ Baixar Cartão (PNG)"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Gestão Geral de Cartões Oficial de Atleta (ID) --------------------
export function GestaoCartoes({
  filtroCategoria,
  apenasAlunoIds,
}: {
  filtroCategoria?: string;
  apenasAlunoIds?: string[];
}) {
  const { db } = useStore();
  const [busca, setBusca] = useState("");
  const [turmaSel, setTurmaSel] = useState<string>(filtroCategoria || "todas");

  const lista = useMemo(() => {
    return db.alunos.filter((a) => {
      if (Array.isArray(apenasAlunoIds) && !apenasAlunoIds.includes(a.id)) {
        return false;
      }
      const matchTurma =
        turmaSel === "todas" ? true : a.categoriaId === turmaSel || a.sub === turmaSel;
      const tBusca = busca.toLowerCase().trim();
      const matchBusca =
        !tBusca ||
        a.nome.toLowerCase().includes(tBusca) ||
        (a.nomeEncarregado && a.nomeEncarregado.toLowerCase().includes(tBusca)) ||
        (a.sub && a.sub.toLowerCase().includes(tBusca));
      return matchTurma && matchBusca;
    });
  }, [db.alunos, turmaSel, busca, apenasAlunoIds]);

  return (
    <div className="grid gap-6 animate-in fade-in duration-300">
      <div className="glass rounded-3xl p-6 border border-dourado/30 shadow-xl bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div>
            <h3 className="font-anton text-2xl text-white flex items-center gap-2.5 tracking-wide">
              <Award className="w-6 h-6 text-dourado" /> CARTÕES OFICIAIS DE ATLETA — FILDA II
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Emissão, visualização e download em alta resolução (PNG/PDF) das licenças desportivas
              (Validade 1 Ano).
            </p>
          </div>
          <div className="flex items-center gap-2 bg-dourado/10 border border-dourado/30 px-4 py-2 rounded-2xl">
            <span className="text-xs font-bold text-dourado uppercase tracking-wider">
              Total Cartões:
            </span>
            <span className="font-anton text-lg text-white">{lista.length}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar atleta por nome ou encarregado..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-black/60 border border-white/15 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-dourado transition-all"
            />
          </div>
          <select
            value={turmaSel}
            onChange={(e) => setTurmaSel(e.target.value)}
            className="bg-black/60 border border-white/15 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-dourado transition-all"
          >
            <option value="todas">Todas as Turmas / Categorias</option>
            {db.categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-white/10">
          <Award className="w-16 h-16 text-dourado/30 mx-auto mb-3" />
          <h4 className="font-anton text-lg text-white">Nenhum Cartão Encontrado</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Verifique os filtros de busca ou selecione outra categoria/turma.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {lista.map((aluno) => (
            <CartaoAtletaOficial key={aluno.id} aluno={aluno} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Gestão de Alunos (partilhada por admin e secretaria) ------------
function GestaoAlunos({
  podeApagar,
  filtroCategoria,
}: {
  podeApagar: boolean;
  filtroCategoria?: string;
}) {
  const { db, atualizar } = useStore();
  const pais = (db?.usuarios || []).filter(
    (u) => u && (u.perfil === "pai" || u.perfil === "encarregado"),
  );
  const [form, setForm] = useState<Partial<Aluno>>({ sub: "Sub-11", statusPagamento: "NÃO PAGO" });
  const [edit, setEdit] = useState<string | null>(null);
  const [alunoAvaliar, setAlunoAvaliar] = useState<Aluno | null>(null);
  const [alunoCartao, setAlunoCartao] = useState<Aluno | null>(null);

  const lista = filtroCategoria
    ? db.alunos.filter((a) => a.categoriaId === filtroCategoria)
    : db.alunos;

  async function criar() {
    if (!form.nome) {
      await mostrarAlerta("Nome do atleta é obrigatório.");
      return;
    }
    const cat =
      db.categorias.find((c) => c.nome.toLowerCase().includes((form.sub || "sub").toLowerCase())) ||
      db.categorias[0];
    const nome = form.nome!;
    const dataHoje = new Date().toISOString().slice(0, 10);

    atualizar(
      (d) => {
        d.alunos.push({
          id: novoId(),
          estadoFisico: form.estadoFisico || "Bom",
          estadoMedico: form.estadoMedico || "Apto",
          lesoes: form.lesoes || "",
          problemasRespiratorios: form.problemasRespiratorios || "Não",
          nome,
          dataNasc: form.dataNasc ?? "",
          sub: form.sub || "Sub-11",
          statusPagamento: (form.statusPagamento as "PAGO" | "NÃO PAGO") || "NÃO PAGO",
          dataExpiracao: form.dataExpiracao || "",
          nomeEncarregado: form.nomeEncarregado || "",
          telefoneEncarregado: form.telefoneEncarregado || "",
          dataCadastro: dataHoje,
          categoriaId: form.categoriaId || cat?.id || "c1",
          fotoURL: form.fotoURL || "",
          encarregadoId: form.encarregadoId || "",
          status: form.statusPagamento === "PAGO" ? "ativo" : "inadimplente",
          pontos: 0,
          faltas: 0,
          mesesAtraso: 0,
          valorMensalidade: Number(form.valorMensalidade ?? 2500),
        });
      },
      {
        acao: "criar",
        entidade: "aluno",
        detalhe: `Cadastrou atleta "${nome}" (${form.sub || "Sub-11"})`,
      },
    );
    setForm({
      sub: "Sub-11",
      statusPagamento: "NÃO PAGO",
      encarregadoId: "",
      fotoURL: "",
      nomeEncarregado: "",
      telefoneEncarregado: "",
      dataNasc: "",
      valorMensalidade: undefined,
    });
  }

  function alternarStatus(alunoId: string) {
    atualizar(
      (d) => {
        const a = d.alunos.find((x) => x.id === alunoId);
        if (a) {
          const atual = a.statusPagamento || (a.status === "inadimplente" ? "NÃO PAGO" : "PAGO");
          const novo = atual === "PAGO" ? "NÃO PAGO" : "PAGO";
          a.statusPagamento = novo;
          a.status = novo === "PAGO" ? "ativo" : "inadimplente";
          const mesAtual = new Date().toISOString().slice(0, 7);
          if (
            novo === "PAGO" &&
            (!a.dataExpiracao || a.dataExpiracao < new Date().toISOString().slice(0, 10))
          ) {
            const h = new Date();
            h.setDate(h.getDate() + 30);
            a.dataExpiracao = h.toISOString().slice(0, 10);
          }
          if (novo === "PAGO") {
            const jaTem = d.pagamentos.some(
              (p) => p.alunoId === alunoId && p.mesAno === mesAtual && p.status === "pago",
            );
            if (!jaTem) {
              d.pagamentos.push({
                id: novoId(),
                alunoId,
                tipo: "mensalidade",
                valor: a.valorMensalidade || 2500,
                mesAno: mesAtual,
                status: "pago",
                data: new Date().toISOString().slice(0, 10),
              });
            }
          } else {
            d.pagamentos = d.pagamentos.filter(
              (p) => !(p.alunoId === alunoId && p.mesAno === mesAtual && p.status === "pago"),
            );
          }
        }
      },
      { acao: "editar", entidade: "aluno", detalhe: `Alternou status de pagamento do atleta` },
    );
  }

  const hojeStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-6">
      <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="font-anton text-xl text-dourado flex items-center gap-2 uppercase tracking-wide">
          <UserPlus className="w-5 h-5 text-dourado" /> Cadastrar Novo Atleta
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          <input
            placeholder="Nome Completo do Atleta *"
            value={form.nome ?? ""}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="input md:col-span-2 bg-black/40 border-white/15"
          />
          <input
            type="date"
            placeholder="Data Nascimento"
            value={form.dataNasc ?? ""}
            onChange={(e) => setForm({ ...form, dataNasc: e.target.value })}
            className="input bg-black/40 border-white/15"
          />
          <select
            value={form.sub ?? "Sub-11"}
            onChange={(e) => setForm({ ...form, sub: e.target.value })}
            className="input bg-black/40 border-white/15"
          >
            <option value="Sub-11">Sub-11</option>
            <option value="Sub-13">Sub-13</option>
            <option value="Sub-15">Sub-15</option>
            <option value="Sub-17">Sub-17</option>
            <option value="Sub-20">Sub-20</option>
            <option value="Adulto">Adulto</option>
          </select>
          <select
            value={form.encarregadoId ?? ""}
            onChange={(e) => {
              const pId = e.target.value;
              const paiObj = (db?.usuarios || []).find((u) => u && u.id === pId);
              setForm({
                ...form,
                encarregadoId: pId,
                nomeEncarregado: paiObj ? paiObj.nome : form.nomeEncarregado,
                telefoneEncarregado: paiObj ? paiObj.telefone || "" : form.telefoneEncarregado,
              });
            }}
            className="input bg-black/40 border-white/15 text-xs"
          >
            <option value="">— Selecionar Pai / Encarregado —</option>
            {(db?.usuarios || [])
              .filter((u) => u && u.id)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.perfil ? u.perfil.toUpperCase() : "UTILIZADOR"}){" "}
                  {u.telefone ? `- ${u.telefone}` : ""}
                </option>
              ))}
          </select>
          <input
            placeholder="Nome Encarregado"
            value={form.nomeEncarregado ?? ""}
            onChange={(e) => setForm({ ...form, nomeEncarregado: e.target.value })}
            className="input bg-black/40 border-white/15"
          />
          <input
            placeholder="Telefone / WhatsApp"
            value={form.telefoneEncarregado ?? ""}
            onChange={(e) => setForm({ ...form, telefoneEncarregado: e.target.value })}
            className="input bg-black/40 border-white/15"
          />
          <input
            type="url"
            placeholder="URL da Foto do Atleta (Opcional)"
            value={form.fotoURL ?? ""}
            onChange={(e) => setForm({ ...form, fotoURL: e.target.value })}
            className="input bg-black/40 border-white/15 text-xs"
          />
          <select
            value={form.statusPagamento ?? "NÃO PAGO"}
            onChange={(e) =>
              setForm({ ...form, statusPagamento: e.target.value as "PAGO" | "NÃO PAGO" })
            }
            className="input bg-black/40 border-white/15"
          >
            <option value="NÃO PAGO">Status: NÃO PAGO</option>
            <option value="PAGO">Status: PAGO</option>
          </select>
          <input
            type="number"
            placeholder="Mensalidade (Ex: 2500)"
            value={form.valorMensalidade ?? ""}
            onChange={(e) => setForm({ ...form, valorMensalidade: Number(e.target.value) })}
            className="input bg-black/40 border-white/15"
          />
        </div>
        <button
          onClick={criar}
          className="btn-gold rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-dourado/10"
        >
          <Plus className="w-4 h-4" /> Adicionar Atleta à Academia
        </button>
      </div>

      <div className="glass rounded-3xl p-6 border border-white/10 overflow-x-auto space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h4 className="font-anton text-xl text-dourado uppercase tracking-wide">
              Lista de Atletas & Matrículas ({lista.length})
            </h4>
            <p className="text-xs text-muted-foreground font-light mt-0.5">
              Tabela geral de atletas. Envie lembretes de mensalidade vencida diretamente via
              WhatsApp.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => {
                const colunas = [
                  "ID",
                  "Nome",
                  "Categoria/Sub",
                  "Data Nasc",
                  "Encarregado",
                  "Telefone",
                  "Status Pagamento",
                  "Expiração",
                  "Mensalidade (Kz)",
                  "Pontos",
                  "Faltas",
                ];
                const linhas = lista.map((a) => [
                  a.id,
                  a.nome,
                  a.sub,
                  a.dataNasc,
                  a.nomeEncarregado,
                  a.telefoneEncarregado,
                  a.statusPagamento || "NÃO PAGO",
                  a.dataExpiracao || "",
                  a.valorMensalidade || 0,
                  a.pontos || 0,
                  a.faltas || 0,
                ]);
                exportarParaCSV("lista_atletas_filda2", colunas, linhas);
              }}
              className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 text-white"
            >
              <Download className="w-4 h-4 text-dourado" /> Exportar Excel (CSV)
            </button>
            <button
              onClick={() => enviarLembreteMassaVencidos(lista, db, atualizar)}
              className="btn-gold rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-dourado/20 shrink-0 hover:scale-105 transition-transform"
            >
              <MessageCircle className="w-4 h-4 text-black animate-pulse" />
              📲 Lembrete Automático WhatsApp (
              {
                lista.filter(
                  (a) =>
                    a.statusPagamento === "NÃO PAGO" ||
                    a.status === "inadimplente" ||
                    (a.dataExpiracao && a.dataExpiracao < hojeStr),
                ).length
              }{" "}
              Vencidos)
            </button>
          </div>
        </div>
        <table className="w-full text-sm min-w-[950px]">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-white/10 text-xs uppercase tracking-wider">
              <th className="p-3">Atleta / Sub</th>
              <th className="p-3">Encarregado & Contato</th>
              <th className="p-3">Status Pagamento</th>
              <th className="p-3">Expiração</th>
              <th className="p-3">Mensalidade</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((a) => {
              const editando = edit === a.id;
              const statusAtual =
                a.statusPagamento || (a.status === "inadimplente" ? "NÃO PAGO" : "PAGO");
              const vencido = a.dataExpiracao && a.dataExpiracao < hojeStr;
              const pai = (db?.usuarios || []).find((u) => u && u.id === a.encarregadoId);

              return (
                <tr
                  key={a.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      {a.fotoURL ? (
                        <img
                          src={a.fotoURL}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-dourado/10 border border-dourado/30 flex items-center justify-center text-dourado shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        {editando ? (
                          <div className="flex flex-col gap-1">
                            <input
                              defaultValue={a.nome}
                              onBlur={(e) => {
                                if (e.target.value === a.nome) return;
                                atualizar(
                                  (d) => {
                                    const x = d.alunos.find((y) => y.id === a.id);
                                    if (x) x.nome = e.target.value;
                                  },
                                  { acao: "editar", entidade: "aluno", detalhe: `Renomeou atleta` },
                                );
                              }}
                              placeholder="Nome do Atleta"
                              className="input bg-black/50 py-1 px-2 text-xs w-44"
                            />
                            <input
                              defaultValue={a.fotoURL || ""}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val === (a.fotoURL || "")) return;
                                atualizar(
                                  (d) => {
                                    const x = d.alunos.find((y) => y.id === a.id);
                                    if (x) x.fotoURL = val;
                                  },
                                  {
                                    acao: "editar",
                                    entidade: "aluno",
                                    detalhe: `Alterou foto do atleta`,
                                  },
                                );
                              }}
                              placeholder="URL da Foto (https://...)"
                              className="input bg-black/50 py-0.5 px-2 text-[10px] w-44 border-white/20"
                            />
                          </div>
                        ) : (
                          <p className="font-bold text-white text-xs">{a.nome}</p>
                        )}
                        <span className="text-[10px] text-dourado font-medium uppercase">
                          {a.sub || "Sub-11"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs">
                    {editando ? (
                      <select
                        value={a.encarregadoId || ""}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const paiObj = (db?.usuarios || []).find((u) => u && u.id === pId);
                          atualizar(
                            (d) => {
                              const x = d.alunos.find((y) => y.id === a.id);
                              if (x) {
                                x.encarregadoId = pId;
                                if (paiObj) {
                                  x.nomeEncarregado = paiObj.nome;
                                  x.telefoneEncarregado = paiObj.telefone || "";
                                }
                              }
                            },
                            {
                              acao: "editar",
                              entidade: "aluno",
                              detalhe: `Alterou pai/encarregado do atleta`,
                            },
                          );
                        }}
                        className="input bg-black/60 py-1 px-2 text-[11px] w-48 border-white/20"
                      >
                        <option value="">— Selecionar Pai / Encarregado —</option>
                        {(db?.usuarios || [])
                          .filter((u) => u && u.id)
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.nome} ({u.perfil ? u.perfil.toUpperCase() : "UTILIZADOR"})
                            </option>
                          ))}
                      </select>
                    ) : (
                      <>
                        <p className="text-white/90">{a.nomeEncarregado || pai?.nome || "—"}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {a.telefoneEncarregado || pai?.telefone || "—"}
                        </p>
                      </>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => alternarStatus(a.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest transition-all ${
                        statusAtual === "PAGO" && !vencido
                          ? "bg-green-500/20 text-green-400 border border-green-500/40 hover:bg-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                      }`}
                    >
                      {vencido ? "⚠️ VENCIDO" : statusAtual}
                    </button>
                  </td>
                  <td className="p-3 text-xs">
                    <span className={vencido ? "text-red-400 font-bold" : "text-white/70"}>
                      {a.dataExpiracao || "Sem data"}
                    </span>
                  </td>
                  <td className="p-3 font-anton text-base text-dourado">
                    {formatKZ(a.valorMensalidade)}
                  </td>
                  <td className="p-3 flex items-center justify-center gap-2">
                    <button
                      onClick={() => enviarLembreteWhatsAppAluno(a, db, atualizar)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        statusAtual === "NÃO PAGO" || vencido
                          ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40"
                          : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                      }`}
                      title={
                        statusAtual === "NÃO PAGO" || vencido
                          ? "Enviar Lembrete de Cobrança WhatsApp"
                          : "Enviar Mensagem no WhatsApp"
                      }
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="text-[11px] font-bold">
                        {statusAtual === "NÃO PAGO" || vencido ? "Cobrar via WhatsApp" : "WhatsApp"}
                      </span>
                    </button>
                    <button
                      onClick={() => setEdit(editando ? null : a.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-dourado transition-colors"
                      title="Editar"
                    >
                      {editando ? (
                        <Save className="w-4 h-4 text-green-400" />
                      ) : (
                        <Edit3 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setAlunoAvaliar(a)}
                      className="p-2 rounded-xl bg-dourado/10 hover:bg-dourado/20 text-dourado transition-colors flex items-center gap-1 font-bold text-xs"
                      title="Boletim / Avaliação Tática & Física"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Avaliar</span>
                    </button>
                    <button
                      onClick={() => setAlunoCartao(a)}
                      className="p-2.5 rounded-xl bg-yellow-500/15 hover:bg-yellow-500/30 text-yellow-300 transition-colors flex items-center gap-1.5 font-bold text-xs cursor-pointer border border-yellow-500/30 shadow-sm"
                      title="Cartão Oficial de Atleta (Validade: 1 Ano)"
                    >
                      <Award className="w-4 h-4 text-dourado" />
                      <span className="inline font-extrabold">🪪 Ver Cartão</span>
                    </button>
                    {podeApagar && (
                      <button
                        onClick={async () => {
                          if (
                            await pedirConfirmacao(`Deseja realmente remover o atleta ${a.nome}?`)
                          )
                            atualizar(
                              (d) => {
                                d.alunos = d.alunos.filter((x) => x.id !== a.id);
                              },
                              {
                                acao: "apagar",
                                entidade: "aluno",
                                detalhe: `Removeu atleta "${a.nome}"`,
                              },
                            );
                        }}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground font-light">
                  Nenhum atleta cadastrado nesta categoria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {alunoAvaliar && (
        <ModalAvaliacaoAtleta aluno={alunoAvaliar} onClose={() => setAlunoAvaliar(null)} />
      )}

      {alunoCartao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-2xl w-full bg-zinc-950 border border-dourado/40 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="font-anton text-xl text-white flex items-center gap-2 tracking-wide">
                <Award className="w-5 h-5 text-dourado" /> Cartão Oficial de Atleta (Validade: 1
                Ano)
              </h3>
              <button
                onClick={() => setAlunoCartao(null)}
                className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <CartaoAtletaOficial aluno={alunoCartao} />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
//  PAINEL DO MISTER — chamada, pontuação + gestão SUPER com mais funcionalidades
// ============================================================================
function PainelMister() {
  const { db, atualizar, usuario } = useStore();
  const minhasTurmas = useMemo(() => {
    const orig = db.categorias.filter((c) => c.misterId === usuario?.id);
    if (orig.length > 0) return orig;
    return db.categorias;
  }, [db.categorias, usuario?.id]);

  const [turmaSel, setTurmaSel] = useState<string>("todas");
  const [aba, setAba] = useState<
    "chamada" | "alunos" | "cartao" | "jogos" | "turmas" | "desempenho" | "cms" | "visao"
  >("chamada");

  const alunosDaTurma = useMemo(() => {
    if (turmaSel === "todas") return db.alunos;
    return db.alunos.filter((a) => a.categoriaId === turmaSel);
  }, [db.alunos, turmaSel]);

  function somarPontos(alunoId: string, delta: number) {
    atualizar((d) => {
      const a = d.alunos.find((x) => x.id === alunoId);
      if (a) a.pontos = Math.max(0, (a.pontos ?? 0) + delta);
    });
  }
  function marcarFalta(alunoId: string, delta = 1) {
    atualizar((d) => {
      const a = d.alunos.find((x) => x.id === alunoId);
      if (a) a.faltas = Math.max(0, (a.faltas ?? 0) + delta);
    });
  }

  function alterarCartao(alunoId: string, tipo: "amarelo" | "vermelho", delta: number) {
    atualizar((d) => {
      const a = d.alunos.find((x) => x.id === alunoId);
      if (a) {
        if (tipo === "amarelo") {
          a.cartoesAmarelos = Math.max(0, (a.cartoesAmarelos || 0) + delta);
        } else {
          a.cartoesVermelhos = Math.max(0, (a.cartoesVermelhos || 0) + delta);
        }
      }
    });
  }

  async function bonificarTodos(delta: number) {
    if (
      !(await pedirConfirmacao(
        `Adicionar +${delta} pontos a todos os ${alunosDaTurma.length} alunos listados?`,
      ))
    )
      return;
    atualizar((d) => {
      alunosDaTurma.forEach((a) => {
        const al = d.alunos.find((x) => x.id === a.id);
        if (al) al.pontos = Math.max(0, (al.pontos ?? 0) + delta);
      });
    });
  }

  async function zerarFaltasTurma() {
    if (
      !(await pedirConfirmacao(
        `Zerar as faltas de todos os ${alunosDaTurma.length} alunos listados?`,
      ))
    )
      return;
    atualizar((d) => {
      alunosDaTurma.forEach((a) => {
        const al = d.alunos.find((x) => x.id === a.id);
        if (al) al.faltas = 0;
      });
    });
  }

  const topAlunos = useMemo(
    () =>
      [...db.alunos]
        .sort((a, b) => {
          const ptsA = a.pontos || 0;
          const ptsB = b.pontos || 0;
          if (ptsB !== ptsA) return ptsB - ptsA;
          return (a.faltas || 0) - (b.faltas || 0);
        })
        .slice(0, 10),
    [db.alunos],
  );
  const alertasFaltas = useMemo(
    () =>
      [...db.alunos]
        .filter((a) => (a.faltas ?? 0) > 0)
        .sort((a, b) => (b.faltas ?? 0) - (a.faltas ?? 0))
        .slice(0, 6),
    [db.alunos],
  );
  const mediaPontos = useMemo(
    () =>
      db.alunos.length > 0
        ? Math.round(db.alunos.reduce((acc, a) => acc + (a.pontos ?? 0), 0) / db.alunos.length)
        : 0,
    [db.alunos],
  );

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2 glass p-3 rounded-xl border border-dourado/30">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-dourado font-bold">
            ⚡ Modo Mister Ativo: {usuario?.nome || "Treinador"}
          </span>
          <span className="text-xs text-white/70">· Permissões avançadas de gestão e treino</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setTurmaSel("todas")}
            className={`rounded-lg px-3 py-1 text-xs border transition-all font-semibold ${
              turmaSel === "todas"
                ? "bg-dourado text-black border-dourado shadow-md shadow-dourado/20"
                : "border-border text-white/80 hover:bg-white/5"
            }`}
          >
            Todas as Turmas ({db.alunos.length})
          </button>
          {minhasTurmas.map((t) => {
            const count = db.alunos.filter((a) => a.categoriaId === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => setTurmaSel(t.id)}
                className={`rounded-lg px-3 py-1 text-xs border transition-all ${
                  turmaSel === t.id
                    ? "border-dourado text-dourado bg-dourado/10 font-semibold"
                    : "border-border text-white/70 hover:bg-white/5"
                }`}
              >
                {t.nome} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <Tabs
        aba={aba}
        setAba={setAba as (s: string) => void}
        abas={[
          { id: "chamada", label: "Chamada & Pontos", icon: Trophy },
          { id: "alunos", label: "Gerir Alunos (Super)", icon: UserPlus },
          { id: "cartao", label: "Cartões de Atleta (ID)", icon: Award },
          { id: "jogos", label: "Jogos & Convocatórias", icon: CalendarDays },
          { id: "turmas", label: "Turmas & Horários", icon: Layers },
          { id: "desempenho", label: "Desempenho & Top Atletas", icon: Sparkles },
          { id: "cms", label: "Vídeos & Galeria", icon: ImageIcon },
          { id: "visao", label: "Visão Geral", icon: Users },
        ]}
      />

      {aba === "chamada" && (
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div>
              <h3 className="font-anton text-lg text-dourado">Chamada & Pontuação Tática</h3>
              <p className="text-xs text-muted-foreground">
                Exibindo {alunosDaTurma.length} atleta(s) · Clique nos botões para atribuir ou
                remover pontos
              </p>
            </div>
            {alunosDaTurma.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => bonificarTodos(10)}
                  className="rounded-lg bg-dourado/20 border border-dourado/50 text-dourado px-3 py-1.5 text-xs font-semibold hover:bg-dourado hover:text-black transition-all inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> +10 Pts P/ Todos
                </button>
                <button
                  onClick={zerarFaltasTurma}
                  className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 text-xs hover:bg-red-500/20 transition-all"
                >
                  Zerar Faltas da Lista
                </button>
              </div>
            )}
          </div>

          {alunosDaTurma.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum aluno cadastrado nesta categoria.
            </div>
          )}

          <div className="grid gap-2">
            {alunosDaTurma.map((a) => {
              const cat = db.categorias.find((c) => c.id === a.categoriaId);
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all flex-wrap"
                >
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <img
                      src={a.fotoURL}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{a.nome}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {cat?.nome || "Sem turma"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-dourado bg-dourado/10 px-2.5 py-1 rounded-lg border border-dourado/20">
                      ⚽ {a.pontos} pts
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-lg ${(a.faltas ?? 0) > 0 ? "bg-red-500/10 text-red-400 border border-red-500/20 font-semibold" : "text-white/50"}`}
                    >
                      Faltas: {a.faltas}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold">
                      🟨 {a.cartoesAmarelos || 0}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">
                      🟥 {a.cartoesVermelhos || 0}
                    </span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap items-center">
                    <button
                      onClick={() => somarPontos(a.id, 10)}
                      className="rounded-lg bg-dourado/20 hover:bg-dourado hover:text-black text-dourado px-2.5 py-1 text-xs font-semibold transition-all"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => somarPontos(a.id, 5)}
                      className="rounded-lg bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 text-xs transition-all"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => somarPontos(a.id, -5)}
                      className="rounded-lg bg-white/5 hover:bg-white/10 text-white/70 px-2 py-1 text-xs transition-all"
                    >
                      -5
                    </button>
                    <div className="w-[1px] h-6 bg-white/15 mx-1 hidden sm:block" />
                    <button
                      onClick={() => marcarFalta(a.id, 1)}
                      className="rounded-lg bg-red-500/20 hover:bg-red-500 text-white text-xs px-2.5 py-1 transition-all"
                    >
                      + Falta
                    </button>
                    <button
                      onClick={() => marcarFalta(a.id, -1)}
                      className="rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs px-2 py-1 transition-all"
                    >
                      - Falta
                    </button>
                    <div className="w-[1px] h-6 bg-white/15 mx-1 hidden sm:block" />
                    <button
                      onClick={() => alterarCartao(a.id, "amarelo", 1)}
                      title="Adicionar Cartão Amarelo"
                      className="rounded-lg bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black text-xs px-2 py-1 font-bold transition-all"
                    >
                      +🟨
                    </button>
                    <button
                      onClick={() => alterarCartao(a.id, "amarelo", -1)}
                      title="Remover Cartão Amarelo"
                      className="rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs px-1.5 py-1 transition-all"
                    >
                      -🟨
                    </button>
                    <button
                      onClick={() => alterarCartao(a.id, "vermelho", 1)}
                      title="Adicionar Cartão Vermelho"
                      className="rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs px-2 py-1 font-bold transition-all"
                    >
                      +🟥
                    </button>
                    <button
                      onClick={() => alterarCartao(a.id, "vermelho", -1)}
                      title="Remover Cartão Vermelho"
                      className="rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs px-1.5 py-1 transition-all"
                    >
                      -🟥
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {aba === "alunos" && (
        <GestaoAlunos
          podeApagar={true}
          filtroCategoria={turmaSel === "todas" ? undefined : turmaSel}
        />
      )}

      {aba === "cartao" && (
        <GestaoCartoes filtroCategoria={turmaSel === "todas" ? undefined : turmaSel} />
      )}

      {aba === "jogos" && (
        <GestaoJogos filtroCategoria={turmaSel === "todas" ? undefined : turmaSel} />
      )}

      {aba === "turmas" && <GestaoTurmas />}

      {aba === "desempenho" && (
        <div className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-anton text-lg text-dourado flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-dourado" /> Top 10 Melhores Alunos (Pontos &
                  Menores Faltas)
                </h3>
                <span className="text-[11px] text-muted-foreground">Desempate por assiduidade</span>
              </div>
              <div className="space-y-1">
                {topAlunos.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                          i === 0
                            ? "bg-dourado text-black shadow-sm"
                            : i === 1
                              ? "bg-slate-300 text-black"
                              : i === 2
                                ? "bg-amber-700 text-white"
                                : "bg-white/10 text-white/70"
                        }`}
                      >
                        {i + 1}º
                      </span>
                      {a.fotoURL ? (
                        <img
                          src={a.fotoURL}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-white/15 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-dourado/10 border border-dourado/30 flex items-center justify-center text-dourado shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-white block truncate">
                          {a.nome}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {a.sub ||
                            db.categorias.find((c) => c.id === a.categoriaId)?.nome ||
                            "Sem turma"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-dourado text-xs bg-dourado/10 px-2 py-0.5 rounded border border-dourado/20">
                        ⚽ {a.pontos || 0} pts
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          (a.faltas || 0) > 0
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-green-500/10 text-green-400 border border-green-500/20"
                        }`}
                      >
                        {(a.faltas || 0) > 0 ? `${a.faltas} falta(s)` : "0 faltas"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <h3 className="font-anton text-lg text-red-400 mb-3 flex items-center gap-2">
                ⚠️ Alerta de Disciplina (Atletas com Faltas)
              </h3>
              {alertasFaltas.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Nenhum aluno com faltas registradas. Excelente disciplina!
                </p>
              )}
              {alertasFaltas.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <img src={a.fotoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <span className="font-semibold text-sm block">{a.nome}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {db.categorias.find((c) => c.id === a.categoriaId)?.nome}
                      </span>
                    </div>
                  </div>
                  <span className="bg-red-500/20 text-red-400 font-bold px-2.5 py-1 rounded-lg text-xs">
                    {a.faltas} falta(s)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {aba === "cms" && <GestaoCMS />}

      {aba === "visao" && (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Alunos (Academia)" valor={db.alunos.length} />
            <StatCard
              label="Atletas Ativos"
              valor={db.alunos.filter((a) => a.status === "ativo").length}
            />
            <StatCard label="Turmas Ativas" valor={db.categorias.length} />
            <StatCard label="Média de Pontos" valor={`${mediaPontos} pts`} destaque />
          </div>
          <div className="glass rounded-2xl p-4">
            <h3 className="font-anton text-lg text-dourado mb-2">Estatísticas por Categoria</h3>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              {db.categorias.map((c) => {
                const als = db.alunos.filter((a) => a.categoriaId === c.id);
                const pts = als.reduce((s, a) => s + (a.pontos ?? 0), 0);
                return (
                  <div key={c.id} className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <h4 className="font-anton text-dourado text-base">{c.nome}</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {c.faixaEtaria} · {c.horario}
                    </p>
                    <div className="flex justify-between text-xs text-white/80 border-t border-white/10 pt-2">
                      <span>
                        <strong>{als.length}</strong> Atletas
                      </span>
                      <span>
                        <strong>{pts}</strong> Pts totais
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
//  PAINEL DO PAI — vê os seus educandos
// ============================================================================
function PainelPai() {
  const { db, usuario } = useStore();
  const [aba, setAba] = useState<"educandos" | "cartao" | "jogos">("educandos");
  const meusFilhos = useMemo(() => {
    return db.alunos.filter(
      (a) =>
        a.encarregadoId === usuario?.id ||
        (usuario?.nome &&
          a.nomeEncarregado &&
          a.nomeEncarregado.toLowerCase() === usuario.nome.toLowerCase()) ||
        (usuario?.telefone && a.telefoneEncarregado && a.telefoneEncarregado === usuario.telefone),
    );
  }, [db.alunos, usuario]);

  const meusFilhosIds = useMemo(() => meusFilhos.map((f) => f.id), [meusFilhos]);

  return (
    <div className="grid gap-4">
      <Tabs
        aba={aba}
        setAba={setAba as (s: string) => void}
        abas={[
          { id: "educandos", label: "Os Meus Educandos", icon: Users },
          { id: "cartao", label: "Cartão de Atleta (ID Oficial)", icon: Award },
          { id: "jogos", label: "Calendário de Jogos & Convocatórias", icon: CalendarDays },
        ]}
      />

      {aba === "educandos" && (
        <div className="grid gap-4">
          {meusFilhos.length === 0 && (
            <p className="text-sm text-muted-foreground">Sem educandos associados a esta conta.</p>
          )}
          {meusFilhos.map((a) => {
            const cat = db.categorias.find((c) => c.id === a.categoriaId);
            const pagos = db.pagamentos.filter((p) => p.alunoId === a.id && p.status === "pago");
            return (
              <div key={a.id} className="glass rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={a.fotoURL}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover border border-dourado"
                  />
                  <div className="flex-1">
                    <h4 className="font-anton text-xl text-white">{a.nome}</h4>
                    <p className="text-xs text-muted-foreground">
                      {cat?.nome} · {cat?.horario}
                    </p>
                  </div>
                  <Badge tone={a.status === "inadimplente" ? "red" : "green"}>{a.status}</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-sm">
                  <Mini label="Pontos" valor={a.pontos ?? 0} />
                  <Mini label="Faltas" valor={a.faltas ?? 0} />
                  <Mini label="Cartões 🟨" valor={a.cartoesAmarelos || 0} />
                  <Mini label="Cartões 🟥" valor={a.cartoesVermelhos || 0} />
                  <Mini label="Mensalidade" valor={formatKZ(a.valorMensalidade)} />
                </div>
                <button
                  onClick={() => setAba("cartao")}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-dourado to-yellow-500 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-dourado/10 hover:brightness-110 transition-all"
                >
                  <Award className="w-4 h-4" /> Ver Cartão de Atleta Oficial (ID)
                </button>

                {a.avaliacao && (
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-xs space-y-2">
                    <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                      <span className="font-semibold text-dourado uppercase">
                        ⚽ Avaliação Técnica & Física
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Atualizado em: {a.avaliacao.dataAtualizacao}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      <div className="p-1.5 bg-white/5 rounded-lg">
                        <span className="block text-[10px] text-white/60">Técnica</span>
                        <strong className="text-dourado font-bold text-sm">
                          {a.avaliacao.tecnica}/10
                        </strong>
                      </div>
                      <div className="p-1.5 bg-white/5 rounded-lg">
                        <span className="block text-[10px] text-white/60">Tática</span>
                        <strong className="text-dourado font-bold text-sm">
                          {a.avaliacao.tatica}/10
                        </strong>
                      </div>
                      <div className="p-1.5 bg-white/5 rounded-lg">
                        <span className="block text-[10px] text-white/60">Físico</span>
                        <strong className="text-dourado font-bold text-sm">
                          {a.avaliacao.fisico}/10
                        </strong>
                      </div>
                      <div className="p-1.5 bg-white/5 rounded-lg">
                        <span className="block text-[10px] text-white/60">Disciplina</span>
                        <strong className="text-dourado font-bold text-sm">
                          {a.avaliacao.disciplina}/10
                        </strong>
                      </div>
                      <div className="p-1.5 bg-white/5 rounded-lg">
                        <span className="block text-[10px] text-white/60">Assiduidade</span>
                        <strong className="text-dourado font-bold text-sm">
                          {a.avaliacao.assiduidade}/10
                        </strong>
                      </div>
                    </div>
                    {a.avaliacao.obs && (
                      <p className="italic text-white/80 mt-1">💬 "{a.avaliacao.obs}"</p>
                    )}
                  </div>
                )}

                <div>
                  <h5 className="text-sm font-semibold mb-1 text-white/80">Últimos pagamentos</h5>
                  {pagos.length === 0 && (
                    <p className="text-xs text-muted-foreground">Ainda não há registos.</p>
                  )}
                  {pagos.map((p) => (
                    <div
                      key={p.id}
                      className="text-xs flex justify-between py-1 border-b border-border/50 last:border-0"
                    >
                      <span>
                        {p.mesAno} · {p.tipo}
                      </span>
                      <span className="text-primary">{formatKZ(p.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {aba === "cartao" && <GestaoCartoes apenasAlunoIds={meusFilhosIds} />}

      {aba === "jogos" && <GestaoJogos apenasLeitura={true} />}
    </div>
  );
}

// ---------- Pequenos componentes reutilizados -------------------------------

function Tabs({
  aba,
  setAba,
  abas,
}: {
  aba: string;
  setAba: (s: string) => void;
  abas: { id: string; label: string; icon: React.ElementType }[];
}) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {abas.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setAba(t.id)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm border cursor-pointer transition-all ${
            aba === t.id
              ? "border-dourado bg-dourado/15 text-dourado font-bold shadow-md"
              : "border-border text-white/70 hover:bg-white/5 hover:text-white"
          }`}
        >
          <t.icon className="w-4 h-4 shrink-0" /> {t.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label,
  valor,
  destaque,
}: {
  label: string;
  valor: string | number;
  destaque?: boolean;
}) {
  return (
    <div className={`glass rounded-2xl p-4 ${destaque ? "border border-red-500/50" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-anton text-2xl mt-1 ${destaque ? "text-red-400" : "text-dourado"}`}>
        {valor}
      </p>
    </div>
  );
}

function Badge({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "red" | "gold";
}) {
  const cores = {
    green: "bg-primary/20 text-primary",
    red: "bg-red-500/20 text-red-400",
    gold: "bg-dourado/20 text-dourado",
  } as const;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${cores[tone]}`}>
      {children}
    </span>
  );
}

function Campo({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input defaultValue={valor} onBlur={(e) => onChange(e.target.value)} className="input" />
    </label>
  );
}

function Mini({ label, valor }: { label: string; valor: string | number }) {
  return (
    <div className="bg-white/5 rounded-lg py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-anton text-lg text-dourado">{valor}</p>
    </div>
  );
}

// ============================================================================
//  HISTÓRICO / AUDITORIA — lista todas as ações registadas no sistema
//  Aparece nos painéis do Admin e da Secretaria.
// ============================================================================
function HistoricoAuditoria() {
  const { db, atualizar, usuario } = useStore();
  // O Campo defaultValue=="" — vazio significa "todos"
  const [filtroUser, setFiltroUser] = useState<string>("");
  const [filtroEnt, setFiltroEnt] = useState<string>("");

  // Ordena por data (mais recente em cima) e aplica filtros
  const entradas = [...(db.auditoria ?? [])]
    .sort((a, b) => (a.quando < b.quando ? 1 : -1))
    .filter((e) => (filtroUser ? e.usuarioId === filtroUser : true))
    .filter((e) => (filtroEnt ? e.entidade === filtroEnt : true));

  // Lista única de entidades presentes no histórico (para o dropdown)
  const entidades = Array.from(new Set((db.auditoria ?? []).map((e) => e.entidade)));

  function formatarData(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
    } catch {
      return iso;
    }
  }

  async function limparTudo() {
    if (!(await pedirConfirmacao("Apagar TODO o histórico? Esta ação não pode ser desfeita.")))
      return;
    atualizar(
      (d) => {
        d.auditoria = [];
      },
      { acao: "apagar", entidade: "histórico", detalhe: "Limpou o histórico de auditoria" },
    );
  }

  const coresAcao: Record<string, string> = {
    criar: "bg-primary/20 text-primary",
    editar: "bg-dourado/20 text-dourado",
    apagar: "bg-red-500/20 text-red-400",
    acao: "bg-white/10 text-white/70",
  };

  return (
    <div className="grid gap-4">
      <div className="glass rounded-2xl p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-anton text-lg text-dourado flex items-center gap-2">
            <History className="w-5 h-5" /> Histórico de ações
          </h3>
          <p className="text-xs text-muted-foreground">
            Regista quem fez o quê e quando (criar / editar / apagar). Total: {entradas.length}
          </p>
        </div>
        <label className="grid gap-1">
          <span className="text-[10px] text-muted-foreground">Utilizador</span>
          <select
            value={filtroUser}
            onChange={(e) => setFiltroUser(e.target.value)}
            className="input"
          >
            <option value="">Todos</option>
            {(db?.usuarios || [])
              .filter((u) => u && u.id)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-[10px] text-muted-foreground">Entidade</span>
          <select
            value={filtroEnt}
            onChange={(e) => setFiltroEnt(e.target.value)}
            className="input"
          >
            <option value="">Todas</option>
            {entidades.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
        {usuario?.perfil === "admin" && (
          <button
            onClick={limparTudo}
            className="rounded-lg border border-red-500/50 text-red-400 px-3 py-1.5 text-xs hover:bg-red-500/10"
          >
            Limpar histórico
          </button>
        )}
      </div>

      <div className="glass rounded-2xl p-4 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="p-2">Quando</th>
              <th className="p-2">Utilizador</th>
              <th className="p-2">Perfil</th>
              <th className="p-2">Ação</th>
              <th className="p-2">Entidade</th>
              <th className="p-2">Detalhe</th>
            </tr>
          </thead>
          <tbody>
            {entradas.map((e) => (
              <tr key={e.id} className="border-b border-border/50">
                <td className="p-2 text-xs whitespace-nowrap">{formatarData(e.quando)}</td>
                <td className="p-2">{e.usuarioNome}</td>
                <td className="p-2">
                  <Badge>{e.perfil}</Badge>
                </td>
                <td className="p-2">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs ${coresAcao[e.acao] ?? ""}`}
                  >
                    {e.acao}
                  </span>
                </td>
                <td className="p-2 text-xs">{e.entidade}</td>
                <td className="p-2 text-xs">{e.detalhe}</td>
              </tr>
            ))}
            {entradas.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Sem registos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
//  MÓDULO DE GESTÃO DE CONTEÚDO (CMS) — 5 Secções do Site + FAQ
// ============================================================================
function GestaoCMS() {
  const { db, atualizar } = useStore();
  const [subAba, setSubAba] = useState<
    "quemsomos" | "planos" | "galeria" | "videos" | "termos" | "faq"
  >("quemsomos");

  // State para edição de Quem Somos & Missão
  const [quemSomosTitulo, setQuemSomosTitulo] = useState(
    db.config.tituloQuemSomos || "CRESCER DISCIPLINADO E COM SAÚDE.",
  );
  const [quemSomosTexto, setQuemSomosTexto] = useState(db.config.quemSomos || "");

  // State para edição de Regulamento & Termos
  const [termosTexto, setTermosTexto] = useState(db.config.termos || "");

  // State para criação e edição de Planos
  const [planoForm, setPlanoForm] = useState<Partial<PlanoItem>>({
    periodicidade: "Mensal",
    destaque: false,
  });
  const [editandoPlanoId, setEditandoPlanoId] = useState<string | null>(null);
  const [planoEditForm, setPlanoEditForm] = useState<Partial<PlanoItem>>({});

  // State para criação e edição de Galeria
  const [galeriaForm, setGaleriaForm] = useState<Partial<GaleriaItem>>({
    visibilidade: "publico",
    categoria: "Treinos",
  });
  const [editandoGaleriaId, setEditandoGaleriaId] = useState<string | null>(null);
  const [galeriaEditForm, setGaleriaEditForm] = useState<Partial<GaleriaItem>>({});

  // State para criação e edição de Vídeos
  const [videoForm, setVideoForm] = useState<Partial<VideoItem>>({});
  const [editandoVideoId, setEditandoVideoId] = useState<string | null>(null);
  const [videoEditForm, setVideoEditForm] = useState<Partial<VideoItem>>({});

  // State para criação e edição de FAQ
  const [faqForm, setFaqForm] = useState<Partial<FaqItem>>({ ativo: true });
  const [editandoFaqId, setEditandoFaqId] = useState<string | null>(null);
  const [faqEditForm, setFaqEditForm] = useState<Partial<FaqItem>>({});

  // Sincronizar estados com db.config quando mudam
  useEffect(() => {
    if (db.config) {
      setQuemSomosTitulo(db.config.tituloQuemSomos || "CRESCER DISCIPLINADO E COM SAÚDE.");
      setQuemSomosTexto(db.config.quemSomos || "");
      setTermosTexto(db.config.termos || "");
    }
  }, [db.config]);

  // 1. Ações para Quem Somos & Missão
  async function guardarQuemSomos() {
    atualizar(
      (d) => {
        d.config.tituloQuemSomos = quemSomosTitulo.trim();
        d.config.quemSomos = quemSomosTexto.trim();
      },
      {
        acao: "editar",
        entidade: "CMS Quem Somos",
        detalhe: "Atualizou título e texto de 'Quem Somos & Nossa Missão'",
      },
    );
    await mostrarAlerta("Informações de 'Quem Somos & Nossa Missão' guardadas com sucesso!");
  }

  // 2. Ações para Regulamento & Termos
  async function guardarTermos() {
    atualizar(
      (d) => {
        d.config.termos = termosTexto.trim();
      },
      {
        acao: "editar",
        entidade: "CMS Regulamento",
        detalhe: "Atualizou o 'Regulamento & Termos' do site",
      },
    );
    await mostrarAlerta("'Regulamento & Termos' guardados com sucesso!");
  }

  // 3. Ações para Planos
  async function criarPlano() {
    if (!planoForm.titulo || !planoForm.valor) {
      await mostrarAlerta("Preencha o título e o valor do plano.");
      return;
    }
    atualizar(
      (d) => {
        if (!Array.isArray(d.planos)) d.planos = [];
        d.planos.push({
          id: novoId(),
          titulo: planoForm.titulo!,
          valor: planoForm.valor!,
          periodicidade: planoForm.periodicidade || "Mensal",
          descricao: planoForm.descricao || "Plano de formação esportiva",
          vantagens:
            typeof planoForm.vantagens === "string"
              ? (planoForm.vantagens as string)
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean)
              : planoForm.vantagens || ["Treinos semanais", "Acesso à galeria"],
          destaque: !!planoForm.destaque,
        });
      },
      { acao: "criar", entidade: "CMS Plano", detalhe: `Adicionou plano "${planoForm.titulo}"` },
    );
    setPlanoForm({ periodicidade: "Mensal", destaque: false });
    await mostrarAlerta("Novo plano criado com sucesso!");
  }

  async function guardarEdicaoPlano(id: string) {
    if (!planoEditForm.titulo || !planoEditForm.valor) {
      await mostrarAlerta("O título e o valor do plano não podem ficar vazios.");
      return;
    }
    atualizar(
      (d) => {
        const item = d.planos.find((p) => p.id === id);
        if (item) {
          item.titulo = planoEditForm.titulo!;
          item.valor = planoEditForm.valor!;
          item.periodicidade = planoEditForm.periodicidade || "Mensal";
          item.descricao = planoEditForm.descricao || "";
          item.vantagens =
            typeof planoEditForm.vantagens === "string"
              ? (planoEditForm.vantagens as string)
                  .split(",")
                  .map((v) => v.trim())
                  .filter(Boolean)
              : planoEditForm.vantagens || [];
          item.destaque = !!planoEditForm.destaque;
        }
      },
      {
        acao: "editar",
        entidade: "CMS Plano",
        detalhe: `Editou o plano "${planoEditForm.titulo}"`,
      },
    );
    setEditandoPlanoId(null);
    await mostrarAlerta("Plano atualizado com sucesso!");
  }

  // 4. Ações para Galeria
  async function criarFoto() {
    if (!galeriaForm.titulo || !galeriaForm.url) {
      await mostrarAlerta("Preencha o título e a URL da imagem.");
      return;
    }
    atualizar(
      (d) => {
        d.galeria.push({
          id: novoId(),
          titulo: galeriaForm.titulo!,
          url: galeriaForm.url!,
          storagePath: galeriaForm.storagePath || "",
          categoria: galeriaForm.categoria || "Geral",
          legenda: galeriaForm.legenda || "",
          data: new Date().toISOString().slice(0, 10),
          visibilidade: galeriaForm.visibilidade || "publico",
          updatedAt: new Date().toISOString(),
        });
      },
      {
        acao: "criar",
        entidade: "CMS Galeria",
        detalhe: `Publicou imagem "${galeriaForm.titulo}"`,
      },
    );
    setGaleriaForm({
      visibilidade: "publico",
      categoria: "Treinos",
      url: "",
      storagePath: "",
      titulo: "",
      legenda: "",
    });
    await mostrarAlerta("Imagem publicada na galeria!");
  }

  async function guardarEdicaoGaleria(id: string) {
    if (!galeriaEditForm.titulo || !galeriaEditForm.url) {
      await mostrarAlerta("O título e a URL da imagem não podem ficar vazios.");
      return;
    }
    atualizar(
      (d) => {
        const item = d.galeria.find((g) => g.id === id);
        if (item) {
          item.titulo = galeriaEditForm.titulo!;
          item.url = galeriaEditForm.url!;
          item.storagePath = galeriaEditForm.storagePath || item.storagePath || "";
          item.categoria = galeriaEditForm.categoria || "Geral";
          item.legenda = galeriaEditForm.legenda || "";
          item.visibilidade = galeriaEditForm.visibilidade || "publico";
          item.updatedAt = new Date().toISOString();
        }
      },
      {
        acao: "editar",
        entidade: "CMS Galeria",
        detalhe: `Editou imagem "${galeriaEditForm.titulo}"`,
      },
    );
    setEditandoGaleriaId(null);
    await mostrarAlerta("Imagem da galeria atualizada com sucesso!");
  }

  function alternarVisibilidadeFoto(id: string) {
    atualizar(
      (d) => {
        const item = d.galeria.find((g) => g.id === id);
        if (item) item.visibilidade = item.visibilidade === "publico" ? "privado" : "publico";
      },
      { acao: "editar", entidade: "CMS Galeria", detalhe: "Alternou visibilidade da imagem" },
    );
  }

  // 5. Ações para Vídeos
  async function criarVideo() {
    const rawUrl = videoForm.embedUrl || videoForm.url || "";
    if (!videoForm.titulo || !rawUrl) {
      await mostrarAlerta("Preencha o título e o link do vídeo (ex: YouTube/Vimeo).");
      return;
    }
    const embedFormatted = formatarEmbedUrl(rawUrl);

    atualizar(
      (d) => {
        if (!Array.isArray(d.videos)) d.videos = [];
        d.videos.push({
          id: novoId(),
          titulo: videoForm.titulo!,
          descricao: videoForm.descricao || "Vídeo da FILDA II - Escola de Futebol",
          url: rawUrl,
          embedUrl: embedFormatted || rawUrl,
          dataPublicacao: new Date().toISOString().slice(0, 10),
        });
      },
      { acao: "criar", entidade: "CMS Vídeo", detalhe: `Adicionou vídeo "${videoForm.titulo}"` },
    );
    setVideoForm({ titulo: "", descricao: "", url: "", embedUrl: "" });
    await mostrarAlerta("Vídeo adicionado com sucesso!");
  }

  async function guardarEdicaoVideo(id: string) {
    const rawUrl = videoEditForm.embedUrl || videoEditForm.url || "";
    if (!videoEditForm.titulo || !rawUrl) {
      await mostrarAlerta("O título e o link do vídeo não podem ficar vazios.");
      return;
    }
    const embedFormatted = formatarEmbedUrl(rawUrl);

    atualizar(
      (d) => {
        const item = d.videos.find((v) => v.id === id);
        if (item) {
          item.titulo = videoEditForm.titulo!;
          item.url = rawUrl;
          item.embedUrl = embedFormatted || rawUrl;
          item.descricao = videoEditForm.descricao || "";
        }
      },
      { acao: "editar", entidade: "CMS Vídeo", detalhe: `Editou vídeo "${videoEditForm.titulo}"` },
    );
    setEditandoVideoId(null);
    await mostrarAlerta("Vídeo atualizado com sucesso!");
  }

  // 6. Ações para FAQ
  async function criarFaq() {
    if (!faqForm.pergunta || !faqForm.resposta) {
      await mostrarAlerta("Preencha a pergunta e a resposta.");
      return;
    }
    atualizar(
      (d) => {
        d.faq.push({
          id: novoId(),
          pergunta: faqForm.pergunta!,
          resposta: faqForm.resposta!,
          categoria: faqForm.categoria || "Geral",
          ativo: faqForm.ativo !== false,
        });
      },
      { acao: "criar", entidade: "CMS FAQ", detalhe: "Adicionou pergunta no FAQ" },
    );
    setFaqForm({ ativo: true, pergunta: "", resposta: "", categoria: "Geral" });
    await mostrarAlerta("Pergunta adicionada ao FAQ!");
  }

  async function guardarEdicaoFaq(id: string) {
    if (!faqEditForm.pergunta || !faqEditForm.resposta) {
      await mostrarAlerta("A pergunta e a resposta não podem ficar vazias.");
      return;
    }
    atualizar(
      (d) => {
        const item = d.faq.find((f) => f.id === id);
        if (item) {
          item.pergunta = faqEditForm.pergunta!;
          item.resposta = faqEditForm.resposta!;
          item.ativo = faqEditForm.ativo !== false;
        }
      },
      {
        acao: "editar",
        entidade: "CMS FAQ",
        detalhe: `Editou item do FAQ "${faqEditForm.pergunta}"`,
      },
    );
    setEditandoFaqId(null);
    await mostrarAlerta("Pergunta do FAQ atualizada!");
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabeçalho do CMS */}
      <div className="glass rounded-3xl p-6 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-anton text-2xl text-dourado uppercase tracking-wide flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-dourado" /> Gestão de Conteúdo (CMS)
          </h3>
          <p className="text-xs text-muted-foreground font-light mt-1">
            Edite todas as secções do site público em tempo real: Quem Somos, Planos, Galeria,
            Vídeos e Termos.
          </p>
        </div>

        {/* Menu de Sub-abas */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10">
          {[
            { id: "quemsomos", label: "Quem Somos", icon: Trophy },
            { id: "planos", label: "Planos & Investimento", icon: DollarSign },
            { id: "galeria", label: "Galeria & Jogos", icon: ImageIcon },
            { id: "videos", label: "Vídeos & Metodologia", icon: Video },
            { id: "termos", label: "Regulamento & Termos", icon: Shield },
            { id: "faq", label: "FAQ (Dúvidas)", icon: HelpCircle },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() =>
                setSubAba(t.id as "quemsomos" | "planos" | "galeria" | "videos" | "termos" | "faq")
              }
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subAba === t.id
                  ? "bg-dourado text-background shadow-md shadow-dourado/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-ABA 1: QUEM SOMOS & NOSSA MISSÃO */}
      {subAba === "quemsomos" && (
        <div className="glass rounded-3xl p-6 border border-white/10 space-y-5 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-dourado/10 border border-dourado/30 flex items-center justify-center text-dourado">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-anton text-xl text-white uppercase tracking-wide">
                Editar: Quem Somos & Nossa Missão
              </h4>
              <p className="text-xs text-muted-foreground font-light">
                Altere o título de destaque e a descrição institucional que aparecem na página
                inicial.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dourado mb-1 uppercase tracking-wider">
                Título Destaque
              </label>
              <input
                type="text"
                value={quemSomosTitulo}
                onChange={(e) => setQuemSomosTitulo(e.target.value)}
                placeholder="Ex: CRESCER DISCIPLINADO E COM SAÚDE."
                className="input w-full bg-black/40 text-sm font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dourado mb-1 uppercase tracking-wider">
                Descrição Institucional / História & Missão
              </label>
              <textarea
                rows={6}
                value={quemSomosTexto}
                onChange={(e) => setQuemSomosTexto(e.target.value)}
                placeholder="Escreva a apresentação da escola de futebol, valores e objetivos..."
                className="input w-full bg-black/40 text-xs sm:text-sm leading-relaxed text-white/90 resize-y"
              />
            </div>

            <button
              onClick={guardarQuemSomos}
              className="btn-gold rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-dourado/20 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Guardar Alterações em "Quem Somos"
            </button>
          </div>
        </div>
      )}

      {/* SUB-ABA 2: PLANOS & INVESTIMENTO */}
      {subAba === "planos" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass rounded-3xl p-6 border border-white/10 space-y-4 md:col-span-1">
            <h4 className="font-anton text-lg text-dourado uppercase tracking-wide">
              Novo Plano de Preço
            </h4>
            <div className="space-y-3">
              <input
                placeholder="Título (Ex: Plano Competitivo)"
                value={planoForm.titulo || ""}
                onChange={(e) => setPlanoForm({ ...planoForm, titulo: e.target.value })}
                className="input w-full bg-black/40 text-xs"
              />
              <input
                placeholder="Valor (Ex: 25.000 Kz ou 2.500 Kz)"
                value={planoForm.valor || ""}
                onChange={(e) => setPlanoForm({ ...planoForm, valor: e.target.value })}
                className="input w-full bg-black/40 text-xs"
              />
              <input
                placeholder="Periodicidade (Ex: Mensal / Trimestral)"
                value={planoForm.periodicidade || ""}
                onChange={(e) => setPlanoForm({ ...planoForm, periodicidade: e.target.value })}
                className="input w-full bg-black/40 text-xs"
              />
              <textarea
                rows={2}
                placeholder="Descrição resumida do plano"
                value={planoForm.descricao || ""}
                onChange={(e) => setPlanoForm({ ...planoForm, descricao: e.target.value })}
                className="input w-full bg-black/40 resize-none text-xs"
              />
              <input
                placeholder="Vantagens separadas por vírgula"
                value={
                  typeof planoForm.vantagens === "string"
                    ? planoForm.vantagens
                    : (planoForm.vantagens || []).join(", ")
                }
                onChange={(e) =>
                  setPlanoForm({ ...planoForm, vantagens: e.target.value as unknown as string[] })
                }
                className="input w-full bg-black/40 text-xs"
              />
              <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={!!planoForm.destaque}
                  onChange={(e) => setPlanoForm({ ...planoForm, destaque: e.target.checked })}
                  className="rounded border-white/20 bg-black/40 text-dourado focus:ring-dourado"
                />
                <span>Marcar como Recomendado (Destaque)</span>
              </label>
              <button
                onClick={criarPlano}
                className="w-full btn-gold py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Cadastrar Novo Plano
              </button>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-white/10 md:col-span-2 space-y-4">
            <h4 className="font-anton text-lg text-dourado uppercase tracking-wide">
              Planos Cadastrados ({db.planos.length})
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {db.planos.map((p) => {
                const estaEditando = editandoPlanoId === p.id;

                if (estaEditando) {
                  return (
                    <div
                      key={p.id}
                      className="p-5 rounded-2xl bg-black/80 border-2 border-dourado space-y-3 shadow-2xl"
                    >
                      <h5 className="font-anton text-sm text-dourado uppercase">A Editar Plano</h5>
                      <input
                        placeholder="Título"
                        value={planoEditForm.titulo || ""}
                        onChange={(e) =>
                          setPlanoEditForm({ ...planoEditForm, titulo: e.target.value })
                        }
                        className="input w-full bg-black/60 text-xs font-bold text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Valor"
                          value={planoEditForm.valor || ""}
                          onChange={(e) =>
                            setPlanoEditForm({ ...planoEditForm, valor: e.target.value })
                          }
                          className="input w-full bg-black/60 text-xs"
                        />
                        <input
                          placeholder="Periodicidade"
                          value={planoEditForm.periodicidade || ""}
                          onChange={(e) =>
                            setPlanoEditForm({ ...planoEditForm, periodicidade: e.target.value })
                          }
                          className="input w-full bg-black/60 text-xs"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Descrição"
                        value={planoEditForm.descricao || ""}
                        onChange={(e) =>
                          setPlanoEditForm({ ...planoEditForm, descricao: e.target.value })
                        }
                        className="input w-full bg-black/60 text-xs resize-none"
                      />
                      <input
                        placeholder="Vantagens (separadas por vírgula)"
                        value={
                          typeof planoEditForm.vantagens === "string"
                            ? planoEditForm.vantagens
                            : (planoEditForm.vantagens || []).join(", ")
                        }
                        onChange={(e) =>
                          setPlanoEditForm({
                            ...planoEditForm,
                            vantagens: e.target.value as unknown as string[],
                          })
                        }
                        className="input w-full bg-black/60 text-xs"
                      />
                      <label className="flex items-center gap-2 text-xs text-white/90 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!planoEditForm.destaque}
                          onChange={(e) =>
                            setPlanoEditForm({ ...planoEditForm, destaque: e.target.checked })
                          }
                          className="rounded border-white/20 bg-black/40 text-dourado"
                        />
                        <span>Plano Recomendado (Destaque)</span>
                      </label>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => guardarEdicaoPlano(p.id)}
                          className="flex-1 btn-gold py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Guardar
                        </button>
                        <button
                          onClick={() => setEditandoPlanoId(null)}
                          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-black/40 border border-white/10 relative space-y-2 flex flex-col justify-between hover:border-white/20 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="font-anton text-lg text-white">{p.titulo}</h5>
                        {p.destaque && (
                          <span className="bg-dourado/20 text-dourado border border-dourado/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                            RECOMENDADO
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold text-dourado mt-1">
                        {p.valor}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          / {p.periodicidade}
                        </span>
                      </p>
                      <p className="text-xs text-white/70 font-light mt-2">{p.descricao}</p>
                      <ul className="mt-3 space-y-1 text-xs text-white/80">
                        {(p.vantagens || []).map((vt, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> {vt}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setEditandoPlanoId(p.id);
                          setPlanoEditForm({
                            titulo: p.titulo,
                            valor: p.valor,
                            periodicidade: p.periodicidade,
                            descricao: p.descricao,
                            vantagens: p.vantagens,
                            destaque: p.destaque,
                          });
                        }}
                        className="text-xs flex items-center gap-1 bg-dourado/15 hover:bg-dourado/25 text-dourado px-3 py-1.5 rounded-lg border border-dourado/30 cursor-pointer font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>

                      <button
                        onClick={async () => {
                          if (await pedirConfirmacao(`Remover o plano "${p.titulo}"?`)) {
                            atualizar(
                              (d) => {
                                d.planos = d.planos.filter((x) => x.id !== p.id);
                              },
                              {
                                acao: "apagar",
                                entidade: "CMS Plano",
                                detalhe: `Removeu plano "${p.titulo}"`,
                              },
                            );
                          }
                        }}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remover
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 3: GALERIA DE TREINOS & JOGOS */}
      {subAba === "galeria" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass rounded-3xl p-6 border border-white/10 space-y-4 md:col-span-1">
            <h4 className="font-anton text-lg text-dourado uppercase tracking-wide">
              Publicar Foto na Galeria
            </h4>
            <div className="space-y-3">
              <input
                placeholder="Título / Evento (Ex: Amistoso Sub-15)"
                value={galeriaForm.titulo || ""}
                onChange={(e) => setGaleriaForm({ ...galeriaForm, titulo: e.target.value })}
                className="input w-full bg-black/40 text-xs"
              />
              <UploadImagem
                pasta="galeria"
                previa={galeriaForm.url || ""}
                onConcluido={({ url, storagePath }) =>
                  setGaleriaForm((f) => ({ ...f, url, storagePath }))
                }
              />
              <input
                placeholder="Ou cole aqui uma URL de imagem (opcional)"
                value={galeriaForm.url || ""}
                onChange={(e) => setGaleriaForm({ ...galeriaForm, url: e.target.value })}
                className="input w-full bg-black/40 text-xs"
              />
              <input
                placeholder="Categoria (Ex: Treinos, Jogos, Eventos)"
                value={galeriaForm.categoria || ""}
                onChange={(e) => setGaleriaForm({ ...galeriaForm, categoria: e.target.value })}
                className="input w-full bg-black/40 text-xs"
              />
              <textarea
                rows={2}
                placeholder="Legenda da foto (Opcional)"
                value={galeriaForm.legenda || ""}
                onChange={(e) => setGaleriaForm({ ...galeriaForm, legenda: e.target.value })}
                className="input w-full bg-black/40 resize-none text-xs"
              />
              <select
                value={galeriaForm.visibilidade || "publico"}
                onChange={(e) =>
                  setGaleriaForm({
                    ...galeriaForm,
                    visibilidade: e.target.value as "publico" | "privado",
                  })
                }
                className="input w-full bg-black/40 text-xs"
              >
                <option value="publico">Visibilidade: Público (Aparece no Site)</option>
                <option value="privado">Visibilidade: Privado (Apenas na Secretaria/Pais)</option>
              </select>
              <button
                onClick={criarFoto}
                className="w-full btn-gold py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Publicar Imagem
              </button>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-white/10 md:col-span-2 space-y-4">
            <h4 className="font-anton text-lg text-dourado uppercase tracking-wide">
              Acervo de Imagens ({db.galeria.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {db.galeria.map((g) => {
                const estaEditando = editandoGaleriaId === g.id;

                if (estaEditando) {
                  return (
                    <div
                      key={g.id}
                      className="rounded-2xl bg-black/90 border-2 border-dourado p-4 space-y-2 shadow-2xl col-span-1 sm:col-span-2"
                    >
                      <h5 className="font-anton text-xs text-dourado uppercase">Editar Foto</h5>
                      <input
                        placeholder="Título"
                        value={galeriaEditForm.titulo || ""}
                        onChange={(e) =>
                          setGaleriaEditForm({ ...galeriaEditForm, titulo: e.target.value })
                        }
                        className="input w-full bg-black/60 text-xs font-bold text-white"
                      />
                      <UploadImagem
                        pasta="galeria"
                        label="Substituir imagem"
                        previa={galeriaEditForm.url || ""}
                        onConcluido={({ url, storagePath }) =>
                          setGaleriaEditForm((f) => ({ ...f, url, storagePath }))
                        }
                      />
                      <input
                        placeholder="URL da Imagem"
                        value={galeriaEditForm.url || ""}
                        onChange={(e) =>
                          setGaleriaEditForm({ ...galeriaEditForm, url: e.target.value })
                        }
                        className="input w-full bg-black/60 text-xs"
                      />
                      <input
                        placeholder="Categoria"
                        value={galeriaEditForm.categoria || ""}
                        onChange={(e) =>
                          setGaleriaEditForm({ ...galeriaEditForm, categoria: e.target.value })
                        }
                        className="input w-full bg-black/60 text-xs"
                      />
                      <input
                        placeholder="Legenda"
                        value={galeriaEditForm.legenda || ""}
                        onChange={(e) =>
                          setGaleriaEditForm({ ...galeriaEditForm, legenda: e.target.value })
                        }
                        className="input w-full bg-black/60 text-xs"
                      />
                      <select
                        value={galeriaEditForm.visibilidade || "publico"}
                        onChange={(e) =>
                          setGaleriaEditForm({
                            ...galeriaEditForm,
                            visibilidade: e.target.value as "publico" | "privado",
                          })
                        }
                        className="input w-full bg-black/60 text-xs"
                      >
                        <option value="publico">Público (Visível no site)</option>
                        <option value="privado">Privado (Oculto do site)</option>
                      </select>
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => guardarEdicaoGaleria(g.id)}
                          className="flex-1 btn-gold py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Guardar
                        </button>
                        <button
                          onClick={() => setEditandoGaleriaId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={g.id}
                    className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      <div className="aspect-video relative overflow-hidden bg-black">
                        <img
                          src={g.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase backdrop-blur-md ${
                            g.visibilidade === "publico"
                              ? "bg-green-500/80 text-white"
                              : "bg-yellow-500/80 text-black"
                          }`}
                        >
                          {g.visibilidade === "publico" ? "Público" : "Privado"}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-white text-xs truncate">{g.titulo}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {g.categoria} · {g.data}
                        </p>
                      </div>
                    </div>

                    <div className="p-2 border-t border-white/5 flex items-center justify-between gap-1 bg-white/5">
                      <button
                        onClick={() => {
                          setEditandoGaleriaId(g.id);
                          setGaleriaEditForm({
                            titulo: g.titulo,
                            url: g.url,
                            storagePath: g.storagePath,
                            categoria: g.categoria,
                            legenda: g.legenda,
                            visibilidade: g.visibilidade,
                          });
                        }}
                        className="p-1.5 rounded-lg bg-dourado/15 hover:bg-dourado/25 text-dourado text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Editar imagem"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>

                      <button
                        onClick={() => alternarVisibilidadeFoto(g.id)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-[10px] flex items-center gap-1 cursor-pointer"
                        title="Alternar Público/Privado"
                      >
                        {g.visibilidade === "publico" ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={async () => {
                          if (await pedirConfirmacao(`Excluir imagem "${g.titulo}"?`)) {
                            await apagarImagem(g.storagePath);
                            atualizar(
                              (d) => {
                                d.galeria = d.galeria.filter((x) => x.id !== g.id);
                              },
                              {
                                acao: "apagar",
                                entidade: "CMS Galeria",
                                detalhe: `Excluiu foto "${g.titulo}"`,
                              },
                            );
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 4: VÍDEOS & METODOLOGIA */}
      {subAba === "videos" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass rounded-3xl p-6 border border-white/10 space-y-4 md:col-span-1">
            <h4 className="font-anton text-lg text-dourado uppercase tracking-wide">
              Cadastrar Vídeo
            </h4>
            <div className="space-y-3">
              <input
                placeholder="Título do Vídeo (Ex: Melhores Momentos)"
                value={videoForm.titulo || ""}
                onChange={(e) => setVideoForm({ ...videoForm, titulo: e.target.value })}
                className="input w-full bg-black/40 text-xs"
              />
              <input
                placeholder="Link / Embed URL (YouTube/Vimeo)"
                value={videoForm.embedUrl || videoForm.url || ""}
                onChange={(e) =>
                  setVideoForm({ ...videoForm, embedUrl: e.target.value, url: e.target.value })
                }
                className="input w-full bg-black/40 text-xs"
              />
              <textarea
                rows={3}
                placeholder="Descrição e metodologia explicada no vídeo"
                value={videoForm.descricao || ""}
                onChange={(e) => setVideoForm({ ...videoForm, descricao: e.target.value })}
                className="input w-full bg-black/40 resize-none text-xs"
              />
              <button
                onClick={criarVideo}
                className="w-full btn-gold py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Adicionar Vídeo
              </button>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-white/10 md:col-span-2 space-y-4">
            <h4 className="font-anton text-lg text-dourado uppercase tracking-wide">
              Vídeos Publicados ({db.videos.length})
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {db.videos.map((vid) => {
                const estaEditando = editandoVideoId === vid.id;

                if (estaEditando) {
                  return (
                    <div
                      key={vid.id}
                      className="p-4 rounded-2xl bg-black/90 border-2 border-dourado space-y-3 shadow-2xl"
                    >
                      <h5 className="font-anton text-xs text-dourado uppercase">Editar Vídeo</h5>
                      <input
                        placeholder="Título do Vídeo"
                        value={videoEditForm.titulo || ""}
                        onChange={(e) =>
                          setVideoEditForm({ ...videoEditForm, titulo: e.target.value })
                        }
                        className="input w-full bg-black/60 text-xs font-bold text-white"
                      />
                      <input
                        placeholder="Link / URL (YouTube/Vimeo)"
                        value={videoEditForm.embedUrl || videoEditForm.url || ""}
                        onChange={(e) =>
                          setVideoEditForm({
                            ...videoEditForm,
                            embedUrl: e.target.value,
                            url: e.target.value,
                          })
                        }
                        className="input w-full bg-black/60 text-xs"
                      />
                      <textarea
                        rows={3}
                        placeholder="Descrição e Metodologia"
                        value={videoEditForm.descricao || ""}
                        onChange={(e) =>
                          setVideoEditForm({ ...videoEditForm, descricao: e.target.value })
                        }
                        className="input w-full bg-black/60 text-xs resize-none"
                      />
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => guardarEdicaoVideo(vid.id)}
                          className="flex-1 btn-gold py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Guardar
                        </button>
                        <button
                          onClick={() => setEditandoVideoId(null)}
                          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                }

                const srcEmbed = formatarEmbedUrl(vid.embedUrl || vid.url);

                return (
                  <div
                    key={vid.id}
                    className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all"
                  >
                    <div>
                      <div className="aspect-video rounded-xl overflow-hidden bg-black border border-white/5">
                        {srcEmbed ? (
                          <iframe
                            src={srcEmbed}
                            title={vid.titulo}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
                            Sem Embed
                          </div>
                        )}
                      </div>
                      <h5 className="font-anton text-base text-white mt-2">{vid.titulo}</h5>
                      <p className="text-xs text-muted-foreground font-light mt-1 line-clamp-2">
                        {vid.descricao}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setEditandoVideoId(vid.id);
                          setVideoEditForm({
                            titulo: vid.titulo,
                            url: vid.url,
                            embedUrl: vid.embedUrl,
                            descricao: vid.descricao,
                          });
                        }}
                        className="text-xs flex items-center gap-1 bg-dourado/15 hover:bg-dourado/25 text-dourado px-3 py-1.5 rounded-lg border border-dourado/30 cursor-pointer font-semibold"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>

                      <button
                        onClick={async () => {
                          if (await pedirConfirmacao(`Excluir vídeo "${vid.titulo}"?`)) {
                            atualizar(
                              (d) => {
                                d.videos = d.videos.filter((x) => x.id !== vid.id);
                              },
                              {
                                acao: "apagar",
                                entidade: "CMS Vídeo",
                                detalhe: `Removeu vídeo "${vid.titulo}"`,
                              },
                            );
                          }
                        }}
                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 5: REGULAMENTO & TERMOS */}
      {subAba === "termos" && (
        <div className="glass rounded-3xl p-6 border border-white/10 space-y-5 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-dourado/10 border border-dourado/30 flex items-center justify-center text-dourado">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-anton text-xl text-white uppercase tracking-wide">
                Editar: Regulamento & Termos do Projeto
              </h4>
              <p className="text-xs text-muted-foreground font-light">
                Defina o regulamento interno, normas de conduta, termos de matrícula e
                responsabilidade dos encarregados.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dourado mb-1 uppercase tracking-wider">
                Texto do Regulamento & Termos de Uso
              </label>
              <textarea
                rows={12}
                value={termosTexto}
                onChange={(e) => setTermosTexto(e.target.value)}
                placeholder="Insira as regras de convivência, pontualidade, fardamento, pagamentos..."
                className="input w-full bg-black/40 text-xs sm:text-sm font-mono leading-relaxed text-white/90 resize-y"
              />
            </div>

            <button
              onClick={guardarTermos}
              className="btn-gold rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-dourado/20 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Guardar Alterações no Regulamento & Termos
            </button>
          </div>
        </div>
      )}

      {/* SUB-ABA 6: FAQ */}
      {subAba === "faq" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass rounded-3xl p-6 border border-white/10 space-y-4 md:col-span-1">
            <h4 className="font-anton text-lg text-dourado uppercase tracking-wide">
              Adicionar Pergunta no FAQ
            </h4>
            <div className="space-y-3">
              <input
                placeholder="Pergunta (Ex: A partir de qual idade?)"
                value={faqForm.pergunta || ""}
                onChange={(e) => setFaqForm({ ...faqForm, pergunta: e.target.value })}
                className="input w-full bg-black/40 text-xs"
              />
              <textarea
                rows={4}
                placeholder="Resposta clara e explicativa"
                value={faqForm.resposta || ""}
                onChange={(e) => setFaqForm({ ...faqForm, resposta: e.target.value })}
                className="input w-full bg-black/40 resize-none text-xs"
              />
              <button
                onClick={criarFaq}
                className="w-full btn-gold py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Cadastrar no FAQ
              </button>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-white/10 md:col-span-2 space-y-4">
            <h4 className="font-anton text-lg text-dourado uppercase tracking-wide">
              Perguntas Cadastradas ({db.faq.length})
            </h4>
            <div className="space-y-3">
              {db.faq.map((f) => {
                const estaEditando = editandoFaqId === f.id;

                if (estaEditando) {
                  return (
                    <div
                      key={f.id}
                      className="p-4 rounded-2xl bg-black/90 border-2 border-dourado space-y-3 shadow-2xl"
                    >
                      <h5 className="font-anton text-xs text-dourado uppercase">
                        Editar Pergunta FAQ
                      </h5>
                      <input
                        placeholder="Pergunta"
                        value={faqEditForm.pergunta || ""}
                        onChange={(e) =>
                          setFaqEditForm({ ...faqEditForm, pergunta: e.target.value })
                        }
                        className="input w-full bg-black/60 text-xs font-bold text-white"
                      />
                      <textarea
                        rows={3}
                        placeholder="Resposta"
                        value={faqEditForm.resposta || ""}
                        onChange={(e) =>
                          setFaqEditForm({ ...faqEditForm, resposta: e.target.value })
                        }
                        className="input w-full bg-black/60 text-xs resize-none"
                      />
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => guardarEdicaoFaq(f.id)}
                          className="flex-1 btn-gold py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Guardar
                        </button>
                        <button
                          onClick={() => setEditandoFaqId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={f.id}
                    className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start justify-between gap-4 hover:border-white/20 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${f.ativo ? "bg-green-400" : "bg-red-400"}`}
                        />
                        <h5 className="font-bold text-sm text-white">{f.pergunta}</h5>
                      </div>
                      <p className="text-xs text-white/70 font-light leading-relaxed">
                        {f.resposta}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditandoFaqId(f.id);
                          setFaqEditForm({
                            pergunta: f.pergunta,
                            resposta: f.resposta,
                            ativo: f.ativo,
                          });
                        }}
                        className="p-1.5 rounded-lg bg-dourado/15 hover:bg-dourado/25 text-dourado text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="Editar pergunta"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          atualizar(
                            (d) => {
                              const item = d.faq.find((x) => x.id === f.id);
                              if (item) item.ativo = !item.ativo;
                            },
                            {
                              acao: "editar",
                              entidade: "CMS FAQ",
                              detalhe: "Alternou ativo no FAQ",
                            },
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                          f.ativo
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {f.ativo ? "Ativo" : "Inativo"}
                      </button>

                      <button
                        onClick={async () => {
                          if (await pedirConfirmacao(`Remover pergunta do FAQ?`)) {
                            atualizar(
                              (d) => {
                                d.faq = d.faq.filter((x) => x.id !== f.id);
                              },
                              {
                                acao: "apagar",
                                entidade: "CMS FAQ",
                                detalhe: "Excluiu item do FAQ",
                              },
                            );
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
