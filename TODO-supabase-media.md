# TODO: Supabase para mídias e projetos (visão geral)

- [ ] Criar schema/table `projects` no Supabase (RLS habilitado)
  - Campos: id, name, subtitle, description, icon, color, tags(text[]), cover_url, image_urls(text[]), video_urls(text[]), created_at, updated_at
- [ ] Criar bucket `project-media` no Supabase Storage + policy de acesso público somente para leitura
- [ ] Criar Supabase Edge Function para upload (admin-only)
  - Endpoint: `/functions/v1/upload-project-media`
  - Recebe: id (opcional), name, subtitle, description, icon, color, tags, cover index/cover_url
  - Recebe arquivos: imagens e vídeos
  - Faz upload no bucket com paths determinísticos e grava/atualiza tabela `projects`
- [ ] Ajustar `index.html`
  - Remover persistência local (IndexedDB/localStorage)
  - Renderizar projetos para todos via leitura REST da tabela `projects`
  - Cards e modal usam URLs públicas do Storage
  - Manter admin: login continua, mas salva/edita/exclui via Edge Function
- [ ] Migrar projetos antigos (quando existir) para o modelo novo (se necessário)
- [ ] Testes manuais:
  - Visitante comum: lista + abre detalhes (imagens/vídeos)
  - Admin: cria projeto com upload de mídia, salva, recarrega e vê mudanças
  - Excluir/edit preservar consistência (capa e arrays)

