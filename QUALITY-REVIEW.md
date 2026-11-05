# QUALITY-REVIEW.md — Revisão de qualidade (FASE 1)

> Este é o relatório de qualidade do repositório **SoftPet** (`D:/projetos/PetShop`).
>
> **Data da sessão:** 2026-11-04 (sessão 7 — SOFTPET-008). **Nada foi implementado nesta rodada** — nenhum arquivo de código, CSS, manifesto, lockfile, `.gitignore` ou configuração foi alterado. Esta rodada criou apenas este arquivo e atualizou `memory-bank/CURRENT-STATE.md` e `memory-bank/CHANGELOG.md`.
>
> **Execução manual** — a skill `quality-review` **não está instalada** (reconfirmado nesta rodada: nenhum caminho de skills do ambiente a contém; checagem rápida, sem busca extensa). Nenhuma skill foi executada. A metodologia definida em `AGENTS.md` e no escopo da sessão foi aplicada manualmente.
>
> **Atualização (sessão 9 — SOFTPET-010, 2026-11-04):** baseline isolado executado **fora do repositório** (cópia temporária — §10). QLT-002 **confirmado em navegador**. QLT-003 **não reproduzido** — reclassificado P1 → P2. Nenhum código do workspace real foi alterado nesta sessão.
>
> **Atualização (sessão 10 — SOFTPET-011, 2026-11-04):** **QLT-010 implementado no workspace real** — componentes movidos de `src/pages/componentes/` para `src/components/` e imports atualizados. **Build de produção isolado: exit 0** (cópia temporária — §11). Prioridade histórica do finding reavaliada P3 → **P1** (bloqueio de build). Smoke runtime pós-build sem quebra. `Form.js` movido sem correção (estado registrado na seção).
>
> **Atualização (sessão 11 — SOFTPET-012, 2026-11-04):** **QLT-002 implementado e `FIXED`** — `ButtonDelete` passou a `type="button"` e `handleDelete` foi reorganizado (sucesso: toast + `getPets()` + fechar modal; erro: apenas toast, modal aberto). **Os três cenários (200/404/500) passaram no navegador, sem `?submit=`** (§12). Stage do `git mv` da sessão anterior normalizado (índice = HEAD). Referências de caminho em `README.md`/`PROJETO.md` corrigidas.
>
> **Papel:** Tech Lead + QA. Esta revisão **não** reescreve `SECURITY-AUDIT.md` — findings de segurança permanecem lá, com IDs próprios (`SEC-XXX`). Nenhum achado novo de segurança foi encontrado nesta rodada; onde a qualidade toca um achado de segurança, há **referência cruzada**, não duplicação.

---

## 1. Baseline de Git no início da sessão

| Item | Valor |
|---|---|
| Branch / HEAD | `main` / `b9fc914fe0873fef78a7b86a972202c2de34bce6` |
| Stage | **vazio** |
| `git diff --check` | **código de saída 0** |
| Node / npm | v22.14.0 / 11.18.0 |
| Alterações rastreadas fora de `.next` | `README.md`, `api/controllers/pet.js`, `api/package.json`, `src/app/page.js`, `src/pages/componentes/bloco-info/Bloco.js`, `modal/ModalCad.js`, `modal/ModalEdit.js`, `principal/principal.js` — trabalho das sessões anteriores (SEC-001, SEC-002 e documentação), **preservado** |
| Não rastreados fora de `.next` | `AGENTS.md`, `PROJETO.md`, `SECURITY-AUDIT.md`, `docs/`, `memory-bank/`, `package-lock.json` (raiz), `api/test/` |
| `.next/` | 60 modificados + 33 deletados + 28 novos — **idêntico ao relatório anterior** |

HEAD completo: `b9fc914fe0873fef78a7b86a972202c2de34bce6` — igual ao último relatório. Nenhuma divergência material em relação à referência histórica.

## 2. Baseline de testes executado

- **Comando:** `npm --prefix ./api test` (a partir da raiz; Node v22.14.0 / npm 11.18.0)
- **Resultado:** **37 testes — 37 passaram, 0 falharam, 0 cancelados. Código de saída 0.**
- Idêntico ao fim da sessão SOFTPET-007. Baseline confirmado **antes** de qualquer análise.

**Verificações não executadas nesta rodada:**
- **Lint:** `npm run lint` (`next lint`) **não foi executado** — o repositório **não tem nenhum arquivo de configuração ESLint** (`.eslintrc*`/`eslint.config.*` — todos testados, inexistentes), e o `next lint` sem configuração **pergunta interativamente e criaria um arquivo de config**, alterando o workspace. Versões conferidas antes da decisão: `eslint-config-next` instalada **13.5.11**, `next` instalada **14.2.35**. Rodar lint exigiria criar configuração — etapa própria.
- **Build:** não executado — `.next` já está versionado com alterações preexistentes; um build produziria ruído de atribuição (decisão da sessão). Pendência para etapa de baseline isolado.
- **Playwright:** nenhum servidor ou navegador iniciado apenas para satisfazer checklist. Fluxos a verificar quando houver ambiente reproduzível confirmado — listados no §6.

---

## 3. Tabela de findings por prioridade

