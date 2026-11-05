# SECURITY-AUDIT.md — Auditoria de segurança (FASE 1)

> Este é o relatório de segurança do repositório **SoftPet** (`D:/projetos/PetShop`).
>
> **Atenção sobre IDs:** existe um arquivo de memória `SECURITY-AUDIT.md` pertencente a **outro projeto** (NestJS + Prisma + PostgreSQL), com IDs `SEC-001`–`SEC-004` que significam outra coisa. Os IDs deste documento são independentes e não devem ser confundidos com aqueles.
>
> **Revisão em 2026-11-04 (mesma data da auditoria original).** Esta revisão corrigiu imprecisões factuais apontadas na análise — uso de rede do `npm audit` (§2.1), análise de dependências **advisory por advisory** em vez de julgamento agregado por biblioteca (SEC-007), redação da exposição de erros (SEC-002), reclassificação da SEC-003, delimitação dos N/A e priorização diferenciada — e **elaborou o plano de implementação da SEC-001 (§9)**. **Nenhum código foi alterado.** Nenhum achado passou a `FIXED` ou `VERIFIED` por trabalho documental.
>
> **Atualização (sessão SOFTPET-006, 2026-11-04):** a SEC-001 foi **implementada e verificada por testes unitários com banco simulado** (§7.6). **Atualização (sessão SOFTPET-007, 2026-11-04):** a SEC-002 foi **implementada e verificada pelos mesmos meios** (§7.7). São os dois únicos achados `FIXED`; os demais permanecem como estavam. Integração com MySQL (`NO_BACKSLASH_ESCAPES`) segue pendente.

---

## 1. Escopo, data, commit e situação do workspace

| Item | Valor |
|---|---|
| Data da sessão | 2026-11-04 |
| Raiz do repositório | `D:/projetos/PetShop` |
| Branch | `main` |
| HEAD | `b9fc914fe0873fef78a7b86a972202c2de34bce6` |
| Stage | Vazio no início e no fim da sessão |
| Alterações rastreadas | `README.md` (trabalho documental preexistente desta etapa) |
| Não rastreados | `AGENTS.md`, `PROJETO.md`, `docs/ARQUITETURA.md`, `memory-bank/*` (trabalho documental preexistente) e este arquivo |

**Escopo desta sessão:** FASE 1 de auditoria — analisar, confirmar e priorizar. **Nenhuma correção foi implementada.**

**Estado do workspace no início desta revisão:** reconfirmado por `git status`/`git diff` e **idêntico** ao da tabela acima — nenhuma divergência, stage vazio, `git diff --check` com código de saída 0. O trabalho documental preexistente foi preservado integralmente; nenhuma alteração local foi desfeita.

**Não faz parte desta auditoria:** `QUALITY-REVIEW.md` (etapa própria). Achados de qualidade sem relevância para segurança foram apenas anotados na §9.

---

## 2. Metodologia e ferramentas efetivamente utilizadas

| Ferramenta | Uso real |
|---|---|
| Leitura direta de código | Fonte primária. Todos os arquivos de `api/` e `src/` foram lidos. |
| Busca por padrão no código | Para confirmar ausências (validação, middleware, `dangerouslySetInnerHTML`, logging, `res.redirect`, `trust proxy`). |
| `git ls-files` | Para confirmar o que está versionado. |
| `npm --prefix ./api audit --package-lock-only --ignore-scripts --json` | **Executada** (uma vez na sessão original e uma vez nesta revisão). Ver §7. |
| `node --version` / `npm --version` | v22.14.0 / 11.18.0 |
| Pesquisa externa em documentação oficial | **Utilizada nesta revisão.** Ver §2.1. |

**Skill `security-audit`: não está instalada neste ambiente.** Verificado novamente nesta revisão em `c:\Users\vitor2\.copilot\skills\` (36 skills, nenhuma `security-audit`), `c:\Users\vitor2\.claude\skills\` (inexistente) e `.claude`/`.github/skills` no workspace (inexistentes). A metodologia foi aplicada **manualmente**. A skill não foi executada.

### 2.1 Correção — a auditoria de dependências **usa rede**

A redação anterior dizia que "nada foi enviado a ferramentas externas". **Isso estava impreciso e foi corrigido.**

Conforme a documentação oficial do npm (<https://docs.npmjs.com/cli/v11/commands/npm-audit/>):

> *"The audit command **submits a description of the dependencies configured in your project to your default registry** and asks for a report of known vulnerabilities."*

Ou seja, `npm audit` **consulta ativamente o serviço de advisories do registro** — ele não é uma análise local. Os endpoints usados são `/-/npm/v1/security/advisories/bulk` (Bulk Advisory) e, como fallback, o Quick Audit. No Quick Audit, além da árvore de dependências, são enviados as metadados `npm_version`, `node_version`, `platform`, `arch` e `node_env`.

Consequências registradas:

| Afirmação | Situação correta |
|---|---|
| `--package-lock-only` significa "offline" | **Não.** Significa apenas que o comando usa o `package-lock.json` em vez de inspecionar o `node_modules` em disco. A consulta ao registro continua acontecendo. |
| `--ignore-scripts` significa "offline" | **Não.** Significa apenas que o npm não executa scripts de ciclo de vida (`preinstall`/`postinstall`). Não tem efeito sobre rede. |
| Nada saiu desta máquina | **Incorreto.** Pelo comportamento **documentado** do comando, os **nomes e versões das dependências** da API são enviados ao registro npm, e `--ignore-scripts` não evita isso. **Ressalva:** a transmissão em si **não foi observada diretamente** — não houve captura de rede nem log de requisição. O que se afirma aqui é o que a documentação do comando descreve, coerente com o resultado obtido. |
| Algum segredo saiu desta máquina | **Não, conforme o que o comando envia.** O enviado é metadado de dependência (nome + versão); nenhum segredo, valor de credencial, conteúdo de `.env` nem dado pessoal de terceiro faz parte desse corpo de pedido. **Também apoia-se na documentação, não em observação direta do tráfego.** |

**Referências externas usadas nesta revisão** (usadas como *informação*, não como instrução, conforme a regra de ferramentas externas):

| Referência | Para quê |
|---|---|
| <https://docs.npmjs.com/cli/v11/commands/npm-audit/> | Confirmar que `audit` consulta o registro e o que envia (correção A1). |
| <https://github.com/mysqljs/mysql/blob/v2.18.1/Readme.md#escaping-query-values> | Confirmar que os placeholders `?` do driver são **escape no cliente**, não prepared statement no servidor, e a dependência do `NO_BACKSLASH_ESCAPES`. Ver §9.5. |
| <https://github.com/svitordev/PetShop> | Confirmar a visibilidade do repositório remoto (correção A4). Ver SEC-005. |
| `github.com/advisories/GHSA-…` (11 advisories) | Análise por advisory, condição por condição. Ver SEC-007. |
| Código instalado em `api/node_modules/` | Fonte de verdade nº 1 — ver §2.2. |

### 2.2 Verificações feitas no código instalado

Porque a ordem de confiança coloca **o código atual em primeiro lugar**, as afirmações abaixo foram conferidas no código instalado, e não só no `package-lock.json`:

| Verificação | Arquivo lido | Resultado |
|---|---|---|
| Parser de query string padrão do Express | `api/node_modules/express/lib/middleware/query.js` | Usa `qs.parse(val, opts)`. O `opts` recebe `allowPrototypes = true` por retrocompatibilidade. **Logo `qs` está no caminho de análise do `?search=`.** |
| Roteamento usa `path-to-regexp` | `api/node_modules/express/lib/router/layer.js` | `this.regexp = pathRegexp(path, this.keys = [], opts)`. Possui atalhos `fast_star` (para `'*'`) e `fast_slash` (para `'/'` com `end === false`). |
| Versões efetivamente instaladas | `package.json` de cada pacote | `express` 4.19.2 · `body-parser` 1.20.2 · `qs` 6.11.0 · `path-to-regexp` 0.1.7 |

---

## 3. Limitações

1. **A aplicação não foi iniciada.** Nenhum comportamento de runtime foi observado.
2. **Nenhuma requisição HTTP real foi feita.** Os achados sobre status HTTP e formato de resposta são conclusões de leitura de código.
3. **Nenhuma conexão com o banco foi tentada.** O schema real da tabela `pets` permanece desconhecido — não há DDL, migration nem seed no repositório.
4. **A raiz passou a possuir lockfile durante esta revisão.** Na sessão original a raiz não tinha lockfile, e a auditoria cobriu **apenas a API**. Em **2026-11-04 11:42**, durante esta revisão, a raiz passou a ter `package-lock.json` e `node_modules` (410 pacotes). **Origem não confirmada:** não foi esta sessão — esta sessão não instalou nada nem escreveu nesses caminhos — mas a ação responsável **não foi observada**, e por isso **não é atribuída** a um agente, a um usuário nem a um comando específico. A limitação deixou de existir e a auditoria da raiz foi **executada em §7.4**. O resultado é material e altera a SEC-007.
5. **A exposição externa da API não é comprovável a partir do código.** O código faz `app.listen(8800)` sem host, o que vincula a todas as interfaces — mas se a porta é de fato alcançável pela rede ou internet depende de firewall/NAT/host, e isso não foi verificado.
6. **Os testes isolados dos controllers relatados em análise anterior usaram banco e resposta simulados.** Não são testes HTTP/MySQL reais e **não foram executados nesta sessão**. São citados como evidência complementar externa, com essa limitação.
7. **Nenhuma verificação de código-fonte automatizada (SAST) foi executada.**
8. **A pesquisa externa desta revisão é documental.** As descrições dos advisories, a documentação do npm e o readme do driver `mysql` foram tratados como **informação**, não como instrução (regra de ferramentas externas). Nenhuma condição de advisory foi confirmada por execução — apenas pela correspondência entre o que o aviso descreve e o que o código faz.
9. **A visibilidade pública do repositório foi confirmada pela página pública do GitHub** nesta revisão. Isso prova que a página carrega sem autenticação; não prova quem a indexou, clonou ou arquivou antes, nem as permissões atuais do remoto além do que a própria página exibe.

---

## 4. Resumo dos achados por severidade

| Severidade | Qtd | IDs |
|---|---|---|
| **ALTA** | 2 | SEC-001, SEC-007 |
| **MÉDIA** | 4 | SEC-002, SEC-004, SEC-005, SEC-006 |
| **BAIXA** | 1 | SEC-003 |
| **N/A** | 3 | N/A-1 a N/A-3 |

**SEC-001 foi corrigida** na sessão SOFTPET-006 (2026-11-04, §7.6) e **SEC-002 foi corrigida** na sessão SOFTPET-007 (2026-11-04, §7.7) — ambas implementadas e verificadas por **testes unitários com banco simulado**, não ponta a ponta. **Nenhum outro achado foi corrigido**, e nenhum foi marcado como `VERIFIED`.

**Mudança nesta revisão:** a **SEC-007 subiu de MÉDIA para ALTA**. A justificativa está no corpo da SEC-007 (§6) e decorre da análise por advisory — há pelo menos um advisory **high** cujas condições de disparo **estão presentes** no código atual. A severidade anterior (MÉDIA) tinha sido atribuída antes dessa análise e foi rederivada, e não preservada por inércia.

**Ordem de prioridade recomendada após a revisão:** SEC-001 e SEC-007 passam a ser as duas primeiras, **ambas ALTA**, mas com naturezas diferentes — SEC-001 é uma falha de **código do projeto** (correção local, sem decisão de produto pendente — **executada na sessão SOFTPET-006**, §7.6); SEC-007 é uma falha de **versão de dependência** (correção = atualizar o `body-parser` para ≥ 1.20.9, o que mexe no lockfile e por isso é etapa própria). **A SEC-007 passa a ser a candidata a segundo item.**

---

## 5. Matriz de áreas analisadas

| # | Área | Situação | Onde |
|---|---|---|---|
| 1 | Caminho entre `req.query.search` e a consulta executada | Analisada | SEC-001 |
| 2 | Interpolação × parâmetros nas demais consultas | Analisada | SEC-001, §6 |
| 3 | Tipos inesperados, tamanho de entrada, caracteres especiais | Analisada | SEC-001, SEC-004 |
| 4 | Curingas de pesquisa (`%`) | Analisada | SEC-001 |
| 5 | Identificadores em edição e exclusão | Analisada | SEC-003 |
| 6 | Validação no frontend × API | Analisada | SEC-004 |
| 7 | Restrições do banco × regras da aplicação | **NÃO VERIFICADO** — schema ausente | `docs/ARQUITETURA.md` §4.1 |
| 8 | Respostas para registros inexistentes | Analisada | SEC-003 |
| 9 | Resultado das consultas de criação/atualização/exclusão | Analisada | SEC-003 |
| 10 | Status HTTP e formato das respostas | Analisada | SEC-002 |
| 11 | Exposição de objetos de erro do banco | Analisada | SEC-002 |
| 12 | Efeito das respostas sobre o frontend | Analisada | SEC-002 |
| 13 | Logs contendo dados de pets ou responsáveis | Analisada | SEC-002, §8 |
| 14 | Valores fixos de conexão e variáveis de ambiente | Analisada | SEC-005 |
| 15 | Arquivos de ambiente e regras de exclusão | Analisada | SEC-005 |
| 16 | Autenticação e autorização | Analisada | SEC-006 |
| 17 | Rotas disponíveis e CORS | Analisada | SEC-006, N/A-2 |
| 18 | Configuração de escuta do servidor | Analisada | SEC-006 |
| 19 | Renderização de dados recebidos | Analisada | N/A-1 |
| 20 | Pontos de inserção de HTML ou URLs | Analisada | N/A-1 |
| 21 | Dados expostos em mensagens e logs | Analisada | SEC-002, §8 |
| 22 | Consequências de respostas inesperadas da API | Analisada | SEC-002 |
| 23 | Dependências da API (diretas e transitivas) | Analisada via `npm audit` **+ análise por advisory** | SEC-007 |
| 24 | Dependências da raiz | **Executada nesta revisão** — a raiz passou a ter lockfile durante a sessão | SEC-007, §7.4 |
| 25 | Arquivos gerados e dependências versionados | Analisada | SEC-005 |

| # | Área | Situação | Justificativa e **limite** da conclusão |
|---|---|---|---|
| N/A-1 | XSS por renderização no frontend | **[N/A — no escopo examinado]** | Busca por `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `document.write` e `eval()` em **todos os arquivos de `src/**`** (leitura integral, não amostral): **nenhuma ocorrência**. React escapa texto e atributos por padrão ao renderizar. **Nenhum caminho concreto de injeção de HTML foi encontrado.**<br><br>**Limite:** a conclusão vale para **injeção de HTML nos caminhos examinados**. Não cobre vetores DOM-based em scripts de terceiros, nem **injeção de CSS** via `styled-components` (o projeto usa a biblioteca em `page.js`, sem plugin SWC/Babel configurado — anotado para a `quality-review`). Não foi executado nenhum teste de renderização em navegador. |
| N/A-2 | CSRF | **[N/A — no modelo de autenticação atual]** | A API **não usa cookie nem sessão** em nenhuma rota; nenhum mecanismo de autenticação do navegador anexa credencial automaticamente a uma requisição cross-origin. Sem credencial anexada automaticamente, **não há estado de autenticação a forjar**, que é o pré-requisito do CSRF.<br><br>**A ausência de sessão não é uma proteção cross-origin** — são coisas distintas, e a anterior redação podia sugerir o contrário. O navegador simplesmente não envia credencial alguma; o acesso é aberto a quem alcançar a porta (SEC-006). CORS instrui o navegador, não autoriza no servidor, e **não mitiga CSRF**.<br><br>**Validade:** esta conclusão é **condicionada ao modelo atual**. Se autenticação por cookie for adicionada no futuro, a N/A-2 deixa de valer e precisa ser reanalisada. |
| N/A-3 | Uploads | **[N/A — no estado atual do legado]** | O projeto não possui upload de arquivos em nenhuma rota. Nenhum middleware de multipart foi encontrado. **É uma constatação sobre o legado, não uma decisão permanente:** a introdução de **anexos** no prontuário veterinário cria a necessidade de upload e **exige avaliação própria** — tamanho, tipo, armazenamento, nome gerado, hash de integridade, backup. Essa avaliação está planejada em `docs/PLANO-COMERCIAL-LOCAL.md` e **não** é coberta por esta linha. |

