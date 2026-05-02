import connect from '../config/dbconfig.js';
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
       console.error('Error connecting to sql server:', err);
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
        console.log("Connection succesfully closed to sql servere");
        res.json({
            success:true,
            message:"Connection succesfully closed to sql server"
        })
    }catch(err){
        console.error("Error connecting to sql server");
        res.status(500).json({
            success:false,
            message:`Error closing the connection: ${err}`
        })
        
    }  
}
