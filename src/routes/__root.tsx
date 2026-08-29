/*
 * Este produto/código é de propriedade intelectual exclusiva de José Jacinto, criador e desenvolvedor do projeto. É estritamente proibida a cópia, venda, redistribuição ou alteração sem a autorização prévia por escrito de José Jacinto.
 */

// ============================================================================
//  ROOT — Ficheiro raiz que envolve TODAS as páginas do site.
//  Aqui definimos: fontes, meta-tags SEO, tratamento de erros e o layout base.
// ============================================================================

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { useStore, StoreProvider } from "../lib/store";
import { DialogManager } from "../components/DialogManager";
import { AvisoNovaVersao } from "../components/AvisoNovaVersao";
import appCss from "../styles.css?url";

// Componente mostrado quando a rota não existe (404)
function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-gold inline-flex items-center rounded-md px-4 py-2 text-sm">
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente mostrado quando algo rebenta na página (erro inesperado)
function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Erro na página:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Esta página não carregou</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo correu mal. Podes tentar recarregar ou voltar ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-gold rounded-md px-4 py-2 text-sm"
          >
            Tentar de novo
          </button>
          <a href="/" className="rounded-md border border-border px-4 py-2 text-sm">
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

// Definição da rota raiz. Aqui vive tudo o que aparece em TODAS as páginas.
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FILDA II - Escola de Futebol | Escola de Campeões — Gestão e Pré-Matrícula" },
      {
        name: "description",
        content:
          "FILDA II - Escola de Futebol — Onde craques nascem. Pré-matrículas abertas para atletas Sub-11 a Adulto.",
      },
      { property: "og:title", content: "FILDA II - Escola de Futebol | Escola de Campeões" },
      {
        property: "og:description",
        content:
          "Formando atletas de alto rendimento e cidadãos exemplares. Faça já a sua pré-matrícula.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/logo-filda.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/logo-filda.svg" },
      // Fontes Google carregadas via <link> (não usar @import em CSS!)
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// Estrutura <html>...<body> — igual em todas as páginas
function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-[#0b1220] text-white selection:bg-[#facc15] selection:text-black font-poppins">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// Botão flutuante de suporte via WhatsApp no canto inferior direito
function BotaoSuporteWhatsApp() {
  const { db } = useStore();
  const foneRaw = db.config?.whatsapp || "+244 956 438 286";
  const foneClean = foneRaw.replace(/\D/g, "");
  const nomeAcademia = db.config?.nome || "FILDA II - Escola de Futebol";

  const msg = `Olá! Estou no portal da *${nomeAcademia}* e gostaria de obter suporte ou tirar algumas dúvidas. ⚽🏆`;
  const url = `https://api.whatsapp.com/send?phone=${foneClean}&text=${encodeURIComponent(msg)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-xl shadow-[#25D366]/40 transition-all duration-300 hover:scale-110 group border border-white/20"
      title="Suporte via WhatsApp"
      aria-label="Suporte via WhatsApp"
    >
      <svg
        className="w-7 h-7 fill-current animate-pulse"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span className="absolute right-16 px-3 py-1.5 rounded-lg bg-black/90 text-white text-xs font-bold whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
        Suporte via WhatsApp
      </span>
    </a>
  );
}

// Componente raiz: fornece o QueryClient e renderiza a rota atual dentro do <Outlet />
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <Outlet />
        <DialogManager />
        <AvisoNovaVersao />
        <BotaoSuporteWhatsApp />
      </StoreProvider>
    </QueryClientProvider>
  );
}
