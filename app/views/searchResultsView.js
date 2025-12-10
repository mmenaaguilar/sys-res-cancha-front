import { navigate } from "../router.js";
import api from "../services/api.js";
import { UserTopNav } from "../components/UserTopNav.js";
import { getAbsoluteImageUrl } from "../utils/helpers.js";
import { toast } from "../utils/toast.js";

const searchResultsView = {
    state: {
        deportes: [],
        flatpickrInstance: null,
        favoritesMap: {} // ✅ Estado para saber qué es favorito
    },

    render: async () => {
        const user = api.getUser();

        if (!document.getElementById('flatpickr-css')) {
            const link = document.createElement('link'); link.id = 'flatpickr-css'; link.rel = 'stylesheet'; link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css'; document.head.appendChild(link);
            const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/flatpickr'; document.head.appendChild(script);
        }

        setTimeout(() => {
            const nav = document.getElementById('searchTopNav');
            if(nav) { nav.innerHTML = UserTopNav.render('search', user); UserTopNav.attachListeners(); }
        }, 0);

        let timeOptions = '<option value="">Cualquier hora</option>';
        for (let i = 6; i <= 23; i++) {
            const h = i.toString().padStart(2, '0');
            timeOptions += `<option value="${h}:00">${h}:00</option><option value="${h}:30">${h}:30</option>`;
        }

        return `
            <div id="searchTopNav"></div>
            
            <div class="search-page fade-in">
                <!-- HEADER -->
                <section class="search-header">
                    <div class="container-fluid search-container">
                        <div class="header-text">
                            <h1>Resultados de Búsqueda</h1>
                            <p>Encuentra y reserva tu cancha ideal al instante.</p>
                        </div>
                        
                        <form id="mainSearchForm" class="search-bar-classic">
                            <div class="search-group location-group">
                                <div class="search-input-wrapper">
                                    <label>Departamento</label>
                                    <select name="department" id="selDep" class="input-classic">
                                        <option value="">Todo</option>
                                    </select>
                                </div>
                                <div class="search-divider"></div>
                                <div class="search-input-wrapper">
                                    <label>Provincia</label>
                                    <select name="province" id="selProv" class="input-classic" disabled>
                                        <option value="">-</option>
                                    </select>
                                </div>
                                <div class="search-divider"></div>
                                <div class="search-input-wrapper">
                                    <label>Distrito</label>
                                    <select name="district" id="selectDistrito" class="input-classic" disabled>
                                        <option value="">-</option>
                                    </select>
                                </div>
                            </div>

                            <div class="search-group filters-group">
                                <div class="search-input-wrapper">
                                    <label>Deporte</label>
                                    <select name="sport" id="selectDeporte" class="input-classic">
                                        <option value="">Cualquiera</option>
                                    </select>
                                </div>
                                <div class="search-divider"></div>
                                <div class="search-input-wrapper">
                                    <label>Fecha</label>
                                    <input type="text" name="date" id="inputDate" class="input-classic" placeholder="Hoy" required>
                                </div>
                                <div class="search-divider mobile-hidden"></div>
                                <div class="search-input-wrapper mobile-hidden">
                                    <label>Hora</label>
                                    <select name="time" id="inputTime" class="input-classic">${timeOptions}</select>
                                </div>
                            </div>

                            <button type="submit" class="btn-search-classic">
                                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                <span>BUSCAR</span>
                            </button>
                        </form>
                    </div>
                </section>

                <!-- RESULTADOS -->
                <section class="results-body container">
                    <div id="loadingIndicator" style="display:none; text-align:center; padding: 80px;">
                        <div class="spinner"></div>
                        <p style="margin-top:15px; color:#475569; font-weight:500;">Buscando canchas...</p>
                    </div>
                    
                    <div id="resultsGrid" class="complex-grid-view">
                        <div class="empty-start">
                            <div class="icon-placeholder">
                                <svg width="60" height="60" fill="none" stroke="#94a3b8" stroke-width="1.5" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <h3>¿Dónde quieres jugar?</h3>
                            <p>Selecciona una ubicación arriba para ver las mejores canchas.</p>
                        </div>
                    </div>
                </section>
            </div>
            
            <style>
                /* ESTILOS INCORPORADOS */
                .search-page { background-color: #f8fafc; min-height: 100vh; color: #0f172a; }
                .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
                .container-fluid { max-width: 1280px; margin: 0 auto; padding: 0 20px; }

                .search-header { background: #0f172a; padding: 2rem 0 5rem; color: white; position: relative; }
                .header-text { text-align: center; margin-bottom: 1.5rem; }
                .header-text h1 { font-size: 1.8rem; margin: 0; font-weight: 800; color: white; }
                .header-text p { color: #94a3b8; margin: 5px 0 0; font-size: 0.95rem; }

                .search-bar-classic {
                    background: white; border-radius: 12px; padding: 8px;
                    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
                    box-shadow: 0 10px 30px -5px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
                }
                .search-group {
                    display: flex; align-items: center; flex: 1;
                    background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;
                    padding: 0 10px; min-width: 200px;
                }
                .search-input-wrapper { flex: 1; padding: 10px 5px; display: flex; flex-direction: column; justify-content: center; }
                .search-input-wrapper label { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px; letter-spacing: 0.5px; }
                .input-classic { border: none; background: transparent; width: 100%; outline: none; font-size: 0.9rem; font-weight: 600; color: #0f172a; padding: 0; cursor: pointer; font-family: inherit; }
                .search-divider { width: 1px; height: 24px; background: #cbd5e1; margin: 0 8px; }

                .btn-search-classic {
                    background: #2563eb; color: white; border: none; padding: 0 24px; height: 50px;
                    border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;
                    transition: background 0.2s; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
                }
                .btn-search-classic:hover { background: #1d4ed8; }

                .results-body { margin-top: -40px; position: relative; z-index: 10; padding-bottom: 60px; }
                
                .complex-grid-view {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 25px;
                }

                .result-card-vertical {
                    background: white; border-radius: 16px; overflow: hidden;
                    border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;
                    cursor: pointer; position: relative;
                }
                .result-card-vertical:hover {
                    transform: translateY(-5px); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.1); border-color: #cbd5e1;
                }

                .card-img-top { height: 180px; position: relative; background: #e2e8f0; overflow: hidden; }
                .card-img-top img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
                .result-card-vertical:hover .card-img-top img { transform: scale(1.05); }

                .badge-district {
                    position: absolute; top: 12px; left: 12px;
                    background: #0f172a; color: white; padding: 4px 10px; border-radius: 6px;
                    font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                /* ✅ BOTÓN FAVORITO FLOTANTE */
                .btn-fav-float {
                    position: absolute; top: 10px; right: 10px;
                    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(4px);
                    width: 32px; height: 32px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    border: none; cursor: pointer; color: #94a3b8; /* Gris por defecto */
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: all 0.2s; z-index: 5;
                }
                .btn-fav-float:hover { transform: scale(1.1); background: white; }
                .btn-fav-float.active { color: #ef4444; } /* Rojo cuando es favorito */

                .card-body-vertical { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; }
                .card-header-flex { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
                .card-title { margin: 0; font-size: 1.15rem; font-weight: 800; color: #0f172a; line-height: 1.2; }
                
                .btn-map-icon {
                    width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; color: #64748b;
                    display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0;
                }
                .btn-map-icon:hover { background: #0f172a; color: white; }

                .card-address { 
                    font-size: 0.9rem; color: #475569; margin: 0 0 1.5rem; 
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
                    min-height: 2.7em;
                }

                .card-footer { margin-top: auto; }
                
                .btn-view-details {
                    width: 100%; background: white; border: 2px solid #0f172a; color: #0f172a;
                    padding: 10px; border-radius: 8px; font-weight: 700; cursor: pointer;
                    transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
                    text-transform: uppercase; font-size: 0.8rem;
                }
                .btn-view-details:hover { background: #0f172a; color: white; }

                .empty-start {
                    grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; 
                    border-radius: 16px; border: 1px dashed #cbd5e1;
                }
                .icon-placeholder { margin-bottom: 15px; opacity: 0.5; }
                .spinner { width: 40px; height: 40px; border: 4px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* ANIMACIÓN PULSO CORAZÓN */
                @keyframes pulseHeart { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
                .pulse { animation: pulseHeart 0.3s ease-out; }

                @media (max-width: 900px) {
                    .search-bar-classic { flex-direction: column; padding: 15px; gap: 12px; }
                    .search-group { width: 100%; flex-direction: column; align-items: stretch; }
                    .search-input-wrapper { border-bottom: 1px solid #e2e8f0; }
                    .search-input-wrapper:last-child { border-bottom: none; }
                    .search-divider { display: none; }
                    .btn-search-classic { width: 100%; justify-content: center; margin-top: 5px; }
                    .mobile-hidden { display: none; }
                    .complex-grid-view { grid-template-columns: 1fr; }
                }
                .fade-in-up { animation: fadeInUp 0.4s ease-out forwards; opacity: 0; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        `;
    },

    attachEventListeners: async () => {
        const initCalendar = () => {
            if (typeof flatpickr === 'undefined') { setTimeout(initCalendar, 100); return; }
            const today = new Date();
            searchResultsView.state.flatpickrInstance = flatpickr("#inputDate", {
                locale: { firstDayOfWeek: 1 },
                dateFormat: "Y-m-d", minDate: "today", defaultDate: "today", disableMobile: "true"
            });
        };
        initCalendar();

        await searchResultsView.loadInitialData();

        const elDep = document.getElementById('selDep');
        const elProv = document.getElementById('selProv');
        const elDist = document.getElementById('selectDistrito');

        elDep.addEventListener('change', async (e) => {
            const depId = e.target.value;
            elProv.innerHTML = '<option value="">Cargando...</option>'; elProv.disabled = true;
            elDist.innerHTML = '<option value="">-</option>'; elDist.disabled = true;
            if (depId) {
                const provs = await api.getProvincias(depId);
                elProv.innerHTML = '<option value="">Todas</option>' + provs.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
                elProv.disabled = false;
            } else { elProv.innerHTML = '<option value="">-</option>'; }
        });

        elProv.addEventListener('change', async (e) => {
            const provId = e.target.value;
            elDist.innerHTML = '<option value="">Cargando...</option>'; elDist.disabled = true;
            if (provId) {
                const dists = await api.getDistritos(provId);
                elDist.innerHTML = '<option value="">Todos</option>' + dists.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
                elDist.disabled = false;
            } else { elDist.innerHTML = '<option value="">-</option>'; }
        });

        const urlParams = new URLSearchParams(window.location.search);
        const locParam = urlParams.get('location');
        if (locParam) {
            const detalle = await api.getDetalleUbicacion(locParam);
            if (detalle) {
                elDep.value = detalle.departamento_id;
                const provs = await api.getProvincias(detalle.departamento_id);
                elProv.innerHTML = '<option value="">Todas</option>' + provs.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
                elProv.disabled = false;
                elProv.value = detalle.provincia_id;
                const dists = await api.getDistritos(detalle.provincia_id);
                elDist.innerHTML = '<option value="">Todos</option>' + dists.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
                elDist.disabled = false;
                elDist.value = detalle.distrito_id;
                
                const filters = { location: locParam, sport: urlParams.get('sport') || '', date: urlParams.get('date') || '', time: '' };
                await searchResultsView.performSearch(filters);
            } else {
                const filters = { location: locParam, sport: urlParams.get('sport') || '', date: urlParams.get('date') || '', time: '' };
                await searchResultsView.performSearch(filters);
            }
        }

        document.getElementById('mainSearchForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            await searchResultsView.performSearch(Object.fromEntries(formData.entries()));
        });
    },

    loadInitialData: async () => {
        try {
            const [deps, deportes] = await Promise.all([api.getDepartamentos(), api.getSports()]);
            const elDep = document.getElementById('selDep');
            if(elDep) elDep.innerHTML = '<option value="">Todo el país</option>' + deps.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
            const elSport = document.getElementById('selectDeporte');
            if(elSport && deportes.length) elSport.innerHTML = '<option value="">Cualquiera</option>' + deportes.map(d => `<option value="${d.value}">${d.label}</option>`).join('');
        } catch (e) { console.error(e); }
    },

    performSearch: async (filters) => {
        const grid = document.getElementById('resultsGrid');
        const loader = document.getElementById('loadingIndicator');
        grid.style.display = 'none'; loader.style.display = 'block';

        try {
            // ✅ CARGA PARALELA: Busqueda + Favoritos
            const [response, favs] = await Promise.all([
                api.searchComplejos(filters),
                api.isLoggedIn() ? api.getMyFavorites() : Promise.resolve({})
            ]);
            
            // Guardamos mapa de favoritos
            searchResultsView.state.favoritesMap = favs;

            let resultados = [];
            if (Array.isArray(response)) resultados = response;
            else if (response?.data) resultados = response.data;

            loader.style.display = 'none';
            grid.style.display = 'grid'; 

            if (resultados.length === 0) {
                grid.style.display = 'block'; 
                grid.innerHTML = `<div class="empty-start"><div class="icon-placeholder"><svg width="60" height="60" fill="none" stroke="#94a3b8" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div><h3>Sin resultados</h3><p>Intenta ampliar la búsqueda a toda la provincia o departamento.</p></div>`;
                return;
            }

            grid.innerHTML = resultados.map(complejo => searchResultsView.renderCard(complejo)).join('');
            
            searchResultsView.attachCardEvents();

        } catch (error) {
            loader.style.display = 'none'; grid.style.display = 'block';
            grid.innerHTML = `<div style="color:#ef4444; text-align:center;">Error: ${error.message}</div>`;
        }
    },

    renderCard: (complejo) => {
        const img = getAbsoluteImageUrl(complejo.url_imagen);
        const mapButton = complejo.url_map ? `<a href="${complejo.url_map}" target="_blank" class="btn-map-icon" onclick="event.stopPropagation()"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></a>` : '';
        const id = complejo.complejo_id || complejo.id;

        // ✅ LÓGICA DE FAVORITO
        const favId = searchResultsView.state.favoritesMap[id];
        const isFav = !!favId;
        
        const heartEmpty = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
        const heartFull = `<svg width="20" height="20" fill="#ef4444" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

        return `
            <article class="result-card-vertical fade-in-up" onclick="window.router.navigate('/complejo/${id}')">
                <div class="card-img-top">
                    <img src="${img}" alt="${complejo.nombre}" loading="lazy" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect fill=\'%23e2e8f0\' width=\'400\' height=\'300\'/%3E%3C/svg%3E'">
                    <span class="badge-district">${complejo.distrito_nombre || 'Disponible'}</span>
                    
                    <!-- ✅ BOTÓN FLOTANTE DE FAVORITO -->
                    <button class="btn-fav-float ${isFav ? 'active' : ''}" 
                            data-id="${id}" 
                            data-favid="${favId || ''}"
                            onclick="event.stopPropagation()">
                        ${isFav ? heartFull : heartEmpty}
                    </button>
                </div>
                <div class="card-body-vertical">
                    <div class="card-header-flex">
                        <h3 class="card-title">${complejo.nombre}</h3>
                        ${mapButton}
                    </div>
                    <p class="card-address">${complejo.direccion || complejo.direccion_detalle || 'Dirección no especificada'}</p>
                    <div class="card-footer">
                        <button class="btn-view-details" data-id="${id}">Ver Canchas</button>
                    </div>
                </div>
            </article>
        `;
    },

    attachCardEvents: () => {
        document.querySelectorAll('.btn-view-details').forEach(btn => btn.addEventListener('click', (e) => {
            e.stopPropagation(); navigate(`/complejo/${btn.dataset.id}`);
        }));
        
        document.querySelectorAll('.btn-map-icon').forEach(btn => btn.addEventListener('click', (e) => e.stopPropagation()));

        // ✅ MANEJO DEL CLIC EN FAVORITO
        document.querySelectorAll('.btn-fav-float').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!api.isLoggedIn()) { toast.info("Inicia sesión para guardar favoritos"); return; }

                const complejoId = btn.dataset.id;
                const favId = btn.dataset.favid;
                const isFav = !!favId;

                btn.classList.add('pulse');
                setTimeout(() => btn.classList.remove('pulse'), 300);

                try {
                    if (isFav) {
                        await api.removeFavorite(favId);
                        delete searchResultsView.state.favoritesMap[complejoId];
                        btn.innerHTML = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
                        btn.dataset.favid = "";
                        btn.classList.remove('active');
                        toast.success("Eliminado");
                    } else {
                        const newFavId = await api.addFavorite(complejoId);
                        searchResultsView.state.favoritesMap[complejoId] = newFavId;
                        btn.innerHTML = `<svg width="20" height="20" fill="#ef4444" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
                        btn.dataset.favid = newFavId;
                        btn.classList.add('active');
                        toast.success("Guardado");
                    }
                } catch (err) { console.error(err); toast.error("Error al actualizar"); }
            });
        });
    }
};

export default searchResultsView;