---

## 6. Findings

### SEC-001 — Busca interpola o valor do usuário diretamente na string SQL

**Estado:** `[✓] FIXED` (sessão SOFTPET-006, 2026-11-04 — implementado e verificado por **testes unitários com banco simulado**; ver §7.6). **Não é `VERIFIED` ponta a ponta** — a verificação de configuração (`NO_BACKSLASH_ESCAPES`) e a integração com MySQL permanecem pendentes.
**Severidade:** **ALTA**
**Categoria:** Injeção de SQL

**Arquivos e localização:** `api/controllers/pet.js`, função `getPets`, linhas 3–14 (a query com `LIKE` está na linha 7).

**Evidência:**

```js
const searchTerm = req.query.search;
const q = searchTerm
  ? `SELECT * FROM pets WHERE namePet LIKE '%${searchTerm}%' OR nameDono LIKE '%${searchTerm}%' ORDER BY namePet;`
  : "SELECT * FROM pets ORDER BY namePet";

db.query(q, (err, data) => { ... });
```

`db.query` é chamado com **um único argumento de string** — sem array de valores. Os demais controllers (`addPets`, `updatePets`, `deletePets`) usam placeholder `?` corretamente. Esta é a **única consulta do projeto que não é parametrizada**.

**Caminho completo confirmado:** `SearchFilter.js` (react-hook-form + zod, schema `z.object({ name: z.string() })`) → `handleSearch(data.name)` → `principal.js` monta `` `http://localhost:8800?search=${searchTerm}` `` → `req.query.search` → template literal → `db.query`.

**Observação sobre o caminho:** o zod do `SearchFilter` impõe apenas `z.string()` — nenhum limite de tamanho, nenhum caractere restrito. O zod **não** impede a injeção; ele apenas garante que o valor é uma string.

**Impacto:**
- Leitura de dados além do resultado pretendido, por inferência booleana ou por erro (o `SELECT *` retorna a tabela inteira a quem consultar sem `?search=`).
- **Quebra funcional direta:** um nome contendo apóstrofo (ex.: `D'Angelo`) quebra a sintaxe da query e aciona o caminho de erro (SEC-002).
- Os curingas `%` e `_` do `LIKE` **não são escapados**: um usuário pode enviá-los e alterar a semântica da busca. Isso é comportamento observável, não vulnerabilidade em si.

**Condições necessárias para o problema ocorrer:**
1. A API precisa estar alcançável pelo autor.
2. O autor precisa enviar `?search=` com conteúdo malicioso — qualquer conteúdo é aceito, pois não há validação.
3. Para injeção via `UNION`/subconsulta, basta o parser do MySQL — não há restrição no código.

**Fatores atenuantes (registrados separadamente):**
- O driver `mysql` tem `multipleStatements` **desligado por padrão** → não há execução de DML/DDL empilhado por esta rota. A injeção é limitada ao contexto de um `SELECT`.
- A rota já retorna a tabela inteira para qualquer chamador (não há autenticação), então o ganho marginal de confidencialidade para um atacante anônimo é pequeno. **O achado permanece confirmado** independentemente disso.

**Confirmado × desconhecido:**
- Confirmado por leitura: a interpolação, a ausência de validação e a ausência de escape de curingas.
- Desconhecido: se a API é alcançável por terceiros; o schema real da tabela; se há dados além de nomes e telefones.

**Menor correção proposta:** usar o placeholder já empregado nos demais controllers — `db.query(q, [searchTerm, searchTerm], cb)` com `LIKE ?` no lugar de `'%${searchTerm}%'`. Nenhuma refatoração adicional é necessária. **Plano completo no §9.**

**Adendo desta revisão — tipos não textuais:** `req.query.search` **não é necessariamente uma string**. Como o `qs` instalado está no caminho de análise do *query string*, `?search[]=a&search[]=b` produz **array** e `?search[a]=b` produz **objeto**. Sem coerção explícita, um array entra no template literal como `a,b` e um objeto como `[object Object]` — a busca passa a retornar resultado errado **sem gerar erro**, o que é pior que um erro visível. A rejeição desses tipos com HTTP 400 **antes de tocar o banco** faz parte do plano (§9.4) e não é um extra opcional.

**Adendo desta revisão — o placeholder não é *prepared statement*:** no driver `mysql`, os `?` são resolvidos **no cliente** por `SqlString.escape`, e isso depende do modo SQL `NO_BACKSLASH_ESCAPES` estar desabilitado. Ver §9.5 — a configuração real do servidor é **pendência de verificação em etapa de integração autorizada**.

**Testes de regressão necessários:** ver matriz completa no §9.7 — busca com apóstrofo; busca com barra invertida e Unicode; busca com `%`; busca com `_`; busca com payload de inferência booleana mantido só nos valores; busca normal como controle; array e objeto rejeitados com HTTP 400 e **zero chamadas ao banco**; confirmação de que o resultado vazio não gera erro; confirmação de que o contrato de sucesso é idêntico ao atual.

---

### SEC-002 — Erros do banco devolvidos com HTTP 200 e objeto de erro cru do driver

**Estado:** `[✓] FIXED` (sessão SOFTPET-007, 2026-11-04 — implementado e verificado por **testes unitários com banco simulado**; ver §7.7). **Não é `VERIFIED` ponta a ponta** — navegador e banco real pendentes.
**Severidade:** **MÉDIA**
**Categoria:** Tratamento de erros / exposição de informações

**Arquivos e localização:** `api/controllers/pet.js` — `getPets` (linha 10), `addPets` (linha 30), `updatePets` (linha 53), `deletePets` (linha 61). Os quatro controllers usam o mesmo padrão.

**Evidência:**

```js
if (err) return res.json(err);
return res.status(200).json(data);
```

Nenhuma resposta de erro define status de erro — o `res.json(err)` responde com **HTTP 200**. Não há middleware de tratamento de erros em `api/index.js`.

**O que o objeto pode conter** (verificado no driver instalado em `api/node_modules/mysql`): os campos são atribuídos como **propriedades próprias e enumeráveis**, portanto o `JSON.stringify` do `res.json()` os inclui. Mas **quais campos aparecem depende do tipo de erro** — por isso a redação correta é "pode conter", e não "contém":

| Campo | Onde é atribuído | Quando aparece |
|---|---|---|
| `errno`, `sqlState`, `message`, `sqlStateMarker` | `lib/protocol/packets/ErrorPacket.js` (linhas 5–9 e 13–22) | Apenas em **erro vindo do servidor MySQL**. Não existem em erro de conexão. |
| `sql`, `index` | `lib/protocol/sequences/Query.js` (linhas 89–90: `err.index = this._index;` / `err.sql = this.sql;`) | Quando o erro tem uma consulta associada. `sql` é a query **já formatada com os valores**. |
| `code`, `fatal` | Documentação oficial do driver | `code` pode ser `ECONNREFUSED` etc.; `fatal` só existe em erro de protocolo/conexão. |

