# FILDA II — Transformação em ERP desportivo (Lovable Cloud)

Aplicado ao projeto existente. O design atual (cores, logótipo, fotos, cabeçalho e navegação mobile, botão de instalar app, aviso de nova versão, slogan) mantém-se e é reaproveitado.

## Fase 0 — Auditoria e limpeza
- Ativar o Lovable Cloud (base de dados, autenticação, ficheiros, tempo real).
- Remover o Firebase por completo: `firebase` do package.json, `src/lib/firebase.ts`, `firestore-colecoes.ts`, `storage.ts`, `firebase-applet-config.json`, `firestore.rules`, `storage.rules`, variáveis `VITE_FIREBASE_*`.
- Remover todas as finanças: tipos, ecrãs, estados `statusPagamento`, planos/mensalidades, recibos, Multicaixa, carteira com dívida, textos e menus.
- `src/lib/store.ts` deixa de ser a fonte de dados; o localStorage fica só para preferências de interface.

## Fase 1 — Base de dados, segurança e permissões
- Tabelas: profiles, user_roles (separada, enum admin/secretaria/mister/atleta), athletes, guardians, athlete_guardians, categories, teams, team_coaches, seasons, enrollments, training_sessions, attendance, evaluations, player_statistics, games, game_players, announcements, notifications, athlete_documents, athlete_medical (separada), audit_logs, site_content (conteúdo institucional).
- Estados de conta: PENDENTE, APROVADO, REJEITADO, SUSPENSO, INATIVO.
- Número de processo `FILDA-YYYY-000001`, único e permanente, gerado na base de dados por sequência anual.
- Funções seguras na base de dados: `has_role`, `is_coach_of_athlete`, `approve_registration`, `reject_registration` (motivo, quem, quando, notificação, registo de auditoria).
- RLS em todas as tabelas: atleta vê só os seus dados; mister só atletas aprovados das suas equipas e sem dados privados (vista reduzida; médico apenas o mínimo desportivo); secretaria sem configurações críticas; admin tudo.
- Triggers de auditoria para aprovações, mudanças de equipa/categoria, presenças, avaliações e documentos.
- Ficheiros: pasta pública (galeria/notícias) e pasta privada de documentos isolada por atleta.

## Fase 2 — Contas e acesso
- Criar Conta (email + senha + dados do atleta/encarregado) → estado PENDENTE com ecrã de espera.
- Entrar com email+senha; opção de identificar pelo número de processo (continua a pedir senha). Recuperação de senha com página `/reset-password`.
- Rotas protegidas por perfil; conta não aprovada não entra no portal.

## Fase 3 — Portais
- Atleta/encarregado: foto, nome, processo, categoria, equipa, estado, próximo treino/jogo, % de presença, avaliações, estatísticas, comunicados, documentos, carteira digital com QR (apenas identificador seguro).
- Secretaria/Admin: fila de inscrições (aprovar/rejeitar), Atletas (pesquisa e filtros, ficha com histórico), Matrículas, Categorias/Equipas/Temporadas, Documentos, Comunicados (rascunho/publicado/arquivado, por público-alvo), Calendário, Pesquisa global, Registos (admin), Contas e perfis (admin), Conteúdo do site (admin).
- Mister: as suas equipas, sessões de treino, presenças (Presente/Ausente/Atrasado/Falta justificada), avaliações 0–10 nos 6 critérios, observações, jogos (convocados, golos, assistências, cartões, resultado), estatísticas.
- Ranking e classificação calculados apenas com dados reais, filtros por categoria/equipa/temporada.
- Notificações internas em tempo real.

## Fase 4 — Site público
Início, Sobre, Categorias, Equipas, Treinadores, Notícias, Galeria, Vídeos, Jogos/Resultados, FAQ, Contactos, Pré-inscrição/Criar conta, Entrar — tudo lido da base de dados e editável pelo admin. Sem dados inventados: secções vazias mostram estado vazio.

## Fase 5 — Testes
Criar contas de teste para cada perfil e validar: cadastro pendente → aprovação → processo → acesso; atribuição a equipa; mister vê só o seu atleta; presença e avaliação; isolamento entre atletas; bloqueio de acesso indevido (testes de RLS diretamente na base de dados + navegação real).

## Notas
- O primeiro administrador tem de ser definido: após criar a sua conta, indique o email e atribuo o perfil admin.
- Os dados atuais no Firebase não são migrados automaticamente (exigiria as suas credenciais de administrador do Firebase); o sistema começa limpo. Se quiser importar, envie uma exportação.
- Trabalho grande: será entregue por fases, verificando cada uma antes de passar à seguinte.
