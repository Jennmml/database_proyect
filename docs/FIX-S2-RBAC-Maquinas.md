# Documentación de Corrección de Seguridad: Tarea #1
## Control de Acceso y Escalación de Privilegios (RBAC)

**ID de Vulnerabilidad:** FIX-S2 (A-03: Broken Access Control)  
**Clasificación CAPEC:** [CAPEC-233: Privilege Escalation](https://capec.mitre.org/data/definitions/233.html)  
**CWE:** [CWE-862: Missing Authorization](https://cwe.mitre.org/data/definitions/862.html)  

---

### 1. Descripción de la Vulnerabilidad
El sistema FastFitness presentaba una falta total de controles de autorización en sus endpoints administrativos. Específicamente, las rutas relacionadas con la gestión de inventario de máquinas en `backend/routes/maquina.routes.js` permitían que cualquier usuario (incluso un atacante anónimo sin autenticación) pudiera:
*   Registrar nuevas máquinas en el gimnasio.
*   Crear revisiones de mantenimiento.

Esto permitía un ataque de **Escalación de Privilegios**, donde un usuario con el nivel más bajo de acceso (o ninguno) podía ejecutar funciones críticas reservadas exclusivamente para el rol de **Administrador**.

### 2. Archivos y Líneas Modificadas
*   **Archivo:** `backend/routes/maquina.routes.js`
*   **Líneas:** 2, 13, 14.

### 3. Detalles de la Corrección
Se implementó un mecanismo de **Control de Acceso Basado en Roles (RBAC)** utilizando un middleware centralizado (`requireRole`).

**Cambios realizados:**
1.  Se importó el middleware `requireRole` desde `../middleware/auth.middleware.js`.
2.  Se interceptaron las peticiones a las rutas `POST /agregarMaquina` y `POST /nuevaRevisionMaquina`.
3.  El middleware ahora valida que la petición contenga el encabezado `x-user-role` con el valor exacto de `'admin'`.
4.  Si el encabezado no existe o el rol es incorrecto, el servidor responde con un estado `401 Unauthorized` o `403 Forbidden`, impidiendo que la lógica del controlador se ejecute.

### 4. Evidencia de Mitigación (Pruebas)
Se creó un suite de pruebas automatizadas en `backend/__tests__/maquina.rbac.test.js` utilizando **Jest** y **Supertest**.

#### Casos de Prueba Ejecutados:
1.  **Ataque Anónimo:** Intento de `POST /maquinas/agregarMaquina` sin encabezados.
    *   *Resultado esperado:* `401 Unauthorized`.
    *   *Estado Final:* **PASADO**.
2.  **Ataque de Usuario con Bajo Privilegio:** Intento de `POST` con `x-user-role: cliente`.
    *   *Resultado esperado:* `403 Forbidden`.
    *   *Estado Final:* **PASADO**.
3.  **Acceso Autorizado:** Intento de `POST` con `x-user-role: admin`.
    *   *Resultado esperado:* `200 OK`.
    *   *Estado Final:* **PASADO**.

**Autor:** Josue Chaves
**Branch:** `fix/jc-rbac-access-control`
**Fecha:** 08/05/2026