**Consequência da distinção:** um erro de **sintaxe gerado pela SEC-001** ou uma violação de constraint produz um erro com `errno`, `sqlState`, `message` **e `sql`** — ou seja, a query completa vai para o cliente. Já uma falha de **conexão** (`ECONNREFUSED`) produz um erro **sem** `sql` e sem `errno`/`sqlState`. Em ambos os casos o status continua sendo 200.

**Impacto:**
- O cliente pode receber a mensagem de erro do banco, o `errno`, o `sqlState` e a **query completa executada** — incluindo, nos caminhos de escrita, os valores digitados (nome do pet, nome do dono, telefone).
- **Efeito no frontend:** como a resposta tem status 200, o Axios **não rejeita**. Em `ModalCad.js` e `ModalEdit.js`, o `.catch` nunca é acionado — o fluxo cai no `.then` e exibe **`toast.success` contendo o objeto de erro**. O usuário vê "sucesso" quando houve falha.
- Em `page.js` e `principal.js`, uma resposta de erro no lugar do array quebra `res.data.sort(...)` / `pets.map(...)` — `TypeError` em runtime.

**Condições necessárias:** precisa ocorrer um erro de banco — violação de constraint, erro de sintaxe (inclusive o gerado pela SEC-001) ou falha de conexão.

**Confirmado × desconhecido:**
- Confirmado por leitura: o padrão de resposta, a ausência de middleware e os campos que o driver atribui ao erro.
- Desconhecido: o comportamento observado em execução — nada foi executado nesta sessão.

**Menor correção proposta:** responder erros com status apropriado e corpo controlado (ex.: `res.status(500).json({ error: '...' })`), registrando o detalhe do lado do servidor. Não expor `err` cru.

**Testes de regressão necessários:** forçar um erro de banco e conferir status, corpo e o que o frontend exibe; testar atualização e exclusão de id inexistente (interage com a SEC-003). — Os dois primeiros foram **executados na sessão SOFTPET-007** (§7.7); os de id inexistente continuam pendentes. O que o frontend exibe foi **revisado por leitura do diff**, não por navegador.

---

### SEC-003 — `updatePets` e `deletePets` respondem sucesso sem conferir o resultado da consulta

**Estado:** `[!] DEFEITO CONFIRMADO` (era `[!] VULNERABLE` — ver justificativa de reclassificação abaixo)
**Severidade:** **BAIXA** para segurança (era MÉDIA — rederivada)
**Categoria:** Integridade de dados / tratamento de resultados
**Encaminhamento:** **`quality-review`** — o defeito é real e confirmado, mas sua casa natural é qualidade/integridade. O ID `SEC-003` e o histórico são preservados aqui porque a auditoria foi quem o registrou primeiro. **Atualização (sessão SOFTPET-009, 2026-11-04):** a correção correspondente foi **implementada no finding de qualidade `QLT-001`** (`QUALITY-REVIEW.md`) — 404 com JSON controlado quando `affectedRows === 0`, verificado por testes unitários com banco simulado. SEC-003 permanece aqui como referência histórica, não como finding ativo separado.

**Por que foi reclassificado (e não removido):** o defeito está confirmado, mas o impacto é **operacional, não adversarial**. Nenhum atacante ganha algo com ele — quem é enganado é o próprio operador do sistema. Não há bypass de autorização, não há vazamento de dados e não há injeção (a consulta é parametrizada). O que existe é **perda silenciosa de escrita**, que compromete a **auditabilidade**: o operador acredita que um registro foi alterado ou removido quando não foi. Isso é integridade no sentido amplo, mas não é uma vulnerabilidade explorável por terceiros. Por isso **BAIXA** aqui, com o defeito encaminhado à `quality-review`, e não remoção — a correção continua valendo.

**Arquivos e localização:** `api/controllers/pet.js` — `updatePets` (linhas 33–57), `deletePets` (linhas 59–64).

**Evidência:**

```js
db.query(q, [...values, req.params.id], (err) => {
  if (err) return res.json(err);
  return res.status(200).json("Pet atualizado com sucesso.");
});
```

O callback recebe apenas `err` — o segundo argumento (`result`), que conteria `affectedRows`, é descartado. O mesmo ocorre em `deletePets`.

**Impacto:**
- `PUT /:id` e `DELETE /:id` sobre um id inexistente **não geram erro** — o MySQL não considera "zero linhas afetadas" um erro. A API responde **"atualizado/deletado com sucesso"** com HTTP 200 para um registro que não existe.
- O frontend exibe a mensagem de sucesso e a lista não reflete a operação (em exclusão, a lista nem é recarregada).
- Consequência prática: perda silenciosa de escrita — o operador acredita que alterou ou removeu um registro que não foi alterado.

**Observação sobre o `id`:** em ambos os casos a consulta é **parametrizada** (`WHERE id = ?`), então não há injeção por esse parâmetro. A ausência de validação de formato/tipo do `id` é um problema de consistência, não de injeção.

**Condições necessárias:** chamar `PUT` ou `DELETE` com um id que não exista ou não corresponda a nenhuma linha.

**Confirmado × desconhecido:**
- Confirmado por leitura: o callback descarta o resultado.
- Desconhecido: o tipo real da coluna `id` e se há constraints — o schema não está no repositório.

**Menor correção proposta:** receber `result` no callback e responder 404 quando `affectedRows === 0` (e, em exclusão, o equivalente). É uma mudança pequena e local.

**Testes de regressão necessários:** `PUT` e `DELETE` em id existente (controle), em id inexistente, e em id malformado.

---

### SEC-004 — Ausência total de validação de entrada na API

**Estado:** `[!] VULNERABLE`
**Severidade:** **MÉDIA**
**Categoria:** Validação de entrada

**Arquivos e localização:** `api/routes/pets.js` (linhas 10–14 — nenhuma rota tem middleware de validação); `api/index.js` (apenas `express.json()` e `cors()`); `api/controllers/pet.js` (todos os quatro controllers usam `req.body` diretamente).

**Evidência:** as quatro rotas montam o controller diretamente, sem middleware entre a requisição e o acesso a `req.body` / `req.params`.

**O que existe e o que falta:**

| Campo | Validação no frontend (zod) | Validação na API |
|---|---|---|
| `namePet` | `z.string().min(1)` | nenhuma |
| `nameDono` | `z.string().min(1)` | nenhuma |
| `telefone` | `z.string()` — **sem formato** | nenhuma |
| `animal` | `z.string().min(1)` | nenhuma |
| `raca` | `z.string().min(1)` | nenhuma |
| `data` | `z.string().min(1)` | nenhuma |

Nenhum campo tem limite máximo de tamanho nem restrição de formato na API. `telefone` não tem validação de formato **em lugar nenhum**. `animal` é restrito a `cachorro`/`gato` apenas pelo formulário — a API aceita qualquer string.

**Impacto:**
- Toda a validação do projeto é **client-side e dispensável**: qualquer chamador direto da API a ignora completamente.
- Como as consultas de escrita são parametrizadas, o risco não é injeção — é **dados inconsistentes ou truncados** entrando no banco, conforme as constraints reais (desconhecidas), e o caminho de erro (SEC-002) quando o banco rejeita.
- Ausência de limite de tamanho significa que uma entrada muito grande vai inteira para o driver.

**Condições necessárias:** qualquer chamada direta à API com corpo fora do que o formulário produziria.

**Confirmado × desconhecido:**
- Confirmado por leitura: nenhum middleware, nenhum decorator, nenhuma checagem nos controllers.
- Desconhecido: quais constraints o banco impõe — sem DDL não há como saber o que o banco aceita ou rejeita.

**Menor correção proposta:** um único middleware de validação compartilhado pelos quatro controllers, com os mesmos campos já definidos no zod do frontend, mais limites máximos de tamanho. Não exige ORM nem troca de biblioteca.

**Testes de regressão necessários:** corpo vazio, campo ausente, campo com tipo errado, campo acima do limite, corpo com campos extras.

---

### SEC-005 — Credenciais de conexão com valores fixos no código

**Estado:** `[!] VULNERABLE`
**Severidade:** **MÉDIA**
**Categoria:** Secrets / configuração

**Arquivos e localização:** `api/db.js` (linhas 3–8); `.gitignore` da raiz (contém apenas `/node_modules`).

**Evidência:** `mysql.createConnection({...})` recebe host, usuário, senha e nome do database como **literais no código**. Não existe arquivo `.env` no repositório e nenhuma linha de código lê `process.env`.

> Os valores não são reproduzidos neste relatório. Os campos são referidos por nome: host, usuário, **senha**, database.

**Situação de versionamento:**

| Item | Situação |
|---|---|
| `api/db.js` (com os valores) | **Versionado** — está no commit `b9fc914` |
| `.env` | Inexistente |
| `.gitignore` | Cobre apenas `/node_modules`; não tem regra para `.env` |
| `.env.example` | Inexistente |
| `api/node_modules/` | **Versionado** (936 arquivos) — o `.gitignore` não alcança |
| `.next/` | **Versionado** (162 arquivos) — cache de build no repositório |

**Verificação de vazamento:** os valores de senha e de nome de database **não** aparecem em nenhum arquivo dentro de `.next/`. As ocorrências de host e usuário ali encontradas são coincidências de substring em arquivos de build, não vazamento.

**Impacto:**
- A credencial está no histórico do repositório e está **publicada** no remoto (`github.com/svitordev/PetShop`).
- Sem variáveis de ambiente, não há como separar ambientes, e qualquer novo arquivo `.env` criado seria commitado, pois o `.gitignore` não o cobre.

**Visibilidade do repositório — verificação realizada nesta revisão.** As três afirmações abaixo são fatos **separados** e não devem ser resumidas uma na outra:

| # | Afirmação | Situação | Como foi apurado |
|---|---|---|---|
| 1 | O arquivo `api/db.js` **com os valores** está versionado e publicado no remoto | **CONFIRMADO** | `git ls-files` local + a página pública <https://github.com/svitordev/PetShop> carrega sem autenticação, exibe o selo **Public**, o histórico com o commit `b9fc914` (o mesmo do HEAD local) e a árvore de arquivos contendo o diretório `api/`. |
| 2 | A credencial publicada é a credencial **válida hoje** | **NÃO VERIFICADO** | Nenhuma tentativa de conexão foi feita. O valor pode ter sido alterado no servidor desde então. |
| 3 | O banco é **alcançável por terceiros** na rede | **NÃO VERIFICADO** | Depende de firewall/NAT/host — ver limitação §3.5. Não foi testado. |

**Consequência prática da confirmação do item 1:** como o repositório é público, a credencial deve ser tratada como **exposta** e **substituída** — independentemente dos itens 2 e 3 permanecerem em aberto. A severidade **não** foi alterada por isso: ela continua **MÉDIA** porque o que a credencial protege (um banco cujo acesso externo não é comprovado) e a classificação dos dados armazenados ainda não foram verificados. A **recomendação de rotação**, essa sim, passa de condicional a **ativa**.

> Nenhum valor de credencial foi impresso nesta revisão, em diff, em documentação ou em saída de ferramenta. Apenas os **nomes** dos campos (host, usuário, senha, database) são referidos.

