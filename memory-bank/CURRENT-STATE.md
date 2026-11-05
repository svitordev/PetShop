# CURRENT-STATE.md — Estado atual

**Data da sessão:** 2026-11-04

---

## SESSÃO 12 — SEC-007 — Express 4.22.3 / body-parser 1.20.9 (SOFTPET-014B)

Rodada de **implementação controlada** — somente o gatilho confirmado da SEC-007 (GHSA-27r3-jxmh-p828). **Execução manual** — skills indisponíveis; nenhuma executada. Baseline: commit `d594c7a` (HEAD == origin/main), suíte 43/43, stage vazio — reconfiridos no pré-flight.

### Implementado no workspace real (somente o autorizado)

- **`api/package.json`:** apenas `express` `^4.19.2` → `^4.22.3` (linha 4.x preservada; sem Express 5, sem `body-parser` direto, sem `overrides`).
- **`api/package-lock.json`:** regenerado por `npm install --package-lock-only --ignore-scripts` (exit 0). Resolução: `body-parser` **1.20.9** ✓, `qs` 6.16.2, `path-to-regexp` 0.1.13, `cookie` 0.7.2, `send` 0.19.2, `serve-static` 1.16.3; `proxy-addr` permanece 2.0.7.
- **Efeito colateral registrado:** `api/node_modules/.package-lock.json` (arquivo gerado, mas versionado — QLT-007) foi atualizado pelo comando. `node_modules` real não reinstallado — a evidência da árvore nova é a cópia isolada.
- **Nada mais alterado:** raiz (manifest/lockfile) intacta; controllers, frontend, CORS, mysql, nodemon intocados. Sem `npm audit fix`.

### Verificação (cópia isolada `%TEMP%\softpet-sec007-s14b`)

- `npm ci` raiz: exit 0 · `npm ci` API: exit 0.
- `npm ls` na cópia: **express 4.22.3 / body-parser 1.20.9** ✓.
- **Audit antes** (real): 11 pacotes (1 critical, 6 high, 1 moderate, 3 low), GHSA-27r3-jxmh-p828 presente — SEC-007 reproduzível.
- **Audit depois** (cópia): **GHSA-27r3-jxmh-p828 não é mais reportado** ✓. Total: 4 pacotes (1 critical, 3 high) — residuais com condição ausente (§6.7.1), não corrigidos automaticamente. **Audit não zerou.**
- **Suíte na cópia (árvore nova): 43/43**, exit 0 ✓.
- **Build na cópia: exit 0**; rotas `/` e `/_not-found`; nenhuma `componentes/*` ✓.
- **Runtime HTTP real não exercitado** — sem banco de teste autorizado (`db.js` legado exigiria MySQL real).

### Documentos alterados nesta rodada

`SECURITY-AUDIT.md` (SEC-007 → FIXED com escopo; nova §6.8) · `docs/ARQUITETURA.md` (tabela da API — linha do express) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`. `QUALITY-REVIEW.md` não alterado (nada mudou materialmente nos findings — QLT-012 permanece como está).

### Limpeza

Cópia temporária removida após confirmação do caminho (fora do repositório). Nenhum processo pendente desta sessão. Verificação final: suíte 43/43 (node_modules antigo — não prova a árvore nova), stage vazio, `git diff --check` 0.

**Estado:** SEC-007 **FIXED com escopo**. Sem commit, sem push (autorização pendente). **Próximo item recomendado: SEC-005** (credenciais no código → variáveis de ambiente — etapa própria do plano, P2; é o achado de segurança aberto mais antigo com ação direta e sem dependência de decisão de produto). Não implementado nesta sessão.

---

## SESSÃO 11 — Normalização do stage e implementação do QLT-002 (SOFTPET-012)

Rodada de **implementação controlada** — dois objetivos: (1) normalizar o stage deixado pelo `git mv` da SOFTPET-011; (2) implementar exclusivamente o QLT-002. **Execução manual** — skills indisponíveis; nenhuma executada. Pré-flight reconfirido: branch `main`, HEAD `b9fc914`, suíte **43/43**, hashes dos lockfiles idênticos.

### Etapa A — Normalização do stage

`git restore --staged -- src/pages/componentes src/components` — índice igualado ao HEAD. Move da SOFTPET-011 **preservado integralmente** no working tree (12 arquivos em `src/components/`, caminhos antigos como deletados). Stage vazio após a operação.

### Correção residual de documentação

`README.md`: referência a `pages/componentes/` → `components/`. `PROJETO.md`: referências já atualizadas na sessão anterior (untracked). Nenhuma outra mudança nesses documentos.

### Implementação do QLT-002

- **`buttons.js`**: `ButtonDelete` → `type="button"` (elimina submissão nativa do `<form>`).
- **`Bloco.js`**: `handleDelete` reorganizado para `async/await` com `try/catch`; sucesso → `toast.success` + `await getPets()` + `closeModalDel()` + `setOnEdit(null)`; erro → `toast.error` (modal permanece aberto).
- **`ModalDel.js`**: não alterado.

### Verificação

- **Suíte da API:** **43/43**, 0 cancelados, exit 0.
- **Build isolado** (cópia `%TEMP%\softpet-qlt002-s12`, `npm ci` exit 0): **`npm run build` exit 0**.
- **Playwright (produção, 1366×768, fixtures fictícias):**
  - **200:** DELETE→GET, sem navegação, modal fechou, toast de sucesso, 1 card restante. ✓
  - **404:** modal aberto, 2 cards, sem GET de atualização, toast de erro. ✓
  - **500:** mesmos critérios do 404. ✓
  - **`?submit=` não apareceu em nenhum cenário.** ✓

### Prioridade do finding

QLT-002: P1 → **FIXED**. Nenhum P1 de qualidade permanece aberto.

### Documentos alterados nesta rodada

`QUALITY-REVIEW.md` (cabeçalho, tabela, totais, QLT-002, §7, nova §12) · `README.md` (caminho residual) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`.

### Limpeza

Servidor `npm start` da cópia (iniciado por esta sessão) encerrado. Cópia temporária removida após confirmação do caminho (fora do repositório). Verificação final: suíte 43/43, stage vazio, `git diff --check` 0, hashes idênticos ao pré-flight.

**Próximo item recomendado: SEC-007** (dependência vulnerável `body-parser`, etapa própria — mexe no lockfile; agora viável com baseline de build isolado). Não implementado nesta sessão.

