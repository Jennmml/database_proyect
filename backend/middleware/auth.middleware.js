import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

/**
 * Middleware para autenticar tokens JWT
 * Valida el token desde el header Authorization
 * Establece req.user con los datos del token verificado
 */
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token requerido. Use el formato: Bearer <token>'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

/**
 * Middleware para verificar rol del usuario
 * Valida que req.user exista y tenga el rol requerido
 * Debe usarse después de authenticateToken
 */
export const requireRole = (role) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado. Se requiere un token válido.'
        });
    }

    if (req.user.role !== role) {
        return res.status(403).json({
            success: false,
            message: `Acceso denegado. Se requiere el rol: ${role}`
        });
    }

    next();
};

/**
 * Función auxiliar para generar tokens JWT (para testing)
 */
export const generateToken = (user) => {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
};
