import pkg from "pg";
const { Pool } = pkg;
import config from "./config.js";

// Crear pool de conexiones PostgreSQL
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20, // máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // cerrar conexiones inactivas después de 30 segundos
  connectionTimeoutMillis: 2000, // timeout de conexión de 2 segundos
});

// Función para inicializar las tablas
export async function initializeTables() {
  const client = await pool.connect();
  try {
    console.log("Inicializando tablas PostgreSQL...");

    // Crear tabla users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
      )
    `);

    // Crear tabla employees
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        dni VARCHAR(20) NOT NULL,
        position VARCHAR(255) NOT NULL,
        sector VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        empresa VARCHAR(255) NOT NULL
      )
    `);

    // Crear tabla documents
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        employeeId INTEGER NOT NULL,
        type VARCHAR(255) NOT NULL,
        issueDate DATE NOT NULL,
        expiryDate DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        fileName VARCHAR(255) NOT NULL,
        archived BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    console.log("✅ Tablas PostgreSQL inicializadas correctamente");
  } catch (error) {
    console.error("❌ Error al inicializar tablas:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Función para insertar usuarios por defecto
export async function insertDefaultUsers() {
  const client = await pool.connect();
  try {
    // Verificar si ya existen usuarios
    const existingUsers = await client.query("SELECT COUNT(*) FROM users");
    if (parseInt(existingUsers.rows[0].count) > 0) {
      console.log("Usuarios ya existen, saltando inserción por defecto");
      return;
    }

    console.log("Insertando usuarios por defecto...");

    const bcrypt = (await import("bcrypt")).default;
    const saltRounds = config.bcryptRounds;

    const defaultUsers = [
      {
        username: "sandra",
        password: "Sandra2025!",
        name: "Sandra",
        role: "admin",
      },
      {
        username: "laura",
        password: "Laura2025!",
        name: "Laura",
        role: "user",
      },
      {
        username: "anabella",
        password: "Anabella2025!",
        name: "Anabella",
        role: "user",
      },
      {
        username: "mariano",
        password: "Mariano2025!",
        name: "Mariano",
        role: "admin",
      },
    ];

    for (const user of defaultUsers) {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      await client.query(
        "INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4)",
        [user.username, hashedPassword, user.name, user.role]
      );
      console.log(`✅ Usuario ${user.username} creado`);
    }

    console.log("✅ Usuarios por defecto insertados correctamente");
  } catch (error) {
    console.error("❌ Error al insertar usuarios por defecto:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Función para obtener una conexión del pool
export async function getConnection() {
  return await pool.connect();
}

// Función para ejecutar queries
export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Función para cerrar el pool
export async function closePool() {
  await pool.end();
}

export default pool;
