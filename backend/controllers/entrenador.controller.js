import { getConnection } from "../config/conectionStore.js";

export const asignarEntrenadorASesionProgramada = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(500).json({
            success: false,
            message: "No active SQL Server connection.",
        });
    }

    const { cedula_entrenador, id_sesion_programada } = req.body;

    try {
        const result = await connection
            .request()
            .input("cedula_entrenador", cedula_entrenador)
            .input("id_sesion_programada", id_sesion_programada)
            .execute("asignar_entrenador_a_sesion_programada");

        return res.status(200).json({
            success: true,
            "message": "Trainer assigned to scheduled session successfully.",
        });
    } catch (error) {
        console.error("There is already a trainer assigned to this session:", error);
        return res.status(500).json({
            success: false,
            message: "There is already a trainer assigned to this session.",
        });
    }
}

export const vistaClienteSesionEntrenador = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(500).json({
            success: false,
            message: "No active SQL Server connection.",
        });
    }

    try {
        const result = await connection
            .request()
            .query("SELECT * FROM vista_clientes_sesion_con_entrenador");

        return res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (error) {
        console.error("Error getting trainer sessions:", error);
        return res.status(500).json({
            success: false,
            message: "Error getting trainer sessions.",
        });
    }
}

export const vistaSesionesSinEntrenador = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(500).json({
            success: false,
            message: "No active SQL Server connection.",
        });
    }

    try {
        const result = await connection
            .request()
            .query("SELECT * FROM vista_sesiones_sin_entrenador");

        return res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (error) {
        console.error("Error getting sessions without trainer:", error);
        return res.status(500).json({
            success: false,
            message: "Error getting sessions without trainer.",
        });
    }
}

export const vistaEntrenadorSesionesTotales = async(req,res)=>{
    const { connection } = getConnection();

    if (!connection) {
        return res.status(500).json({
            success: false,
            message: "No active SQL Server connection.",
        });
    }

    try {
        const result = await connection
            .request()
            .query("SELECT * FROM vista_entrenador_sesiones_totales ORDER BY cantidad_sesiones DESC;");

        return res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (error) {
        console.error("Error getting total trainer sessions:", error);
        return res.status(500).json({
            success: false,
            message: "Error getting total trainer sessions.",
        });
    }
}