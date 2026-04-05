#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <signal.h>
#include <unistd.h>
#include <microhttpd.h>
#include <json-c/json.h>
#include <uuid/uuid.h>

#define PORT 8000
#define MAX_TAREAS 1000

// Estructura de Tarea
typedef struct {
    char id[37];
    char titulo[101];
    char descripcion[501];
    int completada;
    char fecha_creacion[30];
    char fecha_actualizacion[30];
    int activa;
} Tarea;

typedef struct {
    char *body;
    size_t body_size;
    int respondida;
} RequestContext;

// Base de datos en memoria
Tarea tareas_db[MAX_TAREAS];
int total_tareas = 0;
static volatile sig_atomic_t servidor_activo = 1;

static void manejar_senal(int senal) {
    (void)senal;
    servidor_activo = 0;
}

static void request_completed_callback(void *cls,
                                       struct MHD_Connection *connection,
                                       void **con_cls,
                                       enum MHD_RequestTerminationCode toe) {
    (void)cls;
    (void)connection;
    (void)toe;

    if (con_cls && *con_cls) {
        RequestContext *ctx = (RequestContext *)*con_cls;
        free(ctx->body);
        free(ctx);
        *con_cls = NULL;
    }
}

// Generar UUID
void generar_uuid(char *buffer) {
    uuid_t uuid;
    uuid_generate(uuid);
    uuid_unparse(uuid, buffer);
}

// Obtener timestamp actual
void obtener_timestamp(char *buffer) {
    time_t now = time(NULL);
    struct tm *t = gmtime(&now);
    strftime(buffer, 30, "%Y-%m-%dT%H:%M:%S", t);
}

void agregar_headers_cors(struct MHD_Response *response) {
    MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
    MHD_add_response_header(response, "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    MHD_add_response_header(response, "Access-Control-Allow-Headers", "Content-Type, Authorization");
    MHD_add_response_header(response, "Access-Control-Max-Age", "86400");
}

// Convertir tarea a JSON
struct json_object* tarea_to_json(Tarea *tarea) {
    struct json_object *jobj = json_object_new_object();
    json_object_object_add(jobj, "id", json_object_new_string(tarea->id));
    json_object_object_add(jobj, "titulo", json_object_new_string(tarea->titulo));
    json_object_object_add(jobj, "descripcion", json_object_new_string(tarea->descripcion));
    json_object_object_add(jobj, "completada", json_object_new_boolean(tarea->completada));
    json_object_object_add(jobj, "fecha_creacion", json_object_new_string(tarea->fecha_creacion));
    json_object_object_add(jobj, "fecha_actualizacion", json_object_new_string(tarea->fecha_actualizacion));
    return jobj;
}

// Buscar tarea por ID
Tarea* buscar_tarea(const char *id) {
    for (int i = 0; i < total_tareas; i++) {
        if (tareas_db[i].activa && strcmp(tareas_db[i].id, id) == 0) {
            return &tareas_db[i];
        }
    }
    return NULL;
}

// Endpoint raíz "/"
static enum MHD_Result endpoint_raiz(struct MHD_Connection *connection) {
    struct json_object *response = json_object_new_object();
    json_object_object_add(response, "mensaje", json_object_new_string("API de Gestión de Tareas"));
    json_object_object_add(response, "version", json_object_new_string("1.0.0"));
    
    struct json_object *endpoints = json_object_new_object();
    json_object_object_add(endpoints, "GET /", json_object_new_string("Información de la API"));
    json_object_object_add(endpoints, "GET /tareas", json_object_new_string("Listar todas las tareas"));
    json_object_object_add(endpoints, "GET /tareas/{id}", json_object_new_string("Obtener una tarea específica"));
    json_object_object_add(endpoints, "POST /tareas", json_object_new_string("Crear nueva tarea"));
    json_object_object_add(endpoints, "PUT /tareas/{id}", json_object_new_string("Actualizar tarea"));
    json_object_object_add(endpoints, "DELETE /tareas/{id}", json_object_new_string("Eliminar tarea"));
    json_object_object_add(response, "endpoints", endpoints);
    
    const char *json_str = json_object_to_json_string(response);
    struct MHD_Response *mhd_response = MHD_create_response_from_buffer(
        strlen(json_str), (void *)json_str, MHD_RESPMEM_MUST_COPY);
    MHD_add_response_header(mhd_response, "Content-Type", "application/json");
    agregar_headers_cors(mhd_response);
    enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_OK, mhd_response);
    MHD_destroy_response(mhd_response);
    json_object_put(response);
    return ret;
}

// GET /tareas - Listar todas las tareas
static enum MHD_Result listar_tareas(struct MHD_Connection *connection) {
    struct json_object *array = json_object_new_array();
    
