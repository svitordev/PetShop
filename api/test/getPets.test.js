// Testes isolados do controller real (SEC-001 — api/controllers/pet.js, getPets).
// Banco simulado por mock de módulo ESM; sem HTTP, sem portas, sem conexão com MySQL.
// Estratégia de isolamento (SECURITY-AUDIT.md §9.7): um único mock.module('../db.js')
// registrado ANTES do primeiro import() do controller; o importador ESM mantém o
// módulo no registro, então o controller é importado uma única vez e recebe o fake
// estável abaixo. Chamadas e respostas são reinicializadas entre os casos, que rodam
// sem concorrência. O mock registrado no topo é restaurado ao final da suíte.

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";

// ---------------------------------------------------------------------------
// fakeDb estável — entende as duas assinaturas do driver:
//   query(sql, callback)            → usada pelo código ANTES da correção
//   query(sql, values, callback)    → usada pelo código DEPOIS da correção
// Registra argumentos e entrega respostas controladas. Não interpreta SQL.
// ---------------------------------------------------------------------------

const calls = []; // { sql, values, argc }
let fakeResponse = { err: null, data: [] };

const fakeDb = {
  query(...args) {
    const cb = args[args.length - 1];
    const sql = args[0];
    const values = args.length >= 3 ? args[1] : undefined;
    calls.push({ sql, values, argc: args.length });
    cb(fakeResponse.err, fakeResponse.data);
  },
};

const dbMock = mock.module("../db.js", { namedExports: { db: fakeDb } });

// Restauração explícita do mock ao final da suíte — o comentário do cabeçalho
// acima passa a corresponder ao código executado.
after(() => dbMock.restore());

// Importação única do controller real, depois de registrado o mock.
const { getPets } = await import("../controllers/pet.js");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function reset() {
  calls.length = 0;
  fakeResponse = { err: null, data: [] };
}

function mockRes() {
  return {
    statusCode: null, // null = nunca chamado — responde com 200 por padrão do Express
    body: undefined,
    jsonCalled: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      this.jsonCalled = true;
      return this;
    },
  };
}

// Executa o controller com req.query.search = value (ou sem a chave, quando omitido).
function run(search, present = true) {
  const req = { query: {} };
  if (present) req.query.search = search;
  const res = mockRes();
  getPets(req, res);
  return res;
}

// SQL fixa esperada para busca textual: placeholders fora de aspas, conteúdo do
// usuário apenas nos valores. Idêntica à SQL da correção (§9.3).
const SQL_BUSCA =
  "SELECT * FROM pets WHERE namePet LIKE ? OR nameDono LIKE ? ORDER BY namePet;";
const SQL_TODOS = "SELECT * FROM pets ORDER BY namePet";

// ---------------------------------------------------------------------------
// Grupo 1 — busca ausente (contrato preservado: lista completa)
// ---------------------------------------------------------------------------

test("grupo 1 — search ausente: lista completa, sem WHERE, com ORDER BY namePet", () => {
  reset();
  const dados = [{ id: 1, namePet: "Thor" }];
  fakeResponse = { err: null, data: dados };

  const res = run(undefined, false);

  assert.equal(calls.length, 1, "deve consultar o banco exatamente uma vez");
  assert.equal(calls[0].sql, SQL_TODOS);
  assert.equal(calls[0].values, undefined, "sem valores separados neste ramo");
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, dados);
});

test("grupo 1b — search undefined presente no objeto: mesmo caminho de lista completa", () => {
  reset();
  const dados = [{ id: 1, namePet: "Thor" }];
  fakeResponse = { err: null, data: dados };

  const res = run(undefined, true);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_TODOS);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, dados);
});

// ---------------------------------------------------------------------------
// Grupo 2 — string vazia (contrato atual preservado: lista completa)
// ---------------------------------------------------------------------------