| ID | Prioridade | Título | Estado |
|---|---|---|---|
| **QLT-001** | **P1** | `update`/`delete` respondem sucesso sem conferir `affectedRows` (era SEC-003) | **FIXED** (SOFTPET-009 — testes unitários, banco simulado; integração pendente) |
| **QLT-002** | **P1** | Fluxo de exclusão: `submit` + `onClick`, lista não atualiza, modal não fecha | **FIXED** (SOFTPET-012 — `type="button"` + sucesso: `getPets()` + fechar modal; 200/404/500 verificados — §12) |
| QLT-003 | **P2** (era P1) | `ModalEdit`: estado controlado manual sobrescreve `register()` do react-hook-form | Aberto — **não reproduzido em navegador** (SOFTPET-010, §10) |
| QLT-004 | P2 | Mensagens de validação nunca renderizadas (frontend) | Aberto |
| QLT-005 | P2 | Sem estados de carregamento, erro na interface e ausência de resultados | Aberto |
| QLT-006 | P2 | Acessibilidade: `setAppElement`, botão de fechar como `div`, inputs sem label | Aberto — evidências de teclado/foco em §10 |
| QLT-007 | P2 | Artefatos gerados versionados (`.next`, `api/node_modules`) e `.gitignore` | Aberto |
| QLT-008 | P2 | Conexão única com o MySQL, sem pool e sem recuperação | Aberto |
| QLT-009 | P2 | Schema/DDL da tabela `pets` não existe no repositório | Aberto |
| **QLT-010** | **P1** (era P3) | Componentes dentro da convenção de rotas do Pages Router; `Form.js` | **FIXED** (SOFTPET-011 — movidos para `src/components/`; build isolado exit 0 — §11) |
| QLT-011 | P3 | URL da API repetida em 6 arquivos (pré-requisito do plano comercial) | Aberto |
| QLT-012 | P3 | Higiene de manifesto: dependências declaradas sem uso, `eslint-config-next` em `dependencies`, `styled-components` sem plugin, `nodemon` no `start` | Aberto |
| QLT-013 | P3 | Qualidade dos testes: comparação de SQL literal, duplicação de harness, lacuna de integração | Aberto |
| QLT-014 | P3 | Lista sem `key` + sort no cliente por campo inexistente | Aberto |
| QLT-016 | P3 | Sem media queries — responsividade | Aberto |
| QLT-015 | P4 | Cosméticos: `console.log`, `page.module.css` vazio, fonte duplicada, typo | Aberto |

**Total: 16 findings — P0: 0 · P1: 3 · P2: 7 · P3: 5 · P4: 1** (QLT-003 reclassificado de P1 para P2 na SOFTPET-010 — §10; QLT-010 reavaliado de P3 para **P1** na SOFTPET-011 — bloqueio de build comprovado — e `FIXED` — §11; QLT-001 e QLT-002 `FIXED` — §12. A linha conta **por prioridade atual**, incluindo os já corrigidos).

**Ainda abertos: 13 — P2: 7 · P3: 5 · P4: 1.** Nenhum P1 permanece aberto. `QLT-001`, `QLT-002` e `QLT-010` estão `FIXED` e **não** são contados como abertos — os números não devem ser confundidos.

---

## 4. Findings detalhados

### QLT-001 — `update`/`delete` respondem sucesso sem conferir `affectedRows`

- **Prioridade:** **P1** · **Estado:** **`FIXED`** (sessão SOFTPET-009, 2026-11-04 — implementado e verificado por **testes unitários com banco simulado**; **não é `VERIFIED` ponta a ponta** — integração MySQL/HTTP pendente; ver §2) · **Categoria:** Integridade de dados / tratamento de resultados · **Origem:** reclassificado de `SEC-003`, que o registrou primeiro — ver `SECURITY-AUDIT.md` §SEC-003
- **Arquivos:** `api/controllers/pet.js` (`updatePets`, `deletePets`)
- **Evidência (confirmado por leitura):** os callbacks recebem apenas `err` e descartam o `result`. O MySQL **não** considera "zero linhas afetadas" um erro — `PUT`/`DELETE` em id inexistente respondem "sucesso" com HTTP 200.
- **Impacto:** perda silenciosa de escrita — o operador acredita que alterou ou removeu um registro que não foi alterado. Com o prontuário, isso compromete a auditabilidade do histórico clínico.
- **Comportamento atual:** `PUT`/`DELETE` em id inexistente → HTTP 200 + "sucesso". **Comportamento desejado:** `result` no callback; `affectedRows === 0` → HTTP 404 (com o mesmo JSON genérico da SEC-002, uma vez que ela já definiu o padrão de erro).
- **Menor correção:** receber `result` nos dois callbacks e responder 404 quando `affectedRows === 0`. Pequena e local.
- **Testes necessários:** `PUT`/`DELETE` em id existente (controle), id inexistente (404), id malformado. O harness atual (banco simulado) já suporta — basta o fake devolver `result` com `affectedRows`. — **Executados na sessão SOFTPET-009:** 43/43 na suíte, incluindo `affectedRows` 0 → 404 nos dois controllers, prioridade do erro (err + affectedRows 0 → 500) e ids malformados (`abc`, `-1`, `0`) repassados como valor sem validação própria — a API ainda não tem contrato de validação de `id`, e nenhum 400 foi inventado nesta rodada. Critério: `affectedRows`; `changedRows` **não** decide existência (mesmos valores em registro existente continuam atualização válida). Comportamento do driver em MySQL real não testado — se divergir, registrar como limitação de integração; nenhuma segunda consulta foi adicionada.
- **Dependências:** nenhuma. A SEC-002 (já `FIXED`) deixou o terreno pronto. **É o próximo item desta revisão** — ver §7.

### QLT-002 — Fluxo de exclusão: `submit` + `onClick`, lista não atualiza, modal não fecha

- **Prioridade:** **P1** · **Estado:** **`FIXED`** (sessão SOFTPET-012, 2026-11-04 — implementado no workspace real e verificado nos três cenários no navegador — §12; **não `VERIFIED`** contra backend/banco real) · **Categoria:** Funcional / fluxo de dados
- **Arquivos:** `src/components/modal/ModalDel.js`, `modal/buttons.js` (`ButtonDelete`), `bloco-info/Bloco.js` (`handleDelete`)
- **Evidência (confirmado por leitura):** `ButtonDelete` é `type="submit"` **dentro do `<form>`** do `ModalDel` **e** dispara a requisição no `onClick`. O `<form>` não tem `onSubmit` com `preventDefault`, então o clique **também submete o formulário** (navegação para a URL atual → recarrega a página). `handleDelete` só chama `setOnEdit(null)` — **não chama `getPets()` nem `closeModalDel()`**.
- **Impacto:** o comportamento final depende de um efeito colateral (o reload acidental pela submissão do formulário apaga o estado do modal e a lista é remontada do zero). É frágil: qualquer mudança que cancele a navegação (ex.: adicionar `onSubmit` com `preventDefault`) expõe a lista desatualizada e o modal aberto. Com a SEC-002 corrigida, um 500 real mostra a mensagem genérica — mas a lista continua sem refresh no caminho de sucesso.
- **Comportamento desejado:** botão `type="button"` (ou remover o `onClick` e tratar o submit com `preventDefault`); após DELETE bem-sucedido: `getPets()` + fechar o modal; `setOnEdit(null)` preservado.
- **Menor correção:** no `handleDelete`, encadear sucesso → `getPets()` + `closeModalDel()`; trocar o botão para `type="button"`.
- **Testes necessários:** teste de interação (Playwright): excluir um pet e conferir lista + modal; excluir id inexistente (após QLT-001) e conferir 404 + mensagem.
- **Dependências:** QLT-001 (o caminho 404), SEC-002 (já `FIXED`).

