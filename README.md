# Andiamo — viagem em grupo pela Itália

Aplicativo web instalável para acompanhar pagamentos e roteiro. O grupo acessa o mesmo estado online com um código de acesso. Hospedagens, parcelas e pagamentos à vista só contam depois de serem registrados.

## Configuração do banco compartilhado

O app usa Supabase. Não publique o endereço do app até criar o projeto e ativar a proteção do banco.

1. Crie um projeto no Supabase.
2. No **SQL Editor**, execute o conteúdo de `supabase/schema.sql`. Depois, na mesma área, execute `supabase/private-setup.sql` para carregar nomes, valores e os lançamentos iniciais. Esse arquivo é privado e fica excluído do Git por `.gitignore`; não o copie para um repositório público nem o sirva no site.
3. Instale a [Supabase CLI](https://supabase.com/docs/guides/cli) e faça login. O `supabase/config.toml` desativa a validação JWT do gateway somente para esta função; a função valida o código antes de acessar qualquer dado:

   ```bash
   supabase login
   supabase link --project-ref SEU_PROJECT_REF
   supabase secrets set TRIP_ACCESS_CODE="DEFINA_O_CODIGO_DO_GRUPO"
   supabase functions deploy trip-sync
   ```

   Defina o código nos secrets do Supabase; não o coloque em `travel.js`, `trip-config.js`, GitHub ou em mensagens do WhatsApp. O endpoint bloqueia o IP por 15 minutos depois de cinco tentativas incorretas. Como o grupo compartilha um único código, qualquer pessoa que tenha o link e o código pode ver e editar os dados.

4. Em **Project Settings → API**, copie o Project URL e a chave pública **anon/publishable** para `trip-config.js`:

   ```js
   window.TRIP_CONFIG = {
     supabaseUrl: "https://SEU_PROJECT_REF.supabase.co",
     supabaseAnonKey: "SUA_CHAVE_PUBLICA_ANON"
   };
   ```

   A chave pública pode ficar no site. **Nunca** use a `service_role`/secret key no navegador; ela fica apenas nos secrets gerenciados do Supabase.

   O backup JSON é útil para arquivar ou restaurar dados. A importação substitui os dados compartilhados de todo o grupo.

## Publicar sem substituir o CicloD'or

O repositório original já usa GitHub Pages para outro site. Publique a viagem num **repositório separado** ou num novo site de hospedagem estática — não substitua a publicação existente.

Inclua no site os arquivos `index.html`, `travel.css`, `travel.js`, `trip-config.js`, `trip-sync.js`, `manifest.webmanifest`, `service-worker.js` e `app-icon.svg`. O `supabase/` é usado para configurar o backend; não precisa ser servido ao público.

Depois de publicar em HTTPS, envie o endereço ao grupo pelo WhatsApp. Cada pessoa abre o link e pode instalar o app:

- **Android/Chrome:** menu ⋮ → **Instalar app** ou **Adicionar à tela inicial**.
- **iPhone/Safari:** botão **Compartilhar** → **Adicionar à Tela de Início**.

O código de acesso não está incluído nos arquivos públicos. Compartilhe-o separadamente apenas com os cinco viajantes. O app sincroniza atualizações ao salvar e verifica alterações do grupo a cada 30 segundos.

## Dados e rateio

- Nomes, hospedagens, valores, rateios e lançamentos iniciais são carregados somente depois da validação do código, diretamente do banco privado.
- Registre cada pagamento real, com pagador, hospedagem, recebedor, mês e valor. É possível pagar uma parcela ou o total da cota.
- Os valores de parcelas sugeridos são referências; lance cada pagamento quando acontecer.
- A silhueta do mapa deriva do GeoJSON World, com dados do Natural Earth.

## Arquivos principais

- `index.html` — estrutura do app e tela do código de acesso.
- `travel.css` — estilos responsivos.
- `travel.js` — pagamentos, gráfico, roteiro e estado da interface.
- `trip-sync.js` — comunicação com o endpoint protegido.
- `trip-config.js` — URL do projeto Supabase e chave pública.
- `supabase/schema.sql` — tabelas protegidas e controle de concorrência, sem dados privados da viagem.
- `supabase/functions/trip-sync/index.ts` — código de acesso, limite de tentativas e sincronização.
