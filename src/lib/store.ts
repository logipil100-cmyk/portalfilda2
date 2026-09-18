import fildaEquipa from "@/assets/filda-equipa.png.asset.json";
import fildaAtletaAgua from "@/assets/filda-atleta-agua.jpg.asset.json";
import fildaAtletaForca from "@/assets/filda-atleta-forca.jpg.asset.json";
/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

// ============================================================================
//  STORE — Banco de dados da FILDA II - Escola de Futebol com sincronização na nuvem (Firebase)
// ============================================================================
//  Este ficheiro gerencia a persistência mista (localStorage + Firestore real-time):
//    1) Tipos e Estruturas de Dados
//    2) Dados Iniciais (Seed)
//    3) Leitura e Gravação com Lógica de Expiração Automática
//    4) Hook React (useStore)
// ============================================================================

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  gravarDiferencas,
  migrarParaColecoes,
  subscreverColecoes,
} from "./firestore-colecoes";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, garantirSessaoFirebase } from "./firebase";
import { traduzirErroParaPortugues } from "./error-translator";

// --- 1) TIPOS -----------------------------------------------------------------

export type Perfil = "admin" | "secretaria" | "mister" | "pai" | "encarregado" | "aluno";

export interface Usuario {
  id: string;
  nome: string;
  user: string; // nome de login
  senha: string;
  perfil: Perfil;
  telefone?: string;
  fotoURL?: string;
  status?: "pendente" | "ativo" | "rejeitado";
}

export type SubCategoria = "Sub-11" | "Sub-13" | "Sub-15" | "Sub-17" | "Sub-20" | "Adulto" | string;
export type EstadoFisico = "Excelente" | "Bom" | "Regular" | "Reabilitação" | string;
export type EstadoMedico = "Apto" | "Apto com Restrições" | "Inapto" | string;
export type StatusPagamento = "PAGO" | "NÃO PAGO";

// Atleta / Aluno pré-matriculado ou cadastrado
export interface Aluno {
  id: string;
  nome: string; // Nome Completo do Atleta
  dataNasc: string; // Data de Nascimento
  sub: SubCategoria; // Sub (Categoria ex: Sub-11, Sub-13, Sub-15, Sub-17, Sub-20, Adulto)
  estadoFisico: EstadoFisico; // Estado Físico
  estadoMedico: EstadoMedico; // Estado Médico
  lesoes: string; // Lesões (Campo descritivo)
  problemasRespiratorios: "Sim" | "Não" | string; // Problemas Respiratórios
  nomeEncarregado: string; // Nome do Encarregado de Educação
  telefoneEncarregado: string; // Número de Telefone/WhatsApp do Encarregado
  statusPagamento: StatusPagamento; // Status de pagamento ("PAGO" | "NÃO PAGO")
  dataExpiracao?: string; // Data de Expiração da Mensalidade (YYYY-MM-DD)
  dataCadastro: string; // Data de pré-matrícula/cadastro (YYYY-MM-DD)

  // Campos de compatibilidade legada / opcionais
  categoriaId?: string;
  fotoURL?: string;
  encarregadoId?: string;
  status?: "ativo" | "inadimplente" | "inativo";
  pontos?: number;
  faltas?: number;
  cartoesAmarelos?: number;
  cartoesVermelhos?: number;
  mesesAtraso?: number;
  valorMensalidade?: number;
  nif?: string;
  avaliacao?: {
    tecnica: number;
    tatica: number;
    fisico: number;
    disciplina: number;
    assiduidade: number;
    obs?: string;
    dataAtualizacao?: string;
  };
}

export interface Jogo {
  id: string;
  titulo: string;
  data: string;
  local: string;
  adversario: string;
  categoriaId: string;
  status: "Agendado" | "Concluído" | "Cancelado";
  resultado?: string;
  convocados: string[];
  resumo?: string;
}

export interface Categoria {
  id: string;
  nome: string;
  faixaEtaria: string;
  horario: string;
  vagas: number;
  valor: number;
  misterId: string;
}

export interface Pagamento {
  id: string;
  alunoId: string;
  tipo: "inscricao" | "mensalidade" | "equipamento";
  valor: number;
  mesAno: string;
  status: "pago" | "pendente";
  data: string;
}

// Item da Galeria de Imagens do CMS
export type GaleriaItem = ItemGaleria;

export interface ItemGaleria {
  id: string;
  url: string;
  /** Caminho do ficheiro no Firebase Storage (para poder apagar sem deixar órfãos) */
  storagePath?: string;
  titulo: string;
  legenda?: string;
  categoria?: string;
  data: string;
  visibilidade: "publico" | "privado";
  createdBy?: string;
  updatedAt?: string;
}

// Item de Vídeo do CMS
export interface VideoItem {
  id: string;
  titulo: string;
  url: string;
  embedUrl?: string;
  descricao: string;
  dataPublicacao?: string;
}

// Item de Plano e Preço do CMS
export interface PlanoItem {
  id: string;
  titulo: string;
  valor: string;
  periodicidade: string; // ex: "Mensal", "Trimestral", "Anual"
  descricao: string;
  vantagens?: string[];
  destaque?: boolean;
}

// Item de FAQ (Perguntas Frequentes) do CMS
export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  ativo: boolean;
  categoria?: string;
}

// Anúncios / Avisos da Secretaria aos Pais (com visualização única para poupar espaço no Firebase)
export interface Anuncio {
  id: string;
  titulo: string;
  mensagem: string;
  data: string;
  criadoPor: string; // ex: "Secretaria" ou "Admin"
  lidosPor?: string[]; // IDs dos encarregados que já leram (quando todos leem, removemos do Firebase)
}