- **Confirmado em navegador (SOFTPET-010 — §10):** o clique no botão de confirmação dispara **as duas coisas** — o `onClick` (DELETE enviado e respondido) **e** a submissão do `<form>` sem `preventDefault`, que navega para `/?submit=` (reload completo). Em 200, 404 e 500 o resultado final dependeu do reload acidental; nenhum toast foi observado nos três cenários. Mantém **P1**.
- **Correção implementada (SOFTPET-012):** `ButtonDelete` → `type="button"` (sem `preventDefault` — a troca simples resolve; `name="submit"` preservado, agora inócuo). `handleDelete` reorganizado em `try/catch`: sucesso → `toast.success(data)` + `await getPets()` + `closeModalDel()` + `setOnEdit(null)`; erro → apenas `toast.error`, **sem** `getPets()` e **sem** fechar o modal. `ModalDel.js` **não foi alterado** — não foi necessário. `setOnEdit(null)` passou a executar só no caminho de sucesso (antes era incondicional); é estado morto em `page.js` (nunca lido por `Bloco.js`), portanto sem impacto comportamental — registrado por honestidade.
- **Verificação (SOFTPET-012 — §12):** os três cenários passaram no runtime de produção isolado, sem `?submit=` em nenhum deles.

### QLT-003 — `ModalEdit`: estado controlado manual sobrescreve `register()` do react-hook-form

- **Prioridade:** **P2** (reclassificado de P1 na SOFTPET-010 — §10) · **Estado:** Aberto — mecanismo por leitura **não reproduziu falha em navegador**; o fluxo funcionou no cenário testado · **Categoria:** Funcional / estado React
- **Arquivos:** `src/pages/componentes/modal/ModalEdit.js`
- **O que `register()` fornece:** `name`, `onChange`, `onBlur` (e ref) — o react-hook-form mantém o valor **no estado interno dele**, atualizado pelo `onChange` que ele registra. No `ModalEdit`, os inputs fazem `{...register("campo")}` **e depois** `value={selectedPet?.campo || ""}` + `onChange` manual — os props manuais **sobrescrevem** os handlers do `register()` (último vence).
- **Consequência (confirmada por leitura):** digitando, o `selectedPet` (estado React) atualiza a **exibição**, mas o estado interno do RHF **nunca recebe o evento** — permanece nos valores iniciais (vazio). No submit, o `handleSubmit` entrega os valores do RHF (vazios), o zod (`min(1)`) reprova, e `handleUpdate` **nunca é chamado** — sem mensagem de erro na tela (QLT-004). O valor **exibido diverge do valor enviado**.
- **Classificação honesta:** o mecanismo é **confirmado por leitura**; a UX resultante (submit silencioso que não salva) **exige teste de interação** para ser afirmada como comportamento observado.
- **Teste de interação (SOFTPET-010 — §10):** **não reproduzido.** O submit chamou `handleUpdate`, o PUT saiu **com o valor editado**, o toast de sucesso apareceu, o modal fechou e a lista foi atualizada pelo caminho de sucesso. O `register()` do RHF v7 continua ativo via `ref` e **ressincroniza o valor do DOM a cada re-render** — é isso que salva o fluxo. A dupla controle é **frágil** (depende desse detalhe de implementação, não de garantia documentada), mas **funciona** no cenário testado. **Reclassificado P1 → P2** (fragilidade/risco latente; não é bug funcional confirmado). Não `FIXED`.
- **Menor correção:** usar `reset(selectedPet)` ao abrir o modal (API nativa do RHF para pré-preencher estado) e remover os `value`/`onChange` manuais — ou, alternativamente, controlar tudo por estado e enviar o estado no submit. Não refatorar o resto do componente.
- **Testes necessários:** teste de interação: abrir edição, alterar campo, submit, conferir `PUT` com o valor alterado.
- **Dependências:** QLT-004 (sem `formState.errors`, a falha de validação é silenciosa).

### QLT-004 — Mensagens de validação nunca renderizadas

- **Prioridade:** P2 · **Estado:** Aberto · **Categoria:** UX / validação
- **Arquivos:** `ModalCad.js`, `ModalEdit.js`, `SearchFilter.js`
- **Evidência (confirmado por leitura):** `formState.errors` não é usado em nenhum componente — o zod valida, e quando reprova o submit simplesmente não executa; o usuário não vê nada.
- **Impacto:** agrava QLT-003 (falha silenciosa). A validação de **front** existe; a validação de **front** não comunica.
- **Comportamento desejado:** exibir a mensagem do zod (já definida nos schemas) junto ao campo.
- **Menor correção:** renderizar `formState.errors.campo?.message` nos formulários dos modais.
- **Testes necessários:** teste de interação (submit com campo vazio mostra mensagem).
- **Dependências:** nenhuma. **Nota:** a validação na **fronteira da API** é a SEC-004 (`SECURITY-AUDIT.md`) — não duplicar aqui.

### QLT-005 — Sem estados de carregamento, erro na interface e ausência de resultados

- **Prioridade:** P2 · **Estado:** Aberto · **Categoria:** UX
- **Arquivos:** `page.js`, `principal.js`
- **Evidência (confirmado por leitura):** a lista renderiza direto; sem dados, a área fica vazia sem mensagem; sem indicador de carregamento; erro agora tem toast (SEC-002 `FIXED`), mas não há empty state ("nenhum resultado para X") nem loading.
- **Menor correção:** empty state textual + indicador simples. Sem refatoração de estado.
- **Testes necessários:** teste de interação (busca sem resultado; primeira carga lenta).
- **Dependências:** nenhuma.

### QLT-006 — Acessibilidade: `setAppElement`, botão de fechar como `div`, inputs sem label

