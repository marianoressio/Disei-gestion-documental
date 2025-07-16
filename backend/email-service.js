import nodemailer from "nodemailer";
import config from "./config.js";

// Configuración del transportador de email (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

// Lista de destinatarios para las alertas
const ALERT_RECIPIENTS = [
  "rrhh@disei.com.ar", // Sandra
  "asistente-rrhh@disei.com.ar", // Laura
  "marinanabella@yahoo.com.ar", // Anabella
  "marianoressio.dpp@gmail.com", // Mariano (admin para pruebas)
];

// Función para enviar alerta de documento próximo a vencer
export async function sendDocumentExpiryAlert(
  document,
  employee,
  daysUntilExpiry
) {
  try {
    const subject = `🚨 Alerta: Documento próximo a vencer - ${daysUntilExpiry} días`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #dc3545; margin: 0;">⚠️ Alerta de Documento</h2>
        </div>
        
        <div style="padding: 20px; background-color: white; border: 1px solid #dee2e6;">
          <h3 style="color: #495057;">Documento próximo a vencer</h3>
          
          <div style="margin: 20px 0;">
            <p><strong>Empleado:</strong> ${employee.name}</p>
            <p><strong>DNI:</strong> ${employee.dni}</p>
            <p><strong>Puesto:</strong> ${employee.position}</p>
            <p><strong>Empresa:</strong> ${employee.empresa}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p><strong>Documento:</strong> ${document.type}</p>
            <p><strong>Fecha de emisión:</strong> ${document.issueDate}</p>
            <p><strong>Fecha de vencimiento:</strong> ${document.expiryDate}</p>
            <p><strong>Días restantes:</strong> <span style="color: #dc3545; font-weight: bold;">${daysUntilExpiry} días</span></p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
            <p style="margin: 0; font-size: 14px; color: #6c757d;">
              Por favor, actualice este documento antes de la fecha de vencimiento para evitar inconvenientes.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
          <p>Este es un mensaje automático del Sistema de Gestión Documental DISEI</p>
        </div>
      </div>
    `;

    const textContent = `
ALERTA DE DOCUMENTO PRÓXIMO A VENCER

Empleado: ${employee.name}
DNI: ${employee.dni}
Puesto: ${employee.position}
Empresa: ${employee.empresa}

Documento: ${document.type}
Fecha de emisión: ${document.issueDate}
Fecha de vencimiento: ${document.expiryDate}
Días restantes: ${daysUntilExpiry} días

Por favor, actualice este documento antes de la fecha de vencimiento.

---
Sistema de Gestión Documental DISEI
    `;

    // Enviar email a todos los destinatarios
    for (const recipient of ALERT_RECIPIENTS) {
      const mailOptions = {
        from: config.emailUser,
        to: recipient,
        subject: subject,
        text: textContent,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(
        `✅ Alerta enviada a ${recipient} para documento ${document.type} de ${employee.name}`
      );
    }

    return true;
  } catch (error) {
    console.error("❌ Error al enviar alerta por email:", error);
    return false;
  }
}

// Función para verificar la configuración del email
export async function testEmailConfiguration() {
  try {
    await transporter.verify();
    console.log("✅ Configuración de email verificada correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error en la configuración de email:", error);
    return false;
  }
}
