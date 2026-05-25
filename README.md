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
