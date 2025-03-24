const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Encabezado Authorization no proporcionado" });
    }
    // Extraer el token
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token no proporcionado o formato incorrecto" });
    }
    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Añadir el ID al request
        req.usuarioId = decoded.id;
        // Continuar con el siguiente middleware o controlador
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw { status: 401, message: "Token expirado" }; // Lanzar error con `status`
        }
        return next({ status: 401, message: "Error interno al registrar usuario" });
    }
};

module.exports = { verificarToken };