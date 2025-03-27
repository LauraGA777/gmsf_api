const nodemailer = require("nodemailer");
require("dotenv").config();

// Configura el transporte de correo
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD
    }
});

// Función para enviar correo de recuperación
const enviarCorreoRecuperacion = async (correo, token) => {
    const enlaceRecuperacion = `http://localhost:5173/api/auth/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER, // Correo del remitente
        to: correo, // Correo del destinatario
        subject: "Recuperación de contraseña", // Asunto del correo
        html: `
            <p>Hola,</p>
            <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
            <a href="${enlaceRecuperacion}">Restablecer contraseña</a>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
            <p>Gracias,</p>
            <p>El equipo de GMSF</p>
        `,
    };
    // Enviar el correo
    await transporter.sendMail(mailOptions);
};

module.exports = enviarCorreoRecuperacion;