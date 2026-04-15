-- ============================================================
-- CONFIGURACIÓN BASE
-- Ejecutar conectado como MOVIE_USER
-- ============================================================

SET SERVEROUTPUT ON;
WHENEVER SQLERROR EXIT SQL.SQLCODE;

-- Forzar que este script se ejecute en el PDB FREEPDB1
ALTER SESSION SET CONTAINER = FREEPDB1;
ALTER SESSION SET CURRENT_SCHEMA = MOVIE_USER;

-- ============================================================

CREATE TABLE categories (
  category_id  NUMBER PRIMARY KEY,
  name         VARCHAR2(100) NOT NULL UNIQUE,
  description  VARCHAR2(500),
  created_at   DATE DEFAULT SYSDATE
);

CREATE TABLE movies (
  movie_id     NUMBER PRIMARY KEY,
  title        VARCHAR2(255) NOT NULL,
  description  VARCHAR2(2000),
  category_id  NUMBER,
  release_date DATE,
  director     VARCHAR2(100),
  duration     NUMBER,
  created_at   DATE DEFAULT SYSDATE,
  CONSTRAINT fk_movie_category
    FOREIGN KEY (category_id)
    REFERENCES categories(category_id)
    ON DELETE SET NULL
);

CREATE SEQUENCE categories_seq
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

CREATE SEQUENCE movies_seq
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;
COMMIT;