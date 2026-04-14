SET ECHO OFF
SET VERIFY OFF
SET SERVEROUTPUT ON
WHENEVER SQLERROR EXIT SQL.SQLCODE

PROMPT ==============================================
PROMPT Crear usuario de aplicacion 
PROMPT Ejecuta este script conectado como SYSDBA en XEPDB1
PROMPT ==============================================

ACCEPT APP_USER CHAR PROMPT 'DB_USER: '
ACCEPT APP_PASSWORD CHAR HIDE PROMPT 'DB_PASSWORD: '

DECLARE
  v_user_raw   VARCHAR2(128) := TRIM('&&APP_USER');
  v_pass_raw   VARCHAR2(256) := '&&APP_PASSWORD';
  v_user       VARCHAR2(128);
  v_count      NUMBER;
BEGIN
  v_user := UPPER(DBMS_ASSERT.SIMPLE_SQL_NAME(v_user_raw));

  SELECT COUNT(*)
    INTO v_count
    FROM dba_users
   WHERE username = v_user;

  IF v_count = 0 THEN
    EXECUTE IMMEDIATE
      'CREATE USER ' || v_user ||
      ' IDENTIFIED BY "' || REPLACE(v_pass_raw, '"', '""') || '"';
    DBMS_OUTPUT.PUT_LINE('[OK] Usuario creado: ' || v_user);
  ELSE
    DBMS_OUTPUT.PUT_LINE('[INFO] Usuario ya existe: ' || v_user);
  END IF;

  EXECUTE IMMEDIATE 'GRANT CREATE SESSION TO ' || v_user;
  EXECUTE IMMEDIATE 'GRANT CREATE TABLE, CREATE VIEW, CREATE SEQUENCE, CREATE PROCEDURE, CREATE TRIGGER TO ' || v_user;
  EXECUTE IMMEDIATE 'ALTER USER ' || v_user || ' QUOTA UNLIMITED ON USERS';

  DBMS_OUTPUT.PUT_LINE('[OK] Permisos y quota aplicados para: ' || v_user);
END;
/

UNDEFINE APP_USER
UNDEFINE APP_PASSWORD

PROMPT [SUCCESS] Script finalizado.
EXIT;