---

## SESSÃO 10 — Implementação do QLT-010 — move para src/components (SOFTPET-011)

Rodada de **implementação controlada** — somente o finding QLT-010. **Execução manual** — skills indisponíveis; nenhuma executada (ambiente inalterado, sem busca extensa). Pré-flight reconfirido: branch `main`, HEAD `b9fc914`, `git diff --check` 0, suíte **43/43**, hashes dos lockfiles idênticos aos das sessões anteriores. O trabalho das sessões anteriores foi preservado.

### Implementado no workspace real (somente o autorizado)

- **Move:** `src/pages/componentes/` → `src/components/` via `git mv` (os 12 arquivos, todos rastreados; organização interna preservada; nenhum arquivo renomeado). `src/pages/` ficou vazia e deixou de existir. **O stage passou a conter os renames** — consequência inevitável de mover arquivos rastreados; nada foi commitado.
- **Imports:** 14 imports absolutos `@/pages/componentes/...` → `@/components/...` em 7 arquivos (`page.js` 1, `Bloco.js` 3, `buttons.js` 1, `ModalCad.js` 2, `ModalDel.js` 2, `ModalEdit.js` 2, `principal.js` 3). Imports relativos internos que continuaram válidos foram preservados (`Bloco.js` 1, `principal.js` 3, `Form.js` 2). Busca final: **0 ocorrências** de `@/pages/componentes` em `src`. `Form.js` movido **sem correção** (sem importador; problemas próprios registrados no QUALITY-REVIEW).
- **Nada mais alterado:** sort, `key`, `console.log`, ReactModal, URLs, ESLint, manifests, lockfiles e `.next` do workspace real intocados.

### Verificação

- **Suíte da API:** **43/43**, 0 cancelados, exit 0 (não cobrem o frontend; permanecem verdes).
- **Build isolado** (cópia `%TEMP%\softpet-build-s11`, `npm ci` exit 0): **`npm run build` exit 0** — erro dos arquivos sem default export desapareceu; rotas reconhecidas: `/` e `/_not-found` (nenhuma rota `componentes/*`, nenhuma rota nova).
- **Smoke runtime** (`npm start` na cópia + Playwright com as mesmas fixtures fictícias): página abre, 2 cards, card expande, modal de edição abre e pré-preenche, modal de exclusão abre. **Nenhuma quebra pelo move.** QLT-002/003 não re-testados.

### Prioridade do finding

QLT-010: P3 na revisão inicial → **P1** (bloqueio de build comprovado na SOFTPET-010) → **FIXED** nesta sessão. Decisão factual registrada como D7 no `DECISIONS.md`.

### Documentos alterados nesta rodada

`QUALITY-REVIEW.md` (cabeçalho, tabela, totais, QLT-010, §7, §9, nova §11) · `docs/ARQUITETURA.md` (§1, §2.2, §8) · `memory-bank/DECISIONS.md` (D7) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`.

### Limpeza

Servidor `npm start` da cópia (iniciado por esta sessão) encerrado. Cópia temporária removida após confirmação do caminho (fora do repositório). Verificação final: suíte 43/43, `git diff --check` 0, hashes idênticos ao pré-flight.

**Próximo item recomendado: QLT-002** (P1 funcional confirmado — plano no `QUALITY-REVIEW.md` §7). Não implementado nesta sessão.

---

## SESSÃO 9 — Baseline isolado e caracterização de QLT-002/QLT-003 (SOFTPET-010)

Rodada de **análise e verificação** — baseline de build/lint/runtime **fora do repositório** e caracterização no navegador dos dois P1 restantes. **Nada foi implementado no código.** **Execução manual** — skills indisponíveis; nenhuma executada. Workspace real reconfirido no pré-flight: branch `main`, HEAD `b9fc914`, stage vazio, `git diff --check` 0, suíte **43/43**, hashes dos lockfiles idênticos aos das sessões anteriores.

### O que foi feito (fora do repositório)

- **Cópia isolada** em `C:\Users\vitor2\AppData\Local\Temp\softpet-baseline-s10` (excluídos `.git`, `.next`, `node_modules`; incluídos código, manifests, lockfiles, assets, configs, testes). Caminho confirmado fora do repositório antes de qualquer operação.
- **`npm ci` na raiz da cópia: exit 0** (lockfile compatível). `npm ci` da API não foi necessário (API não iniciada).
- **`npm run build` na cópia: FALHOU (exit 1)** — compilação OK; falha na otimização por arquivos sem default export em `pages/componentes` (`buttons`, `Form`, `SearchFilter`) — **confirma o efeito previsto no QLT-010**. Nenhum código corrigido.
- **Lint:** `next lint` pergunta interativamente (Strict/Base/Cancel) — cancelado sem resposta; criar config é decisão de projeto. Nenhuma `.eslintrc` criada no projeto real.
- **Runtime:** `next dev` na cópia; MySQL real **não conectado**; Playwright interceptou `http://localhost:8800/**` com fixtures 100% fictícias (gato e cachorro, responsáveis e ids fictícios). Viewport primário 1366×768; observação adicional em 1920×1080. Nenhum screenshot salvo no repositório.

### Resultados da caracterização

- **QLT-002 — confirmado no navegador:** o clique na confirmação dispara o DELETE (enviado e respondido) **e** a submissão do form sem `preventDefault` → navegação para `/?submit=` (reload). Em 200/404/500 o resultado final dependeu do reload acidental; nenhum toast observado; o app não chama `getPets()` nem fecha o modal. **Mantém P1.**
- **QLT-003 — NÃO reproduzido:** o submit chamou `handleUpdate`, o PUT saiu **com o valor editado**, toast apareceu, modal fechou, lista atualizada. O mecanismo previsto por leitura não reproduziu (RHF v7 ressincroniza via `ref` a cada re-render). **Reclassificado P1 → P2** (fragilidade; não `FIXED`).
- **QLT-006 — evidências mínimas:** aviso `App element is not defined` a cada abertura; "X" (`div`) não focável (TAB pula); trap entre focáveis funciona; **ESC fecha e devolve o foco**. Não vira próximo item automaticamente.
- **Incidentais:** aviso React de `key` no `principal` (QLT-014 confirmado); sort por campo inexistente preservou a ordem com 2 itens; aviso "instance already open" é artefato de dev (StrictMode).
- **Único próximo item escolhido: QLT-002** — plano completo no `QUALITY-REVIEW.md` §7.