    for (int i = 0; i < total_tareas; i++) {
        if (tareas_db[i].activa) {
            json_object_array_add(array, tarea_to_json(&tareas_db[i]));
        }
    }
    
    const char *json_str = json_object_to_json_string(array);
    struct MHD_Response *response = MHD_create_response_from_buffer(
        strlen(json_str), (void *)json_str, MHD_RESPMEM_MUST_COPY);
    MHD_add_response_header(response, "Content-Type", "application/json");
    agregar_headers_cors(response);
    enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
    MHD_destroy_response(response);
    json_object_put(array);
    return ret;
}

// GET /tareas/{id} - Obtener tarea específica
static enum MHD_Result obtener_tarea(struct MHD_Connection *connection, const char *tarea_id) {
    Tarea *tarea = buscar_tarea(tarea_id);
    
    if (tarea == NULL) {
        struct json_object *error = json_object_new_object();
        char detalle[100];
        snprintf(detalle, sizeof(detalle), "Tarea con ID '%s' no encontrada", tarea_id);
        json_object_object_add(error, "detail", json_object_new_string(detalle));
        
        const char *json_str = json_object_to_json_string(error);
        struct MHD_Response *response = MHD_create_response_from_buffer(
            strlen(json_str), (void *)json_str, MHD_RESPMEM_MUST_COPY);
        MHD_add_response_header(response, "Content-Type", "application/json");
        agregar_headers_cors(response);
        enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_NOT_FOUND, response);
        MHD_destroy_response(response);
        json_object_put(error);
        return ret;
    }
    
    struct json_object *jobj = tarea_to_json(tarea);
    const char *json_str = json_object_to_json_string(jobj);
    struct MHD_Response *response = MHD_create_response_from_buffer(
        strlen(json_str), (void *)json_str, MHD_RESPMEM_MUST_COPY);
    MHD_add_response_header(response, "Content-Type", "application/json");
    agregar_headers_cors(response);
    enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
    MHD_destroy_response(response);
    json_object_put(jobj);
    return ret;
}

// POST /tareas - Crear nueva tarea
static enum MHD_Result crear_tarea(struct MHD_Connection *connection,
                                   const char *body) {
    struct json_object *parsed = json_tokener_parse(body ? body : "");
    if (parsed == NULL) {
        const char *error = "{\"detail\":\"JSON inválido\"}";
        struct MHD_Response *response = MHD_create_response_from_buffer(
            strlen(error), (void *)error, MHD_RESPMEM_PERSISTENT);
        MHD_add_response_header(response, "Content-Type", "application/json");
        agregar_headers_cors(response);
        enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_BAD_REQUEST, response);
        MHD_destroy_response(response);
        return ret;
    }
    
    if (total_tareas >= MAX_TAREAS) {
        const char *error = "{\"detail\":\"Límite de tareas alcanzado\"}";
        struct MHD_Response *response = MHD_create_response_from_buffer(
            strlen(error), (void *)error, MHD_RESPMEM_PERSISTENT);
        MHD_add_response_header(response, "Content-Type", "application/json");
        agregar_headers_cors(response);
        enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_SERVICE_UNAVAILABLE, response);
        MHD_destroy_response(response);
        json_object_put(parsed);
        return ret;
    }
    
    Tarea *nueva_tarea = &tareas_db[total_tareas];
    generar_uuid(nueva_tarea->id);
    
    struct json_object *titulo_obj, *descripcion_obj, *completada_obj;
    json_object_object_get_ex(parsed, "titulo", &titulo_obj);
    json_object_object_get_ex(parsed, "descripcion", &descripcion_obj);
    json_object_object_get_ex(parsed, "completada", &completada_obj);
    
    if (titulo_obj) {
        strncpy(nueva_tarea->titulo, json_object_get_string(titulo_obj), 100);
        nueva_tarea->titulo[100] = '\0';
    } else {
        strcpy(nueva_tarea->titulo, "");
    }
    
    if (descripcion_obj) {
        strncpy(nueva_tarea->descripcion, json_object_get_string(descripcion_obj), 500);
        nueva_tarea->descripcion[500] = '\0';
    } else {
        strcpy(nueva_tarea->descripcion, "");
    }
    
    nueva_tarea->completada = completada_obj ? json_object_get_boolean(completada_obj) : 0;
    
    obtener_timestamp(nueva_tarea->fecha_creacion);
    strcpy(nueva_tarea->fecha_actualizacion, nueva_tarea->fecha_creacion);
    nueva_tarea->activa = 1;
    
    total_tareas++;
    
    struct json_object *response_obj = tarea_to_json(nueva_tarea);
    const char *json_str = json_object_to_json_string(response_obj);
    struct MHD_Response *response = MHD_create_response_from_buffer(
        strlen(json_str), (void *)json_str, MHD_RESPMEM_MUST_COPY);
    MHD_add_response_header(response, "Content-Type", "application/json");
    agregar_headers_cors(response);
    enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_CREATED, response);
    MHD_destroy_response(response);
    json_object_put(response_obj);
    json_object_put(parsed);
    
    return ret;
}

