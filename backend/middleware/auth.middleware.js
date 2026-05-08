export const requireRole = (role) => (req, res, next) => {
    const userRole = req.headers['x-user-role'];

    if (!userRole) {
        return res.status(401).json({
            success: false,
            message: 'No autorizado. Se requiere autenticación.'
        });
    }

    if (userRole !== role) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Rol insuficiente.'
        });
    }

    next();
};
