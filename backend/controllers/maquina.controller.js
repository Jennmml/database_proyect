import sql from 'mssql';
import { getConnection } from "../config/conectionStore.js";

export const agregarMaquina = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(500).json({
            success: false,
            message: "No hay conexión activa con SQL Server.",
        });
    }

    try {
        const { estado, tipo, modelo, marca } = req.body;

        await connection
            .request()
            .input("estado", sql.TinyInt, estado)
            .input("tipo", sql.NVarChar, tipo)
            .input("modelo", sql.NVarChar, modelo)
            .input("marca", sql.NVarChar, marca)
            .execute("agregar_maquina");

        return res.status(200).json({
            success: true,
            message: "Máquina agregada correctamente.",
        });
    } catch (error) {
        console.error("Error al agregar la máquina:", error);
        return res.status(500).json({
            success: false,
            message: "Error al agregar la máquina.",
        });
    }
}


export const nuevaRevisionMaquina = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(500).json({
            success: false,
            message: "No active SQL Server connection.",
        });
    }

    try {
        const { id_maquina, cedula_admin, nuevo_estado, observacion } = req.body;

        if(!id_maquina || !cedula_admin || !nuevo_estado || !observacion) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        // Validación de formato: id_maquina debe ser entero positivo
        if (!Number.isInteger(Number(id_maquina)) || Number(id_maquina) <= 0) {
            return res.status(400).json({
                success: false,
                message: "id_maquina debe ser un entero positivo.",
            });
        }

        // Validación de formato: cédula debe ser exactamente 9 dígitos numéricos
        if (!/^\d{9}$/.test(String(cedula_admin).trim())) {
            return res.status(400).json({
                success: false,
                message: "cedula_admin debe ser exactamente 9 dígitos numéricos.",
            });
        }

        // Validación de formato: nuevo_estado debe ser un entero positivo (TINYINT: 0-255)
        const estadoNum = Number(nuevo_estado);
        if (!Number.isInteger(estadoNum) || estadoNum < 0 || estadoNum > 255) {
            return res.status(400).json({
                success: false,
                message: "nuevo_estado debe ser un entero entre 0 y 255.",
            });
        }

        // Validación de longitud: observacion máximo 300 caracteres (según esquema BD)
        if (String(observacion).length > 300) {
            return res.status(400).json({
                success: false,
                message: "observacion no puede exceder 300 caracteres.",
            });
        }

        await connection
            .request()
            .input("id_maquina", sql.Int, Number(id_maquina))
            .input("cedula_admin", sql.Char(9), String(cedula_admin).trim())
            .input("nuevo_estado", sql.TinyInt, estadoNum)
            .input("observacion", sql.VarChar(300), String(observacion))
            .execute("revisar_maquina");

        return res.status(201).json({
            success: true,
            message: "Revision created successfully.",
        });
    } catch (error) {
        console.error("Error creating revision:", error);
        return res.status(500).json({
            success: false,
            message: "Error creating revision.",
        });
    }
}

export const cursorMaquinaVencidas = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(500).json({
            success: false,
            message: "No hay conexión activa con SQL Server.",
        });
    }

    try {
        const result = await connection
            .request()
            .execute("cursor_maquinas_vencidas");

        return res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (error) {
        console.error("Error al obtener las máquinas vencidas:", error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener las máquinas vencidas.",
        });
    }
}