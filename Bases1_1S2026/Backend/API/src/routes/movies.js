const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Category = require('../models/Category');

// Crear nueva película
router.post('/', async (req, res) => {
  try {
    const { title, description, categoryId, releaseDate, director, duration } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'El título de la película es requerido' });
    }

    if (categoryId) {
      const category = await Category.getById(categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Categoría no encontrada' });
      }
    }

    const movie = await Movie.create(
      title.trim(),
      description || '',
      categoryId || null,
      releaseDate || null,
      director || '',
      duration || null
    );

    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las películas
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    let movies;
    if (search && search.trim() !== '') {
      movies = await Movie.search(search.trim());
    } else {
      movies = await Movie.getAll();
    }

    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener películas por categoría
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId || isNaN(categoryId)) {
      return res.status(400).json({ error: 'ID de categoría inválido' });
    }

    const category = await Category.getById(parseInt(categoryId));
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const movies = await Movie.getByCategory(parseInt(categoryId));
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener película por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const movie = await Movie.getById(parseInt(id));
    
    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar película
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, releaseDate, director, duration } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'El título de la película es requerido' });
    }

    if (categoryId) {
      const category = await Category.getById(categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Categoría no encontrada' });
      }
    }

    const updated = await Movie.update(
      parseInt(id),
      title.trim(),
      description || '',
      categoryId || null,
      releaseDate || null,
      director || '',
      duration || null
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    const movie = await Movie.getById(parseInt(id));
    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar película
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const deleted = await Movie.delete(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    res.json({ message: 'Película eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
