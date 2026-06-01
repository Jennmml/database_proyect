# FastFitness - Correcciones de Seguridad

Este documento describe las correcciones de seguridad implementadas por **Josue Chaves** como parte del proyecto de seguridad del software IC-8071.


## Parte 2: Explotación de Software de Servidores

Esta parte requiere correcciones relacionadas con el servidor. Se necesitan 2 correcciones por miembro del equipo.

---

### Corrección 1: Control de Acceso para Prevenir Escalación de Privilegios

**Sección del documento:** Parte 2, sección A, naturaleza 2 (Control de acceso para prevenir escalación de privilegios)
**Clasificación:** CWE-862 (Missing Authorization), CAPEC-233 (Privilege Escalation)
**Rama:** `fix/jc-rbac-access-control`

El sistema permitía que cualquier usuario ejecutara funciones administrativas sin ninguna validación. Las rutas para agregar máquinas y crear revisiones de mantenimiento no verificaban si quien hacía la petición tenía permisos de administrador.

Para solucionar esto se creó un middleware llamado `requireRole` que se encarga de verificar el rol del usuario antes de permitir el acceso a rutas protegidas. Este middleware lee un encabezado que el cliente envía con cada petición (`x-user-role`) y verifica que corresponda con el rol necesario. Si el encabezado no existe retorna un error 401 (no autorizado), si existe pero no corresponde al rol requerido retorna un error 403 (acceso insuficiente).

Las rutas protegidas quedaron así:

```javascript
router.post("/agregarMaquina", requireRole('admin'), agregarMaquina);
router.post('/nuevaRevisionMaquina', requireRole('admin'), nuevaRevisionMaquina);
```

**Escenario de ataque:**

Un atacante sin autenticación envía una petición POST a `/maquinas/agregarMaquina` con datos para crear una máquina. Antes de la corrección esto era posible porque no había verificación de roles. El servidor procesaba la petición y la máquina se creaba. Después de la corrección el middleware `requireRole` intercepta la petición. Como no hay encabezado `x-user-role` retorna código 401 y la petición no se procesa.

---

### Corrección 2: Defensa contra Explotación de la Confianza

**Sección del documento:** Parte 2, sección A, naturaleza 3 (Aplicar y documentar una defensa para la "explotación de la confianza")
**Clasificación:** CWE-20 (Improper Input Validation), CAPEC-178 (Exploitation of Trust)
**Rama:** `fix/jc-trust-membership`

El servidor confiaba ciegamente en los datos que el cliente enviaba. Por ejemplo, al registrar un pago de membresía el sistema aceptaba el monto que el cliente mandaba sin verificar si era correcto. Un atacante podía enviar un monto de 1 colón por una membresía que costaba 20000 colones.

La corrección consistió en varias partes. Primero, se implementó validación del lado del servidor usando Zod para verificar que los datos tengan el formato correcto antes de procesarlos. Segundo, se consultó el precio real de la membresía en la base de datos y se comparó con el monto enviado por el cliente. Si hay discrepancia el sistema rechaza la transacción.

Además se agregó validación de membresía activa. Antes de inscribir a un cliente en una sesión el sistema verifica que efectivamente tenga una membresía vigente y que no haya expirado.

**Escenario de ataque:**

Un cliente envía una petición para registrar un pago de membresía con un monto diferente al real. Por ejemplo, dice que paga 1 colón cuando la membresía cuesta 20000. Antes de la corrección el servidor aceptaba cualquier monto que el cliente enviara. El pago se registraba con el monto incorrecto. Después de la corrección el sistema consulta el precio oficial en la base de datos y lo compara con el monto enviado. Si hay diferencia el sistema rechaza la transacción con un mensaje de error indicando que hubo intento de fraude.

---

## Parte 3: Explotación de Software en Clientes

Esta parte requiere correcciones relacionadas con el cliente. Se necesitan 2 correcciones por miembro del equipo.

---

### Corrección 1: Cliente como Objetivo de Ataque (Auth Guard)

**Sección del documento:** Parte 3, sección B, naturaleza 1 (Localizar y arreglar una vulnerabilidad relacionada con el cliente como objeto de ataque)
**Clasificación:** CWE-425 (Directorescape), CWE-862 (Missing Authorization)
**Rama:** `fix/jc-client-security`

En el frontend las rutas administrativas como `/dashboard` o `/administradores` eran accesibles sin autenticación si alguien conocía la URL directa. No había ninguna verificación del lado del cliente que impidiera renderizar contenido protegido.

Se agregó un Auth Guard en el layout principal que se ejecuta apenas carga la página. Este guarda verifica si existe un valor `userRole` en el localStorage del navegador. Si no existe redirecciona inmediatamente al usuario a la página de autenticación. Si existe pero no corresponde a un rol válido también lo redirige. Solo si todo está correcto permite renderizar el contenido protegido.

**Escenario de ataque:**

Un atacante intenta acceder directamente a `/dashboard` escribiendo la URL en el navegador sin haber iniciado sesión. Antes de la corrección el contenido del dashboard se renderizaba sin verificación alguna. Después de la corrección el Auth Guard verifica el contenido del localStorage. Al no encontrar `userRole` redirecciona inmediatamente a `/auth`. El contenido protegido nunca llega a renderizarse.

---

### Corrección 2: Sanitización y Validación de Datos en Cliente