// Configuração geral da Academia no CMS
export interface ConfigEscola {
  nome: string;
  lema: string;
  hero: string;
  heroImageURL: string;
  logoURL: string;
  tituloQuemSomos?: string;
  quemSomos: string;
  termos: string;
  nif: string;
  whatsapp: string; // WhatsApp para contatos e pré-matrículas (+244 956 438 286)
  telefone?: string; // Telefone para ligações normais (+244 945 387 697)
  email: string;
  senhaSecretaria: string; // Senha simples para acesso ao Painel da Secretaria / CMS
  corDourado: string;
  valorBasico?: number;
  valorCompleto?: number;
  valorInscricao?: number;
  valorMensalidade?: number;
  valorMensalidadeIrmaos?: number;
  valorEquipamento?: number;
  diaVencimento?: number;
  valorMulta?: number;
  redesSociais?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export interface Auditoria {
  id: string;
  quando: string;
  usuarioId: string;
  usuarioNome: string;
  perfil: Perfil;
  acao: "criar" | "editar" | "apagar" | "acao";
  entidade: string;
  detalhe: string;
}

export interface DB {
  config: ConfigEscola;
  usuarios: Usuario[];
  categorias: Categoria[];
  alunos: Aluno[];
  pagamentos: Pagamento[];
  galeria: ItemGaleria[];
  videos: VideoItem[];
  planos: PlanoItem[];
  faq: FaqItem[];
  auditoria: Auditoria[];
  jogos: Jogo[];
  anuncios: Anuncio[];
}

export function criptografarSenha(senha?: string): string {
  if (!senha) return "";
  const str = senha.trim();
  if (str.startsWith("$filda$")) return str;
  const salt = "FILDA_SEC_2026_KEY_#945#_";
  const combinado = salt + str;
  const base64 =
    typeof btoa === "function" ? btoa(unescape(encodeURIComponent(combinado))) : combinado;
  return "$filda$" + base64.split("").reverse().join("");
}

// --- 2) DADOS INICIAIS (SEED) ------------------------------------------------

const SEED: DB = {
  config: {
    nome: "FILDA II - Escola de Futebol",
    lema: "Onde Campeões Nascem e Crescem",
    hero: "CRESCER DISCIPLINADO E COM SAÚDE.",
    heroImageURL: "",
    logoURL: "/logo-filda.svg",
    tituloQuemSomos: "CRESCER DISCIPLINADO E COM SAÚDE.",
    quemSomos:
      "A FILDA II - Escola de Futebol é um projeto esportivo de excelência idealizado e liderado por André Eduardo, dedicado à formação integral de jovens atletas. Combinamos treinamento técnico de alto rendimento, disciplina tática e acompanhamento educacional para formar craques nos gramados e campeões na vida.",
    termos:
      "Ao realizar a pré-matrícula, o encarregado de educação e o atleta concordam em cumprir os regulamentos internos da academia, prezar pela assiduidade e espírito esportivo.",
    nif: "003716616LA038",
    whatsapp: "+244 956 438 286",
    telefone: "+244 945 387 697",
    email: "secretaria@fildafutebol.com",
    senhaSecretaria: criptografarSenha("admin123"),
    corDourado: "#facc15",
    valorBasico: 2500,
    valorCompleto: 2000,
    valorInscricao: 5000,
    valorMensalidade: 2500,
    valorMensalidadeIrmaos: 2000,
    valorEquipamento: 6800,
    diaVencimento: 5,
    valorMulta: 500,
    redesSociais: {
      facebook: "https://facebook.com/filda2escoladefutebol",
      instagram: "https://instagram.com/filda2escoladefutebol",
      youtube: "https://youtube.com/@filda2escoladefutebol",
      tiktok: "https://tiktok.com/@filda2escoladefutebol",
    },
  },

  usuarios: [
    {
      id: "u1",
      nome: "José Jacinto",
      user: "admin",
      senha: criptografarSenha("admin123"),
      perfil: "admin",
      telefone: "+244 956 438 286",
      status: "ativo",
    },
    {
      id: "u2_sec",
      nome: "Secretaria FILDA II",
      user: "secretaria",
      senha: criptografarSenha("123456"),
      perfil: "secretaria",
      telefone: "+244 956 438 286",
      status: "ativo",
    },
  ],

  categorias: [
    {
      id: "c1",
      nome: "Sub-11",
      faixaEtaria: "9-11 anos",
      horario: "Seg/Qua 15h00",
      vagas: 25,
      valor: 2500,
      misterId: "",
    },
    {
      id: "c2",
      nome: "Sub-13",
      faixaEtaria: "12-13 anos",
      horario: "Ter/Qui 15h00",
      vagas: 25,
      valor: 2500,
      misterId: "",
    },
    {
      id: "c3",
      nome: "Sub-15",
      faixaEtaria: "14-15 anos",
      horario: "Seg/Qua 16h30",
      vagas: 25,
      valor: 2500,
      misterId: "",
    },
    {
      id: "c4",
      nome: "Sub-17",
      faixaEtaria: "16-17 anos",
      horario: "Ter/Qui 16h30",
      vagas: 30,
      valor: 2500,
      misterId: "",
    },
    {
      id: "c5",
      nome: "Sub-20 / Adulto",
      faixaEtaria: "18+ anos",
      horario: "Sex/Sáb 08h00",
      vagas: 30,
      valor: 2500,
      misterId: "",
    },
  ],

  planos: [
    {
      id: "pl1",
      titulo: "Mensalidade (1 Criança)",
      valor: "2.500 Kz",
      periodicidade: "Mensal",
      descricao: "Mensalidade regular para 1 atleta na academia, com treinos presenciais.",
      vantagens: [
        "Treinos técnicos e táticos presenciais",
        "Participação nos jogos e torneios internos",
        "Acompanhamento de assiduidade e desenvolvimento",
        "Prazo: até o dia 5 do mês (multa de 500 Kz após o dia 5)",
      ],
      destaque: false,
    },
    {
      id: "pl2",
      titulo: "Mensalidade Família (2+ Irmãos)",
      valor: "2.000 Kz",
      periodicidade: "Mensal (por criança)",
      descricao: "Condição especial promocional para famílias com 2 ou mais irmãos matriculados.",
      vantagens: [
        "Desconto na mensalidade (2.000 Kz cada criança)",
        "Treinos completos nas respetivas categorias",
        "Acompanhamento pedagógico e disciplinar",
        "Prazo: até o dia 5 do mês (multa de 500 Kz após o dia 5)",
      ],
      destaque: true,
    },
    {
      id: "pl3",
      titulo: "Equipamento Oficial FILDA II",
      valor: "6.800 Kz",
      periodicidade: "Pagamento Único",
      descricao: "Kit de treino e jogo oficial da escola de futebol.",
      vantagens: [
        "Camisa oficial personalizada FILDA II",
        "Calção oficial de jogo e treino",
        "Meias desportivas de alta performance",
        "Uso obrigatório nos treinos e partidas oficiais",
      ],
      destaque: false,
    },
    {
      id: "pl4",
      titulo: "Taxa de Inscrição / Matrícula",
      valor: "5.000 Kz",
      periodicidade: "Pagamento Único",
      descricao: "Taxa única de ingresso para cadastro e avaliação de novos atletas.",
      vantagens: [
        "Cadastro oficial no sistema e secretaria",
        "Emissão da ficha desportiva individual",
        "Alocação na turma e categoria adequada à idade",
        "Avaliação inicial técnica, física e médica",
      ],
      destaque: false,
    },
  ],

  videos: [
    {
      id: "v1",
      titulo: "FILDA II - Escola de Futebol — Melhores Momentos e Metodologia de Treino",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
      descricao:
        "Confira como trabalhamos os fundamentos técnicos, visão de jogo e disciplina em campo com nossos atletas da categoria de base.",
    },
    {
      id: "v2",
      titulo: "Vitória na Final do Campeonato — Sub-15 em Ação",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0",
      descricao:
        "Assista aos gols e jogadas marcantes da nossa equipe sub-15 durante a conquista do torneio regional.",
    },
  ],

  alunos: [
    {
      id: "a1",
      nome: "Mateus Eduardo Silva",
      dataNasc: "2012-05-14",
      sub: "Sub-13",
      estadoFisico: "Excelente",
      estadoMedico: "Apto",
      lesoes: "Nenhuma lesão registada.",
      problemasRespiratorios: "Não",
      nomeEncarregado: "Manuel Silva",
      telefoneEncarregado: "+244 923 111 222",
      statusPagamento: "PAGO",
      dataExpiracao: "2026-08-30",
      dataCadastro: "2026-07-01",
      categoriaId: "c2",
      fotoURL: "",
      pontos: 150,
      faltas: 0,
      avaliacao: {
        tecnica: 9,
        tatica: 8,
        fisico: 9,
        disciplina: 10,
        assiduidade: 10,
        obs: "Capitão em campo. Excelente leitura de jogo, passe preciso e espírito de liderança.",
        dataAtualizacao: "2026-07-25",
      },
    },
    {
      id: "a2",
      nome: "Lucas dos Santos",
      dataNasc: "2010-11-20",
      sub: "Sub-15",
      estadoFisico: "Bom",
      estadoMedico: "Apto",
      lesoes: "Recuperado de leve entorse no tornozelo direito em maio.",
      problemasRespiratorios: "Não",
      nomeEncarregado: "Ana dos Santos",
      telefoneEncarregado: "+244 931 333 444",
      statusPagamento: "NÃO PAGO",
      dataExpiracao: "2026-07-10",
      dataCadastro: "2026-06-15",
      categoriaId: "c3",
      fotoURL: "",
      pontos: 135,
      faltas: 1,
      avaliacao: {
        tecnica: 8,
        tatica: 7,
        fisico: 9,
        disciplina: 8,
        assiduidade: 9,
        obs: "Extremo explosivo com grande drible em velocidade. Trabalhando retorno defensivo.",
        dataAtualizacao: "2026-07-24",
      },
    },
    {
      id: "a3",
      nome: "Gabriel Mendes Oliveira",
      dataNasc: "2008-03-05",
      sub: "Sub-17",
      estadoFisico: "Excelente",
      estadoMedico: "Apto com Restrições",
      lesoes: "Evitar sobrecarga nos joelhos em treinos contínuos de salto.",
      problemasRespiratorios: "Sim",
      nomeEncarregado: "Carlos Mendes",
      telefoneEncarregado: "+244 912 555 666",
      statusPagamento: "PAGO",
      dataExpiracao: "2026-09-15",
      dataCadastro: "2026-07-10",
      categoriaId: "c4",
      fotoURL: "",
      pontos: 125,
      faltas: 0,
      avaliacao: {
        tecnica: 9,
        tatica: 9,
        fisico: 8,
        disciplina: 9,
        assiduidade: 10,
        obs: "Zagueiro seguro com ótimo posicionamento e qualidade na saída de bola.",
        dataAtualizacao: "2026-07-25",
      },
    },
    {
      id: "a4",
      nome: "Davi Miguel Oliveira",
      dataNasc: "2015-08-12",
      sub: "Sub-11",
      estadoFisico: "Regular",
      estadoMedico: "Apto",
      lesoes: "Nenhuma lesão observada.",
      problemasRespiratorios: "Não",
      nomeEncarregado: "Mariana Oliveira",
      telefoneEncarregado: "+244 944 777 888",
      statusPagamento: "NÃO PAGO",
      dataExpiracao: "2026-06-28",
      dataCadastro: "2026-05-20",
      categoriaId: "c1",
      fotoURL: "",
      pontos: 110,
      faltas: 0,
      avaliacao: {
        tecnica: 7,
        tatica: 7,
        fisico: 8,
        disciplina: 9,
        assiduidade: 8,
        obs: "Grande potencial em desenvolvimento na iniciação esportiva.",
        dataAtualizacao: "2026-07-23",
      },
    },
    {
      id: "a5",
      nome: "Pedro Kiala Neto",
      dataNasc: "2010-04-18",
      sub: "Sub-15",
      estadoFisico: "Excelente",
      estadoMedico: "Apto",
      lesoes: "Nenhuma.",
      problemasRespiratorios: "Não",
      nomeEncarregado: "António Kiala",
      telefoneEncarregado: "+244 922 444 555",
      statusPagamento: "PAGO",
      dataExpiracao: "2026-08-20",
      dataCadastro: "2026-06-01",
      categoriaId: "c3",
      fotoURL: "",
      pontos: 110,
      faltas: 2,
      avaliacao: { tecnica: 8, tatica: 8, fisico: 8, disciplina: 8, assiduidade: 9 },
    },
    {
      id: "a6",
      nome: "Tiago Manuel Costa",
      dataNasc: "2012-09-10",
      sub: "Sub-13",
      estadoFisico: "Bom",
      estadoMedico: "Apto",
      lesoes: "Nenhuma.",
      problemasRespiratorios: "Não",
      nomeEncarregado: "Fernanda Costa",
      telefoneEncarregado: "+244 933 666 777",
      statusPagamento: "PAGO",
      dataExpiracao: "2026-09-01",
      dataCadastro: "2026-06-10",
      categoriaId: "c2",
      fotoURL: "",
      pontos: 95,
      faltas: 0,
      avaliacao: { tecnica: 8, tatica: 7, fisico: 8, disciplina: 10, assiduidade: 10 },
    },
    {
      id: "a7",
      nome: "Simão Paulo Baptista",
      dataNasc: "2008-11-22",
      sub: "Sub-17",
      estadoFisico: "Excelente",
      estadoMedico: "Apto",
      lesoes: "Nenhuma.",
      problemasRespiratorios: "Não",
      nomeEncarregado: "Joaquim Baptista",
      telefoneEncarregado: "+244 911 888 999",
      statusPagamento: "PAGO",
      dataExpiracao: "2026-08-15",
      dataCadastro: "2026-05-15",
      categoriaId: "c4",
      fotoURL: "",
      pontos: 90,
      faltas: 1,
      avaliacao: { tecnica: 8, tatica: 9, fisico: 9, disciplina: 9, assiduidade: 9 },
    },
    {
      id: "a8",
      nome: "Nelson Eduardo Sousa",
      dataNasc: "2015-02-14",
      sub: "Sub-11",
      estadoFisico: "Bom",
      estadoMedico: "Apto",
      lesoes: "Nenhuma.",
      problemasRespiratorios: "Não",
      nomeEncarregado: "Patrícia Sousa",
      telefoneEncarregado: "+244 923 000 111",
      statusPagamento: "PAGO",
      dataExpiracao: "2026-08-25",
      dataCadastro: "2026-06-20",
      categoriaId: "c1",
      fotoURL: "",
      pontos: 85,
      faltas: 0,
      avaliacao: { tecnica: 7, tatica: 6, fisico: 8, disciplina: 10, assiduidade: 10 },
    },
    {
      id: "a9",
      nome: "Emanuel Jorge Ribeiro",
      dataNasc: "2010-07-30",
      sub: "Sub-15",
      estadoFisico: "Regular",
      estadoMedico: "Apto",
      lesoes: "Nenhuma.",
      problemasRespiratorios: "Não",
      nomeEncarregado: "Jorge Ribeiro",
      telefoneEncarregado: "+244 934 222 333",
      statusPagamento: "NÃO PAGO",
      dataExpiracao: "2026-07-01",
      dataCadastro: "2026-06-05",
      categoriaId: "c3",
      fotoURL: "",
      pontos: 80,
      faltas: 2,
      avaliacao: { tecnica: 7, tatica: 7, fisico: 7, disciplina: 8, assiduidade: 8 },
    },
    {
      id: "a10",
      nome: "Bernardo Costa e Silva",
      dataNasc: "2012-01-05",
      sub: "Sub-13",
      estadoFisico: "Excelente",
      estadoMedico: "Apto",
      lesoes: "Nenhuma.",
      problemasRespiratorios: "Não",
      nomeEncarregado: "Carla Costa",
      telefoneEncarregado: "+244 912 333 444",
      statusPagamento: "PAGO",
      dataExpiracao: "2026-09-10",
      dataCadastro: "2026-06-25",
      categoriaId: "c2",
      fotoURL: "",
      pontos: 75,
      faltas: 0,
      avaliacao: { tecnica: 8, tatica: 8, fisico: 8, disciplina: 9, assiduidade: 10 },
    },
    {
      id: "a11",
      nome: "Cristiano Tavares Lima",
      dataNasc: "2008-06-19",
      sub: "Sub-17",
      estadoFisico: "Bom",
      estadoMedico: "Apto",
      lesoes: "Nenhuma.",
      problemasRespiratorios: "Não",
      nomeEncarregado: "Marcos Lima",
      telefoneEncarregado: "+244 921 555 777",
      statusPagamento: "PAGO",
      dataExpiracao: "2026-08-18",
      dataCadastro: "2026-05-10",
      categoriaId: "c4",
      fotoURL: "",
      pontos: 70,
      faltas: 3,
      avaliacao: { tecnica: 8, tatica: 8, fisico: 8, disciplina: 7, assiduidade: 8 },
    },
    {
      id: "a12",
      nome: "Kelvin Eduardo Garcia",
      dataNasc: "2015-10-08",
      sub: "Sub-11",
      estadoFisico: "Excelente",
      estadoMedico: "Apto",
      lesoes: "Nenhuma.",
      problemasRespiratorios: "Não",
      nomeEncarregado: "Sofia Garcia",
      telefoneEncarregado: "+244 943 888 999",
      statusPagamento: "PAGO",
      dataExpiracao: "2026-09-05",
      dataCadastro: "2026-07-02",
      categoriaId: "c1",
      fotoURL: "",
      pontos: 65,
      faltas: 1,
      avaliacao: { tecnica: 7, tatica: 7, fisico: 8, disciplina: 9, assiduidade: 9 },
    },
  ],

  pagamentos: [],

  jogos: [
    {
      id: "j1",
      titulo: "Derby da Juventude — Sub-15 vs Petro de Luanda",
      data: "2026-08-15 15:30",
      local: "Campo Principal FILDA II - Luanda",
      adversario: "Petro de Luanda Sub-15",
      categoriaId: "c3",
      status: "Agendado",
      convocados: ["a2"],
      resumo: "Amistoso de alto nível para preparação do Campeonato Provincial.",
    },
    {
      id: "j2",
      titulo: "Torneio de Formação — Sub-13 vs Interclube",
      data: "2026-08-22 09:00",
      local: "Estádio 22 de Junho - Luanda",
      adversario: "Interclube Sub-13",
      categoriaId: "c2",
      status: "Agendado",
      convocados: ["a1"],
      resumo: "Primeira fase do Torneio das Escolas de Futebol de Luanda.",
    },
    {
      id: "j3",
      titulo: "Copa Futuro — Sub-17 vs 1º de Agosto",
      data: "2026-07-18 16:00",
      local: "Campo Principal FILDA II - Luanda",
      adversario: "1º de Agosto Sub-17",
      categoriaId: "c4",
      status: "Concluído",
      resultado: "2 - 1",
      convocados: ["a3"],
      resumo: "Grande vitória de virada da nossa equipe com excelente disciplina tática!",
    },
  ],

  galeria: [
    {
      id: "g1",
      url: fildaEquipa.url,
      titulo: "Família FILDA II",
      legenda: "Toda a equipa reunida no campo: atletas, treinadores e comissão técnica.",
      categoria: "Treinos",
      data: "2026-07-15",
      visibilidade: "publico",
    },
    {
      id: "g2",
      url: fildaAtletaForca.url,
      titulo: "Garra e Atitude",
      legenda: "Determinação dos nossos atletas antes de entrar em campo.",
      categoria: "Jogos",
      data: "2026-07-18",
      visibilidade: "publico",
    },
    {
      id: "g3",
      url: fildaAtletaAgua.url,
      titulo: "Hidratação e Saúde",
      legenda: "Crescer disciplinado e com saúde começa nos cuidados básicos do dia a dia.",
      categoria: "Treinos",
      data: "2026-07-20",
      visibilidade: "publico",
    },
    {
      id: "g4",
      url: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=600&q=80",
      titulo: "Celebração e Conquista Sub-15",
      legenda:
        "O orgulho de formar campeões dentro e fora de campo na FILDA II - Escola de Futebol.",
      categoria: "Conquistas",
      data: "2026-07-22",
      visibilidade: "publico",
    },
  ],

  faq: [
    {
      id: "f1",
      pergunta: "Qual é a idade mínima para ingressar na FILDA II - Escola de Futebol?",
      resposta:
        "Aceitamos jovens atletas a partir dos 6 anos completos (categorias de iniciação Sub-8 e Sub-11) até a categoria Sub-20 e Adulto.",
      ativo: true,
    },
    {
      id: "f2",
      pergunta: "Como funciona o processo de Pré-Matrícula e confirmação?",
      resposta:
        "Basta preencher o formulário online de Pré-Matrícula aqui no site. Ao enviar, você será direcionado automaticamente ao nosso WhatsApp com os dados preenchidos para falar com a secretaria e agendar a primeira aula experimental ou finalizar a matrícula na academia.",
      ativo: true,
    },
    {
      id: "f3",
      pergunta: "Quais são os valores de inscrição, mensalidade e equipamento?",
      resposta:
        "As inscrições têm um custo único de 5.000 Kz e o kit de equipamento oficial custa 6.800 Kz. A mensalidade regular da escola é de 2.500 Kz por atleta.",
      ativo: true,
    },
    {
      id: "f4",
      pergunta: "Como funciona o desconto para irmãos (duas ou mais crianças)?",
      resposta:
        "Para famílias que matriculem duas ou mais crianças, temos uma condição promocional onde cada criança paga apenas 2.000 Kz de mensalidade (um desconto de 500 Kz por irmão).",
      ativo: true,
    },
    {
      id: "f5",
      pergunta: "Até que dia deve ser efetuado o pagamento e qual é a penalização por atraso?",
      resposta:
        "O prazo limite para o pagamento da mensalidade é até o dia 5 de cada mês. Caso o pagamento não seja efetuado até o dia 5, incidirá uma multa por atraso no valor de 500 Kz, que será acrescida ao valor da mensalidade.",
      ativo: true,
    },
    {
      id: "f6",
      pergunta: "Quais são as formas de pagamento aceites pela secretaria?",
      resposta:
        "Aceitamos pagamentos por Transferência Bancária, Multicaixa Express, TPA ou pagamento em numerário diretamente no escritório/secretaria da academia.",
      ativo: true,
    },
    {
      id: "f7",
      pergunta: "É necessário atestado médico para começar a treinar?",
      resposta:
        "Sim, para garantir a segurança e o rendimento do atleta, solicitamos a apresentação de um atestado médico de aptidão física ou declaração assinada pelo encarregado de educação nas primeiras semanas de treino.",
      ativo: true,
    },
  ],

  anuncios: [
    {
      id: "anunc-1",
      titulo: "Bem-vindo à Temporada 2026!",
      mensagem:
        "A secretaria informa que os cartões oficiais e calendários de jogos já estão disponíveis no seu painel. Contamos com a pontualidade e disciplina de todos!",
      data: new Date().toISOString().slice(0, 10),
      criadoPor: "Secretaria FILDA II",
      lidosPor: [],
    },
  ],

  auditoria: [],
};

// --- 3) LEITURA / GRAVAÇÃO NO LOCALSTORAGE -----------------------------------

const CHAVE = "jj_futebol_academy_db_v2";
const CHAVE_SESSAO = "jj_futebol_academy_sess";

function normalizarDB(parsed: DB): { db: DB; alterado: boolean } {
  let alterado = false;
  if (Array.isArray(parsed.alunos)) {
    parsed.alunos.forEach((a) => {
      if (a.fotoURL && a.fotoURL.includes("pravatar.cc")) {
        a.fotoURL = "";
        alterado = true;
      }
    });
  }

  if (!Array.isArray(parsed.usuarios) || parsed.usuarios.length === 0) {
    parsed.usuarios = SEED.usuarios || [];
    alterado = true;
  } else {
    // Garantir que o administrador principal exista no array de utilizadores
    const temAdmin = parsed.usuarios.some(
      (u) => u && (u.perfil === "admin" || u.user === "admin" || u.id === "u1"),
    );
    if (!temAdmin && SEED.usuarios && SEED.usuarios[0]) {
      parsed.usuarios.unshift(SEED.usuarios[0]);
      alterado = true;
    }
  }

  if (!Array.isArray(parsed.auditoria)) {
    parsed.auditoria = [];
    alterado = true;
  }
  if (!Array.isArray(parsed.videos)) {
    parsed.videos = SEED.videos || [];
    alterado = true;
  }
  if (!Array.isArray(parsed.planos)) {
    parsed.planos = SEED.planos || [];
    alterado = true;
  }
  if (!Array.isArray(parsed.galeria)) {
    parsed.galeria = SEED.galeria || [];
    alterado = true;
  }
  if (!Array.isArray(parsed.faq)) {
    parsed.faq = SEED.faq || [];
    alterado = true;
  }
  if (!parsed.config) {
    parsed.config = SEED.config;
    alterado = true;
  }
  if (!parsed.config.senhaSecretaria) {
    parsed.config.senhaSecretaria = criptografarSenha("admin123");
    alterado = true;
  }
  if (!parsed.config.nome || parsed.config.nome === "JJ Futebol Academy") {
    parsed.config.nome = "FILDA II - Escola de Futebol";
    alterado = true;
  }
  if (!parsed.config.hero || parsed.config.hero.includes("FORMAÇÃO DE ATLETAS")) {
    parsed.config.hero = "CRESCER DISCIPLINADO E COM SAÚDE.";
    alterado = true;
  }
  if (!parsed.config.lema || parsed.config.lema === "CRESCER DISCIPLINADO E COM SAÚDE.") {
    parsed.config.lema = "Onde Campeões Nascem e Crescem";
    alterado = true;
  }
  if (!parsed.config.tituloQuemSomos || parsed.config.tituloQuemSomos.includes("Excelência")) {
    parsed.config.tituloQuemSomos = "CRESCER DISCIPLINADO E COM SAÚDE.";
    alterado = true;
  }
  if (parsed.config.quemSomos && parsed.config.quemSomos.includes("JJ Futebol Academy")) {
    parsed.config.quemSomos = parsed.config.quemSomos.replace(
      /JJ Futebol Academy/g,
      "FILDA II - Escola de Futebol",
    );
    alterado = true;
  }
  if (parsed.config.quemSomos && parsed.config.quemSomos.includes("José Jacinto")) {
    parsed.config.quemSomos = parsed.config.quemSomos.replace(/José Jacinto/g, "André Eduardo");
    alterado = true;
  }
  if (
    parsed.config.quemSomos &&
    !parsed.config.quemSomos.includes("liderado por André Eduardo") &&
    parsed.config.quemSomos.startsWith(
      "A FILDA II - Escola de Futebol é um projeto esportivo de excelência",
    )
  ) {
    parsed.config.quemSomos =
      "A FILDA II - Escola de Futebol é um projeto esportivo de excelência idealizado e liderado por André Eduardo, dedicado à formação integral de jovens atletas. Combinamos treinamento técnico de alto rendimento, disciplina tática e acompanhamento educacional para formar craques nos gramados e campeões na vida.";
    alterado = true;
  }
  if (!parsed.config.redesSociais) {
    parsed.config.redesSociais = {
      facebook: "https://facebook.com/filda2escoladefutebol",
      instagram: "https://instagram.com/filda2escoladefutebol",
      youtube: "https://youtube.com/@filda2escoladefutebol",
      tiktok: "https://tiktok.com/@filda2escoladefutebol",
    };
    alterado = true;
  }

  if (
    !parsed.config.whatsapp ||
    parsed.config.whatsapp.includes("923 000 000") ||
    parsed.config.whatsapp.includes("923000000") ||
    parsed.config.whatsapp.includes("945 387 686") ||
    parsed.config.whatsapp.includes("945387686")
  ) {
    parsed.config.whatsapp = "+244 956 438 286";
    alterado = true;
  }

  if (
    !parsed.config.telefone ||
    parsed.config.telefone.includes("945 387 686") ||
    parsed.config.telefone.includes("945387686")
  ) {
    parsed.config.telefone = "+244 945 387 697";
    alterado = true;
  }

  if (
    !parsed.config.logoURL ||
    parsed.config.logoURL === "" ||
    parsed.config.logoURL.includes("jjacademy")
  ) {
    parsed.config.logoURL = "/logo-filda.svg";
    alterado = true;
  }
  if (!parsed.config.nif || parsed.config.nif === "5400112233") {
    parsed.config.nif = "003716616LA038";
    alterado = true;
  }
  if (!parsed.config.email || parsed.config.email.includes("jjacademy")) {
    parsed.config.email = "secretaria@fildafutebol.com";
    alterado = true;
  }
  if (!Array.isArray(parsed.anuncios)) {
    parsed.anuncios = SEED.anuncios || [];
    alterado = true;
  } else if (Array.isArray(parsed.usuarios)) {
    const origLen = parsed.anuncios.length;
    const totalPais =
      parsed.usuarios.filter((u) => u.perfil === "encarregado" || u.perfil === "aluno").length || 1;
    // Visualização única e limpeza automática para poupar espaço no Firebase:
    // Se o anúncio já foi lido por todos os encarregados alvo, apagar do banco de dados
    parsed.anuncios = parsed.anuncios.filter((an) => {
      const lidos = an.lidosPor?.length || 0;
      if (totalPais > 0 && lidos >= totalPais && totalPais > 1) return false;
      return true;
    });
    if (parsed.anuncios.length !== origLen) alterado = true;
  }

  // --- ATUALIZAÇÃO DA TABELA DE PREÇOS E MENSALIDADES ---
  if (
    parsed.config.valorInscricao === undefined ||
    parsed.config.valorBasico === 15000 ||
    parsed.config.valorBasico === 20000
  ) {
    parsed.config.valorBasico = 2500;
    parsed.config.valorCompleto = 2000;
    parsed.config.valorInscricao = 5000;
    parsed.config.valorMensalidade = 2500;
    parsed.config.valorMensalidadeIrmaos = 2000;
    parsed.config.valorEquipamento = 6800;
    parsed.config.diaVencimento = 5;
    parsed.config.valorMulta = 500;
    alterado = true;
  }

  if (
    Array.isArray(parsed.planos) &&
    parsed.planos.some(
      (p) =>
        p.valor.includes("15.000") ||
        p.valor.includes("20.000") ||
        p.valor.includes("25.000") ||
        p.titulo.includes("Plano Iniciação"),
    )
  ) {
    parsed.planos = SEED.planos;
    alterado = true;
  }

  if (Array.isArray(parsed.categorias)) {
    parsed.categorias.forEach((c) => {
      if (c.valor === 15000 || c.valor === 20000 || c.valor === 25000) {
        c.valor = 2500;
        alterado = true;
      }
    });
  }

  // --- LÓGICA DE EXPIRAÇÃO AUTOMÁTICA DA MENSALIDADE ---
  const hoje = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const diaMes = new Date().getDate();
  if (Array.isArray(parsed.alunos)) {
    parsed.alunos.forEach((aluno) => {
      const expirouPorData = aluno.dataExpiracao && hoje > aluno.dataExpiracao;
      let expirouPorDia5 = false;
      if (diaMes > 5 && aluno.dataExpiracao) {
        const mesAtual = hoje.slice(0, 7);
        const mesExp = aluno.dataExpiracao.slice(0, 7);
        if (mesExp < mesAtual) {
          expirouPorDia5 = true;
        }
      }

      if (expirouPorData || expirouPorDia5) {
        if (aluno.statusPagamento !== "NÃO PAGO" || aluno.status !== "inadimplente") {
          aluno.statusPagamento = "NÃO PAGO";
          aluno.status = "inadimplente";
          alterado = true;
        }
      } else if (aluno.status === "inadimplente" && aluno.statusPagamento !== "NÃO PAGO") {
        aluno.statusPagamento = "NÃO PAGO";
        alterado = true;
      } else if (aluno.statusPagamento === "NÃO PAGO" && aluno.status !== "inadimplente") {
        aluno.status = "inadimplente";
        alterado = true;
      }
    });
  }

  // --- GARANTIR REGISTO DE PAGAMENTO PARA ALUNOS PAGOS NO MÊS ATUAL ---
  const mesAtualStr = hoje.slice(0, 7);
  if (!Array.isArray(parsed.pagamentos)) {
    parsed.pagamentos = [];
    alterado = true;
  }
  if (Array.isArray(parsed.alunos) && Array.isArray(parsed.pagamentos)) {
    parsed.alunos.forEach((aluno) => {
      const statusAtual =
        aluno.statusPagamento || (aluno.status === "inadimplente" ? "NÃO PAGO" : "PAGO");
      if (statusAtual === "PAGO" || aluno.status === "ativo") {
        const jaTem = parsed.pagamentos.some(
          (p) => p.alunoId === aluno.id && p.mesAno === mesAtualStr && p.status === "pago",
        );
        if (!jaTem) {
          parsed.pagamentos.push({
            id: `p_${aluno.id}_${mesAtualStr}`,
            alunoId: aluno.id,
            tipo: "mensalidade",
            valor: aluno.valorMensalidade || 2500,
            mesAno: mesAtualStr,
            status: "pago",
            data: hoje,
          });
          alterado = true;
        }
      }
    });
  }

  // --- MANTER APENAS CONTA ADMIN PROTEGIDA E USUÁRIOS DO FIREBASE ---
  if (!Array.isArray(parsed.usuarios)) {
    parsed.usuarios = SEED.usuarios;
    alterado = true;
  } else {
    parsed.usuarios = parsed.usuarios.filter(Boolean);
    // Garantir que a conta Admin Root esteja sempre presente e protegida
    if (
      !parsed.usuarios.some(
        (u) => u && (u.user === "admin" || u.perfil === "admin" || u.id === "u1"),
      )
    ) {
      parsed.usuarios.push({
        id: "u1",
        nome: "José Jacinto",
        user: "admin",
        senha: criptografarSenha(parsed.config?.senhaSecretaria || "admin123"),
        perfil: "admin",
        telefone: "+244 956 438 286",
      });
      alterado = true;
    } else {
      const adm = parsed.usuarios.find(
        (u) => u && (u.user === "admin" || u.perfil === "admin" || u.id === "u1"),
      );
      if (
        adm &&
        (adm.nome === "André Eduardo" ||
          adm.nome === "Admin" ||
          adm.telefone?.includes("923 000 000"))
      ) {
        adm.nome = "José Jacinto";
        adm.telefone = "+244 956 438 286";
        alterado = true;
      }
    }

    // Garantir que exista uma conta de Secretaria padrão no sistema
    if (!parsed.usuarios.some((u) => u && (u.perfil === "secretaria" || u.user === "secretaria"))) {
      parsed.usuarios.push({
        id: "u2_sec",
        nome: "Secretaria FILDA II",
        user: "secretaria",
        senha: criptografarSenha("123456"),
        perfil: "secretaria",
        telefone: "+244 956 438 286",
      });
      alterado = true;
    }

    // Criptografar todas as senhas dos utilizadores
    parsed.usuarios.forEach((u) => {
      if (u && u.senha && !u.senha.startsWith("$filda$")) {
        u.senha = criptografarSenha(u.senha);
        alterado = true;
      }
    });
    if (
      parsed.config &&
      parsed.config.senhaSecretaria &&
      !parsed.config.senhaSecretaria.startsWith("$filda$")
    ) {
      parsed.config.senhaSecretaria = criptografarSenha(parsed.config.senhaSecretaria);
      alterado = true;
    }
  }

  if (!Array.isArray(parsed.jogos)) {
    parsed.jogos = SEED.jogos || [];
    alterado = true;
  }

  if (Array.isArray(parsed.alunos)) {
    parsed.alunos.forEach((a) => {
      if (!a.avaliacao) {
        a.avaliacao = {
          tecnica: 8,
          tatica: 8,
          fisico: 8,
          disciplina: 9,
          assiduidade: 9,
          obs: "Atleta em bom ritmo de progressão técnica e tática.",
          dataAtualizacao: new Date().toISOString().slice(0, 10),
        };
        alterado = true;
      }
      if (
        !a.valorMensalidade ||
        a.valorMensalidade === 15000 ||
        a.valorMensalidade === 20000 ||
        a.valorMensalidade === 25000
      ) {
        a.valorMensalidade = 2500;
        alterado = true;
      }
    });
  }

  return { db: parsed, alterado };
}

function carregarDB(): DB {
  if (typeof window === "undefined") return SEED;
  try {
    const cru = localStorage.getItem(CHAVE);
    const parsed = cru ? (JSON.parse(cru) as DB) : SEED;
    const { db, alterado } = normalizarDB(parsed);
    if (alterado) {
      localStorage.setItem(CHAVE, JSON.stringify(db));
    }
    return db;
  } catch {
    return SEED;
  }
}

/** Último estado enviado/recebido da nuvem, usado para gravar só o que muda. */
let ultimoPersistido: DB | null = null;

function gravarDB(db: DB) {
  if (typeof window === "undefined") return;
  const dbLimpo = JSON.parse(JSON.stringify(db)) as DB;
  localStorage.setItem(CHAVE, JSON.stringify(dbLimpo));
  try {
    const anterior = ultimoPersistido;
    ultimoPersistido = dbLimpo;
    void gravarDiferencas(anterior, dbLimpo);
  } catch (err) {
    console.error("Erro ao iniciar gravação no Firestore:", err);
  }
}

// --- 4) HOOK REACT (useStore & StoreProvider) --------------------------------

function useStoreInternal() {
  const [db, setDb] = useState<DB>(SEED);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    // Carrega DB executando a validação de expiração automática
    const dadosCarregados = carregarDB();
    setDb(dadosCarregados);

    // Recupera sessão do usuário ou secretaria
    const sess = localStorage.getItem(CHAVE_SESSAO);
    if (sess) {
      try {
        const uSess = JSON.parse(sess) as Usuario;
        // Verifica se o utilizador da sessão ainda existe ou se é o admin root
        if (dadosCarregados.usuarios.some((u) => u.id === uSess.id || u.user === uSess.user)) {
          setUsuario(uSess);
        } else {
          localStorage.removeItem(CHAVE_SESSAO);
        }
      } catch {
        localStorage.removeItem(CHAVE_SESSAO);
      }
    }

    // Garante sessão Firebase (necessária para as regras de segurança)
    garantirSessaoFirebase();

    // Sincroniza em tempo real com o Firestore (coleções separadas por entidade)
    try {
      void migrarParaColecoes(dadosCarregados);

      const unsubscribe = subscreverColecoes(
        dadosCarregados,
        (dadosNuvem) => {
          if (!dadosNuvem.config) dadosNuvem.config = dadosCarregados.config;
          const { db: dbNorm } = normalizarDB(dadosNuvem);
          ultimoPersistido = JSON.parse(JSON.stringify(dbNorm)) as DB;
          localStorage.setItem(CHAVE, JSON.stringify(dbNorm));
          setDb(dbNorm);

          // Atualiza sessão em tempo real se os dados do utilizador atual mudaram na nuvem
          const sessStr = localStorage.getItem(CHAVE_SESSAO);
          if (sessStr) {
            try {
              const uSess = JSON.parse(sessStr) as Usuario;
              const uNuvem = dbNorm.usuarios.find((u) => u.id === uSess.id);
              if (
                uNuvem &&
                (uNuvem.nome !== uSess.nome ||
                  uNuvem.user !== uSess.user ||
                  uNuvem.senha !== uSess.senha ||
                  uNuvem.perfil !== uSess.perfil ||
                  uNuvem.status !== uSess.status)
              ) {
                localStorage.setItem(CHAVE_SESSAO, JSON.stringify(uNuvem));
                setUsuario(uNuvem);
              }
            } catch (err) {
              console.warn("Falha ao atualizar sessão em tempo real:", err);
            }
          }
        },
        (err) => {
          console.warn("Sem conexão em tempo real com Firestore (operando em cache local):", err);
        },
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn("Falha na inicialização do listener do Firestore:", err);
    }
  }, []);

