// Fonte única de construção da URL da API (QLT-011).
// Camadas: configuração explícita de runtime (window.__SOFTPET_CONFIG__,
// servida por /softpet-config.js) → fallback automático pelo hostname acessado.
// A resolução acontece SOMENTE quando as funções são chamadas — nunca no import
// do módulo (evita quebra durante build/SSR, onde window não existe).

const DEFAULT_API_PORT = 8800;

// Função pura — recebe entradas explícitas (testável sem DOM).
export function resolveApiBaseUrl({ config, protocol, hostname }) {
  const explicit =
    config && typeof config.API_BASE_URL === "string" ? config.API_BASE_URL : "";
  if (explicit !== "") {
    return explicit.replace(/\/+$/, "");
  }
  return `${protocol}//${hostname}:${DEFAULT_API_PORT}`;
}

// Função pura — junta base e path sem barras duplicadas.
export function joinUrl(base, path = "") {
  const cleanBase = String(base).replace(/\/+$/, "");
  if (path === "" || path === "/") return cleanBase;
  return `${cleanBase}/${String(path).replace(/^\/+/, "")}`;
}

export function getApiBaseUrl() {
  return resolveApiBaseUrl({
    config: typeof window !== "undefined" ? window.__SOFTPET_CONFIG__ : undefined,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
  });
}

export function apiUrl(path = "") {
  return joinUrl(getApiBaseUrl(), path);
}