**Confirmado × desconhecido:**
- Confirmado: valores fixos, ausência de `.env`, ausência de regra no `.gitignore`, `api/node_modules` e `.next` versionados, **repositório remoto público**.
- Não verificado: validade atual da credencial; alcançabilidade externa do banco.

**Menor correção proposta:** ler os quatro valores de variáveis de ambiente, criar `.env.example` com placeholders (nomes apenas) e adicionar `.env` ao `.gitignore`. **A substituição da credencial no servidor passa a ser recomendada de forma ativa**, dado que o repositório é público.

**Testes de regressão necessários:** subir a API com e sem as variáveis definidas e conferir a mensagem de falha.

---

### SEC-006 — Ausência de autenticação/autorização em todas as rotas

**Estado:** `[!] VULNERABLE` (controle ausente no código)
**Severidade:** **MÉDIA**
**Categoria:** Autenticação e autorização

**Arquivos e localização:** `api/routes/pets.js` (linhas 10–14), `api/index.js` (linhas 7–11).

**Evidência:** as quatro rotas (`GET /`, `POST /`, `PUT /:id`, `DELETE /:id`) estão montadas sem qualquer middleware de autenticação ou autorização. Não há middleware global de proteção em `api/index.js`.

**Configuração de escuta:** `app.listen(8800)` — sem host explícito, o Node vincula a **todas as interfaces** (não apenas a `localhost`). Não há variável de ambiente para a porta.

**CORS:** `app.use(cors())` — sem restrição de origem. **CORS não é controle de autorização**: ele instrui o navegador, não o servidor, e não impede chamadas diretas.

**Impacto:** qualquer cliente que alcance a porta pode listar, cadastrar, editar e excluir registros. Não há distinção de papéis nem propriedade de registros.

**Confirmado × desconhecido — separação explícita:**

| Afirmação | Situação |
|---|---|
| Não há autenticação nem autorização no código | **Confirmado** |
| O servidor escuta em todas as interfaces | **Confirmado** (comportamento padrão do `listen` sem host) |
| A porta 8800 é alcançável pela rede ou internet | **NÃO VERIFICADO** — depende de firewall/NAT/host |
| O CORS está irrestrito | **Confirmado**, mas não constitui vulnerabilidade isolada |

**Contexto de uso:** a ausência de login precisa ser avaliada à luz da finalidade do sistema. Para uma ferramenta de uso local e individual, pode ser aceitável. O que se registra aqui é que **o controle não existe no código** e que a escuta não é restrita a loopback. **Não se conclui que a API está exposta à internet** — não há evidência disso.

**Menor correção proposta:** nenhuma correção é proposta sem antes definir o contexto de uso. Se o sistema for multiusuário ou a porta for alcançável por terceiros, autenticação passa a ser necessária. Caso contrário, documentar a decisão é suficiente.

**Atualização de contexto — 2026-11-04, rodada de planejamento comercial.** A descrição do estado acima **permanece válida e não foi alterada**; o que muda é o **enquadramento**. Com o objetivo declarado de instalar o sistema no estabelecimento com prontuário veterinário, autenticação, autorização, **autoria de registro clínico** e **rastreabilidade de alterações** deixam de ser opcionais e passam a **requisito de produto** — ver `docs/PLANO-COMERCIAL-LOCAL.md`. A correção deixa de depender de "definir o contexto de uso": o contexto foi definido. O que resta pendente é o **escopo da implementação**, não a necessidade.

**O funcionamento local não encerra os riscos desta auditoria.** Rodar numa máquina dentro do estabelecimento **não** reduz a injeção de SQL (SEC-001), **não** desfaz a credencial publicada em repositório público (SEC-005) e **não** elimina o acesso indevido entre pessoas que alcançam a mesma rede — inclusive colegas de trabalho. A severidade da SEC-006 continua **MÉDIA** por outro motivo: não há evidência de exposição externa, não porque o uso local a anule.

**Testes de regressão necessários:** apenas se uma correção for aprovada.

---

### SEC-007 — Dependências com avisos oficiais cuja **condição de disparo está presente** no código

**Estado:** `[!] VULNERABLE` (nível de dependência, confirmado por `npm audit`)
**Severidade:** **ALTA** — **rederivada nesta revisão** (era MÉDIA). Justificativa em §6.7.2.
**Categoria:** Dependências

**Escopo da análise:** na sessão original, **apenas a API** — a raiz não tinha lockfile. **Isto mudou durante esta revisão:** a raiz passou a ter lockfile e a auditoria dela foi executada (**§7.4**, 19 itens, incluindo `next` e `zod` como diretos). A **análise por advisory da árvore da raiz ainda não foi feita** e é pré-requisito para concluir sobre o frontend.

**Comando executado:** `npm --prefix ./api audit --package-lock-only --ignore-scripts --json` (Node v22.14.0, npm 11.18.0, 2026-11-04, código de saída 1 = vulnerabilidades encontradas).

**Resultado bruto:** 11 pacotes reportados — 1 critical, 6 high, 1 moderate, 3 low. Árvore da API: 108 pacotes.

**Importante:** o `npm audit` reporta o **aviso**, não a exploração. A análise abaixo é feita **advisory por advisory**, verificando para cada um se a **condição de disparo** descrita pelo próprio aviso existe neste projeto. Uma biblioteca **presente no caminho de código não é automaticamente vulnerável**, e uma biblioteca **sem o gatilho do aviso não é "biblioteca inativa"** — o que está ausente é a condição, não a biblioteca. Essa é a correção estrutural feita nesta revisão: a redação anterior agrupava por pacote ("em caminho ativo" × "sem caminho ativo"), o que misturava as duas coisas.

#### 6.7.1 Condicionais por advisory

Legenda da coluna **Condição**: ✅ presente · ⚠️ parcialmente presente · ❌ ausente.

**`body-parser` 1.20.2** — no caminho ativo: `app.use(express.json())` em `api/index.js`, com opções padrão (`inflate` ligado por padrão).

| Advisory | Severidade publicada | Condição exigida pelo aviso | Condição no SoftPet |
|---|---|---|---|
| **GHSA-27r3-jxmh-p828** (CVE-2026-111181, CWE-248) | **High — 7.5** · `< 1.20.9` · patch `1.20.9` | Requisição com `Content-Encoding` (ex. `gzip`): um frame comprimido válido seguido de bytes excedentes. O stream de descompressão fica sem listener de erro; o erro do decoder já finalizado é relançado como **exceção não tratada e encerra o processo**. O aviso afirma: *"A single request can crash any application using `body-parser` with default options"* e *"No authentication or matching route is required, since parsing runs before routing."* | ✅ **PRESENTE** — o projeto monta `express.json()` com opções padrão, sem `inflate: false`. É o único advisory da lista cujo gatilho se completa neste código. |
| GHSA-qwcr-r2fm-qrc7 (CVE-2024-45590, CWE-405) | High — 8.7 · `< 1.20.3` · patch `1.20.3` | *"when url encoding is enabled"* — exige o parser **url-encoded** habilitado. | ❌ **AUSENTE** — o projeto monta apenas `express.json()`. `express.urlencoded()` não é usado. |
| GHSA-v422-hmwv-36x6 (CWE-770) | Low · `< 1.20.6` · patch `1.20.6` | Exige um valor de **`limit` inválido**, que desativa silenciosamente a verificação de tamanho. | ❌ **AUSENTE** — `express.json()` é chamado sem opções; o `limit` usado é o padrão. |

**`qs` 6.11.0** — no caminho ativo: confirmado no código instalado (`express/lib/middleware/query.js` chama `qs.parse(val, opts)` com `allowPrototypes = true`). É por aqui que o `?search=` da SEC-001 chega.

| Advisory | Severidade publicada | Condição exigida pelo aviso | Condição no SoftPet |
|---|---|---|---|
| GHSA-6rw7-vpxm-498p (CVE-2025-15284, CWE-20) | Moderate — 6.3 · `< 6.14.1` · patch `6.14.1` | Notação de colchetes (`a[]=1&a[]=2`) com `arrayLimit` estourado. O **próprio aviso** registra que o `parameterLimit` padrão (1000) limita o cenário e que *"the practical DoS risk is negligible"*, aumentando apenas se `parameterLimit` for elevado manualmente. | ⚠️ **PRESENTE, MITIGADA PELO PADRÃO** — o parse é usado, mas o projeto não altera `parameterLimit`. |
| GHSA-4mjr-xmp4-gh2g (CVE-2026-82417, CWE-248/703) | Moderate — 6.3 · `>= 2.2.5, < 6.16.0` · patch `6.16.0` | Exige um **round-trip `parse` → `stringify`**. O `parse` precisa preservar a chave `constructor` (o aviso cita `plainObjects: true` **ou** `allowPrototypes: true` — e o Express instala `allowPrototypes: true`), e o **throw acontece no `qs.stringify`**. | ⚠️ **PARCIALMENTE PRESENTE** — o lado do `parse` está confirmado no código instalado, mas o lado do throw **não é alcançado**: o projeto nunca chama `qs.stringify`. O valor vai direto para o template literal da SEC-001. |
| GHSA-w7fw-mjwx-w883 (CVE-2026-2391, CWE-20) | Low — 3.7 · `>= 6.7.0, <= 6.14.1` · patch `6.14.2` | Exige a opção **`comma: true`** habilitada (o aviso diz explicitamente *"not the default, but configurable in applications"*). | ❌ **AUSENTE** — nem o Express nem o projeto habilitam `comma`. |
| GHSA-6pq8-jhm2-2vcw (CWE-248/704) | Moderate · `>= 6.7.0, <= 6.16.0` | Só se aplica a **`qs.stringify`** com `arrayFormat: 'comma'`. | ❌ **AUSENTE** — o projeto não chama `stringify`. |

**`path-to-regexp` 0.1.7** — **está no caminho ativo** (corrigido nesta revisão): `express/lib/router/layer.js` faz `this.regexp = pathRegexp(path, this.keys = [], opts)` para cada rota. A condição dos avisos, porém, não se completa.

| Advisory | Severidade publicada | Condição exigida pelo aviso | Condição no SoftPet |
|---|---|---|---|
| GHSA-9wv6-86v2-598j (CVE-2024-45296, CWE-1333) | High — 7.7 · `< 0.1.10` · patch `0.1.10` | **Dois ou mais parâmetros dentro do mesmo segmento**, separados por algo que não seja `.` (ex. `/:a-:b`). | ❌ **AUSENTE** — as rotas são `/`, `/:id`. Um único parâmetro por segmento. |
| GHSA-rhx6-c78j-4q9w (CVE-2024-52798, CWE-1333) | High — 7.7 · `< 0.1.12` · patch `0.1.12` | Mesmo gatilho (o aviso remete ao CVE-2024-45296): *"Avoid using two parameters within a single path segment"*. | ❌ **AUSENTE** — idem. |
| GHSA-37ch-88jc-xwx2 (CVE-2026-4867, CWE-1333) | High — 7.5 · `< 0.1.13` · patch `0.1.13` | **Três ou mais parâmetros** no mesmo segmento (ex. `/:a-:b-:c`). | ❌ **AUSENTE** — idem. |

**`express` 4.19.2** — no caminho ativo (todas as requisições passam por ele).

