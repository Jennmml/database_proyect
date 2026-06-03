# Guía de Video: Corrección A-08/A-09 — Logging Estructurado y Tracing

## 📋 Información General

**Corrección:** A-08/A-09 — Logging Estructurado y Tracing  
**Rama:** `fix/backend-logging-kim`  
**Vulnerabilidades:** CWE-532 (Inserción de Información Sensible en Logs), CWE-117 (Neutralización Inadecuada para Logs)

## 🎯 Objetivo del Video

Demostrar cómo se implementó un sistema de logging estructurado con sanitización automática de datos sensibles para reemplazar los inseguros `console.log` y `console.error` en todo el backend.

## 📝 Guion del Video

### Parte 1: Introducción del Problema (1-2 minutos)

**Visual:** Mostrar el código vulnerable en múltiples archivos

```
❌ ANTES (VULNERABLE):
- console.log(`Connected to SQL Server. Active database: ${currentDb}`);
- console.error('Error connecting to sql server:', err); // Expone credenciales
- console.log(result); // Expone datos crudos
```

**Narración:**
- "El backend usaba exclusivamente `console.log` y `console.error` sin ninguna estructura"
- "Esto tiene dos problemas graves de seguridad:"
  1. **CWE-532:** Los logs pueden capturar contraseñas, tokens y otros datos sensibles en texto plano
  2. **CWE-117:** Sin sanitización, un atacante podría inyectar caracteres de control en los logs
- "Además, los logs no persistían en archivos, haciendo imposible la auditoría forense"

**Visual:** Mostrar ejemplo de log vulnerable con credenciales expuestas

---

### Parte 2: Solución Implementada (2-3 minutos)

**Visual:** Mostrar arquitectura de la solución

```
📁 Estructura de archivos creados/modificados:
backend/
├── utils/
│   └── logger.js          ← Nuevo: Servicio de logging Winston
├── middleware/
│   └── logger.middleware.js  ← Nuevo: Middleware de auditoría
├── config/
│   ├── dbconfig.js        ← Modificado: Reemplazar console.log/error
│   └── conectionStore.js  ← Modificado: Reemplazar console.log/error
├── controllers/
│   └── db.Controller.js  ← Modificado: Reemplazar console.log/error
└── server.js              ← Modificado: Integrar middleware
```

**Narración:**
- "Implementamos Winston, el estándar de la industria para logging en Node.js"
- "La solución tiene tres componentes principales:"

#### 2.1 Servicio de Logging (logger.js)

**Visual:** Mostrar código de `backend/utils/logger.js`

```javascript
// Campos sensibles que se redactan automáticamente
const sensitiveFields = ['password', 'token', 'credential', 'secret', 
                        'apiKey', 'accessToken', 'refreshToken'];

// Función de redacción recursiva
function redactSensitiveData(data) {
    // Reemplaza valores sensibles por [REDACTED]
}
```

**Narración:**
- "El servicio de logging tiene sanitización automática de datos sensibles"
- "Cualquier campo llamado 'password', 'token', 'credential', etc., se reemplaza por '[REDACTED]'"
- "Los logs se guardan en formato JSON estructurado para fácil análisis"
- "Implementamos rotación diaria de archivos para evitar que crezcan indefinidamente"

**Visual:** Mostrar configuración de transporte de archivos

```javascript
const combinedTransport = new DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d'
});
```

#### 2.2 Middleware de Auditoría

**Visual:** Mostrar código de `backend/middleware/logger.middleware.js`

```javascript
const auditLogger = (req, res, next) => {
    const requestInfo = {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
    };
    // Registra método, URL, IP, timestamp y resultado
};
```

**Narración:**
- "El middleware de auditoría captura automáticamente:"
  - Método HTTP (GET, POST, etc.)
  - URL/endpoint solicitado
  - IP del cliente
  - Timestamp exacto
  - Status code de respuesta
  - Tiempo de respuesta
- "Esto permite auditoría completa de todas las peticiones a la API"

#### 2.3 Integración en server.js

**Visual:** Mostrar cambios en `backend/server.js`

```javascript
import auditLogger from './middleware/logger.middleware.js';
import logger from './utils/logger.js';

app.use(auditLogger); // Middleware global

app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
});
```

