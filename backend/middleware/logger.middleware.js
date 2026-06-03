import logger from '../utils/logger.js';

/**
 * Middleware de auditoría para registrar todas las peticiones HTTP
 * Registra: método, URL, IP del cliente, timestamp y resultado
 */
const auditLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capturar información de la solicitud
  const requestInfo = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  };

  // Capturar el response original para registrar el status code
  const originalSend = res.send;
  res.send = function (data) {
    const responseTime = Date.now() - startTime;
    
    // Registrar información de la respuesta
    logger.info('API Request', {
      ...requestInfo,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      success: res.statusCode >= 200 && res.statusCode < 400
    });

    return originalSend.call(this, data);
  };

  next();
};

export default auditLogger;
