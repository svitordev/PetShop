import mysql from "mysql";
import { readDatabaseConfig } from "./config/database.js";

// Sem fallback: configuração ausente/inválida falha aqui, antes de qualquer
// consulta. Os valores vêm exclusivamente do ambiente de execução (SEC-005).
export const db = mysql.createConnection(readDatabaseConfig(process.env));
