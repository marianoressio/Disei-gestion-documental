import express from "express";
import bcrypt from "bcrypt";
import sqlite3 from "sqlite3";
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
} from "./cron-service.js";
import { testEmailConfiguration } from "./email-service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(
  "Iniciando servidor... Node.js:",
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

const { Database } = sqlite3.verbose();
const db = new Database(config.dbPath, (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.stack);
    return;
  }
  console.log("Conectado a la base de datos users.db");
  db.serialize(() => {
    console.log("Inicializando tablas...");
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        dni TEXT NOT NULL,
        position TEXT NOT NULL,
        sector TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        empresa TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employeeId INTEGER NOT NULL,
        type TEXT NOT NULL,
        issueDate TEXT NOT NULL,
        expiryDate TEXT NOT NULL,
        status TEXT NOT NULL,
        fileName TEXT NOT NULL,
        archived INTEGER DEFAULT 0,
        FOREIGN KEY (employeeId) REFERENCES employees(id)
      )
    `);
  });
});
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error global capturado:", err.stack);
  res
    .status(500)
    .json({ error: "Error interno del servidor", details: err.message });
});

app.post("/login", (req, res) => {
  console.log("Solicitud POST /login recibida:", req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña requeridos" });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      console.error("Error al consultar la base de datos:", err.stack);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    if (!row) {
      console.log("Usuario no encontrado:", username);
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    bcrypt.compare(password, row.password, (err, match) => {
      if (err) {
        console.error("Error al comparar contraseñas:", err.stack);
        return res.status(500).json({ error: "Error al comparar contraseñas" });
      }
      if (!match) {
        console.log("Contraseña incorrecta para:", username);
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      console.log("Login exitoso para:", username);
      res.json({
        message: "Login exitoso",
        user: { id: row.id, name: row.name, role: row.role },
      });
    });
  });
});

app.post("/employees", (req, res) => {
  console.log("Solicitud POST /employees recibida:", req.body);
  const { name, dni, position, sector, email, phone, empresa } = req.body;
  // Solo validar los campos obligatorios
  if (!name || !dni || !position || !sector || !empresa) {
    console.log("Campos faltantes:", {
      name,
      dni,
      position,
      sector,
      empresa,
    });
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  db.run(
    "INSERT INTO employees (name, dni, position, sector, email, phone, empresa) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, dni, position, sector, email || "", phone || "", empresa],
    function (err) {
      if (err) {
        console.error("Error al insertar empleado:", err.stack);
        return res.status(500).json({ error: err.message });
      }
      console.log("Empleado agregado con ID:", this.lastID);
      res.status(201).json({ id: this.lastID, ...req.body });
    }
  );
});
app.post("/documents", (req, res, next) => {
  console.log("Solicitud POST /documents recibida");
  upload(req, res, (err) => {
    if (err) {
      console.error("Error en multer:", err.stack);
      return res.status(400).json({ error: err.message });
    }
    console.log("Datos recibidos:", req.body, "Archivo:", req.file);
    const { employeeId, type, issueDate, expiryDate } = req.body;
    if (!employeeId || !type || !issueDate || !expiryDate) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }
    const fileName = req.file ? req.file.filename : "";
    if (!fileName) {
      return res.status(400).json({ error: "Debe subir un archivo" });
    }
    const status = calculateDocumentStatus(issueDate, expiryDate);

    // Validación especial para Credencial de gruista
    if (type === "Credencial de gruista") {
      db.get(
        "SELECT position FROM employees WHERE id = ?",
        [employeeId],
        (err, emp) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Error al validar puesto del empleado" });
          }
          if (!emp || emp.position !== "Operador de Equipos / Gruista") {
            return res.status(400).json({
              error:
                "Solo un Operador de Equipos / Gruista puede tener Credencial de gruista",
            });
          }
          // Archivar documentos anteriores del mismo tipo y empleado
          db.run(
            "UPDATE documents SET archived = 1 WHERE employeeId = ? AND type = ? AND archived = 0",
            [employeeId, type],
            function (err) {
              if (err) {
                console.error(
                  "Error al archivar documentos anteriores:",
                  err.stack
                );
                return res.status(500).json({ error: err.message });
              }
              // Insertar el nuevo documento como no archivado
              db.run(
                "INSERT INTO documents (employeeId, type, issueDate, expiryDate, status, fileName, archived) VALUES (?, ?, ?, ?, ?, ?, 0)",
                [employeeId, type, issueDate, expiryDate, status, fileName],
                function (err) {
                  if (err) {
                    console.error(
                      "Error al insertar en la base de datos:",
                      err.stack
                    );
                    return res.status(500).json({ error: err.message });
                  }
                  console.log("Documento agregado con ID:", this.lastID);
                  res.status(201).json({
                    id: this.lastID,
                    employeeId,
                    type,
                    issueDate,
                    expiryDate,
                    status,
                    fileName,
                    archived: 0,
                  });
                }
              );
            }
          );
        }
      );
      return;
    }

    // Archivar documentos anteriores del mismo tipo y empleado
    db.run(
      "UPDATE documents SET archived = 1 WHERE employeeId = ? AND type = ? AND archived = 0",
      [employeeId, type],
      function (err) {
        if (err) {
          console.error("Error al archivar documentos anteriores:", err.stack);
          return res.status(500).json({ error: err.message });
        }
        // Insertar el nuevo documento como no archivado
        db.run(
          "INSERT INTO documents (employeeId, type, issueDate, expiryDate, status, fileName, archived) VALUES (?, ?, ?, ?, ?, ?, 0)",
          [employeeId, type, issueDate, expiryDate, status, fileName],
          function (err) {
            if (err) {
              console.error(
                "Error al insertar en la base de datos:",
                err.stack
              );
              return res.status(500).json({ error: err.message });
            }
            console.log("Documento agregado con ID:", this.lastID);
            res.status(201).json({
              id: this.lastID,
              employeeId,
              type,
              issueDate,
              expiryDate,
              status,
              fileName,
              archived: 0,
            });
          }
        );
      }
    );
  });
});
// Ruta mejorada para editar documentos
app.put("/documents/:id", (req, res, next) => {
  console.log(
    "Solicitud PUT /documents/:id recibida:",
    req.params.id,
    req.body
  );

  // Validar ID del documento
  const documentId = parseInt(req.params.id);
  if (isNaN(documentId)) {
    return res.status(400).json({ error: "ID de documento inválido" });
  }

  // Primero obtener el documento existente
  db.get(
    "SELECT * FROM documents WHERE id = ?",
    [documentId],
    (err, existingDoc) => {
      if (err) {
        console.error("Error al consultar documento:", err.stack);
        return res.status(500).json({ error: "Error al consultar documento" });
      }

      if (!existingDoc) {
        return res.status(404).json({ error: "Documento no encontrado" });
      }

      // Procesar upload
      upload(req, res, (err) => {
        if (err) {
          console.error("Error en multer:", err.stack);
          return res.status(400).json({ error: err.message });
        }

        const { employeeId, type, issueDate, expiryDate } = req.body;

        if (!employeeId || !type || !issueDate || !expiryDate) {
          return res
            .status(400)
            .json({ error: "Todos los campos son requeridos" });
        }

        // Determinar qué archivo usar
        let fileName = existingDoc.fileName; // Mantener el archivo existente por defecto
        let oldFileName = null;

        if (req.file) {
          // Si se subió un nuevo archivo, usar el nuevo y marcar el anterior para eliminar
          fileName = req.file.filename;
          oldFileName = existingDoc.fileName;
        }

        const status = calculateDocumentStatus(issueDate, expiryDate);

        // Validación especial para Credencial de gruista
        if (type === "Credencial de gruista") {
          db.get(
            "SELECT position FROM employees WHERE id = ?",
            [employeeId],
            (err, emp) => {
              if (err) {
                return res
                  .status(500)
                  .json({ error: "Error al validar puesto del empleado" });
              }
              if (!emp || emp.position !== "Operador de Equipos / Gruista") {
                return res.status(400).json({
                  error:
                    "Solo un Operador de Equipos / Gruista puede tener Credencial de gruista",
                });
              }
              archivarEInsertar();
            }
          );
          function archivarEInsertar() {
            db.run(
              "UPDATE documents SET archived = 1 WHERE id = ?",
              [documentId],
              function (err) {
                if (err) {
                  console.error(
                    "Error al archivar documento anterior:",
                    err.stack
                  );
                  return res.status(500).json({ error: err.message });
                }
                db.run(
                  "INSERT INTO documents (employeeId, type, issueDate, expiryDate, status, fileName, archived) VALUES (?, ?, ?, ?, ?, ?, 0)",
                  [employeeId, type, issueDate, expiryDate, status, fileName],
                  function (err) {
                    if (err) {
                      console.error(
                        "Error al insertar documento actualizado:",
                        err.stack
                      );
                      return res.status(500).json({ error: err.message });
                    }
                    if (oldFileName && oldFileName !== fileName) {
                      const oldFilePath = path.join(
                        __dirname,
                        "uploads",
                        oldFileName
                      );
                      fs.unlink(oldFilePath, (unlinkErr) => {
                        if (unlinkErr) {
                          console.warn(
                            "No se pudo eliminar el archivo anterior:",
                            unlinkErr
                          );
                        } else {
                          console.log(
                            "Archivo anterior eliminado:",
                            oldFileName
                          );
                        }
                      });
                    }
                    res.json({
                      id: this.lastID,
                      employeeId,
                      type,
                      issueDate,
                      expiryDate,
                      status,
                      fileName,
                      archived: 0,
                    });
                  }
                );
              }
            );
          }
          return;
        }

        // Archivar el documento anterior
        db.run(
          "UPDATE documents SET archived = 1 WHERE id = ?",
          [documentId],
          function (err) {
            if (err) {
              console.error("Error al archivar documento anterior:", err.stack);
              return res.status(500).json({ error: err.message });
            }
            // Insertar el nuevo documento como no archivado
            db.run(
              "INSERT INTO documents (employeeId, type, issueDate, expiryDate, status, fileName, archived) VALUES (?, ?, ?, ?, ?, ?, 0)",
              [employeeId, type, issueDate, expiryDate, status, fileName],
              function (err) {
                if (err) {
                  console.error(
                    "Error al insertar documento actualizado:",
                    err.stack
                  );
                  return res.status(500).json({ error: err.message });
                }
                // Eliminar archivo anterior si se subió uno nuevo
                if (oldFileName && oldFileName !== fileName) {
                  const oldFilePath = path.join(
                    __dirname,
                    "uploads",
                    oldFileName
                  );
                  fs.unlink(oldFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                      console.warn(
                        "No se pudo eliminar el archivo anterior:",
                        unlinkErr
                      );
                    } else {
                      console.log("Archivo anterior eliminado:", oldFileName);
                    }
                  });
                }
                console.log("Documento actualizado (nuevo ID):", this.lastID);
                res.json({
                  id: this.lastID,
                  employeeId,
                  type,
                  issueDate,
                  expiryDate,
                  status,
                  fileName,
                  archived: 0,
                });
              }
            );
          }
        );
      });
    }
  );
});

// Ruta para obtener un documento específico (útil para el formulario de edición)
app.get("/documents/:id", (req, res) => {
  const documentId = parseInt(req.params.id);
  if (isNaN(documentId)) {
    return res.status(400).json({ error: "ID de documento inválido" });
  }

  db.get("SELECT * FROM documents WHERE id = ?", [documentId], (err, row) => {
    if (err) {
      console.error("Error al consultar documento:", err.stack);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    res.json(row);
  });
});
// Ruta mejorada para descargar archivos
app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  // Validaciones de seguridad
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return res.status(400).send("Nombre de archivo inválido");
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Archivo no encontrado");
  }

  // Forzar descarga
  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Error al descargar:", err);
      if (!res.headersSent) {
        res.status(500).send("Error al descargar el archivo");
      }
    }
  });
});

// Ruta alternativa para visualizar archivos en el navegador (sin forzar descarga)
app.get("/view/:filename", (req, res) => {
  const filename = req.params.filename;

  // Validación básica del nombre del archivo
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return res.status(400).json({ error: "Nombre de archivo inválido" });
  }

  const filePath = path.join(__dirname, "uploads", filename);
  console.log("Solicitud GET /view/", filename, "FilePath:", filePath);

  // Verificar que el archivo existe
  if (!fs.existsSync(filePath)) {
    console.error("Archivo no encontrado:", filePath);
    return res.status(404).json({ error: "Archivo no encontrado" });
  }

  // Verificar que el archivo está realmente en la carpeta uploads (seguridad)
  const realPath = fs.realpathSync(filePath);
  const uploadsPath = fs.realpathSync(path.join(__dirname, "uploads"));
  if (!realPath.startsWith(uploadsPath)) {
    console.error("Intento de acceso a archivo fuera de uploads:", realPath);
    return res.status(403).json({ error: "Acceso no autorizado" });
  }

  // Determinar el tipo de contenido
  const ext = path.extname(filename).toLowerCase();
  let contentType = "application/octet-stream";

  switch (ext) {
    case ".pdf":
      contentType = "application/pdf";
      break;
    case ".jpg":
    case ".jpeg":
      contentType = "image/jpeg";
      break;
    case ".png":
      contentType = "image/png";
      break;
  }

  // Configurar headers para visualización
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

  // Enviar archivo
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error al enviar archivo:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error al enviar archivo" });
      }
    } else {
      console.log("Archivo visualizado exitosamente:", filename);
    }
  });
});

// Ruta para obtener todos los empleados
app.get("/employees", (req, res) => {
  db.all("SELECT * FROM employees ORDER BY name", (err, rows) => {
    if (err) {
      console.error("Error al consultar empleados:", err.stack);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    res.json(rows);
  });
});

// Ruta para obtener un empleado específico
app.get("/employees/:id", (req, res) => {
  const employeeId = parseInt(req.params.id);
  if (isNaN(employeeId)) {
    return res.status(400).json({ error: "ID de empleado inválido" });
  }

  db.get("SELECT * FROM employees WHERE id = ?", [employeeId], (err, row) => {
    if (err) {
      console.error("Error al consultar empleado:", err.stack);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    if (!row) {
      return res.status(404).json({ error: "Empleado no encontrado" });
    }
    res.json(row);
  });
});

// Ruta para actualizar un empleado
app.put("/employees/:id", (req, res) => {
  const employeeId = parseInt(req.params.id);
  if (isNaN(employeeId)) {
    return res.status(400).json({ error: "ID de empleado inválido" });
  }

  const { name, dni, position, sector, email, phone, empresa } = req.body;
  // Solo validar los campos obligatorios
  if (!name || !dni || !position || !sector || !empresa) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  db.run(
    "UPDATE employees SET name = ?, dni = ?, position = ?, sector = ?, email = ?, phone = ?, empresa = ? WHERE id = ?",
    [
      name,
      dni,
      position,
      sector,
      email || "",
      phone || "",
      empresa,
      employeeId,
    ],
    function (err) {
      if (err) {
        console.error("Error al actualizar empleado:", err.stack);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      res.json({ id: employeeId, ...req.body });
    }
  );
});

// Ruta para eliminar un empleado
app.delete("/employees/:id", (req, res) => {
  const employeeId = parseInt(req.params.id);
  if (isNaN(employeeId)) {
    return res.status(400).json({ error: "ID de empleado inválido" });
  }

  // Primero verificar si hay documentos asociados
  db.get(
    "SELECT COUNT(*) as count FROM documents WHERE employeeId = ?",
    [employeeId],
    (err, row) => {
      if (err) {
        console.error("Error al verificar documentos:", err.stack);
        return res.status(500).json({ error: "Error en la base de datos" });
      }

      if (row.count > 0) {
        return res.status(400).json({
          error:
            "No se puede eliminar el empleado porque tiene documentos asociados. Elimine los documentos primero.",
        });
      }

      // Si no hay documentos, eliminar el empleado
      db.run(
        "DELETE FROM employees WHERE id = ?",
        [employeeId],
        function (err) {
          if (err) {
            console.error("Error al eliminar empleado:", err.stack);
            return res.status(500).json({ error: err.message });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Empleado no encontrado" });
          }
          res.json({ message: "Empleado eliminado exitosamente" });
        }
      );
    }
  );
});

// Ruta para obtener todos los documentos
app.get("/documents", (req, res) => {
  db.all(
    `
    SELECT d.*, e.name as employeeName, e.empresa 
    FROM documents d 
    JOIN employees e ON d.employeeId = e.id 
    ORDER BY d.type, d.archived, d.issueDate DESC
  `,
    (err, rows) => {
      if (err) {
        console.error("Error al consultar documentos:", err.stack);
        return res.status(500).json({ error: "Error en la base de datos" });
      }
      res.json(rows);
    }
  );
});

// Ruta para eliminar un documento
app.delete("/documents/:id", (req, res) => {
  const documentId = parseInt(req.params.id);
  if (isNaN(documentId)) {
    return res.status(400).json({ error: "ID de documento inválido" });
  }

  // Primero obtener el documento para eliminar el archivo
  db.get(
    "SELECT fileName FROM documents WHERE id = ?",
    [documentId],
    (err, row) => {
      if (err) {
        console.error("Error al consultar documento:", err.stack);
        return res.status(500).json({ error: "Error en la base de datos" });
      }
      if (!row) {
        return res.status(404).json({ error: "Documento no encontrado" });
      }

      // Eliminar el archivo físico
      const filePath = path.join(__dirname, "uploads", row.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.warn("No se pudo eliminar el archivo:", unlinkErr);
          }
        });
      }

      // Eliminar el registro de la base de datos
      db.run(
        "DELETE FROM documents WHERE id = ?",
        [documentId],
        function (err) {
          if (err) {
            console.error("Error al eliminar documento:", err.stack);
            return res.status(500).json({ error: err.message });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: "Documento no encontrado" });
          }
          res.json({ message: "Documento eliminado exitosamente" });
        }
      );
    }
  );
});

// Ruta para crear usuario administrador inicial
app.post("/setup-admin", (req, res) => {
  const adminUser = {
    username: "admin",
    password: "Admin2025!",
    name: "Administrador",
    role: "admin",
  };

  bcrypt.hash(adminUser.password, config.bcryptRounds, (err, hash) => {
    if (err) {
      console.error("Error al hashear contraseña:", err.stack);
      return res
        .status(500)
        .json({ error: "Error al crear usuario administrador" });
    }

    db.run(
      "INSERT OR IGNORE INTO users (username, password, name, role) VALUES (?, ?, ?, ?)",
      [adminUser.username, hash, adminUser.name, adminUser.role],
      function (err) {
        if (err) {
          console.error("Error al insertar usuario administrador:", err.stack);
          return res
            .status(500)
            .json({ error: "Error al crear usuario administrador" });
        }
        if (this.changes > 0) {
          res.json({ message: "Usuario administrador creado exitosamente" });
        } else {
          res.json({ message: "Usuario administrador ya existe" });
        }
      }
    );
  });
});

function calculateDocumentStatus(issueDate, expiryDate) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime())) {
    console.warn("Fecha de vencimiento inválida:", expiryDate);
    return "inválido";
  }
  const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) return "vencido";
  if (daysUntilExpiry <= 30) return "por_vencer";
  return "vigente";
}

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);

  // Iniciar el cron job para alertas de documentos
  startCronJob();

  // Verificar configuración de email al iniciar
  testEmailConfiguration().then((isValid) => {
    if (isValid) {
      console.log("✅ Servicio de email configurado correctamente");
    } else {
      console.log(
        "⚠️  Configuración de email no válida. Las alertas no se enviarán."
      );
    }
  });
});

// Ruta para ejecutar revisión manual de documentos (útil para pruebas)
app.post("/api/check-expiring-documents", async (req, res) => {
  try {
    await runManualCheck();
    res.json({ message: "Revisión manual completada" });
  } catch (error) {
    console.error("Error en revisión manual:", error);
    res.status(500).json({ error: "Error al ejecutar revisión manual" });
  }
});

// Ruta para obtener estadísticas de documentos próximos a vencer
app.get("/api/expiry-stats", async (req, res) => {
  try {
    const stats = await getExpiryStats();
    res.json(stats);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

app.get("/api/ping", (req, res) => {
  res.status(200).send("ok");
});
