# Skill: Corrección de Vulnerabilidades de Seguridad — FastFitness

## Contexto del Proyecto

FastFitness es una app web de gestión de gimnasio (Costa Rica) con:
- **Frontend**: Next.js 15 (React 19, TypeScript, Tailwind CSS) en puerto 3000
- **Backend**: Express 5 (Node.js, ES modules) en puerto 3100
- **Base de datos**: SQL Server (mssql@11)
- **Contenedores**: Docker Compose
- **Gestor de paquetes**: pnpm

### Estructura clave del proyecto
```
database_proyect/
├── backend/
│   ├── server.js              # Entry point, Express app con cors() abierto
│   ├── config/
│   │   ├── dbconfig.js        # Conexión SQL Server (encrypt:false)
│   │   └── conectionStore.js  # Singleton de conexión global
│   ├── controllers/           # 10 controladores sin auth ni validación
│   │   ├── db.Controller.js   # Recibe credenciales BD del frontend
│   │   ├── cliente.controller.js
│   │   ├── membresias.controller.js
│   │   ├── sesion.controller.js
│   │   ├── maquina.controller.js
│   │   ├── entrenador.controller.js
│   │   ├── helper.controller.js
│   │   ├── clase.controller.js
│   │   ├── admin.controller.js
│   │   └── estadistica.controller.js
│   ├── routes/                # 10 archivos de rutas sin middleware de auth
│   └── db/
│       └── dbquery.sql        # Schema completo + stored procedures
├── frontend/
│   ├── app/
│   │   ├── auth/page.tsx      # Login que envía credenciales BD por HTTP
│   │   └── (admin)/           # Páginas admin sin protección de ruta
│   ├── src/components/        # Componentes UI
│   └── context/
├── docker-compose.yml         # Sin SQL Server (se conecta a host externo)
├── tests/                     # ← CREAR: carpeta para tests automatizados
└── vulnerabilidades_y_mitigaciones.md  # Documento de referencia
```

---

## Documento de Referencia

Consultar siempre `vulnerabilidades_y_mitigaciones.md` en la raíz del proyecto para el detalle de las 12 amenazas (A-01 a A-12), mitigaciones y requerimientos de seguridad (RS-01 a RS-12).

---

## Tarea Académica: Partes 2, 3 y 4

### Parte 2 — Explotación de Software de Servidores (8 correcciones, 2 por persona)

Las correcciones deben ser de **diferente naturaleza**. Categorías válidas:

1. **Inyección en el servidor** (SQL injection, command injection, parameter injection)
2. **Control de acceso / Escalación de privilegios** (validar roles, chequear propiedad de objetos)
3. **Explotación de la confianza** (no confiar en datos del cliente para decisiones críticas)

#### Vulnerabilidades específicas a corregir (servidor):

| # | Vuln | Archivo(s) afectado(s) | Qué corregir |
|---|------|------------------------|--------------|
| 1 | **A-05 SQL Injection** | `maquina.controller.js` L61-64 (`nuevaRevisionMaquina`) | `.input()` sin tipo SQL explícito → agregar `sql.Int`, `sql.Char(9)`, `sql.TinyInt`, `sql.NVarChar` |
| 2 | **A-05 SQL Injection** | `entrenador.controller.js` L18-19 (`asignarEntrenadorASesionProgramada`) | `.input()` sin tipo SQL explícito → agregar tipos |
| 3 | **A-01 Auth Bypass** | `server.js` + todos los routes | No hay autenticación → Implementar JWT middleware |
| 4 | **A-03 Privilege Escalation** | Todos los controllers/routes | No hay roles → Implementar RBAC middleware |
| 5 | **A-06 Parameter Manipulation** | `membresias.controller.js`, `sesion.controller.js` | Sin validación de negocio en servidor → Validar con zod |
| 6 | **A-07 Error Info Leak** | Todos los controllers | `err.message` expuesto al cliente → Middleware de errores genérico |
| 7 | **A-10 Credenciales expuestas** | `db.Controller.js`, `docker-compose.yml` | Credenciales hardcoded → usar `.env` + `dotenv` |
| 8 | **A-12 CORS abierto** | `server.js` L18 | `cors()` sin restricción → configurar origins permitidos |

### Parte 3 — Explotación de Software en Clientes (5 correcciones, 1 por persona)

