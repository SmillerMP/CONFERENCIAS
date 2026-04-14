const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Crear nueva categoría
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }

    const category = await Category.create(name.trim(), description || '');
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const category = await Category.getById(parseInt(id));
    
    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar categoría
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }

    const updated = await Category.update(parseInt(id), name.trim(), description || '');
    
    if (!updated) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const category = await Category.getById(parseInt(id));
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar categoría
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const deleted = await Category.delete(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
