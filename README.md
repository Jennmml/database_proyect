# FastFitness — Remediación de Seguridad

IC-8071 Seguridad del Software | Tarea Programada Parte 2 y 3

---

## Cómo ejecutar la aplicación

### Con Docker (recomendado)

```bash
docker-compose up --build   # primera vez
docker-compose up           # veces siguientes
```

Acceder en: `http://localhost:3000`

> Si usás Docker, el host de la base de datos es `host.docker.internal`

### Sin Docker

**Backend:**
```bash
cd backend
npm install
node server.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

La base de datos debe ser SQL Server. Crear la base con `dbquery.sql`:
```sql
CREATE DATABASE fastfitness;
USE fastfitness;
-- luego ejecutar el contenido de dbquery.sql
```

---

## Cómo ejecutar las pruebas

### Tests de backend (Jest + Supertest)
```bash
cd backend
npm test
```

### Tests de frontend (Vitest)
```bash
cd frontend
npm test
```

---

## Aporte por integrante

---

### Jennifer López Miranda

**Rama:** `Jennifer` (Parte 2), `fix/jennifer-p3-fix1-log-datos-sensibles`, `fix/jennifer-p3-fix2-mensajes-error-servidor`, `fix/jennifer-p3-fix3-headers-seguridad`

**PRs:** #1, #9, #10, #11

#### Parte 2 — Servidor

**Corrección 1 — Inyección en parámetros (CWE-20 / OWASP A03)**

Las funciones `getCliente` y `getAdmin` en `backend/controllers/helper.controller.js` validaban el parámetro `cedula` solo por longitud, lo que permitía que cualquier cadena de 9 caracteres (letras, símbolos, etc.) llegara a la base de datos sin restricción. Se reemplazó la validación por la expresión regular `/^\d{9}$/`, que exige exactamente 9 dígitos numéricos.

Para reproducir la vulnerabilidad (versión original):
```bash
curl http://localhost:3100/helper/cliente/AAAAAAAAA
# Versión vulnerable: pasa el filtro
# Versión corregida: HTTP 400
```

Tests: `backend/__tests__/jennifer-p2-cedula.test.js`

---

**Corrección 2 — Control de acceso sin roles (CWE-862 / OWASP A01)**

El servidor no tenía middleware de autenticación. Todas las rutas eran públicas, incluyendo operaciones destructivas como eliminar clientes o crear clases. Se creó `backend/middleware/auth.middleware.js` con el middleware `requireRole`, que verifica el header `x-user-role` en cada petición. Las rutas POST, PUT y DELETE de clientes, sesiones y clases ahora requieren rol `admin`.

Para reproducir la vulnerabilidad (versión original):
```bash
# Sin header — versión vulnerable retornaba 200, corregida retorna 401
curl -X DELETE http://localhost:3100/clientes/eliminarPersona

# Con rol incorrecto — retorna 403
curl -X DELETE http://localhost:3100/clientes/eliminarPersona -H "x-user-role: cliente"

# Con rol correcto — retorna 200
curl -X DELETE http://localhost:3100/clientes/eliminarPersona -H "x-user-role: admin"
```

Tests: `backend/__tests__/jennifer-p2-auth.test.js`

---

#### Parte 3 — Cliente

**Corrección 1 — Datos sensibles en consola del browser (CWE-532 / OWASP A09)**

La página de autenticación (`frontend/app/auth/page.tsx`) imprimía la respuesta completa del servidor con `console.log`. Se eliminó esa línea.

Para verificar la corrección: abrir DevTools → Console → intentar conectar → confirmar que no aparece `"Response data:"`.

Tests: `frontend/tests/jennifer-jb1.test.tsx`

---

**Corrección 2 — Mensaje de error interno expuesto al usuario (CWE-209 / OWASP A09)**

Al fallar la creación de una clase (`frontend/app/(admin)/clases/nuevo/page.tsx`), el frontend mostraba directamente `data.message` del servidor, que podía contener errores técnicos de la base de datos. Se reemplazó por un mensaje genérico.

Para reproducir la vulnerabilidad: intentar crear una clase con nombre duplicado y observar el mensaje de error. Versión corregida muestra solo `"No se pudo crear la clase. Intentá de nuevo."`.

Tests: `frontend/tests/jennifer-jb2.test.tsx`

---

**Corrección 3 — Headers de seguridad HTTP (CWE-1021 / OWASP A05)** *(corrección adicional)*

`frontend/next.config.ts` estaba vacío. Se agregaron `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `Content-Security-Policy` para todas las rutas.

Para verificar: con la app corriendo, ejecutar:
```bash
curl -I http://localhost:3000 | grep -E "X-Frame|X-Content|Referrer|Content-Security"
```

Tests: `frontend/tests/jennifer-jb3.test.ts`
