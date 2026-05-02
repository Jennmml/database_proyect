import { getConnection } from "../config/conectionStore.js";

export const vistaAdminMaquina = async (req, res) => {
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
            .query("SELECT * FROM vista_admin_maquina");

        return res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (error) {
        console.error("Error getting machines:", error);
        return res.status(500).json({
            success: false,
            message: "Error getting machines.",
        });
    }
}

export const vistaRevisionMaquina = async (req, res) => {
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
            .query("SELECT * FROM vista_revision_maquina");

        return res.status(200).json({
            success: true,
            data: result.recordset,
        });
    } catch (error) {
        console.error("Error getting machine revisions:", error);
        return res.status(500).json({
            success: false,
            message: "Error getting machine revisions.",
        });
    }
}


