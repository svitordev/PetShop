# CHANGELOG.md

> Apenas o trabalho efetivamente realizado, com a data real da sessão. Nenhum histórico anterior foi reconstruído.

---

## 2026-11-05 (sessão 13) — SEC-005 — configuração de banco por ambiente (SOFTPET-015)

Rodada de **implementação controlada** — exclusivamente a SEC-005. **Execução manual** — skills indisponíveis; nenhuma executada. Baseline: `70e5730` (HEAD == origin/main), suíte 43/43, stage vazio.

### Executado no workspace real

- `api/config/database.js` (novo): `readDatabaseConfig(env)` — valida e retorna `{ host, user, password, database }` de `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`; ausente ou `""` → erro com **apenas nomes**; sem coerções, sem fallback.
- `api/db.js`: `mysql.createConnection(readDatabaseConfig(process.env))` — literais removidos; sem `db.connect()`.
- `api/.env.example` (novo): placeholders `CHANGE_ME`.
- `.gitignore`: `.env`, `.env.*`, `!.env.example` (alcance confirmado por `git check-ignore`).
- `api/package.json`: script `test` inclui `test/databaseConfig.test.js`. Sem dependência nova; `start` intacto.
- `api/test/databaseConfig.test.js` (novo): 10 casos — contrato puro + integração com `mysql` mockado (sem socket; ambiente restaurado).

### Verificação

- Suíte no workspace: **53/53** ✓. Cópia isolada (`npm ci` raiz+API exit 0): suíte **53/53** ✓, build **exit 0** ✓.
- Start sem configuração (cópia): **exit 1**, mensagem lista os quatro nomes, sem segredo impresso, sem tentativa de conexão ✓.
- Verificação de segredo sem imprimir valores: `db.js` sem literais ✓; arquivos novos limpos ✓; `.env.example` só placeholders ✓; menções na documentação são pré-existentes no HEAD.

### Registros explícitos

**Remoção do código atual não remove exposição histórica.** **Rotação da credencial publicada: PENDENTE** (ação operacional própria; nenhuma conexão ao banco real foi feita). Decisão **D8** registrada em `DECISIONS.md`; fatos F6/F9 atualizados.

### Documentos alterados

`SECURITY-AUDIT.md` (SEC-005 → FIXED com escopo; nova §6.5.1; resumo §4) · `docs/ARQUITETURA.md` · `docs/PLANO-COMERCIAL-LOCAL.md` · `README.md` · `memory-bank/DECISIONS.md` · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`. Cópia removida após confirmação de caminho. Sem commit, sem push.

**Próximo item: QLT-011** (não implementado nesta sessão).

---

## 2026-11-05 (sessão 12) — SEC-007 — Express 4.22.3 / body-parser 1.20.9 (SOFTPET-014B)

Rodada de **implementação controlada** — somente o gatilho confirmado da SEC-007 (GHSA-27r3-jxmh-p828, DoS em corpos comprimidos). **Execução manual** — skills indisponíveis; nenhuma executada. Baseline: `d594c7a` (HEAD == origin/main), suíte 43/43, stage vazio.

### Executado no workspace real

- `api/package.json`: apenas `express` `^4.19.2` → `^4.22.3` (linha 4.x; sem Express 5, sem `body-parser` direto, sem `overrides`).
- `api/package-lock.json`: regenerado por `npm install --package-lock-only --ignore-scripts` (exit 0) — `body-parser` **1.20.9**, `qs` 6.16.2, `path-to-regexp` 0.1.13, `cookie` 0.7.2, `send` 0.19.2, `serve-static` 1.16.3; `proxy-addr` 2.0.7 permanece.
- Efeito colateral: `api/node_modules/.package-lock.json` (gerado, versionado — QLT-007) atualizado pelo comando. `node_modules` real não reinstallado.
- Sem `npm audit fix`/`npm update`; raiz intacta; nada mais alterado.

### Verificação (cópia isolada, `npm ci` raiz+API exit 0)

- `npm ls`: express 4.22.3 / body-parser 1.20.9 ✓. **Audit depois: GHSA-27r3-jxmh-p828 ausente** ✓ (antes: presente; 11 pacotes → 4; residuais com condição ausente, não corrigidos). Suíte na cópia: **43/43** ✓. Build: **exit 0**, rotas `/` e `/_not-found` ✓. Runtime HTTP real não exercitado (sem banco de teste autorizado).

### Documentos alterados

`SECURITY-AUDIT.md` (SEC-007 → FIXED com escopo, nova §6.8) · `docs/ARQUITETURA.md` (tabela da API) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`. Cópia removida após confirmação de caminho. Sem commit, sem push.

**Próximo item: SEC-005** (não implementado nesta sessão).

---

## 2026-11-04 (sessão 11) — Normalização do stage e implementação do QLT-002 (SOFTPET-012)

Rodada de **implementação controlada** — dois objetivos: normalizar o stage do `git mv` e implementar o QLT-002. **Execução manual** — skills indisponíveis; nenhuma executada. Pré-flight reconfirido (branch `main`, HEAD `b9fc914`, suíte 43/43, hashes idênticos).

### Etapa A — Normalização do stage

`git restore --staged` nos caminhos do move. Índice igualado ao HEAD. Move da SOFTPET-011 preservado no working tree. Stage vazio após a operação.

### Implementação do QLT-002

- `buttons.js`: `ButtonDelete` → `type="button"`.
- `Bloco.js`: `handleDelete` reorganizado (`async/await` + `try/catch`); sucesso → toast + `getPets()` + fechar modal + `setOnEdit(null)`; erro → toast, modal aberto.
- `ModalDel.js` não alterado.

### Verificação

- Suíte API: **43/43**, exit 0.
- Build isolado (cópia `%TEMP%\softpet-qlt002-s12`): `npm ci` exit 0; **`npm run build` exit 0**.
- Playwright (produção, 1366×768, fixtures fictícias): **200** ✓ (DELETE→GET, modal fechou, toast, 1 card) · **404** ✓ (modal aberto, 2 cards, toast de erro) · **500** ✓ (idem 404) · **`?submit=` ausente nos três cenários** ✓.

