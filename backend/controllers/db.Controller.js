import connect from '../config/dbconfig.js';
import logger from '../utils/logger.js';
import {setConnection, clearConnection}  from '../config/conectionStore.js';

export const conectToSqlServer = async(req,res)=>{
    const {username, password, host, dbname} = req.body;
    if (!username || !password || !host || !dbname) {
        return res.status(400).json({ 
        success: false, 
        message: 'Some space is empty so we can not connect to sql server' 
        });
    }
    const config = {
        user: username,
        password: password,
        host: host,
        database: dbname
    }


    try{
        let connection;
        connection = await connect(config)

        setConnection(connection)

    }catch(err){
       logger.error('Error connecting to sql server', { error: err.message });
        res.status(500).json({ 
        success: false, 
        message: err.message,
        details: {
            code: err.code,
            hint: err.hint
        }
        });
    }

    res.json({
        success:true,
        message:"Succesfully conected to sql server"
    })
    
}


export const disconnectFromSqlServer = (req,res)=>{
    try{
        clearConnection()
        logger.info("Connection succesfully closed to sql server");
        res.json({
            success:true,
            message:"Connection succesfully closed to sql server"
        })
    }catch(err){
        logger.error("Error connecting to sql server");
        res.status(500).json({
            success:false,
            message:`Error closing the connection: ${err}`
        })
        
    }  
}
