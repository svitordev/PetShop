// Configuração de runtime do SoftPet (QLT-011) — servida em /softpet-config.js.
// Este arquivo PODE ser alterado pelo instalador/launcher SEM novo build:
// é lido pelo navegador a cada carregamento da página.
// API_BASE_URL vazio = resolução automática (protocolo + hostname acessado + porta 8800).
// Valor explícito preenchido tem prioridade sobre a resolução automática.
// Exemplo futuro de override (documentação — não ativar aqui):
//   window.__SOFTPET_CONFIG__ = { API_BASE_URL: "http://10.0.0.20:8800" };
// Não colocar segredo neste arquivo.
window.__SOFTPET_CONFIG__ = {
  API_BASE_URL: "",
};