- **Prioridade:** P2 · **Estado:** Aberto · **Categoria:** Acessibilidade
- **Arquivos:** `ModalCad.js`, `ModalEdit.js`, `ModalDel.js`, `buttons.js`, `bloco.css`/`modal.css`
- **Evidência (confirmado por leitura):** `ReactModal.setAppElement()` nunca é chamado (o conteúdo fora do modal fica acessível a leitores de tela); o "X" de fechar é uma `div` com `onClick` (não é botão, não tem nome acessível, não é focável por teclado); os inputs dos modais têm apenas `<span>` visual como rótulo, sem `htmlFor`/`id` (os radios têm `htmlFor` — ok); `alt=""` nas imagens decorativas está **correto** e não é defeito. Contraste: avaliável apenas parcialmente pelo CSS (texto claro sobre gradiente escuro — plausível; cinza `#404A5C` sobre fundo escuro é baixo).
- **Comportamento desejado:** `setAppElement(document.body)` na inicialização do modal; fechar como `<button aria-label="Fechar">`; `id`+`htmlFor` ou `aria-label` nos inputs.
- **Menor correção:** as três trocas acima, sem tocar no layout.
- **Testes necessários:** teste de interação (fechar modal por teclado; foco preso no modal — o react-modal já faz trap, verificar).
- **Evidência de runtime (SOFTPET-010 — §10):** confirmados em navegador: aviso `react-modal: App element is not defined` a cada abertura; o "X" (`div`) **não recebe foco** (TAB pula); trap entre focáveis funciona; **ESC fecha** ambos os modais e devolve o foco ao botão que os abriu; inputs do `ModalEdit` focáveis **sem nome acessível**. Caracterização feita; continua P2, não vira próximo item automaticamente.
- **Dependências:** nenhuma.

### QLT-007 — Artefatos gerados versionados e `.gitignore`

- **Prioridade:** P2 · **Estado:** Aberto · **Categoria:** Versionamento / manutenção
- **Evidência (confirmado por leitura):** `.next/` (~162 arquivos) e `api/node_modules/` (~936 arquivos) estão **versionados**; o `.gitignore` da raiz contém apenas `/node_modules` (não cobre `api/node_modules` nem `.next`). O lockfile da raiz existe localmente mas **não é rastreado** (origem não confirmada — registrado nas sessões anteriores).
- **Impacto:** ruído em todo `git status`/`diff` (esta sessão o comprovou), diffs binários inúteis, risco de conflito em qualquer clone limpo.
- **Plano de limpeza futura (não executado):** adicionar `.next/` e `api/node_modules/` ao `.gitignore` e remover do índice com `git rm -r --cached` **em etapa própria** — os arquivos locais permanecem onde estão; nada é apagado do disco. O lockfile da raiz deve ser decidido na etapa de atualização (P12).
- **Dependências:** nenhuma. Não executar limpeza nesta rodada.

### QLT-008 — Conexão única com o MySQL, sem pool e sem recuperação

- **Prioridade:** P2 · **Estado:** Aberto · **Categoria:** Arquitetura / resiliência
- **Arquivos:** `api/db.js`
- **Evidência (confirmado por leitura):** `mysql.createConnection` — uma única conexão para toda a vida do processo, sem tratamento de erro de conexão no startup e sem reconexão. Se a conexão cair (reinício do MySQL, timeout), **toda a API passa a falhar para sempre** (agora com 500 genérico, desde a SEC-002).
- **Impacto:** para o produto local (uma instalação por estabelecimento, várias estações — H5), uma queda momentânea do banco derruba o sistema até reiniciar a API.
- **Menor correção:** trocar para `createPool` (mesmo driver) + handler de erro no `pool.on('error')`. Pequena e local.
- **Testes necessários:** os testes unitários atuais não cobrem (o fake intercepta `db.js`); exige teste de integração — pendência conhecida.
- **Dependências:** a troca de banco futura (PostgreSQL — proposta P15) reescreve este acesso; a correção no MySQL legado só se justifica se o legado viver mais ciclos (critério já registrado no SECURITY-AUDIT §10).

### QLT-009 — Schema/DDL da tabela `pets` não existe no repositório

- **Prioridade:** P2 · **Estado:** Aberto · **Categoria:** Dados / evolução
- **Evidência:** confirmado por leitura — não há DDL, migration ou seed entre os arquivos do projeto; os campos são inferidos das strings SQL.
- **Impacto:** bloqueia a modelagem do prontuário (o primeiro momento em que o projeto terá **relacionamentos entre tabelas**) e impede qualquer migração com dados reais. É a **[PENDÊNCIA]** declarada no PLANO-COMERCIAL §5.2.
- **Menor correção:** levantar o DDL real da instância (quando houver acesso autorizado) e registrá-lo no repositório.
- **Dependências:** exige conexão com o banco — etapa própria.

### QLT-010 — Componentes dentro da convenção de rotas do Pages Router; `Form.js`

- **Prioridade:** **P1** (reavaliada na SOFTPET-011 — era P3 na revisão inicial; subiu para **P1 — bloqueio de distribuição/build de produção** após evidência de build na SOFTPET-010) · **Estado:** **`FIXED`** (sessão SOFTPET-011, 2026-11-04 — movidos para `src/components/`, imports atualizados, **build isolado exit 0** — §11) · **Categoria:** Organização de código
- **Evidência (confirmado por leitura):** `src/pages/componentes/**` participa da convenção de roteamento (`next.config.mjs` não define `pageExtensions`). Arquivos **sem exportação default** sob essa convenção: `Form.js`, `SearchFilter.js`, `buttons.js`. O efeito real no build **não foi verificado** (build não executado nesta rodada).
- **`Form.js` especificamente:** não é importado por nenhum arquivo (grep confirmado — **divergência registrada**: o PLANO-COMERCIAL §2.5 afirma que "Form.js é importado por Bloco.js", o que o código não confirma; o código vence). **Não o classificamos como código morto** — ele pode ser alcançado como rota pela convenção. E está **quebrado por leitura**: referencia `handleCreate`, `toast` e `axios` que não existem no escopo do arquivo (`handleSubmit(handleCreate)` chama a função local com `handleCreate` como evento → `e.preventDefault is not a function`; `toast`/`axios` não importados → `ReferenceError`).
- **Atualização (SOFTPET-010 — §10):** efeito no build **confirmado** — `next build` falha exatamente nos três arquivos sem default export (`buttons`, `Form`, `SearchFilter`).
- **Estrutura futura coerente (executada na SOFTPET-011):** componentes compartilhados fora de ambos os roteadores — `src/components/` — com `src/app` só para rotas. Decisão registrada em `DECISIONS.md` (D7). Organização interna preservada (subpastas `bloco-info/`, `modal/`, `principal/` inalteradas; nenhum arquivo renomeado; `Form.js` movido sem correção — ver acima).
- **Dependências:** nenhuma.

