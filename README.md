# FastFitness — Remediación de Seguridad

IC-8071 Seguridad del Software | Tarea Programada Parte 2 y 3

Este repositorio es una copia del proyecto FastFitness donde identificamos y corregimos vulnerabilidades de seguridad como parte de la tarea programada. El código original vulnerable está preservado en el commit inicial (`dc27b7f`) para que se pueda comparar el antes y el después.

---

## Cómo levantar la aplicación

La forma más fácil es con Docker. Desde la raíz del proyecto:

```bash
docker-compose up --build
```

Eso levanta el frontend, el backend y la base de datos juntos. La app queda disponible en `http://localhost:3000`. Para las veces siguientes ya no es necesario el `--build`, con `docker-compose up` es suficiente.

> Si usás Docker, el host de SQL Server que hay que poner en la pantalla de conexión es `host.docker.internal`.

Si preferís correr todo sin Docker, necesitás tener SQL Server instalado. Primero creás la base de datos:

```sql
CREATE DATABASE fastfitness;
USE fastfitness;
-- ejecutar el contenido de dbquery.sql
```

Luego en dos terminales separadas:

```bash
# Terminal 1 — backend
cd backend && npm install && node server.js

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

---

## Cómo reproducir las vulnerabilidades (versión original)

Para ver el comportamiento vulnerable antes de las correcciones, hacés checkout al commit inicial:

```bash
git checkout dc27b7f
```

Levantás la app normalmente y usás los comandos de la sección de cada integrante para reproducir cada vulnerabilidad. Cuando terminés, volvés a la versión corregida con:

```bash
git checkout master
```

---

## Cómo correr las pruebas

Los tests están escritos para fallar con el código original y pasar con el código corregido. No necesitás tener la base de datos levantada para correrlos porque usan mocks.

```bash
# Tests de backend (Jest + Supertest)
cd backend && npm test

# Tests de frontend (Vitest)
cd frontend && npm test
```

---

## Aporte por integrante

---

### Jennifer López Miranda

**Ramas:** `Jennifer` (Parte 2), `fix/jennifer-p3-fix1-log-datos-sensibles`, `fix/jennifer-p3-fix2-mensajes-error-servidor`, `fix/jennifer-p3-fix3-headers-seguridad`

**PRs:** #1, #9, #10, #11, #15

#### Parte 2 — Servidor

**Corrección 1 — Inyección en parámetros (CWE-20 / OWASP A03)**

En `backend/controllers/helper.controller.js`, las funciones `getCliente` y `getAdmin` validaban la cédula solo comprobando que tuviera 9 caracteres, sin verificar que fueran dígitos. Eso permitía que cadenas como `"AAAAAAAAA"` pasaran el filtro y llegaran directamente a la base de datos. La corrección reemplazó esa validación por `/^\d{9}$/`, que rechaza cualquier cosa que no sean exactamente 9 números.

Para ver la diferencia, con la app corriendo en la versión original:
```bash
curl http://localhost:3100/helper/cliente/AAAAAAAAA
# versión vulnerable: no devuelve error de formato
# versión corregida: HTTP 400
```

Tests en `backend/__tests__/jennifer-p2-cedula.test.js`.

---

**Corrección 2 — Control de acceso sin roles (CWE-862 / OWASP A01)**

El servidor no tenía ningún control de autenticación. Cualquier persona podía llamar a rutas destructivas como eliminar clientes o crear clases sin necesidad de identificarse. Se creó el middleware `requireRole` en `backend/middleware/auth.middleware.js`, que verifica el header `x-user-role`. Las rutas POST, PUT y DELETE de clientes, sesiones y clases ahora requieren rol `admin`.

Para reproducir con la app en versión original:
```bash
# versión vulnerable: devuelve 200 sin ningún header
curl -X DELETE http://localhost:3100/clientes/eliminarPersona

