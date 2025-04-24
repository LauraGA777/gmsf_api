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
    telefono: z.string().regex(/^\d{7,15}$/, "Teléfono debe tener entre 7 y 15 dígitos").optional(),
    direccion: z.string().optional(),
    tipo_documento: z.enum(["TI", "CC", "CE", "PP", "DIE"]),
    numero_documento: z.string().min(5, 'Número de documento inválido'),
    fecha_nacimiento: z.coerce.date()
        .refine(date => {
            const minAge = new Date();
            minAge.setFullYear(minAge.getFullYear() - 15);
            return date <= minAge;
        }, "Debes tener al menos 15 años"),
    estado: z.boolean().optional(),
    // Nuevos campos
    genero: z.enum(["M", "F", "O"]).optional(),
    id_rol: z.number().int().positive().optional(),
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
    apellido: z.string().min(3, "El apellido debe tener al menos 3 caracteres").optional(),
    telefono: z.string().regex(/^\d{7,15}$/, "Teléfono debe tener entre 7 y 15 dígitos").optional(),
    direccion: z.string().optional(),
    genero: z.enum(["M", "F", "O"]).optional(),
}).refine(data => {
    // Asegura que al menos un campo esté presente
    return Object.keys(data).length > 0;
}, {
    message: "Debes proporcionar al menos un campo para actualizar",
});

module.exports = { loginSchema, registroSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema, updateProfileSchema };