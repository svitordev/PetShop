// Testes dos quatro controllers reais (SEC-002 — api/controllers/pet.js).
// Banco simulado por mock de módulo ESM; sem HTTP, sem portas, sem conexão com MySQL.
// Mesma disciplina de api/test/getPets.test.js: um único mock.module('../db.js')
// registrado ANTES do primeiro import() do controller, referência guardada para
// restauração em after(), fake estável, estado reinicializado entre os casos, sem
// concorrência. Cada arquivo de teste roda em processo próprio — este arquivo não
// depende do estado do outro.

import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mock } from "node:test";

// ---------------------------------------------------------------------------
// fakeDb estável — registra argumentos e entrega respostas controladas.
// Não interpreta SQL. db.query(sql, valores, callback): valores são o 2º
// argumento e o callback é o terceiro.
// ---------------------------------------------------------------------------

const calls = []; // { sql, values, argc }
let fakeResponse = { err: null, data: undefined };

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
after(() => dbMock.restore());

// Controllers reais, importados uma única vez, depois de registrado o mock.
const { getPets, addPets, updatePets, deletePets } = await import("../controllers/pet.js");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Contrato de erro da SEC-002: HTTP 500 + JSON genérico fixo.
const JSON_ERRO = { error: "Não foi possível concluir a operação." };

// Marcadores em todas as propriedades que o driver pode atribuir ao erro
// (SECURITY-AUDIT, SEC-002): se qualquer MARCA_ aparecer na resposta, houve vazamento.
function erroObjeto() {
  return {
    code: "MARCA_CODE",
    errno: 9999,
    sqlState: "MARCA_SQLSTATE",
    message: "MARCA_MESSAGE",
    sql: "MARCA_SQL",
    sqlMessage: "MARCA_SQLMESSAGE",
    stack: "MARCA_STACK",
  };
}

function erroInstancia() {
  const e = new Error("MARCA_MESSAGE");
  e.code = "MARCA_CODE";
  e.sql = "MARCA_SQL";
  e.sqlMessage = "MARCA_SQLMESSAGE";
  e.stack = "MARCA_STACK";
  return e;
}

const MARCAS = [
  "MARCA_CODE",
  "MARCA_SQLSTATE",
  "MARCA_MESSAGE",
  "MARCA_SQL",
  "MARCA_SQLMESSAGE",
  "MARCA_STACK",
];

function reset() {
  calls.length = 0;
  fakeResponse = { err: null, data: undefined };
}

function mockRes() {
  return {
    statusCode: null, // null = res.json() chamado sem status anterior
    jsonCalls: [], // toda resposta registrada — permite detectar uma 2ª resposta
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.jsonCalls.push(body);
      return this;
    },
  };
}

// Dados inteiramente fictícios
const PET_FICTICIO = {
  namePet: "Fubí",
  nameDono: "Ana Exemplo",
  telefone: "(11) 90000-0001",
  animal: "cachorro",
  raca: "vira-lata",
  data: "2020-01-02",
};
const ID_FICTICIO = "77";

// SQL exata de cada controller (idêntica à do código — os valores não podem
// aparecer nela; viajam no 2º argumento de db.query).
const SQL_BUSCA =
  "SELECT * FROM pets WHERE namePet LIKE ? OR nameDono LIKE ? ORDER BY namePet;";
const SQL_INSERT =
  "INSERT INTO  pets(`namePet`, `nameDono`, `telefone`, `animal`, `raca`, `data`) VALUES(?)";
const SQL_UPDATE =
  "UPDATE pets SET `namePet` = ?, `nameDono` = ? , `telefone` = ?, `animal` = ?, `raca` = ?, `data` = ? WHERE `id` = ?";
const SQL_DELETE = "DELETE FROM pets WHERE `id` = ?";

function runController(controller, req) {
  const res = mockRes();
  controller(req, res);
  return res;
}

const reqBusca = { query: { search: "Fubí" } };
const reqBody = { body: { ...PET_FICTICIO } };
const reqParams = { params: { id: ID_FICTICIO }, body: { ...PET_FICTICIO } };