### Documentos alterados nesta rodada

`QUALITY-REVIEW.md` (cabeçalho, tabela, QLT-002/003/006/010, §7, nova §10) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`. **Nenhum código, CSS, manifesto, lockfile ou `.next` do workspace real foi alterado.**

### Limpeza

Servidor de dev da cópia (iniciado por esta sessão) encerrado. Cópia temporária removida após confirmação do caminho (fora do repositório). Verificação final: suíte 43/43, stage vazio, hashes idênticos ao pré-flight.

---

## SESSÃO 8 — Implementação do QLT-001 — affectedRows (SOFTPET-009)

Rodada de **implementação controlada** — somente o finding QLT-001. **Execução manual** — as skills do fluxo permanecem indisponíveis; nenhuma foi executada (sem busca extensa, ambiente igual). O trabalho das sessões anteriores foi tratado como estado inicial e preservado.

### Estado no início desta rodada (reconferido)

Branch `main`, HEAD `b9fc914`, stage vazio, `git diff --check` código de saída 0, Node v22.14.0 / npm 11.18.0, SHA-256 dos lockfiles idênticos aos das sessões anteriores (raiz `D451A675…`, `api/` `4F96CECD…`). Baseline da suíte executado antes de qualquer alteração: **37/37, código de saída 0** — igual ao fim da sessão 7.

### Implementado (somente o autorizado)

- **`api/controllers/pet.js`** — apenas `updatePets` e `deletePets`: callbacks passaram a receber `(err, result)`; `err` mantém prioridade absoluta via `erroOperacao` (SEC-002 preservada); `result.affectedRows === 0` → **HTTP 404 + `{"error":"Pet não encontrado."}`** com retorno imediato; sucesso inalterado (200 + mensagens originais). Critério é `affectedRows`; `changedRows` não decide existência. `getPets`, `addPets`, `erroOperacao`, queries e estrutura intocados. Nenhum helper novo, nenhuma segunda consulta, nenhuma validação de `id` inventada.
- **`api/test/petErrors.test.js`** — 6 testes novos: `affectedRows` 0 → 404 + JSON controlado + resposta única (update e delete); prioridade do erro (err + `affectedRows: 0` → 500, não 404 — update e delete); ids malformados (`abc`, `-1`, `0`) repassados como valor ao banco sem validação própria (documentação de comportamento). Títulos dos casos de sucesso tornados explícitos (`affectedRows 1`).
- **Frontend não alterado** — cai no `.catch` para não-2xx e mantém as mensagens genéricas da sessão 6. Tratamento visual específico de "Pet não encontrado" pode ser avaliado depois.

### Testes executados

| Execução | Resultado | Código de saída |
|---|---|---|
| Baseline (37 testes, antes de qualquer alteração) | 37/37 | 0 |
| **Antes** da correção (testes novos escritos — 43 testes) | **39 passaram, 4 falharam, 0 cancelados.** As 4 falhas são exatamente o QLT-001: `expected: 404, actual: 200` — sucesso mentiroso com `affectedRows: 0` nos dois controllers (incluindo os casos de id malformado). Os 2 testes de prioridade do erro já passavam porque a SEC-002 está implementada. Sem falhas de harness | **1** |
| **Depois** da correção | **43/43**, 0 cancelados | **0** |

### Documentos atualizados de forma localizada

`QUALITY-REVIEW.md` (QLT-001 → `FIXED` com escopo; §7 próximo item; §8/§9 ajustados) · `SECURITY-AUDIT.md` (apenas a linha de encaminhamento do antigo SEC-003) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`. Plano comercial não alterado — esta tarefa não muda a arquitetura.

### O que continua pendente

- Integração MySQL/HTTP das três correções (`affectedRows` em banco real, `NO_BACKSLASH_ESCAPES`, HTTP ponta a ponta).
- Validação de formato/tipo do `id` — etapa própria, sem regra inventada nesta rodada.
- **Próximo item recomendado:** etapa de baseline isolado (config de lint, build, Playwright) — destrava QLT-002 e QLT-003, os P1 que dependem de teste de interação. SEC-007 segue candidata independente (mexe no lockfile).

---

## SESSÃO 7 — QUALITY-REVIEW FASE 1 (SOFTPET-008)

Rodada de **revisão de qualidade** — analisar, documentar, priorizar. **Nada foi implementado.** Nenhum arquivo de código, CSS, manifesto, lockfile, `.gitignore` ou configuração foi alterado. Nenhuma dependência instalada. Nenhum build, lint com efeito, dev, Playwright ou conexão com o banco executado. Nenhum stage, commit ou push.

**Execução manual** — a skill `quality-review` permanece indisponível (checagem rápida nesta sessão). Nenhuma skill foi executada.

### Baseline confirmado nesta sessão

- **Git:** branch `main`, HEAD `b9fc914`, stage vazio, `git diff --check` código de saída 0, Node v22.14.0 / npm 11.18.0 — igual ao fim da sessão 6.
- **Testes:** `npm --prefix ./api test` → **37/37 passaram, 0 cancelados, código de saída 0** — baseline confirmado antes de qualquer análise.
- **Lint não executado:** o repositório não tem arquivo de configuração ESLint; `next lint` perguntaria interativamente e criaria config (alteraria o workspace). Versões conferidas: `eslint-config-next` 13.5.11, `next` 14.2.35 instalados. **Build não executado** — `.next` versionado com alterações preexistentes; pendência para etapa de baseline isolado.

### Documento criado

**`QUALITY-REVIEW.md`** — 16 findings QLT-001 a QLT-016: **P0: 0 · P1: 3 · P2: 6 · P3: 6 · P4: 1**. Nenhum SECURITY_HANDOFF novo (os existentes permanecem na auditoria; SEC-003 foi formalmente encaminhado à qualidade e virou QLT-001).

### Próximo item (não implementado)

**QLT-001 — conferir `affectedRows` em `update`/`delete`** (o antigo SEC-003). Escolhido após comparação com os demais P1: é o único totalmente confirmável por leitura e testável com o harness existente; os outros dois P1 (fluxo de exclusão, `ModalEdit`) têm mecanismo confirmado mas exigem teste de interação antes de correção.

### Divergências documentais registradas

