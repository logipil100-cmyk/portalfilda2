/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

// ============================================================================
//  PÁGINA INICIAL (/) — Site público da JJ Futebol Academy
//  Contém: Hero, Pré-Matrícula com WhatsApp, Planos, Galeria, Vídeos,
//          Quem Somos, FAQ, Termos, Rodapé e o modal de Acesso à Secretaria.
// ============================================================================

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import heroFilda from "@/assets/hero-filda.jpg";
import { useMemo, useState } from "react";
import { useStore, formatKZ, novoId, formatarEmbedUrl, type Aluno } from "@/lib/store";
import { mostrarAlerta } from "@/lib/dialogs";
import {
  CheckCircle2,
  ChevronDown,
  LogIn,
  Send,
  Trophy,
  X,
  PlayCircle,
  MessageSquare,
  Users,
  Calendar,
  HeartPulse,
  Activity,
  Phone,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Facebook,
  Instagram,
  Youtube,
  Award,
  Search,
  User,
  QrCode,
  Bell,
  Smartphone,
  Download,
} from "lucide-react";
import { CartaoAtletaOficial } from "./painel";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { DigitalCarteiraModal } from "@/components/DigitalCarteiraModal";
import { CentralNotificacoesModal } from "@/components/CentralNotificacoesModal";
import { MobileAppHeader } from "@/components/MobileAppHeader";

function TiktokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FILDA II - Escola de Futebol | Escola de Campeões — Pré-Matrículas Abertas" },
      {
        name: "description",
        content:
          "Escola de futebol de alto rendimento. Categorias Sub-11 a Adulto, misters licenciados e acompanhamento completo.",
      },
      { property: "og:title", content: "FILDA II - Escola de Futebol | Escola de Campeões" },
      {
        property: "og:description",
        content:
          "Formando atletas de alto rendimento e cidadãos exemplares. Faça já a sua pré-matrícula.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { db, usuario, logout } = useStore();
  const navigate = useNavigate();
  const [loginAberto, setLoginAberto] = useState(false);
  const [carteiraAberta, setCarteiraAberta] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("inicio");
  const [modoApp, setModoApp] = useState(true);

  const galeriaPublica = useMemo(
    () => db.galeria.filter((g) => g.visibilidade === "publico"),
    [db.galeria],
  );
  const faqAtivo = useMemo(() => db.faq.filter((f) => f.ativo), [db.faq]);

  return (
    <div className="min-h-screen bg-background text-foreground font-poppins selection:bg-dourado selection:text-background pb-16 md:pb-0">
      {/* ---------- CABEÇALHO DO APLICATIVO ---------- */}
      <MobileAppHeader
        onAbrirCarteira={() => setCarteiraAberta(true)}
        onAbrirNotificacoes={() => setNotificacoesAbertas(true)}
        onAbrirLogin={() => setLoginAberto(true)}
        modoApp={modoApp}
        setModoApp={setModoApp}
      />

      {/* ---------- BARRA DE AÇÕES RÁPIDAS DO APP ---------- */}
      <div className="bg-gradient-to-r from-[#0b1220] via-[#111c30] to-[#0b1220] border-b border-dourado/20 py-2.5 px-4 shadow-xl sticky top-14 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setCarteiraAberta(true)}
            type="button"
            className="flex items-center gap-1.5 bg-dourado/15 hover:bg-dourado/25 border border-dourado/40 text-dourado rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition-all active:scale-95 shadow-sm shadow-dourado/10"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Carteira QR</span>
          </button>
          <a
            href="#matricula"
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white hover:text-dourado rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-dourado" />
            <span>Pré-Matrícula Express</span>
          </a>
          <button
            onClick={() => setNotificacoesAbertas(true)}
            type="button"
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white hover:text-dourado rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition-all active:scale-95"
          >
            <Bell className="w-3.5 h-3.5 text-dourado" />
            <span>Avisos & Notificações</span>
          </button>
          <a
            href="#ranking"
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/15 text-white hover:text-dourado rounded-xl px-3 py-1.5 text-xs font-bold shrink-0 transition-all active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-dourado" />
            <span>Top 10 Atletas</span>
          </a>
        </div>
      </div>

      <main className="pt-16">
        {/* ---------- HERO ---------- */}
        <section
          id="hero"
          className="relative min-h-[90vh] flex items-center justify-center text-center px-4 py-20 overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={
                db.config.heroImageURL ||
                heroFilda
              }
              alt="Estádio e Treinamento"
              className="w-full h-full object-cover scale-105 animate-pulse-slow"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/75 to-black/60" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(11,18,32,0.8)_100%)]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dourado/10 border border-dourado/30 text-dourado text-xs font-bold uppercase tracking-widest mb-6">
              <Trophy className="w-3.5 h-3.5" /> Projeto Esportivo de Alto Rendimento
            </div>
            <h1 className="font-anton text-4xl sm:text-6xl md:text-7xl mb-6 text-white uppercase tracking-tight leading-none drop-shadow-lg">
              {db.config.hero || "CRESCER DISCIPLINADO E COM SAÚDE."}
            </h1>
            <p className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              {db.config.nome} <span className="text-dourado">·</span> {db.config.lema}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#matricula"
                className="btn-gold px-8 py-4 rounded-xl text-base font-bold uppercase tracking-wider flex items-center gap-2.5 shadow-xl shadow-dourado/20 hover:scale-105 transition-transform"
              >
                <UserCheck className="w-5 h-5" /> Fazer Pré-Matrícula Agora
              </a>
              <a
                href="#planos"
                className="px-8 py-4 rounded-xl text-base font-semibold bg-white/10 hover:bg-white/15 border border-white/20 text-white transition-all backdrop-blur-sm"
              >
                Conhecer Planos
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto pt-10 border-t border-white/10">
              <div className="text-center">
                <p className="font-anton text-2xl sm:text-3xl text-dourado">100%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Prática no Campo
                </p>
              </div>
              <div className="text-center">
                <p className="font-anton text-2xl sm:text-3xl text-dourado">Sub-11 +</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Todas Categorias
                </p>
              </div>
              <div className="text-center">
                <p className="font-anton text-2xl sm:text-3xl text-dourado">PRO</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Comissão Técnica
                </p>
              </div>
              <div className="text-center">
                <p className="font-anton text-2xl sm:text-3xl text-dourado">WhatsApp</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Suporte Imediato
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- QUEM SOMOS ---------- */}
        <Section
          id="sobre"
          title="Quem Somos & Nossa Missão"
          subtitle="Conheça a essência e o método do nosso projeto esportivo"
        >
          <div className="glass rounded-3xl p-8 sm:p-10 max-w-4xl mx-auto border border-white/10 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-dourado/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-dourado/20 to-dourado/5 border border-dourado/30 flex items-center justify-center shrink-0 shadow-lg">
                <Trophy className="w-12 h-12 text-dourado" />
              </div>
              <div className="space-y-4 text-left">
                <h3 className="font-anton text-2xl text-white tracking-wide">
                  {db.config.tituloQuemSomos || "CRESCER DISCIPLINADO E COM SAÚDE."}
                </h3>
                <p className="text-white/80 leading-relaxed text-sm sm:text-base font-light">
                  {db.config.quemSomos}
                </p>
                <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-dourado">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Metodologia Avançada
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Formação Cidadã
                  </span>
                </div>
                <div className="pt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-white/60 uppercase font-semibold mr-1">
                    Redes Sociais:
                  </span>
                  <a
                    href={db.config.redesSociais?.facebook || "https://facebook.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-dourado/20 text-white/80 hover:text-dourado border border-white/10 hover:border-dourado/40 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="Facebook"
                  >
                    <Facebook className="w-3.5 h-3.5 text-dourado" /> <span>Facebook</span>
                  </a>
                  <a
                    href={db.config.redesSociais?.instagram || "https://instagram.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-dourado/20 text-white/80 hover:text-dourado border border-white/10 hover:border-dourado/40 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5 text-dourado" /> <span>Instagram</span>
                  </a>
                  <a
                    href={db.config.redesSociais?.youtube || "https://youtube.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-dourado/20 text-white/80 hover:text-dourado border border-white/10 hover:border-dourado/40 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="YouTube"
                  >
                    <Youtube className="w-3.5 h-3.5 text-dourado" /> <span>YouTube</span>
                  </a>
                  <a
                    href={db.config.redesSociais?.tiktok || "https://tiktok.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-dourado/20 text-white/80 hover:text-dourado border border-white/10 hover:border-dourado/40 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="TikTok"
                  >
                    <TiktokIcon className="w-3.5 h-3.5 text-dourado" /> <span>TikTok</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ---------- TOP 10 MELHORES ALUNOS (RANKING) ---------- */}
        <Section
          id="ranking"
          title="🏆 Top 10 Melhores Alunos"
          subtitle="Ranking oficial da academia por pontuação de mérito, assiduidade e disciplina (menores faltas)"
        >
          <Top10RankingSection />
        </Section>

        {/* ---------- PLANOS E PREÇOS ---------- */}
        <Section
          id="planos"
          title="Planos & Investimento"
          subtitle="Escolha o programa ideal para a faixa etária e nível técnico"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {(db.planos.length > 0
              ? db.planos
              : [
                  {
                    id: "basico",
                    titulo: "Mensalidade (1 Criança)",
                    valor: formatKZ(db.config.valorMensalidade || 2500),
                    periodicidade: "Mensal",
                    descricao: "Mensalidade regular para 1 atleta na academia.",
                    vantagens: [
                      "Treinos técnicos e táticos",
                      "Participação em jogos e torneios",
                      "Prazo: até o dia 5 (multa de 500 Kz)",
                    ],
                    destaque: false,
                  },
                  {
                    id: "irmaos",
                    titulo: "Mensalidade Família (2+ Irmãos)",
                    valor: formatKZ(db.config.valorMensalidadeIrmaos || 2000),
                    periodicidade: "Mensal (cada)",
                    descricao: "Condição especial para famílias com 2 ou mais crianças.",
                    vantagens: [
                      "Desconto especial de irmão",
                      "Treinos em todas as categorias",
                      "Prazo: até o dia 5 (multa de 500 Kz)",
                    ],
                    destaque: true,
                  },
                  {
                    id: "equipamento",
                    titulo: "Equipamento Oficial FILDA II",
                    valor: formatKZ(db.config.valorEquipamento || 6800),
                    periodicidade: "Único",
                    descricao: "Kit de treino e jogo oficial da escola de futebol.",
                    vantagens: [
                      "Camisa e calção oficiais",
                      "Meias desportivas de jogo",
                      "Obrigatório para jogos",
                    ],
                    destaque: false,
                  },
                  {
                    id: "inscricao",
                    titulo: "Taxa de Inscrição / Matrícula",
                    valor: formatKZ(db.config.valorInscricao || 5000),
                    periodicidade: "Único",
                    descricao: "Taxa única de ingresso e avaliação inicial.",
                    vantagens: [
                      "Cadastro oficial no sistema",
                      "Emissão de ficha do atleta",
                      "Avaliação inicial técnica",
                    ],
                    destaque: false,
                  },
                ]
            ).map((p) => (
              <div
                key={p.id}
                className={`rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                  p.destaque
                    ? "bg-gradient-to-b from-dourado/15 via-[#12203a] to-[#0f192d] border-2 border-dourado shadow-2xl shadow-dourado/10 relative -translate-y-1 md:-translate-y-2"
                    : "glass border border-white/10 hover:border-white/20"
                }`}
              >
                {p.destaque && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-dourado text-background px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest shadow-md">
                    RECOMENDADO
                  </div>
                )}
                <div>
                  <h3 className="font-anton text-2xl text-white tracking-wide mb-2">{p.titulo}</h3>
                  <p className="text-xs text-muted-foreground mb-6 font-light leading-relaxed min-h-[36px]">
                    {p.descricao}
                  </p>

                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span className="font-anton text-3xl sm:text-4xl text-dourado">
                        {p.valor}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        / {p.periodicidade || "mês"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">
                    Vantagens incluídas:
                  </p>
                  <ul className="space-y-3 mb-8">
                    {(p.vantagens || []).map((vt, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-white/90">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <span>{vt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#matricula"
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-center transition-all block ${
                    p.destaque
                      ? "btn-gold shadow-lg shadow-dourado/20 hover:opacity-95"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
                  }`}
                >
                  Selecionar & Matricular
                </a>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------- MÓDULO DE PRÉ-MATRÍCULA DO ATLETA ---------- */}
        <Section
          id="matricula"
          title="Pré-Matrícula do Atleta"
          subtitle="Preencha os dados para cadastro no sistema e conexão direta pelo WhatsApp da secretaria"
        >
          <MatriculaForm />
        </Section>

        {/* ---------- GALERIA DE IMAGENS ---------- */}
        <Section
          id="galeria"
          title="Galeria de Treinos & Jogos"
          subtitle="Momentos marcantes da nossa formação esportiva"
        >
          {galeriaPublica.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhuma imagem publicada na galeria no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {galeriaPublica.map((g) => (
                <div
                  key={g.id}
                  className="glass rounded-2xl overflow-hidden group border border-white/10 hover:border-dourado/40 transition-all duration-300"
                >
                  <div className="aspect-video sm:aspect-square overflow-hidden relative bg-black/40">
                    <img
                      src={g.url}
                      alt={g.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {g.categoria && (
                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-dourado px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-dourado/30">
                        {g.categoria}
                      </span>
                    )}
                  </div>
                  <div className="p-3.5">
                    <p className="text-xs font-bold text-white truncate group-hover:text-dourado transition-colors">
                      {g.titulo}
                    </p>
                    {g.legenda && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 font-light">
                        {g.legenda}
                      </p>
                    )}
                    <p className="text-[10px] text-white/40 mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {g.data}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ---------- VÍDEOS DA ACADEMIA ---------- */}
        {db.videos.length > 0 && (
          <Section
            id="videos"
            title="Vídeos & Metodologia"
            subtitle="Acompanhe nossos destaques em campo e análises táticas"
          >
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {db.videos.map((vid) => {
                const srcEmbed = formatarEmbedUrl(vid.embedUrl || vid.url);
                return (
                  <div
                    key={vid.id}
                    className="glass rounded-3xl overflow-hidden border border-white/10 p-4 space-y-3"
                  >
                    <div className="aspect-video rounded-2xl overflow-hidden bg-black relative border border-white/5">
                      {srcEmbed ? (
                        <iframe
                          src={srcEmbed}
                          title={vid.titulo}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-black to-slate-900 p-6 text-center">
                          <PlayCircle className="w-16 h-16 text-dourado mb-2 animate-bounce" />
                          <p className="text-xs text-white/70">
                            Clique no botão abaixo para assistir ao vídeo original
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="px-2 pb-2">
                      <h4 className="font-anton text-lg text-white tracking-wide">{vid.titulo}</h4>
                      <p className="text-xs text-muted-foreground mt-1 font-light leading-relaxed">
                        {vid.descricao}
                      </p>
                      {vid.url && (
                        <a
                          href={vid.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-dourado hover:underline"
                        >
                          <PlayCircle className="w-4 h-4" /> Abrir no YouTube / Origem
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ---------- FAQ (PERGUNTAS FREQUENTES) ---------- */}
        <Section
          id="faq"
          title="Perguntas Frequentes (FAQ)"
          subtitle="Tire suas dúvidas sobre matrículas, horários e treinamentos"
        >
          <div className="max-w-3xl mx-auto space-y-3">
            {faqAtivo.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                Nenhuma pergunta frequente cadastrada no momento.
              </p>
            ) : (
              faqAtivo.map((f) => <FaqRow key={f.id} pergunta={f.pergunta} resposta={f.resposta} />)
            )}
          </div>
        </Section>

        {/* ---------- TERMOS DE USO & CONDIÇÕES ---------- */}
        <Section
          id="termos"
          title="Regulamento & Termos"
          subtitle="Regras de convivência, pontualidade e espírito esportivo"
        >
          <div className="glass rounded-3xl p-8 max-w-4xl mx-auto border border-white/10">
            <p className="text-white/80 leading-relaxed text-xs sm:text-sm whitespace-pre-line font-light">
              {db.config.termos}
            </p>
          </div>
        </Section>

        {/* ---------- RODAPÉ DA ACADEMIA ---------- */}
        <footer className="border-t border-white/10 bg-black/40 py-12 px-4 text-center text-xs text-muted-foreground space-y-4 mt-20">
          <div className="font-anton text-xl text-dourado tracking-wider">{db.config.nome}</div>
          <div className="text-white/90 font-semibold text-sm sm:text-base">
            "{db.config.lema || "CRESCER DISCIPLINADO E COM SAÚDE."}"
            <p className="text-xs text-white/60 font-normal mt-0.5">
              É o nosso lema · NIF/Registro: {db.config.nif}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-white/80 font-medium pt-1">
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
              <span>
                <strong>WhatsApp:</strong> {db.config.whatsapp || "+244 956 438 286"}
              </span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
              <Phone className="w-3.5 h-3.5 text-dourado" />
              <span>
                <strong>Chamadas:</strong> {db.config.telefone || "+244 945 387 697"}
              </span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
              <span>{db.config.email}</span>
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 pt-3">
            <a
              href={db.config.redesSociais?.facebook || "https://facebook.com"}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-dourado/20 text-white/80 hover:text-dourado border border-white/10 hover:border-dourado/40 transition-all flex items-center gap-2 text-xs font-semibold shadow-md"
            >
              <Facebook className="w-4 h-4 text-dourado" /> <span>Facebook</span>
            </a>
            <a
              href={db.config.redesSociais?.instagram || "https://instagram.com"}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-dourado/20 text-white/80 hover:text-dourado border border-white/10 hover:border-dourado/40 transition-all flex items-center gap-2 text-xs font-semibold shadow-md"
            >
              <Instagram className="w-4 h-4 text-dourado" /> <span>Instagram</span>
            </a>
            <a
              href={db.config.redesSociais?.youtube || "https://youtube.com"}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-dourado/20 text-white/80 hover:text-dourado border border-white/10 hover:border-dourado/40 transition-all flex items-center gap-2 text-xs font-semibold shadow-md"
            >
              <Youtube className="w-4 h-4 text-dourado" /> <span>YouTube</span>
            </a>
            <a
              href={db.config.redesSociais?.tiktok || "https://tiktok.com"}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-dourado/20 text-white/80 hover:text-dourado border border-white/10 hover:border-dourado/40 transition-all flex items-center gap-2 text-xs font-semibold shadow-md"
            >
              <TiktokIcon className="w-4 h-4 text-dourado" /> <span>TikTok</span>
            </a>
          </div>
          <p className="text-[11px] text-white/30 pt-2">
            © {new Date().getFullYear()} {db.config.nome}. Todos os direitos reservados.
          </p>
        </footer>
      </main>

      {/* ---------- MODAL DE ACESSO À SECRETARIA ---------- */}
      {loginAberto && <ModalLogin onClose={() => setLoginAberto(false)} />}

      {/* ---------- PWA & COMPONENTES NATIVOS DO APLICATIVO ---------- */}
      <PWAInstallBanner />
      <MobileBottomNav
        abaAtiva={abaAtiva}
        setAbaAtiva={setAbaAtiva}
        onAbrirCarteira={() => setCarteiraAberta(true)}
        onAbrirNotificacoes={() => setNotificacoesAbertas(true)}
      />
      <DigitalCarteiraModal aberto={carteiraAberta} onFechar={() => setCarteiraAberta(false)} />
      <CentralNotificacoesModal
        aberto={notificacoesAbertas}
        onFechar={() => setNotificacoesAbertas(false)}
      />
    </div>
  );
}

// -------- COMPONENTES DO MÓDULO DE PRÉ-MATRÍCULA --------------------

function MatriculaForm() {
  const { db, atualizar } = useStore();

  // Campos obrigatórios da pré-matrícula do atleta
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [sub, setSub] = useState("Sub-11");
  const [estadoFisico, setEstadoFisico] = useState<string>("Excelente");
  const [estadoMedico, setEstadoMedico] = useState<string>("Apto");
  const [lesoes, setLesoes] = useState("");
  const [problemasRespiratorios, setProblemasRespiratorios] = useState<string>("Não");
  const [nomeEncarregado, setNomeEncarregado] = useState("");
  const [telefoneEncarregado, setTelefoneEncarregado] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [modalTermosAberto, setModalTermosAberto] = useState(false);

  const [enviado, setEnviado] = useState(false);
  const [ultimoWhatsAppUrl, setUltimoWhatsAppUrl] = useState("");

  // Cálculo automático sugerido de Sub pela Data de Nascimento
  function lidarComMudancaDataNasc(data: string) {
    setDataNasc(data);
    if (!data) return;
    const anoNasc = new Date(data).getFullYear();
    const anoAtual = new Date().getFullYear();
    const idade = anoAtual - anoNasc;

    if (!isNaN(idade)) {
      if (idade <= 11) setSub("Sub-11");
      else if (idade <= 13) setSub("Sub-13");
      else if (idade <= 15) setSub("Sub-15");
      else if (idade <= 17) setSub("Sub-17");
      else if (idade <= 20) setSub("Sub-20");
      else setSub("Adulto");
    }
  }

  async function enviarPreMatricula(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !dataNasc || !nomeEncarregado.trim() || !telefoneEncarregado.trim()) {
      await mostrarAlerta("Por favor, preencha todos os campos obrigatórios da pré-matrícula.");
      return;
    }

    if (!aceitouTermos) {
      await mostrarAlerta(
        "Por favor, leia e aceite os Termos e Condições do encarregado para enviar a pré-matrícula.",
      );
      return;
    }

    const novoAtletaId = novoId();
    const dataHoje = new Date().toISOString().slice(0, 10);

    // 1. Cadastra na lista do sistema com status inicial "NÃO PAGO"
    atualizar(
      (d) => {
        if (!Array.isArray(d.alunos)) d.alunos = [];
        d.alunos.push({
          id: novoAtletaId,
          nome: nome.trim(),
          dataNasc,
          sub,
          estadoFisico,
          estadoMedico,
          lesoes: lesoes.trim() || "Nenhuma lesão relatada.",
          problemasRespiratorios,
          nomeEncarregado: nomeEncarregado.trim(),
          telefoneEncarregado: telefoneEncarregado.trim(),
          statusPagamento: "NÃO PAGO",
          dataCadastro: dataHoje,
          // Compatibilidade
          categoriaId:
            d.categorias.find((c) => c.nome.toLowerCase().includes(sub.toLowerCase()))?.id ||
            d.categorias[0]?.id ||
            "c1",
          fotoURL: "",
          status: "inadimplente",
          valorMensalidade: d.config?.valorMensalidade || 2500,
        });
      },
      {
        acao: "criar",
        entidade: "aluno",
        detalhe: `Nova pré-matrícula recebida: ${nome.trim()} (${sub})`,
      },
    );

    // 2. Monta mensagem formatada contendo TODOS os dados para o WhatsApp da Academia
    const msg =
      `*🌟 NOVA PRÉ-MATRÍCULA — FILDA II - ESCOLA DE FUTEBOL 🌟*\n\n` +
      `*⚽ DADOS DO ATLETA:*\n` +
      `• *Nome Completo:* ${nome.trim()}\n` +
      `• *Data de Nascimento:* ${dataNasc}\n` +
      `• *Categoria / Sub:* ${sub}\n\n` +
      `*🏥 ESTADO MÉDICO E FÍSICO:*\n` +
      `• *Estado Físico:* ${estadoFisico}\n` +
      `• *Estado Médico:* ${estadoMedico}\n` +
      `• *Lesões Registadas:* ${lesoes.trim() || "Nenhuma"}\n` +
      `• *Problemas Respiratórios:* ${problemasRespiratorios}\n\n` +
      `*👨‍👧‍👦 ENCARREGADO DE EDUCAÇÃO:*\n` +
      `• *Nome do Encarregado:* ${nomeEncarregado.trim()}\n` +
      `• *Telefone/WhatsApp:* ${telefoneEncarregado.trim()}\n\n` +
      `*💰 TABELA DE INVESTIMENTO:*\n` +
      `• *Inscrição:* 5.000 Kz (pagamento único)\n` +
      `• *Mensalidade:* 2.500 Kz (ou 2.000 Kz caso tenha irmão matriculado)\n` +
      `• *Equipamento Oficial:* 6.800 Kz\n` +
      `• *Prazo de Pagamento:* Até o dia 5 (após o dia 5 incide multa de 500 Kz)\n\n` +
      `_Enviado através do Portal Web FILDA II - Escola de Futebol — Status Inicial: NÃO PAGO_`;

    const foneAcademia = (db.config.whatsapp || "244956438286").replace(/\D/g, "");
    const urlWa = `https://api.whatsapp.com/send?phone=${foneAcademia}&text=${encodeURIComponent(msg)}`;

    setUltimoWhatsAppUrl(urlWa);
    setEnviado(true);

    // Abre o WhatsApp automaticamente
    window.open(urlWa, "_blank");
  }

  function resetarFormulario() {
    setNome("");
    setDataNasc("");
    setSub("Sub-11");
    setEstadoFisico("Excelente");
    setEstadoMedico("Apto");
    setLesoes("");
    setProblemasRespiratorios("Não");
    setNomeEncarregado("");
    setTelefoneEncarregado("");
    setAceitouTermos(false);
    setEnviado(false);
  }

  if (enviado) {
    return (
      <div className="glass rounded-3xl p-8 max-w-2xl mx-auto text-center border-2 border-green-500/40 bg-gradient-to-b from-green-500/10 to-transparent space-y-6 shadow-2xl animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto text-green-400">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h3 className="font-anton text-2xl text-white tracking-wide">
            Pré-Matrícula Registada com Sucesso!
          </h3>
          <p className="text-sm text-white/80 mt-2 max-w-md mx-auto">
            O atleta <strong>{nome}</strong> foi cadastrado no sistema da secretaria com o status
            inicial <span className="text-yellow-400 font-bold">NÃO PAGO</span>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-left space-y-1.5 text-white/70">
          <p className="font-bold text-dourado uppercase tracking-wider mb-2">
            Próximos Passos no WhatsApp:
          </p>
          <p>1. A janela de conversa com a secretaria foi aberta automaticamente.</p>
          <p>2. Envie a mensagem formatada para confirmar a inscrição do atleta.</p>
          <p>3. Compareça à secretaria ou faça a transferência para ativar o status PAGO.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {ultimoWhatsAppUrl && (
            <a
              href={ultimoWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-dourado/20"
            >
              <MessageSquare className="w-4 h-4" /> Abrir WhatsApp Novamente
            </a>
          )}
          <button
            onClick={resetarFormulario}
            className="px-6 py-3 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all"
          >
            Cadastrar Outro Atleta
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={enviarPreMatricula}
      className="glass rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto border border-white/15 shadow-2xl space-y-8 text-left"
    >
      <div className="border-b border-white/10 pb-4">
        <h3 className="font-anton text-2xl text-dourado tracking-wide flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-dourado" /> Ficha de Cadastro do Atleta
        </h3>
        <p className="text-xs text-muted-foreground mt-1 font-light">
          Preencha todas as informações com precisão. Os dados serão enviados à secretaria e
          registrados no banco local.
        </p>
      </div>

      {/* DADOS DO ATLETA */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-dourado uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-4 h-4" /> 1. Identificação do Atleta
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-semibold text-white/80 uppercase">
              Nome Completo do Atleta *
            </label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Mateus Eduardo Silva"
              className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-dourado transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-white/80 uppercase">
              Data de Nascimento *
            </label>
            <input
              required
              type="date"
              value={dataNasc}
              onChange={(e) => lidarComMudancaDataNasc(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-dourado transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-white/80 uppercase">
              Categoria / Sub (Sugerido pela idade) *
            </label>
            <select
              required
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-dourado transition-all"
            >
              <option value="Sub-11" className="bg-[#0b1220]">
                Sub-11 (Até 11 anos)
              </option>
              <option value="Sub-13" className="bg-[#0b1220]">
                Sub-13 (12 e 13 anos)
              </option>
              <option value="Sub-15" className="bg-[#0b1220]">
                Sub-15 (14 e 15 anos)
              </option>
              <option value="Sub-17" className="bg-[#0b1220]">
                Sub-17 (16 e 17 anos)
              </option>
              <option value="Sub-20" className="bg-[#0b1220]">
                Sub-20 (18 a 20 anos)
              </option>
              <option value="Adulto" className="bg-[#0b1220]">
                Adulto (+20 anos)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ESTADO FÍSICO E MÉDICO */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h4 className="text-xs font-bold text-dourado uppercase tracking-wider flex items-center gap-1.5">
          <HeartPulse className="w-4 h-4" /> 2. Avaliação Médica e Física
        </h4>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-white/80 uppercase">
              Estado Físico *
            </label>
            <select
              value={estadoFisico}
              onChange={(e) => setEstadoFisico(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white outline-none focus:border-dourado transition-all"
            >
              <option value="Excelente" className="bg-[#0b1220]">
                Excelente
              </option>
              <option value="Bom" className="bg-[#0b1220]">
                Bom
              </option>
              <option value="Regular" className="bg-[#0b1220]">
                Regular
              </option>
              <option value="Reabilitação" className="bg-[#0b1220]">
                Reabilitação
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-white/80 uppercase">
              Estado Médico *
            </label>
            <select
              value={estadoMedico}
              onChange={(e) => setEstadoMedico(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white outline-none focus:border-dourado transition-all"
            >
              <option value="Apto" className="bg-[#0b1220]">
                Apto
              </option>
              <option value="Apto com Restrições" className="bg-[#0b1220]">
                Apto com Restrições
              </option>
              <option value="Inapto" className="bg-[#0b1220]">
                Inapto
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-white/80 uppercase">
              Problemas Respiratórios? *
            </label>
            <select
              value={problemasRespiratorios}
              onChange={(e) => setProblemasRespiratorios(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-3 text-sm text-white outline-none focus:border-dourado transition-all"
            >
              <option value="Não" className="bg-[#0b1220]">
                Não
              </option>
              <option value="Sim" className="bg-[#0b1220]">
                Sim
              </option>
            </select>
          </div>

          <div className="space-y-1 sm:col-span-3">
            <label className="text-[11px] font-semibold text-white/80 uppercase">
              Lesões ou Restrições Físicas (Descritivo)
            </label>
            <textarea
              rows={2}
              value={lesoes}
              onChange={(e) => setLesoes(e.target.value)}
              placeholder="Descreva se o atleta já sofreu alguma lesão recente (joelho, tornozelo, cirurgias, etc.) ou digite 'Nenhuma'."
              className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-dourado transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* DADOS DO ENCARREGADO DE EDUCAÇÃO */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <h4 className="text-xs font-bold text-dourado uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="w-4 h-4" /> 3. Encarregado de Educação
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-white/80 uppercase">
              Nome do Encarregado *
            </label>
            <input
              required
              value={nomeEncarregado}
              onChange={(e) => setNomeEncarregado(e.target.value)}
              placeholder="Ex: Manuel Eduardo Silva"
              className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-dourado transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-white/80 uppercase">
              Telefone / WhatsApp do Encarregado *
            </label>
            <input
              required
              type="tel"
              value={telefoneEncarregado}
              onChange={(e) => setTelefoneEncarregado(e.target.value)}
              placeholder="Ex: +244 945 387 686"
              className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-dourado transition-all"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-4 border-t border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* TERMOS E CONDIÇÕES PARA O ENCARREGADO ACEITAR E LER */}
          <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 max-w-md">
            <input
              type="checkbox"
              id="aceitouTermos"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black/40 text-dourado focus:ring-dourado accent-dourado cursor-pointer shrink-0"
            />
            <label
              htmlFor="aceitouTermos"
              className="cursor-pointer text-xs text-white/90 leading-tight"
            >
              Eu, encarregado de educação, li e aceito os{" "}
              <button
                type="button"
                onClick={() => setModalTermosAberto(true)}
                className="text-dourado font-bold underline hover:text-yellow-300 transition-colors inline-flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 inline" /> Termos e Condições
              </button>{" "}
              de inscrição do atleta. *
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setModalTermosAberto(true)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-dourado" /> Ler Termos
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto btn-gold px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-dourado/20 hover:scale-102 transition-transform shrink-0"
            >
              <Send className="w-4 h-4" /> Enviar Pré-Matrícula via WhatsApp
            </button>
          </div>
        </div>

        <div className="text-[11px] text-white/50 flex flex-wrap items-center gap-3 pt-1 border-t border-white/5">
          <span>
            ⚡ Status inicial: <strong>NÃO PAGO</strong>
          </span>
          <span>•</span>
          <span>💬 Direcionamento automático para a Secretaria via WhatsApp</span>
        </div>
      </div>

      {/* MODAL DE LEITURA DOS TERMOS E CONDIÇÕES */}
      {modalTermosAberto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-dourado/40 shadow-2xl space-y-5 text-left relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setModalTermosAberto(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-dourado">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-anton text-2xl tracking-wide text-white">
                Termos e Condições de Pré-Matrícula
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-white/80 space-y-3 leading-relaxed max-h-60 overflow-y-auto font-light whitespace-pre-line">
              {db.config.termos}
            </div>

            <div className="p-3.5 rounded-2xl bg-dourado/10 border border-dourado/25 text-xs text-dourado font-medium leading-relaxed">
              💡 Ao aceitar, o encarregado de educação compromete-se a acompanhar a frequência do
              atleta e respeitar o regulamento desportivo e financeiro da FILDA II - Escola de
              Futebol.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalTermosAberto(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAceitouTermos(true);
                  setModalTermosAberto(false);
                }}
                className="btn-gold px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-dourado/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Li e Concordo com os Termos
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

// -------- OUTROS COMPONENTES AUXILIARES ---------------------------------------

function Top10RankingSection() {
  const { db } = useStore();
  const [catSel, setCatSel] = useState("Todos");

  const categorias = ["Todos", "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Sub-20", "Adulto"];

  const top10 = useMemo(() => {
    return [...db.alunos]
      .filter(
        (a) => (a.status === "ativo" || !a.status) && (catSel === "Todos" || a.sub === catSel),
      )
      .sort((a, b) => {
        const ptsA = a.pontos || 0;
        const ptsB = b.pontos || 0;
        if (ptsB !== ptsA) return ptsB - ptsA;
        return (a.faltas || 0) - (b.faltas || 0);
      })
      .slice(0, 10);
  }, [db.alunos, catSel]);

  const top3 = top10.slice(0, 3);
  const restantes = top10.slice(3);

  return (
    <div className="space-y-8">
      {/* Banner explicativo */}
      <div className="glass rounded-2xl p-4 max-w-2xl mx-auto text-center border border-dourado/30">
        <p className="text-xs text-white/80 leading-relaxed font-light">
          O ranking valoriza o empenho tático, liderança e assiduidade nos treinos.{" "}
          <span className="text-dourado font-semibold">Critério de desempate:</span> menor número de
          faltas acumuladas.
        </p>
      </div>

      {/* Filtros de Categoria */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setCatSel(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              catSel === c
                ? "bg-dourado text-black shadow-lg shadow-dourado/20 scale-105"
                : "glass text-white/70 hover:text-white border border-white/10 hover:border-white/20"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {top10.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center border border-white/10 max-w-xl mx-auto">
          <Trophy className="w-12 h-12 text-dourado/40 mx-auto mb-3 animate-bounce" />
          <p className="text-sm text-white/70">
            Nenhum atleta ranqueado na categoria{" "}
            <span className="text-dourado font-bold">{catSel}</span> no momento.
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-light">
            Os pontos são atribuídos pelo Mister ou Secretaria por mérito e disciplina.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 3 Pódio */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
              {top3.map((a, idx) => {
                const isGold = idx === 0;
                const isSilver = idx === 1;
                const medalha = isGold ? "🥇 1º LUGAR" : isSilver ? "🥈 2º LUGAR" : "🥉 3º LUGAR";
                const borderClass = isGold
                  ? "border-2 border-dourado bg-gradient-to-b from-dourado/20 via-[#12203a] to-[#0f192d] shadow-2xl shadow-dourado/10 relative -translate-y-1 md:-translate-y-2"
                  : isSilver
                    ? "border border-slate-300/40 bg-gradient-to-b from-slate-400/10 via-[#111c30] to-[#0f192d]"
                    : "border border-amber-700/40 bg-gradient-to-b from-amber-700/10 via-[#111c30] to-[#0f192d]";

                return (
                  <div
                    key={a.id}
                    className={`rounded-3xl p-6 flex flex-col justify-between items-center text-center transition-all duration-300 ${borderClass}`}
                  >
                    <div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest mb-4 shadow-sm ${
                          isGold
                            ? "bg-dourado text-black"
                            : isSilver
                              ? "bg-slate-300 text-black"
                              : "bg-amber-700 text-white"
                        }`}
                      >
                        {medalha}
                      </span>
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        {a.fotoURL ? (
                          <img
                            src={a.fotoURL}
                            alt={a.nome}
                            className={`w-20 h-20 rounded-full object-cover border-2 shadow-lg ${
                              isGold
                                ? "border-dourado"
                                : isSilver
                                  ? "border-slate-300"
                                  : "border-amber-700"
                            }`}
                          />
                        ) : (
                          <div
                            className={`w-20 h-20 rounded-full bg-dourado/10 flex items-center justify-center text-dourado border-2 shadow-lg ${
                              isGold
                                ? "border-dourado"
                                : isSilver
                                  ? "border-slate-300"
                                  : "border-amber-700"
                            }`}
                          >
                            <User className="w-10 h-10" />
                          </div>
                        )}
                        {isGold && (
                          <span className="absolute -bottom-1 -right-1 bg-dourado text-black rounded-full p-1 shadow animate-pulse">
                            <Trophy className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <h4 className="font-anton text-xl text-white tracking-wide truncate max-w-[200px] mx-auto">
                        {a.nome}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                        {a.sub || "Categoria Livre"}
                      </p>
                    </div>

                    <div className="w-full mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                      <div className="bg-dourado/10 border border-dourado/30 px-3 py-1.5 rounded-xl text-dourado font-bold text-xs flex items-center gap-1">
                        ⚽ {a.pontos || 0} pts
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                          (a.faltas || 0) > 0
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-green-500/10 text-green-400 border border-green-500/20"
                        }`}
                      >
                        {(a.faltas || 0) > 0 ? `${a.faltas} falta(s)` : "✔️ 0 faltas"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4º ao 10º Lugar */}
          {restantes.length > 0 && (
            <div className="glass rounded-3xl p-6 max-w-4xl mx-auto border border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4 px-2">
                Outros Destaques (4º ao 10º Lugar)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {restantes.map((a, idx) => {
                  const pos = idx + 4;
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/10">
                          {pos}º
                        </span>
                        {a.fotoURL ? (
                          <img
                            src={a.fotoURL}
                            alt={a.nome}
                            className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-dourado/10 border border-dourado/30 flex items-center justify-center text-dourado shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-white truncate">{a.nome}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {a.sub || "Categoria Livre"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-dourado text-xs bg-dourado/10 px-2.5 py-1 rounded-lg border border-dourado/20">
                          ⚽ {a.pontos || 0} pts
                        </span>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-lg font-semibold ${
                            (a.faltas || 0) > 0
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-green-500/10 text-green-400 border border-green-500/20"
                          }`}
                        >
                          {(a.faltas || 0) > 0 ? `${a.faltas} falta(s)` : "0 faltas"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-20 px-4 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center mb-12 max-w-2xl mx-auto space-y-2">
        <h2 className="font-anton text-3xl sm:text-4xl text-dourado tracking-wide uppercase">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground font-light">{subtitle}</p>
        )}
        <div className="w-16 h-1 bg-dourado mx-auto rounded-full mt-4" />
      </div>
      {children}
    </section>
  );
}

function FaqRow({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="glass rounded-2xl border border-white/10 overflow-hidden transition-colors hover:border-white/20">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
      >
        <span className="font-semibold text-sm sm:text-base text-white">{pergunta}</span>
        <div
          className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 transition-transform duration-300 ${aberto ? "rotate-180 bg-dourado text-background" : "text-dourado"}`}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      {aberto && (
        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-white/70 font-light leading-relaxed border-t border-white/5">
          {resposta}
        </div>
      )}
    </div>
  );
}

function ModalLogin({ onClose }: { onClose: () => void }) {
  const { login, loginWithGoogle, loginWithFirebase } = useStore();
  const navigate = useNavigate();
  const [userOrSenha, setUserOrSenha] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    // Primeiro tenta login local/sistema
    const r = login(userOrSenha, senha);
    if (r.ok) {
      setCarregando(false);
      onClose();
      navigate({ to: "/painel" });
      return;
    }

    // Se for formato de email, tenta Firebase Auth
    if (userOrSenha.includes("@")) {
      const fbResult = await loginWithFirebase(userOrSenha, senha);
      if (fbResult.ok) {
        setCarregando(false);
        onClose();
        navigate({ to: "/painel" });
        return;
      } else {
        setErro(fbResult.msg ?? "Falha na autenticação via Firebase Auth.");
      }
    } else {
      setErro(r.msg ?? "Utilizador ou senha incorretos.");
    }
    setCarregando(false);
  }

  async function entrarComGoogle() {
    setErro("");
    setCarregando(true);
    const r = await loginWithGoogle();
    setCarregando(false);
    if (r.ok) {
      onClose();
      navigate({ to: "/painel" });
    } else {
      setErro(r.msg ?? "Erro ao entrar com a conta Google.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submeter}
        className="glass rounded-3xl p-7 w-full max-w-md border border-white/20 shadow-2xl space-y-6 relative text-left"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <div className="w-12 h-12 rounded-2xl bg-dourado/10 border border-dourado/30 flex items-center justify-center text-dourado mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-anton text-2xl text-dourado uppercase tracking-wide">
            Acesso ao Painel
          </h3>
          <p className="text-xs text-muted-foreground mt-1 font-light">
            FILDA II - Escola de Formação
          </p>
        </div>

        <button
          type="button"
          disabled={carregando}
          onClick={entrarComGoogle}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {carregando ? "Autenticando..." : "Entrar com a Conta Google"}
        </button>

        <div className="flex items-center gap-3 my-2">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
            Ou com utilizador / e-mail
          </span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-white/80 uppercase">
              Utilizador / E-mail
            </label>
            <input
              required
              value={userOrSenha}
              onChange={(e) => setUserOrSenha(e.target.value)}
              placeholder="ex: user ou email@exemplo.com"
              className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-dourado transition-all font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-white/80 uppercase">
              Senha de Acesso
            </label>
            <input
              required
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-dourado transition-all font-mono"
            />
          </div>
        </div>

        {erro && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium text-center">
            {erro}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={carregando}
            className="w-full btn-gold py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-dourado/20 disabled:opacity-50"
          >
            {carregando ? "A processar..." : "Acesso ao Painel"}
          </button>
          <p className="text-[10px] text-center text-white/40 mt-3 font-light">
            Contacte a secretaria para obter as suas credenciais de acesso.
          </p>
        </div>
      </form>
    </div>
  );
}
