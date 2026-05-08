import sql from 'mssql';
import { getConnection } from "../config/conectionStore.js";

/**
 * Constantes de negocio para validación de montos.
 * Estos valores representan los rangos aceptables de pago por tipo de membresía.
 * 
 * CORRECCIÓN A-06 (CAPEC-178): El servidor NO debe confiar en el monto enviado
 * por el cliente. Se valida que el monto sea positivo y se verifica contra
 * la tabla tipo_membresia que el tipo exista antes de procesarlo.
 */
const MONTO_MINIMO = 1;       // Monto mínimo aceptable en colones
const MONTO_MAXIMO = 500000;  // Monto máximo razonable para una membresía

/**
 * Valida que el monto sea un número positivo dentro del rango aceptable.
 * DEFENSA contra explotación de la confianza: el cliente podría enviar
 * monto: 0, monto: -500, o monto: 99999999 para manipular pagos.
 */
const validarMonto = (monto) => {
    const montoNum = Number(monto);
    if (isNaN(montoNum) || montoNum < MONTO_MINIMO || montoNum > MONTO_MAXIMO) {
        return {
            valid: false,
            message: `El monto debe ser un número entre ${MONTO_MINIMO} y ${MONTO_MAXIMO} colones.`
        };
    }
    return { valid: true, value: montoNum };
};

/**
 * Valida que la fecha de pago no sea en el futuro (no se puede pagar en el futuro)
 * ni demasiado antigua (más de 30 días atrás).
 */
const validarFechaPago = (fecha_pago) => {
    const fecha = new Date(fecha_pago);
    if (isNaN(fecha.getTime())) {
        return { valid: false, message: "Formato de fecha inválido." };
    }
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    if (fecha > hoy) {
        return { valid: false, message: "La fecha de pago no puede ser en el futuro." };
    }
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    if (fecha < hace30Dias) {
        return { valid: false, message: "La fecha de pago no puede ser mayor a 30 días en el pasado." };
    }
    return { valid: true };
};

export const registrarPagoMembresia = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    const {
        cedula_cliente,
        tipo_membresia,
        monto, 
        fecha_pago,
        id_forma_pago,
     } = req.body;

    if (!cedula_cliente || !fecha_pago || !monto || !id_forma_pago) {
        return res.status(400).json({
            success: false,
            message: "Todos los campos son obligatorios"
        });
    }

    // CORRECCIÓN: Validar monto en el servidor (no confiar en el cliente)
    const montoValidation = validarMonto(monto);
    if (!montoValidation.valid) {
        return res.status(400).json({
            success: false,
            message: montoValidation.message
        });
    }

    // CORRECCIÓN: Validar fecha de pago en el servidor
    const fechaValidation = validarFechaPago(fecha_pago);
    if (!fechaValidation.valid) {
        return res.status(400).json({
            success: false,
            message: fechaValidation.message
        });
    }

    // CORRECCIÓN: Validar tipo_membresia es un entero positivo válido
    const tipoNum = Number(tipo_membresia);
    if (!Number.isInteger(tipoNum) || tipoNum <= 0) {
        return res.status(400).json({
            success: false,
            message: "El tipo de membresía debe ser un entero positivo."
        });
    }

    try {
        // CORRECCIÓN: Verificar que el tipo de membresía existe en la BD
        // antes de confiar en el dato del cliente
        const tipoCheck = await connection
            .request()
            .input("tipo", sql.TinyInt, tipoNum)
            .query("SELECT id_tipo_membresia, tipo FROM tipo_membresia WHERE id_tipo_membresia = @tipo");

        if (tipoCheck.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El tipo de membresía especificado no existe."
            });
        }

        await connection
            .request()
            .input("cedula_cliente", sql.Char(9), cedula_cliente)
            .input("tipo_membresia", sql.Int, tipoNum)
            .input("monto", sql.Decimal(10, 2), montoValidation.value)
            .input("fecha_pago", sql.Date, fecha_pago)
            .input("id_forma_pago", sql.Int, id_forma_pago)
            .execute("registrar_pago_membresia");

        res.status(200).json({
            success: true,
            message: "Pago registrado correctamente"
        });
    } catch (err) {
        console.error("Error executing registrar_pago_membresia procedure: ", err);
        res.status(400).json({
            success: false,
            message: "Error al registrar el pago. Verifique los datos ingresados."
        });
    }
}



