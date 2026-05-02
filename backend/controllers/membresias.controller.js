import sql from 'mssql';
import { getConnection } from "../config/conectionStore.js";

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

    try {
        await connection
            .request()
            .input("cedula_cliente", sql.Char(9), cedula_cliente)
            .input("tipo_membresia", sql.Int, tipo_membresia)
            .input("monto", sql.Decimal(10, 2), monto)
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
            message: err.message
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

    try {
        await connection
            .request()
            .input("cedula_cliente", sql.Char(9), cedula_cliente)
            .input("tipo_membresia", sql.TinyInt, tipo_membresia)
            .input("monto", sql.Decimal(10, 2), monto)
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
            message: err.message
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

    try {
        await connection
            .request()
            .input("cedula", sql.Char(9), cedula)
            .input("monto", sql.Decimal(10, 2), monto)
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
            message: err.message
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
            message: err.message
        });
    }
}

