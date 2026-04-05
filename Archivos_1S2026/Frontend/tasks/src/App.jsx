import { useState, useEffect } from 'react'
import { API_URL } from './config'

function App() {
  const [tareas, setTareas] = useState([])
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [filtro, setFiltro] = useState('all')
  const [cargando, setCargando] = useState(true)
  const [editandoId, setEditandoId] = useState(null)
  const [editTitulo, setEditTitulo] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')

  useEffect(() => {
    cargarTareas()
  }, [])

  const cargarTareas = async () => {
    try {
      setCargando(true)
      const response = await fetch(`${API_URL}/tareas`)
      const data = await response.json()
      setTareas(data)
    } catch (error) {
      console.error('Error al cargar tareas:', error)
    } finally {
      setCargando(false)
    }
  }

  const agregarTarea = async (e) => {
    e.preventDefault()
    if (!titulo.trim()) return

    try {
      const response = await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || null,
          completada: false
        })
      })
      const nuevaTarea = await response.json()
      setTareas([...tareas, nuevaTarea])
      setTitulo('')
      setDescripcion('')
    } catch (error) {
      console.error('Error al agregar tarea:', error)
    }
  }

  const toggleCompletada = async (id, completada) => {
    try {
      const response = await fetch(`${API_URL}/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completada: !completada })
      })
      const tareaActualizada = await response.json()
      setTareas(tareas.map(t => t.id === id ? tareaActualizada : t))
    } catch (error) {
      console.error('Error al actualizar tarea:', error)
    }
  }

  const eliminarTarea = async (id) => {
    try {
      await fetch(`${API_URL}/tareas/${id}`, { method: 'DELETE' })
      setTareas(tareas.filter(t => t.id !== id))
      if (editandoId === id) {
        cancelarEdicion()
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error)
    }
  }

  const iniciarEdicion = (tarea) => {
    setEditandoId(tarea.id)
    setEditTitulo(tarea.titulo)
    setEditDescripcion(tarea.descripcion || '')
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setEditTitulo('')
    setEditDescripcion('')
  }

  const guardarEdicion = async (id) => {
    if (!editTitulo.trim()) return

    try {
      const response = await fetch(`${API_URL}/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: editTitulo.trim(),
          descripcion: editDescripcion.trim() || null
        })
      })

      const tareaActualizada = await response.json()
      setTareas(tareas.map(t => t.id === id ? tareaActualizada : t))
      cancelarEdicion()
    } catch (error) {
      console.error('Error al guardar cambios:', error)
    }
  }

  const tareasFiltradas = tareas.filter(tarea => {
    if (filtro === 'pending') return !tarea.completada
    if (filtro === 'completed') return tarea.completada
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Gestor de Tareas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organiza tu día de forma simple y efectiva
          </p>
        </header>

        <form onSubmit={agregarTarea} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="¿Qué necesitas hacer?"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={100}
              className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition"
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition resize-none"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Tarea
            </button>
          </div>
        </form>

        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-md">
          <button
            onClick={() => setFiltro('all')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              filtro === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('pending')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              filtro === 'pending'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFiltro('completed')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              filtro === 'completed'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Completadas
          </button>
        </div>

        <div className="space-y-3">
          {cargando ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando tareas...</p>
            </div>
          ) : tareasFiltradas.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No hay tareas para mostrar</p>
            </div>
          ) : (
            tareasFiltradas.map(tarea => (
              <div
                key={tarea.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 flex items-start gap-4 group"
              >
                <button
                  onClick={() => toggleCompletada(tarea.id, tarea.completada)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    tarea.completada
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-600 dark:hover:border-purple-500'
                  }`}
                  aria-label={tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
                >
                  {tarea.completada && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  {editandoId === tarea.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitulo}
                        onChange={(e) => setEditTitulo(e.target.value)}
                        maxLength={100}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
                        placeholder="Título"
                      />
                      <textarea
                        value={editDescripcion}
                        onChange={(e) => setEditDescripcion(e.target.value)}
                        maxLength={500}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none resize-none"
                        placeholder="Descripción"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => guardarEdicion(tarea.id)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className={`text-lg font-semibold mb-1 ${
                        tarea.completada
                          ? 'line-through text-gray-400 dark:text-gray-600'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {tarea.titulo}
                      </h3>
                      {tarea.descripcion && (
                        <p className={`text-sm ${
                          tarea.completada
                            ? 'line-through text-gray-400 dark:text-gray-600'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {tarea.descripcion}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  {editandoId !== tarea.id && (
                    <button
                      onClick={() => iniciarEdicion(tarea)}
                      className="flex-shrink-0 w-8 h-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Editar tarea"
                    >
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={() => eliminarTarea(tarea.id)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Eliminar tarea"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App
