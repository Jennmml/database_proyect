# Reporte de Mitigación: Explotación de Software en Clientes (Parte 3)

**ID de Tarea:** Parte 3 - Explotación de Software en Clientes
**Naturalezas de Corrección:**
1. Saneamiento de Entradas (XSS) - Prevención de ejecución de scripts.
2. Manejo Seguro de Datos (Integridad) - Validación de respuestas del API.

## Descripción de la Vulnerabilidad
El cliente (Frontend) presentaba dos debilidades principales:
- **XSS (Cross-Site Scripting):** Los formularios permitían el envío de cualquier cadena de texto, facilitando la inyección de scripts que podrían ejecutarse al ser renderizados en otros paneles administrativos.
- **Manejo Inseguro de Datos:** El cliente procesaba respuestas del servidor sin validar su estructura, lo que lo hacía vulnerable a ataques donde un atacante manipula la respuesta del API para causar fallos lógicos o inyecciones en la UI.

## Mitigaciones Aplicadas

### 1. Saneamiento XSS con DOMPurify (Naturaleza 1)
Se integró la librería `dompurify` en los esquemas de validación de **Zod**.
- **Acción:** Antes de que los datos salgan del cliente hacia el backend, pasan por un proceso de "limpieza" que elimina etiquetas `<script>`, atributos `onmouseover`, y otros vectores de ataque.
- **Archivo:** `frontend/lib/security-schemas.ts` y `maquinas/nuevo/page.tsx`.

### 2. Validación de Integridad de Datos (Naturaleza 2)
Se implementó un patrón de **"Consumo Seguro de API"**.
- **Acción:** Toda respuesta del servidor es validada contra un esquema Zod en el cliente. Si los datos recibidos no cumplen con el contrato de seguridad (ej. un campo de texto contiene un objeto inesperado), el cliente rechaza los datos en lugar de renderizarlos.
- **Archivo:** `administradores/page.tsx`.

---

## Guía para Demostración en Video

### Escenario A: Intento de Inyección XSS (Antes vs Después)
1.  **Antes (Vulnerable):** Al ingresar `<img src=x onerror=alert('XSS')>` en el campo Modelo, el dato llegaba "crudo" al servidor.
2.  **Después (Corregido):** Al intentar lo mismo, el frontend detecta el intento y **sanea** el string, enviando solo una cadena vacía o limpia al servidor, o bloqueando el envío si no cumple el esquema.

### Escenario B: Integridad de Datos del API
1.  **Demostración:** Muestre el código en `administradores/page.tsx` donde se usa `adminMaquinaSchema.safeParse`. 
2.  **Explicación:** Explique que esto protege al usuario final incluso si el servidor es comprometido, ya que el cliente actúa como un último filtro de seguridad.

## Cómo ejecutar las pruebas
1. Navegue a la carpeta `frontend`.
2. Ejecute `pnpm dev`.
3. Intente registrar una máquina con caracteres especiales o scripts en el formulario de "Nueva Máquina".
4. Verifique en la consola que no hay errores de renderizado y que los datos se mantienen limpios.