test("grupo 2 — string vazia: mantém o comportamento atual de listar todos", () => {
  reset();
  const dados = [{ id: 1, namePet: "Thor" }];
  fakeResponse = { err: null, data: dados };

  const res = run("");

  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_TODOS);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, dados);
});

// ---------------------------------------------------------------------------
// Grupo 3 — busca textual comum: SQL fixa + valores separados nos dois campos
// ---------------------------------------------------------------------------

test("grupo 3 — 'Thor': SQL fixa com placeholders e valores ['%Thor%','%Thor%']", () => {
  reset();
  const res = run("Thor");

  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, ["%Thor%", "%Thor%"]);
  assert.ok(!calls[0].sql.includes("Thor"), "o termo não pode aparecer na SQL");
  assert.equal(res.statusCode, 200);
});

// ---------------------------------------------------------------------------
// Grupo 3b — "0" e "false" são TEXTOS: busca textual parametrizada normal.
// Diferem dos valores não textuais 0 e false (grupo 10), que respondem 400.
// ---------------------------------------------------------------------------

test("grupo 3b — search \"0\": busca textual parametrizada, não 400", () => {
  reset();
  const res = run("0");

  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, ["%0%", "%0%"]);
  assert.equal(res.statusCode, 200);
});

test("grupo 3b — search \"false\": busca textual parametrizada, não 400", () => {
  reset();
  const res = run("false");

  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, ["%false%", "%false%"]);
  assert.equal(res.statusCode, 200);
});

// ---------------------------------------------------------------------------
// Grupo 4 — apóstrofo: hoje quebra a sintaxe; com a correção viaja só nos valores
// ---------------------------------------------------------------------------

test("grupo 4 — \"D'Angelo\": apóstrofo preservado integralmente nos valores", () => {
  reset();
  const res = run("D'Angelo");

  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, ["%D'Angelo%", "%D'Angelo%"]);
  assert.ok(!calls[0].sql.includes("D'Angelo"));
  assert.equal(res.statusCode, 200);
});

// ---------------------------------------------------------------------------
// Grupo 5 — barra invertida real (o literal abaixo contém UMA barra invertida)
// ---------------------------------------------------------------------------

test("grupo 5 — texto com barra invertida real: preservada integralmente nos valores", () => {
  reset();
  const termo = "Café\\João"; // JS: "\\." produz o caractere \
  assert.equal(termo.includes("\\"), true, "o literal deve conter barra invertida real");

  const res = run(termo);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, [`%${termo}%`, `%${termo}%`]);
  assert.equal(res.statusCode, 200);
});

// ---------------------------------------------------------------------------
// Grupo 6 — Unicode preservado
// ---------------------------------------------------------------------------

test("grupo 6 — texto Unicode: preservado integralmente nos valores", () => {
  reset();
  const termo = "café-japonês 🐾";

  const res = run(termo);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, [`%${termo}%`, `%${termo}%`]);
  assert.equal(res.statusCode, 200);
});

// ---------------------------------------------------------------------------
// Grupo 7 — aparência de SQL injection: conteúdo só nos valores
// ---------------------------------------------------------------------------

test("grupo 7 — payload \"' OR 1=1 --\": texto cru apenas nos valores, SQL inalterada", () => {
  reset();
  const termo = "' OR 1=1 --";

  const res = run(termo);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.ok(!calls[0].sql.includes("OR 1=1"), "payload não pode entrar na SQL");
  assert.deepEqual(calls[0].values, [`%${termo}%`, `%${termo}%`]);
  assert.equal(res.statusCode, 200);
});

// ---------------------------------------------------------------------------
// Grupo 8 — curingas e espaços: sem escape, sem trim (semântica atual preservada)
// ---------------------------------------------------------------------------

test("grupo 8 — '100%' e '_gato' continuam curingas; espaços são preservados", () => {
  reset();
  run("100%");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, ["%100%%", "%100%%"]);

  reset();
  run("_gato");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, ["%_gato%", "%_gato%"]);

  reset();
  run("  Thor  ");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, ["%  Thor  %", "%  Thor  %"]);
});