// Asserções comuns ao caminho de erro (SEC-002): status, corpo fixo,
// uma única resposta e nenhum marcador de erro interno no que foi enviado.
function assertRespostaDeErro(res) {
  assert.equal(res.statusCode, 500, "erro do banco deve responder HTTP 500");
  assert.equal(
    res.jsonCalls.length,
    1,
    "exatamente uma resposta — o callback não pode produzir uma 2ª de sucesso"
  );
  assert.deepEqual(res.jsonCalls[0], JSON_ERRO, "corpo deve ser o JSON genérico fixo");
  const serializado = JSON.stringify(res.jsonCalls[0]);
  for (const marca of MARCAS) {
    assert.ok(!serializado.includes(marca), `o marcador ${marca} vazou na resposta`);
  }
}

// Asserções do QLT-001: nenhuma linha afetada → 404 com JSON controlado,
// uma única resposta.
function assertRespostaNaoEncontrado(res) {
  assert.equal(res.statusCode, 404, "nenhuma linha afetada deve responder HTTP 404");
  assert.equal(res.jsonCalls.length, 1, "exatamente uma resposta");
  assert.deepEqual(res.jsonCalls[0], { error: "Pet não encontrado." });
}

// ---------------------------------------------------------------------------
// getPets
// ---------------------------------------------------------------------------

test("getPets — erro do banco (objeto): 500, JSON fixo, SQL/valores da busca preservados", () => {
  reset();
  fakeResponse = { err: erroObjeto(), data: null };

  const res = runController(getPets, reqBusca);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].argc, 3, "db.query(sql, valores, callback)");
  assert.equal(calls[0].sql, SQL_BUSCA);
  assert.deepEqual(calls[0].values, ["%Fubí%", "%Fubí%"]);
  assertRespostaDeErro(res);
});

test("getPets — erro do banco (instância de Error com propriedades): sem vazamento", () => {
  reset();
  fakeResponse = { err: erroInstancia(), data: null };

  const res = runController(getPets, reqBusca);

  assert.equal(calls.length, 1);
  assertRespostaDeErro(res);
});

test("getPets — search inválido continua 400 com zero consultas, mesmo com erro simulado pronto", () => {
  reset();
  fakeResponse = { err: erroObjeto(), data: null };

  const res = runController(getPets, { query: { search: ["a", "b"] } });

  assert.equal(calls.length, 0, "busca inválida não chega ao banco");
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.jsonCalls[0], { error: "Parâmetro 'search' deve ser um texto." });
});

test("getPets — sucesso: status 200 e corpo idêntico ao retornado pelo fake", () => {
  reset();
  const dados = [{ id: 77, namePet: "Fubí", nameDono: "Ana Exemplo" }];
  fakeResponse = { err: null, data: dados };

  const res = runController(getPets, reqBusca);

  assert.equal(calls.length, 1);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.jsonCalls[0], dados);
});

// ---------------------------------------------------------------------------
// addPets
// ---------------------------------------------------------------------------

test("addPets — erro do banco (objeto): 500, INSERT com os mesmos valores, uma só resposta", () => {
  reset();
  fakeResponse = { err: erroObjeto(), data: null };

  const res = runController(addPets, reqBody);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].argc, 3, "db.query(sql, valores, callback)");
  assert.equal(calls[0].sql, SQL_INSERT);
  assert.deepEqual(calls[0].values, [[...Object.values(PET_FICTICIO)]]);
  assertRespostaDeErro(res);
});

test("addPets — erro do banco (instância de Error com propriedades): sem vazamento", () => {
  reset();
  fakeResponse = { err: erroInstancia(), data: null };

  const res = runController(addPets, reqBody);

  assert.equal(calls.length, 1);
  assertRespostaDeErro(res);
});

test("addPets — sucesso: 200 com a mensagem anterior preservada", () => {
  reset();
  fakeResponse = { err: null, data: { affectedRows: 1 } };

  const res = runController(addPets, reqBody);

  assert.equal(calls.length, 1);
  assert.equal(res.statusCode, 200);
  assert.equal(res.jsonCalls[0], "Pet criado com sucesso.");
});

// ---------------------------------------------------------------------------
// updatePets
// ---------------------------------------------------------------------------

test("updatePets — erro do banco (objeto): 500, UPDATE com os mesmos valores + id, uma só resposta", () => {
  reset();
  fakeResponse = { err: erroObjeto(), data: null };

  const res = runController(updatePets, reqParams);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].argc, 3, "db.query(sql, valores, callback)");
  assert.equal(calls[0].sql, SQL_UPDATE);
  assert.deepEqual(calls[0].values, [...Object.values(PET_FICTICIO), ID_FICTICIO]);
  assertRespostaDeErro(res);
});

