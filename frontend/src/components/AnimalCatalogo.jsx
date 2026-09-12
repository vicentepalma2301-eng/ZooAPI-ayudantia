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
            {animal.nombre} — {animal.edad} años — {animal.especie?.nombre} ({animal.recinto?.nombre})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AnimalCatalogo;