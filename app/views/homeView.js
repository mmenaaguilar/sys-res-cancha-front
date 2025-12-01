import { navigate } from "../router.js"; 
import { authService } from "../services/auth.service.js";
// ✅ IMPORTAR API PARA CARGAR DEPORTES
import api from "../services/api.js";
import { toast } from "../utils/toast.js";

// --- ICONOS PRO (SVG) ---
const ICONS = {
    login: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`,
    search: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    eye: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3-2.3M1 1l22 22"/></svg>`,
    mapPin: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    trophy: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 21h8m-4-9v9m-6.7-16.7L12 17l6.7-12.7M3 3h18"/></svg>` 
};

const homeView = {
    render: () => {
        const user = authService.getUser();
        const initial = user?.nombre?.charAt(0).toUpperCase() || "U"; 

        const styles = `
            <style>
                :root { --glass-bg: rgba(15, 23, 42, 0.6); --glass-border: rgba(255, 255, 255, 0.1); }
                .header-pro { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--glass-border); padding: 15px 0; position: sticky; top: 0; z-index: 100; transition: all 0.3s ease; }
                .hero-section { position: relative; height: 90vh; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .hero-overlay { position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.9) 100%); z-index: 10; pointer-events: none; }
                .hero-swiper { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; }
                .hero-swiper img { width: 100%; height: 100%; object-fit: cover; }
                .hero-content { position: relative; z-index: 20; text-align: center; width: 100%; max-width: 900px; padding: 20px; animation: fadeInUp 0.8s ease-out; }
                .hero-title { font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 15px; background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .hero-subtitle { font-size: 1.25rem; color: #cbd5e1; margin-bottom: 40px; font-weight: 300; }
                
                .search-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 25px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); }
                .search-grid { display: grid; grid-template-columns: 1.5fr 1fr auto; gap: 15px; align-items: end; }
                .input-group { position: relative; }
                .input-icon { position: absolute; left: 12px; top: 38px; color: #94a3b8; pointer-events: none; }
                .input-pro { width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 12px 12px 12px 40px; border-radius: 10px; font-size: 1rem; transition: border-color 0.2s; }
                .input-pro:focus { border-color: #3b82f6; outline: none; background: rgba(15, 23, 42, 0.8); }
                
                /* Estilos específicos para el Select */
                select.input-pro { appearance: none; cursor: pointer; }
                select.input-pro option { background: #1e293b; color: white; }

                .btn-search-hero { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 12px 30px; border-radius: 10px; font-weight: 600; cursor: pointer; height: 46px; display: flex; align-items: center; gap: 8px; transition: transform 0.2s, box-shadow 0.2s; }
                .btn-search-hero:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }

                @media(max-width: 768px) { .hero-title { font-size: 2.2rem; } .search-grid { grid-template-columns: 1fr; } }
            </style>
        `;

        return `
            ${styles}
            <div class="container-fluid" style="background: #0f172a; min-height: 100vh;">
                <header class="header-pro">
                    <div class="container" style="display:flex; justify-content:space-between; align-items:center;">
                        <div class="logo" style="display:flex; align-items:center; gap:12px;">
                            <div style="width:35px; height:35px; background:linear-gradient(45deg, #3b82f6, #6366f1); border-radius:8px; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">R</div>
                            <div><strong style="color:white; font-size:1.2rem; letter-spacing:-0.5px;">ReserSport</strong></div>
                        </div>
                        <nav style="display:flex; align-items:center; gap:20px;">
                            <a href="/software" class="hide-mobile" style="color:#94a3b8; text-decoration:none; font-weight:500; transition:color 0.2s;">Software</a>
                            ${user ? `
                                <div id="homeUserMenuBtn" style="cursor:pointer; display:flex; align-items:center; gap:10px; padding:5px 10px; background:rgba(255,255,255,0.05); border-radius:30px; border:1px solid rgba(255,255,255,0.1);">
                                    <span style="color:white; font-size:0.9rem; margin-left:5px;">${user.nombre ? user.nombre.split(' ')[0] : 'Usuario'}</span>
                                    <div style="width:30px; height:30px; background:#3b82f6; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; color:white;">${initial}</div>
                                </div>
                            ` : `
                                <button id="btnOpenLogin" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:white; padding:8px 16px; border-radius:8px; cursor:pointer; font-size:0.9rem; display:flex; align-items:center; gap:8px;">
                                    ${ICONS.login} Iniciar Sesión
                                </button>
                            `}
                        </nav>
                    </div>
                </header>

                <div id="homeUserDropdown" class="card" style="position:fixed; top:75px; right:20px; width:220px; display:none; z-index:110; padding:5px; background:#1e293b; border:1px solid rgba(255,255,255,0.1);">
                    <a href="#" id="goDashboard" style="display:block; padding:12px; color:#e2e8f0; text-decoration:none; border-bottom:1px solid rgba(255,255,255,0.05);">📊 Mi Panel</a>
                    <a href="#" id="doLogout" style="display:block; padding:12px; color:#f87171; text-decoration:none;">🚪 Cerrar Sesión</a>
                </div>

                <main>
                    <section class="hero-section">
                        <div class="hero-background">
                            <div class="swiper hero-swiper">
                                <div class="swiper-wrapper">
                                    <div class="swiper-slide"><img src="assets/images/futbol.jpg" alt="Fútbol" loading="lazy"></div>
                                    <div class="swiper-slide"><img src="assets/images/voley.jpg" alt="Vóley" loading="lazy"></div>
                                    <div class="swiper-slide"><img src="assets/images/tenis.jpg" alt="Tenis" loading="lazy"></div>
                                </div>
                            </div>
                            <div class="hero-overlay"></div>
                        </div>

                        <div class="hero-content">
                            <div style="margin-bottom:30px;">
                                <span style="background:rgba(59, 130, 246, 0.2); color:#60a5fa; padding:6px 15px; border-radius:20px; font-size:0.8rem; font-weight:700; letter-spacing:1px; border:1px solid rgba(59, 130, 246, 0.3); text-transform:uppercase;">
                                    La forma PRO de jugar
                                </span>
                            </div>
                            <h1 class="hero-title">Encuentra tu cancha,<br>domina el juego.</h1>
                            <p class="hero-subtitle">Reserva espacios deportivos en tiempo real sin llamadas ni esperas.</p>

                            <!-- BUSCADOR FLOTANTE CON IDs REALES -->
                            <div class="search-card">
                                <form id="searchForm" class="search-grid">
                                    <div class="input-group">
                                        <label style="display:block; color:#94a3b8; font-size:0.85rem; margin-bottom:5px; text-align:left;">Ubicación</label>
                                        <div class="input-icon">${ICONS.mapPin}</div>
                                        <!-- Ahora es un SELECT para enviar ID correcto -->
                                        <select id="location" class="input-pro">
                                            <option value="">Cargando distritos...</option>
                                        </select>
                                    </div>
                                    <div class="input-group">
                                        <label style="display:block; color:#94a3b8; font-size:0.85rem; margin-bottom:5px; text-align:left;">Deporte</label>
                                        <div class="input-icon">${ICONS.trophy}</div>
                                        <select id="sport" class="input-pro">
                                            <option value="">Cualquiera</option>
                                            <!-- Se llena dinámicamente -->
                                        </select>
                                    </div>
                                    
                                    <input id="date" type="date" hidden />
                                    
                                    <button type="submit" class="btn-search-hero">
                                        ${ICONS.search} BUSCAR
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>
                </main>

                <!-- MODAL LOGIN (Mismo código anterior) -->
                <div id="loginModal" class="modal" style="display:none; backdrop-filter:blur(8px);">
                    <div class="modal-overlay" id="modalOverlay"></div>
                    <div class="modal-content card" style="max-width:400px; background:#1e293b; border:1px solid rgba(255,255,255,0.1); padding:30px; border-radius:16px;">
                        <button class="modal-close" id="modalCloseBtn" style="color:#94a3b8;">&times;</button>
                        <div style="text-align:center; margin-bottom:25px;">
                            <h3 style="font-size:1.5rem; color:white; margin:0;">Bienvenido</h3>
                            <p style="color:#94a3b8; margin-top:5px;">Ingresa a tu cuenta deportiva</p>
                        </div>
                        <form id="loginForm" novalidate>
                            <div class="field" style="margin-bottom:15px;">
                                <label style="color:#cbd5e1; font-size:0.9rem;">Correo Electrónico</label>
                                <input type="email" id="loginEmail" class="input" style="background:#0f172a; border-color:rgba(255,255,255,0.1); color:white;" required />
                            </div>
                            <div class="field" style="margin-bottom:20px; position:relative;">
                                <label style="color:#cbd5e1; font-size:0.9rem;">Contraseña</label>
                                <input type="password" id="loginPassword" class="input" style="background:#0f172a; border-color:rgba(255,255,255,0.1); color:white;" required />
                                <button type="button" id="toggleLoginPassword" style="position:absolute; right:10px; top:32px; background:none; border:none; color:#64748b; cursor:pointer;">${ICONS.eye}</button>
                            </div>
                            <button type="submit" class="btn" style="width:100%; background:#3b82f6; padding:12px; font-weight:bold;">INGRESAR</button>
                        </form>
                        <div style="text-align:center; margin-top:20px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.05);">
                            <a href="/register" id="registerLink" style="color:#60a5fa; text-decoration:none; font-size:0.9rem;">¿No tienes cuenta? Regístrate gratis</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    attachEventListeners: async () => {
        // ... (Listeners de Swiper y Login iguales) ...
        try { if (typeof Swiper !== 'undefined') { new Swiper('.hero-swiper', { loop: true, effect: 'fade', fadeEffect: { crossFade: true }, autoplay: { delay: 6000, disableOnInteraction: false } }); } } catch (e) {}
        
        const menuBtn = document.getElementById('homeUserMenuBtn');
        const dropdown = document.getElementById('homeUserDropdown');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block'; });
            document.addEventListener('click', () => { if(dropdown) dropdown.style.display = 'none'; });
            document.getElementById('doLogout')?.addEventListener('click', (e) => { e.preventDefault(); toast.info("Cerrando sesión..."); setTimeout(() => authService.logout(), 500); });
            document.getElementById('goDashboard')?.addEventListener('click', (e) => { e.preventDefault(); navigate('/dashboard'); });
        }

        const openBtn = document.getElementById('btnOpenLogin');
        if (openBtn) {
            const modal = document.getElementById('loginModal');
            openBtn.addEventListener('click', () => modal.style.display = 'flex');
            const closeModal = () => modal.style.display = 'none';
            document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
            document.getElementById('modalOverlay').addEventListener('click', closeModal);
            
            document.getElementById('loginForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button[type="submit"]');
                const original = btn.textContent;
                btn.textContent = "VERIFICANDO..."; btn.disabled = true;
                try {
                    const user = await authService.login({ correo: document.getElementById('loginEmail').value, contrasena: document.getElementById('loginPassword').value });
                    closeModal();
                    const firstName = user?.nombre?.split(' ')[0] || 'Usuario';
                    toast.success(`¡Hola, ${firstName}!`);
                    navigate('/dashboard');
                } catch (error) { toast.error(error.message || "Error de acceso"); } finally { btn.textContent = original; btn.disabled = false; }
            });
            
            const passInput = document.getElementById('loginPassword');
            const toggleBtn = document.getElementById('toggleLoginPassword');
            toggleBtn.addEventListener('click', () => {
                const isPass = passInput.type === 'password';
                passInput.type = isPass ? 'text' : 'password';
                toggleBtn.innerHTML = isPass ? ICONS.eyeOff : ICONS.eye;
            });
            document.getElementById('registerLink').addEventListener('click', (e) => { e.preventDefault(); closeModal(); navigate('/register'); });
        }

        // --- ✅ NUEVA LÓGICA DE BÚSQUEDA ---
        
        // 1. Cargar opciones reales en el select
        try {
            const [distritos, deportes] = await Promise.all([
                api.getActiveLocations(),
                api.getSports()
            ]);

            const selectDist = document.getElementById('location');
            if (distritos.length) {
                selectDist.innerHTML = '<option value="">📍 Selecciona Distrito</option>' + 
                    distritos.map(d => `<option value="${d.distrito_id}">${d.nombre}</option>`).join('');
            } else {
                selectDist.innerHTML = '<option value="">Sin distritos</option>';
            }

            const selectSport = document.getElementById('sport');
            if (deportes.length) {
                selectSport.innerHTML = '<option value="">🏆 Cualquiera</option>' + 
                    deportes.map(d => `<option value="${d.value}">${d.label}</option>`).join('');
            }
        } catch (e) { console.error("Error cargando filtros home", e); }

        // 2. Configurar fecha hoy
        const dateInput = document.getElementById('date');
        if(dateInput) dateInput.value = new Date().toISOString().split('T')[0];

        // 3. Redirigir al Search View con parámetros
        document.getElementById('searchForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const loc = document.getElementById('location').value; // Ahora es ID
            const sport = document.getElementById('sport').value; // Ahora es ID
            const date = document.getElementById('date').value;
            
            if(!loc) { toast.warning("Por favor selecciona un distrito"); return; }
            
            // Navegación con Query Params
            navigate(`/search?location=${loc}&sport=${sport}&date=${date}`);
        });
    }
};

export default homeView;