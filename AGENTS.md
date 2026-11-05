# AGENTS.md — Ponto de entrada para agentes

Este arquivo orienta o trabalho de agentes de IA neste repositório.

## Idioma

Todo trabalho, resposta e documentação neste projeto é em **português-BR**.

## Fonte de verdade

Ordem de confiança para tomada de decisão:

1. **Código atual** do repositório;
2. **Configuração atual** (`package.json`, `next.config.mjs`, `jsconfig.json`, `.gitignore`);
3. **Testes** (inexistentes no projeto até o momento);
4. **Documentação do projeto** (`README.md`, `PROJETO.md`, `docs/`, `memory-bank/`);
5. Documentação externa;
6. Suposições.

A documentação descreve o estado observado — ela **não** substitui o código. Se documento e código divergirem, o código vence e a divergência deve ser registrada.

## Antes de alterar qualquer coisa

Leia os documentos pertinentes ao escopo da mudança:

- Escopo de produto e regras observadas → `PROJETO.md`
- Arquitetura, rotas e fluxo de dados → `docs/ARQUITETURA.md`
- Estado atual, pendências e etapa do trabalho → `memory-bank/CURRENT-STATE.md`
- Fatos, decisões e propostas já registradas → `memory-bank/DECISIONS.md`
- Histórico do trabalho documental → `memory-bank/CHANGELOG.md`

## Separação de responsabilidades

Cada etapa tem um papel próprio e não deve ser antecipada:

| Etapa | O que faz | O que **não** faz |
|---|---|---|
| Análise / discovery | Ler, conferir, diagnosticar | Não cria nem edita arquivos |
| Documentação | Registrar estado, escopo e plano | Não altera código, CSS, manifests nem lockfiles |
| Auditoria de segurança | Analisar e reportar achados | Não implementa correção sem aprovação |
| Revisão de qualidade | Analisar e reportar achados | Não refatora sem aprovação |
| Implementação | Executa uma mudança acordada | Não acumula mudanças de escopo |

## Skills

As skills abaixo fazem parte do fluxo de trabalho deste projeto e são um **papel**, não uma garantia de ferramenta disponível.

**A disponibilidade delas é uma observação do ambiente e da sessão, não uma característica permanente do repositório.** Na sessão de 2026-11-04 nenhuma estava instalada; em outra ambiente podem estar. Cada sessão deve reconfirmar e declarar o que encontrou.

Quando uma skill estiver ausente, o trabalho correspondente é feito manualmente, seguindo os mesmos princípios, e isso deve ser declarado explicitamente. Não registrar que uma skill foi executada quando não foi.

- `project-bootstrap` — discovery/plan e documentação inicial.
- `security-audit` — auditoria de segurança, com relatório próprio.
- `quality-review` — revisão de qualidade, com relatório próprio.
- `safe-implementation` — implementação controlada de uma mudança aprovada.

## Princípios de execução

- **Preservar alterações locais** preexistentes. Não fazer reset, checkout, pull nem descarte para "igualar" o workspace.
- **Não instalar nem atualizar dependências** fora do escopo aprovado.
- **Não executar** `npm audit fix --force`, `prisma migrate reset`, `db push --force-reset`, `DROP`, `TRUNCATE` nem operação destrutiva equivalente sem autorização explícita.
- **Não fazer stage, commit ou push** sem autorização. `git add` deve ser **explícito por arquivo** — nunca `git add .`.
- **Commit e push são ações separadas**, cada uma mediante autorização.
- **Verificações proporcionais à mudança**: uma correção pequena exige verificação pequena; não refatorar amplamente quando uma correção pequena resolve.
- **Revisar os documentos impactados** após qualquer mudança relevante no código.
- **Não declarar algo como verificado** apenas porque o arquivo foi lido. Verificação exige execução com evidência.

## Segredos e dados pessoais

- **Não reproduzir segredos em relatórios**, commits, documentação nem saída de ferramentas.
- Não revelar conteúdo de `.env`, `DATABASE_URL`, senhas, tokens ou strings de conexão.
- Quando for relevante, registrar **apenas o nome da variável** e a situação encontrada, com o valor ocultado.
- Dados pessoais de terceiros (nomes de clientes, telefones) não devem ser copiados para documentação; referenciar por campo, não por valor.

## Convenções observadas no repositório

Estas são **observações do estado atual**, não regras impostas:

- Alias de importação `@/*` → `./src/*` (`jsconfig.json`).
- Componentes compartilhados vivem em `src/pages/componentes/`, embora `src/pages` participe da convenção de roteamento do Pages Router.
- `next.config.mjs` não define `pageExtensions`.
- `.gitignore` da raiz contém apenas `/node_modules`.
