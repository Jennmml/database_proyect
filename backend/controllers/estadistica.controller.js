import sql from 'mssql';
import { getConnection } from "../config/conectionStore.js";

export const obtenerEstadisticasPorFecha = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    const { fecha} = req.query;

    if (!fecha) {
        return res.status(400).json({
            success: false,
            message: "Fecha is required",
        });
    }

    try {
        const result = await connection
            .request()
            .input("fecha", sql.Date, fecha)
            .execute("obtener_estadisticas_por_fecha");

        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error executing obtener_estadisticas_acumuladas_por_fecha procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}