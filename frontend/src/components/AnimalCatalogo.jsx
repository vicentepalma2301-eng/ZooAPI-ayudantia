// Catálogo de Animales - actividad de la ayudantía 4.
// Mismo patrón que EspecieList/RecintoList: useState + useEffect + fetch a la API.
// Agrega además filtros por especie y recinto: cada vez que cambian, se vuelve a pedir la lista al backend.

import { useState, useEffect } from 'react';
import { API_URL } from '../api/config';

function AnimalCatalogo() {
  const [animales, setAnimales] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [recintos, setRecintos] = useState([]);
  const [especieId, setEspecieId] = useState('');
  const [recintoId, setRecintoId] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [promedio, setPromedio] = useState(null);
  const [autor, setAutor] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [errorComentario, setErrorComentario] = useState(null);

  // Pide los animales al backend, aplicando los filtros seleccionados.
  // Se vuelve a ejecutar cada vez que cambian especieId o recintoId.
  useEffect(() => {
    const params = new URLSearchParams();
    if (especieId) params.append('especieId', especieId);
    if (recintoId) params.append('recintoId', recintoId);

    fetch(`${API_URL}/animals?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar los animales');
        return res.json();
      })
      .then((data) => {
        setAnimales(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudo conectar con el servidor');
        setCargando(false);
      });
  }, [especieId, recintoId]);

  // Carga las especies y los recintos para llenar las opciones de los filtros (una sola vez).
  useEffect(() => {
    fetch(`${API_URL}/especies`)
      .then((res) => res.json())
      .then(setEspecies)
      .catch(() => {});

    fetch(`${API_URL}/recintos`)
      .then((res) => res.json())
      .then(setRecintos)
      .catch(() => {});
  }, []);

  // Cuando se selecciona un animal, pide su detalle de comentarios al backend.
  useEffect(() => {
    if (!animalSeleccionado) return;

    fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar los comentarios');
        return res.json();
      })
      .then((data) => {
        setComentarios(data.comentarios);
        setPromedio(data.averageRating);
      })
      .catch(() => {
        setComentarios([]);
        setPromedio(null);
      });
  }, [animalSeleccionado]);

  // Envía un comentario nuevo al backend. Si la validación de Zod falla (p. ej.
  // comentario muy corto), la API responde 400 y mostramos sus detalles.
  const crearComentario = (e) => {
    e.preventDefault();
    setErrorComentario(null);

    fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autor, calificacion, comentario }),
    })
      .then((res) =>
        res.json().then((data) => {
          if (!res.ok) throw data;
          return data;
        })
      )
      .then(() => {
        setAutor('');
        setComentario('');
        setCalificacion(5);

        return fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`).then((res) => res.json());
      })
      .then((data) => {
        setComentarios(data.comentarios);
        setPromedio(data.averageRating);
      })
      .catch((err) => {
        const detalles = err?.detalles?.map((d) => d.mensaje).join(' ');
        setErrorComentario(detalles || err?.error || 'No se pudo crear el comentario');
      });
  };

  if (cargando) return <p>Cargando animales...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Animales</h2>

      <div>
        <label>
          Especie:{' '}
          <select value={especieId} onChange={(e) => setEspecieId(e.target.value)}>
            <option value="">Todas</option>
            {especies.map((especie) => (
              <option key={especie.id} value={especie.id}>
                {especie.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Recinto:{' '}
          <select value={recintoId} onChange={(e) => setRecintoId(e.target.value)}>
            <option value="">Todos</option>
            {recintos.map((recinto) => (
              <option key={recinto.id} value={recinto.id}>
                {recinto.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul>
        {animales.map((animal) => (
          <li key={animal.id}>
            <button type="button" onClick={() => setAnimalSeleccionado(animal)}>
              {animal.nombre} — {animal.edad} años — {animal.especie?.nombre} ({animal.recinto?.nombre})
            </button>
          </li>
        ))}
      </ul>

      {animalSeleccionado && (
        <div>
          <h3>Detalle de {animalSeleccionado.nombre}</h3>
          <p>
            Especie: {animalSeleccionado.especie?.nombre} — Recinto: {animalSeleccionado.recinto?.nombre}
          </p>
          <p>
            Edad: {animalSeleccionado.edad} años — Peso: {animalSeleccionado.peso ?? 'No registrado'} kg —{' '}
            {animalSeleccionado.disponible ? 'Disponible' : 'No disponible'}
          </p>

          <h4>Comentarios {promedio !== null ? `(promedio: ${promedio.toFixed(1)}★)` : ''}</h4>
          {comentarios.length === 0 ? (
            <p>Sin comentarios todavía.</p>
          ) : (
            <ul>
              {comentarios.map((item) => (
                <li key={item.id}>
                  <strong>{item.autor}</strong> ({'★'.repeat(item.calificacion)}) — {item.comentario}
                </li>
              ))}
            </ul>
          )}

          <h4>Deja tu comentario</h4>
          <form onSubmit={crearComentario}>
            <label>
              Autor:{' '}
              <input value={autor} onChange={(e) => setAutor(e.target.value)} required />
            </label>
            <label>
              Calificación:{' '}
              <select value={calificacion} onChange={(e) => setCalificacion(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
            </label>
            <label>
              Comentario:{' '}
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                required
              />
            </label>
            {errorComentario && <p style={{ color: 'red' }}>{errorComentario}</p>}
            <button type="submit">Agregar comentario</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AnimalCatalogo;