1. **Cliente como objeto de ataque**: Manejo inseguro de datos recibidos del backend
2. **XSS / Exposición de scripts**: Verificar que no se renderice HTML sin escapar
3. **Sanitización antes de renderizar**: Escapar datos antes de mostrar en la UI

#### Vulnerabilidades específicas a corregir (cliente):

| # | Vuln | Archivo(s) afectado(s) | Qué corregir |
|---|------|------------------------|--------------|
| 1 | **XSS potencial** | `auth/page.tsx` L43, L102 | Renderiza `data.message` del servidor directamente → sanitizar |
| 2 | **Credenciales en cliente** | `auth/page.tsx` L6, L28-32 | Envía credenciales BD en texto plano, API URL hardcoded |
| 3 | **Datos sin sanitizar** | Componentes que renderizan datos de BD | Verificar escape de datos antes de renderizar con React |
| 4 | **Sin protección de rutas** | `app/(admin)/layout.tsx` | No verifica autenticación en rutas protegidas del frontend |
| 5 | **Console.log de datos** | Múltiples componentes | Logs del cliente pueden filtrar datos sensibles |

### Parte 4 — Alteración de Entrada de Usuario (2 correcciones totales)

1. **Logging y trazabilidad** (A-08, A-09):
   - Instalar `winston` o `pino` para logging estructurado
   - Crear tabla de auditoría en SQL Server
   - Middleware de auditoría que registre: usuario, acción, timestamp, resultado
   - **NO loguear secretos en claro** (contraseñas, tokens)

2. **Tests automatizados**:
   - Crear carpeta `tests/` en la raíz
   - Tests que reproduzcan solicitudes que antes explotaban la vulnerabilidad
   - Formato: test que FALLA en versión vulnerable y PASA con el parche

3. **Anti audit poisoning**:
   - Logs append-only (no permitir sobreescritura)
   - Considerar firma/hashing de logs
   - Documentar mecanismos propuestos

---

## Reglas de Trabajo (Workflow Git)

### OBLIGATORIO seguir este flujo:

1. **Branch por persona**: Crear branch con iniciales del autor (ej: `fix/js-sql-injection`)
2. **Commits descriptivos**: Mensajes claros que expliquen qué se corrige y por qué
3. **Pull Requests**: NUNCA push directo a `main`. Siempre PR con descripción de:
   - Qué vulnerabilidad se corrige (CWE/OWASP)
   - Qué archivos cambian y por qué
   - Efectos secundarios considerados
4. **Tests acompañan cada corrección**: Cada fix debe tener test que demuestre la vulnerabilidad

### Convención de commits sugerida:
```
fix(security): [A-XX] Descripción breve de la corrección

- Archivo(s) modificado(s)
- CWE/CAPEC referencia
- Qué cambia y por qué
```

### Convención de branches:
```
fix/<iniciales>-<descripcion-corta>
Ejemplo: fix/js-sql-injection-tipos
```

---

## Cómo Implementar Cada Corrección

### Patrón general para cada fix:

1. **Identificar** el código vulnerable exacto (archivo, función, línea)
2. **Documentar** la vulnerabilidad (CWE/CAPEC, impacto, evidencia antes)
3. **Corregir** el código aplicando la mitigación
4. **Escribir test** que demuestre:
   - ❌ El comportamiento vulnerable (solicitud maliciosa que antes funcionaba)
   - ✅ El comportamiento seguro (la misma solicitud ahora es rechazada)
5. **Commit** con mensaje descriptivo
6. **Evidencia**: Captura de antes/después para el informe

### Dependencias a instalar (backend):

```bash
# En backend/
pnpm add jsonwebtoken bcryptjs express-rate-limit zod winston dotenv helmet
pnpm add -D vitest supertest
```

### Dependencias a instalar (frontend):
```bash
# En frontend/
pnpm add dompurify
pnpm add -D @types/dompurify vitest @testing-library/react
```

---

## Estructura de Tests

