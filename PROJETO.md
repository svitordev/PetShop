# PROJETO.md — Escopo e funcionalidades do SoftPet

> Documento descritivo do produto **existente**. Nada aqui foi inventado: cada afirmação vem do código ou está marcada como hipótese/pendente de verificação.

## Estado das afirmações

| Marcação | Significado |
|---|---|
| **CONFIRMADO** | Lido diretamente no código deste repositório |
| **HIPÓTESE** | Inferido do código, sem execução que o comprove |
| **NÃO VERIFICADO** | Não foi possível comprovar nesta sessão |

Nenhuma funcionalidade listada abaixo foi **executada e validada** em navegador ou contra banco real.

---

## 1. Escopo atual

Sistema de cadastro de pets para petshop, com uma tela única. Cada registro reúne o animal e o responsável pelo animal **na mesma tabela**, e oferece um link de contato via WhatsApp.

**Não existem** no código, até onde foi possível verificar: agendamento, estoque, vendas, prontuário, usuários, autenticação e multi-tenant. A ausência de login é coerente com um uso local/single-operator, mas precisa ser avaliada pela auditoria de segurança à luz da exposição real do sistema.

---

## 2. Funcionalidades implementadas

| Funcionalidade | Onde está | Estado |
|---|---|---|
| Listagem inicial de pets | `src/app/page.js` → `getPets()`; `api/controllers/pet.js` → `getPets` | Implementada, NÃO VERIFICADA |
| Busca por nome do pet ou do dono | `src/components/SearchFilter.js`; backend `getPets` com `?search=` | Implementada, NÃO VERIFICADA |
| Cadastro de pet | `src/components/modal/ModalCad.js`; backend `addPets` | Implementada, NÃO VERIFICADA |
| Detalhe / expansão do card | `src/components/bloco-info/Bloco.js` | Implementada, NÃO VERIFICADA |
| Edição | `src/components/modal/ModalEdit.js`; backend `updatePets` | Implementada, NÃO VERIFICADA |
| Exclusão | `src/components/modal/ModalDel.js`; backend `deletePets` | Implementada com lacunas — ver §5 |
| Contato via WhatsApp | `Bloco.js`, link `wa.me` | Implementada, NÃO VERIFICADA |

---

## 3. Campos identificados no código

Campos observados nas queries de `api/controllers/pet.js` e nos formulários. **O DDL da tabela não foi encontrado no repositório** — a estrutura real da tabela `pets` (tipos, chaves, constraints) é desconhecida.

| Campo | Usado em | Formulário | Observação |
|---|---|---|---|
| `id` | `PUT /:id`, `DELETE /:id` | — | Gerado pelo banco; origem não verificada |
| `namePet` | INSERT, UPDATE, LIKE, ORDER BY | Texto | Obrigatório no zod dos modais |
| `nameDono` | INSERT, UPDATE, LIKE | Texto | Obrigatório no zod dos modais |
| `telefone` | INSERT, UPDATE | Texto | `z.string()` **sem** validação de formato |
| `animal` | INSERT, UPDATE | Radio: `cachorro` / `gato` | Obrigatório no zod; `defaultChecked` em cachorro |
| `raca` | INSERT, UPDATE | Texto | Obrigatório no zod |
| `data` | INSERT, UPDATE | `type="date"` | Obrigatório no zod |

---

## 4. Fluxos observados

### 4.1. Listagem inicial
`page.js` (`useEffect`) → `GET http://localhost:8800` → backend `SELECT * FROM pets ORDER BY namePet` → `setPets()`.

Há um sort adicional no cliente usando o campo `nome`, que **não existe** no retorno (o campo é `namePet`). O backend já ordena, então a ordenação efetiva vem do SQL. **CONFIRMADO** como inconsistência de código; efeito visual NÃO VERIFICADO.

