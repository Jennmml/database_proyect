import sql from "mssql";
import { getConnection } from "../config/conectionStore.js";

export const crearSesion = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(500).json({
            success: false,
            message: "No hay conexión activa con SQL Server.",
        });
    }

    const { id_sesion, fecha } = req.body;

    if (!id_sesion || !fecha) {
        return res.status(400).json({
            success: false,
            message: "Todos los campos son obligatorios.",
        });
    }

    try {
        await connection
            .request()
            .input("id_sesion", sql.Int, id_sesion)
            .input("fecha", sql.Date, fecha)
            .execute("crear_sesion_programada");

        res.json({
            success: true,
            message: "Sesión creada exitosamente",
        });
    } catch (err) {
        console.error("Error al crear la sesión: ", err);
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}


export const eliminarSesion = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active Sql server connection"
        });
    }

    const { id_sesion_programada } = req.body;

    if (!id_sesion_programada) {
        return res.status(400).json({
            success: false,
            message: "El id de la sesión es obligatorio"
        });
    }

    try {
        await connection
            .request()
            .input("id_sesion_programada", sql.Int, id_sesion_programada)
            .execute("eliminar_sesion_programada");

        res.json({
            success: true,
            message: "Sesión eliminada correctamente"
        });
    } catch (err) {
        console.error("Error executing eliminar_sesion_programada procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}


export const inscribirClienteASesion = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active Sql server connection"
        });
    }

    const { cedula_cliente, id_sesion_programada } = req.body;

    if (!cedula_cliente || !id_sesion_programada) {
        return res.status(400).json({
            success: false,
            message: "Todos los campos son obligatorios"
        });
    }

    try {
        await connection
            .request()
            .input("cedula", sql.Char(9), cedula_cliente)
            .input("id_sesion_programada", sql.Int, id_sesion_programada)
            .execute("inscribir_cliente_a_sesion_programada");

        res.json({
            success: true,
            message: "Cliente inscrito a la sesión correctamente"
        });
    } catch (err) {
        console.error("Error executing iinscribir_cliente_a_sesion_programada procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}


export const desinscribirClienteDeSesion = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active Sql server connection"
        });
    }

    const { cedula, id_sesion_programada } = req.body;

    if (!cedula || !id_sesion_programada) {
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
            .execute("desinscribir_cliente_de_sesion_programada");

        res.json({
            success: true,
            message: "Cliente desinscrito de la sesión correctamente"
        });
    } catch (err) {
        console.error("Error executing desinscribir_cliente_de_sesion_programada procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}


export const vistaSesiones = async (req, res) => {
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
                    s.id_sesion,
                    c.nombre AS nombre_clase,
                    c.descripcion AS descripcion_clase,
                    g.numero_grupo,
                    h.dia,
                    h.hora_inicio,
                    h.hora_fin
                FROM sesion s
                JOIN clase c ON s.id_clase = c.id_clase
                JOIN grupo g ON s.numero_grupo = g.numero_grupo
                JOIN horario h ON s.id_horario = h.id_horario;
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


export const vistaDetallesSesion = async (req, res) => {
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
            .query(`SELECT * FROM vista_detalles_sesion_programadas ;`);
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



export const cantidadSesionPorMes = async (req, res) => {
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
                        c.nombre AS clase,
                        DATENAME(MONTH, sp.fecha) + ' ' + CAST(YEAR(sp.fecha) AS VARCHAR) AS mes,
                        COUNT(*) AS total_sesiones_en_mes
                    FROM sesion s
                    JOIN clase c ON s.id_clase = c.id_clase
                    JOIN sesion_programada sp ON s.id_sesion = sp.id_sesion
                    GROUP BY c.nombre, DATENAME(MONTH, sp.fecha), YEAR(sp.fecha)
                    ORDER BY mes DESC
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


export const distribucionGeneroPorEstado = async (req, res) => {
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
                        ec.estado,
                        SUM(CASE WHEN g.genero = 'Masculino' THEN 1 ELSE 0 END) AS hombres,
                        SUM(CASE WHEN g.genero = 'Femenino' THEN 1 ELSE 0 END) AS mujeres,
                        COUNT(*) AS total
                    FROM inscripcion_sesion_programada ic
                    JOIN cliente c ON ic.cedula = c.cedula
                    JOIN persona p ON c.cedula = p.cedula
                    JOIN generos g ON p.genero = g.id_genero
                    JOIN estados_clientes ec ON c.estado = ec.id_estado
                    GROUP BY ec.estado;
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

export const promedioPorGrupoYCupos = async (req, res) => {
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
                    numero_grupo,
                    cupo_disponible,
                    cantidad_matriculados,
                    CASE 
                        WHEN cantidad_matriculados > cupo_disponible THEN 'Sobrecupo'
                        WHEN cantidad_matriculados = cupo_disponible THEN 'Lleno'
                        ELSE 'Disponible'
                    END AS estado
                FROM grupo;

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


export const cursorSesionesSinEntrenador = async (req, res) => {
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
            .execute("cursor_sesiones_sin_entrenador");
        console.log(result);
        res.json({
            success: true,
            data : result.recordset
        });
    } catch (err) {
        console.error("Error executing consulta_avanzada1 procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

export const obtenerInscritosPorSesion = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active Sql server connection"
        });
    }

    const { id_sesion_programada } = req.params;

    if (!id_sesion_programada) {
        return res.status(400).json({
            success: false,
            message: "El id de la sesión es obligatorio"
        });
    }

    try {
        const result = await connection
            .request()
            .input("id_sesion_programada", sql.Int, id_sesion_programada)
            .execute("obtener_inscritos_por_sesion");

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error executing obtener_inscritos_por_sesion procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}