# Reporte de Mitigación: Explotación de la Confianza (A-06)

**ID de Vulnerabilidad:** A-06 (Trust Exploitation / CAPEC-178)
**Componentes Afectados:** `sesion.controller.js`, `membresias.controller.js`
**Severidad:** ALTA

## Descripción de la Vulnerabilidad
El sistema presentaba una falta de validación de reglas de negocio en el lado del servidor. Se confiaba ciegamente en:
1.  El **monto de pago** enviado por el cliente. Un usuario podía manipular el JSON del request para pagar 1 colón por una membresía anual.
2.  La **elegibilidad del cliente** para inscribirse a clases. El servidor no verificaba si el cliente tenía una membresía activa y vigente.

## Mitigación Aplicada

### 1. Desconfianza en el Cliente (Validación de Montos)
Se modificó la base de datos para incluir una columna `precio_base` en `tipo_membresia`. 
- **Lógica:** Al recibir un pago, el backend consulta el precio oficial en la BD y lo compara con el enviado por el cliente. Si hay discrepancia, se bloquea la transacción.

### 2. Validación de Estado (Membresía Activa)
Antes de ejecutar el stored procedure de inscripción, se realiza una consulta SQL estricta que verifica:
- Que el cliente exista.
- Que la membresía esté marcada como `vigente`.
- Que la `fecha_expiracion` sea mayor o igual al día de hoy.

### 3. Integridad de Datos (Zod)
Se implementó la librería **Zod** para asegurar que todos los inputs (cédulas, montos, fechas) cumplan con el formato técnico esperado antes de interactuar con la base de datos.

## Evidencia de Verificación
Se ejecutaron tests automatizados con `vitest` que validan los siguientes escenarios:
- **Test:** Rechazo de monto alterado (Fraude detectado).
- **Test:** Rechazo de inscripción sin membresía (403 Forbidden).
- **Test:** Aceptación de pago correcto validado por BD.

**Resultado:** 5/5 tests exitosos.

---

## Guía para Demostración en Video (Replicabilidad)

Para demostrar la efectividad de la corrección, se pueden seguir estos pasos:

### 1. Estado Vulnerable (Fallo de Tests)
Ejecute el siguiente comando para revertir temporalmente los controladores al estado previo a la corrección:
```bash
git checkout HEAD^ -- controllers/membresias.controller.js controllers/sesion.controller.js
```
Luego, ejecute los tests:
```bash
pnpm test -- trust-exploitation.test.js
```
**Observación:** Los tests fallarán (Rojo). Explique que el sistema permite montos alterados y no valida la vigencia de la membresía en el servidor.

### 2. Estado Corregido (Paso de Tests)
Restaure las correcciones de seguridad:
```bash
git checkout HEAD -- controllers/membresias.controller.js controllers/sesion.controller.js
```
Ejecute los tests nuevamente:
```bash
pnpm test -- trust-exploitation.test.js
```
**Observación:** Los tests pasarán (Verde). Explique que ahora el servidor utiliza **Zod** para validar la estructura y consulta la **Base de Datos** para validar precios y estados, eliminando la confianza en el cliente.
