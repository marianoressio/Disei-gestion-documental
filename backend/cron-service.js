import cron from "node-cron";
import sqlite3 from "sqlite3";
import { sendDocumentExpiryAlert } from "./email-service.js";
import config from "./config.js";

const { Database } = sqlite3.verbose();
const db = new Database(config.dbPath);

// Función para revisar documentos próximos a vencer
async function checkExpiringDocuments() {
  console.log("🔍 Revisando documentos próximos a vencer...");

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  try {
    // Obtener documentos que vencen en 30 días
    const documents30Days = await getDocumentsExpiringOn(thirtyDaysFromNow);
    console.log(
      `📧 Encontrados ${documents30Days.length} documentos que vencen en 30 días`
    );

    // Obtener documentos que vencen en 1 día
    const documents1Day = await getDocumentsExpiringOn(oneDayFromNow);
    console.log(
      `📧 Encontrados ${documents1Day.length} documentos que vencen en 1 día`
    );

    // Enviar alertas para documentos que vencen en 30 días
    for (const doc of documents30Days) {
      await sendDocumentExpiryAlert(doc.document, doc.employee, 30);
    }

    // Enviar alertas para documentos que vencen en 1 día
    for (const doc of documents1Day) {
      await sendDocumentExpiryAlert(doc.document, doc.employee, 1);
    }

    console.log("✅ Revisión de documentos completada");
  } catch (error) {
    console.error("❌ Error al revisar documentos:", error);
  }
}

// Función para obtener documentos que vencen en una fecha específica
function getDocumentsExpiringOn(targetDate) {
  return new Promise((resolve, reject) => {
    const targetDateStr = targetDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD

    const query = `
      SELECT 
        d.id,
        d.type,
        d.issueDate,
        d.expiryDate,
        d.fileName,
        d.archived,
        e.id as employeeId,
        e.name as employeeName,
        e.dni,
        e.position,
        e.sector,
        e.empresa,
        e.email,
        e.phone
      FROM documents d
      JOIN employees e ON d.employeeId = e.id
      WHERE d.expiryDate = ? 
        AND d.archived = 0
      ORDER BY e.name, d.type
    `;

    db.all(query, [targetDateStr], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const documents = rows.map((row) => ({
        document: {
          id: row.id,
          type: row.type,
          issueDate: row.issueDate,
          expiryDate: row.expiryDate,
          fileName: row.fileName,
          archived: row.archived,
        },
        employee: {
          id: row.employeeId,
          name: row.employeeName,
          dni: row.dni,
          position: row.position,
          sector: row.sector,
          empresa: row.empresa,
          email: row.email,
          phone: row.phone,
        },
      }));

      resolve(documents);
    });
  });
}

// Función para iniciar el cron job
export function startCronJob() {
  console.log("⏰ Iniciando cron job para alertas de documentos...");

  // Ejecutar todos los días a las 9:00 AM
  cron.schedule(
    "0 9 * * *",
    () => {
      console.log("🕘 Ejecutando revisión diaria de documentos...");
      checkExpiringDocuments();
    },
    {
      scheduled: true,
      timezone: "America/Argentina/Buenos_Aires",
    }
  );

  console.log(
    "✅ Cron job programado para ejecutarse diariamente a las 9:00 AM (hora de Argentina)"
  );
}

// Función para ejecutar una revisión manual (útil para pruebas)
export async function runManualCheck() {
  console.log("🔧 Ejecutando revisión manual de documentos...");
  await checkExpiringDocuments();
}

// Función para obtener estadísticas de documentos próximos a vencer
export function getExpiryStats() {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

    const query = `
      SELECT 
        COUNT(CASE WHEN d.expiryDate <= ? THEN 1 END) as expiringIn30Days,
        COUNT(CASE WHEN d.expiryDate <= ? THEN 1 END) as expiringIn1Day,
        COUNT(CASE WHEN d.expiryDate < ? THEN 1 END) as expired
      FROM documents d
      WHERE d.archived = 0
    `;

    db.get(
      query,
      [
        thirtyDaysFromNow.toISOString().split("T")[0],
        oneDayFromNow.toISOString().split("T")[0],
        now.toISOString().split("T")[0],
      ],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          expiringIn30Days: row.expiringIn30Days,
          expiringIn1Day: row.expiringIn1Day,
          expired: row.expired,
        });
      }
    );
  });
}