```
tests/
├── backend/
│   ├── sql-injection.test.js      # Tests para A-05
│   ├── auth-bypass.test.js        # Tests para A-01
│   ├── privilege-escalation.test.js # Tests para A-03
│   ├── parameter-manipulation.test.js # Tests para A-06
│   ├── error-exposure.test.js     # Tests para A-07
│   └── cors-config.test.js       # Tests para A-12
├── frontend/
│   ├── xss-prevention.test.ts    # Tests para XSS
│   └── route-protection.test.ts  # Tests para rutas protegidas
├── scripts/
│   ├── exploit-sql-injection.sh  # Script curl que demuestra el exploit
│   ├── exploit-auth-bypass.sh    # Script curl sin token
│   └── exploit-idor.sh           # Script curl enumerando cédulas
└── README.md                     # Documentación de cómo correr tests
```

### Formato de test:
```javascript
import { describe, it, expect } from 'vitest';

describe('A-05: SQL Injection Prevention', () => {
  it('VULNERABLE: antes aceptaba input sin tipo SQL', async () => {
    // Documentar que antes .input() no tenía tipo
    // Este test documenta el comportamiento vulnerable
  });

  it('FIXED: ahora rechaza/sanitiza input con tipo SQL explícito', async () => {
    // Verificar que .input() tiene tipo SQL explícito
    // Verificar que el request se procesa correctamente con datos válidos
    // Verificar que datos maliciosos son rechazados
  });
});
```

---

## Entregables Requeridos

### 1. Repositorio Git
- Ramas/commits con proceso de corrección
- Tests en carpeta `tests/`
- Scripts de reproducción (curl/Postman)

### 2. Informe Técnico (Word, máx 20 págs)
- Resumen ejecutivo
- Vulnerabilidades identificadas (archivo/clase/función, CWE/OWASP)
- Descripción de corrección (qué + por qué)
- Evidencias: logs, tests, capturas antes/después
- Plan de verificación post-corrección
- Link al video

### 3. Video Demo (4-6 min)
- Mostrar test que fallaba en versión vulnerable
- Mostrar cómo pasa con el parche
- Cada estudiante explica su parte

### 4. README.md (máx 5 págs)
- Pasos de reproducción
- Cómo ejecutar la app vulnerable
- Cómo ejecutar tests
- Cómo comprobar correcciones
- Sección por cada estudiante describiendo su aporte

---

## Criterios de Evaluación

| Criterio | Puntos | Qué evalúan |
|----------|--------|-------------|
| Corrección funcional y pruebas | 25 | Tests que demuestran vuln y corrección, reproducibilidad |
| Calidad de corrección / diseño seguro | 25 | Principios (validación centralizada, least privilege, prepared statements) |
| Análisis y documentación técnica | 15 | Identificación precisa del código vulnerable, evidencia, clasificación |
| Video | 25 | Claridad, consistencia con código/informe, participación de todos |
| Workflow Git/PR/tests | 10 | Historial de commits, ramas, descripción de PR |

---

## Prioridades de Implementación (Orden Sugerido)

Comenzar por las correcciones que son **prerequisito** de otras:

1. 🔴 **A-10**: Mover credenciales a `.env` (base para todo lo demás)
2. 🔴 **A-05**: Corregir SQL injection (tipos en `.input()`)
3. 🔴 **A-01**: Implementar JWT authentication
4. 🔴 **A-03**: Implementar RBAC (depende de A-01)
5. 🟠 **A-06**: Validación de parámetros en backend
6. 🟠 **A-07**: Middleware de errores genérico
7. 🟠 **A-12**: CORS restringido + headers de seguridad
8. 🟠 **A-08/A-09**: Logging estructurado + auditoría
9. 🟡 **XSS**: Sanitización en frontend
10. 🟡 **Rutas protegidas**: Auth guard en frontend

---

## Notas Importantes

- **Cada corrección debe ser de DIFERENTE NATURALEZA** (no se pueden hacer 2 correcciones del mismo tipo)
- **Tests deben fallar en versión vulnerable**: Esto es CLAVE para la evaluación
- **No atacar sistemas ajenos**: Solo usar el código y dataset del proyecto
- **Preferir correcciones en servidor**: Para validación e implementación de prepared statements
- **En cliente, priorizar escapar**: Sanitizar output antes de renderizar
- **Logging sin secretos**: Registrar eventos con contexto (userID, endpoint, timestamp) pero NUNCA contraseñas o tokens en texto plano
- **4 personas en el equipo**: 2 correcciones por persona = 8 correcciones parte 2, 1 por persona = 4-5 correcciones parte 3