### 4.2. Busca
`SearchFilter.js` (react-hook-form + zod, schema com campo único `name`) → `handleSearch()` → `GET /?search=<termo>` → backend monta `LIKE '%<termo>%'` em `namePet` **ou** `nameDono`.

O termo é **interpolado diretamente na string SQL**, sem parâmetro — ver `docs/ARQUITETURA.md` e a auditoria de segurança.

### 4.3. Cadastro
`ModalCad.js` → react-hook-form com `zodResolver` → `POST /` com o objeto validado → backend `INSERT` → resposta textual → `getPets()`, fecha o modal, `toast.success`.

### 4.4. Detalhe
Clique no card expande uma seção com raça, telefone (como link `https://wa.me/55<telefone>`, `target="_blank"`) e data de nascimento. O valor da data é exibido cru, sem formatação.

### 4.5. Edição
`ModalEdit.js` → `PUT /:id` → `getPets()`, fecha o modal, `toast.success`.

### 4.6. Exclusão
`ModalDel.js` exibe os dados desabilitados e a pergunta de confirmação. O botão de remover dispara a requisição `DELETE /:id` e mostra `toast.success`.

---

## 5. Regras observadas e lacunas de fluxo

### Regras observadas (CONFIRMADO no código)
- Validação de presença existe **apenas no frontend**, via zod, nos modais de criação e edição.
- `animal` é restrito a `cachorro` ou `gato` pelo formulário; o backend aceita qualquer string.
- `telefone` é texto livre, sem máscara nem validação de formato.
- `data` usa `input type="date"`, portanto chega em formato ISO `YYYY-MM-DD`.
- Pet e responsável coexistem na mesma tabela — **não há relacionamento entre tabelas distintas**.

### Lacunas de fluxo (CONFIRMADO no código)
- **Backend sem validação de entrada** — nenhum middleware nos controllers.
- **Erros do banco retornados sem status de erro** — `res.json(err)` responde com HTTP 200.
- **`updatePets` e `deletePets` não conferem o resultado da consulta** — respondem "sucesso" mesmo quando nenhuma linha é afetada.
- **Mensagens de validação dos formulários não são apresentadas na interface** — `formState.errors` não é usado em nenhum componente.
- **Exclusão combina botão `type="submit"` dentro de `<form>` com requisição disparada no `onClick`.**
- **Exclusão não atualiza a lista nem fecha o modal** — `handleDelete` só chama `setOnEdit(null)`.
- **Edição sobrescreve os handlers `onChange` do `register()`** com `value`/`onChange` manuais nos mesmos campos.
- **Lista de cards renderizada sem `key`** em `principal.js`.
- **Sem estados de carregamento, erro e ausência de resultados.**
- **`console.log` residual** em `ModalDel.js`.
- **Typo `pausaOnFocusLoss`** em `page.js` (propriedade correta: `pauseOnFocusLoss`).
- **`page.module.css` vazio**, mas importado.
- **Fonte Ubuntu importada duas vezes** (`layout.js` e `page.js`).

---

## 6. Proposta de evolução

Etapas pequenas, cada uma com sua própria verificação. A prioridade concreta deve considerar os resultados das auditorias.

1. **Documentação inicial** — este conjunto de documentos.
2. **Auditoria de segurança** — atenção inicial à busca SQL interpolada e ao tratamento de dados e erros.
3. **Revisão de qualidade.**
4. **Preparação de execução reproduzível e verificações iniciais** — lockfile na raiz, definição do banco, `.gitignore`.
5. **Correções individuais de segurança e funcionamento**, cada uma com teste correspondente.
6. **Atualizações de dependências** com análise de compatibilidade.
7. **Melhorias de interface, responsividade e acessibilidade.**

**Não deixar todos os testes para o final.** Cada correção relevante precisa de verificação própria no momento em que for feita.

Troca de stack, adoção de ORM, migração de banco ou reescrita da interface **não são obrigações** — só entram se houver necessidade comprovada, registrada em `memory-bank/DECISIONS.md`.
