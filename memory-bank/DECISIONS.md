# DECISIONS.md — Fatos, decisões e propostas

> Este arquivo separa explicitamente o que foi **observado**, o que foi **decidido** e o que é apenas **proposta**. Não há justificativas históricas reconstruídas.

---

## 1. Fatos observados

Fatos verificados por leitura de arquivos deste repositório. **Não são decisões.**

| # | Fato | Evidência |
|---|---|---|
| F1 | A persistência usa o driver `mysql`. | `api/package.json`, `api/db.js` |
| F2 | O `README.md` descrevia MongoDB/Mongoose como banco. | histórico do arquivo |
| F3 | As bibliotecas de MongoDB do `package.json` da raiz não são importadas por nenhum arquivo `.js`. | busca em `src/**` |
| F4 | A raiz **passou a ter** `package-lock.json` (278.708 bytes, `lockfileVersion: 3`) e `node_modules` — ambos **não rastreados**. `api/package-lock.json` existe. **Esta linha substitui a redação anterior, que dizia que a raiz não possuía lockfile.** | `git status --porcelain` + `git ls-files --others --exclude-standard`, nesta rodada |
| F5 | `.next/` (162 arquivos) e `api/node_modules/` (936 arquivos) estão versionados. | `git ls-files` |
| F6 | O `.gitignore` da raiz contém `/node_modules` e, desde a SOFTPET-015 (2026-11-05), `.env`, `.env.*` e `!.env.example`. **Esta linha substitui a redação anterior, que dizia apenas `/node_modules`.** | `.gitignore` |
| F7 | `next.config.mjs` não define `pageExtensions`. | `next.config.mjs` |
| F8 | `Form.js`, `SearchFilter.js` e `buttons.js` não têm exportação padrão. | `grep export default` |
| F9 | A conexão do banco era feita com valores fixos no código, sem variáveis de ambiente. **Desde a SOFTPET-015 (2026-11-05), a configuração é lida exclusivamente do ambiente (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) via `api/config/database.js`; os literais saíram do código atual.** A credencial antiga permanece no histórico Git. **Esta linha substitui a redação anterior.** | `api/db.js`, `api/config/database.js` |
| F10 | A URL da API está fixa em 6 arquivos do frontend. | busca por `localhost:8800` |
| F11 | A busca interpola o valor do usuário diretamente na string SQL. | `api/controllers/pet.js` |
| F12 | Erros do driver são devolvidos com `res.json(err)`, sem status de erro. | `api/controllers/pet.js` |
| F13 | `updatePets` e `deletePets` não conferem o resultado da consulta. | `api/controllers/pet.js` |
| F14 | Não há validação de entrada nos controllers da API. | `api/routes/pets.js` |
| F15 | A exclusão usa botão `type="submit"` dentro de `<form>` e dispara a requisição no `onClick`. | `ModalDel.js`, `buttons.js` |
| F16 | Após a exclusão, a lista não é atualizada e o modal não é fechado. | `bloco-info/Bloco.js` |
| F17 | Na edição, `value`/`onChange` manuais sobrescrevem os handlers do `register()`. | `modal/ModalEdit.js` |
| F18 | As mensagens de validação dos formulários não são apresentadas na interface. | ausência de `formState.errors` |
| F19 | A lista de cards é renderizada sem `key`. | `principal/principal.js` |
| F20 | O schema do banco não existe entre os arquivos próprios do projeto. | busca por DDL/migration/schema |
| F21 | Não há testes próprios nem pipeline no repositório. | `git ls-files` |
| F22 | `eslint-config-next` está em `dependencies`, não em `devDependencies`. | `package.json` |
| F23 | `styled-components` é usado sem plugin SWC/Babel configurado. | `package.json`, `next.config.mjs` |
| F24 | `ReactModal.setAppElement()` não é chamado em nenhum ponto. | busca no código |
| F25 | `mysql.createConnection()` é usado em lugar de pool. | `api/db.js` |
| F26 | `cors()` é aplicado sem restrição de origem. | `api/index.js` |
| F27 | Não há autenticação nem autorização em nenhuma rota. | `api/routes/pets.js` |
| F28 | Não há estados de carregamento, erro e ausência de resultados na interface. | `page.js`, `principal.js` |
| F29 | Não há media queries nos arquivos CSS do projeto. | `style.css`, `bloco.css`, `modal.css` |
| F30 | `page.module.css` está vazio, mas é importado em `page.js`. | `src/app/` |
| F31 | A fonte Ubuntu é importada tanto em `layout.js` quanto em `page.js`. | ambos os arquivos |
| F32 | `console.log` residual em `ModalDel.js`. | linha 22 |
| F33 | `pausaOnFocusLoss` em `page.js` — grafia incorreta da propriedade. | `src/app/page.js` |
| F34 | Sort no cliente usa o campo `nome`, inexistente no retorno da API. | `src/app/page.js` |
| F35 | `nodemon` está em **`dependencies`** da API, e o **único script `start`** é `nodemon index.js`. | `api/package.json` |
| F36 | A fonte Ubuntu é carregada por `next/font/google` — o download ocorre no **build**; em runtime a fonte já está auto-hospedada. | `src/app/layout.js`, `src/app/page.js`, `.next/static/media/*.woff2` |
| F37 | `src/assets/icone/` tem **19 arquivos SVG** sem qualquer arquivo de atribuição de origem ou licença no repositório. | listagem do diretório |
| F38 | As dependências de MongoDB/Mongoose continuam **sem importação** em `src/**` — a busca foi refeita nesta rodada e seguiu vazia. | busca por `mongoose`, `mongodb`, `snappy`, `zstd`, `aws4`, `gcp-metadata` e `credential-providers` em `src/**` |
| F39 | As duas resoluções do CFMV indicadas para consulta **não puderam ser lidas** — a extração dos PDFs falhou em duas tentativas e o sistema de consulta de legislação exige autenticação. | tentativa de consulta nesta rodada |