// PUT /tareas/{id} - Actualizar tarea
static enum MHD_Result actualizar_tarea(struct MHD_Connection *connection, 
                                        const char *tarea_id,
                                        const char *body) {
    Tarea *tarea = buscar_tarea(tarea_id);
    if (tarea == NULL) {
        const char *error = "{\"detail\":\"Tarea no encontrada\"}";
        struct MHD_Response *response = MHD_create_response_from_buffer(
            strlen(error), (void *)error, MHD_RESPMEM_PERSISTENT);
        MHD_add_response_header(response, "Content-Type", "application/json");
        agregar_headers_cors(response);
        enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_NOT_FOUND, response);
        MHD_destroy_response(response);
        return ret;
    }
    
    struct json_object *parsed = json_tokener_parse(body ? body : "");
    if (parsed == NULL) {
        const char *error = "{\"detail\":\"JSON inválido\"}";
        struct MHD_Response *response = MHD_create_response_from_buffer(
            strlen(error), (void *)error, MHD_RESPMEM_PERSISTENT);
        MHD_add_response_header(response, "Content-Type", "application/json");
        agregar_headers_cors(response);
        enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_BAD_REQUEST, response);
        MHD_destroy_response(response);
        return ret;
    }
    
    struct json_object *titulo_obj, *descripcion_obj, *completada_obj;
    if (json_object_object_get_ex(parsed, "titulo", &titulo_obj)) {
        strncpy(tarea->titulo, json_object_get_string(titulo_obj), 100);
        tarea->titulo[100] = '\0';
    }
    if (json_object_object_get_ex(parsed, "descripcion", &descripcion_obj)) {
        strncpy(tarea->descripcion, json_object_get_string(descripcion_obj), 500);
        tarea->descripcion[500] = '\0';
    }
    if (json_object_object_get_ex(parsed, "completada", &completada_obj)) {
        tarea->completada = json_object_get_boolean(completada_obj);
    }
    
    obtener_timestamp(tarea->fecha_actualizacion);
    
    struct json_object *response_obj = tarea_to_json(tarea);
    const char *json_str = json_object_to_json_string(response_obj);
    struct MHD_Response *response = MHD_create_response_from_buffer(
        strlen(json_str), (void *)json_str, MHD_RESPMEM_MUST_COPY);
    MHD_add_response_header(response, "Content-Type", "application/json");
    agregar_headers_cors(response);
    enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_OK, response);
    MHD_destroy_response(response);
    json_object_put(response_obj);
    json_object_put(parsed);
    
    return ret;
}

// DELETE /tareas/{id} - Eliminar tarea
static enum MHD_Result eliminar_tarea(struct MHD_Connection *connection, const char *tarea_id) {
    Tarea *tarea = buscar_tarea(tarea_id);
    
    if (tarea == NULL) {
        const char *error = "{\"detail\":\"Tarea no encontrada\"}";
        struct MHD_Response *response = MHD_create_response_from_buffer(
            strlen(error), (void *)error, MHD_RESPMEM_PERSISTENT);
        MHD_add_response_header(response, "Content-Type", "application/json");
        agregar_headers_cors(response);
        enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_NOT_FOUND, response);
        MHD_destroy_response(response);
        return ret;
    }
    
    tarea->activa = 0;
    
    struct MHD_Response *response = MHD_create_response_from_buffer(0, "", MHD_RESPMEM_PERSISTENT);
    agregar_headers_cors(response);
    enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_NO_CONTENT, response);
    MHD_destroy_response(response);
    return ret;
}

// GET /health - Health check
static enum MHD_Result health_check(struct MHD_Connection *connection) {
    int activas = 0;
    for (int i = 0; i < total_tareas; i++) {
        if (tareas_db[i].activa) activas++;
    }
    
    struct json_object *response = json_object_new_object();
    json_object_object_add(response, "status", json_object_new_string("healthy"));
    json_object_object_add(response, "tareas_totales", json_object_new_int(activas));
    
    const char *json_str = json_object_to_json_string(response);
    struct MHD_Response *mhd_response = MHD_create_response_from_buffer(
        strlen(json_str), (void *)json_str, MHD_RESPMEM_MUST_COPY);
    MHD_add_response_header(mhd_response, "Content-Type", "application/json");
    agregar_headers_cors(mhd_response);
    enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_OK, mhd_response);
    MHD_destroy_response(mhd_response);
    json_object_put(response);
    return ret;
}