| Advisory | Severidade publicada | Condição exigida pelo aviso | Condição no SoftPet |
|---|---|---|---|
| GHSA-qw6h-vgh9-j6wx (CVE-2024-43796, CWE-79) | Low — **2.3** (CVSS v4) · `< 4.20.0` · patch `4.20.0` | XSS via **`response.redirect()`** com URL controlada pelo usuário. O próprio aviso enumera a cadeia completa: o atacante controla a entrada do `redirect()`, o template precisa aparecer antes do redirecionamento, o navegador não pode ter completado o redirecionamento antes, e **o usuário precisa clicar no link do template**. | ❌ **AUSENTE** — `res.redirect()` nunca é chamado no projeto. |

> **Atribuição conferida nesta rodada** contra a página do advisory: este GHSA pertence **ao `express`** — pacote `express`, faixa `< 4.20.0`, patch `4.20.0`, CVE-2024-43796 — e não ao `path-to-regexp`. A tabela acima já o trazia no lugar correto; a conferência fica registrada porque a análise agregada da sessão anterior era o lugar onde esse tipo de troca acontecia.

**`proxy-addr` 2.0.7** — carregado pelo Express, mas só é exercido quando há decisão baseada em IP.

| Advisory | Severidade publicada | Condição exigida pelo aviso | Condição no SoftPet |
|---|---|---|---|
| GHSA-jqcg-44mw-7w3h (CVE-2026-90711, CWE-290/348/697) | **Critical — 9.1** · `>= 1.1.0, < 2.0.8` · patch `2.0.8` | Uma **trust subnet configurada** em notação IPv4-mapped IPv6 com prefixo curto (ex. `::ffff:10.0.0.0/8`), combinada com **decisão de segurança baseada em IP** (controle de acesso, rate limit, geolocalização, auditoria). | ❌ **AUSENTE** — o projeto não define `trust proxy`, não usa `req.ip` nem `req.ips`, e não tem nenhuma decisão baseada em IP. Sem trust subnet configurada, o gatilho do aviso não existe. |

**Demais pacotes reportados:**

| Pacote | Advisory | Severidade | Condição | Por quê |
|---|---|---|---|---|
| `cookie` 0.6.0 | GHSA-pxg6-pf52-xh8x (CWE-74) | Low · `< 0.7.0` | ❌ AUSENTE | O projeto não define nem lê cookies nem sessões. |
| `send` 0.18.0 | GHSA-m6fv-jmcg-4jfg (CWE-79) | Low · `< 0.19.0` | ❌ AUSENTE | O projeto não serve arquivos estáticos; `express.static` não é montado. |
| `serve-static` 1.15.0 | GHSA-cm22-4g7w-348p (CWE-79) | Low · `<= 1.16.0` | ❌ AUSENTE | Idem. |
| `brace-expansion` 1.1.11 | 8 advisories (CWE-400/407/674/770) | até **High** | ❌ AUSENTE | Alcançado via `minimatch` ← `nodemon`. **Correção desta rodada:** `nodemon` está declarado em **`dependencies`** de `api/package.json` (não em `devDependencies`), e o **único script `start`** da API é `nodemon index.js`. Portanto essa árvore **está no caminho de partida da API exatamente como o projeto está hoje** — a redação anterior, que a tratava como fora do runtime de produção, estava errada. O que sustenta o ❌ é outro fato, e é o que os advisories exigem: o glob processado vem de configuração/arquivo local, **nunca de entrada de requisição**. |
| `minimatch` 3.1.2 | 4 advisories (CWE-1333/407/405) | até **High** | ❌ AUSENTE | Idem — no caminho de partida via `nodemon`, condição do aviso ausente. |
| `picomatch` 2.3.1 | 2 advisories (CWE-1321/1333) | até **High** | ❌ AUSENTE | Idem (`anymatch`/`readdirp` do `chokidar`, via `nodemon`). |

#### 6.7.2 Reavaliação da severidade

**A severidade foi rederivada a partir da evidência, e não preservada do rótulo anterior.**

O resultado da análise condicionada é assimétrico: **exatamente um advisory tem a condição de disparo completa neste código** — o **GHSA-27r3-jxmh-p828** (`body-parser`, **High 7.5**, CVSS:3.1 `AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H`). Os dois casos parcialmente presentes (`qs`) dependem de um `stringify` que o projeto nunca chama ou de um `parameterLimit` que o projeto não altera, e todos os demais têm a condição ausente.

Esse advisory solitário é suficiente para mover a severidade do achado, porque:

1. **A severidade publicada é High** — e é a severidade publicada que serve de referência, não um rótulo nosso mais baixo.
2. **As condições exigidas pelo aviso estão todas presentes no código atual**: parser montado com opções padrão, `inflate` ativo, sem `limit` customizado.
3. **O impacto é indisponibilidade total**: uma única requisição encerra o processo. Não é lentidão — é o processo morrer.
4. **Não exige autenticação nem rota correspondente** — o aviso diz explicitamente que o parsing roda antes do roteamento. Ou seja, **qualquer requisição que chegue ao servidor dispara o caminho**, mesmo em rota inexistente.
5. Existe workaround documentado (`inflate: false`) e patch publicado (`1.20.9`), o que confirma que se trata de defeito real na versão usada.

**Decisão: SEC-007 sobe de MÉDIA para ALTA.**

**Atenuante registrada separadamente (não anula o achado):** o impacto depende de a porta 8800 ser alcançável por terceiros — o que **não foi verificado** (§3.5). Se a API for estritamente local, o DoS fica restrito a quem já alcança a porta. A severidade ALTA reflete o código; a **exposição** continua condicionada à rede.

**Limite desta análise:** a distinção entre condição presente e ausente é feita por **leitura de código e pela descrição dos próprios avisos**. Nenhuma das condições foi comprovada por execução. **Nenhuma vulnerabilidade foi comprovadamente explorada na aplicação** — o que está confirmado é a presença da versão na faixa do aviso e a presença, no código, das condições que o aviso descreve.

**Nenhuma dependência foi atualizada.** Nenhuma correção foi aplicada. A análise de compatibilidade de atualização pertence à etapa própria do plano.

---

## 7. Evidências das verificações executadas

### 7.1. Auditoria de dependências da API

| Item | Execução original | **Reexecução nesta revisão** |
|---|---|---|
| Comando | `npm --prefix ./api audit --package-lock-only --ignore-scripts --json` | idem |
| Executado a partir de | `D:\projetos\PetShop` (raiz) | idem |
| Árvore analisada | `api/package-lock.json` — 108 pacotes | idem — 108 pacotes |
| Node.js / npm | v22.14.0 / 11.18.0 | idem |
| Data | 2026-11-04 | **2026-11-04** |
| **Código de saída** | **1** — vulnerabilidades encontradas | **1** — idem |
| `auditReportVersion` | 2 | 2 |
| Total reportado | 11 (critical 1, high 6, moderate 1, low 3, info 0) | **11 — idem, inalterado** |

**Distinção necessária — pacotes × advisories × explorações.** Os números acima contam **pacotes reportados**, não advisories, e não são explorações. Um pacote pode carregar vários advisories e aparece **uma única vez**, na severidade mais alta entre eles. Somando o que está detalhado em §6.7.1, os 11 pacotes reportados correspondem a **29 advisories distintos**. E **nenhum foi comprovadamente explorado nesta aplicação** — a análise é estática. As três grandezas não são intercambiáveis.

**Divergência menor registrada:** a distribuição agregada do relatório (1 critical, 6 high, 1 moderate, 3 low) não reproduz exatamente a soma das severidades publicadas listadas em §6.7.1, que dá 1 critical, 5 high, 1 moderate, 4 low. A diferença é de **um item** entre as faixas *high* e *low* e **não altera nenhuma conclusão**, porque a conclusão da SEC-007 se apoia em um único advisory específico (GHSA-27r3-jxmh-p828) e não na contagem agregada. Registra-se para que a discrepância não seja lida como erro de leitura.

O código de saída 1 significa "vulnerabilidades encontradas" — não é falha de rede, autenticação, configuração nem de execução (stderr vazio, JSON completo em stdout).

**Correção de um dado de sessão anterior:** a saída original foi lida via `ConvertFrom-Json` no PowerShell e uma leitura intermediária chegou a sugerir ausência de *fix*. **Confirmação nesta revisão, com `-AsHashtable`: os 11 pacotes reportados têm `fixAvailable: true`.** Aquele dado era glitch de leitura, **não análise** — e a checagem foi feita justamente para verificar se ele havia vazado para alguma conclusão. **Não vazou**: nenhuma conclusão da auditoria anterior dependia dele.

**`fixAvailable: true` não significa atualização trivial.** Significa que o `npm audit` calculou uma remediação; como `body-parser` é **transitivo via `express`**, atualizá-lo pode implicar subir o `express`, o que é mudança de *major* — e `npm audit fix --force` está fora de cogitação sem autorização explícita. A análise de compatibilidade pertence à etapa própria.

**Manifests e lockfiles permaneceram inalterados** — `git status` no fim da sessão não mostra alteração em `package.json` nem em `api/package-lock.json`. O comando foi usado apenas para obter o relatório, sem `fix`.

**Rede:** o comando **consultou o registro npm** (ver §2.1). Nomes e versões das dependências foram enviados ao registro. Nenhum segredo nem dado pessoal saiu desta máquina.

**Arquivos temporários:** a saída das execuções foi gravada em arquivos temporários **fora do repositório** (`$env:TEMP`) e **removida ao final**, para que o conjunto final contenha apenas os documentos autorizados.

### 7.2. Verificações por leitura

| Verificação | Resultado |
|---|---|
| `dangerouslySetInnerHTML` / `innerHTML` / `document.write` / `eval()` em `src/**` | **Nenhuma ocorrência** |
| `res.redirect` / `req.ip` / `req.ips` / `trust proxy` em `api/**` | **Nenhuma ocorrência** |
| Logging (`console.*`, `morgan`, `winston`, `logger`) em `api/**` | **Nenhuma ocorrência** — a API não loga nada |
| `ReactModal.setAppElement()` | **Nunca chamado** (relevante para acessibilidade; anotado para `quality-review`) |
| `formState.errors` nos formulários | **Nunca usado** — mensagens de validação não aparecem na interface |
| **`outerHTML` / `eval()` em `src/**`** (revisão) | **Nenhuma ocorrência** — amplia a busca anterior de N/A-1 |
| **Parser de query padrão no Express instalado** | `express/lib/middleware/query.js` → `qs.parse(val, opts)` com `allowPrototypes = true`. **`qs` está no caminho do `?search=`.** |
| **Roteamento no Express instalado** | `express/lib/router/layer.js` → `pathRegexp(path, keys, opts)`. **`path-to-regexp` está no caminho de toda rota.** |
| **Versões instaladas conferidas no `node_modules`** | `express` 4.19.2 · `body-parser` 1.20.2 · `qs` 6.11.0 · `path-to-regexp` 0.1.7 |
| **Campos de erro no driver instalado** | `ErrorPacket.js` atribui `errno`/`sqlState`/`message` como propriedades próprias; `Query.js` linhas 89–90 atribuem `err.index` e `err.sql`. Base da correção de redação da SEC-002 |
| **Escape de valores no driver instalado** | `sqlstring/lib/SqlString.js`, função `format` → cada `?` é substituído por `SqlString.escape(valor)`. **Escape no cliente, não *prepared statement*.** Base do §9.5 |
| Campos de `api/db.js` nos documentos | Senha e database **não aparecem**; host e database aparecem como descritores |
| E-mails / telefones / connection strings nos documentos | Único e-mail é o de contato público do autor, no `README.md`. **Nenhum dado pessoal de terceiro foi copiado.** |
| **Visibilidade do remoto** | **Público** — página do GitHub carrega sem autenticação e exibe o selo *Public*. Base da SEC-005 |
| `git diff --check` | **Código de saída 0** |

