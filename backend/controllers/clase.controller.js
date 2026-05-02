import sql from 'mssql';
import { getConnection } from "../config/conectionStore.js";

export const crearClase = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(500).json({
        success: false,
        message: "No hay conexión activa con SQL Server.",
        });
    }

    const {
        nombre_clase,
        descripcion = "Sin descripción",
        cupo_disponible,
        dia,
        hora_inicio,
        hora_fin,
    } = req.body;


    if (!nombre_clase || !cupo_disponible || !dia || !hora_inicio || !hora_fin) {
        return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios.",
        });
    }

    const parseTimeToDate = (horaStr) => {
        try {
        const [h, m, s = "00"] = horaStr.split(":");
        return new Date(1970, 0, 1, parseInt(h), parseInt(m), parseInt(s));
        } catch (e) {
        return null;
        }
    };

    const horaInicioDate = parseTimeToDate(hora_inicio);
    const horaFinDate = parseTimeToDate(hora_fin);

    if (!horaInicioDate || !horaFinDate || horaInicioDate >= horaFinDate) {
        return res.status(400).json({
        success: false,
        message: "Hora de inicio inválida o mayor/igual que hora de fin.",
        });
    }

    try {
        await connection
        .request()
        .input("nombre_clase", sql.VarChar(50), nombre_clase)
        .input("descripcion", sql.VarChar(200), descripcion)
        .input("cupo_disponible", sql.TinyInt, cupo_disponible)
        .input("dia", sql.VarChar(20), dia)
        .input("hora_inicio", sql.Time, horaInicioDate)
        .input("hora_fin", sql.Time, horaFinDate)
        .execute("crear_clase");

        return res.status(200).json({
        success: true,
        message: "Clase creada correctamente.",
        });
    } catch (error) {
        console.error("Error al ejecutar el procedimiento crear_clase:", error);
        return res.status(500).json({
        success: false,
        message: "Error interno al crear la clase.",
        error: error.message,
        });
    }
};


export const eliminarClase = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    const { id_clase } = req.body;

    if (!id_clase) {
        return res.status(400).json({
            success: false,
            message: "El id de la clase es obligatorio"
        });
    }

    try {
        await connection
            .request()
            .input("id_clase", sql.Int, id_clase)
            .execute("eliminar_clase");

        res.status(200).json({
            success: true,
            message: "Clase eliminada correctamente"
        });
    } catch (err) {
        console.error("Error executing eliminar_clase procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}


export const registarAsistencia = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    const { cedula, id_sesion_programada, asistio } = req.body;

    if (!cedula || !id_sesion_programada || asistio === undefined) {
        return res.status(400).json({
            success: false,
            message: "Todos los campos son obligatorios"
        });
    }

    try {
        await connection
            .request()
            .input("cedula", sql.Char(9), cedula)
            .input("id_sesion_programada", sql.Int, id_sesion_programada)
            .input("asistio", sql.Bit, asistio)
            .execute("registrar_asistencia_cliente");

        res.status(200).json({
            success: true,
            message: "Asistencia registrada correctamente"
        });
    } catch (err) {
        console.error("Error executing registrar_asistencia_cliente procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}


export const vistaTotalClasesPorSesion = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    try {
        const result = await connection
            .request()
            .query("SELECT * FROM vista_total_clases_por_sesion");

        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error executing vista_total_clases_por_sesion procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}