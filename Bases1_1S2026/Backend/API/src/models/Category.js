const db = require('../db');

class Category {
  static async create(name, description = '') {
    const query = `
      INSERT INTO CATEGORIES (category_id, name, description, created_at)
      VALUES (CATEGORIES_SEQ.NEXTVAL, :name, :description, SYSDATE)
      RETURNING category_id INTO :newId
    `;
    
    let bindVars = {
      name: name,
      description: description,
      newId: { dir: 3, type: 2, maxSize: 40 }
    };

    try {
      const result = await db.executeQuery(query, bindVars);
      return {
        id: result.outBinds.newId[0],
        name: name,
        description: description
      };
    } catch (error) {
      throw new Error(`Error al crear categoría: ${error.message}`);
    }
  }

  static async getAll() {
    const query = `
      SELECT category_id as id, name, description, created_at
      FROM CATEGORIES
      ORDER BY created_at DESC
    `;
    
    try {
      const result = await db.executeQuery(query);
      return result.rows || [];
    } catch (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }
  }

  static async getById(id) {
    const query = `
      SELECT category_id as id, name, description, created_at
      FROM CATEGORIES
      WHERE category_id = :id
    `;
    
    try {
      const result = await db.executeQuery(query, [id]);
      return result.rows && result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Error al obtener categoría: ${error.message}`);
    }
  }

  static async update(id, name, description) {
    const query = `
      UPDATE CATEGORIES
      SET name = :name, description = :description
      WHERE category_id = :id
    `;
    
    try {
      const result = await db.executeQuery(query, { id, name, description });
      return result.rowsAffected > 0;
    } catch (error) {
      throw new Error(`Error al actualizar categoría: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `
      DELETE FROM CATEGORIES
      WHERE category_id = :id
    `;
    
    try {
      const result = await db.executeQuery(query, [id]);
      return result.rowsAffected > 0;
    } catch (error) {
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
  }
}

module.exports = Category;
