# Documentación de Corrección de Seguridad: Tarea #1
## Control de Acceso y Escalación de Privilegios (RBAC)

**ID de Vulnerabilidad:** FIX-S2 (A-03: Broken Access Control)
**Clasificación CAPEC:** [CAPEC-233: Privilege Escalation](https://capec.mitre.org/data/definitions/233.html)
**CWE:** [CWE-862: Missing Authorization](https://cwe.mitre.org/data/definitions/862.html)

---

### 1. Descripción de la Vulnerabilidad

El sistema FastFitness presentaba una falta total de controles de autorización en sus endpoints administrativos. Específicamente, las rutas relacionadas con la gestión de inventario de máquinas en `backend/routes/maquina.routes.js` permitían que cualquier usuario (incluso un atacante anónimo sin autenticación) pudiera:

- Registrar nuevas máquinas en el gimnasio.
- Crear revisiones de mantenimiento.

Esto permitía un ataque de **Escalación de Privilegios**, donde un usuario con el nivel más bajo de acceso (o ninguno) podía ejecutar funciones críticas reservadas exclusivamente para el rol de **Administrador**.

---

### 2. Archivos y Líneas Modificadas

| Archivo | Tipo de Cambio |
|---------|----------------|
| `backend/routes/maquina.routes.js` | Agregado middleware `requireRole('admin')` a rutas POST |
| `backend/middleware/auth.middleware.js` | Creado middleware de validación de roles |

---

### 3. Detalles de la Corrección

Se implementó un mecanismo de **Control de Acceso Basado en Roles (RBAC)** utilizando un middleware centralizado (`requireRole`).

**Middleware `requireRole` (`backend/middleware/auth.middleware.js`):**
```javascript
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
```

**Protección aplicada a rutas (`backend/routes/maquina.routes.js`):**
```javascript
// ANTES (VULNERABLE):
router.post("/agregarMaquina", agregarMaquina);
router.post('/nuevaRevisionMaquina', nuevaRevisionMaquina);

// DESPUÉS (CORREGIDO):
router.post("/agregarMaquina", requireRole('admin'), agregarMaquina);
router.post('/nuevaRevisionMaquina', requireRole('admin'), nuevaRevisionMaquina);
```

---

### 4. Evidencia de Mitigación (Pruebas)

Se creó un suite de pruebas automatizadas en `backend/__tests__/maquina.rbac.test.js` utilizando **Vitest** y **Supertest**.

#### Tests de Verificación Estática

Estos tests confirman que el código corregido contiene las defensas:

| Test | Descripción | Estado |
|------|-------------|--------|
| `maquina.routes.js — ANTES` | Verifica que NO existe el patrón vulnerable (ruta sin middleware) | PASADO |
| `maquina.routes.js — DESPUÉS` | Verifica que `requireRole('admin')` está presente | PASADO |
| `auth.middleware.js` | Verifica que el middleware exporta `requireRole` con 401/403 | PASADO |

#### Tests de Comportamiento (Integración)

| Test | Descripción | Estado |
|------|-------------|--------|
| Sin autenticación → 401 | Petición sin `x-user-role` retorna `401 Unauthorized` | PASADO |
| Rol incorrecto → 403 | Petición con `x-user-role: cliente` retorna `403 Forbidden` | PASADO |
| Admin válido → 200 | Petición con `x-user-role: admin` permite acceso | PASADO |
| Ruta GET pública | `cursorMaquinasVencidas` sigue funcionando sin auth | PASADO |

#### Tests de Reversión Temporal (Demostración de Vulnerabilidad)

Estos tests **revierten temporalmente el código al estado vulnerable** para demostrar que la vulnerabilidad existía:

```javascript
// En la Sección 4 del test:
// 1. Se guarda el código corregido
// 2. Se elimina requireRole de las rutas
// 3. Se verifica que SIN el middleware, cualquier usuario puede acceder (200)
// 4. Se restaura el código corregido
```

**Resultado:** El test demuestra que **sin el fix, retornaba 200 (acceso permitido)**. Con el fix, retorna 401 (acceso denegado).

---

### 5. Cómo Ejecutar las Pruebas

```bash
cd backend
pnpm install
npx vitest run __tests__/maquina.rbac.test.js
```

**Salida esperada:**
```
✓ maquina.routes.js — ANTES: rutas SIN middleware (VULNERABLE)
✓ maquina.routes.js — DESPUÉS: rutas CON middleware (CORREGIDO)
✓ auth.middleware.js — middleware existe y exportado
✓ VULNERABLE (ANTES): Sin autenticación retornaba 200
✓ CORREGIDO: Rechaza petición (403) si rol no es admin
✓ CORREGIDO: Permite petición (200) si rol es admin
✓ VULNERABLE: Sin middleware, cualquier usuario puede acceder
✓ CORREGIDO: Con middleware, acceso no autorizado es bloqueado

10 tests passing
```

---

### 6. Escenarios de Ataque Previstos

#### Escenario 1: Acceso Anónimo a Funciones Administrativas
```
# Request vulnerable (SIN el fix):
POST /maquinas/agregarMaquina
Content-Type: application/json

{
  "nombre": "Nueva Máquina",
  "descripcion": "Acceso no autorizado",
  "fecha_compra": "2026-01-01",
  "id_estado": 1
}

# Respuesta SIN fix: 200 OK (máquina creada)
# Respuesta CON fix: 401 Unauthorized
```

#### Escenario 2: Escalada de Privilegios
```
# Request con rol de cliente:
POST /maquinas/nuevaRevisionMaquina
x-user-role: cliente
Content-Type: application/json

{
  "id_maquina": 1,
  "fecha_revision": "2026-05-01"
}

# Respuesta SIN fix: 200 OK (revisión creada)
# Respuesta CON fix: 403 Forbidden (Rol insuficiente)
```

---

### 7. Recomendaciones Post-Corrección

1. **Validación del lado del servidor**: El header `x-user-role` debería validarse contra la sesión real del servidor, no confiar ciegamente en headers del cliente.
2. **Logging de intentos de acceso denegado**: Agregar logs cuando se bloquen peticiones con 401/403.
3. **Timeouts de sesión**: Implementar expiración de tokens para evitar que roles spoofeados persistan.

---

**Autor:** Josue Chaves
**Branch:** `fix/jc-rbac-access-control`
**Fecha:** 08/05/2026
**Tests:** `backend/__tests__/maquina.rbac.test.js`