### QLT-011 — URL da API repetida em 6 arquivos

- **Prioridade:** P3 · **Estado:** Aberto · **Categoria:** Manutenção / pré-requisito do plano
- **Evidência:** `http://localhost:8800` hardcoded em `page.js`, `principal.js`, `Bloco.js`, `Form.js`, `ModalCad.js`, `ModalEdit.js` (6 ocorrências, conferidas).
- **Impacto:** é o ponto que **decide a arquitetura de rede** do produto (PLANO-COMERCIAL §2.6/§6.3 — proposta P17): uma estação na rede resolveria `localhost` para si mesma. Deixou de ser conveniência e virou pré-requisito funcional.
- **Menor correção:** um módulo de configuração de URL consumido pelos 6 pontos.
- **Dependências:** nenhuma técnica; decisão de produto H5.

### QLT-012 — Higiene de manifesto

- **Prioridade:** P3 · **Estado:** Aberto · **Categoria:** Dependências / configuração
- **Evidência (confirmado por leitura):**

| Pacote | Declarada | Instalada | Importada | Utilizada |
|---|---|---|---|---|
| `mongodb`, `mongoose`, `snappy`, `@mongodb-js/zstd`, `mongodb-client-encryption`, `@aws-sdk/credential-providers`, `aws4`, `gcp-metadata` (raiz) | sim | sim (árvore local) | **não** (zero ocorrências em `src/**`) | não |
| `eslint-config-next` | sim (`dependencies` — deveria ser `devDependencies`) | 13.5.11 | config inexistente | não configurada |
| `styled-components` | sim | sim | sim (`page.js`) | sim, **sem plugin SWC/Babel** — consequência não verificada |
| `nodemon` (API) | sim, em **`dependencies`** | 3.1.1 (lockfile) | — | é o **único script `start`** da API — produção usando watch de desenvolvimento |

- **Impacto:** cada dependência declarada conta em licença e em `npm audit` na distribuição (responsabilidade do SECURITY-AUDIT — **nenhum finding de segurança novo aqui**; os advisories já estão na auditoria).
- **Menor correção:** remover as dependências órfãs do manifesto na etapa de atualização (proposta P16 já registrada); mover `eslint-config-next`; decidir `nodemon` no `start`.
- **Dependências:** mexe no lockfile — etapa própria.

### QLT-013 — Qualidade dos testes

- **Prioridade:** P3 · **Estado:** Aberto · **Categoria:** Testes
- **O que os 37 testes cobrem bem:** separação SQL × valores (SEC-001), contrato de erro 500 + JSON genérico sem vazamento (SEC-002), 400 para tipos não textuais, caminhos de sucesso, isolamento por processo com mock único + `after()` restaurando.
- **Fragilidades (confirmadas por leitura):** (a) **comparação de SQL literal** — qualquer reescrita de formatação do SQL quebra os testes, mesmo sem mudança de comportamento; é um acoplamento aceito conscientemente (a string é o contrato testado), mas deve ser conhecido; (b) **duplicação do harness** (`fakeDb`, `mockRes`, `reset` repetidos nos dois arquivos) — necessária pela disciplina de mock por processo, mas um terceiro arquivo de teste repetirá a cópia; (c) **cobertura zero de integração** — nada exercita HTTP real, driver real, MySQL real, `NO_BACKSLASH_ESCAPES` (pendência da SEC-001/002).
- **Falsos positivos observados:** nenhum — o baseline passou 37/37 sem cancelamentos.
- **Menor correção:** extrair harness compartilhado quando houver um terceiro arquivo; testes de integração na etapa de banco.
- **Dependências:** QLT-001 (os próximos testes usarão o mesmo harness).

### QLT-014 — Lista sem `key` + sort no cliente por campo inexistente

- **Prioridade:** P3 · **Estado:** Aberto · **Categoria:** React / correção de código
- **Evidência (confirmado por leitura):** (a) `principal.js` renderiza `pets.map(...)` sem `key` — React usa índice implicitamente; com expansão de cards e reordenação, há risco de estado de componente vinculado ao item errado; (b) `page.js` ordena por `a.nome` — campo **inexistente** no retorno (o campo é `namePet`); o comparador nunca retorna `0` (`undefined > undefined` é `false` → sempre `1`), o que **provavelmente inverte** a ordem que o SQL já entregou — divergência registrada: o `PROJETO.md` §4.1 trata o sort como inócuo; a leitura sugere efeito real. Classificação: mecanismo confirmado por leitura; **efeito visual exige teste de navegador**.
- **Menor correção:** `key={item.id}`; corrigir o comparador para `namePet` ou removê-lo (o backend já ordena).
- **Dependências:** nenhuma.

### QLT-016 — Sem media queries — responsividade

- **Prioridade:** P3 · **Estado:** Aberto · **Categoria:** UI
- **Evidência:** nenhum `@media` (além do `prefers-color-scheme` no `globals.css`) em `style.css`, `bloco.css`, `modal.css`. Grid fixo de 4 colunas; modais posicionados com percentuais absolutos (`top: 8vh; left: 22.5%`).
- **Contexto:** o produto será usado principalmente em desktop de recepção/consultório — mas resoluções menores não devem ser descartadas. Revisar na etapa de interface do plano (etapa 7 do PROJETO).
- **Dependências:** nenhuma.

### QLT-015 — Cosméticos agrupados (mesma natureza, mesma sessão de correção)

- **Prioridade:** P4 · **Estado:** Aberto · **Categoria:** Cosmético
- **Itens (todos confirmados por leitura):** `console.log(selectedPet)` residual em `ModalDel.js`; `page.module.css` vazio mas importado em `page.js`; fonte Ubuntu instanciada duas vezes (`layout.js` **e** `page.js`); typo `pausaOnFocusLoss` em `page.js` (propriedade correta: `pauseOnFocusLoss`); `globals.css` tem bloco `@media (prefers-color-scheme: dark)` vazio duplicado.
- **Menor correção:** limpeza direta em uma única passada, sem refatoração.
- **Dependências:** nenhuma.

---

## 5. Fluxo de dados — resumo da revisão (sem correções)