# versión corregida: 401 sin header, 403 con rol incorrecto, 200 con admin
curl -X DELETE http://localhost:3100/clientes/eliminarPersona -H "x-user-role: admin"
```

Tests en `backend/__tests__/jennifer-p2-auth.test.js`.

---

#### Parte 3 — Cliente

**Corrección 1 — Datos sensibles en consola del browser (CWE-532 / OWASP A09)**

La página de login en `frontend/app/auth/page.tsx` tenía un `console.log` que imprimía la respuesta completa del servidor en la consola del browser. Cualquier persona con DevTools abiertos podía verla. Se eliminó esa línea.

Para verificar: abrir DevTools → Console → intentar conectarse → en la versión original aparece `"Response data: {...}"`, en la corregida no aparece nada.

Tests en `frontend/tests/jennifer-jb1.test.tsx`.

---

**Corrección 2 — Mensaje de error interno expuesto al usuario (CWE-209 / OWASP A09)**

En `frontend/app/(admin)/clases/nuevo/page.tsx`, cuando fallaba la creación de una clase el frontend mostraba directamente `data.message` del servidor, que podía incluir errores técnicos de la base de datos como nombres de constraints o columnas. Se reemplazó por un mensaje genérico.

Para reproducir: intentar crear una clase con nombre duplicado. En la versión original aparece el error técnico del servidor; en la corregida solo aparece `"No se pudo crear la clase. Intentá de nuevo."`.

Tests en `frontend/tests/jennifer-jb2.test.tsx`.

---

**Corrección 3 — Headers de seguridad HTTP (CWE-1021 / OWASP A05)** *(corrección adicional)*

`frontend/next.config.ts` estaba vacío, así que la app no enviaba ningún header de seguridad HTTP. Se agregaron `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y `Content-Security-Policy` para todas las rutas.

Para verificar con la app corriendo:
```bash
curl -I http://localhost:3000 | grep -E "X-Frame|X-Content|Referrer|Content-Security"
```

Tests en `frontend/tests/jennifer-jb3.test.ts`.

---

### Kimberly Salazar Acuña

**Ramas:** `fix/ss-parameter-injection`, `fix/A-06-explotacion-confianza-pagos`, `fix/A-08-A-09-logging-estructurado`, `fix/cliente-auth-guard-y-sanitizacion-xss`

**PRs:** #3, #4, #16, #8

#### Parte 2 — Servidor

**Corrección 1 — Inyección SQL por ausencia de tipos explícitos (CWE-89 / OWASP A03)**

En `backend/controllers/entrenador.controller.js` y `maquina.controller.js`, las llamadas a `.input()` no especificaban tipos SQL. mssql infería el tipo a partir del valor JavaScript, debilitando la parametrización y abriendo la posibilidad de inyección. La corrección agregó tipos explícitos (`sql.Char`, `sql.Int`, `sql.TinyInt`, `sql.VarChar`) alineados con los stored procedures, más validaciones de entrada: regex para cédula, rango para estado y longitud máxima para observación.

Para ver la diferencia, con la app corriendo en la versión original:
```bash
curl -X POST http://localhost:3100/entrenador/asignar \
  -H "Content-Type: application/json" \
  -d '{"cedula_entrenador": "'"'"'; DROP TABLE --", "id_sesion_programada": 1}'
# versión vulnerable: no lanza error de formato
# versión corregida: HTTP 400
```

Tests en `tests/backend/sql-injection-parametros.test.js` (16 tests).

---

**Corrección 2 — Validación de confianza en pagos y membresías (CWE-602 / OWASP A04)**

`membresias.controller.js` y `sesion.controller.js` confiaban ciegamente en los datos enviados por el cliente para decisiones de pago e inscripción. Un atacante podía enviar `monto: 0` para registrar pagos sin costo real, o inscribirse sin membresía activa. La corrección valida monto (positivo, rango 1–500000), fecha de pago (no futura, no mayor a 30 días atrás), verifica el tipo de membresía contra la BD y comprueba la vigencia antes de permitir inscripción a sesión.

Para reproducir con la app en versión original:
```bash
curl -X POST http://localhost:3100/membresias/pago \
  -H "Content-Type: application/json" \
  -d '{"cedula": "123456789", "tipo_membresia": 1, "monto": 0}'
# versión vulnerable: registra el pago con monto 0
# versión corregida: HTTP 400
```

Tests: 13 tests unitarios + script de explotación en `tests/scripts/exploit-trust-exploitation.sh`.

---

**Corrección 3 — Logging estructurado con Winston (CWE-532, CWE-117 / OWASP A09)**

