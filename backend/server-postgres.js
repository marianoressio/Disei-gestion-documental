import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import config from "./config.js";
import {
  startCronJob,
  runManualCheck,
  getExpiryStats,
} from "./cron-service-postgres.js";
import { testEmailConfiguration } from "./email-service.js";
import { initializeTables, insertDefaultUsers, query } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(
  "Iniciando servidor PostgreSQL... Node.js:",
  process.version,
  "__dirname:",
  __dirname
);

const app = express();
const port = config.port;

app.use(express.json());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    console.log("Verificando carpeta uploads:", uploadPath);
    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log(`Carpeta 'uploads' creada en ${uploadPath}`);
      }
      cb(null, uploadPath);
    } catch (err) {
      console.error("Error al crear o acceder a la carpeta uploads:", err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = new RegExp(config.allowedFileTypes.join("|"));
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(
    new Error(
      `Solo se permiten archivos: ${config.allowedFileTypes.join(", ")}`
    )
  );
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: config.maxFileSize },
}).single("file");

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error global capturado:", err.stack);
  res
    .status(500)
    .json({ error: "Error interno del servidor", details: err.message });
});

// Inicializar base de datos
async function initializeDatabase() {
  try {
    await initializeTables();
    await insertDefaultUsers();
    console.log("✅ Base de datos PostgreSQL inicializada correctamente");
  } catch (error) {
    console.error("❌ Error al inicializar base de datos:", error);
    process.exit(1);
  }
}

