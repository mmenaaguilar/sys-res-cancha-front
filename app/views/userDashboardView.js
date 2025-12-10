// app/views/userDashboardView.js
import { navigate } from "../router.js";
import api from "../services/api.js";
import { toast } from "../utils/toast.js";
import { UserTopNav } from "../components/UserTopNav.js";

// --- ICONOS SVG PROFESIONALES ---
const ICONS = {
    search: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    calendar: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    briefcase: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    star: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    user: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    settings: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    check: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    trophy: `<svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 21h8m-4-9v9m-6.7-16.7L12 17l6.7-12.7M3 3h18"/></svg>`,
    help: `<svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
};

const userDashboardView = {
  render: async () => {
    if (!api.isLoggedIn()) { navigate("/"); return ""; }

    const user = api.getUser() || { nombre: "Deportista" };
    const isStaff = api.isStaff();

    const hour = new Date().getHours();
    let greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

    // Configuración Botón Partner/Admin
    const adminConfig = isStaff 
        ? { title: "Panel de Gestión", desc: "Administra tu sede", color: "#60a5fa", icon: ICONS.briefcase }
        : { title: "Soy Dueño", desc: "Publica tu cancha", color: "#fbbf24", icon: ICONS.briefcase };

    const styles = `
        <style>
            :root { 
                --bg-dark: #0f172a; 
                --card-bg: rgba(30, 41, 59, 0.85); 
                --border-color: rgba(255, 255, 255, 0.15);
                --text-primary: #ffffff;
                --text-secondary: #cbd5e1;
            }
            
            /* HERO COMPACTO */
            .hero-dashboard { position: relative; height: 380px; width: 100%; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 80px; }
            .hero-background { position: absolute; inset: 0; z-index: 0; }
            .hero-overlay-dash { position: absolute; inset: 0; background: linear-gradient(to top, #0f172a 15%, rgba(15,23,42,0.6) 60%, rgba(15,23,42,0.4) 100%); z-index: 1; }
            
            /* DASHBOARD CONTAINER */
            .dash-content { position: relative; z-index: 10; width: 100%; max-width: 1200px; padding: 0 20px; margin-top: -60px; }
            
            .greeting-box { margin-bottom: 30px; }
            .greeting-title { font-size: 2.5rem; font-weight: 800; color: white; margin: 0; letter-spacing: -0.5px; text-shadow: 0 4px 12px rgba(0,0,0,0.5); }
            .greeting-sub { color: #e2e8f0; font-size: 1.1rem; font-weight: 400; opacity: 0.9; }

            /* --- GRID DE ACCIONES (UNA LÍNEA EN DESKTOP) --- */
            .action-grid { 
                display: grid; 
                /* Forzar 5 columnas iguales en escritorio */
                grid-template-columns: repeat(5, 1fr); 
                gap: 15px; 
                margin-bottom: 50px;
            }
            
            .action-card { 
                background: var(--card-bg); 
                backdrop-filter: blur(12px); 
                border: 1px solid var(--border-color); 
                border-radius: 16px; 
                padding: 20px 10px; 
                text-align: center; 
                cursor: pointer; 
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex; flex-direction: column; align-items: center; justify-content: center; 
                height: 150px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            }
            .action-card:hover { 
                transform: translateY(-5px); 
                background: rgba(30, 41, 59, 1); 
                border-color: rgba(59, 130, 246, 0.5); 
                box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.5); 
            }
            
            .icon-circle { 
                width: 48px; height: 48px; border-radius: 14px; 
                display: flex; align-items: center; justify-content: center; 
                margin-bottom: 12px; color: white; 
                transition: transform 0.3s; 
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            }
            .action-card:hover .icon-circle { transform: scale(1.1) rotate(5deg); }
            
            /* FORZAR TEXTO BLANCO */
            .card-title { color: white !important; font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; }
            .card-desc { color: #94a3b8 !important; font-size: 0.75rem; font-weight: 500; }

            /* Colores Iconos */
            .icon-search { background: linear-gradient(135deg, #3b82f6, #2563eb); }
            .icon-calendar { background: linear-gradient(135deg, #10b981, #059669); }
            .icon-admin { background: linear-gradient(135deg, ${isStaff ? '#6366f1' : '#f59e0b'}, ${isStaff ? '#4f46e5' : '#d97706'}); }
            .icon-star { background: linear-gradient(135deg, #f43f5e, #e11d48); }
            .icon-user { background: linear-gradient(135deg, #64748b, #475569); }

            /* --- SECCIÓN DE SOPORTE (RELLENO ÚTIL) --- */
            .support-banner {
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 40px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 40px;
            }
            .support-content { display: flex; align-items: center; gap: 20px; }
            .support-icon { color: #60a5fa; opacity: 0.8; }
            .support-text h3 { color: white; margin: 0 0 5px; font-size: 1.3rem; }
            .support-text p { color: #94a3b8; margin: 0; font-size: 0.95rem; }
            
            .btn-contact {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
                padding: 10px 20px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                text-decoration: none;
                font-weight: 600;
            }
            .btn-contact:hover { background: rgba(255,255,255,0.1); border-color: white; }

            /* --- FOOTER DASHBOARD --- */
            .dash-footer {
                border-top: 1px solid rgba(255,255,255,0.05);
                padding: 40px 0;
                text-align: center;
                color: #64748b;
                font-size: 0.85rem;
            }

            /* --- RESPONSIVE --- */
            @media(max-width: 1024px) {
                .action-grid { grid-template-columns: repeat(3, 1fr); }
            }
            @media(max-width: 768px) {
                .hero-dashboard { height: 30vh; }
                .greeting-title { font-size: 1.8rem; }
                .action-grid { grid-template-columns: 1fr 1fr; } /* 2 columnas en movil */
                .action-card:last-child { grid-column: span 2; } /* El ultimo ocupa todo el ancho */
                .support-banner { flex-direction: column; text-align: center; gap: 20px; }
                .support-content { flex-direction: column; gap: 10px; }
            }

            /* MODAL ESTILOS */
            .modal-partner-content { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; overflow: hidden; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.7); }
            .modal-hero { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; color: white; }
            .modal-hero h2 { margin: 10px 0 5px; font-size: 1.6rem; font-weight: 800; }
            .modal-hero p { opacity: 0.9; font-size: 0.95rem; margin: 0; }
            .feature-list { padding: 30px; }
            .feature-item { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; color: #cbd5e1; font-size: 0.95rem; }
            .feature-icon { color: #10b981; min-width: 20px; }
            .btn-activate { width: 100%; background: linear-gradient(135deg, #0f172a, #1e293b); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
            .btn-activate:hover { background: #334155; transform: translateY(-2px); }
            .btn-cancel-modal { width: 100%; margin-top: 12px; background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 0.9rem; transition: color 0.2s; }
            .btn-cancel-modal:hover { color: white; }
        </style>
    `;

    return `
      ${styles}
      <div class="container-fluid" style="background: #0f172a; min-height: 100vh;">
        
        <div id="userTopNav"></div>
        
        <main class="main-content">
            <section class="hero-dashboard">
                <div class="hero-background">
                    <div class="swiper hero-swiper" style="height:100%; width:100%;">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide"><img src="assets/images/futbol.jpg" alt="Bg" style="width:100%; height:100%; object-fit:cover;"></div>
                            <div class="swiper-slide"><img src="assets/images/voley.jpg" alt="Bg" style="width:100%; height:100%; object-fit:cover;"></div>
                        </div>
                    </div>
                    <div class="hero-overlay-dash"></div>
                </div>
            </section>

            <div class="container dash-content">
                
                <div class="greeting-box">
                    <h1 class="greeting-title">${greeting}, ${user.nombre.split(' ')[0]}</h1>
                    <div class="greeting-sub">¿Listo para el juego? Aquí tienes tu acceso rápido.</div>
                </div>

                <div class="action-grid">
                    <div class="action-card" id="btnDashSearch">
                        <div class="icon-circle icon-search">${ICONS.search}</div>
                        <div class="card-title">Buscar Cancha</div>
                        <div class="card-desc">Reservar ahora</div>
                    </div>

                    <div class="action-card" id="btnDashReservations">
                        <div class="icon-circle icon-calendar">${ICONS.calendar}</div>
                        <div class="card-title">Mis Reservas</div>
                        <div class="card-desc">Historial y estado</div>
                    </div>

                    <div class="action-card" id="btnDashFavorites">
                        <div class="icon-circle icon-star">${ICONS.star}</div>
                        <div class="card-title">Favoritos</div>
                        <div class="card-desc">Tus canchas top</div>
                    </div>

                    <div class="action-card" id="btnDashAdmin">
                        <div class="icon-circle icon-admin">${adminConfig.icon}</div>
                        <div class="card-title" style="color:${adminConfig.color} !important">${adminConfig.title}</div>
                        <div class="card-desc">${adminConfig.desc}</div>
                    </div>

                    <div class="action-card" id="btnDashProfile">
                        <div class="icon-circle icon-user">${ICONS.settings}</div>
                        <div class="card-title">Mi Perfil</div>
                        <div class="card-desc">Datos y ajustes</div>
                    </div>
                </div>

                <div class="support-banner">
                    <div class="support-content">
                        <div class="support-icon">${ICONS.help}</div>
                        <div class="support-text">
                            <h3>¿Necesitas ayuda?</h3>
                            <p>Contáctanos si tienes problemas con tus reservas o tu cuenta.</p>
                        </div>
                    </div>
                    <button class="btn-contact">Contactar Soporte</button>
                </div>

                <footer class="dash-footer">
                    <p>&copy; 2025 ReserSport. Hecho para deportistas.</p>
                    <div style="margin-top:10px; opacity:0.6;">
                        <a href="#" style="color:inherit; margin:0 10px; text-decoration:none;">Términos</a>
                        <a href="#" style="color:inherit; margin:0 10px; text-decoration:none;">Privacidad</a>
                        <a href="#" style="color:inherit; margin:0 10px; text-decoration:none;">Soporte</a>
                    </div>
                </footer>

            </div>
        </main>

        <div id="partnerModal" class="modal" style="display:none; backdrop-filter: blur(8px);">
            <div class="modal-overlay" id="partnerOverlay"></div>
            <div class="modal-content modal-partner-content" style="max-width: 420px; padding: 0;">
                
                <div class="modal-hero">
                    <div style="margin-bottom: 10px; color:white;">${ICONS.trophy}</div>
                    <h2>Modo Administrador</h2>
                    <p>Gestiona tu propio complejo deportivo</p>
                </div>
                
                <div class="feature-list">
                    <div class="feature-item">
                        <span class="feature-icon">${ICONS.check}</span>
                        <span>Control total de tus canchas y horarios.</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">${ICONS.check}</span>
                        <span>Gestión de precios y disponibilidad.</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">${ICONS.check}</span>
                        <span>Agregar Staff y co-administradores.</span>
                    </div>

                    <button id="btnAcceptPartner" class="btn-activate">
                        Activar Perfil Administrador
                    </button>
                    <button id="partnerClose" class="btn-cancel-modal">Cancelar</button>
                </div>
            </div>
        </div>
      </div>
    `;
  },

  attachEventListeners: () => {
    // 1. Swiper
    try {
        if (typeof Swiper !== 'undefined') {
            new Swiper('.hero-swiper', { loop: true, effect: 'fade', fadeEffect: { crossFade: true }, autoplay: { delay: 6000, disableOnInteraction: false } });
        }
    } catch (e) {}

    // 2. Navegación
    const routes = {
        'btnDashSearch': '/search',
        'btnDashReservations': '/reservations',
        'btnDashProfile': '/profile',
        'btnDashFavorites': '/favorites'
    };

    Object.keys(routes).forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => navigate(routes[id]));
    });

    // 3. Lógica Admin / Partner
    const btnAdmin = document.getElementById('btnDashAdmin');
    const modalPartner = document.getElementById('partnerModal');
    
    if (btnAdmin) {
        btnAdmin.addEventListener('click', () => {
            if (api.isStaff()) {
                navigate('/admin');
            } else {
                modalPartner.style.display = 'flex';
            }
        });
    }

    // 4. Modal Partner
    const closeModal = () => modalPartner.style.display = 'none';
    document.getElementById('partnerClose')?.addEventListener('click', closeModal);
    document.getElementById('partnerOverlay')?.addEventListener('click', closeModal);

    document.getElementById('btnAcceptPartner')?.addEventListener('click', async (e) => {
        const btn = e.target;
        const originalText = btn.textContent;
        btn.textContent = "Activando..."; btn.disabled = true;

        try {
            await api.becomePartner(); 
            toast.success("¡Perfil de Administrador activado!");
            closeModal();
            navigate('/admin');
        } catch (error) {
            toast.error(error.message);
            btn.textContent = originalText; btn.disabled = false;
        }
    });

    // 5. Top Nav
    const navContainer = document.getElementById('userTopNav');
    if (navContainer) {
        const user = api.getUser();
        navContainer.innerHTML = UserTopNav.render('dashboard', user);
        UserTopNav.attachListeners();
    }
  }
};

export default userDashboardView;