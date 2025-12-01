import { navigate } from "../router.js";
import api from "../services/api.js";
import { UserTopNav } from "../components/UserTopNav.js";
import { getAbsoluteImageUrl } from "../utils/helpers.js";
import { toast } from "../utils/toast.js";

const searchResultsView = {
    state: {
        distritos: [],
        deportes: [],
        loading: false,
        favoritesMap: {}, // Mapa { complejo_id: favorito_id }
        flatpickrInstance: null
    },

    render: async () => {
        const user = api.getUser();

        // Inyectar Flatpickr si no existe
        if (!document.getElementById('flatpickr-css')) {
            const link = document.createElement('link'); link.id = 'flatpickr-css'; link.rel = 'stylesheet'; link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css'; document.head.appendChild(link);
            const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/flatpickr'; document.head.appendChild(script);
        }

        setTimeout(() => {
            const nav = document.getElementById('searchTopNav');
            if(nav) {
                nav.innerHTML = UserTopNav.render('search', user);
                UserTopNav.attachListeners();
            }
        }, 0);

        // Opciones de Hora (06:00 - 23:30)
        let timeOptions = '<option value="">Cualquier hora</option>';
        for (let i = 6; i <= 23; i++) {
            const h = i.toString().padStart(2, '0');
            timeOptions += `<option value="${h}:00">${h}:00</option>`;
            if (i !== 23) timeOptions += `<option value="${h}:30">${h}:30</option>`;
        }

        return `
            <div id="searchTopNav"></div>
            
            <div class="search-page fade-in">
                <section class="search-header">
                    <div class="container search-container">
                        <h1>Reserva tu Cancha</h1>
                        <p>Encuentra disponibilidad en tiempo real.</p>
                        
                        <form id="mainSearchForm" class="search-bar-wrapper">
                            <!-- Distrito -->
                            <div class="search-field">
                                <label>
                                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    Ubicación
                                </label>
                                <select name="location" id="selectDistrito" required>
                                    <option value="">Cargando...</option>
                                </select>
                            </div>

                            <div class="search-field">
                                <label>
                                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                                    Deporte
                                </label>
                                <select name="sport" id="selectDeporte">
                                    <option value="">Cualquiera</option>
                                </select>
                            </div>

                            <div class="search-field date-field-group">
                                <label>
                                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    Fecha
                                </label>
                                <input type="text" name="date" id="inputDate" placeholder="Seleccionar fecha" required>
                                <div class="date-shortcuts">
                                    <button type="button" id="btnToday" class="shortcut-chip">Hoy</button>
                                    <button type="button" id="btnTomorrow" class="shortcut-chip">Mañana</button>
                                </div>
                            </div>

                            <div class="search-field mobile-hidden">
                                <label>
                                    <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    Hora
                                </label>
                                <select name="time" id="inputTime">
                                    ${timeOptions}
                                </select>
                            </div>

                            <button type="submit" class="btn-search-action">
                                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                Buscar
                            </button>
                        </form>
                    </div>
                </section>

                <section class="results-body container">
                    <div id="loadingIndicator" style="display:none; text-align:center; padding: 60px;">
                        <div class="spinner"></div>
                        <p style="margin-top:15px; color:#475569; font-weight:500;">Buscando complejos disponibles...</p>
                    </div>

                    <div id="resultsGrid" class="complex-grid">
                        <div class="empty-start">
                            <svg width="60" height="60" fill="none" stroke="#94a3b8" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:15px; opacity:0.5;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            <h3>Explora Complejos</h3>
                            <p>Usa los filtros para encontrar tu lugar ideal.</p>
                        </div>
                    </div>
                </section>
            </div>
            
            <style>
                .spinner { width: 40px; height: 40px; border: 4px solid #cbd5e1; border-top-color: #0f172a; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
        `;
    },

    attachEventListeners: async () => {
        searchResultsView.loadOptions();

        // 1. Init Calendar
        const initCalendar = () => {
            if (typeof flatpickr === 'undefined') { setTimeout(initCalendar, 100); return; }
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            searchResultsView.state.flatpickrInstance = flatpickr("#inputDate", {
                locale: { firstDayOfWeek: 1 },
                dateFormat: "Y-m-d",
                minDate: "today",
                defaultDate: "today",
                disableMobile: "true"
            });

            document.getElementById('btnToday')?.addEventListener('click', () => searchResultsView.state.flatpickrInstance.setDate(today));
            document.getElementById('btnTomorrow')?.addEventListener('click', () => searchResultsView.state.flatpickrInstance.setDate(tomorrow));
        };
        initCalendar();

        // 2. Init Search from URL or Form
        const urlParams = new URLSearchParams(window.location.search);
        const locParam = urlParams.get('location');
        const sportParam = urlParams.get('sport');
        const dateParam = urlParams.get('date');

        if (locParam && dateParam) {
            // Pre-llenar y buscar
            setTimeout(() => {
                if(document.getElementById('selectDistrito')) document.getElementById('selectDistrito').value = locParam;
                if(document.getElementById('selectDeporte') && sportParam) document.getElementById('selectDeporte').value = sportParam;
                if(searchResultsView.state.flatpickrInstance) searchResultsView.state.flatpickrInstance.setDate(dateParam);
            }, 500); // Pequeño delay para que carguen opciones

            const filters = { location: locParam, sport: sportParam || '', date: dateParam, time: '' };
            await searchResultsView.performSearch(filters);
        }

        document.getElementById('mainSearchForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            await searchResultsView.performSearch(Object.fromEntries(formData.entries()));
        });
    },

    loadOptions: async () => {
        try {
            const [resDistritos, resDeportes] = await Promise.all([
                api.getActiveLocations(),
                api.getSports()
            ]);

            const distritos = Array.isArray(resDistritos) ? resDistritos : (resDistritos?.data || []);
            const deportes = Array.isArray(resDeportes) ? resDeportes : (resDeportes?.data || []);

            const selectDist = document.getElementById('selectDistrito');
            if (selectDist) {
                if (!distritos.length) selectDist.innerHTML = '<option value="">Sin ubicaciones</option>';
                else selectDist.innerHTML = '<option value="">Selecciona Distrito</option>' + 
                    distritos.map(d => `<option value="${d.distrito_id || d.id}">${d.nombre || d.distrito}</option>`).join('');
            }

            const selectSport = document.getElementById('selectDeporte');
            if (selectSport) {
                if (!deportes.length) selectSport.innerHTML = '<option value="">Cualquiera</option>';
                else selectSport.innerHTML = '<option value="">Todos los deportes</option>' + 
                    deportes.map(d => `<option value="${d.value}">${d.label}</option>`).join(''); // ✅ USA VALUE/LABEL
            }
        } catch (error) { console.error(error); }
    },

    performSearch: async (filters) => {
        const grid = document.getElementById('resultsGrid');
        const loader = document.getElementById('loadingIndicator');
        grid.style.display = 'none';
        loader.style.display = 'block';

        try {
            // Cargar búsqueda Y Favoritos (si está logueado)
            const [response, favs] = await Promise.all([
                api.searchComplejos(filters),
                api.isLoggedIn() ? api.getMyFavorites() : Promise.resolve({})
            ]);
            
            searchResultsView.state.favoritesMap = favs;

            let resultados = [];
            if (Array.isArray(response)) resultados = response;
            else if (response && Array.isArray(response.data)) resultados = response.data;
            else if (response && Array.isArray(response.result)) resultados = response.result;

            loader.style.display = 'none';
            grid.style.display = 'grid';

            if (resultados.length === 0) {
                grid.style.display = 'block'; 
                grid.innerHTML = `
                    <div class="empty-search" style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0; color: #1e293b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                        <svg width="48" height="48" fill="none" stroke="#cbd5e1" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:15px;"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <h3 style="color: #1e293b; margin: 0 0 8px; font-weight:700;">No encontramos resultados</h3>
                        <p style="color: #64748b; max-width:400px; margin:0 auto;">Intenta cambiar la fecha, el distrito o el deporte.</p>
                    </div>`;
                return;
            }

            grid.innerHTML = resultados.map(complejo => searchResultsView.renderCard(complejo)).join('');
            searchResultsView.attachCardEvents();

        } catch (error) {
            loader.style.display = 'none';
            grid.style.display = 'block';
            grid.innerHTML = `<div style="color:#ef4444; text-align:center;">Error: ${error.message}</div>`;
        }
    },

    renderCard: (complejo) => {
        const img = getAbsoluteImageUrl(complejo.url_imagen);
        const id = complejo.complejo_id || complejo.id;
        
        // Estado Favorito
        const favId = searchResultsView.state.favoritesMap[id];
        const isFav = !!favId;
        const heartIcon = isFav 
            ? `<svg width="20" height="20" fill="#ef4444" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
            : `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

        const mapButton = complejo.url_map 
            ? `<a href="${complejo.url_map}" target="_blank" class="btn-map-icon" title="Ver ubicación" onclick="event.stopPropagation()">
                 <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
               </a>` : '';

        return `
            <article class="result-card fade-in-up" onclick="window.router.navigate('/complejo/${id}')">
                <div class="card-img-box">
                    <img src="${img}" alt="${complejo.nombre}" loading="lazy" onerror="this.src='assets/images/default-stadium.jpg'">
                    <span class="badge-district">${complejo.distrito_nombre || 'Disponible'}</span>
                    
                    <button class="btn-fav-float ${isFav ? 'active' : ''}" data-id="${id}" data-favid="${favId || ''}" onclick="event.stopPropagation()">
                        ${heartIcon}
                    </button>
                </div>
                <div class="card-body">
                    <div class="card-header-flex">
                        <h3 class="card-title">${complejo.nombre}</h3>
                        ${mapButton}
                    </div>
                    <p class="card-address">${complejo.direccion || complejo.direccion_detalle || 'Dirección no especificada'}</p>
                    
                    <div class="card-footer">
                        <button class="btn-view-details" data-id="${id}">
                            Ver Canchas
                            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>
            </article>
        `;
    },

    attachCardEvents: () => {
        document.querySelectorAll('.btn-view-details').forEach(btn => btn.addEventListener('click', (e) => {
            e.stopPropagation(); navigate(`/complejo/${btn.dataset.id}`);
        }));

        // Lógica de Favorito
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
                        toast.success("Eliminado de favoritos");
                    } else {
                        const newFavId = await api.addFavorite(complejoId);
                        searchResultsView.state.favoritesMap[complejoId] = newFavId;
                        btn.innerHTML = `<svg width="20" height="20" fill="#ef4444" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
                        btn.dataset.favid = newFavId;
                        btn.classList.add('active');
                        toast.success("Añadido a favoritos");
                    }
                } catch (err) { console.error(err); toast.error("Error al actualizar favorito"); }
            });
        });
    }
};

export default searchResultsView;