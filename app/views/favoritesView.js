import { navigate } from "../router.js";
import api from "../services/api.js";
import { UserTopNav } from "../components/UserTopNav.js";
import { getAbsoluteImageUrl } from "../utils/helpers.js";
import { toast } from "../utils/toast.js";

const favoritesView = {
    state: {
        favoritos: []
    },

    render: async () => {
        const user = api.getUser();
        if (!user) { navigate('/'); return ''; }

        setTimeout(() => {
            const nav = document.getElementById('favTopNav');
            if(nav) {
                nav.innerHTML = UserTopNav.render('favorites', user);
                UserTopNav.attachListeners();
            }
        }, 0);

        return `
            <div id="favTopNav"></div>
            
            <div class="favorites-page fade-in">
                <div class="container page-content">
                    
                    <div class="page-header">
                        <h1>Mis Favoritos</h1>
                        <p>Tus canchas preferidas listas para reservar.</p>
                    </div>

                    <div id="loadingIndicator" style="text-align:center; padding: 60px;">
                        <div class="spinner"></div>
                        <p style="margin-top:15px; color:#64748b;">Cargando tus favoritos...</p>
                    </div>

                    <!-- El Grid usará las clases compactas de favorites.css -->
                    <div id="favoritesGrid" class="favorites-grid" style="display:none;"></div>

                    <div id="emptyState" class="empty-state" style="display:none;">
                        <div class="empty-icon-bg">
                            <svg width="40" height="40" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </div>
                        <h3>Aún no tienes favoritos</h3>
                        <p>Explora complejos y dale al corazón para guardarlos aquí.</p>
                        <button class="btn-explore" id="btnGoExplore">Explorar Canchas</button>
                    </div>
                </div>
            </div>
            
            <style>
                .spinner { width: 40px; height: 40px; border: 4px solid #cbd5e1; border-top-color: #0f172a; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
        `;
    },

    attachEventListeners: async () => {
        document.getElementById('btnGoExplore')?.addEventListener('click', () => navigate('/search'));
        await favoritesView.loadFavorites();
    },

    loadFavorites: async () => {
        const grid = document.getElementById('favoritesGrid');
        const loader = document.getElementById('loadingIndicator');
        const empty = document.getElementById('emptyState');

        try {
            const lista = await api.getFavoritesList();
            console.log("📦 Favoritos cargados:", lista); // Revisa la consola F12 si las imagenes salen mal

            favoritesView.state.favoritos = lista;
            loader.style.display = 'none';

            if (!lista || lista.length === 0) {
                empty.style.display = 'flex';
                return;
            }

            grid.style.display = 'grid';
            grid.innerHTML = lista.map(item => favoritesView.renderCard(item)).join('');
            
            favoritesView.bindEvents();

        } catch (error) {
            console.error(error);
            loader.innerHTML = `<div style="color:#ef4444; text-align:center;">Error al cargar favoritos</div>`;
        }
    },

    renderCard: (item) => {
        // --- 1. Lógica de Nombres y Dirección ---
        const nombre = item.nombre || item.complejo_nombre || 'Complejo Deportivo';
        
        // Prioridad: Dirección exacta -> Distrito -> Mensaje por defecto
        let direccion = item.direccion || item.direccion_detalle;
        if (!direccion || direccion === 'Sin dirección') {
            direccion = item.distrito_nombre 
                ? `${item.distrito_nombre}` 
                : 'Ubicación por definir';
        }

        const distritoBadge = item.distrito_nombre || 'Favorito';
        const id = item.complejo_id;
        const favId = item.favorito_id;

        // --- 2. Lógica de Imagen ---
        
        // SVG Placeholder profesional (Icono de imagen gris sobre fondo claro)
        // Se usa encodeURIComponent para evitar errores de sintaxis en el HTML
        const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
        const placeholderSvg = `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 400 300'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3Cg transform='translate(175, 125) scale(2)'%3E${svgIcon}%3C/g%3E%3C/svg%3E`;

        let imgUrl = placeholderSvg; // Por defecto
        
        // Solo intentamos usar la URL si existe
        if (item.url_imagen && item.url_imagen.length > 5) {
            imgUrl = getAbsoluteImageUrl(item.url_imagen);
            // Si el helper devolvió la default-stadium que no existe, revertimos al SVG
            if (imgUrl.includes('default-stadium.jpg')) {
                imgUrl = placeholderSvg;
            }
        }

        // --- 3. Iconos y Botones ---
        const mapButton = item.url_map 
            ? `<a href="${item.url_map}" target="_blank" class="btn-map-icon" title="Ver ubicación" onclick="event.stopPropagation()">
                 <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
               </a>` : '';

        const heartFull = `<svg width="20" height="20" fill="#ef4444" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

        return `
            <article class="result-card fade-in-up" onclick="window.router.navigate('/complejo/${id}')">
                <div class="card-img-box">
                    <img src="${imgUrl}" alt="${nombre}" loading="lazy" 
                         onerror="this.onerror=null; this.src='${placeholderSvg}';">
                    
                    <span class="badge-district">${distritoBadge}</span>
                    
                    <button class="btn-fav-float active" 
                            data-favid="${favId}" 
                            data-name="${nombre}"
                            title="Quitar de favoritos"
                            onclick="event.stopPropagation()">
                        ${heartFull}
                    </button>
                </div>
                <div class="card-body">
                    <div class="card-header-flex">
                        <h3 class="card-title">${nombre}</h3>
                        ${mapButton}
                    </div>
                    <p class="card-address">
                        <svg width="14" height="14" fill="none" stroke="#64748b" stroke-width="2" viewBox="0 0 24 24" style="margin-right:4px; vertical-align:text-bottom;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${direccion}
                    </p>
                    
                    <div class="card-footer">
                        <button class="btn-view-details" data-id="${id}">
                            Ver Canchas
                        </button>
                    </div>
                </div>
            </article>
        `;
    },

    bindEvents: () => {
        document.querySelectorAll('.btn-view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigate(`/complejo/${btn.dataset.id}`);
            });
        });

               document.querySelectorAll('.btn-fav-float').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                const favId = btn.dataset.favid;
                const card = btn.closest('.result-card');

                try {
                    // 1. Feedback visual inmediato (Apagar el corazón)
                    btn.classList.remove('active');
                    btn.innerHTML = `<svg width="16" height="16" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
                    
                    // 2. Animación de "desvanecer" la tarjeta
                    card.style.transition = 'all 0.4s ease';
                    card.style.transform = 'scale(0.95)';
                    card.style.opacity = '0.5';

                    // 3. Llamada a la API
                    await api.removeFavorite(favId);
                    
                    // 4. Quitar del DOM
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    
                    // 5. Notificación Toast elegante
                    toast.success("Eliminado de favoritos");

                    // 6. Recargar lista si quedó vacía o limpiar DOM después de la animación
                    setTimeout(() => {
                        card.remove();
                        // Si no quedan tarjetas, mostrar el estado vacío
                        if (document.querySelectorAll('.result-card').length === 0) {
                            favoritesView.loadFavorites(); 
                        }
                    }, 400);

                } catch (err) {
                    console.error(err);
                    // Revertir si hay error
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                    btn.classList.add('active');
                    toast.error("No se pudo eliminar");
                }
            });
        });
    }
};

export default favoritesView;