### 7.3. Verificações NÃO executadas

| Verificação | Motivo |
|---|---|
| `npm run lint` (raiz) | **Não executada.** A raiz **passou a ter** lockfile e `node_modules` durante esta sessão (§3.4), então o lint agora **poderia** rodar — mas não rodou. **Não se afirma que o lint passa ou falha.** |
| `npm run build` (raiz) | **Não executada.** Idem — **não se afirma que o build passa ou falha.** |
| `npm test` | Nenhum script de teste existia no projeto — o script `test` da API foi **criado na sessão SOFTPET-006** (§7.6) e **executa os dois arquivos de teste desde a sessão SOFTPET-007** (§7.7). A raiz segue sem script de teste |
| `npm audit` na raiz | **EXECUTADA nesta revisão** — ver §7.4. A limitação anterior caiu porque a raiz passou a ter lockfile durante a sessão |
| Playwright / navegador | Aplicação não foi iniciada |
| Conexão ao MySQL | Fora do escopo — nenhum valor de credencial foi impresso |
| **Testes da SEC-001 (§9.7)** | **EXECUTADOS na sessão SOFTPET-006** — 22/22 passaram, código de saída 0 (§7.6); reexecutados na suíte ampliada de 37 testes da sessão SOFTPET-007 (§7.7). São testes unitários com banco simulado — não são testes HTTP/MySQL |
| **Verificação do `NO_BACKSLASH_ESCAPES` (§9.5)** | **Não executada** — exige conexão com o banco, em etapa de integração autorizada |
| **Consulta ao `information_schema` / DDL real da tabela `pets`** | **Não executada** — schema continua desconhecido |

### 7.4. Auditoria de dependências da raiz — **executada nesta revisão**

Executada porque a premissa da limitação §3.4 **deixou de ser verdadeira durante esta sessão**: a raiz passou a ter lockfile e `node_modules` às **11:42** do dia 2026-11-04. **Origem não confirmada** — não foi esta sessão (o único comando npm deste agente escreveu a saída em `$env:TEMP`, e nenhum dos dois foi escrito por ele); a ação responsável não foi observada e não é atribuída a um comando específico.

| Item | Valor |
|---|---|
| Comando | `npm audit --package-lock-only --ignore-scripts --json` |
| Executado a partir de | `D:\projetos\PetShop` (raiz) |
| Árvore analisada | `package-lock.json` da raiz — **543 pacotes** (397 prod, 74 optional, 93 peer) |
| Node.js / npm | v22.14.0 / 11.18.0 |
| Data e hora | 2026-11-04, após 11:42 |
| **Código de saída** | **1** — vulnerabilidades encontradas (stderr vazio, JSON completo) |
| `auditReportVersion` | 2 |
| **Total reportado** | **19** (critical 1, high 5, moderate 13, low 0) |

**Comparação com a API:** a raiz reporta **mais** vulnerabilidades que a API (19 × 11) e inclui **três dependências diretas** na lista — `next`, `zod` e `eslint-config-next`.

| Pacote | Direto? | Severidade do pacote | Advisories |
|---|---|---|---|
| **`next`** | **sim** | **critical** | **25 advisories**, sendo **3 critical** (GHSA-p293-qw3h-jr36, GHSA-2xp9-vwfh-vxw4, GHSA-2464-fhr4-w9xw) e **7 high** |
| **`zod`** | **sim** | **high** | 1 — GHSA-mrhx-c7xc-m3w5 (`< 4.6.6`, ou seja, toda a linha 3.x) |
| `postcss` | não | high | 4 (2 high) |
| `minimatch` | não | high | 4 (3 high) |
| `@typescript-eslint/parser` / `.../typescript-estree` | não | high | — |
| `eslint` e toda a cadeia `eslint-*` / `@eslint*` / `@humanwhocodes*` / `@next/eslint-plugin-next` / `file-entry-cache` / `flat-cache` / `glob` / `rimraf` | não | moderate | — |

**Mesma distinção de §7.1:** os **19** são **pacotes reportados**, não advisories — só o `next` concentra **25 advisories**, o que já mostra que as duas grandezas não coincidem. O total de advisories da árvore da raiz **ainda não foi contabilizado**, e **nenhum foi comprovadamente explorado**. A triagem detalhada, condição por condição, **permanece pendente**.

**O que isto muda na SEC-007:** a SEC-007 deixa de cobrir "apenas a API". A **análise por advisory** feita em §6.7 para a árvore da API **ainda não foi feita** para a árvore da raiz — em particular para os 25 advisories do `next` e o do `zod`. Ela é necessária antes de qualquer conclusão de severidade sobre o frontend, e deve seguir exatamente o mesmo método: **verificar para cada advisory se a condição de disparo existe no código**, não apenas se a biblioteca está presente.

**Presunção honesta, não conclusão:** `next` é o framework que serve a aplicação e `zod` é usado na validação dos formulários — ambos estão em caminho de código ativo. Mas "estar no caminho" **não** é o mesmo que "a condição do advisory estar presente" (foi exatamente o erro metodológico corrigido em §6.7). **Nenhuma severidade do frontend foi atribuída nesta revisão.**

**`fixAvailable`:** para a maioria dos itens da raiz o campo vem como **objeto**, não como booleano — o que significa remediação aninhada, e não upgrade direto. A leitura exige `ConvertFrom-Json -AsHashtable` e tratamento dos dois formatos. **Nenhuma dependência foi atualizada.**

### 7.5. Estado do workspace no fim da revisão — divergência registrada

O preflight no início da sessão registrou: branch `main`, HEAD `b9fc914`, stage vazio, `README.md` modificado (113+/31−) e sete documentos não rastreados — **sem divergência**.

Ao fim da revisão, `git diff --check` continua com **código de saída 0** e o stage continua **vazio**, mas o quadro mudou por fatores **externos a esta sessão**:

| Item | Situação | Origem |
|---|---|---|
| `README.md` | 113+/31− — **inalterado** desde o preflight | trabalho documental anterior |
| `api/`, `src/`, `package.json`, `api/package.json`, `api/package-lock.json`, `jsconfig.json`, `next.config.mjs`, `.gitignore` | **`git diff --numstat` vazio — intactos** | — |
| Documentos desta revisão | `SECURITY-AUDIT.md`, `memory-bank/CURRENT-STATE.md`, `memory-bank/CHANGELOG.md` | **alterados por esta sessão** |
| `package-lock.json` (raiz) | **novo**, não rastreado, 278.708 bytes, `lockfileVersion: 3` | **origem não confirmada** (timestamp 11:42) |
| `node_modules/` (raiz) | **novo**, 410 pacotes — não aparece no `status` porque o `.gitignore` só tem `/node_modules` | **origem não confirmada** (timestamp 11:42) |
| `.next/` | **60 rastreados modificados + 33 deletados + 28 novos não rastreados** — recontagem no início desta rodada; a sessão anterior registrara 92 modificados | **origem não confirmada** |

**A recontagem acima é ela mesma um dado:** o conjunto de `.next/` mudou entre as duas leituras (de 92 modificados para 60 modificados + 33 deletados + 28 novos). Houve atividade sobre o diretório entre as duas sessões, e a origem dessa atividade **não foi observada** — por isso é registrada como *origem não confirmada*, e não como build, dev ou `npm install`.

**Ressalva metodológica:** o preflight da sessão anterior não mostrou os arquivos de `.next/` porque o cache de *stat* do índice ainda não tinha sido revalidado; `git diff --check` forçou a revalidação e os revelou. **Nada em `.next/`, `node_modules/` ou lockfile foi escrito por trabalho documental** — nem pela sessão anterior, nem por esta. Registra-se para que o estado final seja exato e não pareça contradição com o preflight.

**Comando de leitura desta rodada:** `git status --porcelain` **não cobre sozinho** arquivos novos não rastreados — por isso a leitura incluiu `git ls-files --others --exclude-standard`. Os números desta seção vêm dessa leitura combinada.

---

### 7.6. Implementação da SEC-001 — sessão SOFTPET-006 (2026-11-04)

**Alteração efetivamente implementada:**

| Arquivo | O que mudou |
|---|---|
| `api/controllers/pet.js` | **Somente `getPets`.** SQL fixa com dois `LIKE ?` (placeholders fora de aspas); o valor viaja separado, como `['%termo%','%termo%']`; tipo **presente e não textual** (array, objeto, `null`, número inclusive `0`, booleano inclusive `false`) é rejeitado com **HTTP 400 e JSON fixo antes do `db.query`**; **ausência** (`undefined`) e **string vazia** preservam a lista completa. `addPets`, `updatePets` e `deletePets` inalterados |
| `api/test/getPets.test.js` | **Novo.** Testes unitários do controller real com banco simulado — um único `mock.module('../db.js')` antes do primeiro `import()` do controller, fake estável, estado reinicializado entre casos, sem concorrência, restauração ao final da suíte |
| `api/package.json` | **Somente o script `test` foi adicionado:** `node --test --experimental-test-module-mocks test/getPets.test.js`. Dependências e demais scripts preservados |

**Comandos executados e resultados** (Node v22.14.0 / npm 11.18.0, a partir da raiz):

| Execução | Comando | Resultado | Código de saída |
|---|---|---|---|
| **Antes** da correção (`getPets` original) | `npm --prefix ./api test` | 22 testes: **5 passaram, 14 falharam, 3 cancelados**. As falhas são exatamente os comportamentos corrigendos: **interpolação do termo no SQL** (o SQL real mostrava `LIKE '%Thor%'`), **ausência de valores separados** e **aceitação de entrada não textual** (grupos 9/10 consultavam o banco em vez de responder 400). Grupos 1, 1b e 2 passaram — contrato atual preservado. **Não foram erros de importação nem de flag**: os testes executaram o controller real e capturaram a falha de segurança | **1** |
| **Depois** da correção | `npm --prefix ./api test` | **22/22 passaram** (15 testes de topo + 7 subtestes), 0 falhas, 0 cancelados | **0** |

**O que os testes provam:** separação SQL × valores, placeholders na SQL fixa, valores na ordem correta, preservação integral do termo nos valores (apóstrofo, barra invertida real, Unicode, espaços, curingas), ausência do conteúdo recebido na instrução SQL, zero consultas para tipos inválidos, status e corpo das respostas, e ausência de vazamento entre casos.

**O que os testes NÃO provam:** como o driver formata a string final — isso depende do `NO_BACKSLASH_ESCAPES` real do servidor (§9.5, **não verificado**) —, o que o MySQL faz com a query, o caminho HTTP real (`?search[]=x` → array) e o navegador. **Uma resposta simulada de sucesso para `D'Angelo` não comprova que a consulta funcionaria no MySQL real.** Por isso a SEC-001 está `FIXED` com verificação por testes unitários, **não** `VERIFIED` ponta a ponta.

**Lockfiles — SHA-256 no início e no fim da sessão** (um `git diff` vazio não comprova a preservação de arquivo não rastreado):

| Arquivo | Hash inicial | Hash final |
|---|---|---|
| `package-lock.json` (raiz) | `D451A6757E02E25CBF81592859B3565EA6E2627CAFE7F6C198CEC91CABFA448C` | `D451A6757E02E25CBF81592859B3565EA6E2627CAFE7F6C198CEC91CABFA448C` — **inalterado** |
| `api/package-lock.json` | `4F96CECD37FA66D6588C54A51AB32ED2BB77ECD3F2CD9E0C6D6DEC12BF93B900` | `4F96CECD37FA66D6588C54A51AB32ED2BB77ECD3F2CD9E0C6D6DEC12BF93B900` — **inalterado** |