### Documentos alterados

`QUALITY-REVIEW.md` (QLT-002 → FIXED, nova §12) · `README.md` (caminho residual) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`. Cópia temporária removida; servidor desta sessão encerrado. Sem commit, sem push, sem install no workspace real.

**Próximo item: SEC-007** (não implementado nesta sessão).

---

## 2026-11-04 (sessão 10) — Implementação do QLT-010 — move para src/components (SOFTPET-011)

Rodada de **implementação controlada** — somente o QLT-010. **Execução manual** — skills indisponíveis; nenhuma executada. Pré-flight reconfirido (branch `main`, HEAD `b9fc914`, stage vazio, suíte 43/43, hashes idênticos).

### Executado no workspace real

- **Move:** `src/pages/componentes/` → `src/components/` via `git mv` (12 arquivos rastreados; organização interna preservada; nenhum renomeado). `src/pages/` ficou vazia e deixou de existir. O stage passou a conter os renames (consequência do `git mv`); nada commitado.
- **Imports:** 14 imports absolutos atualizados em 7 arquivos (`page.js` 1, `Bloco.js` 3, `buttons.js` 1, `ModalCad.js` 2, `ModalDel.js` 2, `ModalEdit.js` 2, `principal.js` 3); relativos internos preservados (`Bloco.js` 1, `principal.js` 3, `Form.js` 2). Busca final: 0 ocorrências de `@/pages/componentes` em `src`. `Form.js` movido sem correção.
- **Nada mais alterado** — limite do escopo respeitado (sort, `key`, ESLint, manifests, lockfiles, `.next` reais intocados).

### Verificação

- Suíte da API: **43/43**, exit 0.
- **Build isolado** (cópia `%TEMP%\softpet-build-s11`): `npm ci` exit 0; **`npm run build` exit 0** — erro dos arquivos sem default export desapareceu; rotas: `/` e `/_not-found`; nenhuma rota `componentes/*`.
- **Smoke runtime** (`npm start` + Playwright, fixtures fictícias): página abre, 2 cards, expansão ok, modal de edição abre/pré-preenche, modal de exclusão abre. Nenhuma quebra pelo move.

### Documentos alterados

`QUALITY-REVIEW.md` (QLT-010 → FIXED, prioridade histórica P3→P1, nova §11) · `docs/ARQUITETURA.md` · `memory-bank/DECISIONS.md` (D7) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`. Cópia temporária removida após confirmação de caminho; servidor desta sessão encerrado. Sem commit, sem push, sem install no workspace real.

**Próximo item: QLT-002** (não implementado nesta sessão).

---

## 2026-11-04 (sessão 9) — Baseline isolado e caracterização de QLT-002/QLT-003 (SOFTPET-010)

Rodada de **análise e verificação** — **nenhum código do workspace real alterado**. **Execução manual** — skills indisponíveis; nenhuma executada. Pré-flight reconfirido: branch `main`, HEAD `b9fc914`, stage vazio, suíte 43/43, hashes dos lockfiles idênticos.

### Executado (fora do repositório)

- Cópia isolada em `%TEMP%\softpet-baseline-s10` (sem `.git`/`.next`/`node_modules`). `npm ci` raiz: **exit 0**. `npm run build`: **exit 1** — compila, mas falha na otimização nos arquivos sem default export de `pages/componentes` (`buttons`, `Form`, `SearchFilter`) — **confirma o QLT-010**. Lint: pergunta interativamente; cancelado sem criar config (decisão de projeto pendente — QLT-012).
- Runtime: `next dev` na cópia + Playwright interceptando `http://localhost:8800/**` com fixtures fictícias (gato + cachorro). MySQL real não conectado. Viewport 1366×768 (primário) e 1920×1080 (observação). Nenhum screenshot salvo no repositório.

### Resultados

- **QLT-002 confirmado no navegador:** confirmação dispara DELETE (enviado/respondido) **e** navegação do form (`/?submit=`); em 200/404/500 o resultado final dependeu do reload; nenhum toast observado; app não chama `getPets()` nem fecha o modal. **Mantém P1.**
- **QLT-003 não reproduzido:** submit chamou `handleUpdate`; PUT saiu com o valor editado; toast/fechamento/atualização funcionaram. Mecanismo de dupla controle é frágil mas funcional. **Reclassificado P1 → P2** (não `FIXED`).
- **QLT-006:** evidências mínimas de teclado/foco registradas (§10 do QUALITY-REVIEW). Não vira próximo item automaticamente.
- **Único próximo item: QLT-002** (plano no §7).

### Documentos alterados

`QUALITY-REVIEW.md` · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`. Cópia temporária removida após confirmação de caminho; servidor de dev desta sessão encerrado. Sem stage, commit, push, install ou alteração de dependências no projeto real.

---

## 2026-11-04 (sessão 8) — Implementação do QLT-001 com testes (SOFTPET-009)

Rodada de **implementação controlada** — somente o finding **QLT-001** (sucesso falso em `update`/`delete` sem conferir `affectedRows`). **Execução manual** — as skills do fluxo continuam indisponíveis; nenhuma foi executada.

### Implementado (somente o autorizado)

- **`api/controllers/pet.js`** — apenas `updatePets` e `deletePets`: callbacks `(err, result)`; `err` com prioridade absoluta via `erroOperacao` (SEC-002 preservada); `result.affectedRows === 0` → **HTTP 404 + `{"error":"Pet não encontrado."}`** com retorno imediato e resposta única; sucesso (200 + mensagens originais) inalterado. Critério `affectedRows` — `changedRows` não decide existência. `getPets`, `addPets`, `erroOperacao`, queries e estrutura intocados. Sem helper novo, sem segunda consulta, sem validação de `id`.
- **`api/test/petErrors.test.js`** — 6 testes novos: `affectedRows` 0 → 404 + JSON controlado + resposta única (update e delete); prioridade do erro sobre o resultado (`err` + `affectedRows: 0` → 500, não 404); ids malformados (`abc`, `-1`, `0`) repassados como valor sem validação própria. Títulos de sucesso tornados explícitos (`affectedRows 1`).
- **Frontend intacto** — cai no `.catch` para não-2xx com as mensagens genéricas da sessão 6.

### Testes executados

| Execução | Resultado | Código de saída |
|---|---|---|
| Baseline (37) | 37/37 | 0 |
| **Antes** da correção (43) | 39 passaram, **4 falharam, 0 cancelados** — exatamente `expected: 404, actual: 200` nos dois controllers (incluindo ids malformados); os 2 de prioridade do erro já passavam (SEC-002 implementada) | 1 |
| **Depois** da correção | **43/43**, 0 cancelados | 0 |

### Documentos atualizados de forma localizada

`QUALITY-REVIEW.md` (QLT-001 → `FIXED` com escopo; §7/§8/§9) · `SECURITY-AUDIT.md` (apenas a referência do antigo SEC-003) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`. Plano comercial não alterado.

### Não executado nesta rodada

Nenhuma dependência instalada ou atualizada; **lockfiles inalterados** — SHA-256 idênticos no início e no fim (raiz `D451A675…BFA448C`; `api/` `4F96CECD…F93B900`). Sem `npm audit`, sem install, sem build, sem lint, sem dev, sem conexão com o banco, sem migrations. Sem stage, reset, clean, commit, push nem publicação. Branch `main`, HEAD `b9fc914`, stage vazio, `git diff --check` código de saída 0 — iguais ao pré-flight.

---

## 2026-11-04 (sessão 7) — QUALITY-REVIEW FASE 1 (SOFTPET-008)

Rodada de **revisão de qualidade** no papel de Tech Lead + QA: analisar, executar apenas verificações seguras, documentar findings, priorizar e definir **um único próximo item**. **Nada foi implementado.** Nenhuma funcionalidade foi marcada como corrigida.

**Execução manual** — a skill `quality-review` continua indisponível (checagem rápida, sem busca extensa); nenhuma skill foi executada.

### Verificações executadas

- **Baseline de Git** completo (toplevel, branch, HEAD, status com não rastreados, diffs, `git diff --check` código de saída 0, stage vazio) — igual ao fim da sessão 6.
- **`npm --prefix ./api test`** → **37/37 passaram, 0 cancelados, código de saída 0**.
- **Lint não executado** — nenhum arquivo de configuração ESLint existe no repositório; `next lint` criaria config interativamente (alteraria o workspace). Versões conferidas antes da decisão: `eslint-config-next` 13.5.11, `next` 14.2.35.
- **Build não executado** (decisão de escopo — `.next` versionado com alterações preexistentes). **Playwright não iniciado** — fluxos listados no relatório para verificação futura.

### Documento criado

- **`QUALITY-REVIEW.md`** — 16 findings com IDs estáveis QLT-001–QLT-016 (P0: 0 · P1: 3 · P2: 6 · P3: 6 · P4: 1), cada um com prioridade, estado, categoria, arquivos, evidência, impacto, comportamento atual/desejado, menor correção, testes necessários e dependências. SEC-003 foi formalmente recebido da auditoria como **QLT-001**. Nenhum achado novo de segurança (nenhum SECURITY_HANDOFF novo).
- **Próximo item escolhido: QLT-001** (`affectedRows` em `update`/`delete`) — confirmado após comparação: é o único P1 integralmente testável com o harness existente. **Não implementado nesta rodada.**
- Divergências documentais registradas: PLANO-COMERCIAL §2.5 (`Form.js` importado por `Bloco.js` — código não confirma) e PROJETO §4.1 (sort do cliente — efeito provável de inversão de ordem, exige teste de navegador).

### Não executado nesta rodada

Nenhuma correção implementada. Nenhum arquivo de código, CSS, manifesto, lockfile, `.gitignore` ou configuração alterado. Nenhuma dependência instalada. Nenhuma conexão com o banco. Sem stage, commit, push, reset nem clean. `QUALITY-REVIEW.md` é o único conteúdo novo além dos dois arquivos do memory-bank.

---

## 2026-11-04 (sessão 6) — Implementação da SEC-002 com testes (SOFTPET-007)

Rodada de **implementação controlada**. **Execução manual** — as quatro skills do fluxo continuam indisponíveis nesta sessão; nenhuma foi executada. O trabalho da sessão 5 foi tratado como estado inicial e preservado.

### Implementado (somente o autorizado)

- **`api/controllers/pet.js`** — função privada `erroOperacao(res)` no mesmo arquivo: **HTTP 500 + JSON genérico fixo** `{"error":"Não foi possível concluir a operação."}`, usada nos callbacks de banco dos **quatro** controllers (`getPets`, `addPets`, `updatePets`, `deletePets`), com `return` impedindo segunda resposta no mesmo callback. O conteúdo da resposta não depende do erro recebido. Nada do erro cru vai para o cliente. **Sem logs do erro cru** (a API continua sem logar). Consultas, valores (2º argumento de `db.query`), callback (3º), status e corpos de sucesso preservados. SEC-001 preservada.
- **`api/test/getPets.test.js`** — restauração do mock tornada explícita (referência guardada + `after()`); casos novos `search = "0"` e `search = "false"` (textos → busca parametrizada, distintos dos não textuais que seguem 400); teste de erro do banco **atualizado deliberadamente** para o novo contrato.
- **`api/test/petErrors.test.js`** — **novo**: 13 testes dos quatro controllers reais com banco simulado — 500, corpo genérico exato, nenhuma propriedade do erro encaminhada (marcadores em `message`, `sql`, `sqlMessage`, `code`, `stack`), resposta única, sucesso preservado, argumentos esperados; cobre objeto de erro e instância de `Error` com propriedades adicionais; mesma disciplina de mock/importação/limpeza, independente do outro arquivo.
- **`api/package.json`** — somente o script `test`, agora `node --test --experimental-test-module-mocks test/getPets.test.js test/petErrors.test.js`.
- **Frontend (somente os cinco tratamentos de erro)** — `src/app/page.js` (listagem), `principal.js` (pesquisa), `ModalCad.js` (cadastro), `ModalEdit.js` (edição), `Bloco.js` (exclusão): `toast.error` com mensagem textual fixa por operação, válida também para falha de rede sem `error.response`. Requisições e blocos de sucesso preservados; nenhum toast/atualização/fechamento de sucesso acrescentado ao caminho de erro; `setOnEdit(null)` após a exclusão preservado. `Form.js` fora desta rodada.

### Testes executados

| Execução | Resultado | Código de saída |
|---|---|---|
| Estado inicial (suíte de 22, antes de alterar o contrato) | 22/22 — igual ao fim da sessão 5 | 0 |
| **Antes** da correção (37 testes) | 28 passaram, **9 falharam, 0 cancelados** — falhas exatamente nos testes de erro da SEC-002 (`null !== 500`: status não definido, corpo interno recebido) | 1 |
| **Depois** da correção | **37/37**, 0 cancelados | 0 |

**Separação da verificação:** backend por testes unitários com banco simulado; frontend por **leitura do código e do diff** — sem teste de navegador nem validação visual. Integração HTTP, navegador e banco real pendentes. Esta rodada não valida todos os erros possíveis da aplicação.

### Documentos atualizados de forma localizada

`SECURITY-AUDIT.md` (SEC-002 → `FIXED` com escopo, §4, §7.3, novo §7.7, §10) · `memory-bank/CURRENT-STATE.md` · `memory-bank/CHANGELOG.md`. Histórico da execução SOFTPET-006 mantido como ocorreu — os cancelamentos daquela primeira execução não foram reescritos.

### Não executado nesta rodada

Nenhuma dependência instalada ou atualizada; **lockfiles inalterados** — SHA-256 idênticos no início e no fim (raiz `D451A675…BFA448C`; `api/` `4F96CECD…F93B900`). Sem `npm audit`, sem `npm install`, sem build, sem lint, sem dev, sem conexão com o banco, sem migrations. Sem stage, reset, clean, commit, push nem publicação. `Form.js` não foi alterado. Branch `main`, HEAD `b9fc914`, stage vazio, `git diff --check` código de saída 0 — iguais ao pré-flight.

---

## 2026-11-04 (sessão 5) — Implementação da SEC-001 com testes (SOFTPET-006)

Rodada de **implementação controlada**, a primeira a alterar código neste repositório. **Execução manual** — as quatro skills do fluxo continuam indisponíveis nesta sessão; nenhuma foi executada.

### Implementado (somente o autorizado)

- **`api/controllers/pet.js`** — apenas `getPets`: a string SQL passou a ser **fixa**, com dois `LIKE ?`; o termo do usuário viaja **separado, como valor** (`['%termo%','%termo%']`). Tipo **presente e não textual** (array, objeto, `null`, número, booleano) → **HTTP 400 com JSON fixo, antes de consultar o banco**. **Ausência** do parâmetro e **string vazia** preservam o comportamento atual (lista completa). `addPets`, `updatePets` e `deletePets` preservados sem alteração.
- **`api/test/getPets.test.js`** — **novo**: 22 testes unitários do controller real com banco simulado — um único `mock.module('../db.js')` antes do primeiro `import()`, fake estável, estado reinicializado entre casos, sem concorrência. Cobre a matriz do §9.7 inteira: placeholders, valores na ordem correta, apóstrofo, barra invertida real, Unicode, curingas preservados como curingas, espaços sem *trim*, payload de injeção ausente da SQL, rejeição de tipos não textuais com zero consultas, contrato de erro do `res.json(err)` preservado (SEC-002 continua aberta) e ausência de vazamento entre casos.
- **`api/package.json`** — apenas o script `test` adicionado: `node --test --experimental-test-module-mocks test/getPets.test.js`. Dependências intocadas, nada instalado.

### Testes executados

| Execução | Resultado | Código de saída |
|---|---|---|
| **Antes** da correção (controller original) | 22 testes: 5 passaram (grupos de contrato preservado), **14 falharam, 3 cancelados** — as falhas capturam exatamente a interpolação do termo no SQL (`LIKE '%Thor%'` na string), a ausência de valores separados e a aceitação de tipos não textuais | **1** |
| **Depois** da correção | **22/22 passaram**, 0 falhas, 0 cancelados | **0** |

Comando: `npm --prefix ./api test` (Node v22.14.0 / npm 11.18.0). Corrigido durante a rodada: o pai dos subtestes do grupo 10 precisou ser `async` com `await` — sem isso o `node:test` os cancelava.

**Limite:** são testes unitários com banco simulado. **Não provam** o comportamento do *escape* do driver — que é *escape* no cliente (`SqlString.format`), dependente do `NO_BACKSLASH_ESCAPES` real do servidor (**não verificado**, exige conexão) — nem o caminho HTTP completo. SEC-001 está `FIXED` com escopo, **não** `VERIFIED` ponta a ponta.

### Documentos atualizados de forma localizada

- `SECURITY-AUDIT.md` — SEC-001 marcada `FIXED` com escopo explícito; novo **§7.6** com as evidências da implementação (comandos, resultados, códigos de saída, hash dos lockfiles); §4, §7.3, cabeçalho do §9 e §10 ajustados. Demais achados inalterados.
- `README.md` — apenas as duas afirmações sobre o lockfile da raiz: **HEAD sem lockfile versionado**; lockfile **local** presente (não rastreado, origem não confirmada), resolução local é observação, não definição do repositório. As 113+/31− preexistentes foram preservadas.
- `docs/ARQUITETURA.md` — idem: situação do lockfile da raiz e a linha de `node_modules` da raiz ajustadas para "existe localmente, não versionado, origem não confirmada".
- `memory-bank/CURRENT-STATE.md`, `memory-bank/CHANGELOG.md` — seção/entrada desta sessão.

### Não executado nesta rodada

Nenhuma dependência instalada ou atualizada. **Lockfiles inalterados** — SHA-256 idênticos no início e no fim da sessão (raiz `D451A675…BFA448C`; `api/` `4F96CECD…F93B900`). Sem `npm install`, sem build, sem lint, sem dev, sem conexão com o banco, sem `npm audit`. Sem stage, commit, push, reset nem clean. Branch `main`, HEAD `b9fc914`, stage vazio, `git diff --check` código de saída 0 — iguais ao pré-flight.

---

## 2026-11-04 (sessão 4) — Planejamento da versão comercial local com prontuário (SOFTPET-005)

Rodada de **planejamento e registro documental**. **Nada foi implementado.** Nenhum arquivo de código, CSS, manifesto, lockfile, `.gitignore` ou arquivo de ambiente foi alterado. Nenhuma dependência instalada ou atualizada. Nenhum build, dev, teste ou `npm audit` executado. Nenhuma conexão com o banco. Nenhuma migration criada ou executada. Nenhum serviço iniciado ou interrompido. Nenhum stage, reset, clean, commit ou push.

**Execução manual** — as skills `project-bootstrap`, `security-audit`, `quality-review` e `safe-implementation` não estão instaladas. Reconfirmado nesta rodada: `~/.copilot/skills/` tem 37 diretórios, nenhum deles as quatro; `~/.claude/skills/`, `d:\projetos\PetShop\.claude\skills\` e `d:\projetos\PetShop\.github\skills\` são inexistentes. Nenhuma skill foi executada.

### Documento criado
- **`docs/PLANO-COMERCIAL-LOCAL.md`** — plano central da evolução. Separa explicitamente estado verificado, requisitos confirmados pelo usuário, hipóteses adotadas, decisões técnicas propostas, pendências e critérios de aceitação. Contém a comparação de bancos, a arquitetura local proposta, o modelo funcional do prontuário, a preparação para instalação/venda, o roadmap em sete etapas e a proposta da SOFTPET-006.

### Documentos atualizados de forma localizada
- `SECURITY-AUDIT.md` — apenas os ajustes delimitados abaixo. **Nenhum ID alterado, nenhum achado marcado como corrigido.**
- `memory-bank/CURRENT-STATE.md` — seção da sessão 4.
- `memory-bank/DECISIONS.md` — fato F4 atualizado (a raiz passou a ter lockfile), novos fatos F35–F39, novas propostas P15–P24, e o que não se sabe ampliado.
- `memory-bank/CHANGELOG.md` — esta entrada.
- `README.md`, `AGENTS.md`, `PROJETO.md`, `docs/ARQUITETURA.md` — **sem alteração**. `README.md` mantém as 113+/31− preexistentes.

### Ajustes documentais aplicados ao `SECURITY-AUDIT.md`

- **Origem não confirmada.** As atribuições do novo lockfile, do `node_modules` e das mudanças em `.next/` a "ação externa", "npm install" ou "build/dev" foram removidas. O que se pode afirmar é que **não foi trabalho documental desta nem da sessão anterior**; a ação responsável não foi observada. A recontagem de `.next/` nesta rodada — **60 modificados + 33 deletados + 28 novos**, contra 92 modificados registrados na sessão anterior — é ela mesma evidência de atividade não observada entre as duas leituras.
- **`nodemon` corrigido.** `api/package.json` tem `nodemon` em **`dependencies`**, não em `devDependencies`, e o **único script `start`** da API é `nodemon index.js`. A árvore `brace-expansion`/`minimatch`/`picomatch` **está no caminho de partida da API** como o projeto está hoje. O que mantém a condição dos advisories ausente é outro fato, e é o que os avisos exigem: o glob processado nunca vem de entrada de requisição.
- **GHSA-qw6h-vgh9-j6wx conferido** contra a página do advisory: pertence ao **`express`** (CVE-2024-43796, `< 4.20.0`, patch `4.20.0`, Low 2.3, CWE-79, XSS via `response.redirect()`). A tabela já o trazia no lugar correto; a conferência fica registrada, com a cadeia de exploração que o próprio aviso enumera.
- **Plano de testes ESM da SEC-001 corrigido.** Repetir `import()` do mesmo especificador **não** cria um módulo novo — o importador ESM mantém o módulo no registro. A estratégia anterior ("registrar o fake dentro de cada teste e reimportar o controller") não se sustenta. Adotado: **um único mock de `db.js` antes do primeiro `import()`, mesmo objeto simulado durante todo o arquivo, comportamento e chamadas reinicializados entre os casos, sem concorrência**.
- **`undefined` preservado no contrato da busca.** Ausência do parâmetro continua produzindo a lista completa; a rejeição com HTTP 400 antes do banco vale apenas para os tipos que **existem mas não são texto**.
- **Pacotes × advisories × explorações diferenciados.** Os 11 itens da API são **pacotes reportados**, correspondendo a **29 advisories** somados; os 19 da raiz são pacotes, e só o `next` concentra 25 advisories. **Nenhum foi comprovadamente explorado.** Registrada também uma divergência menor entre a contagem agregada do relatório e a soma das severidades detalhadas — um item entre *high* e *low* — que não altera conclusão alguma.
- **Afirmações sobre tráfego de rede ajustadas** para deixar claro que se apoiam na documentação do comando, não em observação direta.
- **Triagem detalhada da árvore da raiz mantida como pendência.**
- **Contexto da SEC-006 atualizado** sem alterar a descrição do estado: com prontuário, autenticação, autorização, autoria e rastreabilidade passam a requisito de produto. **Funcionamento local não encerra** SQL injection, credencial publicada nem acesso indevido.
- **N/A-3** rebaixada para constatação sobre o legado — anexos exigem avaliação própria.
- **Plano MySQL da SEC-001 preservado** como etapa de estabilização, com os critérios de quando executá-lo antes da evolução e quando a correção pode entrar na implementação do destino.

### Verificações executadas nesta rodada (somente leitura)

- `git status --porcelain`, `git rev-parse --abbrev-ref HEAD`, `git rev-parse HEAD`, `git diff --cached --name-only`, `git ls-files --others --exclude-standard`, `git diff --check` (**código de saída 0**), listagem de `node_modules` da raiz e da API.
- Leituras: `README.md`, `PROJETO.md`, `docs/ARQUITETURA.md`, `SECURITY-AUDIT.md`, `memory-bank/*`, `package.json`, `api/package.json`, `api/db.js`, `api/index.js`, `api/controllers/pet.js`, `src/app/layout.js`, `src/app/page.js`, `src/assets/icone/`.
- Busca por padrão em `src/**` para as dependências de MongoDB/Mongoose (zero ocorrências) e para `localhost:8800` (6 ocorrências em 6 arquivos).
- Consulta às páginas dos advisories GHSA-qw6h-vgh9-j6wx e GHSA-27r3-jxmh-p828.
- Verificação da disponibilidade das skills nos quatro caminhos configurados.

### Não executado nesta rodada
- As duas resoluções do CFMV **não puderam ser lidas** — extração dos PDFs falhou em duas tentativas e o sistema de consulta de legislação exige autenticação. **Nenhuma obrigação normativa é afirmada como fato**; a validação vai para a lista de pendências.
- Nenhuma licença de dependência ou recurso visual foi conferida.
- `npm audit` não foi reexecutado. `npm run lint`, `npm run build` e `npm test` não foram executados. Aplicação não foi iniciada. Banco não foi consultado.

### Estado final do Git
Branch `main`, HEAD `b9fc914` — **inalterados** em relação ao início da rodada. Stage **vazio**. `git diff --check` com **código de saída 0**. As únicas alterações desta rodada são documentais: `docs/PLANO-COMERCIAL-LOCAL.md` (novo), `SECURITY-AUDIT.md`, `memory-bank/CURRENT-STATE.md`, `memory-bank/DECISIONS.md` e `memory-bank/CHANGELOG.md`. As alterações preexistentes em `README.md` e nos demais documentos foram preservadas, e nada em `.next/`, `node_modules/` ou lockfiles foi tocado.

### Próximo passo
**Revisar o plano.** A primeira implementação recomendada é a **SOFTPET-006 — implementar a SEC-001** conforme `SECURITY-AUDIT.md` §9.

---

## 2026-11-04 (sessão 3) — Revisão da auditoria e plano de implementação da SEC-001

Execução **manual** — as skills `security-audit` e `safe-implementation` não estão instaladas neste ambiente. Reconfirmado nesta sessão: `~/.copilot/skills/` contém 36 skills, nenhuma das duas; `~/.claude/skills/` e os caminhos do workspace são inexistentes. As skills não foram executadas.

**Nenhum código, CSS, manifest, lockfile, `.gitignore` ou arquivo de ambiente foi alterado. Nenhuma dependência instalada ou atualizada. Nenhum stage, commit ou push.**

### Documentos alterados
- `SECURITY-AUDIT.md` — correções A1 a A4 e **novo §9 (plano de implementação da SEC-001)**; o antigo "próximo item" passou a §10 com prioridade diferenciada.
- `memory-bank/CURRENT-STATE.md` — registro da revisão, mudanças materiais de conclusão, plano disponível, verificações executadas, pendências reais e único próximo passo.
- `memory-bank/CHANGELOG.md` — esta entrada.
- `README.md`, `AGENTS.md`, `PROJETO.md`, `docs/ARQUITETURA.md`, `memory-bank/DECISIONS.md` — **sem alteração**. Nenhuma das imprecisões corrigidas estava presente neles.

### Correções documentais aplicadas

**A1 — uso de rede.** A redação anterior afirmava que "nada foi enviado a ferramentas externas". **Incorreto:** `npm audit` **submete uma descrição das dependências ao registro** e consulta o serviço de advisories (`/-/npm/v1/security/advisories/bulk`, com fallback para Quick Audit). `--package-lock-only` só significa "usar o lockfile em vez do `node_modules`"; `--ignore-scripts` só desliga scripts de ciclo de vida. **Nenhum dos dois torna o comando offline.** O que foi enviado é metadado de dependência (nome + versão) — nenhum segredo ou dado pessoal saiu da máquina.

**A2 — análise por advisory.** A estrutura anterior separava os pacotes entre "em caminho de código ativo" e "sem caminho de código ativo", o que **misturava duas coisas diferentes**: se a biblioteca está no caminho, e se a **condição de disparo** do aviso existe. Reescrito advisory por advisory. Correções pontuais que a análise agregada escondia:
- `path-to-regexp` **está** no caminho de roteamento (`layer.js` chama `pathRegexp` para cada rota) — a condição dos três advisories é que não se completa, porque todos exigem **dois ou mais parâmetros no mesmo segmento** e as rotas são `/` e `/:id`.
- `express` **está** no caminho de toda requisição — o aviso direto (XSS via `response.redirect()`) não dispara porque `res.redirect()` nunca é chamado. Isso não torna a biblioteca "inativa".
- `proxy-addr` (critical) exige **trust subnet configurada** em notação IPv4-mapped IPv6 — o projeto não define `trust proxy` nem usa `req.ip`/`req.ips`.
- `qs` **está** no caminho de análise do `?search=` (confirmado no código instalado). Dos quatro advisories, um tem condição ausente por exigir `comma: true`, um é **stringify-only** e dois ficam parcialmente presentes porque o projeto nunca chama `qs.stringify`.
- `body-parser`: dos três advisories, **um tem a condição completa** (GHSA-27r3-jxmh-p828), um exige o parser url-encoded que o projeto não monta, e um exige `limit` inválido — o projeto usa o padrão.

**A3 — severidades rederivadas e redação ajustada.** SEC-007 **MÉDIA → ALTA** (justificativa no relatório). SEC-003 **MÉDIA → BAIXA**, reclassificada de `[!] VULNERABLE` para `[!] DEFEITO CONFIRMADO` e **encaminhada à `quality-review`**, com ID e histórico preservados. SEC-002 reescrita para "**pode** conter", com tabela separando quais campos aparecem em erro de servidor MySQL versus erro de conexão. N/A-1 e N/A-2 delimitados — em particular, **a ausência de sessão não é uma proteção cross-origin**, e a conclusão de XSS vale apenas para os caminhos examinados. Priorização deixou de ser genérica.

**A4 — visibilidade do repositório.** Confirmada como **pública** nesta revisão. As três afirmações foram mantidas **separadas**: publicação no código (confirmada), validade atual da credencial (não verificada), acesso externo ao banco (não verificado). Consequência: a **rotação da credencial passa de condicional a ativa**. Nenhum valor foi impresso — apenas os nomes dos campos.

### Reexecução da auditoria de dependências

`npm --prefix ./api audit --package-lock-only --ignore-scripts --json`, a partir da raiz, Node v22.14.0 / npm 11.18.0, **código de saída 1**. Resultado **idêntico** ao da sessão anterior: 11 pacotes (1 critical, 6 high, 1 moderate, 3 low), árvore de 108 pacotes. Saída gravada em arquivo temporário **fora do repositório** e removida ao final.

**Verificação de um dado de sessão anterior:** uma leitura intermediária via `ConvertFrom-Json` havia sugerido ausência de *fix*. Com `-AsHashtable`, confirma-se que **os 11 pacotes têm `fixAvailable: true`**. Era glitch de leitura, e a checagem serviu justamente para ver se tinha vazado para alguma conclusão — **não vazou**.

### Auditoria da raiz — executada (limitação caiu durante a sessão)

A sessão anterior registrara que a raiz **não possuía lockfile**, e por isso a auditoria cobrira apenas a API. Durante esta revisão, às **11:42** e **por ação externa a esta sessão**, a raiz ganhou `package-lock.json` e `node_modules` (410 pacotes) — um `npm install` completo. A limitação deixou de valer e a auditoria foi executada:

- `npm audit --package-lock-only --ignore-scripts --json` na raiz — **código de saída 1**, `auditReportVersion` 2, árvore de **543 pacotes** (397 prod, 74 optional, 93 peer).
- **19 itens: 1 critical, 5 high, 13 moderate, 0 low.**
- **Três dependências diretas na lista:** `next` (**critical**, 25 advisories, sendo 3 critical e 7 high), `zod` (**high**, GHSA-mrhx-c7xc-m3w5 `< 4.6.6` — cobre toda a linha 3.x) e `eslint-config-next` (moderate).
- A **análise por advisory dessa árvore não foi feita** — é pré-requisito para qualquer conclusão de severidade sobre o frontend, e deve seguir o mesmo método corrigido em §6.7 (condição por condição, não presença da biblioteca).

### Divergência de workspace no fim da sessão

Preflight limpo e confirmado no início. No fim: `git diff --check` **código de saída 0**, stage **vazio**, e **código-fonte, manifests e lockfiles intactos** (`git diff --numstat` vazio em `api/`, `src/`, `package.json`, `api/package.json`, `api/package-lock.json`, `jsconfig.json`, `next.config.mjs`, `.gitignore`).

Mas **92 arquivos rastreados de `.next/`** passaram a aparecer como modificados (às 11:43, build/dev externo) e o `package-lock.json` da raiz é **novo e não rastreado**. **Nada disso foi feito por esta sessão** — os únicos arquivos alterados aqui são `SECURITY-AUDIT.md`, `memory-bank/CURRENT-STATE.md` e `memory-bank/CHANGELOG.md`. O preflight não os mostrou porque o cache de *stat* do índice ainda não tinha sido revalidado; `git diff --check` forçou a revalidação e os revelou.

### Verificações executadas nesta sessão
- Preflight completo do Git — estado **idêntico** ao esperado, sem divergência; `git diff --check` com **código de saída 0**.
- Confirmações feitas **no código instalado** (fonte de verdade nº 1): parser de query do Express, uso de `path-to-regexp` no roteamento, `SqlString.format` (escape no cliente), campos de erro do driver, e as versões efetivas de `express` 4.19.2, `body-parser` 1.20.2, `qs` 6.11.0 e `path-to-regexp` 0.1.7.
- Documentação oficial consultada: `docs.npmjs.com` (npm audit), readme do driver `mysql` na tag `v2.18.1`, 8 advisories GHSA e a página pública do repositório.

### Não executado
- Os testes previstos no plano (§9.7) **não foram executados** — o plano é documental e a implementação não foi autorizada.
- `NO_BACKSLASH_ESCAPES` do servidor **não verificado**; DDL real da tabela `pets` **não consultado**.
- Análise por advisory da árvore da raiz — **não feita** (a execução do `npm audit` foi feita; a análise condição por condição, não).
- `npm run lint`, `npm run build`, `npm test` — não executados. Aplicação não foi iniciada; nenhuma porta exposta; nenhuma conexão com o banco.

### Único próximo passo
**Revisar o plano da SEC-001 e, após aprovação, implementá-lo.**

---

## 2026-11-04 (sessão 2) — Fechamento documental e auditoria inicial de segurança

Execução **manual** — a skill `security-audit` não está instalada neste ambiente. Verificado em `~/.copilot/skills/`, `~/.claude/skills/` e nos caminhos do workspace. A skill não foi executada.

### Documento criado
- `SECURITY-AUDIT.md` — relatório da FASE 1 de auditoria. Escopo, metodologia, limitações, resumo por severidade, matriz de áreas, 7 findings (`SEC-001` a `SEC-007`), 3 áreas não aplicáveis justificadas, evidências das verificações executadas e um único próximo item.

### Documentos atualizados
- `README.md` — remoção dos espaços finais nas duas linhas da seção de contato apontadas pelo Git (links e apresentação da lista preservados). Seção de tecnologias reescrita para distinguir **faixas declaradas** de **versões resolvidas**. Pendências de instalação reescritas para tratar raiz (sem lockfile) e API (com lockfile) como situações distintas. Link para `SECURITY-AUDIT.md` acrescentado.
- `AGENTS.md` — seção de skills reescrita para deixar explícito que a disponibilidade é **observação do ambiente e da sessão**, não característica permanente do repositório.
- `docs/ARQUITETURA.md` — tabela de camadas marcada como faixas declaradas; seção de dependências reestruturada com coluna de versões resolvidas apenas para a API e tabela separando as situações de lockfile.
- `memory-bank/CURRENT-STATE.md` — fechamento documental registrado; auditoria registrada como análise realizada com limitações; correções documentais separadas de vulnerabilidades abertas; motivo da não execução do `npm audit` na raiz corrigido; próximo passo redefinido.
- `memory-bank/DECISIONS.md` — **sem alteração**. Nenhuma decisão técnica nova foi tomada nesta sessão.
- `PROJETO.md` — **sem alteração**. Nenhuma das imprecisões listadas estava presente neste arquivo.

### Verificações executadas nesta sessão
- `git rev-parse --show-toplevel`, `git branch --show-current`, `git rev-parse HEAD`, `git status --short --untracked-files=all`, `git diff --name-status`, `git diff --cached --name-status`, `git diff --stat`, `git diff --check`.
- `git diff --check`: **código de saída 0** após a correção do `README.md` (antes: código de saída 2, duas ocorrências).
- `node --version` → v22.14.0; `npm --version` → 11.18.0.
- `npm --prefix ./api audit --package-lock-only --ignore-scripts --json` — executado a partir da raiz, analisando `api/package-lock.json` (108 pacotes). **Código de saída 1** = vulnerabilidades encontradas (1 critical, 6 high, 1 moderate, 3 low). Sem `fix`. stderr vazio.
- Conferência de dados sensíveis por leitura e processamento em memória dos documentos, incluindo verificação de trailing whitespace nos arquivos novos (todos OK) e busca dos valores de `api/db.js` dentro de `.next/`.

### Não executado
- `npm run lint`, `npm run build`, `npm test` — raiz sem lockfile e sem `node_modules`.
- `npm audit` na raiz — sem lockfile; a árvore resolvida não é conhecida. Nenhuma resolução nova foi gerada para apresentar como se fosse a original.
- Aplicação não foi iniciada; nenhuma porta exposta; nenhum teste contra serviço real.
- Nenhuma conexão com o banco foi tentada; nenhum valor de credencial foi impresso.

### Fora de escopo — nada disto foi feito
Nenhuma correção funcional implementada. Nenhum arquivo de código, CSS, manifest, lockfile, `.gitignore` ou arquivo de ambiente alterado. Nenhuma dependência instalada ou atualizada. Nenhuma migração, seed ou limpeza. Nenhum stage, commit ou push.

---

## 2026-11-04 (sessão 1) — Documentação inicial (FASE 2)

Execução **manual** — a skill `project-bootstrap` não está instalada neste ambiente.

### Documentos criados
- `AGENTS.md` — ponto de entrada para agentes: idioma, fonte de verdade, separação de responsabilidades, skills, princípios de execução, tratamento de segredos.
- `PROJETO.md` — escopo atual, funcionalidades encontradas, campos observados, fluxos, regras e lacunas, proposta de evolução em sete etapas.
- `docs/ARQUITETURA.md` — camadas, fluxo de dados, rotas, organização dos componentes, configurações, dependências e a diferença entre os campos usados nas queries e o schema efetivamente conhecido.
- `memory-bank/CURRENT-STATE.md` — commit e estado local, etapa atual, verificações feitas e pendentes, achados abertos, próximo passo.
- `memory-bank/DECISIONS.md` — fatos observados, decisões de processo e propostas pendentes, separados.
- `memory-bank/CHANGELOG.md` — este arquivo.

### Documento atualizado
- `README.md` — correção da stack declarada: **MongoDB/Mongoose → MySQL** (driver `mysql`), em conformidade com `api/db.js`. Acrescentadas seções de estrutura resumida, scripts, execução, pendências de instalação reproduzível e links para a documentação técnica. Corrigido o bloco de código final que estava sem fechamento. Conteúdo válido anterior preservado (funcionalidades, informações armazenadas, contato).

### Correções aplicadas ao diagnóstico anterior
- `Form.js` deixou de ser classificado como "código morto" apenas por não ser importado — sua localização sob `src/pages` participa da convenção de roteamento do Pages Router. Passou a ser registrado como fato (F8) com efeito no build **não verificado**.
- Toda afirmação de execução não comprovada foi removida ou marcada como NÃO VERIFICADO.
- As verificações isoladas dos controllers relatadas em análise externa foram reclassificadas: usaram banco e resposta simulados, não são testes HTTP/MySQL reais.

### Verificações executadas nesta sessão
- Leituras de arquivos do projeto.
- `git rev-parse --show-toplevel`, `git branch --show-current`, `git rev-parse HEAD`, `git status --short --untracked-files=all`, `git diff --name-status`, `git diff --cached --name-status`, `git diff --stat`, `git diff --check`, `git log`, `git ls-files`.
- HEAD local coincide com o commit de referência `b9fc914`.

### Verificações NÃO executadas
- `npm run lint`, `npm run build`, `npm test`, `npm audit` — a raiz não possui lockfile nem `node_modules`.
- Playwright/navegador — a aplicação não foi iniciada.
- Nenhuma dependência foi instalada ou atualizada.

### Fora de escopo desta sessão
Nenhum arquivo de código, CSS, manifest, lockfile, `.gitignore`, banco ou arquivo de ambiente foi alterado. Nenhum arquivo foi movido, removido, instalado, migrado ou semeados. Nenhum stage, commit ou push foi realizado.

---

## Sessões anteriores

Não documentadas aqui. O histórico anterior a 2026-11-04 consta apenas no log do Git e não foi reinterpretado neste arquivo.
