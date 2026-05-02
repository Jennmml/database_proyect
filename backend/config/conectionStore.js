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
      console.log('No connection to close.');
      return; 
    }

    if (!currentConnection.connected || !currentConnection.ready) {
      console.log('Connection was not active or already closed');
      currentConnection = null; 
      return; 
    }

    console.log('Closing active SQL Server connection');
    await currentConnection.close();
    console.log('Connection closed successfully.');
    currentConnection = null;
  } catch (err) {
    console.error('Error closing the connection:', err);
    throw err;
  }
};