- `docs/PLANO-COMERCIAL-LOCAL.md` §2.5 afirma que `Form.js` é importado por `Bloco.js` — o código **não** confirma (grep: nenhum importador). O código vence.
- `PROJETO.md` §4.1 trata o sort do cliente por campo inexistente como inócuo — a leitura sugere que o comparador (nunca retorna 0) provavelmente inverte a ordem; efeito visual exige teste de navegador (QLT-014).

### Documentos alterados nesta rodada

`QUALITY-REVIEW.md` (novo) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`.

---

## SESSÃO 6 — Implementação da SEC-002 com testes (SOFTPET-007)

Rodada de **implementação controlada**. **Execução manual** — as skills do fluxo permanecem indisponíveis nesta sessão; nenhuma foi executada. O trabalho da sessão 5 (SEC-001) faz parte do estado inicial e foi **preservado**.

### Estado no início desta rodada (reconferido)

Branch `main`, HEAD `b9fc914`, stage vazio, `git diff --check` código de saída 0, Node v22.14.0 / npm 11.18.0, SHA-256 dos dois lockfiles idênticos aos do fim da sessão 5. Suíte existente executada **antes** de alterar o contrato: **22/22, código de saída 0** — igual ao relatório anterior. Observação: o terminal do usuário registrou um `npm run dev` com código de saída 1 — atividade externa, não atribuída a esta sessão.

### Alterações em código (somente as autorizadas)

| Arquivo | Alteração |
|---|---|
| `api/controllers/pet.js` | Função privada `erroOperacao(res)` — HTTP 500 + JSON genérico fixo — usada nos callbacks de banco dos **quatro** controllers, com `return` encerrando o caminho. Sem logs do erro cru. Consultas, valores, callback, status e corpos de sucesso preservados; SEC-001 preservada |
| `api/test/getPets.test.js` | Restauração explícita do mock (`after()`); casos novos `search = "0"` e `"false"` (textos → busca parametrizada); teste de erro atualizado deliberadamente para 500 + JSON fixo |
| `api/test/petErrors.test.js` | **Novo** — 13 testes dos quatro controllers com banco simulado: 500, corpo genérico exato, sem vazamento de propriedades do erro (objeto e instância de `Error` com marcadores), resposta única, sucesso preservado, argumentos esperados |
| `api/package.json` | Somente o script `test`, agora com os dois arquivos |
| Frontend (5) | `page.js`, `principal.js`, `ModalCad.js`, `ModalEdit.js`, `Bloco.js` — os cinco tratamentos de erro passaram a chamar `toast.error` com mensagem textual fixa (válida para 500 e para falha de rede sem `error.response`). Blocos de sucesso e `setOnEdit(null)` preservados. `Form.js` fora desta rodada |

### Testes executados

| Execução | Resultado | Código de saída |
|---|---|---|
| Estado inicial (22 testes, antes de alterar o contrato) | 22/22 | 0 |
| **Antes** da correção (37 testes, controllers ainda respondendo o erro cru) | 28 passaram, **9 falharam** (exatamente os testes de erro da SEC-002 — `null !== 500`), 0 cancelados | 1 |
| **Depois** da correção | **37/37**, 0 cancelados | 0 |

**Separação da verificação:** backend por **testes unitários com banco simulado**; frontend por **leitura do diff** — sem teste de navegador nem validação visual executados. Integração HTTP, navegador e banco real continuam pendentes. As limitações da SEC-001 (incluindo `NO_BACKSLASH_ESCAPES`) permanecem.

### Documentos atualizados de forma localizada

`SECURITY-AUDIT.md` (SEC-002 → `FIXED` com escopo, §4, §7.3, novo §7.7 com as evidências, §10) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`. O histórico da execução SOFTPET-006 foi mantido como ocorreu.

### O que continua pendente

- Verificação de integração com MySQL (`NO_BACKSLASH_ESCAPES`, §9.5) — vale para as duas correções.
- Testes de id inexistente (interagem com a SEC-003 — `affectedRows` ficou fora desta rodada, conforme escopo).
- SEC-004–SEC-007 inalteradas; SEC-007 segue a candidata seguinte (mexe no lockfile; etapa própria). A direção comercial local e o prontuário continuam no planejamento existente.

---

## SESSÃO 5 — Implementação da SEC-001 (SOFTPET-006)

Rodada de **implementação controlada** — a primeira com alteração de código neste repositório. **Execução manual** — as skills `project-bootstrap`, `security-audit`, `quality-review` e `safe-implementation` permanecem indisponíveis nesta sessão; nenhuma foi executada.

### Alterações em código (somente as autorizadas)

| Arquivo | Alteração |
|---|---|
| `api/controllers/pet.js` | **Somente `getPets`**: SQL fixa com placeholders `LIKE ?`, valor do usuário viaja separado (`['%termo%','%termo%']`), tipos não textuais presentes rejeitados com 400 antes do banco; `undefined` (ausência) e string vazia preservam a lista completa. `addPets`/`updatePets`/`deletePets` intocados |
| `api/test/getPets.test.js` | **Novo** — 22 testes unitários do controller real com banco simulado (`node:test` + `mock.module` de ESM, nada instalado) |
| `api/package.json` | **Somente o script `test`** adicionado: `node --test --experimental-test-module-mocks test/getPets.test.js` |

### Verificação executada

- **Antes da correção** (controller original): `npm --prefix ./api test` → 22 testes, **5 passaram, 14 falharam, 3 cancelados, código de saída 1** — as falhas capturam exatamente a interpolação do termo no SQL, a ausência de valores separados e a aceitação de tipos não textuais. Evidência de que os testes detectam a falha.
- **Depois da correção**: `npm --prefix ./api test` → **22/22 passaram, código de saída 0**.
- **Lockfiles sem alteração** — SHA-256 idênticos no início e no fim: raiz `D451A675…`, `api/` `4F96CECD…` (hashs completos em SECURITY-AUDIT §7.6). Nenhuma dependência instalada ou atualizada.
- Sem build, sem lint, sem dev, sem conexão com o banco, sem stage/commit/push.

### Documentos atualizados de forma localizada