**Sección del documento:** Parte 3, sección B, naturaleza 2 (Corregir un caso de XSS o exposición de client scripts) y naturaleza 3 (Asegurar que el cliente sanea/escapa datos antes de renderizar o ejecutar)
**Clasificación:** CWE-79 (Cross-site Scripting)
**Rama:** `fix/jc-client-security`

Esta corrección tiene dos naturalezas que se complementan.

**Naturaleza 2: Prevención de XSS**

Los mensajes de error que el servidor enviaba podían contener texto HTML. Si un atacante lograba enviar un mensaje malicioso este podía ejecutarse como código en el navegador del cliente.

Se implementó sanitización usando DOMPurify que limpia cualquier etiqueta HTML potencialmente peligrosa antes de renderizar el mensaje. Etiquetas como `<script>` o atributos como `onerror` son eliminados automáticamente. El texto legítimo del mensaje se mantiene.

**Escenario de ataque:**

Un atacante logra que el servidor envíe un mensaje de error que contiene código JavaScript. Este código se ejecutaría en el navegador del cliente. Antes de la corrección el mensaje se renderizaba directamente con `dangerouslySetInnerHTML`. Después de la corrección el mensaje pasa por DOMPurify que elimina cualquier etiqueta o atributo peligroso. El texto legítimo del mensaje se mantiene pero el código malicioso se neutraliza.

**Naturaleza 3: Validación de Integridad de Datos del API**

Cuando el frontend recibía datos del servidor los procesaba sin verificar su estructura. Si un atacante lograba manipular la respuesta del API podía enviar datos maliciosos que se renderizarían directamente.

Se implementó validación con Zod. Cada respuesta del servidor pasa por un esquema que verifica el tipo y formato de cada campo. Los datos maliciosos son rechazados o transformados según corresponda. Por ejemplo, si un campo de texto contiene etiquetas HTML estas son removidas automáticamente.

**Escenario de ataque:**

Un atacante logra manipular la respuesta que el API envía al frontend. Envía datos que contienen scripts o estructuras inesperadas. Antes de la corrección estos datos se renderizaban sin verificación. Después de la corrección los datos pasan por validación con Zod. Los campos de texto se sanitizan automáticamente y las estructuras incorrectas se rechazan.

---

## Archivos Modificados por Corrección

### Corrección 1 (Parte 2 - Control de Acceso)

- `backend/middleware/auth.middleware.js` — Middleware de validación de roles
- `backend/routes/maquina.routes.js` — Rutas protegidas con requireRole
- `backend/__tests__/maquina.rbac.test.js` — Suite de tests con verificación estática, integración y reversión temporal

### Corrección 2 (Parte 2 - Explotación de la Confianza)

- `backend/controllers/membresias.controller.js` — Validación de precios con Zod
- `backend/controllers/sesion.controller.js` — Validación de membresía activa
- `tests/backend/trust-exploitation.test.js` — Suite de tests

### Corrección 3 (Parte 3 - Cliente como Objetivo)

- `frontend/app/(admin)/layout.tsx` — Auth Guard para rutas administrativas
- `frontend/tests/client-security.test.tsx` — Tests de Auth Guard

### Corrección 4 (Parte 3 - XSS y Sanitización)

- `frontend/app/auth/page.tsx` — Sanitización de mensajes con DOMPurify
- `frontend/app/(admin)/administradores/page.tsx` — Validación de integridad con Zod
- `frontend/src/lib/security-schemas.ts` — Esquemas de sanitización y validación
- `frontend/tests/client-security.test.tsx` — Tests de sanitización y validación

---

## Pruebas Automatizadas

Cada corrección incluye pruebas automatizadas que verifican que el sistema responde correctamente. Estas pruebas se ejecutan con Vitest y couvren tres aspectos: verificación estática del código (que el fix esté presente), pruebas de integración (que el comportamiento sea correcto) y demostración de reversión temporal (que sin el fix el sistema fallaba).

### Para ejecutar las pruebas del backend:

```bash
cd backend
pnpm install
pnpm test -- maquina.rbac.test.js
pnpm test -- trust-exploitation.test.js
```

### Para ejecutar las pruebas del frontend:

```bash
cd frontend
pnpm install
pnpm test -- client-security.test.tsx
```

---

## Detalles Técnicos Adicionales

El middleware de autenticación solo maneja validación básica de roles. En un ambiente de producción sería necesario validar el encabezado contra la sesión real del servidor y no depender únicamente de lo que el cliente envía.

Los esquemas de Zod usan la función `transform` para aplicar sanitización automáticamente. Esto significa que cada vez que se valida un string potencialmente peligroso se limpia al mismo tiempo que se verifica su estructura.

Los tests de reversión temporal modifican los archivos del proyecto temporalmente para simular el estado vulnerable, ejecutan las pruebas para demostrar que el ataque funcionaba, y luego restauran el código original. Este proceso asegura que los tests demuestren tanto la vulnerabilidad original como la corrección efectiva.

---

## Ramas Relacionadas

- `fix/jc-rbac-access-control` — Corrección de control de acceso (Parte 2)
- `fix/jc-trust-membership` — Corrección de explotación de confianza (Parte 2)
- `fix/jc-client-security` — Correcciones de seguridad del cliente (Parte 3)

---

**Autor:** Josue Chaves
**Fecha:** Mayo 2026