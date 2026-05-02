import sql from 'mssql';

let pool = null;

const connect = async (config) => {
    if (!config.user || !config.password || !config.host || !config.database) {   
        throw new Error('Missing required SQL Server connection parameters.');
    }

    const finalConfig = {
        user: config.user,
        password: config.password,
        server: config.host,
        database: config.database,
        options: {
            encrypt: false,
            trustServerCertificate: true,
            port: 1433
        }
    };

    if (pool) {
        try {
            console.log("Closing existing connection...");
            await pool.close();
            console.log("Existing connection closed.");
        } catch (err) {
            console.error("Error closing existing connection:", err);
        } finally {
            pool = null;
        }
    }

    try {
        pool = await sql.connect(finalConfig);
        const result = await pool.request().query('SELECT DB_NAME() AS CurrentDatabase;');
        
        const currentDb = result.recordset[0].CurrentDatabase;
        if (currentDb !== config.database) {
            throw new Error(`Connected to wrong database: expected ${config.database}, got ${currentDb}`);
        }

        console.log(`Connected to SQL Server. Active database: ${currentDb}`);
        return pool;
    } catch (err) {
        console.error("Error connecting to SQL Server:", err);
        throw err;
    }
};

export default connect;
