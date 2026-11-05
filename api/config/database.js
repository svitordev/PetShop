// Leitura e validação da configuração de conexão com o banco (SEC-005).
// Fonte de configuração: exclusivamente o ambiente de execução (process.env).
// Nenhum valor é impresso em mensagens — apenas nomes de variáveis.
// Sem dependências novas: o carregamento de arquivo .env é responsabilidade
// do processo de execução/launcher/instalador (decisão registrada em D8).

const REQUIRED = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];

function isMissing(env, name) {
  const value = env[name];
  // Ausente: variável inexistente (undefined). String vazia também é inválida:
  // uma instalação não deve iniciar silenciosamente com campo essencial vazio.
  return value === undefined || value === "";
}

export function readDatabaseConfig(env = process.env) {
  const missing = REQUIRED.filter((name) => isMissing(env, name));
  if (missing.length > 0) {
    // A mensagem lista apenas NOMES — nunca valores.
    throw new Error(`Configuração obrigatória ausente: ${missing.join(", ")}`);
  }
  return {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  };
}
