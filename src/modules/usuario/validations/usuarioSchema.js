const { z } = require('zod');

// Esquema para crear/editar un usuario
const usuarioSchema = z.object({
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
    
    // New fields
    codigo: z.string().regex(/^U\d{3}$/, "El código debe tener formato U seguido de 3 dígitos").optional(),
    genero: z.enum(["M", "F", "O"]).optional(),
    id_rol: z.number().int().positive().optional(),
});

const idSchema = z.object({
    id: z.coerce
        .number()
        .int("El ID debe ser un número entero")
        .positive("El ID debe ser positivo"),
});

// Esquema para actualizar usuario (todos los campos opcionales)
const updateUsuarioSchema = z.object({
    nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
    apellido: z.string().min(3, 'El apellido debe tener al menos 3 caracteres').optional(),
    correo: z.string().email('Correo inválido').optional(),
    telefono: z.string().regex(/^\d{7,15}$/, "Teléfono debe tener entre 7 y 15 dígitos").optional(),
    direccion: z.string().optional(),
    estado: z.boolean().optional(),
    genero: z.enum(["M", "F", "O"]).optional(),
    id_rol: z.number().int().positive().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
});

const searchUsuarioSchema = z.object({
    q: z.string().min(1, "El término de búsqueda no puede estar vacío").optional(),
    pagina: z.coerce.number().int().positive().default(1),
    limite: z.coerce.number().int().positive().max(100).default(10),
    orden: z.enum(["nombre", "correo", "fecha_nacimiento", "codigo"]).default("nombre"),
    direccion: z.enum(["ASC", "DESC"]).default("ASC"),
});

module.exports = { usuarioSchema, idSchema, updateUsuarioSchema, searchUsuarioSchema };