export const actualizarMembresia = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    const { cedula_cliente, tipo_membresia, monto, fecha_pago, id_forma_pago } = req.body;

    if (!cedula_cliente || !tipo_membresia || !monto || !fecha_pago || !id_forma_pago) {
        return res.status(400).json({
            success: false,
            message: "Todos los campos son obligatorios"
        });
    }

    // CORRECCIÓN: Validar monto en el servidor
    const montoValidation = validarMonto(monto);
    if (!montoValidation.valid) {
        return res.status(400).json({
            success: false,
            message: montoValidation.message
        });
    }

    // CORRECCIÓN: Validar fecha de pago en el servidor
    const fechaValidation = validarFechaPago(fecha_pago);
    if (!fechaValidation.valid) {
        return res.status(400).json({
            success: false,
            message: fechaValidation.message
        });
    }

    try {
        // CORRECCIÓN: Verificar que el tipo de membresía existe antes de procesar
        const tipoCheck = await connection
            .request()
            .input("tipo", sql.TinyInt, Number(tipo_membresia))
            .query("SELECT id_tipo_membresia FROM tipo_membresia WHERE id_tipo_membresia = @tipo");

        if (tipoCheck.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El tipo de membresía especificado no existe."
            });
        }

        await connection
            .request()
            .input("cedula_cliente", sql.Char(9), cedula_cliente)
            .input("tipo_membresia", sql.TinyInt, tipo_membresia)
            .input("monto", sql.Decimal(10, 2), montoValidation.value)
            .input("fecha_pago", sql.Date, fecha_pago)
            .input("id_forma_pago", sql.Int, id_forma_pago)
            .execute("actualizar_membresia_cliente");

        res.status(200).json({
            success: true,
            message: "Membresía actualizada correctamente"
        });
    } catch (err) {
        console.error("Error ejecutando actualizar_membresia_cliente: ", err);
        res.status(400).json({
            success: false,
            message: "Error al actualizar la membresía. Verifique los datos ingresados."
        });
    }
};



export const renovar_membresia = async (req, res) => {
    const {connection} = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    const {cedula,monto,id_forma_pago} = req.body;

    if (!cedula || !monto || !id_forma_pago) {
        return res.status(400).json({
            success: false,
            message: "Todos los campos son obligatorios"
        });
    }

    // CORRECCIÓN: Validar monto en el servidor
    const montoValidation = validarMonto(monto);
    if (!montoValidation.valid) {
        return res.status(400).json({
            success: false,
            message: montoValidation.message
        });
    }

    try {
        // CORRECCIÓN: Verificar que el cliente tiene una membresía activa antes de renovar
        const membresiaCheck = await connection
            .request()
            .input("cedula", sql.Char(9), cedula)
            .query(`
                SELECT cm.id_membresia, m.tipo, m.fecha_expiracion
                FROM cliente_membresias cm
                JOIN membresia m ON cm.id_membresia = m.id_membresia
                WHERE cm.cedula = @cedula AND cm.vigente = 1
            `);

        if (membresiaCheck.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El cliente no tiene una membresía activa para renovar."
            });
        }

        await connection
            .request()
            .input("cedula", sql.Char(9), cedula)
            .input("monto", sql.Decimal(10, 2), montoValidation.value)
            .input("id_forma_pago", sql.Int, id_forma_pago)
            .execute("renovar_membresia");

        res.status(200).json({
            success: true,
            message: "Membresía renovada correctamente"
        });
    } catch (err) {
        console.error("Error executing renovar_membresia procedure: ", err);
        res.status(400).json({
            success: false,
            message: "Error al renovar la membresía. Verifique los datos ingresados."
        });
    }
}


export const clientesMembresiaVencida = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active Sql server connection"
        });
    }

    try {
        const result = await connection
            .request()
            .query(`
                    SELECT 
                        p.cedula,
                        p.nombre + ' ' + p.apellido1 + ' ' + p.apellido2 AS nombre_completo,
                        m.fecha_expiracion,
                        DATEDIFF(DAY, m.fecha_expiracion, GETDATE()) AS dias_vencida
                    FROM cliente_membresias cm
                    JOIN membresia m ON cm.id_membresia = m.id_membresia
                    JOIN persona p ON cm.cedula = p.cedula
                    WHERE m.fecha_expiracion < GETDATE();
                `);
        console.log(result);
        res.json({
            success: true,
            tables: [result.recordset]
        });
    } catch (err) {
        console.error("Error executing consulta_avanzada1 procedure: ", err);
        res.status(400).json({
            success: false,
            message: "Error al consultar membresías vencidas."
        });
    }
}
