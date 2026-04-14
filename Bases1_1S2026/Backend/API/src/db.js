const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let connectionPool = null;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable de entorno requerida no definida: ${name}`);
  }
  return value;
}

async function initializeConnection() {
  try {
    if (!connectionPool) {
      connectionPool = await oracledb.createPool({
        user: requireEnv('DB_USER'),
        password: requireEnv('DB_PASSWORD'),
        connectionString: requireEnv('DB_CONNECTION_STRING'),
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 1
      });
      console.log('Pool de conexiones creado');
    }
    return connectionPool;
  } catch (error) {
    console.error('Error al crear pool de conexiones:', error);
    throw error;
  }
}

async function getConnection() {
  try {
    if (!connectionPool) {
      await initializeConnection();
    }
    return await connectionPool.getConnection();
  } catch (error) {
    console.error('Error al obtener conexion:', error);
    throw error;
  }
}

async function executeQuery(query, params = []) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(query, params);
    return result;
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar conexion:', err);
      }
    }
  }
}

async function closePool() {
  try {
    if (connectionPool) {
      await connectionPool.close(0);
      console.log('Pool de conexiones cerrado');
    }
  } catch (error) {
    console.error('Error al cerrar pool:', error);
  }
}

process.on('SIGINT', async () => {
  console.log('\nCerrando conexiones...');
  await closePool();
  process.exit(0);
});

module.exports = {
  initializeConnection,
  getConnection,
  executeQuery,
  closePool
};
