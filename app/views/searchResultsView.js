import { navigate } from "../router.js";
import api from "../services/api.js";

const searchResultsView = {
  render: async () => {
    return `
      <div class="container" style="padding-top: 40px;">
        <header style="margin-bottom: 30px; display:flex; align-items:center; gap:15px;">
            <button class="btn-icon" id="btnBack" style="background:rgba(255,255,255,0.1); border:none; color:white; width:40px; height:40px; border-radius:50%; cursor:pointer;">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div>
                <h2>Resultados de búsqueda</h2>
                <p class="small" style="color:var(--text-muted)" id="searchSubtitle">Cargando...</p>
            </div>
        </header>

        <!-- GRID DE RESULTADOS -->
        <div id="resultsGrid" class="results-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
            <!-- SKELETON LOADERS -->
            ${[1,2,3].map(() => `
                <div class="card" style="height:200px; display:flex; align-items:center; justify-content:center; opacity:0.5;">
                    Cargando...
                </div>
            `).join('')}
        </div>
      </div>
    `;
  },

  attachEventListeners: async () => {
    // 1. Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const filters = {
        location: params.get('location') || '',
        sport: params.get('sport') || '',
        date: params.get('date') || '',
        time: params.get('time') || ''
    };

    // Botón volver
    document.getElementById('btnBack').addEventListener('click', () => {
        // Si hay historial vuelve, si no al home
        if(window.history.length > 1) window.history.back();
        else navigate('/');
    });

    document.getElementById('searchSubtitle').textContent = `Buscando en "${filters.location || 'Todas las zonas'}" para el ${filters.date}`;

    try {
        // 2. Llamada a la API
        const resultados = await api.searchComplejos(filters);
        
        const grid = document.getElementById('resultsGrid');
        grid.innerHTML = '';

        if (!resultados || resultados.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 50px;">
                    <div style="font-size: 3rem;">🔍</div>
                    <h3>No encontramos complejos</h3>
                    <p style="color:var(--text-muted)">Intenta cambiar la ubicación o el deporte.</p>
                    <button class="btn" style="margin-top:20px;" onclick="window.history.back()">Volver a buscar</button>
                </div>
            `;
            return;
        }

        // 3. Renderizar Tarjetas
        grid.innerHTML = resultados.map(complejo => {
            // Imagen por defecto si falla
            const imgUrl = complejo.url_imagen ? complejo.url_imagen : 'assets/images/futbol.jpg'; 
            
            return `
                <div class="card complex-card" style="padding:0; overflow:hidden; position:relative; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="height:140px; background-color:#1e293b; position:relative;">
                        <img src="${imgUrl}" alt="${complejo.nombre}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://placehold.co/600x400?text=Sin+Imagen'">
                        <div style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.7); padding:4px 8px; border-radius:4px; font-size:0.7rem; color:#4ade80; font-weight:bold;">
                            DISPONIBLE
                        </div>
                    </div>
                    
                    <div style="padding: 15px;">
                        <h3 style="font-size:1.1rem; margin-bottom:5px;">${complejo.nombre}</h3>
                        <div style="display:flex; align-items:center; gap:5px; color:var(--text-muted); font-size:0.85rem; margin-bottom:10px;">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${complejo.distrito_nombre}, ${complejo.provincia_nombre}
                        </div>
                        <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                            ${complejo.descripcion || 'Sin descripción disponible.'}
                        </p>
                        
                        <button class="btn btn-view-complex" data-id="${complejo.complejo_id}" style="width:100%;">
                            Ver Canchas
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // 4. Listeners para los botones "Ver Canchas"
        document.querySelectorAll('.btn-view-complex').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                // Pasamos los filtros de fecha/hora a la siguiente vista
                navigate(`/complejo/${id}?date=${filters.date}&time=${filters.time}`);
            });
        });

    } catch (e) {
        console.error(e);
        document.getElementById('resultsGrid').innerHTML = `<p style="color:red">Error al cargar resultados: ${e.message}</p>`;
    }
  }
};

export default searchResultsView;