// ---------------------------------------------------------------------------
// Grupo 9 — array: 400 antes do banco, zero consultas, valor não refletido
// ---------------------------------------------------------------------------

test("grupo 9 — array: HTTP 400 com JSON fixo e zero chamadas ao banco", () => {
  reset();
  const res = run(["a", "b"]);

  assert.equal(calls.length, 0, "nenhuma consulta deve ser executada");
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: "Parâmetro 'search' deve ser um texto." });
  assert.ok(!JSON.stringify(res.body).includes("a,b"), "o valor não pode ser refletido");
});

// ---------------------------------------------------------------------------
// Grupo 10 — tipos não textuais presentes: 400 antes do banco, zero consultas
// ---------------------------------------------------------------------------

test("grupo 10 — objeto, null, número (inclusive 0) e booleano (inclusive false): 400 e zero consultas", async (t) => {
  const casos = [
    ["objeto", { constructor: { isBuffer: "x" } }],
    ["objeto simples", { a: "b" }],
    ["null", null],
    ["número", 42],
    ["número zero", 0],
    ["booleano true", true],
    ["booleano false", false],
  ];

  for (const [nome, valor] of casos) {
    await t.test(`  ${nome}`, () => {
      reset();
      const res = run(valor);

      assert.equal(calls.length, 0, `${nome}: nenhuma consulta ao banco`);
      assert.equal(res.statusCode, 400, `${nome}: deve responder 400`);
      assert.deepEqual(res.body, { error: "Parâmetro 'search' deve ser um texto." });
    });
  }
});

// ---------------------------------------------------------------------------
// Grupo 11 — erro controlado do fake: NOVO contrato da SEC-002 (SOFTPET-007).
// Este teste descrevia o comportamento anterior (HTTP 200 com o erro cru) e foi
// atualizado deliberadamente para exigir o contrato corrigido.
// ---------------------------------------------------------------------------

test("grupo 11 — erro do banco: HTTP 500 com JSON genérico fixo (SQL e valores da busca preservados)", () => {
  reset();
  const err = { code: "ER_X", message: "erro simulado" };
  fakeResponse = { err, data: null };

  const res = run("Thor");

  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, ["%Thor%", "%Thor%"]);
  assert.equal(res.statusCode, 500);
  assert.equal(res.jsonCalled, true);
  assert.deepEqual(res.body, { error: "Não foi possível concluir a operação." });
});

// ---------------------------------------------------------------------------
// Grupo 12 — sucesso: corpo idêntico ao devolvido pelo fake (vazio e com registros)
// ---------------------------------------------------------------------------

test("grupo 12 — sucesso com lista vazia: corpo idêntico ao retornado pelo fake", () => {
  reset();
  fakeResponse = { err: null, data: [] };

  const res = run("Thor");

  assert.equal(calls.length, 1);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, []);
});

test("grupo 12b — sucesso com registros: corpo idêntico ao retornado pelo fake", () => {
  reset();
  const registros = [
    { id: 1, namePet: "Thor", nameDono: "D'Angelo" },
    { id: 2, namePet: "Neve", nameDono: "Café\\João" },
  ];
  fakeResponse = { err: null, data: registros };

  const res = run("Thor");

  assert.equal(calls.length, 1);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, registros);
});

// ---------------------------------------------------------------------------
// Anti-vazamento entre casos: o reset de cada caso isola chamadas e respostas
// ---------------------------------------------------------------------------

test("anti-vazamento — caso novo vê exatamente as suas próprias chamadas e respostas", () => {
  reset();
  const dados = [{ id: 99, namePet: "Controle" }];
  fakeResponse = { err: null, data: dados };

  const res = run("Controle");

  assert.equal(calls.length, 1, "apenas a chamada deste caso deve existir");
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, ["%Controle%", "%Controle%"]);
  assert.deepEqual(res.body, dados, "a resposta deve ser a deste caso, não a de casos anteriores");
});