  const atualizar = useCallback(
    (
      mutar: (rascunho: DB) => void,
      log?: { acao: Auditoria["acao"]; entidade: string; detalhe: string },
    ) => {
      setDb((antigo) => {
        const rascunho: DB = JSON.parse(JSON.stringify(antigo));
        mutar(rascunho);

        // Verifica expiração mais uma vez em cada alteração se necessário
        const hoje = new Date().toISOString().slice(0, 10);
        const diaMes = new Date().getDate();
        if (Array.isArray(rascunho.alunos)) {
          rascunho.alunos.forEach((aluno) => {
            const expirouPorData = aluno.dataExpiracao && hoje > aluno.dataExpiracao;
            let expirouPorDia5 = false;
            if (diaMes > 5 && aluno.dataExpiracao) {
              const mesAtual = hoje.slice(0, 7);
              const mesExp = aluno.dataExpiracao.slice(0, 7);
              if (mesExp < mesAtual) {
                expirouPorDia5 = true;
              }
            }
            if (expirouPorData || expirouPorDia5) {
              if (aluno.statusPagamento !== "NÃO PAGO" || aluno.status !== "inadimplente") {
                aluno.statusPagamento = "NÃO PAGO";
                aluno.status = "inadimplente";
              }
            } else if (aluno.status === "inadimplente" && aluno.statusPagamento !== "NÃO PAGO") {
              aluno.statusPagamento = "NÃO PAGO";
            } else if (aluno.statusPagamento === "NÃO PAGO" && aluno.status !== "inadimplente") {
              aluno.status = "inadimplente";
            }
          });
        }

        if (log && usuario) {
          if (!Array.isArray(rascunho.auditoria)) rascunho.auditoria = [];
          rascunho.auditoria.push({
            id: novoId(),
            quando: new Date().toISOString(),
            usuarioId: usuario.id,
            usuarioNome: usuario.nome,
            perfil: usuario.perfil,
            acao: log.acao,
            entidade: log.entidade,
            detalhe: log.detalhe,
          });
          if (rascunho.auditoria.length > 500) rascunho.auditoria = rascunho.auditoria.slice(-500);
        }

        // Se o utilizador atual teve os seus dados (nome, login ou senha) alterados, atualiza a sessão local em tempo real
        if (usuario) {
          const uAtualizado = rascunho.usuarios.find(
            (u) => u.id === usuario.id || u.user === usuario.user,
          );
          if (
            uAtualizado &&
            (uAtualizado.nome !== usuario.nome ||
              uAtualizado.user !== usuario.user ||
              uAtualizado.senha !== usuario.senha ||
              uAtualizado.perfil !== usuario.perfil ||
              uAtualizado.status !== usuario.status)
          ) {
            localStorage.setItem(CHAVE_SESSAO, JSON.stringify(uAtualizado));
            setUsuario(uAtualizado);
          }
        }

        gravarDB(rascunho);
        return rascunho;
      });
    },
    [usuario],
  );

