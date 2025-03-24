const { z } = require("zod");

const registroSchema = z.object({
    nombre: z.string().min(3),
    apellido: z.string().min(3),           
    correo: z.string().email(),
    contrasena: z.string().min(8),
    telefono: z.string().min(7),
    direccion: z.string().min(5),
    tipo_documento: z.enum(["CC", "CE", "TI", "TE", "NIT", "PP", "PEP", "DIE"]), 
    numero_documento: z.string().min(5),
    fecha_nacimiento: z.coerce.date() // Acepta strings y los convierte a Date
        .refine(date => date <= new Date(), {
            message: "La fecha de nacimiento no puede ser futura"
        })    
});
const loginSchema = z.object({
    correo: z.string().email("Correo inválido"),
    contrasena: z.string().min(8, "Mínimo 8 caracteres"),
});
const forgotPasswordSchema = z.object({
    correo: z.string().email()
});
const resetPasswordSchema = z.object({
    token: z.string(),
    nuevaContrasena: z.string().min(8)
});

const changePasswordSchema = z.object({
    contrasenaActual: z.string().min(8, "La contraseña actual debe tener al menos 8 caracteres"),
    nuevaContrasena: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    usuarioId: z.number().int().positive(),
});

const updateProfileSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
    telefono: z.string().min(7, "El teléfono debe tener al menos 7 caracteres").optional(),
    direccion: z.string().min(5, "La dirección debe tener al menos 5 caracteres").optional(),
}).refine(data => {
    // Asegura que al menos un campo esté presente
    return Object.keys(data).length > 0;
}, {
    message: "Debes proporcionar al menos un campo para actualizar",
});

module.exports = { loginSchema, registroSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, updateProfileSchema };