`SECURITY-AUDIT.md` (SEC-001 → `FIXED` com escopo, §4, §7.3, novo §7.6 com as evidências, §9, §10) · `README.md` e `docs/ARQUITETURA.md` (apenas as afirmações sobre o lockfile da raiz: HEAD sem lockfile versionado; lockfile local presente, não rastreado, origem não confirmada) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`.

### O que continua pendente

- **Verificação de integração com MySQL** — em particular o `NO_BACKSLASH_ESCAPES` (§9.5), que define como o driver formata a string final. A SEC-001 é `FIXED` por testes unitários, **não** `VERIFIED` ponta a ponta.
- **SEC-007** — decisão de atualizar `body-parser` para ≥ 1.20.9 (mexe no lockfile; etapa própria).
- Triagem detalhada da árvore da raiz (§7.4); demais achados inalterados.

---

## SESSÃO 4 — Planejamento da versão comercial local com prontuário (SOFTPET-005)

Rodada de **planejamento**. **Nada foi implementado.** Nenhum arquivo de código, CSS, manifesto, lockfile, `.gitignore` ou arquivo de ambiente foi alterado. Nenhuma dependência instalada ou atualizada. Nenhum build, dev, teste ou `npm audit` executado. Nenhuma conexão com o banco. Nenhuma migration criada ou executada. Nenhum stage, commit ou push.

**Execução manual** — as skills `project-bootstrap`, `security-audit`, `quality-review` e `safe-implementation` **não estão instaladas** (reconfirmado: `~/.copilot/skills/` com 37 diretórios, nenhuma das quatro; `~/.claude/skills/` e os caminhos do workspace inexistentes). Nenhuma skill foi executada.

### Documento criado

**`docs/PLANO-COMERCIAL-LOCAL.md`** — plano central da evolução. Separa estado verificado, requisitos confirmados, hipóteses, decisões propostas, pendências e critérios de aceitação.

### Estado real do Git no início desta rodada

Branch `main`, HEAD `b9fc914` — **inalterados**. Stage **vazio**. `git diff --check` com **código de saída 0**.

| Item | Situação |
|---|---|
| `README.md` | modificado — 113+/31−, **trabalho documental anterior**, preservado |
| `AGENTS.md`, `PROJETO.md`, `SECURITY-AUDIT.md`, `docs/`, `memory-bank/`, `package-lock.json` | não rastreados |
| `.next/` | **60 rastreados modificados + 33 deletados + 28 novos** — a sessão anterior registrara 92 modificados |
| `node_modules/` da raiz | 410 pacotes · `api/node_modules/` — 102 diretórios no nível superior |

**Divergência em relação ao relatório anterior:** o conjunto de `.next/` mudou entre as duas leituras. **Origem não confirmada** — não atribuída a agente, usuário nem comando, porque a ação não foi observada. `git status` sozinho não cobre não rastreados; a leitura incluiu `git ls-files --others --exclude-standard`.

### O que foi verificado por leitura nesta rodada

- Stack real e fluxo entre camadas, conferidos arquivo por arquivo.
- **Busca refeita** por `mongoose`, `mongodb`, `snappy`, `zstd`, `aws4`, `gcp-metadata` e `credential-providers` em `src/**` — **zero ocorrências**.
- **`nodemon` está em `dependencies`** da API e o **único script `start`** é `nodemon index.js` — a redação que o tratava como fora do runtime de produção estava errada.
- **`next/font/google`** em `layout.js` e `page.js` — download no build, auto-hospedado em runtime.
- **19 SVGs** em `src/assets/icone/` sem atribuição de origem ou licença.
- **6 ocorrências** de `localhost:8800` em 6 arquivos — confirmadas.
- As duas GHSA conferidas contra a página do advisory: **GHSA-qw6h-vgh9-j6wx pertence ao `express`** (CVE-2024-43796, `< 4.20.0`, patch `4.20.0`, Low 2.3) e **GHSA-27r3-jxmh-p828 pertence ao `body-parser`** (CVE-2026-111181, `< 1.20.9`, patch `1.20.9`, High 7.5). A atribuição no relatório já estava correta; a conferência fica registrada.

### Ajustes documentais aplicados a `SECURITY-AUDIT.md`

Somente os delimitados. **Nenhum ID alterado. Nenhum achado marcado como corrigido.**

| Ajuste | Onde |
|---|---|
| **Origem não confirmada** para lockfile, `node_modules` e `.next` — removidas atribuições a `npm install`, build ou agente | §3.4, §7.4, §7.5 |
| **`nodemon` corrigido**: está em `dependencies` e o `start` da API o executa — a árvore está no caminho de partida. O que mantém a condição ausente é outro fato: o glob nunca vem de requisição | §6.7.1 |
| **GHSA-qw6h-vgh9-j6wx conferido** contra a página do advisory — atribuição ao `express` confirmada, com CVE, faixa, patch e CVSS | §6.7.1 |
| **Plano de testes ESM da SEC-001 corrigido**: repetir `import()` do mesmo especificador **não** cria módulo novo. Adotado um único mock antes do primeiro `import()`, objeto estável, estado reinicializado entre casos, sem concorrência | §9.7 |
| **`undefined` preservado**: ausência do parâmetro **não** vira erro — continua produzindo a lista completa. A rejeição com 400 vale só para o que existe mas não é texto | §9.4 |
| **Pacotes × advisories × explorações** diferenciados: 11 pacotes na API correspondem a **29 advisories**; 19 pacotes na raiz, só `next` tem 25; **zero** explorações demonstradas. Divergência menor de contagem registrada | §7.1, §7.4 |
| **Afirmações sobre rede ajustadas** — o que o `npm audit` envia é o que a documentação descreve; **não houve observação direta do tráfego** | §2.1 |
| **Triagem detalhada da árvore da raiz mantida como pendência** | §7.4 |
| **Contexto da SEC-006 atualizado** sem alterar a descrição do estado; **N/A-3** marcada como constatação sobre o legado | SEC-006, §5 |
| **Plano MySQL da SEC-001 preservado** como etapa de estabilização, com quando executar antes e quando entrar no destino | §10 |

### Documentos alterados nesta rodada

`docs/PLANO-COMERCIAL-LOCAL.md` (novo) · `SECURITY-AUDIT.md` (ajustes delimitados) · `memory-bank/CURRENT-STATE.md` · `memory-bank/DECISIONS.md` · `memory-bank/CHANGELOG.md`

**Sem alteração:** `README.md` (mantém as 113+/31− anteriores), `AGENTS.md`, `PROJETO.md`, `docs/ARQUITETURA.md`. **Observação:** `README.md` e `docs/ARQUITETURA.md` ainda dizem que a raiz **não** possui lockfile — estão desatualizados, mas **não estavam na lista de arquivos autorizados para edição nesta rodada**. Registrado como pendência.

### Banco e arquitetura recomendados (propostas, não decisões)

**PostgreSQL** como banco do produto — uma única implementação de persistência no MVP, com o MySQL atual permanecendo só como base de legado. **Next.js/React e Express reaproveitados**; sem Electron, Tauri, Docker, WSL ou microserviços, porque o acesso por navegador atende ao objetivo. Estações acessam **a aplicação e a API**, nunca o banco diretamente. Funcionar sem internet **não** significa funcionar sem o computador principal — e para as estações depende também da rede local.

**Ponto que decide a arquitetura:** a URL da API fixa em 6 arquivos precisa virar configuração de tempo de execução. Sem isso, uma estação resolve `localhost` para si mesma e a API nunca é alcançada.

### Primeira implementação recomendada — SOFTPET-006

**Implementar a SEC-001** conforme `SECURITY-AUDIT.md` §9 — objetivo único, mudança localizada em `api/controllers/pet.js`, teste novo em `api/test/getPets.test.js`, script em `api/package.json` só se aprovado. É o único achado sem decisão de produto pendente e cria o primeiro teste automatizado do projeto.

### Pendências que afetam decisão relevante

**V1** DDL real e contagem real da tabela `pets` · **V2** resposta do responsável técnico sobre assinatura (muda o modelo de dados) · **V3** confirmar as hipóteses H1–H6 · **V4** licenças de dependências e recursos visuais · **V5** triagem por advisory da árvore da raiz · **V6** contrato de resposta de erro da API (SEC-002).

**Nenhuma delas impediu o planejamento desta rodada.**

### Próximo passo

**Revisar este plano. Depois disso, SOFTPET-006.**

---

## Commit e estado local

| Item | Valor |
|---|---|
| Raiz do repositório | `D:/projetos/PetShop` |
| Branch | `main` |
| HEAD local | `b9fc914fe0873fef78a7b86a972202c2de34bce6` |
| Commit de referência | `b9fc914fe0873fef78a7b86a972202c2de34bce6` |
| Divergência HEAD × referência | **Nenhuma** |
| Working tree no início da sessão | Limpo — `git status --short --untracked-files=all` sem saída |
| Stage no início da sessão | Vazio — `git diff --cached --name-status` sem saída |

---

## Etapa atual

**FASE 2 (documentação) fechada + FASE 1 de auditoria de segurança realizada.** Ambas de forma **manual**: a skill `project-bootstrap` e a skill `security-audit` **não estão instaladas neste ambiente** (verificado em `~/.copilot/skills/` e demais locais configurados). O mesmo vale para `quality-review` e `safe-implementation`. A disponibilidade das skills é uma observação do ambiente e da sessão, não uma característica do repositório.

Documentos produzidos na FASE 2: `README.md` (atualizado), `AGENTS.md`, `PROJETO.md`, `docs/ARQUITETURA.md`, `memory-bank/CURRENT-STATE.md`, `memory-bank/DECISIONS.md`, `memory-bank/CHANGELOG.md`.

Documento produzido na FASE 1: **`SECURITY-AUDIT.md`** — relatório da auditoria.

---

## Fechamento documental (sessão 2026-11-04)

Correções **documentais** — nenhuma alterou código, CSS, manifests, lockfiles ou `.gitignore`:

| Ajuste | Onde |
|---|---|
| Espaços finais removidos nas duas linhas apontadas pelo Git; `git diff --check` agora retorna **0** | `README.md` §Contato |
| Versões `^x.y.z` passaram a ser descritas como **faixas declaradas**, não como versão instalada comprovada | `README.md`, `docs/ARQUITETURA.md` |
| Versões **resolvidas** no lockfile identificadas em seção separada, apenas para a API | `README.md`, `docs/ARQUITETURA.md` |
| Raiz sem lockfile e API com lockfile tratadas como **situações distintas** | `README.md`, `docs/ARQUITETURA.md` |
| Motivo da não execução da auditoria de dependências corrigido — não se justifica apenas pela ausência de `node_modules` | este documento |
| Disponibilidade das skills explicitada como observação do ambiente e da sessão | `AGENTS.md` |
| Link para `SECURITY-AUDIT.md` acrescentado | `README.md` |

**Conferência de dados sensíveis:** os sete documentos mais `SECURITY-AUDIT.md` foram lidos integralmente e varridos por e-mails, telefones, credenciais atribuídas e connection strings. Nenhum valor de credencial foi copiado para a documentação — apenas os descritores host e nome do database. O único e-mail presente é o de contato público do autor, já existente no `README.md`. Nenhum dado pessoal de terceiro foi copiado. **O histórico do repositório não foi auditado** — a inspeção alcança apenas os arquivos de documentação atuais.

---

## Auditoria de segurança — resumo

**Análise realizada**, com limitações. **Nenhuma correção foi implementada.**

Relatório completo: **`SECURITY-AUDIT.md`**.

| Severidade | Qtd | IDs |
|---|---|---|
| ALTA | 2 | SEC-001, SEC-007 |
| MÉDIA | 4 | SEC-002, SEC-004, SEC-005, SEC-006 |
| BAIXA | 1 | SEC-003 |
| N/A | 3 | N/A-1 a N/A-3 |

A auditoria de dependências **foi executada** para a API (`npm --prefix ./api audit --package-lock-only --ignore-scripts --json`, código de saída 1, 11 pacotes reportados). A raiz **não pôde ser auditada** por não possuir lockfile — situação distinta da API.

---

## Revisão da auditoria (2026-11-04, sessão 3)

Execução **manual** — as skills `security-audit` e `safe-implementation` seguem **não instaladas** neste ambiente (reconfirmado nesta sessão: `~/.copilot/skills/` com 36 skills, nenhuma das duas; `~/.claude/skills/` e os caminhos do workspace inexistentes). A skill não foi executada.

**Nenhum código foi alterado.** Nenhum achado passou a `FIXED` ou `VERIFIED` — trabalho documental não autoriza essas marcas.

### Correções factuais aplicadas a `SECURITY-AUDIT.md`

| # | Correção | Onde no relatório |
|---|---|---|
| A1 | **O `npm audit` usa rede.** A redação anterior dizia que "nada foi enviado a ferramentas externas". O comando **consulta o serviço de advisories do registro** e envia nomes e versões das dependências. `--package-lock-only` e `--ignore-scripts` **não** significam offline. | §2.1 |
| A2 | **Análise por advisory, não por biblioteca.** A estrutura anterior agrupava por pacote ("em caminho ativo" × "sem caminho ativo"), o que misturava presença da biblioteca com presença da **condição de disparo**. Reescrito advisory por advisory, com condição marcada como presente/parcial/ausente. | SEC-007 §6.7 |
| A3 | **Severidades rederivadas** (ver abaixo), redação da SEC-002 corrigida para "pode conter" com tabela por tipo de erro, SEC-003 reclassificada e encaminhada, N/A delimitados, priorização diferenciada em vez de "todos dependem de decisão de produto". | §4, SEC-002, SEC-003, §5, §10 |
| A4 | **Visibilidade do repositório confirmada: pública.** Apurado nesta revisão. As três afirmações foram mantidas separadas: publicação no código (confirmada), validade atual da credencial (não verificada), acesso externo ao banco (não verificado). | SEC-005 |

### Mudanças materiais de conclusão

| Achado | Antes | Depois | Base |
|---|---|---|---|
| **SEC-007** | MÉDIA | **ALTA** | **Um único advisory tem a condição de disparo completa**: GHSA-27r3-jxmh-p828 (`body-parser` < 1.20.9, **High 7.5**). O aviso afirma que *uma única requisição* derruba qualquer aplicação com opções padrão — e o projeto monta `express.json()` exatamente assim, sem `inflate: false`. Não exige autenticação nem rota correspondente, porque o parsing roda antes do roteamento. Os demais advisories têm condição ausente ou mitigada pelo padrão. |
| **SEC-003** | MÉDIA, `[!] VULNERABLE` | **BAIXA**, `[!] DEFEITO CONFIRMADO`, **encaminhado à `quality-review`** | Defeito real e confirmado, mas o impacto é **operacional, não adversarial** — ninguém ganha nada com ele, quem é enganado é o operador. ID e histórico preservados. |
| **SEC-005** | MÉDIA, visibilidade a confirmar | MÉDIA, **visibilidade confirmada** e **rotação da credencial agora acionável** | Repositório público. Severidade não subiu porque o que a credencial protege e a alcançabilidade externa do banco seguem não verificados. |

### Plano disponível

**`SECURITY-AUDIT.md` §9 — plano de implementação da SEC-001.** Cobre causa, mudança proposta, arquivos, mudança de contrato para tipos não textuais (HTTP 400 antes do banco, sem refletir o valor), critérios de aceitação, matriz de testes com comando previsto, limites de verificação, relação com outros achados e como revisar/desfazer apenas essa mudança.

Ponto técnico registrado no plano: no driver `mysql`, os placeholders `?` são **escape no cliente**, não *prepared statement* no servidor, e dependem do modo SQL `NO_BACKSLASH_ESCAPES` estar **desabilitado**. A configuração real do servidor **não foi verificada** — fica como pendência de etapa de integração autorizada.

### Prioridade recomendada (diferenciada — não é mais "tudo depende de decisão de produto")

| Achado | O que falta |
|---|---|
| **SEC-001** (ALTA) | **Só aprovação do plano.** Nenhuma decisão de produto pendente — por isso continua sendo o alvo. |
| **SEC-007** (ALTA) | Decisão de atualizar dependência (mexe no lockfile). Etapa própria. |
| **SEC-005** (MÉDIA) | **Rotação acionável agora.** Não depende de decisão de produto. |
| SEC-002 (MÉDIA) | Decidir o contrato de resposta de erro (altera o que o frontend exibe). |
| SEC-004 (MÉDIA) | Definir limites de tamanho e formato. |
| SEC-006 (MÉDIA) | **Este sim** depende de decisão de produto: contexto de uso e exposição real. |
| SEC-003 (BAIXA) | Encaminhado à `quality-review`. |

### Verificações executadas nesta revisão

- Preflight completo do Git (`rev-parse`, `branch`, `status`, `diff`, `diff --cached`, `diff --stat`, `diff --check`) — estado **idêntico** ao esperado, sem divergência.
- Reexecução do `npm --prefix ./api audit --package-lock-only --ignore-scripts --json` — **código de saída 1**, 11 pacotes, resultado **inalterado**. Saída gravada em temporário **fora do repositório** e removida ao final.
- **`npm audit --package-lock-only --ignore-scripts --json` na RAIZ — executada, código de saída 1: 19 itens (1 critical, 5 high, 13 moderate) em 543 pacotes.** Só foi possível porque a raiz **passou a ter lockfile durante esta sessão** (ver divergência abaixo).
- Confirmação do parser de query e das versões **no código instalado** (`express/lib/middleware/query.js`, `express/lib/router/layer.js`, `sqlstring/lib/SqlString.js`, `mysql/lib/protocol/...`).
- Consulta à documentação oficial do npm, ao readme do driver `mysql` na versão resolvida e a 8 advisories GHSA.
- Confirmação da visibilidade do repositório pela página pública do GitHub.

### Divergência de workspace detectada no fim da revisão

O preflight estava limpo. Ao final, `git diff --check` segue com **código de saída 0**, o stage segue **vazio** e **código-fonte, manifests e lockfiles estão intactos** (`git diff --numstat` vazio em `api/`, `src/`, `package.json`, `api/package.json`, `api/package-lock.json`, `jsconfig.json`, `next.config.mjs`, `.gitignore`). Porém:

| Item | Situação | Origem |
|---|---|---|
| `package-lock.json` (raiz) + `node_modules/` (410 pacotes) | **novos**, às **11:42** | **ação externa — não foi esta sessão** |
| `.next/` | **92 arquivos rastreados agora aparecem como modificados**, às **11:43** | **ação externa (build/dev) — não foi esta sessão** |

Um `npm install` completo na raiz e um build rodaram **durante** a sessão, por fora. O preflight não os viu porque o cache de *stat* do índice ainda não tinha sido revalidado. Esta sessão não escreveu em nenhum deles — os únicos arquivos alterados por esta sessão são `SECURITY-AUDIT.md`, `memory-bank/CURRENT-STATE.md` e `memory-bank/CHANGELOG.md`.

**Consequência:** a limitação "raiz sem lockfile" **caiu**, e a auditoria da raiz foi executada. Ela traz **`next` (direto, critical, 25 advisories)** e **`zod` (direto, high)** — a análise por advisory dessa árvore **ainda não foi feita** e é pré-requisito para concluir sobre o frontend.

### Pendências reais de validação

Nenhuma destas foi executada: teste HTTP real, teste de integração com MySQL, verificação do `NO_BACKSLASH_ESCAPES`, consulta do DDL real da tabela `pets`, Playwright. Os testes previstos no §9.7 **não foram executados**.

**Novo, criado por esta revisão:** análise por advisory da árvore da raiz (19 itens), agora que a execução é possível.

### Único próximo item

**Revisar o plano da SEC-001 e, após aprovação, implementá-lo.**

---

## Verificações realizadas

Leituras de arquivos, comandos de consulta do Git (`rev-parse`, `branch`, `status`, `diff`, `log`, `ls-files`) e auditoria de dependências da API via lockfile (somente leitura, sem `fix`). Nenhum comando que altere código, configuração, lockfile ou banco foi executado.

| Verificação | Executada? | Resultado |
|---|---|---|
| `git status` / `git diff` | Sim | No início: `README.md` modificado e seis documentos novos não rastreados (trabalho da sessão documental anterior). Stage vazio. |
| `git diff --check` | Sim | No início: **código de saída 2**, duas ocorrências de espaço final no `README.md`. Após a correção: **código de saída 0**. |
| `npm run lint` | **NÃO** | Raiz sem lockfile e sem `node_modules` |
| `npm run build` | **NÃO** | Idem. Não há evidência de que o build atual passe ou falhe |
| `npm test` | **NÃO** | Nenhum script de teste existe no projeto |
| `npm audit` (raiz) | **NÃO** | Raiz sem lockfile — a árvore resolvida não é conhecida |
| `npm audit` (API) | **SIM** | Executado via lockfile, sem `fix` e sem scripts. Código de saída 1 — vulnerabilidades encontradas. Ver `SECURITY-AUDIT.md` §7 |
| Playwright / navegador | **NÃO** | Aplicação não foi iniciada |

**Nenhuma verificação de build, lint ou teste foi executada.** A única verificação automatizada executada foi a auditoria de dependências da API.

---

## Verificações pendentes

- Gerar lockfile na raiz e instalar dependências — necessário antes de qualquer lint, build ou audit.
- Definir como o database `petscrud` é criado — não há DDL, migration nem seed no repositório.
- Confirmar o schema real da tabela `pets` (tipos, chaves, constraints).
- Executar lint e build para verificar o efeito real de `styled-components` sem plugin e dos componentes sem exportação padrão sob `src/pages`.
- Executar a aplicação para validar os fluxos de cadastro, busca, edição, exclusão e contato.

> **Nota sobre a análise externa:** as verificações isoladas dos controllers relatadas em análise anterior utilizaram **banco e resposta simulados**. Não foram testes HTTP/MySQL reais e **não foram executados nesta sessão**. Portanto, nenhum comportamento de runtime pode ser considerado verificado.

---

## Principais achados ainda abertos

### Vulnerabilidades confirmadas (ver `SECURITY-AUDIT.md`)

| ID | Achado | Severidade | Estado |
|---|---|---|---|
| SEC-001 | Busca com valor interpolado diretamente na string SQL | **ALTA** | `[!] VULNERABLE` — **plano pronto no §9, não implementado** |
| SEC-002 | Erros do banco devolvidos com HTTP 200 e objeto cru do driver | MÉDIA | `[!] VULNERABLE` |
| SEC-003 | `updatePets` e `deletePets` sem conferência do resultado da consulta | **BAIXA** | `[!] DEFEITO CONFIRMADO` — **encaminhado à `quality-review`** |
| SEC-004 | Ausência de validação de entrada nos controllers | MÉDIA | `[!] VULNERABLE` |
| SEC-005 | Conexão do banco com valores fixos no código — **repositório público confirmado** | MÉDIA | `[!] VULNERABLE` — **rotação acionável** |
| SEC-006 | Ausência de autenticação/autorização em todas as rotas | MÉDIA | `[!] VULNERABLE` |
| SEC-007 | Dependências com aviso oficial cuja **condição de disparo está presente** | **ALTA** | `[!] VULNERABLE` |

Nenhuma vulnerabilidade foi corrigida. Nenhuma foi marcada como `FIXED` ou `VERIFIED`.

### Situações de infraestrutura e qualidade (não são vulnerabilidades)

| # | Achado | Local |
|---|---|---|
| 1 | URL da API fixa, repetida em 6 arquivos do frontend | `src/app`, `src/pages` |
| 2 | Exclusão combina botão `type="submit"` com requisição no `onClick` | `ModalDel.js`, `buttons.js` |
| 3 | Exclusão não atualiza a lista nem fecha o modal | `bloco-info/Bloco.js` |
| 4 | Edição sobrescreve os `onChange` do `register()` | `modal/ModalEdit.js` |
| 5 | Mensagens de validação dos formulários não aparecem na interface | todos os formulários |
| 6 | Lista de cards renderizada sem `key` | `principal/principal.js` |
| 7 | `Form.js`, `SearchFilter.js` e `buttons.js` sem exportação padrão, sob `src/pages` | `src/pages/componentes/` |
| 8 | Schema do banco ausente entre os arquivos próprios do projeto | — |
| 9 | Ausência de testes próprios e de pipeline | — |
| 10 | Raiz sem lockfile; `.next/` e `api/node_modules/` versionados | `.gitignore` |
| 11 | Sem estados de carregamento, erro e ausência de resultados; sem media queries | `src/` |
| 12 | `console.log` residual; typo `pausaOnFocusLoss`; `page.module.css` vazio; fonte importada duas vezes | `src/` |
| 13 | README descrevia MongoDB em divergência com a API | `README.md` — **corrigido na sessão anterior** |
| 14 | Espaços finais nas linhas de contato apontadas pelo Git | `README.md` — **corrigidos nesta sessão** |

---

## Único próximo passo

**Planejar a correção da SEC-001 — parametrizar a busca SQL em `api/controllers/pet.js`.**

É o único achado com falha confirmada e trivialmente acionável por entrada comum do usuário, e a correção é mínima e local: usar o placeholder `?` que os outros três controllers do mesmo arquivo já empregam. Deve ter sua própria verificação.

As demais vulnerabilidades exigem decisão de produto antes da implementação — contexto de uso, exposição real e constraints do banco — e por isso não são o próximo passo imediato.
