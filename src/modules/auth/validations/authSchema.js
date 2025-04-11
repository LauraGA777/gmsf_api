const { z } = require("zod");

const registroSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    apellido: z.string().min(3, 'El apellido es obligatorio'),
    correo: z.string().email('Correo electrónico inválido'),
    contrasena: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
    telefono: z.string().min(7, "Teléfono inválido").optional(),
    direccion: z.string().min(5, "La dirección debe tener al menos 5 caracteres").optional(),
    tipo_documento: z.enum(["TI", "CC", "TE", "CE", "NIT", "PP", "PEP", "DIE"]),
    numero_documento: z.string().min(5, 'Número de documento inválido'),
    fecha_nacimiento: z.coerce.date().refine(date => date <= new Date(), "La fecha de nacimiento no puede ser futura"),
    estado: z.boolean().optional(),    
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