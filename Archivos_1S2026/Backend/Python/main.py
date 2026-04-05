from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

app = FastAPI(
    title="API de Gestión de Tareas",
    description="API REST simple para gestionar tareas con operaciones CRUD completas",
    version="1.0.0"
)

# Modelos Pydantic
class TareaBase(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=100, description="Título de la tarea")
    descripcion: Optional[str] = Field(None, max_length=500, description="Descripción detallada")
    completada: bool = Field(default=False, description="Estado de completitud")

class TareaCrear(TareaBase):
    pass

class TareaActualizar(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)
    completada: Optional[bool] = None

class Tarea(TareaBase):
    id: str = Field(..., description="ID único de la tarea")
    fecha_creacion: datetime = Field(..., description="Fecha de creación")
    fecha_actualizacion: datetime = Field(..., description="Última actualización")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "titulo": "Completar proyecto FastAPI",
                "descripcion": "Crear una API REST con endpoints CRUD",
                "completada": False,
                "fecha_creacion": "2026-04-05T10:30:00",
                "fecha_actualizacion": "2026-04-05T10:30:00"
            }
        }

# Base de datos en memoria
tareas_db: dict[str, dict] = {}

# Endpoints

@app.get(
    "/",
    summary="Endpoint raíz",
    description="Retorna información básica de la API"
)
async def raiz():
    """Endpoint de bienvenida con información de la API"""
    return {
        "mensaje": "API de Gestión de Tareas",
        "version": "1.0.0",
        "endpoints": {
            "GET /": "Información de la API",
            "GET /tareas": "Listar todas las tareas",
            "GET /tareas/{id}": "Obtener una tarea específica",
            "POST /tareas": "Crear nueva tarea",
            "PUT /tareas/{id}": "Actualizar tarea completa",
            "DELETE /tareas/{id}": "Eliminar tarea"
        },
        "documentacion": "/docs"
    }

@app.get(
    "/tareas",
    response_model=List[Tarea],
    summary="Listar tareas",
    description="Obtiene todas las tareas registradas"
)
async def listar_tareas(
    completada: Optional[bool] = None,
    limite: int = 100
):
    """
    Retorna lista de tareas con filtros opcionales:
    - **completada**: filtrar por estado (true/false)
    - **limite**: número máximo de resultados
    """
    tareas = list(tareas_db.values())
    
    if completada is not None:
        tareas = [t for t in tareas if t["completada"] == completada]
    
    return tareas[:limite]

@app.get(
    "/tareas/{tarea_id}",
    response_model=Tarea,
    summary="Obtener tarea",
    description="Obtiene una tarea específica por su ID"
)
async def obtener_tarea(tarea_id: str):
    """Retorna una tarea específica por ID"""
    if tarea_id not in tareas_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarea con ID '{tarea_id}' no encontrada"
        )
    return tareas_db[tarea_id]

@app.post(
    "/tareas",
    response_model=Tarea,
    status_code=status.HTTP_201_CREATED,
    summary="Crear tarea",
    description="Crea una nueva tarea"
)
async def crear_tarea(tarea: TareaCrear):
    """Crea una nueva tarea y retorna los datos completos"""
    tarea_id = str(uuid.uuid4())
    fecha_actual = datetime.now()
    
    nueva_tarea = {
        "id": tarea_id,
        "titulo": tarea.titulo,
        "descripcion": tarea.descripcion,
        "completada": tarea.completada,
        "fecha_creacion": fecha_actual,
        "fecha_actualizacion": fecha_actual
    }
    
    tareas_db[tarea_id] = nueva_tarea
    return nueva_tarea

@app.put(
    "/tareas/{tarea_id}",
    response_model=Tarea,
    summary="Actualizar tarea",
    description="Actualiza una tarea existente (parcial o completa)"
)
async def actualizar_tarea(tarea_id: str, tarea_actualizada: TareaActualizar):
    """Actualiza los campos especificados de una tarea"""
    if tarea_id not in tareas_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarea con ID '{tarea_id}' no encontrada"
        )
    
    tarea_existente = tareas_db[tarea_id]
    datos_actualizados = tarea_actualizada.model_dump(exclude_unset=True)
    
    if not datos_actualizados:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe proporcionar al menos un campo para actualizar"
        )
    
    for campo, valor in datos_actualizados.items():
        tarea_existente[campo] = valor
    
    tarea_existente["fecha_actualizacion"] = datetime.now()
    tareas_db[tarea_id] = tarea_existente
    
    return tarea_existente

@app.delete(
    "/tareas/{tarea_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar tarea",
    description="Elimina una tarea por su ID"
)
async def eliminar_tarea(tarea_id: str):
    """Elimina una tarea de forma permanente"""
    if tarea_id not in tareas_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarea con ID '{tarea_id}' no encontrada"
        )
    
    del tareas_db[tarea_id]
    return None

# Health check endpoint
@app.get("/health", include_in_schema=False)
async def health_check():
    """Endpoint para verificar el estado de la aplicación"""
    return {"status": "healthy", "tareas_totales": len(tareas_db)}