`page.js` (dono do estado `pets`/`onEdit`) → `principal.js` (orquestra busca/cadastro/lista) → `Bloco.js` (expansão, abre `ModalEdit`/`ModalDel`) → API. Cadastro e edição recarregam a lista via `getPets()`; **exclusão não recarrega** (QLT-002). O `onEdit`/`selectedPet` vive no card, não no `page.js` — a prop `setOnEdit` do `page.js` é usada quase inteiramente para `null` (o estado `onEdit` do `page.js` nunca é lido por `Bloco.js`, que usa o `selectedPet` local). Isso não é bug hoje, mas é estado morto no topo — registrar se o fluxo for refatorado.

## 6. Fluxos a verificar por Playwright (quando houver ambiente reproduzível)

1. Cadastro completo (zod → POST → lista atualizada → toast).
2. Busca com apóstrofo (`D'Angelo`) e com acento — de ponta a ponta (a unidade cobre o controller; o caminho HTTP + `qs` não).
3. Busca sem resultado (empty state — QLT-005).
4. Edição completa com alteração de campo (QLT-003 — confirmar runtime).
5. Exclusão completa: lista + modal + toast (QLT-002), id inexistente → 404 (QLT-001).
6. Erro de banco real → 500 + mensagem genérica na interface (SEC-002 ponta a ponta).
7. Teclado: foco entra no modal, ESC fecha, `Tab` alcança os botões (QLT-006).
8. `?search[]=x` via navegador (array → 400 — comportamento já testado na unidade).

## 7. Único próximo item

**Atualizado na SOFTPET-012.** O QLT-002 foi implementado e verificado (§12), e o QLT-010 já estava `FIXED` (§11). **Nenhum P1 de qualidade permanece aberto.** O próximo item recomendado é **SEC-007** (`SECURITY-AUDIT.md`) — o achado aberto de maior severidade (**ALTA**), com condições de disparo **presentes no código atual** e já apontado pela própria auditoria como candidata a próximo item; a correção (atualizar `body-parser` para ≥ 1.20.9) mexe no lockfile e por isso é etapa própria — agora viável, pois existe baseline de build isolado para validar a mudança.

**Justificativa da escolha (e por que não os outros):** QLT-004 e QLT-006 são P2 sem severidade de segurança; QLT-011 depende de **decisão de produto** (H5/P17) antes de virar implementação; SEC-005 é MÉDIA. SEC-007 é a única candidata cuja severidade é ALTA e cujas condições de disparo já estão no código. **Não implementado nesta rodada.**

<details>
<summary>Plano detalhado do QLT-002 (executado na SOFTPET-012 — resultado em §12)</summary>

- **Causa:** `ButtonDelete` é `type="submit"` dentro do `<form>` do `ModalDel`, que não tem `onSubmit`/`preventDefault` — o clique dispara o `onClick` (DELETE) **e** a submissão do formulário (navegação para `/?submit=` → reload). `handleDelete` não chama `getPets()` nem `closeModalDel()`.
- **Comportamento observado (§10):** DELETE enviado e respondido em 200/404/500; a navegação destrói modal e estado antes de qualquer toast; a lista só reflete o estado por causa do reload; nos caminhos de erro o usuário não vê nenhuma mensagem.
- **Arquivos:** `src/pages/componentes/modal/ModalDel.js`, `modal/buttons.js` (`ButtonDelete`), `bloco-info/Bloco.js` (`handleDelete`).
- **Menor correção:** `ButtonDelete` → `type="button"` (ou `onSubmit` com `preventDefault` no form); no sucesso de `handleDelete`: `getPets()` + `closeModalDel()`; preservar `setOnEdit(null)` e o `toast.error` do caminho de erro (que passa a ter tempo de aparecer, sem navegação).
- **Testes:** unitários não cobrem o frontend — teste de interação reproduzindo o §10: excluir id existente (200) → lista sem o pet, modal fechado, toast de sucesso; id inexistente (404) → pet permanece, modal fechado, toast de erro; erro (500) → mensagem de erro; nenhuma navegação (`?submit=` não pode aparecer).
- **Critérios de aceitação:** nenhum reload ao confirmar; modal fecha sozinho; lista atualizada por `getPets()`; toast visível nos três caminhos; `setOnEdit(null)` preservado; `console.log` residual fora do caminho crítico (QLT-015 cuida dele).
- **Playwright após implementação:** re-executar os três cenários do §10 (200/404/500) assertindo URL estável, modal fechado, lista e toast.

**Executado na SOFTPET-012** — resultado nos três cenários em §12.

</details>

## 8. SECURITY_HANDOFF

Nenhum achado **novo** de segurança nesta rodada. Os existentes permanecem no `SECURITY-AUDIT.md` com seus IDs: SEC-001 `FIXED` (testes unitários), SEC-002 `FIXED` (testes unitários + leitura do diff), SEC-003 reclassificado para qualidade e registrado aqui como **QLT-001 (`FIXED` — SOFTPET-009)**, SEC-004–SEC-006 inalterados, SEC-007 (dependência) candidata seguinte por mexer no lockfile.

## 9. O que bloqueia de fato a evolução para o produto (e o que pode esperar)

**Bloqueiam (tratar antes/de dentro das etapas do plano):** QLT-009 (schema real — sem ele não há modelagem de prontuário nem migração), QLT-011 (URL da API — pré-requisito de rede, P17), ~~QLT-001~~ (**resolvido na SOFTPET-009** — integridade de escrita, base do prontuário), ~~QLT-010~~ (**resolvido na SOFTPET-011** — build de produção destravado, §11), credenciais/configuração por instalação (P2, já no plano).

**Podem esperar a etapa própria sem travar nada:** QLT-007 (limpeza de versionamento), QLT-012 (manifesto/lockfile), QLT-008 (pool — só se o legado MySQL viver mais ciclos), QLT-013–QLT-016.

---

## 10. Evidências de runtime — baseline isolado (sessão SOFTPET-010)

Execução **manual** da metodologia (skills indisponíveis; nenhuma executada). Workspace real **não foi usado para build/dev** — nada foi escrito em `.next`, manifests ou lockfiles reais.

### 10.1 Ambiente e comandos

