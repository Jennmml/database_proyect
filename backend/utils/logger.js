import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Define los campos sensibles que deben ser redactados
const sensitiveFields = ['password', 'token', 'credential', 'secret', 'apiKey', 'accessToken', 'refreshToken'];

// Función para redactar campos sensibles en objetos
function redactSensitiveData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item));
  }

  const redacted = { ...data };
  for (const key of Object.keys(redacted)) {
    const keyLower = key.toLowerCase();
    if (sensitiveFields.some(field => keyLower.includes(field))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }
  return redacted;
}

// Formato personalizado que incluye redacción de datos sensibles
const redactFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const sanitizedMeta = redactSensitiveData(meta);
  const metaStr = Object.keys(sanitizedMeta).length > 0 ? JSON.stringify(sanitizedMeta) : '';
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...sanitizedMeta
  });
});

// Configuración de transporte para logs generales (rotación diaria)
const combinedTransport = new DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    redactFormat
  )
});

// Configuración de transporte para errores (rotación diaria)
const errorTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    redactFormat
  )
});

// Crear el logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    redactFormat
  ),
  transports: [
    combinedTransport,
    errorTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const sanitizedMeta = redactSensitiveData(meta);
          const metaStr = Object.keys(sanitizedMeta).length > 0 ? ` ${JSON.stringify(sanitizedMeta)}` : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      )
    })
  ]
});

export default logger;