// Endpoint de login
app.post("/login", async (req, res) => {
  console.log("Solicitud POST /login recibida:", req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }

  try {
    const result = await query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      console.log("Usuario no encontrado:", username);
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      console.log("Contraseña incorrecta para:", username);
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    console.log("Login exitoso para:", username);
    res.json({
      message: "Login exitoso",
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para crear empleado
app.post("/employees", async (req, res) => {
  console.log("Solicitud POST /employees recibida:", req.body);
  const { name, dni, position, sector, email, phone, empresa } = req.body;

  if (!name || !dni || !position || !sector || !empresa) {
    console.log("Campos faltantes:", { name, dni, position, sector, empresa });
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const result = await query(
      "INSERT INTO employees (name, dni, position, sector, email, phone, empresa) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [name, dni, position, sector, email || "", phone || "", empresa]
    );

    console.log("Empleado agregado con ID:", result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al insertar empleado:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener empleados
app.get("/employees", async (req, res) => {
  try {
    const result = await query("SELECT * FROM employees ORDER BY name");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

// Endpoint para obtener empleado por ID
app.get("/employees/:id", async (req, res) => {
  try {
    const result = await query("SELECT * FROM employees WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener empleado:", error);
    res.status(500).json({ error: "Error al obtener empleado" });
  }
});

// Endpoint para actualizar empleado
app.put("/employees/:id", async (req, res) => {
  const { name, dni, position, sector, email, phone, empresa } = req.body;

  if (!name || !dni || !position || !sector || !empresa) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const result = await query(
      "UPDATE employees SET name = $1, dni = $2, position = $3, sector = $4, email = $5, phone = $6, empresa = $7 WHERE id = $8 RETURNING *",
      [
        name,
        dni,
        position,
        sector,
        email || "",
        phone || "",
        empresa,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para eliminar empleado
app.delete("/employees/:id", async (req, res) => {
  try {
    const result = await query(
      "DELETE FROM employees WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }

    res.json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para crear documento
app.post("/documents", upload, async (req, res) => {
  console.log("Solicitud POST /documents recibida:", req.body);
  const { employeeId, type, issueDate, expiryDate } = req.body;

  if (!employeeId || !type || !issueDate || !expiryDate || !req.file) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios o archivo" });
  }

  try {
    const status = calculateDocumentStatus(issueDate, expiryDate);
    const fileName = req.file.filename;

    const result = await query(
      "INSERT INTO documents (employeeId, type, issueDate, expiryDate, status, fileName) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [employeeId, type, issueDate, expiryDate, status, fileName]
    );

    console.log("Documento agregado con ID:", result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al insertar documento:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener documentos
app.get("/documents", async (req, res) => {
  try {
    const result = await query(`
      SELECT d.*, e.name as employeeName, e.dni, e.position, e.empresa 
      FROM documents d 
      JOIN employees e ON d.employeeId = e.id 
      ORDER BY d.expiryDate
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});

// Endpoint para obtener documento por ID
app.get("/documents/:id", async (req, res) => {
  try {
    const result = await query(
      `
      SELECT d.*, e.name as employeeName, e.dni, e.position, e.empresa 
      FROM documents d 
      JOIN employees e ON d.employeeId = e.id 
      WHERE d.id = $1
    `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener documento:", error);
    res.status(500).json({ error: "Error al obtener documento" });
  }
});

// Endpoint para actualizar documento
app.put("/documents/:id", upload, async (req, res) => {
  const documentId = parseInt(req.params.id);
  const { employeeId, type, issueDate, expiryDate } = req.body;

  if (!employeeId || !type || !issueDate || !expiryDate) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // Obtener el documento existente
    const existingResult = await query(
      "SELECT * FROM documents WHERE id = $1",
      [documentId]
    );
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    const existingDoc = existingResult.rows[0];

    // Determinar qué archivo usar
    let fileName = existingDoc.filename;
    let oldFileName = null;
    if (req.file) {
      fileName = req.file.filename;
      oldFileName = existingDoc.filename;
    }

    const status = calculateDocumentStatus(issueDate, expiryDate);

    // Archivar el documento anterior
    await query("UPDATE documents SET archived = true WHERE id = $1", [
      documentId,
    ]);

    // Insertar el nuevo documento como no archivado
    const insertResult = await query(
      "INSERT INTO documents (employeeId, type, issueDate, expiryDate, status, fileName, archived) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *",
      [employeeId, type, issueDate, expiryDate, status, fileName]
    );

    // Eliminar archivo anterior si se subió uno nuevo
    if (oldFileName && oldFileName !== fileName) {
      const fs = require("fs");
      const path = require("path");
      const oldFilePath = path.join(__dirname, "uploads", oldFileName);
      fs.unlink(oldFilePath, (unlinkErr) => {
        if (unlinkErr) {
          console.warn("No se pudo eliminar el archivo anterior:", unlinkErr);
        } else {
          console.log("Archivo anterior eliminado:", oldFileName);
        }
      });
    }

    res.json(insertResult.rows[0]);
  } catch (error) {
    console.error("Error al actualizar documento:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para eliminar documento
app.delete("/documents/:id", async (req, res) => {
  try {
    const result = await query(
      "DELETE FROM documents WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json({ message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para descargar archivo
app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }

  res.download(filePath);
});

// Endpoint para visualizar archivo
app.get("/view/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }

  res.sendFile(filePath);
});

// Endpoint para estadísticas de vencimiento
app.get("/api/expiry-stats", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'vigente' THEN 1 END) as vigentes,
        COUNT(CASE WHEN status = 'por vencer' THEN 1 END) as porVencer,
        COUNT(CASE WHEN status = 'vencido' THEN 1 END) as vencidos
      FROM documents
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// Endpoint para verificar configuración de email
app.get("/api/test-email", async (req, res) => {
  try {
    const result = await testEmailConfiguration();
    res.json({ success: result });
  } catch (error) {
    console.error("Error al probar email:", error);
    res.status(500).json({ error: "Error al probar email" });
  }
});

// Endpoint para ejecutar revisión manual
app.post("/api/check-expiring-documents", async (req, res) => {
  try {
    const result = await runManualCheck();
    res.json({ success: true, message: "Revisión ejecutada", result });
  } catch (error) {
    console.error("Error al ejecutar revisión:", error);
    res.status(500).json({ error: "Error al ejecutar revisión" });
  }
});

// Función para calcular el estado del documento
function calculateDocumentStatus(issueDate, expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return "vencido";
  } else if (daysUntilExpiry <= 30) {
    return "por vencer";
  } else {
    return "vigente";
  }
}

// Iniciar servidor
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
      console.log("⏰ Iniciando cron job para alertas de documentos...");
      startCronJob();
      console.log(
        "✅ Cron job programado para ejecutarse diariamente a las 9:00 AM (hora de Argentina)"
      );
    });
  } catch (error) {
    console.error("Error al iniciar servidor:", error);
    process.exit(1);
  }
}

app.get("/api/ping", (req, res) => {
  res.status(200).send("ok");
});

startServer();
