const db = require('../db');

class Movie {
  static async create(title, description, categoryId, releaseDate, director, duration) {
    const query = `
      INSERT INTO MOVIES 
        (movie_id, title, description, category_id, release_date, director, duration, created_at)
      VALUES 
        (MOVIES_SEQ.NEXTVAL, :title, :description, :categoryId, :releaseDate, :director, :duration, SYSDATE)
      RETURNING movie_id INTO :newId
    `;
    
    let bindVars = {
      title: title,
      description: description,
      categoryId: categoryId,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      director: director,
      duration: duration,
      newId: { dir: 3, type: 2, maxSize: 40 }
    };

    try {
      const result = await db.executeQuery(query, bindVars);
      return {
        id: result.outBinds.newId[0],
        title: title,
        description: description,
        categoryId: categoryId,
        releaseDate: releaseDate,
        director: director,
        duration: duration
      };
    } catch (error) {
      throw new Error(`Error al crear película: ${error.message}`);
    }
  }

  static async getAll() {
    const query = `
      SELECT 
        m.movie_id as id,
        m.title,
        m.description,
        m.category_id as categoryId,
        c.name as categoryName,
        m.release_date as releaseDate,
        m.director,
        m.duration,
        m.created_at
      FROM MOVIES m
      LEFT JOIN CATEGORIES c ON m.category_id = c.category_id
      ORDER BY m.created_at DESC
    `;
    
    try {
      const result = await db.executeQuery(query);
      return result.rows || [];
    } catch (error) {
      throw new Error(`Error al obtener películas: ${error.message}`);
    }
  }

  static async getById(id) {
    const query = `
      SELECT 
        m.movie_id as id,
        m.title,
        m.description,
        m.category_id as categoryId,
        c.name as categoryName,
        m.release_date as releaseDate,
        m.director,
        m.duration,
        m.created_at
      FROM MOVIES m
      LEFT JOIN CATEGORIES c ON m.category_id = c.category_id
      WHERE m.movie_id = :id
    `;
    
    try {
      const result = await db.executeQuery(query, [id]);
      return result.rows && result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      throw new Error(`Error al obtener película: ${error.message}`);
    }
  }

  static async getByCategory(categoryId) {
    const query = `
      SELECT 
        m.movie_id as id,
        m.title,
        m.description,
        m.category_id as categoryId,
        c.name as categoryName,
        m.release_date as releaseDate,
        m.director,
        m.duration,
        m.created_at
      FROM MOVIES m
      LEFT JOIN CATEGORIES c ON m.category_id = c.category_id
      WHERE m.category_id = :categoryId
      ORDER BY m.created_at DESC
    `;
    
    try {
      const result = await db.executeQuery(query, [categoryId]);
      return result.rows || [];
    } catch (error) {
      throw new Error(`Error al obtener películas por categoría: ${error.message}`);
    }
  }

  static async update(id, title, description, categoryId, releaseDate, director, duration) {
    const query = `
      UPDATE MOVIES
      SET 
        title = :title,
        description = :description,
        category_id = :categoryId,
        release_date = :releaseDate,
        director = :director,
        duration = :duration
      WHERE movie_id = :id
    `;
    
    try {
      const result = await db.executeQuery(query, {
        id,
        title,
        description,
        categoryId,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        director,
        duration
      });
      return result.rowsAffected > 0;
    } catch (error) {
      throw new Error(`Error al actualizar película: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `
      DELETE FROM MOVIES
      WHERE movie_id = :id
    `;
    
    try {
      const result = await db.executeQuery(query, [id]);
      return result.rowsAffected > 0;
    } catch (error) {
      throw new Error(`Error al eliminar película: ${error.message}`);
    }
  }

  static async search(keyword) {
    const query = `
      SELECT 
        m.movie_id as id,
        m.title,
        m.description,
        m.category_id as categoryId,
        c.name as categoryName,
        m.release_date as releaseDate,
        m.director,
        m.duration,
        m.created_at
      FROM MOVIES m
      LEFT JOIN CATEGORIES c ON m.category_id = c.category_id
      WHERE UPPER(m.title) LIKE UPPER(:keyword)
         OR UPPER(m.description) LIKE UPPER(:keyword)
         OR UPPER(m.director) LIKE UPPER(:keyword)
      ORDER BY m.created_at DESC
    `;
    
    try {
      const result = await db.executeQuery(query, [`%${keyword}%`]);
      return result.rows || [];
    } catch (error) {
      throw new Error(`Error al buscar películas: ${error.message}`);
    }
  }
}

module.exports = Movie;
