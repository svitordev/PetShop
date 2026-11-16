// Testes do resolvedor de URL da API (QLT-011 — src/config/api.js).
// Apenas funções puras do módulo são testadas aqui (sem DOM): as entradas
// (config, protocol, hostname) são passadas explicitamente. Valores fictícios.
// A prova em navegador real (hostname derivado + override sem rebuild) é feita
// via Playwright na sessão (registrada no relatório).

import test from "node:test";
import assert from "node:assert/strict";

import { resolveApiBaseUrl, joinUrl } from "../../src/config/api.js";

test("apiConfig: configuração explícita retorna a URL configurada", () => {
  const base = resolveApiBaseUrl({
    config: { API_BASE_URL: "http://api.ficticio.test:9999" },
    protocol: "http:",
    hostname: "pc-ficticio",
  });
  assert.equal(base, "http://api.ficticio.test:9999");
});

test("apiConfig: configuração explícita com barra final é normalizada", () => {
  const base = resolveApiBaseUrl({
    config: { API_BASE_URL: "http://api.ficticio.test:9999/" },
    protocol: "http:",
    hostname: "pc-ficticio",
  });
  assert.equal(base, "http://api.ficticio.test:9999");
});

test("apiConfig: configuração vazia usa o hostname atual + porta 8800", () => {
  const base = resolveApiBaseUrl({
    config: { API_BASE_URL: "" },
    protocol: "http:",
    hostname: "192.168.50.10",
  });
  assert.equal(base, "http://192.168.50.10:8800");
});

test("apiConfig: localhost → porta 8800", () => {
  const base = resolveApiBaseUrl({ config: undefined, protocol: "http:", hostname: "localhost" });
  assert.equal(base, "http://localhost:8800");
});

test("apiConfig: IPv4 de LAN → porta 8800", () => {
  const base = resolveApiBaseUrl({ config: undefined, protocol: "http:", hostname: "192.168.1.50" });
  assert.equal(base, "http://192.168.1.50:8800");
});

test("apiConfig: hostname de LAN → porta 8800", () => {
  const base = resolveApiBaseUrl({ config: undefined, protocol: "http:", hostname: "pc-caixa" });
  assert.equal(base, "http://pc-caixa:8800");
});

test("apiConfig: protocolo https é preservado na resolução automática", () => {
  const base = resolveApiBaseUrl({ config: undefined, protocol: "https:", hostname: "pc-caixa" });
  assert.equal(base, "https://pc-caixa:8800");
});

test("apiConfig: configuração explícita tem prioridade sobre o hostname", () => {
  const base = resolveApiBaseUrl({
    config: { API_BASE_URL: "http://servidor-ficticio:18800" },
    protocol: "http:",
    hostname: "localhost",
  });
  assert.equal(base, "http://servidor-ficticio:18800");
});

test("apiConfig: joinUrl não gera barras duplicadas", () => {
  const base = "http://pc-ficticio:8800";
  assert.equal(joinUrl(base, ""), base);
  assert.equal(joinUrl(base, "/"), base);
  assert.equal(joinUrl(base, "/pets"), `${base}/pets`);
  assert.equal(joinUrl(base, "pets"), `${base}/pets`);
  assert.equal(joinUrl(base, "/F-001"), `${base}/F-001`);
  assert.equal(joinUrl(base, "/?search=ficticio"), `${base}/?search=ficticio`);
});

test("apiConfig: base com barra final + path não duplica barra", () => {
  assert.equal(joinUrl("http://pc-ficticio:8800/", "/F-001"), "http://pc-ficticio:8800/F-001");
});
