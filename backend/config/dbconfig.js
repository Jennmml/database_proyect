import sql from 'mssql';
import logger from '../utils/logger.js';

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
            logger.info("Closing existing connection...");
            await pool.close();
            logger.info("Existing connection closed.");
        } catch (err) {
            logger.error("Error closing existing connection", { error: err.message });
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

        logger.info(`Connected to SQL Server. Active database: ${currentDb}`);
        return pool;
    } catch (err) {
        logger.error("Error connecting to SQL Server", { error: err.message });
        throw err;
    }
};

export default connect;