**Narración:**
- "Integramos el middleware globalmente en server.js"
- "Reemplazamos todos los console.log inseguros por logger.info y logger.error"
- "Esto se hizo en archivos críticos como dbconfig.js, conectionStore.js y db.Controller.js"

---

### Parte 3: Demostración de Tests (2-3 minutos)

**Visual:** Ejecutar tests en terminal

```bash
cd backend
pnpm test logging.test.js
```

**Narración:**
- "Creamos una suite de tests automatizados para verificar la corrección"
- "Los tests verifican:"
  1. Que el servicio de logging existe y configura Winston correctamente
  2. Que la función de redacción de datos sensibles está implementada
  3. Que el middleware de auditoría registra metadata correcta
  4. Que server.js integró el middleware
  5. que los console.log fueron reemplazados por logger
  6. Que los logs se escriben en formato JSON estructurado

**Visual:** Mostrar resultado de tests pasando

```
✓ logging.test.js (12 tests)
  ✓ utils/logger.js — EXISTE y configura Winston correctamente
  ✓ utils/logger.js — Tiene función de redacción de datos sensibles
  ✓ middleware/logger.middleware.js — EXISTE y registra metadata
  ✓ server.js — INTEGRÓ el middleware de logging
  ✓ server.js — REEMPLAZÓ console.log por logger
  ✓ config/dbconfig.js — REEMPLAZÓ console.log/error por logger
  ✓ config/conectionStore.js — REEMPLAZÓ console.log/error por logger
  ✓ controllers/db.Controller.js — REEMPLAZÓ console.log/error
  ✓ utils/logger.js — La función redactSensitiveData redacta passwords
  ✓ utils/logger.js — La función redacta múltiples campos sensibles
  ✓ crea directorio de logs si no existe
  ✓ logger — escribe logs en formato JSON estructurado
```

**Narración:**
- "Los 12 tests pasan exitosamente"
- "Esto garantiza que la sanitización de datos sensibles funciona correctamente"

---

### Parte 4: Demostración de Sanitización (2-3 minutos)

**Visual:** Mostrar ejemplo de log con datos sensibles

**Caso 1: Login con contraseña**

```javascript
// Petición POST /login con:
{
    "username": "testuser",
    "password": "MiContraseñaSecreta123"
}

// Log generado (SANITIZADO):
{
    "timestamp": "2026-05-21 16:32:12",
    "level": "info",
    "message": "API Request",
    "method": "POST",
    "url": "/login",
    "ip": "192.168.1.100",
    "password": "[REDACTED]",  ← ¡Sanitizado automáticamente!
    "username": "testuser",
    "statusCode": 200,
    "responseTime": "45ms",
    "success": true
}
```

**Narración:**
- "Observen cómo el campo 'password' fue automáticamente reemplazado por '[REDACTED]'"
- "Esto protege las credenciales de los usuarios incluso si los logs son comprometidos"

**Caso 2: Error de base de datos con credenciales**

```javascript
// ❌ ANTES (VULNERABLE):
console.error('Error connecting to sql server:', err);
// Output: Error connecting to sql server: Error: Login failed for user 'admin' with password 'SecretPass123'

// ✅ DESPUÉS (CORREGIDO):
logger.error('Error connecting to SQL Server', { error: err.message });
// Output: {"level":"error","message":"Error connecting to SQL Server","error":"Login failed for user"}
// ¡La contraseña NO aparece en el log!
```

**Narración:**
- "Antes, los errores de conexión a base de datos exponían credenciales completas"
- "Ahora, solo se registra el mensaje de error sin detalles sensibles"

---

### Parte 5: Verificación de Archivos de Log (2 minutos)

**Visual:** Mostrar directorio de logs

```bash
cd backend/logs
ls
```

**Narración:**
- "Los logs se guardan en la carpeta `backend/logs/`"
- "Hay dos tipos de archivos:"
  - `combined-YYYY-MM-DD.log`: Todos los logs (info, warn, error)
  - `error-YYYY-MM-DD.log`: Solo errores

**Visual:** Mostrar contenido de un archivo de log

```bash
cat backend/logs/combined-2026-05-21.log | head -10
```

