require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const moviesRouter = require('./routes/movies');
const categoriesRouter = require('./routes/categories');
const db = require('./db');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/movies', moviesRouter);
app.use('/api/categories', categoriesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    status: err.status || 500
  });
});

async function startServer() {
  try {
    await db.initializeConnection();
    console.log('[!] Conexión a base de datos establecida');

    app.listen(PORT, () => {
      console.log(`API ejecutándose en puerto ${PORT}`);
      console.log(`http://localhost:${PORT}/api/health`);
      console.log(`  POST   http://localhost:${PORT}/api/categories`);
      console.log(`  GET    http://localhost:${PORT}/api/categories`);
      console.log(`  POST   http://localhost:${PORT}/api/movies`);
      console.log(`  GET    http://localhost:${PORT}/api/movies`);
      console.log(`  GET    http://localhost:${PORT}/api/movies/:id`);
      console.log(`  GET    http://localhost:${PORT}/api/movies/category/:categoryId`);
    });
  } catch (error) {
    console.error('[!] Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
