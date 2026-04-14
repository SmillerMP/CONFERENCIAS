-- ALTER SESSION SET CONTAINER = XEPDB1;
ALTER SESSION SET CONTAINER = FREEPDB1;

-- ============================================================
-- 1. Tabla CATEGORIES
-- ============================================================
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM dba_tables
  WHERE owner = 'MOVIE_USER' AND table_name = 'CATEGORIES';

  IF v_count = 0 THEN
    EXECUTE IMMEDIATE '
      CREATE TABLE movie_user.categories (
        category_id  NUMBER         PRIMARY KEY,
        name         VARCHAR2(100)  NOT NULL UNIQUE,
        description  VARCHAR2(500),
        created_at   DATE           DEFAULT SYSDATE
      )';
    -- El índice sobre name se crea por el UNIQUE constraint, no hace falta crearlo manualmente
  END IF;
END;
/

-- ============================================================
-- 2. Tabla MOVIES
-- ============================================================
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM dba_tables
  WHERE owner = 'MOVIE_USER' AND table_name = 'MOVIES';

  IF v_count = 0 THEN
    EXECUTE IMMEDIATE '
      CREATE TABLE movie_user.movies (
        movie_id     NUMBER         PRIMARY KEY,
        title        VARCHAR2(255)  NOT NULL,
        description  VARCHAR2(2000),
        category_id  NUMBER,
        release_date DATE,
        director     VARCHAR2(100),
        duration     NUMBER,
        created_at   DATE           DEFAULT SYSDATE,
        CONSTRAINT fk_movie_category
          FOREIGN KEY (category_id)
          REFERENCES movie_user.categories(category_id)
          ON DELETE SET NULL
      )';
    EXECUTE IMMEDIATE
      'CREATE INDEX movie_user.idx_movies_title        ON movie_user.movies(title)';
    EXECUTE IMMEDIATE
      'CREATE INDEX movie_user.idx_movies_category     ON movie_user.movies(category_id)';
    EXECUTE IMMEDIATE
      'CREATE INDEX movie_user.idx_movies_release_date ON movie_user.movies(release_date)';
  END IF;
END;
/

-- ============================================================
-- 3. Secuencia CATEGORIES_SEQ
-- ============================================================
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM dba_sequences
  WHERE sequence_owner = 'MOVIE_USER' AND sequence_name = 'CATEGORIES_SEQ';

  IF v_count = 0 THEN
    EXECUTE IMMEDIATE
      'CREATE SEQUENCE movie_user.categories_seq START WITH 1 INCREMENT BY 1 NOCYCLE';
  END IF;
END;
/

-- ============================================================
-- 4. Secuencia MOVIES_SEQ
-- ============================================================
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM dba_sequences
  WHERE sequence_owner = 'MOVIE_USER' AND sequence_name = 'MOVIES_SEQ';

  IF v_count = 0 THEN
    EXECUTE IMMEDIATE
      'CREATE SEQUENCE movie_user.movies_seq START WITH 1 INCREMENT BY 1 NOCYCLE';
  END IF;
END;
/

-- ============================================================
-- 5. Vista V_MOVIES_WITH_CATEGORIES
-- Sin ORDER BY — no está permitido en vistas Oracle
-- El orden se maneja en las queries de la API
-- ============================================================
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM dba_views
  WHERE owner = 'MOVIE_USER' AND view_name = 'V_MOVIES_WITH_CATEGORIES';

  IF v_count = 0 THEN
    EXECUTE IMMEDIATE '
      CREATE VIEW movie_user.v_movies_with_categories AS
        SELECT
          m.movie_id,
          m.title,
          m.description,
          m.director,
          m.duration,
          m.release_date,
          c.category_id,
          c.name       AS category_name,
          m.created_at
        FROM  movie_user.movies m
        LEFT JOIN movie_user.categories c
          ON m.category_id = c.category_id';
  END IF;
END;
/

-- ============================================================
-- 6. Procedimiento SP_GET_MOVIES_BY_CATEGORY
-- ============================================================
BEGIN
  EXECUTE IMMEDIATE '
    CREATE OR REPLACE PROCEDURE movie_user.sp_get_movies_by_category (
      p_category_id IN  NUMBER,
      p_cursor      OUT SYS_REFCURSOR
    ) AS
    BEGIN
      OPEN p_cursor FOR
        SELECT *
        FROM   movie_user.v_movies_with_categories
        WHERE  category_id = p_category_id
        ORDER BY created_at DESC;
    END sp_get_movies_by_category';
END;
/

COMMIT;
EXIT;