**Output:**
```json
{"timestamp":"2026-05-21 16:32:12","level":"info","message":"Server is running on http://localhost:3100"}
{"timestamp":"2026-05-21 16:33:45","level":"info","message":"API Request","method":"GET","url":"/clientes","ip":"::1","statusCode":200,"responseTime":"120ms","success":true}
{"timestamp":"2026-05-21 16:34:22","level":"info","message":"API Request","method":"POST","url":"/connection","ip":"::1","statusCode":200,"responseTime":"340ms","success":true}
```

**Narración:**
- "Los logs están en formato JSON estructurado"
- "Cada entrada tiene timestamp, nivel, mensaje y metadata"
- "Esto facilita el análisis con herramientas como ELK Stack, Splunk, etc."

---

### Parte 6: Beneficios de la Corrección (1-2 minutos)

**Visual:** Mostrar comparación antes/después en formato tabla

| Aspecto | ❌ ANTES | ✅ DESPUÉS |
|---------|----------|------------|
| **Formato** | Texto plano no estructurado | JSON estructurado |
| **Sanitización** | Ninguna (expone credenciales) | Automática (password/token → [REDACTED]) |
| **Persistencia** | Solo consola (se pierde al reiniciar) | Archivos con rotación diaria |
| **Auditoría** | Sin tracking de peticiones | Metadata completa (IP, método, URL, timestamp) |
| **Análisis** | Manual y difícil | Automatizado con herramientas de log analysis |
| **CWE-532** | ❌ Vulnerable | ✅ Mitigado |
| **CWE-117** | ❌ Vulnerable | ✅ Mitigado |

**Narración:**
- "Esta corrección mitiga dos vulnerabilidades críticas:"
  - **CWE-532:** Ya no exponemos información sensible en los logs
  - **CWE-117:** El formato JSON estructurado previene inyección de logs
- "Además, obtenemos beneficios operacionales:"
  - Auditoría completa de todas las peticiones API
  - Logs persistentes para análisis forense
  - Facilidad para integrar con herramientas de monitoreo
  - Rotación automática para evitar crecimiento infinito

---

### Parte 7: Conclusión (1 minuto)

**Visual:** Mostrar resumen de cambios

```bash
git diff --stat master..fix/backend-logging-kim
```

**Narración:**
- "En resumen, implementamos:"
  - Servicio de logging estructurado con Winston
  - Sanitización automática de datos sensibles
  - Middleware de auditoría para tracking de peticiones
  - Persistencia de logs en archivos con rotación
  - Reemplazo de console.log inseguros por logger
  - Suite de tests automatizados para verificación

**Visual:** Mostrar comando para ejecutar tests

```bash
cd backend && pnpm test logging.test.js
```

**Narración:**
- "Para verificar esta corrección, pueden ejecutar:"
  - `cd backend && pnpm test logging.test.js`
- "Los 12 tests garantizan que la sanitización y la persistencia funcionan correctamente"
- "Esta implementación sigue las mejores prácticas de OWASP para logging seguro"

**Visual:** Pantalla final con resumen

```
✅ Corrección A-08/A-09: Logging Estructurado y Tracing
✅ Rama: fix/backend-logging-kim
✅ Tests: 12/12 pasando
✅ Vulnerabilidades mitigadas: CWE-532, CWE-117
```

**Narración:**
- "Con esto, el backend ahora tiene un sistema de logging seguro, estructurado y auditable"
- "Gracias por ver esta demostración de la corrección de seguridad"

---

## 🎬 Tips para el Video

1. **Tiempo total estimado:** 12-15 minutos
2. **Velocidad:** Hablar claro y a ritmo moderado
3. **Visual:** Usar highlighting de código para resaltar cambios importantes
4. **Terminal:** Mantener fuente legible y evitar scrolls rápidos
5. **Estructura:** Seguir el guion pero adaptar al flujo natural
6. **Énfasis:** Resaltar siempre el "por qué" de cada cambio (seguridad)

## 🔗 Recursos Adicionales

- **OWASP Logging Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- **CWE-532:** https://cwe.mitre.org/data/definitions/532.html
- **CWE-117:** https://cwe.mitre.org/data/definitions/117.html
- **Winston Documentation:** https://github.com/winstonjs/winston
