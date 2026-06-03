import logger from '../utils/logger.js';
import sql from "mssql";
import { getConnection } from "../config/conectionStore.js";
import { registrarPagoSchema } from "../schemas/membresia.schema.js";

// Funciones de validación auxiliares eliminadas en favor de Zod y validación por BD

export const registrarPagoMembresia = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active Sql server connection",
        });
    }

    // VALIDACIÓN ZOD: Asegurar integridad de tipos y formatos
    const validation = registrarPagoSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Datos de pago inválidos",
            errors: validation.error.errors
        });
    }

    const { cedula_cliente, tipo_membresia, monto, fecha_pago, id_forma_pago } = validation.data;

    try {
        // CORRECCIÓN A-06: No confiar en el monto enviado por el cliente.
        // Consultar el precio real en la base de datos.
        const tipoCheck = await connection
            .request()
            .input("tipo", sql.TinyInt, tipo_membresia)
            .query("SELECT id_tipo_membresia, precio_base FROM tipo_membresia WHERE id_tipo_membresia = @tipo");

        if (tipoCheck.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El tipo de membresía especificado no existe."
            });
        }

        const precioReal = tipoCheck.recordset[0].precio_base;

        // Comparar monto enviado vs precio base oficial
        if (Number(monto) !== Number(precioReal)) {
            console.warn(`Intento de fraude detectado: Cliente ${cedula_cliente} intentó pagar ${monto} por una membresía que cuesta ${precioReal}`);
            return res.status(400).json({
                success: false,
                message: "El monto de pago no coincide con el precio real de la membresía."
            });
        }

        await connection
            .request()
            .input("cedula_cliente", sql.Char(9), cedula_cliente)
            .input("tipo_membresia", sql.TinyInt, tipo_membresia)
            .input("monto", sql.Decimal(10, 2), precioReal) // Usamos el precio de la BD
            .input("fecha_pago", sql.Date, fecha_pago)
            .input("id_forma_pago", sql.Int, id_forma_pago)
            .execute("registrar_pago_membresia");

        res.status(200).json({
            success: true,
            message: "Pago de membresía registrado correctamente"
        });
    } catch (err) {
        logger.error("Error ejecutando registrar_pago_membresia procedure: ", err);
        res.status(400).json({
            success: false,
            message: "Error al registrar el pago. Verifique los datos ingresados."
        });
    }
};

export const obtenerMembresiasVencidas = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active Sql server connection",
        });
    }

    try {
        const result = await connection
            .request()
            .query(`
                SELECT 
                    cm.cedula,
                    p.nombre,
                    p.apellido1,
                    m.fecha_expiracion,
                    DATEDIFF(DAY, m.fecha_expiracion, GETDATE()) AS dias_vencida
                FROM cliente_membresias cm
                JOIN persona p ON cm.cedula = p.cedula
                JOIN membresia m ON cm.id_membresia = m.id_membresia
                WHERE cm.vigente = 1 
                  AND m.fecha_expiracion < GETDATE()
            `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        logger.error("Error al obtener membresías vencidas: ", err);
        res.status(400).json({
            success: false,
            message: "Error al obtener membresías vencidas"
        });
    }
};

export const actualizarMembresia = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    // VALIDACIÓN ZOD
    const validation = registrarPagoSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            success: false,
            message: "Datos de membresía inválidos",
            errors: validation.error.errors
        });
    }

    const { cedula_cliente, tipo_membresia, monto, fecha_pago, id_forma_pago } = validation.data;

    try {
        // CORRECCIÓN: Verificar que el tipo de membresía existe y validar monto
        const tipoCheck = await connection
            .request()
            .input("tipo", sql.TinyInt, tipo_membresia)
            .query("SELECT id_tipo_membresia, precio_base FROM tipo_membresia WHERE id_tipo_membresia = @tipo");

        if (tipoCheck.recordset.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El tipo de membresía especificado no existe."
            });
        }

        const precioReal = tipoCheck.recordset[0].precio_base;

        if (Number(monto) !== Number(precioReal)) {
            return res.status(400).json({
                success: false,
                message: "El monto no coincide con el precio oficial."
            });
        }

        await connection
            .request()
            .input("cedula_cliente", sql.Char(9), cedula_cliente)
            .input("tipo_membresia", sql.TinyInt, tipo_membresia)
            .input("monto", sql.Decimal(10, 2), precioReal)
            .input("fecha_pago", sql.Date, fecha_pago)
            .input("id_forma_pago", sql.Int, id_forma_pago)
            .execute("actualizar_membresia_cliente");

        res.status(200).json({
            success: true,
            message: "Membresía actualizada correctamente"
        });
    } catch (err) {
        logger.error("Error ejecutando actualizar_membresia_cliente: ", err);
        res.status(400).json({
            success: false,
            message: "Error al actualizar la membresía. Verifique los datos ingresados."
        });
    }
};

export const obtenerMembresiaActiva = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active Sql server connection",
        });
    }

    const { cedula } = req.params;

    try {
        const result = await connection
            .request()
            .input("cedula", sql.Char(9), cedula)
            .query(`
                SELECT 
                    cm.id_membresia,
                    tm.nombre AS tipo,
                    m.fecha_inicio,
                    m.fecha_expiracion,
                    cm.vigente
                FROM cliente_membresias cm
                JOIN membresia m ON cm.id_membresia = m.id_membresia
                JOIN tipo_membresia tm ON m.id_tipo_membresia = tm.id_tipo_membresia
                WHERE cm.cedula = @cedula AND cm.vigente = 1
            `);

        res.json({
            success: true,
            data: result.recordset[0] || null
        });
    } catch (err) {
        logger.error("Error al obtener membresía activa: ", err);
        res.status(400).json({
            success: false,
            message: "Error al obtener membresía activa"
        });
    }
};

export const renovar_membresia = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({ success: false, message: "No active SQL Server connection" });
    }

    const { cedula, monto, id_forma_pago } = req.body;

    if (!cedula || !monto || !id_forma_pago) {
        return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    try {
        await connection
            .request()
            .input("cedula", sql.Char(9), cedula)
            .input("monto", sql.Decimal(10, 2), monto)
            .input("id_forma_pago", sql.Int, id_forma_pago)
            .execute("renovar_membresia");

        res.status(200).json({ success: true, message: "Membresía renovada correctamente" });
    } catch (err) {
        logger.error("Error executing renovar_membresia: ", err);
        res.status(400).json({ success: false, message: "Error al renovar la membresía" });
    }
};
