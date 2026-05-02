import sql from 'mssql';
import { getConnection } from "../config/conectionStore.js";


export const insertarCliente = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    const {
        cedula,
        nombre,
        apellido1,
        apellido2,
        telefono,
        genero,
        distrito,
        correo,
        fecha_nacimiento,
        edad,
    } = req.body;

    if (!cedula || !nombre || !apellido1 || !telefono || !genero || !distrito || !correo || !fecha_nacimiento || !edad) {
        return res.status(400).json({
            success: false,
            message: "Todos los campos son obligatorios"
        });
    }

    try {
        await connection
            .request()
            .input("cedula", sql.Char(9), cedula)
            .input("nombre", sql.VarChar(20), nombre)
            .input("apellido1", sql.VarChar(20), apellido1)
            .input("apellido2", sql.VarChar(20), apellido2)
            .input("telefono", sql.VarChar(8), telefono)
            .input("genero", sql.TinyInt, genero)
            .input("distrito", sql.SmallInt, distrito)
            .input("correo", sql.VarChar(50), correo)
            .input("fecha_nacimiento", sql.Date, fecha_nacimiento)
            .input("edad", sql.TinyInt, edad)
            .execute("insertar_cliente");

        res.status(200).json({
            success: true,
            message: "Cliente insertado correctamente"
        });
    } catch (err) {
        console.error("Error executing insertar_cliente procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};


export const actualizarPersona = async (req, res) => {
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    const {
        cedula,
        correo,
        telefono
    } = req.body;

    if (!cedula || !correo || !telefono) {
        return res.status(400).json({
            success: false,
            message: "Todos los campos son obligatorios"
        });
    }

    try {
        await connection
            .request()
            .input("cedula", sql.Char(9), cedula)
            .input("correo", sql.VarChar(50), correo)
            .input("telefono", sql.VarChar(8), telefono)
            .execute("actualizar_persona");

        res.status(200).json({
            success: true,
            message: "Cliente actualizado correctamente"
        });
    } catch (err) {
        console.error("Error executing actualizar_persona procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}


export const eliminarPersona = async(req,res)=>{
    const { connection } = getConnection();

    if (!connection) {
        return res.status(400).json({
            success: false,
            message: "No active SQL Server connection",
        });
    }

    const { cedula } = req.body;

    if (!cedula) {
        return res.status(400).json({
            success: false,
            message: "La cedula es obligatoria"
        });
    }

    try {
        await connection
            .request()
            .input("cedula", sql.Char(9), cedula)
            .execute("eliminar_persona");

        res.status(200).json({
            success: true,
            message: "Cliente eliminado correctamente"
        });
    } catch (err) {
        console.error("Error executing eliminar_persona procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}


export const vistaClientes = async(req,res) =>{
    const {connection} = getConnection()

    if(!connection){
        return res.status(400).json({
            success:false,
            message:"No active Sql server connection"
        })
    }

    try{
        const result =await connection.
        request().query("SELECT * FROM vista_clientes");
        console.log(result)
        res.json({
            success:true,
            tables:[result.recordset]
        })
    }catch(err){
        console.error("Error executing vista_clientes procedure: ", err);
        res.status(400).json({
            success:false,
            message: err.message
        })
        
    }
}

export const vistaClientesClase = async(req,res) =>{
    const {connection} = getConnection()

    if(!connection){
        return res.status(400).json({
            success:false,
            message:"No active Sql server connection"
        })
    }

    try{
        const result = await connection.
        request().query("SELECT * FROM vista_clientes_clase");
        console.log(result)
        res.json({
            success:true,
            tables:[result.recordset]
        })
    }catch(err){
        console.error("Error executing vista_clientes_clase procedure: ", err);
        res.status(400).json({
            success:false,
            message: err.message
        })
        
    }
}

export const vistaClientesSesion = async(req,res) =>{
    const {connection} = getConnection()

    if(!connection){
        return res.status(400).json({
            success:false,
            message:"No active Sql server connection"
        })
    }

    try{
        const result = await connection.
        request().query("SELECT * FROM vista_clientes_sesion");
        console.log(result)
        res.json({
            success:true,
            tables:[result.recordset]
        })
    }catch(err){
        console.error("Error executing vista_clientes_sesion procedure: ", err);
        res.status(400).json({
            success:false,
            message: err.message
        })
        
    }
}


export const vistaHistorialPagosClientes = async (req, res) => {
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
            .query("SELECT * FROM vista_historial_pagos_clientes ORDER BY id_pago ASC");

        res.status(200).json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error("Error executing vista_historial_pagos_clientes view: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}


export const rankingClientes = async (req, res) => {
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
                    COUNT(DISTINCT c.id_clase) AS total_clases,
                    RANK() OVER (ORDER BY COUNT(DISTINCT c.id_clase) DESC) AS posicion
                FROM inscripcion_sesion_programada isp
                JOIN sesion_programada sp ON isp.id_sesion_programada = sp.id_sesion_programada
                JOIN sesion s ON sp.id_sesion = s.id_sesion
                JOIN clase c ON s.id_clase = c.id_clase
                JOIN persona p ON isp.cedula = p.cedula
                GROUP BY p.cedula, p.nombre, p.apellido1, p.apellido2;
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



export const clientesMembresiaProximaAVencer = async (req, res) => {
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
                    DATEDIFF(DAY, GETDATE(), m.fecha_expiracion) AS dias_restantes
                FROM cliente_membresias cm
                JOIN membresia m ON cm.id_membresia = m.id_membresia
                JOIN persona p ON cm.cedula = p.cedula
                WHERE 
                    m.fecha_expiracion >= CAST(GETDATE() AS DATE)
                    AND m.fecha_expiracion < DATEADD(DAY, 7, CAST(GETDATE() AS DATE));
            `);
        console.log(result);
        res.json({
            success: true,
            tables: [result.recordset]
        });
    } catch (err) {
        console.error("Error executing consulta_avanzada2 procedure: ", err);
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}