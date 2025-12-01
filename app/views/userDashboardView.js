import { navigate } from "../router.js";
import api from "../services/api.js";
import { toast } from "../utils/toast.js";

// --- ICONOS DE GESTIÓN (SVG) ---
const ICONS = {
    search: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    calendar: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    briefcase: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    star: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    user: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    settings: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
};

const userDashboardView = {
  render: async () => {
    if (!api.isLoggedIn()) { navigate("/"); return ""; }

    const user = api.getUser() || { nombre: "Deportista" };
    const initial = user.nombre ? user.nombre.charAt(0).toUpperCase() : "U";
    const isStaff = api.isStaff();

    // Mensaje de saludo
    const hour = new Date().getHours();
    let greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

    // Configuración Botón Partner/Admin
    const adminConfig = isStaff 
        ? { title: "Panel de Gestión", desc: "Administra tu sede", color: "#3b82f6", icon: ICONS.briefcase, action: "admin" }
        : { title: "Soy Dueño", desc: "Publica tu cancha", color: "#f59e0b", icon: ICONS.briefcase, action: "partner" };

    const styles = `
        <style>
            :root { --glass-bg: rgba(15, 23, 42, 0.6); --glass-border: rgba(255, 255, 255, 0.1); }
            
            /* Header Pro (Reutilizado) */
            .header-pro { background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--glass-border); padding: 15px 0; position: sticky; top: 0; z-index: 100; }
            
            /* Hero Carrusel (Fondo) */
            .hero-dashboard { position: relative; height: 60vh; width: 100%; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 80px; }
            .hero-background { position: absolute; inset: 0; z-index: 0; }
            .hero-overlay-dash { position: absolute; inset: 0; background: linear-gradient(to top, #0f172a 10%, rgba(15,23,42,0.6) 50%, rgba(15,23,42,0.4) 100%); z-index: 1; }
            
            /* Dashboard Content */
            .dash-content { position: relative; z-index: 10; width: 100%; max-width: 1000px; padding: 0 20px; margin-top: -120px; }
            
            .greeting-box { margin-bottom: 30px; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            .greeting-title { font-size: 2.5rem; font-weight: 800; color: white; margin: 0; }
            .greeting-sub { color: #cbd5e1; font-size: 1.1rem; }

            /* Grid de Acciones */
            .action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px; }
            
            .action-card { 
                background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1); 
                border-radius: 16px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s ease;
                display: flex; flex-direction: column; align-items: center; justify-content: center; height: 160px;
                box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3);
            }
            .action-card:hover { transform: translateY(-5px); background: rgba(30, 41, 59, 0.9); border-color: rgba(255,255,255,0.2); box-shadow: 0 20px 30px -10px rgba(0,0,0,0.5); }
            
            .icon-circle { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; color: white; transition: transform 0.3s; }
            .action-card:hover .icon-circle { transform: scale(1.1); }
            
            .card-title { color: white; font-weight: 600; font-size: 1rem; margin-bottom: 4px; }
            .card-desc { color: #94a3b8; font-size: 0.75rem; }

            /* Colores Específicos */
            .icon-search { background: linear-gradient(135deg, #3b82f6, #2563eb); }
            .icon-calendar { background: linear-gradient(135deg, #10b981, #059669); }
            .icon-admin { background: linear-gradient(135deg, ${isStaff ? '#6366f1' : '#f59e0b'}, ${isStaff ? '#4f46e5' : '#d97706'}); }
            .icon-star { background: linear-gradient(135deg, #fbbf24, #d97706); }
            .icon-user { background: linear-gradient(135deg, #64748b, #475569); }

            @media(max-width: 768px) {
                .greeting-title { font-size: 1.8rem; }
                .action-grid { grid-template-columns: 1fr 1fr; }
            }
        </style>
    `;

    return `
      ${styles}
      <div class="container-fluid" style="background: #0f172a; min-height: 100vh;">
        
        <!-- HEADER (Idéntico a Home) -->
        <header class="header-pro">
          <div class="container" style="display:flex; justify-content:space-between; align-items:center;">
            <div class="logo" style="display:flex; align-items:center; gap:12px;">
              <div style="width:35px; height:35px; background:linear-gradient(45deg, #3b82f6, #6366f1); border-radius:8px; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">R</div>
              <div><strong style="color:white; font-size:1.2rem; letter-spacing:-0.5px;">ReserSport</strong></div>
            </div>
            
            <nav style="display:flex; align-items:center; gap:20px;">
              <div id="homeUserMenuBtn" style="cursor:pointer; display:flex; align-items:center; gap:10px; padding:5px 10px; background:rgba(255,255,255,0.05); border-radius:30px; border:1px solid rgba(255,255,255,0.1);">
                  <span style="color:white; font-size:0.9rem; margin-left:5px;">${user.nombre.split(' ')[0]}</span>
                  <div style="width:30px; height:30px; background:#3b82f6; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; color:white;">${initial}</div>
              </div>
            </nav>
          </div>
        </header>

        <!-- DROPDOWN -->
        <div id="homeUserDropdown" class="card" style="position:fixed; top:75px; right:20px; width:220px; display:none; z-index:110; padding:5px; background:#1e293b; border:1px solid rgba(255,255,255,0.1);">
            <div style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.05);">
                <div style="color:white; font-weight:bold;">${user.nombre}</div>
                <div style="color:#64748b; font-size:0.8rem;">${user.correo}</div>
            </div>
            <a href="#" id="doLogout" style="display:block; padding:12px; color:#f87171; text-decoration:none;">🚪 Cerrar Sesión</a>
        </div>

        <main>
            <!-- CARRUSEL DE FONDO (Igual que Home) -->
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

            <!-- PANEL FLOTANTE DE ACCIONES -->
            <div class="container dash-content">
                <div class="greeting-box">
                    <h1 class="greeting-title">${greeting}, ${user.nombre.split(' ')[0]}</h1>
                    <div class="greeting-sub">¿Qué te gustaría hacer hoy?</div>
                </div>

                <div class="action-grid">
                    <!-- 1. Buscar Cancha -->
                    <div class="action-card" id="btnDashSearch">
                        <div class="icon-circle icon-search">${ICONS.search}</div>
                        <div class="card-title">Buscar Cancha</div>
                        <div class="card-desc">Reservar ahora</div>
                    </div>

                    <!-- 2. Mis Reservas -->
                    <div class="action-card" id="btnDashReservations">
                        <div class="icon-circle icon-calendar">${ICONS.calendar}</div>
                        <div class="card-title">Mis Reservas</div>
                        <div class="card-desc">Ver historial</div>
                    </div>

                    <!-- 3. Gestión / Partner -->
                    <div class="action-card" id="btnDashAdmin">
                        <div class="icon-circle icon-admin">${adminConfig.icon}</div>
                        <div class="card-title" style="color:${adminConfig.color}">${adminConfig.title}</div>
                        <div class="card-desc">${adminConfig.desc}</div>
                    </div>

                    <!-- 4. Favoritos -->
                    <div class="action-card">
                        <div class="icon-circle icon-star">${ICONS.star}</div>
                        <div class="card-title">Favoritos</div>
                        <div class="card-desc">Canchas guardadas</div>
                    </div>

                    <!-- 5. Perfil -->
                    <div class="action-card" id="btnDashProfile">
                        <div class="icon-circle icon-user">${ICONS.settings}</div>
                        <div class="card-title">Mi Perfil</div>
                        <div class="card-desc">Ajustes de cuenta</div>
                    </div>
                </div>
            </div>
        </main>

        <!-- MODAL PARTNER (Diseño PRO) -->
        <div id="partnerModal" class="modal" style="display:none; backdrop-filter: blur(8px);">
            <div class="modal-overlay" id="partnerOverlay"></div>
            <div class="modal-content card" style="max-width: 450px; padding: 0; border-radius: 20px; overflow: hidden; background: #1e293b; border: 1px solid rgba(255,255,255,0.1);">
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 30px; text-align: center; color: white;">
                    <div style="font-size: 3.5rem; margin-bottom: 10px;">🏟️</div>
                    <h2 style="margin:0; font-size: 1.8rem; font-weight:800;">Gestiona tu Sede</h2>
                    <p style="opacity: 0.9;">Lleva tu negocio deportivo al siguiente nivel.</p>
                </div>
                
                <div style="padding: 30px;">
                    <div style="display:grid; gap:15px; margin-bottom:25px;">
                        <div style="display:flex; align-items:center; gap:10px; color:#cbd5e1;">
                            <span style="color:#10b981;">✓</span> Control total de horarios y precios.
                        </div>
                        <div style="display:flex; align-items:center; gap:10px; color:#cbd5e1;">
                            <span style="color:#10b981;">✓</span> Recepción de reservas 24/7.
                        </div>
                        <div style="display:flex; align-items:center; gap:10px; color:#cbd5e1;">
                            <span style="color:#10b981;">✓</span> Reportes de ingresos detallados.
                        </div>
                    </div>

                    <button id="btnAcceptPartner" class="btn" style="width:100%; padding: 14px; font-size:1rem; font-weight:bold; background: #0f172a; border: 1px solid rgba(255,255,255,0.1);">
                        🚀 Activar Perfil de Gestor
                    </button>
                    <button id="partnerClose" style="width:100%; margin-top:10px; background:none; border:none; color:#94a3b8; cursor:pointer; padding: 10px;">Cancelar</button>
                </div>
            </div>
        </div>

      </div>
    `;
  },

  attachEventListeners: () => {
    // 1. Swiper (Mismo que Home)
    try {
        if (typeof Swiper !== 'undefined') {
            new Swiper('.hero-swiper', { loop: true, effect: 'fade', fadeEffect: { crossFade: true }, autoplay: { delay: 6000, disableOnInteraction: false } });
        }
    } catch (e) {}

    // 2. Dropdown & Logout
    const menuBtn = document.getElementById('homeUserMenuBtn');
    const dropdown = document.getElementById('homeUserDropdown');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block'; });
        document.addEventListener('click', () => { if(dropdown) dropdown.style.display = 'none'; });
        document.getElementById('doLogout')?.addEventListener('click', (e) => {
            e.preventDefault();
            toast.info("Hasta pronto...");
            setTimeout(() => api.logout(), 800);
        });
    }

    // 3. Botones Dashboard
    document.getElementById('btnDashSearch')?.addEventListener('click', () => {
        // Redirige al home pero con el foco en el buscador (o una vista de búsqueda dedicada)
        navigate('/'); 
        setTimeout(() => { 
            const input = document.getElementById('location'); 
            if(input) input.focus(); 
        }, 500);
    });
    
    document.getElementById('btnDashReservations')?.addEventListener('click', () => navigate('/reservations'));
    
    document.getElementById('btnDashProfile')?.addEventListener('click', () => {
        toast.info("Próximamente: Edición de perfil");
    });

    // 4. Lógica Admin / Partner
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

    // 5. Modal Partner
    const closeModal = () => modalPartner.style.display = 'none';
    document.getElementById('partnerClose')?.addEventListener('click', closeModal);
    document.getElementById('partnerOverlay')?.addEventListener('click', closeModal);

    document.getElementById('btnAcceptPartner')?.addEventListener('click', async (e) => {
        const btn = e.target;
        const originalText = btn.textContent;
        btn.textContent = "Procesando..."; btn.disabled = true;

        try {
            await api.becomePartner(); 
            toast.success("¡Perfil actualizado con éxito!");
            closeModal();
            navigate('/admin');
        } catch (error) {
            toast.error(error.message);
            btn.textContent = originalText; btn.disabled = false;
        }
    });
  }
};

export default userDashboardView;