El backend usaba únicamente `console.log/error` sin estructura, sin persistencia y sin protección contra inyección de logs. Las entradas se perdían al reiniciar el contenedor y existía riesgo de que credenciales quedaran expuestas en texto plano. Se reemplazó el sistema de logging con **Winston** y `winston-daily-rotate-file`: transportes duales (`combined.log` y `error.log`) con rotación diaria, redacción automática de campos sensibles (`password`, `token`, `credential` → `[REDACTED]`), y middleware de auditoría HTTP que registra método, URL, IP, User-Agent, código de estado y tiempo de respuesta. Se sustituyó todo `console.log/error` en controladores, configuración de BD y servidor.

Para verificar con la app corriendo:
```bash
cat backend/logs/combined.log | grep -i "password"
# versión vulnerable: podría aparecer en texto plano
# versión corregida: aparece como [REDACTED]
```

Tests: 12/12 tests pasaron.

---

#### Parte 3 — Cliente

**Corrección — Protección de rutas administrativas y sanitización XSS (CWE-862, CWE-79 / OWASP A01, A03)**

Dos vulnerabilidades del lado cliente:

`app/(admin)/layout.tsx` no verificaba autenticación, permitiendo acceso directo a `/dashboard` sin credenciales (B-01). Se implementó un Auth Guard con validación de sesión usando `localStorage` y comprobación de `userRole` al montar el componente, con redirección automática a `/auth` y loader temporal para evitar renderizado accidental de contenido sensible.

`app/auth/page.tsx` renderizaba `data.message` del backend directamente como HTML, permitiendo XSS si el mensaje contenía scripts (B-02). Se agregó `DOMPurify.sanitize()` para eliminar etiquetas `<script>`, atributos `onerror`/`onload` y payloads HTML activos.

Para reproducir con la app en versión original:
```bash
# B-01: navegar directamente a http://localhost:3000/dashboard sin autenticarse
# versión vulnerable: se muestra el dashboard
# versión corregida: redirige a /auth

# B-02: intentar login con payload '<img src=x onerror=alert(1)>' como contraseña
# versión vulnerable: el evento se dispara al renderizar el mensaje de error
# versión corregida: el payload aparece como texto inerte
```

---

### Josué Chaves Zúñiga

**Ramas:** `fix/jc-rbac-access-control`, `fix/jc-trust-membership`, `fix/jc-client-security`

**PRs:** #5, #6, #7

#### Parte 2 — Servidor

**Corrección 1 — RBAC en rutas de máquinas (CWE-862 / OWASP A01)**

Las rutas de modificación de estado y revisión de máquinas no requerían autenticación. Se implementó control de acceso basado en roles para esas rutas en el backend, exigiendo rol `admin`. Se actualizó el frontend para enviar los headers de autorización correspondientes. Incluye documentación técnica en `docs/FIX-S2-RBAC-Maquinas.md` y tests automatizados.

Para reproducir con la app en versión original:
```bash
curl -X PUT http://localhost:3100/maquinas/estado/1 \
  -H "Content-Type: application/json" \
  -d '{"nuevo_estado": 0, "observacion": "test"}'
# versión vulnerable: HTTP 200 sin autenticación
# versión corregida: HTTP 401
```

---

**Corrección 2 — Validación de confianza en membresías e inscripciones con Zod (CWE-602 / OWASP A04)**

Las validaciones de negocio para pagos e inscripciones se hacían exclusivamente en el cliente. La corrección añadió la columna `precio_base` a la tabla `tipo_membresia` como fuente de verdad en el servidor, e implementó schemas Zod en `registrarPagoMembresia` e `inscribirClienteASesion`. Ahora se verifica que el monto pagado coincida con el `precio_base` almacenado en la BD y que la membresía esté vigente antes de permitir la inscripción.

Para reproducir con la app en versión original:
```bash
curl -X POST http://localhost:3100/membresias/inscribir \
  -H "Content-Type: application/json" \
  -d '{"cedula": "123456789", "tipo_membresia": 1, "monto": 1}'
# versión vulnerable: acepta monto arbitrario
# versión corregida: HTTP 400 — monto no coincide con precio_base
```

Tests en `tests/backend/trust-exploitation.test.js` (5/5). Guía de demostración en `docs/FIX-S4-Trust-Membresias.md`.