// Handler principal de peticiones HTTP
static enum MHD_Result answer_to_connection(void *cls, struct MHD_Connection *connection,
                                           const char *url, const char *method,
                                           const char *version, const char *upload_data,
                                           size_t *upload_data_size, void **con_cls) {
    RequestContext *ctx = (RequestContext *)*con_cls;

    if (ctx == NULL) {
        ctx = calloc(1, sizeof(RequestContext));
        if (ctx == NULL) {
            return MHD_NO;
        }

        char ts[30];
        obtener_timestamp(ts);
        printf("[%s] %s %s\n", ts, method, url);

        *con_cls = ctx;
        return MHD_YES;
    }

    if (strcmp(method, "OPTIONS") == 0) {
        struct MHD_Response *response = MHD_create_response_from_buffer(0, "", MHD_RESPMEM_PERSISTENT);
        agregar_headers_cors(response);
        enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_NO_CONTENT, response);
        MHD_destroy_response(response);
        return ret;
    }

    if (strcmp(method, "POST") == 0 || strcmp(method, "PUT") == 0) {
        if (*upload_data_size > 0) {
            char *nuevo_body = realloc(ctx->body, ctx->body_size + *upload_data_size + 1);
            if (nuevo_body == NULL) {
                return MHD_NO;
            }

            ctx->body = nuevo_body;
            memcpy(ctx->body + ctx->body_size, upload_data, *upload_data_size);
            ctx->body_size += *upload_data_size;
            ctx->body[ctx->body_size] = '\0';

            *upload_data_size = 0;
            return MHD_YES;
        }

        if (ctx->respondida) {
            return MHD_YES;
        }
        ctx->respondida = 1;
    }
    
    // Endpoint raíz
    if (strcmp(url, "/") == 0 && strcmp(method, "GET") == 0) {
        return endpoint_raiz(connection);
    }
    
    // Health check
    if (strcmp(url, "/health") == 0 && strcmp(method, "GET") == 0) {
        return health_check(connection);
    }
    
    // GET /tareas
    if (strcmp(url, "/tareas") == 0 && strcmp(method, "GET") == 0) {
        return listar_tareas(connection);
    }
    
    // POST /tareas
    if (strcmp(url, "/tareas") == 0 && strcmp(method, "POST") == 0) {
        return crear_tarea(connection, ctx->body);
    }
    
    // Rutas con ID: /tareas/{id}
    if (strncmp(url, "/tareas/", 8) == 0) {
        const char *tarea_id = url + 8;
        
        if (strcmp(method, "GET") == 0) {
            return obtener_tarea(connection, tarea_id);
        }
        if (strcmp(method, "PUT") == 0) {
            return actualizar_tarea(connection, tarea_id, ctx->body);
        }
        if (strcmp(method, "DELETE") == 0) {
            return eliminar_tarea(connection, tarea_id);
        }
    }
    
    // 404 Not Found
    const char *not_found = "{\"detail\":\"Endpoint no encontrado\"}";
    struct MHD_Response *response = MHD_create_response_from_buffer(
        strlen(not_found), (void *)not_found, MHD_RESPMEM_PERSISTENT);
    MHD_add_response_header(response, "Content-Type", "application/json");
    agregar_headers_cors(response);
    enum MHD_Result ret = MHD_queue_response(connection, MHD_HTTP_NOT_FOUND, response);
    MHD_destroy_response(response);
    return ret;
}

int main() {
    struct MHD_Daemon *daemon;

    setvbuf(stdout, NULL, _IONBF, 0);

    signal(SIGINT, manejar_senal);
    signal(SIGTERM, manejar_senal);
    
    // Inicializar base de datos
    memset(tareas_db, 0, sizeof(tareas_db));
    
    daemon = MHD_start_daemon(MHD_USE_SELECT_INTERNALLY, PORT, NULL, NULL,
                             &answer_to_connection, NULL,
                             MHD_OPTION_NOTIFY_COMPLETED, request_completed_callback, NULL,
                             MHD_OPTION_END);
    
    if (daemon == NULL) {
        fprintf(stderr, "Error al iniciar el servidor en puerto %d\n", PORT);
        return 1;
    }
    
    printf("Servidor escuchando en http://0.0.0.0:%d\n", PORT);
    printf("API de Gestión de Tareas v1.0.0\n");
    printf("Presiona Ctrl+C para detener el servidor...\n");

    while (servidor_activo) {
        sleep(1);
    }
    
    MHD_stop_daemon(daemon);
    return 0;
}