test("updatePets — erro do banco (instância de Error com propriedades): sem vazamento", () => {
  reset();
  fakeResponse = { err: erroInstancia(), data: null };

  const res = runController(updatePets, reqParams);

  assert.equal(calls.length, 1);
  assertRespostaDeErro(res);
});

test("updatePets — sucesso (affectedRows 1): 200 com a mensagem anterior preservada", () => {
  reset();
  fakeResponse = { err: null, data: { affectedRows: 1 } };

  const res = runController(updatePets, reqParams);

  assert.equal(calls.length, 1);
  assert.equal(res.statusCode, 200);
  assert.equal(res.jsonCalls[0], "Pet atualizado com sucesso.");
});

test("updatePets — affectedRows 0: HTTP 404 com JSON controlado e uma só resposta (QLT-001)", () => {
  reset();
  fakeResponse = { err: null, data: { affectedRows: 0 } };

  const res = runController(updatePets, reqParams);

  assert.equal(calls.length, 1);
  assertRespostaNaoEncontrado(res);
});

test("updatePets — erro do banco tem prioridade sobre affectedRows 0: 500, não 404", () => {
  reset();
  fakeResponse = { err: erroObjeto(), data: { affectedRows: 0 } };

  const res = runController(updatePets, reqParams);

  assert.equal(calls.length, 1);
  assertRespostaDeErro(res);
});

test("updatePets — id malformado é repassado como valor, sem validação própria (QLT-001 — documentação de comportamento)", () => {
  for (const id of ["abc", "-1", "0"]) {
    reset();
    fakeResponse = { err: null, data: { affectedRows: 0 } };

    const res = runController(updatePets, { params: { id }, body: { ...PET_FICTICIO } });

    assert.equal(calls.length, 1, `id "${id}": a consulta deve ser executada`
    );
    assert.equal(calls[0].values[calls[0].values.length - 1], id, `id "${id}" deve viajar como valor`);
    assertRespostaNaoEncontrado(res);
  }
});

// ---------------------------------------------------------------------------
// deletePets
// ---------------------------------------------------------------------------

test("deletePets — erro do banco (objeto): 500, DELETE com o mesmo id, uma só resposta", () => {
  reset();
  fakeResponse = { err: erroObjeto(), data: null };

  const res = runController(deletePets, reqParams);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].argc, 3, "db.query(sql, valores, callback)");
  assert.equal(calls[0].sql, SQL_DELETE);
  assert.deepEqual(calls[0].values, [ID_FICTICIO]);
  assertRespostaDeErro(res);
});

test("deletePets — erro do banco (instância de Error com propriedades): sem vazamento", () => {
  reset();
  fakeResponse = { err: erroInstancia(), data: null };

  const res = runController(deletePets, reqParams);

  assert.equal(calls.length, 1);
  assertRespostaDeErro(res);
});

test("deletePets — sucesso (affectedRows 1): 200 com a mensagem anterior preservada", () => {
  reset();
  fakeResponse = { err: null, data: { affectedRows: 1 } };

  const res = runController(deletePets, reqParams);

  assert.equal(calls.length, 1);
  assert.equal(res.statusCode, 200);
  assert.equal(res.jsonCalls[0], "Pet deletado com sucesso.");
});

test("deletePets — affectedRows 0: HTTP 404 com JSON controlado e uma só resposta (QLT-001)", () => {
  reset();
  fakeResponse = { err: null, data: { affectedRows: 0 } };

  const res = runController(deletePets, reqParams);

  assert.equal(calls.length, 1);
  assertRespostaNaoEncontrado(res);
});

test("deletePets — erro do banco tem prioridade sobre affectedRows 0: 500, não 404", () => {
  reset();
  fakeResponse = { err: erroObjeto(), data: { affectedRows: 0 } };

  const res = runController(deletePets, reqParams);

  assert.equal(calls.length, 1);
  assertRespostaDeErro(res);
});

test("deletePets — id malformado é repassado como valor, sem validação própria (QLT-001 — documentação de comportamento)", () => {
  for (const id of ["abc", "-1", "0"]) {
    reset();
    fakeResponse = { err: null, data: { affectedRows: 0 } };

    const res = runController(deletePets, { params: { id } });

    assert.equal(calls.length, 1, `id "${id}": a consulta deve ser executada`);
    assert.deepEqual(calls[0].values, [id], `id "${id}" deve viajar como valor`);
    assertRespostaNaoEncontrado(res);
  }
});