---

#### Parte 3 — Cliente

**Corrección — Sanitización XSS y validación de integridad de respuestas con Zod (CWE-79, CWE-345 / OWASP A03, A08)**

Dos capas de seguridad en el cliente:

En el formulario de creación de máquinas se integró `dompurify` para filtrar y limpiar las entradas de texto antes de enviarlas al backend, previniendo inyección de scripts desde el formulario.

Para las respuestas del API se implementaron schemas Zod (Zero Trust): antes de actualizar el estado de React, la respuesta se valida contra el esquema esperado. Si los datos no cumplen el contrato definido, la respuesta se rechaza y se muestra un error controlado.

Para verificar con la app corriendo:
```bash
# XSS: abrir DevTools → Network → crear máquina con payload '<script>alert(1)</script>'
# versión vulnerable: el script llega al backend
# versión corregida: DOMPurify lo elimina antes del envío
```

---

### Yeilyn Espinoza Zumbado

**Ramas:** `correcciones-servidor-yeilyn`, `fix/A-12-validacion-respuesta-api`, `fix/A-06-sanitizacion-xss-clases`

**PRs:** #12, #13, #14

#### Parte 2 — Servidor

**Corrección — RBAC con JWT e IDOR en consultas de clientes (CWE-284, CWE-639 / OWASP A01, A04)**

Dos vulnerabilidades corregidas:

**A-03 — Escalación de privilegios:** El middleware de auth confiaba en el header `x-user-role` enviado por el cliente para determinar permisos. Un atacante podía incluir `x-user-role: admin` en cualquier petición y obtener privilegios administrativos. La corrección implementa JWT: el rol ahora se extrae de `req.user.role`, derivado del token validado por el servidor.

**A-04 — IDOR en consulta de clientes:** El endpoint de búsqueda por cédula no verificaba si el solicitante tenía autorización sobre ese recurso. La corrección agrega validación de propietario: solo se permite la consulta si el usuario autenticado es administrador o si la cédula consultada coincide con la suya propia.

Para reproducir con la app en versión original:
```bash
# A-03: escalar privilegios con header falso
curl -X DELETE http://localhost:3100/clientes/eliminarPersona \
  -H "x-user-role: admin"
# versión vulnerable: HTTP 200
# versión corregida: HTTP 401

# A-04: consultar datos de otro cliente
curl http://localhost:3100/helper/cliente/123456789 \
  -H "Authorization: Bearer <token_de_otro_cliente>"
# versión vulnerable: devuelve los datos
# versión corregida: HTTP 403
```

Tests en `tests/server/role-trust.test.js` y `tests/server/idor-cliente.test.js`.

---

#### Parte 3 — Cliente

**Corrección 1 — Validación de respuestas del API con Zod (CWE-345 / OWASP A08)**

`frontend/app/(admin)/clientes/page.tsx` guardaba las respuestas del API directamente en el estado de React sin validar su estructura. Si la respuesta venía modificada, malformada o con campos inesperados, el cliente podía renderizar datos no confiables. La corrección agrega un schema Zod en `clientes/schema.ts`; si la respuesta no cumple la estructura esperada, se rechaza y se muestra un error controlado.

Para verificar:
```bash
npm test -- tests/client/api-response-validation.test.ts
# versión corregida: rechaza respuestas con campos faltantes o tipos incorrectos
```

---

**Corrección 2 — Sanitización de salida en página de clases (CWE-79 / OWASP A03)**

`frontend/app/(admin)/clases/page.tsx` renderizaba `clase.nombre` y `clase.descripcion` provenientes del servidor sin escape explícito. Si esos campos contenían HTML o scripts maliciosos, existía riesgo de XSS en el cliente. Se creó la utilidad `escapeText` en `frontend/utils/escapeText.ts` que convierte caracteres peligrosos en entidades HTML seguras, y se aplicó sobre todos los datos de clases antes del renderizado.

Para reproducir con la app en versión original: crear una clase con nombre `<img src=x onerror=alert(1)>`. En la versión vulnerable el evento se ejecuta al cargar la lista; en la corregida el texto aparece como literal inerte.

Tests en `frontend/tests/client/output-sanitization.test.ts`.