---

## 2. Decisões expressamente tomadas

Decisões de **processo**, tomadas nesta sessão. Nenhuma decisão técnica de stack foi tomada.

| # | Decisão | Alcance |
|---|---|---|
| D1 | Responder e documentar em **português-BR**. | Todo o projeto |
| D2 | Revisar os documentos relacionados após futuras mudanças no código. | Todo o projeto |
| D3 | A sequência de evolução do projeto segue as sete etapas listadas em `PROJETO.md`. | Planejamento |
| D4 | A prioridade concreta das etapas será definida pelos resultados das auditorias. | Planejamento |
| D5 | Os relatórios formais `SECURITY-AUDIT.md` e `QUALITY-REVIEW.md` serão produzidos nas etapas próprias, não agora. | Planejamento |
| D6 | A FASE 2 foi executada manualmente, pois a skill `project-bootstrap` não está instalada neste ambiente. | Esta sessão |
| D7 | Componentes compartilhados ficam **fora das convenções de roteamento** `app`/`pages`. O local atual escolhido é `src/components/` (movido de `src/pages/componentes/` na sessão SOFTPET-011, 2026-11-04; organização interna preservada). Decisão factual desta sessão — sem justificativa histórica. | `src/components/` |
| D8 | **A configuração de banco não pertence ao código-fonte.** `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` são fornecidas pelo **ambiente de execução**, sem fallback embutido. Para a futura versão comercial, o instalador/launcher será o responsável por fornecer essa configuração; o mecanismo exato ainda será definido. Decisão factual da sessão SOFTPET-015 (2026-11-05). | `api/config/database.js`, `api/.env.example` |

**Nenhuma decisão técnica foi tomada sobre:** banco de dados (motor — a migração para PostgreSQL segue proposta P15), ORM, framework, biblioteca de estilos, plugin de build ou autenticação. **Estrutura de pastas:** decidida na SOFTPET-011 — ver D7. **Configuração de banco (fonte dos valores, não o motor):** decidida na SOFTPET-015 — ver D8.

> **Nota desta rodada:** as propostas P15 a P24 nasceram do planejamento comercial e **continuam propostas** — nenhuma foi aprovada. O detalhamento está em `docs/PLANO-COMERCIAL-LOCAL.md`. Esta seção continua valendo como estava.

---

## 3. Propostas pendentes

Propostas — **nenhuma foi aprovada**.