| Item | Valor |
|---|---|
| Cópia isolada | `C:\Users\vitor2\AppData\Local\Temp\softpet-baseline-s10` (fora do repositório; excluídos `.git`, `.next`, `node_modules`; incluídos código, manifests, os dois lockfiles, assets, configs e testes) |
| `npm ci` (raiz, na cópia) | **êxito (exit 0)** — lockfile compatível com o manifesto. Scripts de install não cobertos por allow-scripts não rodaram (`mongodb-client-encryption`) — irrelevante (pacote não importado) |
| `npm ci` da API na cópia | **não executado** — a API não foi iniciada; o navegador interceptou `http://localhost:8800` |
| `npm run build` (cópia) | **falhou (exit 1)** — compilação OK; falha na otimização: *"found pages without a React Component as default export in `pages/componentes/modal/buttons`, `pages/componentes/Form`, `pages/componentes/SearchFilter`"*. Causa mínima: convenção de rotas do Pages Router sobre `src/pages/componentes/**` — **confirma o efeito previsto no QLT-010**. Nenhum código corrigido |
| Lint (cópia) | `next lint` **pergunta interativamente** (Strict/Base/Cancel) — cancelado sem resposta; criar config é decisão de projeto (plano posterior — QLT-012). Nenhuma `.eslintrc` criada no projeto real |
| Runtime | `next dev` na cópia (Next 14.2.35) em `http://localhost:3000`. **MySQL real não foi conectado.** Intercepção Playwright em `http://localhost:8800/**` |
| Viewports | **1366×768** (primário, todos os cenários) e **1920×1080** (observação adicional: layout renderiza; overlay cobre o viewport; modal dentro da área visível) |
| Ferramenta de navegador | Playwright via ambiente integrado (rota + interação). Screenshots: nenhum salvo no repositório |

### 10.2 Fixtures (100% fictícias)

Dois pets artificiais — gato "Felinio Ficticio" (id `F-001`) e cachorro "Cachorro Beta" (id `F-002`) — com responsáveis, telefones e datas fictícios. Nenhum dado real de usuário ou de cliente.

### 10.3 QLT-002 — exclusão (confirmado no navegador)

Sequência observada (idêntica nos três cenários de resposta): abrir card → `Remover` → modal abre e **permanece aberto por si só** → clique na confirmação dispara **as duas coisas**: o `onClick` (DELETE **enviado e respondido** pela intercepção) **e** a submissão do `<form>` sem `preventDefault` → **navegação para `/?submit=`** (reload completo).

| Resposta | Estado final observado | Toast |
|---|---|---|
| **200** | Navegação destruiu modal e estado; lista remontada do GET pós-reload (o app **não** chamou `getPets()` — o GET após o DELETE é do mount, dobrado pelo StrictMode do dev) | **não observado** (destruído pela navegação) |
| **404** | Pet permanece na lista (nada foi removido de fato); modal destruído pela navegação | **não observado** |
| **500** | Idêntico ao 404 | **não observado** |

**Diferenciação:** confirmado no navegador — `type="submit"` causa navegação; o modal não fecha por ação do app; a lista não é atualizada pelo app; nenhuma mensagem aparece. O comportamento final depende do efeito colateral (reload). **Mantém P1** — nos caminhos de erro o usuário não vê nenhuma mensagem; no de sucesso, não vê confirmação.

### 10.4 QLT-003 — edição (não reproduzido)

- Modal abre **com campos preenchidos** (de `selectedPet`); digitar atualiza a exibição (o `onChange` manual → estado).
- Submit: `handleUpdate` **foi chamado** — **PUT enviado com o valor editado** (`namePet` alterado + demais campos originais), toast de sucesso apareceu, modal fechou, lista atualizada pelo caminho de sucesso (`getPets()` existe nesse caminho e foi chamado).
- O mecanismo previsto por leitura (estado interno do RHF nunca recebe o evento → zod reprova → submit silencioso) **não reproduziu**: o `register()` do RHF v7 mantém o `ref` ativo e **ressincroniza o valor do DOM a cada re-render** — é isso que salva o fluxo no arranjo atual. A dupla controle (`{...register}` + `value`/`onChange` manuais) é **frágil** — depende de detalhe de implementação, não de garantia documentada — mas **funciona** no cenário testado.
- **Reclassificação:** P1 → **P2** (fragilidade/risco latente, não bug funcional confirmado). Não `FIXED` — o código continua com o arranjo duplicado.

### 10.5 QLT-006 — teclado/foco (caracterização mínima)

- `react-modal` avisa `App element is not defined` a cada abertura (confirmado no navegador).
- O "X" de fechar (`div`) **não recebe foco** — TAB pula.
- Trap de foco entre elementos focáveis funciona: `ModalDel` cicla `buttonBack` ↔ `buttonDelete`; `ModalEdit` cicla pelos inputs — mas os inputs são focáveis **sem nome acessível** (só `<span>` visual).
- **ESC fecha** ambos os modais e devolve o foco ao botão que os abriu (funciona mesmo sem `setAppElement`). Shift+TAB funciona.
- Não vira próximo item automaticamente.

### 10.6 Observações incidentais (registradas sem ampliar escopo)

- React avisa do `key` ausente no `principal` (QLT-014 — confirmado no navegador). O sort por `nome` com 2 itens **preservou a ordem** — o comparador que nunca retorna `0` não inverteu nesse tamanho; o efeito depende do tamanho/algoritmo. Não altera a classificação.
- Aviso `React-Modal: Cannot register modal instance that's already open` — artefato de dev (double mount do StrictMode), não é bug de produção.

### 10.7 Limitações desta caracterização

- Runtime via **dev server** (o build de produção falha — QLT-010). A interceção cobre o navegador; driver/MySQL reais não foram exercitados.
- Sessão única de navegador, sem concorrência. Toasts com `autoClose` de 1,5 s — "não observado" significa "não capturado durante a navegação", não "impossível de aparecer".
- Playwright permitiu interceção suficiente — nenhuma API real precisou ser iniciada.

### 10.8 Único próximo item após os testes

**QLT-002** — plano completo no §7. QLT-003 saiu da disputa (não reproduziu; virou P2).

A base atual **suporta evolução incremental** para PostgreSQL, autenticação, tutor separado de pet e prontuário — nenhuma reescrita é obrigatória agora; as propostas do PLANO-COMERCIAL (P15–P24) continuam válidas e não aprovadas.

---

## 11. Execução do build isolado e smoke pós-move (sessão SOFTPET-011)

Execução **manual** da metodologia (`safe-implementation` indisponível; nenhuma skill executada — ambiente inalterado, sem busca extensa). A mudança do QLT-010 foi feita **no workspace real** (move + imports); build e runtime rodaram **fora do repositório**.

### 11.1 Ambiente e comandos