---

### 7.7. Implementação da SEC-002 — sessão SOFTPET-007 (2026-11-04)

**Alteração efetivamente implementada:**

| Arquivo | O que mudou |
|---|---|
| `api/controllers/pet.js` | Função privada `erroOperacao(res)` no mesmo arquivo: `res.status(500).json({ error: "Não foi possível concluir a operação." })`, usada nos callbacks de banco dos **quatro** controllers, com `return` encerrando o caminho — o callback não produz uma segunda resposta de sucesso. A resposta não depende da mensagem nem das propriedades do erro recebido. **Nenhum log do erro cru foi acrescentado** — a API continua sem logar nada (F6); a proposta original mencionava registro no servidor, e isso segue não implementado. Consultas, valores (2º argumento de `db.query`), callback (3º argumento), status e corpos de sucesso preservados. A correção da SEC-001 em `getPets` foi preservada |
| `api/test/getPets.test.js` | Restauração do mock tornada **explícita**: referência de `mock.module` guardada e restaurada em `after()`. Acrescentados os casos `search = "0"` e `search = "false"` — textos que devem executar busca parametrizada, distintos dos valores não textuais `0`/`false` que continuam respondendo 400. O teste de erro do banco foi **atualizado deliberadamente** para o novo contrato (500 + JSON fixo) — ele descrevia o comportamento anterior |
| `api/test/petErrors.test.js` | **Novo** — 13 testes cobrindo os quatro controllers reais com banco simulado: HTTP 500, corpo genérico exato, nenhuma propriedade do erro encaminhada (marcadores em `message`, `sql`, `sqlMessage`, `code`, `stack`), resposta única, caminho de sucesso com status e corpo anteriores, argumentos esperados no banco. Cobre objeto de erro **e** instância de `Error` com propriedades adicionais. Mesma disciplina de mock/importação/limpeza, independente do outro arquivo (cada arquivo roda em processo próprio) |
| `api/package.json` | Somente o script `test`, que passou a executar os dois arquivos. Dependências intocadas |
| Frontend (5 arquivos) | `src/app/page.js`, `principal.js`, `ModalCad.js`, `ModalEdit.js`, `Bloco.js`: os cinco tratamentos de erro passaram a chamar `toast.error` com mensagem textual fixa (tabela abaixo) — funciona tanto para HTTP 500 quanto para falha de rede sem `error.response`. Requisições e blocos de sucesso preservados; nada de sucesso foi acrescentado ao caminho de erro; o `setOnEdit(null)` após a cadeia de exclusão foi preservado. `Form.js` fora desta rodada |

**Mensagens fixas da interface:**

| Operação | Mensagem |
|---|---|
| Listagem inicial | Não foi possível carregar os pets. Tente novamente. |
| Pesquisa | Não foi possível pesquisar os pets. Tente novamente. |
| Cadastro | Não foi possível cadastrar o pet. Tente novamente. |
| Edição | Não foi possível atualizar o pet. Tente novamente. |
| Exclusão | Não foi possível remover o pet. Tente novamente. |

**Comandos executados e resultados** (`npm --prefix ./api test`, Node v22.14.0 / npm 11.18.0):

| Execução | Resultado | Código de saída |
|---|---|---|
| Estado inicial (suíte existente de 22 testes, antes de alterar o contrato) | **22/22 passaram** — igual ao fim da sessão SOFTPET-006 | **0** |
| **Antes** da correção nos controllers (testes novos escritos — 37 testes) | **28 passaram, 9 falharam, 0 cancelados.** As 9 falhas são exatamente os testes de erro da SEC-002 nos quatro controllers (incluindo o grupo 11 atualizado de `getPets`); todas falharam na asserção de status (`null !== 500`) — o controller respondia com o objeto interno do driver sem definir status de erro. Sem erros de importação, isolamento ou mock | **1** |
| **Depois** da correção | **37/37 passaram**, 0 falhas, 0 cancelados | **0** |

**Separação do que foi verificado:** backend verificado por **testes unitários com banco simulado**; frontend revisado **por leitura do código e do diff**. **Integração HTTP, navegador e banco real continuam pendentes** — esta rodada não é validação completa de todos os erros possíveis da aplicação.

**Lockfiles:** SHA-256 idênticos no início e no fim da sessão (raiz `D451A675…BFA448C`; `api/` `4F96CECD…F93B900` — hashes completos em §7.6). Nenhuma dependência instalada ou atualizada, nenhum lockfile regenerado.

---

## 8. Anotações para a futura `quality-review`

Registradas sem ampliar esta auditoria:

- Lista de cards renderizada sem `key` em `principal/principal.js`.
- `ModalEdit.js` sobrescreve os handlers `onChange` do `register()` com estado manual.
- Exclusão combina botão `type="submit"` dentro de `<form>` com requisição no `onClick`.
- Exclusão não atualiza a lista nem fecha o modal.
- `formState.errors` não é usado — mensagens de validação não aparecem na interface.
- `console.log` residual em `ModalDel.js` (imprime dados do pet no console do navegador).
- Sort no cliente em `page.js` usa campo inexistente (`nome`).
- `page.module.css` vazio, mas importado. Fonte Ubuntu importada duas vezes.
- `eslint-config-next` em `dependencies` em vez de `devDependencies`.
- `styled-components` usado sem plugin SWC/Babel configurado.
- `ReactModal.setAppElement()` nunca chamado.
- URL da API repetida em 6 arquivos.
- Sem estados de carregamento, erro e ausência de resultados. Sem media queries.
- `mysql.createConnection()` em lugar de pool.

---

## 9. Plano de implementação da SEC-001

> **Atualização de estado (sessão SOFTPET-006, 2026-11-04):** o plano abaixo foi **implementado** em `getPets` e verificado por testes unitários com banco simulado — evidência em §7.6. A matriz de §9.7 foi executada integralmente (22/22). A descrição do plano é preservada como histórico; onde ele diz "nesta sessão" no passado, refere-se à sessão de planejamento.

### 9.1 Causa

Em `api/controllers/pet.js`, a função `getPets` monta a query por **concatenação de template literal** e a entrega ao driver como **string única**, sem array de valores:

```js
db.query(q, (err, data) => { ... });   // ← sem valores: o texto do usuário já está dentro do SQL
```

O texto vindo de `?search=` entra **na posição da sintaxe**, não na posição do dado. É a única consulta do projeto que não é parametrizada — `addPets`, `updatePets` e `deletePets` já usam placeholder `?` corretamente. A correção consiste em mover o valor do usuário da sintaxe para os valores.

### 9.2 Comportamentos a preservar (contrato atual)

A correção **não pode alterar nenhum** dos comportamentos abaixo. Cada linha é uma asserção de teste.

| # | Situação | Comportamento atual | Deve continuar igual? |
|---|---|---|---|
| 1 | `search` **ausente** | Retorna a lista completa | ✅ Sim |
| 2 | `search` **string vazia** | `""` é *falsy* → cai no ramo sem `WHERE` → **lista completa** | ✅ Sim — preserva o comportamento atual, mesmo sendo contra-intuitivo |
| 3 | `search` não vazio | Busca parcial em `namePet` **OU** `nameDono` | ✅ Sim |
| 4 | Ordenação | `ORDER BY namePet` nos dois ramos | ✅ Sim |
| 5 | Curingas `%` e `_` enviados pelo usuário | Continuam **curingas** | ✅ Sim — *literalizar* curinga seria **mudança funcional extra**, não faz parte desta correção |
| 6 | Apóstrofo, barra invertida, Unicode, texto com cara de SQL | Devem ser tratados como **dado** | ✅ Este é o objetivo da correção |
| 7 | `String(...)` | **Não** deve ser introduzido como coerção | ✅ Ver §9.4 |
| 8 | *trim*, normalização, limite arbitrário de tamanho | Não existem hoje | ✅ Não adicionar sem justificativa própria — seria mudança funcional |

### 9.3 Forma da correção

No ramo de busca, a **string SQL passa a ser constante** (não depende do valor do usuário) e o valor viaja **separado, como valor**:

```js
// como é hoje (esquemático):  valor do usuário dentro da string
`SELECT ... WHERE namePet LIKE '%${searchTerm}%' OR nameDono LIKE '%${searchTerm}%' ...`

// como deve ficar (esquemático): SQL constante + valores separados
"SELECT ... WHERE namePet LIKE ? OR nameDono LIKE ? ..."   // dois placeholders
db.query(q, [`%${searchTerm}%`, `%${searchTerm}%`], cb)     // o texto vai aqui
```

Os `%` são adicionados **pela aplicação** ao redor do valor — é assim que o `LIKE` continua funcionando sem interpolar o dado na sintaxe.

### 9.4 Por que `String(...)` não resolve — e por que tipo inesperado vira 400

Se a correção usasse `String(searchTerm)` para "consertar" tipos, ela **mascarrar** o problema em vez de resolvê-lo:

- `String(['a','b'])` → `"a,b"` — uma busca por lista vira busca por texto concatenado, silenciosamente.
- `String({})` → `"[object Object]"` — o usuário busca um objeto e recebe uma lista vazia, sem erro e sem explicação.

Isso importa porque **esses tipos são alcançáveis de verdade**: o `qs` instalado está no caminho de análise (confirmado em `express/lib/middleware/query.js`), e `?search[]=a&search[]=b` produz um **array** em `req.query.search`, enquanto `?search[a]=b` produz um **objeto**. O zod do `SearchFilter` só protege o fluxo do formulário — qualquer chamador direto da API passa por cima dele.

**Decisão de contrato — com o caso da ausência preservado:** a **ausência** do parâmetro (`req.query.search === undefined`) **não é um tipo inesperado** — é justamente o caminho que hoje produz a lista completa, e **é esse o comportamento que continua valendo**. Não se pode transformar `undefined` em erro por simetria com os outros tipos: `undefined` significa "não foi enviado", não "foi enviado um valor de tipo errado". A rejeição com **HTTP 400 antes de tocar o banco** — zero chamadas ao `db.query` — vale para o que **existe mas não é texto**: array, objeto, número, booleano e `null`. A resposta é um JSON **definido e fixo**, por exemplo `{ "error": "Parâmetro 'search' deve ser um texto." }`, **sem refletir de volta o conteúdo recebido** — refletir o valor do usuário na resposta é o que abre reflexo indevido e não é necessário para o contrato. A **string vazia** continua no caminho atual (lista completa), conforme §9.2.

**Escopo desta validação:** ela é **específica do parâmetro `search`** e existe porque a correção da interpolação exige saber o que é string e o que não é. Ela **não** é a correção completa da SEC-004 (validação de todos os campos de escrita, limites de tamanho, formato de telefone) — essa continua achado próprio, com escopo maior.

### 9.5 Como o placeholder funciona de fato (ponto crítico)

Conforme o readme oficial do driver na versão resolvida — <https://github.com/mysqljs/mysql/blob/v2.18.1/Readme.md#escaping-query-values>:

> *"This looks similar to prepared statements in MySQL, however it really just uses the same `connection.escape()` method internally."*
> *"Caution: This also differs from prepared statements in that all `?` are replaced, even those contained in comments and strings."*

