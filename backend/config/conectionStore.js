import logger from '../utils/logger.js';

let currentConnection = null; 

export const setConnection = (connection) => {
  currentConnection = connection;
};

export const getConnection = () => {
  return { connection: currentConnection };
};

export const clearConnection = async () => {
  try {
    if (!currentConnection) {
      logger.info('No connection to close.');
      return; 
    }

    if (!currentConnection.connected || !currentConnection.ready) {
      logger.info('Connection was not active or already closed');
      currentConnection = null; 
      return; 
    }

    logger.info('Closing active SQL Server connection');
    await currentConnection.close();
    logger.info('Connection closed successfully.');
    currentConnection = null;
  } catch (err) {
    logger.error('Error closing the connection', { error: err.message });
    throw err;
  }
};