| # | Proposta | Observação |
|---|---|---|
| P1 | Parametrizar a busca SQL. | Decorre de F11; a parametrização já é usada nos demais controllers |
| P2 | Mover a conexão do banco para variáveis de ambiente, com `.env.example`. | Decorre de F9 |
| P3 | Centralizar a URL da API em um módulo de configuração. | Decorre de F10 |
| P4 | Adicionar validação de entrada na API. | Decorre de F14 |
| P5 | Adicionar middleware de tratamento de erros com status adequados. | Decorre de F12 |
| P6 | Conferir o resultado das consultas em `update` e `delete`. | Decorre de F13 |
| P7 | Renderizar as mensagens de validação na interface. | Decorre de F18 |
| P8 | Adicionar `key` na lista de cards. | Decorre de F19 |
| P9 | Revisar o fluxo de exclusão (atualizar lista e fechar modal). | Decorre de F15, F16 |
| P10 | Resolver o conflito entre `register()` e estado controlado na edição. | Decorre de F17 |
| P11 | Registrar o DDL da tabela `pets` no repositório. | Decorre de F20 |
| P12 | Gerar lockfile na raiz e revisar `.gitignore`. | Decorre de F4, F5, F6 |
| P13 | Avaliar se `src/pages/componentes/` deve permanecer sob a convenção de rotas. | Decorre de F7, F8 |
| P14 | Adicionar testes progressivos, um por correção relevante. | Decorre de F21 |
| P15 | **PostgreSQL** como banco do produto — **uma única** implementação de persistência no MVP; o MySQL atual permanece apenas como base de legado até a migração. | `docs/PLANO-COMERCIAL-LOCAL.md` §5. **Não aprovada.** Condicionada a V1 |
| P16 | Manter Next.js/React e Express; **sem** Electron, Tauri, Docker, WSL ou microserviços no MVP — o acesso por navegador atende ao objetivo. | `docs/PLANO-COMERCIAL-LOCAL.md` §6.2 e §6.7 |
| P17 | Centralizar a URL da API em **configuração de tempo de execução** — deixa de ser conveniência e passa a ser **pré-requisito** para acesso por estação. | Decorre de F10; `docs/PLANO-COMERCIAL-LOCAL.md` §6.3 |
| P18 | Separar programa instalado e dados do cliente (configuração, anexos, backups) em pastas distintas. | `docs/PLANO-COMERCIAL-LOCAL.md` §6.6 |
| P19 | Vínculo entre tutor e pet tratado como **relação com vigência**, para preservar a identificação histórica dos atendimentos. | `docs/PLANO-COMERCIAL-LOCAL.md` §7.2 |
| P20 | **Não** adotar exclusão em cascata de prontuários sem política escrita; arquivar em lugar de apagar. | `docs/PLANO-COMERCIAL-LOCAL.md` §7.4 |
| P21 | Controle **otimista** de edição simultânea — depende de resolver o contrato de erro (SEC-002) antes. | `docs/PLANO-COMERCIAL-LOCAL.md` §7.4 |
| P22 | Backup com **destino externo obrigatório** — cópia apenas no mesmo disco não é estratégia suficiente. | `docs/PLANO-COMERCIAL-LOCAL.md` §8.2 |
| P23 | Em expiração ou falha de licença, **consulta e exportação** do histórico continuam disponíveis para usuários autorizados. | `docs/PLANO-COMERCIAL-LOCAL.md` §8.4 |
| P24 | **SOFTPET-006** — implementar a SEC-001 conforme `SECURITY-AUDIT.md` §9, como primeira implementação da evolução. | `docs/PLANO-COMERCIAL-LOCAL.md` §13 |

**Não há proposta aprovada** de troca de stack, adoção de ORM, migração de banco ou reescrita da interface. Nenhuma dessas mudanças deve ser tratada como obrigação sem necessidade comprovada.

---

## 4. O que não se sabe

- **Por que** o projeto usa MySQL, Express ou qualquer biblioteca específica. Não há registro histórico — não serão inventadas justificativas retroativas.
- Qual é o schema real da tabela `pets`.
- Se o build atual passa ou falha — não foi executado.
- Se as dependências declaradas sem uso são resíduo de uma tentativa anterior ou intenção futura.
- **O que as resoluções do CFMV efetivamente exigem** sobre prontuário, identificação profissional, guarda, fornecimento de cópia e documentos eletrônicos. As fontes indicadas não puderam ser lidas nesta rodada (F39) — **nenhuma obrigação normativa é afirmada como fato**, e a validação precisa ser feita com o responsável técnico antes de virar modelo de dados.
- Quais são as licenças das dependências das duas árvores e dos recursos visuais do projeto. Nenhuma foi conferida.