  // LOGIN seguro com autenticação verificada no banco (Firebase / Local)
  const login = useCallback(
    (nomeUserOrSenha: string, senhaOpt?: string): { ok: boolean; msg?: string; user?: Usuario } => {
      const atual = carregarDB();
      const strUser = (nomeUserOrSenha || "").trim();
      const strSenha = (senhaOpt !== undefined ? senhaOpt : nomeUserOrSenha || "").trim();
      const strSenhaCript = criptografarSenha(strSenha);

      // Procura utilizador por login/user (case insensitive) ou ID + senha correta
      const encontrado = (atual?.usuarios || []).find(
        (u) =>
          u &&
          ((u.user && u.user.toLowerCase() === strUser.toLowerCase()) ||
            (u.id && u.id.toLowerCase() === strUser.toLowerCase())) &&
          (u.senha === strSenha || u.senha === strSenhaCript),
      );

      if (!encontrado) {
        return { ok: false, msg: "Utilizador ou senha incorretos." };
      }
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(encontrado));
      setUsuario(encontrado);
      return { ok: true, user: encontrado };
    },
    [],
  );

  const logout = useCallback(() => {
    signOut(auth).catch(() => {});
    localStorage.removeItem(CHAVE_SESSAO);
    setUsuario(null);
  }, []);

  // Autenticação com Email e Senha via Firebase Auth
  const loginWithFirebase = useCallback(
    async (email: string, pass: string): Promise<{ ok: boolean; msg?: string; user?: Usuario }> => {
      try {
        let cred;
        try {
          cred = await signInWithEmailAndPassword(auth, email, pass);
        } catch (err: unknown) {
          const firebaseErr = err as { code?: string; message?: string };
          if (
            firebaseErr.code === "auth/user-not-found" ||
            firebaseErr.code === "auth/invalid-credential"
          ) {
            try {
              cred = await createUserWithEmailAndPassword(auth, email, pass);
            } catch (createErr: unknown) {
              return {
                ok: false,
                msg: traduzirErroParaPortugues(
                  createErr,
                  "Não foi possível criar a conta com este e-mail.",
                ),
              };
            }
          } else {
            return {
              ok: false,
              msg: traduzirErroParaPortugues(err, "Não foi possível realizar o início de sessão."),
            };
          }
        }

        const fbUser = cred.user;
        const atual = carregarDB();
        let eUser = atual.usuarios.find(
          (u) => u.user?.toLowerCase() === email.toLowerCase() || u.id === fbUser.uid,
        );

        if (!eUser) {
          eUser = {
            id: fbUser.uid,
            nome: fbUser.displayName || email.split("@")[0] || "Utilizador Firebase",
            user: email,
            senha: criptografarSenha(pass),
            perfil: "pai",
            fotoURL: fbUser.photoURL || "",
            status: "pendente",
          };
          atual.usuarios.push(eUser);
          gravarDB(atual);
        }

        localStorage.setItem(CHAVE_SESSAO, JSON.stringify(eUser));
        setUsuario(eUser);
        return { ok: true, user: eUser };
      } catch (err: unknown) {
        return {
          ok: false,
          msg: traduzirErroParaPortugues(err, "Erro ao iniciar sessão com e-mail."),
        };
      }
    },
    [],
  );

  // Autenticação com Google via Firebase Auth
  const loginWithGoogle = useCallback(async (): Promise<{
    ok: boolean;
    msg?: string;
    user?: Usuario;
  }> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const atual = carregarDB();
      const email = fbUser.email || `${fbUser.uid}@firebase.com`;
      let eUser = atual.usuarios.find(
        (u) => u.user?.toLowerCase() === email.toLowerCase() || u.id === fbUser.uid,
      );

      if (!eUser) {
        eUser = {
          id: fbUser.uid,
          nome: fbUser.displayName || "Utilizador Google",
          user: email,
          senha: criptografarSenha("google_auth"),
          perfil: "pai",
          fotoURL: fbUser.photoURL || "",
          status: "pendente",
        };
        atual.usuarios.push(eUser);
        gravarDB(atual);
      }

      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(eUser));
      setUsuario(eUser);
      return { ok: true, user: eUser };
    } catch (err: unknown) {
      return {
        ok: false,
        msg: traduzirErroParaPortugues(err, "Não foi possível autenticar com a conta Google."),
      };
    }
  }, []);

  return useMemo(
    () => ({ db, atualizar, usuario, login, loginWithFirebase, loginWithGoogle, logout }),
    [db, atualizar, usuario, login, loginWithFirebase, loginWithGoogle, logout],
  );
}

