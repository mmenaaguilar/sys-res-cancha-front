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
        mapInstance: null
    },

    render: async (params) => {
        complexDetailsView.state.currentId = params.id;
        
        loadLeaflet(); 
        const user = api.getUser();
        
        setTimeout(() => {
            const nav = document.getElementById('detailsTopNav');
            if(nav) {
                nav.innerHTML = UserTopNav.render('search', user);
                UserTopNav.attachListeners();
            }
        }, 0);

        return `
            <div id="detailsTopNav"></div>
            
            <div id="mainDetailContent" class="fade-in">
                <!-- Skeleton Loader Mejorado -->
                <div class="skeleton-hero"></div>
                <div class="container main-layout" style="margin-top: 2rem;">
                    <div style="display:grid; grid-template-columns: 350px 1fr; gap: 30px;">
                        <div>
                            <div class="skeleton-box" style="height: 200px;"></div>
                        </div>
                        <div>
                            <div class="skeleton-text" style="width: 40%; height: 30px; margin-bottom: 20px;"></div>
                            <div class="skeleton-box" style="height: 100px; margin-bottom: 15px;"></div>
                            <div class="skeleton-box" style="height: 100px;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .skeleton-hero { height: 350px; background: #e2e8f0; animation: pulse 1.5s infinite; }
                .skeleton-box { background: #f1f5f9; border-radius: 12px; animation: pulse 1.5s infinite; }
                .skeleton-text { background: #cbd5e1; border-radius: 6px; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
            </style>
        `;
    },

    attachEventListeners: async () => {
        const id = complexDetailsView.state.currentId;
        const container = document.getElementById('mainDetailContent');
        if (!id) return;

        try {
            const { complex, canchas } = await api.getPublicDetails(id);
            complexDetailsView.state.complejo = complex;
            complexDetailsView.state.canchas = canchas;

            container.innerHTML = complexDetailsView.generateHTML();
            complexDetailsView.bindEvents();
            
            if (complex.url_map) complexDetailsView.initMap(complex.url_map);

        } catch (error) {
            console.error("Error cargando detalles:", error);
            container.innerHTML = `
                <div style="text-align:center; padding: 80px 20px;">
                    <div style="font-size: 3rem; color: #cbd5e1; margin-bottom: 20px;">
                        <svg width="60" height="60" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    </div>
                    <h2 style="color: #1e293b; margin-bottom: 10px;">No pudimos cargar el complejo</h2>
                    <p style="color: #64748b; margin-bottom: 20px;">Es posible que el enlace sea incorrecto o el complejo ya no esté disponible.</p>
                    <button id="btnBackError" class="btn-primary">Volver a buscar</button>
                </div>`;
            document.getElementById('btnBackError')?.addEventListener('click', () => navigate('/search'));
        }
    },

    generateHTML: () => {
        const { complejo, canchas } = complexDetailsView.state;
        const imgBg = getAbsoluteImageUrl(complejo.url_imagen);
        const contactos = complejo.contactos || [];

        // --- Iconos SVG con COLORES OFICIALES ---
        const svgs = {
            // WhatsApp (Verde con logo blanco)
            whatsapp: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#25D366"/><path d="M17.5 14.8c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1s-.6.8-.8.9c-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.7-1.7-2-.2-.3 0-.5.2-.6.1-.2.3-.4.4-.6.2-.2.2-.3.4-.6s.1-.4 0-.6c-.1-.2-.6-1.4-.8-1.9-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.1 1.1-1.1 2.7 1.1 3.1 1.3 3.3c.2.2 2.2 3.4 5.3 4.7 2.1.9 2.9.9 4 .8.6-.1 1.6-.7 1.9-1.3.3-.7.3-1.2.2-1.3-.1-.3-.5-.4-.8-.5z" fill="white"/></svg>`,
            
            // Facebook (Azul)
            facebook: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 12C24 5.373 18.627 0 12 0S0 5.373 0 12c0 6 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 18 24 12z" fill="#1877F2"/></svg>`,
            
            // Instagram (Degradado)
            instagram: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="6" fill="#E1306C"/><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.5-7.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill="white"/></svg>`,
            
            // Mail (Rojo/Gris)
            mail: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EA4335" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
            
            // Telefono (Verde o Azul)
            phone: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
            
            // Otros
            external: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
            location: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
            back: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
            genericSport: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`
        };

        const getContactIcon = (tipo) => {
            const t = tipo.toLowerCase();
            if (t.includes('what')) return svgs.whatsapp;
            if (t.includes('face')) return svgs.facebook;
            if (t.includes('insta')) return svgs.instagram;
            if (t.includes('mail') || t.includes('correo')) return svgs.mail;
            return svgs.phone;
        };

        const getContactLink = (tipo, valor) => {
            const t = tipo.toLowerCase();
            if (t.includes('what')) return `https://wa.me/${valor.replace(/\D/g,'')}`;
            if (t.includes('mail') || t.includes('correo')) return `mailto:${valor}`;
            if (t.includes('tel') || t.includes('cel')) return `tel:${valor}`;
            if (valor.startsWith('http')) return valor;
            return '#';
        };

        const contactosHTML = contactos.length > 0 
            ? contactos.map(c => `
                <a href="${getContactLink(c.tipo, c.valor_contacto)}" target="_blank" class="contact-item ${c.tipo.toLowerCase()}">
                    <span class="icon-box">${getContactIcon(c.tipo)}</span>
                    <div class="contact-info">
                        <span class="contact-type">${c.tipo}</span>
                        <span class="contact-val">${c.valor_contacto}</span>
                    </div>
                    ${c.tipo.toLowerCase().includes('what') || c.tipo.toLowerCase().includes('http') ? svgs.external : ''}
                </a>
            `).join('')
            : '<p class="text-muted" style="font-size:0.9rem;">No hay información de contacto disponible.</p>';

        const getSportIcon = (id) => { 
            return svgs.genericSport; 
        };

        const canchasHTML = canchas.length > 0 
            ? canchas.map(c => `
                <div class="court-card">
                    <div class="court-icon">${getSportIcon(c.tipo_deporte_id)}</div>
                    <div class="court-info">
                        <h4>${c.nombre}</h4>
                        <div class="court-meta">
                            <span class="sport-tag">${c.tipo_deporte_nombre || 'Deporte'}</span>
                            <span class="dot">•</span>
                            <span>${c.descripcion || 'Cancha Estándar'}</span>
                        </div>
                    </div>
                    <button class="btn-book-court" data-id="${c.cancha_id}">
                        Ver Disponibilidad
                    </button>
                </div>
            `).join('')
            : `<div class="empty-msg">Este complejo no tiene canchas registradas actualmente.</div>`;

        return `
            <!-- HERO REDISEÑADO: Estructura Flex Vertical para separar Botón y Título -->
            <div class="complex-hero" style="background-image: linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.95)), url('${imgBg}');">
                
                <!-- Parte Superior: Botón Volver -->
                <div class="hero-top container">
                    <button id="btnBack" class="btn-back">
                        ${svgs.back} Volver
                    </button>
                </div>

                <!-- Parte Inferior: Información del Complejo -->
                <div class="hero-bottom container">
                    <div class="badge-wrapper">
                        <span class="badge-loc">${svgs.location} ${complejo.distrito_nombre || 'Ubicación'}</span>
                    </div>
                    <h1>${complejo.nombre}</h1>
                    <p class="address-line">
                        ${complejo.direccion_detalle || complejo.direccion || 'Sin dirección específica'}
                    </p>
                </div>
            </div>

            <div class="container main-layout">
                <!-- COLUMNA IZQUIERDA: Sidebar -->
                <aside class="sidebar">
                    <!-- Caja de Contacto -->
                    <div class="info-card mb-4">
                        <h3 class="card-heading">Contacto Directo</h3>
                        <div class="contacts-list">
                            ${contactosHTML}
                        </div>
                    </div>

                    <!-- Caja de Detalles y Mapa -->
                    <div class="info-card">
                        <h3 class="card-heading">Acerca del lugar</h3>
                        <p class="desc-text">${complejo.descripcion || 'Sin descripción detallada disponible.'}</p>
                        
                        <div class="map-divider"></div>
                        <h4 class="map-heading">Ubicación</h4>
                        
                        ${complejo.url_map ? `
                            <div class="map-wrapper">
                                <div id="viewMapContainer" class="map-container"></div>
                            </div>
                            <a href="${complejo.url_map}" target="_blank" class="btn-ext-map">
                                Abrir en Google Maps ${svgs.external}
                            </a>
                        ` : `
                            <div class="no-map-msg">Mapa no disponible</div>
                        `}
                    </div>
                </aside>

                <!-- COLUMNA DERECHA: Canchas -->
                <section class="content-area">
                    <h3 class="section-title">Canchas Disponibles</h3>
                    <div class="courts-grid">${canchasHTML}</div>
                </section>
            </div>
            
            <style>
                /* Estructura Hero */
                .complex-hero { 
                    height: 380px; 
                    background-size: cover; 
                    background-position: center; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: space-between; 
                    padding-bottom: 40px; 
                    padding-top: 20px;
                }
                
                .hero-top, .hero-bottom { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 20px; }
                
                /* Botón Volver (Ahora arriba del todo) */
                .btn-back { 
                    display: inline-flex; align-items: center; gap: 8px;
                    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); 
                    color: white; padding: 8px 16px; border-radius: 30px; 
                    cursor: pointer; backdrop-filter: blur(8px); font-weight: 500; font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .btn-back:hover { background: rgba(255,255,255,0.25); transform: translateX(-3px); }

                /* Textos Hero (Abajo) */
                .badge-wrapper { margin-bottom: 12px; }
                .badge-loc { 
                    display: inline-flex; align-items: center; gap: 6px;
                    background: #2563eb; color: white; padding: 6px 12px; 
                    border-radius: 6px; font-weight: 700; text-transform: uppercase; 
                    font-size: 0.75rem; letter-spacing: 0.5px;
                }
                
                .hero-bottom h1 { color: white; font-size: 2.8rem; margin: 0 0 10px; font-weight: 800; line-height: 1.1; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
                .address-line { color: #e2e8f0; font-size: 1.1rem; opacity: 0.9; font-weight: 400; max-width: 800px; }

                /* Layout Principal */
                .main-layout { display: grid; grid-template-columns: 360px 1fr; gap: 40px; margin-top: 40px; padding-bottom: 60px; }
                
                /* Tarjetas Informativas (Sidebar) */
                .info-card { background: white; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
                .mb-4 { margin-bottom: 2rem; }
                .card-heading { margin-top: 0; color: #0f172a; font-weight: 700; font-size: 1.1rem; margin-bottom: 15px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
                .desc-text { color: #475569; line-height: 1.6; font-size: 0.95rem; }

                /* Contactos */
                .contacts-list { display: flex; flex-direction: column; gap: 10px; }
                .contact-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; text-decoration: none; color: #334155; background: #f8fafc; border: 1px solid transparent; transition: all 0.2s; }
                .contact-item:hover { background: #fff; border-color: #cbd5e1; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
                .icon-box { display: flex; }
                .contact-info { flex: 1; display: flex; flex-direction: column; }
                .contact-type { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: #94a3b8; }
                .contact-val { font-size: 0.95rem; font-weight: 600; color: #1e293b; }

                /* Mapa */
                .map-divider { border-top: 1px solid #e2e8f0; margin: 20px 0; }
                .map-heading { font-size: 0.9rem; text-transform: uppercase; color: #64748b; margin: 0 0 10px; }
                .map-wrapper { border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
                .map-container { height: 220px; width: 100%; z-index: 1; }
                .btn-ext-map { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 12px; color: #2563eb; text-decoration: none; font-size: 0.9rem; font-weight: 600; padding: 8px; border-radius: 8px; transition: background 0.2s; }
                .btn-ext-map:hover { background: #eff6ff; }
                .no-map-msg { text-align: center; padding: 30px; background: #f8fafc; color: #94a3b8; border-radius: 8px; border: 1px dashed #cbd5e1; }

                /* Área de Canchas */
                .section-title { font-size: 1.5rem; color: #0f172a; font-weight: 800; margin-bottom: 25px; margin-top: 0; }
                .courts-grid { display: flex; flex-direction: column; gap: 16px; }

                .court-card { 
                    background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; 
                    display: flex; align-items: center; gap: 20px; transition: all 0.2s; 
                }
                .court-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border-color: #cbd5e1; }
                
                .court-icon { 
                    width: 60px; height: 60px; background: #f1f5f9; color: #0f172a;
                    display: flex; align-items: center; justify-content: center; 
                    border-radius: 14px; 
                }
                
                .court-info { flex: 1; }
                .court-info h4 { margin: 0 0 6px; font-size: 1.2rem; font-weight: 700; color: #0f172a; }
                .court-meta { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #64748b; }
                .sport-tag { background: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
                .dot { color: #cbd5e1; }

                .btn-book-court { 
                    background: #0f172a; color: white; border: none; padding: 12px 24px; 
                    border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.95rem;
                    transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .btn-book-court:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 6px 10px -2px rgba(0,0,0,0.15); }
                
                .btn-primary { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; }

                /* Responsive */
                @media (max-width: 900px) { 
                    .main-layout { grid-template-columns: 1fr; margin-top: 20px; } 
                    .complex-hero { height: auto; min-height: 300px; padding-bottom: 30px; } 
                    .hero-bottom h1 { font-size: 2rem; }
                    .court-card { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .court-icon { width: 50px; height: 50px; }
                    .btn-book-court { width: 100%; margin-top: 5px; }
                    .sidebar { order: 2; } /* Mover info abajo en móvil */
                    .content-area { order: 1; } /* Canchas primero en móvil */
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
                
                // Mapa limpio y profesional
                const map = L.map('viewMapContainer', { zoomControl: false, dragging: !L.Browser.mobile, scrollWheelZoom: false }).setView([lat, lng], zoom);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '' }).addTo(map);
                
                if (coords) {
                    const icon = L.divIcon({
                        className: 'custom-pin',
                        html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    });
                    // ✅ AQUI ESTÁ LA CLAVE: .bindPopup() y .openPopup()
                    L.marker([lat, lng], {icon: icon}).addTo(map)
                        .bindPopup("<b>¡Aquí estamos!</b>")
                        .openPopup();
                }
                complexDetailsView.state.mapInstance = map;
            }
        }, 500); 
    },

    bindEvents: () => {
        document.getElementById('btnBack')?.addEventListener('click', () => navigate('/search'));
        document.querySelectorAll('.btn-book-court').forEach(btn => btn.addEventListener('click', (e) => navigate(`/booking/${e.target.dataset.id}`)));
    }
};

export default complexDetailsView;