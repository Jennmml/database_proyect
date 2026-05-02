import sql from "mssql";
import { getConnection } from "../config/conectionStore.js";


export const getDistritos = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    try {
        const result = await connection.request().query("SELECT * FROM distritos");
        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error executing get_distritos procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}


export const getClases = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    try {
        const result = await connection.request().query("SELECT * FROM clase");
        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error executing get_clases procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

export const getAsistencia = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    try {
        const result = await connection.request().query("SELECT * FROM asistencia_cliente");
        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error executing get_asistencia procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

export const getTipoMembresia = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    try {
        const result = await connection.request().query("SELECT * FROM tipo_membresia");
        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error executing get_tipo_membresia procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}


export const getCliente = async (req, res) => {
    const { connection } = getConnection();
    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    const { cedula } = req.params;

    if (!cedula || String(cedula).length !== 9) {
        return res.status(400).json({
            success: false,
            message: "Cedula query parameter must be exactly 9 characters",
        });
    }

    try {
        const result = await connection
            .request()
            .input("cedula", sql.VarChar(9), cedula.trim())
            .query("SELECT * FROM vista_clientes WHERE cedula = @cedula");

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No se encontró un cliente con cédula ${cedula}`
            });
        }

        res.status(200).json({
            success: true,
            data: result.recordset[0]
        });

    } catch (err) {
        console.error("Error executing get_persona query: ", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


export const getEntrenadores = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    try {
        const result = await connection.request().query(`
            SELECT 
            p.nombre,
            p.cedula,
            p.apellido1,
            p.apellido2,
            e.tipo
            FROM persona p
            JOIN entrenador e
            ON p.cedula = e.cedula
            `);
        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error executing get_entrenadores procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

export const getEstadosMaquina = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    try {
        const result = await connection.request().query("SELECT * FROM estados_maquinas");
        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error executing get_estados_maquina query: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

export const getMaquinas = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    try {
        const result = await connection.request().query("SELECT * FROM maquina");
        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error executing get_maquinas query: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

export const getAdmin = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    const { cedula } = req.params;

    if (!cedula || String(cedula).length !== 9) {
        return res.status(400).json({
            success: false,
            message: "Cedula query parameter must be exactly 9 characters",
        });
    }

    try {
        const result = await connection
            .request()
            .input("cedula", sql.VarChar(9), cedula.trim())
            .query(`
                SELECT
                    p.nombre,
                    p.apellido1,
                    p.apellido2,
                    p.cedula,
                    a.fecha_contratacion
                FROM persona p
                JOIN administrador a ON a.cedula = p.cedula
                WHERE p.cedula = @cedula
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Can't find admin with cedula ${cedula}`
            });
        }

        res.status(200).json({
            success: true,
            data: result.recordset[0]
        });

    } catch (err) {
        console.error("Error executing get_persona query: ", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