type StoreContextType = ReturnType<typeof useStoreInternal>;

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreInternal();
  return createElement(StoreContext.Provider, { value }, children);
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    // Retorna fallback gracioso caso seja chamado fora do provider
    return {
      db: SEED,
      atualizar: () => {},
      usuario: null,
      login: () => ({ ok: false }),
      loginWithFirebase: async () => ({ ok: false }),
      loginWithGoogle: async () => ({ ok: false }),
      logout: () => {},
    };
  }
  return context;
}

// --- 5) UTILITÁRIOS ----------------------------------------------------------

export function formatKZ(n: number | string | undefined | null): string {
  if (typeof n === "string") return n;
  const valor = typeof n === "number" ? n : 0;
  return new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatarEmbedUrl(url: string): string {
  if (!url) return "";
  const cleanUrl = url.trim();

  // YouTube watch?v=ID ou youtube.com/v/ID ou youtube.com/embed/ID
  if (cleanUrl.includes("youtube.com/watch")) {
    try {
      const parsed = new URL(cleanUrl);
      const vidId = parsed.searchParams.get("v");
      if (vidId) return `https://www.youtube.com/embed/${vidId}`;
    } catch {
      const match = cleanUrl.match(/v=([^&]+)/);
      if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // YouTube Shorts: youtube.com/shorts/ID
  if (cleanUrl.includes("youtube.com/shorts/")) {
    const parts = cleanUrl.split("youtube.com/shorts/");
    const vidId = parts[1]?.split("?")[0]?.split("/")[0];
    if (vidId) return `https://www.youtube.com/embed/${vidId}`;
  }

  // YouTube short links: youtu.be/ID
  if (cleanUrl.includes("youtu.be/")) {
    const parts = cleanUrl.split("youtu.be/");
    const vidId = parts[1]?.split("?")[0]?.split("/")[0];
    if (vidId) return `https://www.youtube.com/embed/${vidId}`;
  }

  // Vimeo: vimeo.com/ID
  if (cleanUrl.includes("vimeo.com/")) {
    const parts = cleanUrl.split("vimeo.com/");
    const vidId = parts[1]?.split("?")[0]?.split("/")[0];
    if (vidId && !isNaN(Number(vidId))) return `https://player.vimeo.com/video/${vidId}`;
  }

  return cleanUrl;
}

export function novoId(): string {
  return Math.random().toString(36).slice(2, 10);
}
