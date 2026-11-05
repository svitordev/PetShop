// Testes do contrato de configuração do banco (SEC-005 — api/config/database.js).
// Valores 100% fictícios — nenhum segredo real aparece neste arquivo.
// O teste de integração usa mock de módulo para "mysql": nenhum socket é aberto,
// nenhuma conexão com MySQL é tentada. Ambiente fictício é restaurado no final.

import test, { mock } from "node:test";
import assert from "node:assert/strict";

import { readDatabaseConfig } from "../config/database.js";

// ---------------------------------------------------------------------------
// Ambiente fictício
// ---------------------------------------------------------------------------

const FICT = {
  DB_HOST: "ficticio-host.test",
  DB_USER: "ficticio-usuario",
  DB_PASSWORD: "senha-ficticia-XYZ",
  DB_NAME: "ficticio_db",
};

function envValido(omitir = [], extras = {}) {
  const env = { ...FICT, ...extras };
  for (const nome of omitir) delete env[nome];
  return env;
}

// ---------------------------------------------------------------------------
// Casos puros do contrato
// ---------------------------------------------------------------------------

test("config: as quatro variáveis válidas retornam o contrato correto", () => {
  const config = readDatabaseConfig(envValido());
  assert.deepEqual(config, {
    host: FICT.DB_HOST,
    user: FICT.DB_USER,
    password: FICT.DB_PASSWORD,
    database: FICT.DB_NAME,
  });
});

test("config: DB_HOST ausente lança erro", () => {
  assert.throws(() => readDatabaseConfig(envValido(["DB_HOST"])), /DB_HOST/);
});

test("config: DB_USER ausente lança erro", () => {
  assert.throws(() => readDatabaseConfig(envValido(["DB_USER"])), /DB_USER/);
});

test("config: DB_PASSWORD ausente lança erro", () => {
  assert.throws(() => readDatabaseConfig(envValido(["DB_PASSWORD"])), /DB_PASSWORD/);
});

test("config: DB_NAME ausente lança erro", () => {
  assert.throws(() => readDatabaseConfig(envValido(["DB_NAME"])), /DB_NAME/);
});

test("config: múltiplas ausentes — a mensagem identifica os nomes necessários", () => {
  let err;
  try {
    readDatabaseConfig(envValido(["DB_HOST", "DB_PASSWORD"]));
  } catch (e) {
    err = e;
  }
  assert.ok(err, "deve lançar erro");
  assert.match(err.message, /DB_HOST/);
  assert.match(err.message, /DB_PASSWORD/);
  assert.ok(!err.message.includes("DB_USER"), "não deve listar variável presente");
  assert.ok(!err.message.includes("DB_NAME"), "não deve listar variável presente");
});

test("config: string vazia é tratada como configuração inválida", () => {
  for (const nome of Object.keys(FICT)) {
    assert.throws(() => readDatabaseConfig(envValido([], { [nome]: "" })), new RegExp(nome), `${nome} vazia deve ser inválida`);
  }
});

test("config: variáveis extras são ignoradas", () => {
  const config = readDatabaseConfig(envValido([], { DB_PORTA_FICTICIA: "1234", CAMINHO_FICTICIO: "/ficticio" }));
  assert.deepEqual(Object.keys(config).sort(), ["database", "host", "password", "user"]);
});

test("config: o valor da senha fictícia nunca aparece na mensagem de erro", () => {
  const err = (() => {
    try {
      readDatabaseConfig(envValido(["DB_USER"]));
    } catch (e) {
      return e;
    }
  })();
  assert.ok(err, "deve lançar erro");
  assert.ok(!err.message.includes(FICT.DB_PASSWORD), "mensagem não pode conter o valor da senha");
  assert.ok(!err.message.includes(FICT.DB_HOST), "mensagem não pode conter valores de outras variáveis");
});

// ---------------------------------------------------------------------------
// Integração db.js → configuração (mysql mockado — sem socket, sem servidor)
// ---------------------------------------------------------------------------

test("integração: db.js entrega os quatro valores do ambiente ao createConnection", async () => {
  // Preserva quaisquer valores de ambiente que já existiam no processo de teste.
  const nomes = Object.keys(FICT);
  const salvos = {};
  for (const nome of nomes) {
    salvos[nome] = process.env[nome];
    process.env[nome] = FICT[nome];
  }

  let capturado = null;
  // "mysql" é CommonJS: para alvos CJS, o conteúdo de namedExports é tratado
  // como o module.exports — é isso que o import default de db.js recebe.
  const fakeMysql = {
    createConnection(config) {
      capturado = config;
      return { __mock: true }; // db.js não deve chamar connect() aqui
    },
  };
  const mysqlMock = mock.module("mysql", { namedExports: fakeMysql });

  try {
    await import("../db.js");
    assert.ok(capturado, "createConnection deve ter sido chamado com a configuração");
    assert.equal(capturado.host, FICT.DB_HOST);
    assert.equal(capturado.user, FICT.DB_USER);
    assert.equal(capturado.password, FICT.DB_PASSWORD);
    assert.equal(capturado.database, FICT.DB_NAME);
    assert.deepEqual(Object.keys(capturado).sort(), ["database", "host", "password", "user"]);
  } finally {
    mysqlMock.restore();
    for (const nome of nomes) {
      if (salvos[nome] === undefined) delete process.env[nome];
      else process.env[nome] = salvos[nome];
    }
  }
});