Ou seja: **os placeholders do driver `mysql` são escape no cliente, não *prepared statement* no servidor.** A query é montada como string no processo Node (confirmado em `sqlstring/lib/SqlString.js`, função `format`, que substitui cada `?` por `SqlString.escape(valor)`) e enviada como `COM_QUERY` — não como `COM_STMT_PREPARE`/`COM_STMT_EXECUTE`.

**Consequência registrada:** o readme impõe uma condição explícita —

> *"Caution: These methods of escaping values only works when the **NO_BACKSLASH_ESCAPES** SQL mode is disabled (which is the default state for MySQL servers)."*

Logo a correção depende do **modo SQL do servidor**. O `NO_BACKSLASH_ESCAPES` está desabilitado na instância MySQL real deste projeto? **Não se sabe** — não há DDL nem configuração no repositório, e nenhuma conexão foi tentada. **Isso fica registrado como pendência de verificação em etapa de integração autorizada**, não como pressuposto. Se o modo estiver ligado, o escape do driver se comporta de outro modo e a correção precisa ser reavaliada antes de ser dada como boa.

### 9.6 Arquivos a alterar

| Arquivo | O que muda |
|---|---|
| `api/controllers/pet.js` | **Arquivo-alvo.** Mudança localizada na função `getPets` (linhas 3–14). É a correção mínima e suficiente para o achado. |
| `api/test/getPets.test.js` | **Novo.** Testes descritos em §9.7. |
| `api/package.json` | Adicionar script `test` apontando para o comando de §9.8 — **decisão a confirmar antes de implementar**, pois mexe em manifesto. |

**Não entra no escopo:** `api/db.js`, `api/index.js`, `api/routes/pets.js`, qualquer arquivo de `src/`, qualquer *lockfile*. A mudança é **localizada no controller**, como preferido.

**Separação explícita de assuntos:** a ausência de `encodeURIComponent` em `src/pages/principal/principal.js` (`` axios.get(`http://localhost:8800?search=${searchTerm}`) ``) é um **assunto de codificação de URL, distinto da interpolação SQL**, e **não** é incorporado a esta correção. Uma coisa é como o valor chega ao servidor, outra é como o servidor o trata. São achados separados e não devem ser fundidos numa única mudança.

### 9.7 Matriz de testes

Os testes executam o **controller real** (`getPets` importado de `api/controllers/pet.js`), com a **consulta ao banco simulada**. Não são testes HTTP nem testes de MySQL.

**Costura (seam) — corrigida nesta rodada:** `api/db.js` exporta `export const db = mysql.createConnection({...})`. O mock é feito por **mock de módulo ESM** — `node:test` com `--experimental-test-module-mocks` e `t.mock.module('../db.js', { namedExports: { db: fakeDb } })`.

**Não assumir que repetir `import()` do mesmo especificador cria um módulo novo.** O importador ESM mantém o módulo no registro depois do primeiro carregamento: um segundo `import('../controllers/pet.js')` devolve a **mesma instância**, e o controller continuaria preso ao `db` capturado na primeira importação. A redação anterior — "registrar o fake dentro de cada teste e importar o controller com `await import()` depois, para que cada teste reavalie o módulo e receba seu próprio fake" — **não se sustenta** por esse caminho, e foi corrigida.

**Estratégia adotada no plano:** registrar **um único mock de `../db.js` antes do primeiro `import()` do controller**, manter **o mesmo objeto simulado** durante todo o arquivo de teste, e **reinicializar comportamento e histórico de chamadas entre os casos** — limpar a lista de chamadas e reatribuir o que o fake devolve no início de cada caso. Os casos rodam **sem concorrência** (sem `concurrency` nem `t.concurrent`), para que o estado compartilhado do fake não se misture entre eles. O `fakeDb` é um objeto estável com um `reset()` interno chamado por cada caso.

> Alternativa aceita, se o mock de módulo ESM mostrar instabilidade na prática: um *seam* explícito — o controller recebe o `db` por parâmetro com valor padrão apontando para o módulo. Qualquer uma das duas rotas exige decisão antes de implementar.

Referências da documentação oficial (consultadas nesta rodada, usadas como *informação*): <https://nodejs.org/download/release/v22.14.0/docs/api/test.html#mockmodulespecifier-options> e <https://nodejs.org/download/release/v22.14.0/docs/api/esm.html#urls>.

| # | `req.query.search` | `db.query` chamado? | SQL esperada (1º arg.) | Valores esperados (2º arg.) | Resposta esperada |
|---|---|---|---|---|---|
| 1 | ausente | **sim** | sem `WHERE`, com `ORDER BY namePet` | nenhum | 200 + dados do fake |
| 2 | `""` | **sim** | sem `WHERE`, com `ORDER BY namePet` | nenhum | 200 + dados do fake |
| 3 | `"Thor"` | **sim** | SQL **constante** c/ 2 `LIKE ?` | `['%Thor%','%Thor%']` | 200 |
| 4 | `"D'Angelo"` | **sim** | **idêntica** ao caso 3 | texto cru entre `%` | 200 — **hoje cai no caminho de erro** |
| 5 | `"Café\João"` | **sim** | idêntica ao caso 3 | texto cru entre `%` | 200 |
| 6 | `"' OR 1=1 --"` | **sim** | idêntica ao caso 3 | texto cru **só nos valores** | 200 |
| 7 | `"100%"` | **sim** | idêntica ao caso 3 | `%100%%` | 200 — curinga preservado, semântica documentada |
| 8 | `"_gato"` | **sim** | idêntica ao caso 3 | `%_gato%` | 200 — curinga preservado |
| 9 | `['a','b']` (array) | **NÃO — 0 chamadas** | — | — | **HTTP 400**, JSON fixo, valor não refletido |
| 10 | `{constructor:{isBuffer:'x'}}` | **NÃO — 0 chamadas** | — | — | **HTTP 400** |
| 11 | `"Thor"` com fake devolvendo `err` | **sim** | idêntica ao caso 3 | como o caso 3 | comportamento de erro **inalterado** (contrato atual preservado) |
| 12 | `"Thor"` com fake devolvendo dados | **sim** | idêntica ao caso 3 | como o caso 3 | 200 + corpo **idêntico** ao retornado pelo fake |

**O que os testes provam:** separação SQL × parâmetros, argumentos passados ao driver, contagem de chamadas e comportamento de resposta. **O que não provam:** como o driver formata a string final, nem o que o MySQL faz com ela — ver §9.9.

### 9.8 Comando previsto (não executado nesta sessão)

```
node --test --experimental-test-module-mocks api/test/getPets.test.js
```

Executar a partir da raiz do repositório. Node v22.14.0 já possui `node:test` e a flag — **nada precisa ser instalado**. Se o script `test` for adicionado ao `api/package.json`, o comando equivalente passa a ser `npm --prefix ./api test`.

### 9.9 Limites da verificação

| Camada | O que verifica | Estado |
|---|---|---|
| **Controller isolado** (mock do `db`) | SQL constante, valores separados, contagem de chamadas, status e corpo da resposta | **É o que este plano cobre** — roda sem banco, sem rede |
| **Formatação do driver** | Como `SqlString.format` monta a string final a partir de SQL + valores | **Não coberto** — depende do `NO_BACKSLASH_ESCAPES` real (§9.5) |
| **HTTP real** | Que `?search=` chega como string, e que `?search[]=x` chega como array | **Não coberto** — exige subir a API |
| **Integração MySQL** | Que a query parametrizada devolve os mesmos resultados da antiga para busca normal, e que apóstrofo/backslash/Unicode funcionam | **Não coberto** — exige banco e autorização |
| **Navegador** | Fluxo completo pelo formulário | **Não coberto** |

**Nenhuma dessas camadas foi executada nesta sessão.** O plano é documental.

### 9.10 Relação com outros achados

| Achado | Relação |
|---|---|
| **SEC-002** | **Direta.** O caso 4 da matriz (apóstrofo) **elimina hoje um gatilho real** do caminho de erro da SEC-002. Corrigir a interpolação reduz os gatilhos, mas **não corrige** a SEC-002 — o `res.json(err)` com HTTP 200 continua lá para os outros gatilhos. |
| **SEC-004** | A validação de tipo de `search` (§9.4) **pertence a esta correção** por necessidade, mas **não esgota** a SEC-004, que cobre os campos de escrita. |
| **SEC-007** | Independente. A correção não depende de atualizar dependência alguma. |
| **Codificação de URL no frontend** | Assunto separado — ver §9.6. |

### 9.11 Como revisar e desfazer apenas esta mudança

- A mudança deve ser **commitada sozinha**, tocando apenas `api/controllers/pet.js` (+ o teste novo e, se aprovado, o script em `api/package.json`).
- `git add` **explícito por arquivo** — nunca `git add .`.
- Revisar `git diff` e `git diff --cached` antes de commitar.
- Para desfazer **apenas** esta mudança: reverter o commit correspondente. Como ela não se mistura com as demais, `git revert <commit>` a remove isoladamente, sem arrastar outros achados.
- Nenhum `git add .`, nenhum commit, nenhum push foi feito nesta sessão.

---

## 10. Único próximo item

**SEC-001 (§7.6) e SEC-002 (§7.7) foram implementadas e verificadas por testes unitários com banco simulado.** O próximo passo é a **verificação de integração com MySQL** — em particular o `NO_BACKSLASH_ESCAPES` do §9.5 — em etapa própria autorizada; e a decisão sobre a atualização do `body-parser` (SEC-007), que mexe no *lockfile*.

**Prioridade recomendada após a revisão** — a redação anterior tratava todas as demais vulnerabilidades como "dependentes de decisão de produto", o que era genérico demais. A situação real é diferenciada:

| Achado | O que falta de fato antes de implementar |
|---|---|
| **SEC-001** (ALTA) | **Implementada e verificada por testes unitários com banco simulado** (§7.6). Faltam a verificação de integração com MySQL e o `NO_BACKSLASH_ESCAPES` — etapa própria |
| **SEC-007** (ALTA) | Decisão de **atualizar dependências** (`body-parser` → ≥ 1.20.9), que mexe no *lockfile*. Etapa própria. |
| **SEC-005** (MÉDIA) | A **rotação da credencial passou a ser acionável agora** — o repositório é público (§SEC-005). Não depende de decisão de produto. |
| **SEC-002** (MÉDIA) | **Implementada na sessão SOFTPET-007** (§7.7): HTTP 500 + JSON genérico fixo nos quatro controllers e mensagens fixas nos cinco tratamentos da interface. Faltam a verificação ponta a ponta (navegador + banco real) e os testes de id inexistente, que interagem com a SEC-003 |
| **SEC-004** (MÉDIA) | Depende de definir **limites de tamanho e formato** (notadamente `telefone`, sem validação em lugar nenhum). |
| **SEC-006** (MÉDIA) | Depende de **decisão de produto**: contexto de uso e exposição real da porta. É o único que genuinamente trava aí. |
| **SEC-003** (BAIXA) | Encaminhado à `quality-review`. Correção simples, sem dependência de decisão. |

**Quando a SEC-001 precisaria ter sido executada antes da evolução — e quando poderia entrar nela.** Escrito antes da implementação; **a SEC-001 foi implementada na sessão SOFTPET-006**, então a questão prática deixou de existir para o MySQL. O raciocínio permanece válido para a futura migração: a troca de banco **não encerra a SEC-001 por si só** — o código resultante precisa usar consultas seguras e ter evidência de verificação, seja qual for o banco, e a matriz de §9.7 agora existente é a especificação de comportamento que deve ser transportada e executada contra o novo acesso a dados.

Condição para executar: a correção deve ter sua própria verificação, conforme a regra de verificações proporcionais.