| Item | Valor |
|---|---|
| Cópia isolada | `C:\Users\vitor2\AppData\Local\Temp\softpet-build-s11` (fora do repositório; excluídos `.git`, `.next`, `node_modules` de ambas as árvores; incluído o estado atual já com o move) |
| `npm ci` (raiz, na cópia) | **êxito (exit 0)** — lockfile compatível. Scripts de install não cobertos por allow-scripts não rodaram (`mongodb-client-encryption`) — irrelevante (pacote não importado) |
| `npm run build` (cópia) | **êxito (exit 0)** — compilou, coletou dados de páginas, gerou 4 páginas estáticas, finalizou a otimização. **O erro anterior ("found pages without a React Component as default export") não apareceu mais** — critério principal atendido |
| Rotas reconhecidas | `(app)`: `/` e `/_not-found` (ambas estáticas). **Nenhuma rota `componentes/*` no output.** A aplicação principal segue representada por `/`. Nenhuma rota nova criada |
| `npm start` (cópia) | `next start` em `http://localhost:3000` — subiu em ~0,5 s |
| Intercepção | Playwright em `http://localhost:8800/**` com as **mesmas fixtures fictícias** do §10.2. MySQL real não conectado |
| Viewport | 1366×768. Nenhum screenshot salvo no repositório |

### 11.2 Smoke runtime pós-build (produção, sem StrictMode)

| Verificação | Resultado |
|---|---|
| Página abre | ok — título "SOFT PET", busca e botão Cadastrar presentes |
| Dois cards | ok — os dois pets fictícios renderizados |
| Card expande | ok — raça, telefone (link wa.me) e nascimento aparecem |
| Modal de edição abre | ok — abre e **pré-preenche** os campos com os dados do fixture; fecha pelo botão de voltar |
| Modal de exclusão abre | ok — abre com campos desabilitados e a pergunta de confirmação; **fechado por ESC sem confirmar** (QLT-002 não re-testado nesta rodada) |

**Nenhuma quebra causada pelo move.** Observação incidental: ao fechar o modal de edição pelo botão de voltar, o navegador registrou o aviso "Form submission canceled because the form is not connected" — consistente com o arranjo conhecido do `ModalEdit` (QLT-003/QLT-002, não re-testados).

### 11.3 Limite observado

Nada foi corrigido além do move e dos imports: `Form.js` movido sem correção (continua sem importador e com os problemas próprios já registrados); `key`, sort, `console.log`, ESLint, URLs e demais findings intocados.

---

## 12. Implementação do QLT-002 — verificação Playwright (sessão SOFTPET-012)

Execução **manual** da metodologia (`safe-implementation` indisponível; nenhuma skill executada — ambiente inalterado, sem busca extensa). Mudança em **dois arquivos** do workspace real: `src/components/modal/buttons.js` (`ButtonDelete` → `type="button"`) e `src/components/bloco-info/Bloco.js` (`handleDelete` reorganizado com `try/catch`). `ModalDel.js` não precisou de alteração.

### 12.1 Mudança implementada

| Arquivo | Alteração |
|---|---|
| `buttons.js` | `ButtonDelete`: `type="submit"` → `type="button"` (elimina a submissão nativa do `<form>`) |
| `Bloco.js` | `handleDelete`: reorganizado para `async/await` com `try/catch`; sucesso → `toast.success` + `await getPets()` + `closeModalDel()` + `setOnEdit(null)`; erro → `toast.error` (modal permanece aberto) |

### 12.2 Ambiente de verificação

| Item | Valor |
|---|---|
| Cópia isolada | `%TEMP%\softpet-qlt002-s12` (fora do repositório; excluídos `.git`, `.next`, `node_modules` de ambas as árvores) |
| `npm ci` (raiz, na cópia) | **êxito (exit 0)** |
| `npm run build` (cópia) | **êxito (exit 0)** — nenhuma rota `componentes/*`; rotas: `/` e `/_not-found` |
| Runtime | `npm start` na cópia (produção, sem StrictMode) em `http://localhost:3000` |
| Intercepção | Playwright em `http://localhost:8800/**` com as **mesmas fixtures fictícias** do §10.2. MySQL real não conectado |
| Viewport | 1366×768. Nenhum screenshot salvo no repositório |

### 12.3 Cenário 200 — exclusão bem-sucedida

Fluxo: abrir `/` → 2 cards → expandir primeiro → `Remover` → confirmar → DELETE interceptado com 200 → fixture atualizada (pet removido) → GET posterior retorna lista atualizada.

| Critério | Resultado |
|---|---|
| Exatamente 1 DELETE | ✓ |
| Nenhum reload/navegação | ✓ — URL permanece `/` |
| URL não contém `submit` | ✓ |
| Toast de sucesso observado | ✓ |
| Modal fecha | ✓ |
| `getPets()` provoca GET de atualização | ✓ |
| Card removido desaparece | ✓ — resta 1 card |

### 12.4 Cenário 404 — pet não encontrado

Fluxo: recarregar cenário limpo com 2 fixtures → expandir → `Remover` → confirmar → DELETE interceptado com 404 + `{"error":"Pet não encontrado."}`.

| Critério | Resultado |
|---|---|
| Exatamente 1 DELETE | ✓ |
| Sem reload | ✓ — URL permanece `/` |
| Modal continua aberto | ✓ |
| 2 cards permanecem | ✓ |
| Nenhum GET de atualização | ✓ |
| Toast de erro observado | ✓ |

### 12.5 Cenário 500 — erro de servidor

Fluxo: idem 404, DELETE interceptado com 500 + `{"error":"Não foi possível concluir a operação."}`.

| Critério | Resultado |
|---|---|
| Exatamente 1 DELETE | ✓ |
| Sem reload | ✓ — URL permanece `/` |
| Modal continua aberto | ✓ |
| 2 cards permanecem | ✓ |
| Nenhum GET de atualização | ✓ |
| Toast de erro observado | ✓ |

### 12.6 Regressão `?submit=`

**`?submit=` não apareceu em nenhum dos três cenários.** Critério de regressão obrigatório atendido.

### 12.7 Limitações

- Runtime via **produção** (`npm start`) — sem StrictMode, sem GET duplicado de mount.
- Intercepção no navegador — driver/MySQL reais não exercitados.
- Sessão única, sem concorrência. Toasts com `autoClose` de 1,5 s — observados durante a interação.
- Não `VERIFIED` contra backend/banco real.
