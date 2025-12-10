import { navigate } from "../router.js";
import api from "../services/api.js";
import { UserTopNav } from "../components/UserTopNav.js";
import { getAbsoluteImageUrl, loadLeaflet, parseCoordsFromUrl } from "../utils/helpers.js";
import { toast } from "../utils/toast.js";

const complexDetailsView = {
    state: {
        currentId: null,
        complejo: null,
        canchas: [],
        mapInstance: null,
        isFavorite: false,
        favoriteId: null
    },

    render: async (params) => {
        complexDetailsView.state.currentId = params.id;
        loadLeaflet(); 
        const user = api.getUser();
        
        setTimeout(() => {
            const nav = document.getElementById('detailsTopNav');
            if(nav) { nav.innerHTML = UserTopNav.render('search', user); UserTopNav.attachListeners(); }
        }, 0);

        return `
            <div id="detailsTopNav"></div>
            <div id="mainDetailContent" class="fade-in">
                <div class="skeleton-hero"></div>
                <div class="container main-layout" style="margin-top: 2rem;">
                    <div style="display:grid; grid-template-columns: 350px 1fr; gap: 30px;">
                        <div class="skeleton-box" style="height: 200px;"></div>
                        <div class="skeleton-box" style="height: 300px;"></div>
                    </div>
                </div>
            </div>
            <style>
                .skeleton-hero { height: 380px; background: #e2e8f0; animation: pulse 1.5s infinite; }
                .skeleton-box { background: #f1f5f9; border-radius: 12px; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
            </style>
        `;
    },

    attachEventListeners: async () => {
        const id = complexDetailsView.state.currentId;
        const container = document.getElementById('mainDetailContent');
        if (!id) return;

        try {
            const [data, favs] = await Promise.all([
                api.getPublicDetails(id),
                api.isLoggedIn() ? api.getMyFavorites() : Promise.resolve({})
            ]);
            
            const { complex, canchas } = data;
            
            complexDetailsView.state.complejo = complex;
            complexDetailsView.state.canchas = canchas;
            complexDetailsView.state.favoriteId = favs[id] || null;
            complexDetailsView.state.isFavorite = !!favs[id];

            container.innerHTML = complexDetailsView.generateHTML();
            complexDetailsView.bindEvents();
            
            if (complex.url_map) complexDetailsView.initMap(complex.url_map);

        } catch (error) {
            console.error("Error:", error);
            container.innerHTML = `<div style="text-align:center; padding:80px;"><h2>Error al cargar</h2><button id="btnBackError" class="btn-primary">Volver</button></div>`;
            document.getElementById('btnBackError')?.addEventListener('click', () => navigate('/search'));
        }
    },

    generateHTML: () => {
        const { complejo, canchas, isFavorite } = complexDetailsView.state;
        const imgBg = getAbsoluteImageUrl(complejo.url_imagen);
        const contactos = complejo.contactos || [];
        const servicios = complejo.servicios || [];

        const svgs = {
            whatsapp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#25D366"/><path d="M17.5 14.8c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1s-.6.8-.8.9c-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.7-1.7-2-.2-.3 0-.5.2-.6.1-.2.3-.4.4-.6.2-.2.2-.3.4-.6s.1-.4 0-.6c-.1-.2-.6-1.4-.8-1.9-.2-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.1 1.1-1.1 2.7 1.1 3.1 1.3 3.3c.2.2 2.2 3.4 5.3 4.7 2.1.9 2.9.9 4 .8.6-.1 1.6-.7 1.9-1.3.3-.7.3-1.2.2-1.3-.1-.3-.5-.4-.8-.5z" fill="white"/></svg>`,
            facebook: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12C24 5.373 18.627 0 12 0S0 5.373 0 12c0 6 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 18 24 12z"/></svg>`,
            instagram: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" fill="#E1306C"/><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.5-7.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill="white"/></svg>`,
            phone: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
            mail: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA4335" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
            external: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
            location: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
            back: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
            heartFull: `<svg width="20" height="20" fill="#ef4444" stroke="#ef4444" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
            heartEmpty: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
            // ✅ NUEVO ICONO DE CANCHA (Diseño de campo)
            court: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M12 3v18"/><circle cx="12" cy="12" r="3"/><path d="M2 9h4"/><path d="M20 9h-4"/><path d="M2 15h4"/><path d="M20 15h-4"/></svg>`,
            service: `<svg width="20" height="20" fill="none" stroke="#2563eb" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
        };

        const renderContact = (c) => {
            const t = c.tipo.toLowerCase();
            let icon = svgs.phone;
            if (t.includes('what')) icon = svgs.whatsapp;
            else if (t.includes('face')) icon = svgs.facebook;
            else if (t.includes('insta')) icon = svgs.instagram;
            else if (t.includes('mail')) icon = svgs.mail;

            let href = '#';
            if (t.includes('what')) href = `https://wa.me/${c.valor_contacto.replace(/\D/g,'')}`;
            else if (t.includes('mail')) href = `mailto:${c.valor_contacto}`;
            else if (t.includes('tel')) href = `tel:${c.valor_contacto}`;
            else if (c.valor_contacto.startsWith('http')) href = c.valor_contacto;

            return `<a href="${href}" target="_blank" class="contact-item">${icon} <span>${c.tipo}: ${c.valor_contacto}</span></a>`;
        };

        const renderService = (s) => {
            const precio = parseFloat(s.monto) > 0 ? `S/ ${parseFloat(s.monto).toFixed(2)}` : 'Incluido';
            return `
                <div class="service-item">
                    <div class="service-icon">${svgs.service}</div>
                    <div class="service-info">
                        <span class="service-name">${s.nombre}</span>
                        <span class="service-desc">${s.descripcion || ''}</span>
                    </div>
                    <span class="service-price">${precio}</span>
                </div>
            `;
        };

        const renderCancha = (c) => `
            <div class="court-card">
                <!-- Icono de cancha profesional -->
                <div class="court-icon">${svgs.court}</div>
                <div class="court-info">
                    <h4>${c.nombre}</h4>
                    <div class="court-meta">
                        <span class="sport-tag">${c.tipo_deporte_nombre || 'Deporte'}</span>
                    </div>
                </div>
                <button class="btn-book-court" data-id="${c.cancha_id}">Ver Disponibilidad</button>
            </div>
        `;

        return `
            <div class="complex-hero" style="background-image: linear-gradient(to bottom, rgba(15,23,42,0.4), rgba(15,23,42,0.95)), url('${imgBg}');">
                <div class="hero-top container">
                    <button id="btnBack" class="btn-back">${svgs.back} Volver</button>
                    <button id="btnFavHero" class="btn-fav-hero ${isFavorite ? 'active' : ''}">
                        ${isFavorite ? svgs.heartFull : svgs.heartEmpty}
                        <span>${isFavorite ? 'Guardado' : 'Guardar en Favoritos'}</span>
                    </button>
                </div>
                <div class="hero-bottom container">
                    <div class="badge-wrapper"><span class="badge-loc">${svgs.location} ${complejo.distrito_nombre || 'Ubicación'}</span></div>
                    <h1>${complejo.nombre}</h1>
                    <p class="address-line">${complejo.direccion_detalle || 'Sin dirección'}</p>
                </div>
            </div>

            <div class="container main-layout">
                <aside class="sidebar">
                    <div class="info-card mb-4">
                        <h3 class="card-heading">Contacto</h3>
                        <div class="contacts-list">
                            ${contactos.length ? contactos.map(renderContact).join('') : '<p class="text-muted">No disponible</p>'}
                        </div>
                    </div>

                    <div class="info-card mb-4">
                        <h3 class="card-heading">Servicios</h3>
                        <div class="services-list">
                            ${servicios.length ? servicios.map(renderService).join('') : '<p class="text-muted">No registrados</p>'}
                        </div>
                    </div>

                    <div class="info-card">
                        <h3 class="card-heading">Ubicación</h3>
                        <p class="desc-text">${complejo.descripcion || ''}</p>
                        ${complejo.url_map ? `<div class="map-wrapper"><div id="viewMapContainer" class="map-container"></div></div><a href="${complejo.url_map}" target="_blank" class="btn-ext-map">Abrir en Google Maps ${svgs.external}</a>` : ''}
                    </div>
                </aside>

                <section class="content-area">
                    <h3 class="section-title">Canchas Disponibles</h3>
                    <div class="courts-grid">
                        ${canchas.length ? canchas.map(renderCancha).join('') : '<div class="empty-msg">Sin canchas disponibles.</div>'}
                    </div>
                </section>
            </div>
            
            <style>
                .complex-hero { height: 380px; background-size: cover; background-position: center; display: flex; flex-direction: column; justify-content: space-between; padding: 20px 0 40px; }
                .hero-top, .hero-bottom { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 20px; }
                .hero-top { display: flex; justify-content: space-between; }
                
                .btn-back { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 30px; cursor: pointer; backdrop-filter: blur(8px); font-weight: 500; }
                .btn-fav-hero { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 8px 20px; border-radius: 30px; cursor: pointer; backdrop-filter: blur(8px); font-weight: 600; transition: all 0.2s; }
                .btn-fav-hero.active { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #fca5a5; }

                .badge-loc { background: #2563eb; color: white; padding: 6px 12px; border-radius: 6px; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 5px; }
                .hero-bottom h1 { color: white; font-size: 2.8rem; margin: 10px 0; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
                .address-line { color: #e2e8f0; font-size: 1.1rem; opacity: 0.9; }

                .main-layout { display: grid; grid-template-columns: 360px 1fr; gap: 40px; margin-top: 40px; padding-bottom: 60px; }
                
                /* ESTILOS DE CONTRASTE */
                .info-card { background: white; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
                .mb-4 { margin-bottom: 2rem; }
                .card-heading { margin-top: 0; color: #0f172a !important; font-weight: 700; font-size: 1.1rem; margin-bottom: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
                .desc-text { color: #475569 !important; line-height: 1.6; font-size: 0.95rem; }

                /* SERVICIOS */
                .services-list { display: flex; flex-direction: column; gap: 12px; }
                .service-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; }
                .service-icon { background: white; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e2e8f0; color: #2563eb; }
                .service-info { flex: 1; }
                .service-name { display: block; font-weight: 600; color: #1e293b !important; font-size: 0.9rem; }
                .service-desc { display: block; font-size: 0.8rem; color: #64748b !important; }
                .service-price { font-weight: 700; color: #059669; font-size: 0.9rem; background: #d1fae5; padding: 2px 8px; border-radius: 4px; }

                /* Contactos */
                .contact-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; text-decoration: none; color: #334155 !important; background: #f8fafc; margin-bottom: 8px; border: 1px solid transparent; transition: all 0.2s; }
                .contact-item:hover { background: #fff; border-color: #cbd5e1; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                .text-muted { color: #94a3b8 !important; font-style: italic; }

                /* Mapa */
                .map-wrapper { border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; margin-top: 20px; }
                .map-container { height: 220px; width: 100%; z-index: 1; }
                .btn-ext-map { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 12px; color: #2563eb !important; text-decoration: none; font-size: 0.9rem; font-weight: 600; padding: 8px; border-radius: 8px; transition: background 0.2s; }
                .btn-ext-map:hover { background: #eff6ff; }

                /* Canchas */
                .section-title { font-size: 1.5rem; color: #0f172a !important; font-weight: 800; margin-bottom: 25px; margin-top: 0; }
                .courts-grid { display: flex; flex-direction: column; gap: 16px; }
                .court-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; display: flex; align-items: center; gap: 20px; transition: all 0.2s; }
                .court-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border-color: #cbd5e1; }
                .court-icon { width: 60px; height: 60px; background: #f1f5f9; color: #0f172a; display: flex; align-items: center; justify-content: center; border-radius: 14px; }
                .court-info h4 { margin: 0 0 6px; font-size: 1.2rem; font-weight: 700; color: #0f172a !important; }
                .btn-book-court { background: #0f172a; color: white !important; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
                .btn-book-court:hover { background: #1e293b; transform: translateY(-1px); }

                @media (max-width: 900px) { 
                    .main-layout { grid-template-columns: 1fr; margin-top: 20px; } 
                    .complex-hero { height: auto; min-height: 300px; padding-bottom: 30px; } 
                    .sidebar { order: 2; } 
                    .content-area { order: 1; } 
                }
            </style>
        `;
    },

    initMap: (urlMap) => {
        const coords = parseCoordsFromUrl(urlMap);
        let lat = -12.0463, lng = -77.0428, zoom = 12;
        if (coords) { lat = coords.lat; lng = coords.lng; zoom = 15; }

        setTimeout(() => {
            const mapContainer = document.getElementById('viewMapContainer');
            if (mapContainer && typeof L !== 'undefined') {
                if (complexDetailsView.state.mapInstance) complexDetailsView.state.mapInstance.remove();
                const map = L.map('viewMapContainer', { zoomControl: false, dragging: !L.Browser.mobile }).setView([lat, lng], zoom);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
                if (coords) {
                     const icon = L.divIcon({
                        className: 'custom-pin',
                        html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
                        iconSize: [30, 30], iconAnchor: [15, 30]
                    });
                    // Offset [0, -35] para que el popup salga arriba del pin
                    L.marker([lat, lng], {icon}).addTo(map).bindPopup("<b>¡Aquí estamos!</b>", { offset: [0, -35] }).openPopup();
                }
                complexDetailsView.state.mapInstance = map;
            }
        }, 500); 
    },

    bindEvents: () => {
        document.getElementById('btnBack')?.addEventListener('click', () => navigate('/search'));
        document.querySelectorAll('.btn-book-court').forEach(btn => btn.addEventListener('click', (e) => navigate(`/booking/${e.target.dataset.id}`)));
        
        // ... (Lógica de favorito igual que antes) ...
        document.getElementById('btnFavHero')?.addEventListener('click', async (e) => {
             // Copiar la lógica del mensaje anterior para la acción de favoritos
             // (Para ahorrar espacio, usa la misma lógica que ya validamos)
             if (!api.isLoggedIn()) { toast.info("Inicia sesión para guardar"); return; }
             const btn = e.currentTarget;
            const id = complexDetailsView.state.currentId;
            const { isFavorite, favoriteId } = complexDetailsView.state;

            try {
                if (isFavorite) {
                    await api.removeFavorite(favoriteId);
                    complexDetailsView.state.isFavorite = false;
                    complexDetailsView.state.favoriteId = null;
                    btn.classList.remove('active');
                    btn.innerHTML = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>Guardar en Favoritos</span>`;
                    toast.success("Eliminado de favoritos");
                } else {
                    const newId = await api.addFavorite(id);
                    complexDetailsView.state.isFavorite = true;
                    complexDetailsView.state.favoriteId = newId;
                    btn.classList.add('active');
                    btn.innerHTML = `<svg width="24" height="24" fill="#ef4444" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>Guardado</span>`;
                    toast.success("Guardado en favoritos");
                }
            } catch (err) { console.error(err); toast.error("Error al actualizar favorito"); }
             // ...
             // (Ver respuesta anterior para el bloque completo de favoritos)
        });
    }
};

export default complexDetailsView;