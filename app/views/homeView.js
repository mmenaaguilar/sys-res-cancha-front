import { navigate } from "../router.js";
import { authService } from "../services/auth.service.js";
import { toast } from "../utils/toast.js";

// Iconos para el Modal (Eye/EyeOff)
const ICONS = {
    eye: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3-2.3M1 1l22 22"/></svg>`
};

const HomeView = {
  render: async () => {
    return `
      <div class="landing-page">
        
        <section class="hero-section">
            
            <div class="hero-carousel">
                <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1936&auto=format&fit=crop');"></div>
                <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1770&auto=format&fit=crop');"></div>
                <div class="slide" style="background-image: url('https://images.unsplash.com/photo-1624880357913-a8539238245b?q=80&w=1770&auto=format&fit=crop');"></div>
            </div>
            <div class="hero-overlay"></div>

            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="main-title">Conecta, Reserva y Juega <br><span class="text-gradient">Sin Límites</span></h1>
                    <p class="hero-subtitle">
                        Bienvenido a <strong>ReserSport</strong>. La solución integral donde los deportistas encuentran su cancha ideal y los administradores llevan su complejo al siguiente nivel.
                    </p>
                    
                    <div class="hero-buttons">
                        <button id="btnOpenLogin" class="btn-primary-lg">
                            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                            Únete / Iniciar Sesión
                        </button>
                    </div>
                </div>
                
                <div class="hero-image">
                    <div class="logo-container-glow">
                        <img src="assets/images/logo.png" alt="ReserSport Logo" class="floating-logo">
                    </div>
                </div>
            </div>
            
            <div class="custom-shape-divider-bottom">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" class="shape-fill"></path>
                </svg>
            </div>
        </section>

        <section class="features-section" id="info">
            <div class="container">
                <h2 class="section-title">Un Solo Sistema, Dos Mundos</h2>
                <p class="section-desc">Ya seas un jugador apasionado o el dueño de un complejo, ReserSport se adapta a ti.</p>
                
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="icon-box user-color">
                            <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <h3>Para Jugadores</h3>
                        <p>Accede a tu panel personal para encontrar disponibilidad en tiempo real.</p>
                        <ul class="feature-list">
                            <li>
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px; color:#10b981"><polyline points="20 6 9 17 4 12"/></svg>
                                Reserva en segundos sin llamadas
                            </li>
                            <li>
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px; color:#10b981"><polyline points="20 6 9 17 4 12"/></svg>
                                Guarda tus canchas favoritas
                            </li>
                            <li>
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px; color:#10b981"><polyline points="20 6 9 17 4 12"/></svg>
                                Historial completo de tus partidos
                            </li>
                        </ul>
                    </div>

                    <div class="feature-card highlight">
                        <div class="icon-box admin-color">
                            <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        </div>
                        <h3>Panel de Administrador</h3>
                        <p>Crea complejos desde tu cuenta y accede a herramientas de gestión profesional.</p>
                        <ul class="feature-list">
                            <li>
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px; color:#3b82f6"><polyline points="20 6 9 17 4 12"/></svg>
                                Gestión total de Canchas y Horarios
                            </li>
                            <li>
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px; color:#3b82f6"><polyline points="20 6 9 17 4 12"/></svg>
                                Control de Precios y Disponibilidad
                            </li>
                            <li>
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px; color:#3b82f6"><polyline points="20 6 9 17 4 12"/></svg>
                                Gestión de Co-Administradores (Staff)
                            </li>
                        </ul>
                    </div>

                    <div class="feature-card">
                        <div class="icon-box tech-color">
                            <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                        <h3>Comunidad Deportiva</h3>
                        <p>ReserSport crece contigo. Una plataforma segura accesible desde cualquier dispositivo.</p>
                        <ul class="feature-list">
                            <li>
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px; color:#8b5cf6"><polyline points="20 6 9 17 4 12"/></svg>
                                Plataforma Web 100% Responsive
                            </li>
                            <li>
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px; color:#8b5cf6"><polyline points="20 6 9 17 4 12"/></svg>
                                Perfiles de Complejos Verificados
                            </li>
                            <li>
                                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px; color:#8b5cf6"><polyline points="20 6 9 17 4 12"/></svg>
                                Soporte Técnico Dedicado
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section class="faq-section">
            <div class="container">
                <h2 class="section-title">Preguntas Frecuentes</h2>
                <div class="faq-grid">
                    <div class="faq-item">
                        <h4>¿Cómo registro mi complejo deportivo?</h4>
                        <p>Es muy simple: Inicia sesión en tu cuenta. Una vez dentro, ingresa al <strong>Panel de Administración</strong> y verás el menú completo de opciones donde podrás crear tu complejo, configurar canchas y empezar a gestionar.</p>
                    </div>
                    <div class="faq-item">
                        <h4>¿Puedo tener ayuda para administrar?</h4>
                        <p>Sí. ReserSport te permite agregar a otros usuarios como "Staff" o co-administradores para que te ayuden a gestionar la disponibilidad sin compartir tu contraseña personal.</p>
                    </div>
                    <div class="faq-item">
                        <h4>¿Tiene algún costo para el jugador?</h4>
                        <p>No. Para los deportistas, el uso de ReserSport es totalmente gratuito. Solo pagas el costo del alquiler de la cancha directamente al complejo según sus tarifas.</p>
                    </div>
                    <div class="faq-item">
                        <h4>¿Qué métodos de pago aceptan?</h4>
                        <p>Cada complejo define sus propios métodos. La mayoría acepta <strong>Yape, Plin y Efectivo</strong> en el local. Podrás ver los detalles de pago antes de confirmar tu reserva.</p>
                    </div>
                </div>
            </div>
        </section>

        <footer class="main-footer">
            <div class="footer-content container">
                <div class="footer-col">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                        <img src="assets/images/logo.png" width="40" alt="Logo">
                        <h3 style="margin:0; color:white;">ReserSport</h3>
                    </div>
                    <p>La plataforma definitiva para el deporte. Conectamos pasión con infraestructura de manera simple y eficiente.</p>
                </div>
                <div class="footer-col">
                    <h4>Navegación</h4>
                    <button class="link-btn" id="footerLoginBtn">Ingresar</button>
                    <button class="link-btn" id="footerRegisterBtn">Registrarse</button>
                </div>
                <div class="footer-col">
                    <h4>Contacto & Soporte</h4>
                    <p style="display:flex; align-items:center; gap:8px;">soporte@resersport.com</p>
                    <p style="display:flex; align-items:center; gap:8px;">+51 999 996 219</p>
                    <p style="display:flex; align-items:center; gap:8px;">Tacna, Perú</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 ReserSport. Todos los derechos reservados.</p>
            </div>
        </footer>

        <div id="loginModal" class="modal" style="display:none; backdrop-filter:blur(8px);">
            <div class="modal-overlay" id="modalOverlay"></div>
            <div class="modal-content card" style="max-width:400px; width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.1); padding:30px; border-radius:16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <button class="modal-close" id="modalCloseBtn" style="position:absolute; top:15px; right:15px; background:none; border:none; color:#94a3b8; font-size:1.5rem; cursor:pointer;">&times;</button>
                
                <div style="text-align:center; margin-bottom:25px;">
                    <div style="width:50px; height:50px; background:linear-gradient(135deg, #3b82f6, #2563eb); border-radius:12px; display:flex; align-items:center; justify-content:center; margin:0 auto 15px auto;">
                        <img src="assets/images/logo.png" style="width:30px;">
                    </div>
                    <h3 style="font-size:1.5rem; color:white; margin:0;">Bienvenido</h3>
                    <p style="color:#94a3b8; margin-top:5px; font-size:0.95rem;">Ingresa a tu cuenta deportiva</p>
                </div>

                <form id="loginForm" novalidate>
                    <div class="field" style="margin-bottom:15px;">
                        <label style="color:#cbd5e1; font-size:0.9rem; margin-bottom:5px; display:block;">Correo Electrónico</label>
                        <input type="email" id="loginEmail" style="width:100%; padding:12px; background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:white; outline:none;" placeholder="ejemplo@correo.com" required />
                    </div>
                    
                    <div class="field" style="margin-bottom:25px; position:relative;">
                        <label style="color:#cbd5e1; font-size:0.9rem; margin-bottom:5px; display:block;">Contraseña</label>
                        <input type="password" id="loginPassword" style="width:100%; padding:12px; background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:white; outline:none;" placeholder="••••••••" required />
                        <button type="button" id="toggleLoginPassword" style="position:absolute; right:10px; top:45px; background:none; border:none; color:#64748b; cursor:pointer;">
                            ${ICONS.eye}
                        </button>
                    </div>

                    <button type="submit" style="width:100%; background:linear-gradient(135deg, #3b82f6, #2563eb); border:none; color:white; padding:12px; border-radius:8px; font-weight:600; font-size:1rem; cursor:pointer; transition:all 0.2s;">
                        INGRESAR
                    </button>
                </form>

                <div style="text-align:center; margin-top:20px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.05);">
                    <a href="#" id="registerLink" style="color:#60a5fa; text-decoration:none; font-size:0.9rem;">¿No tienes cuenta? Regístrate gratis</a>
                </div>
            </div>
        </div>

      </div>

      <style>
        /* --- ESTILOS GENERALES (SaaS) --- */
        :root {
            --bg-dark: #0f172a;
            --bg-card: #1e293b;
            --primary: #3b82f6;
            --primary-glow: rgba(59, 130, 246, 0.5);
            --accent: #10b981;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }

        .landing-page {
            font-family: 'Inter', system-ui, sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-main);
            overflow-x: hidden;
            width: 100%;
        }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

        /* --- HERO --- */
        .hero-section { position: relative; min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; padding-top: 60px; }
        
        .hero-carousel { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
        .slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; opacity: 0; animation: slideAnimation 18s infinite; }
        .slide:nth-child(1) { animation-delay: 0s; }
        .slide:nth-child(2) { animation-delay: 6s; }
        .slide:nth-child(3) { animation-delay: 12s; }

        @keyframes slideAnimation {
            0% { opacity: 0; transform: scale(1); }
            5% { opacity: 1; }
            33% { opacity: 1; transform: scale(1.05); } 
            38% { opacity: 0; }
            100% { opacity: 0; }
        }

        .hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)); z-index: 1; }
        .hero-content { position: relative; z-index: 2; display: grid; grid-template-columns: 1fr 1fr; align-items: center; max-width: 1200px; width: 100%; padding: 20px; }
        .hero-text { padding-right: 40px; }
        .main-title { font-size: 3.5rem; line-height: 1.1; margin-bottom: 25px; font-weight: 800; color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
        .text-gradient { background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-subtitle { font-size: 1.15rem; color: #e2e8f0; margin-bottom: 40px; line-height: 1.6; max-width: 550px; text-shadow: 0 1px 4px rgba(0,0,0,0.8); }
        .hero-buttons { display: flex; gap: 15px; }

        .btn-primary-lg {
            background: linear-gradient(135deg, var(--primary) 0%, #2563eb 100%);
            color: white; border: none; padding: 14px 28px; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer;
            box-shadow: 0 10px 20px -5px var(--primary-glow); transition: all 0.2s; display: inline-flex; align-items: center; gap: 10px;
        }
        .btn-primary-lg:hover { transform: translateY(-3px); box-shadow: 0 15px 25px -5px var(--primary-glow); filter: brightness(1.1); }

        .hero-image { display: flex; justify-content: center; align-items: center; }
        .logo-container-glow { width: 380px; height: 380px; background: radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .floating-logo { width: 240px; animation: float 6s ease-in-out infinite; filter: drop-shadow(0 0 30px rgba(59,130,246,0.4)); }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }

        .custom-shape-divider-bottom { position: absolute; bottom: 0; left: 0; width: 100%; overflow: hidden; line-height: 0; z-index: 3; }
        .custom-shape-divider-bottom svg { position: relative; display: block; width: calc(100% + 1.3px); height: 80px; }
        .shape-fill { fill: var(--bg-card); }

        /* --- FEATURES & FAQ --- */
        .features-section, .faq-section { padding: 100px 0; position: relative; z-index: 3; }
        .features-section { background-color: var(--bg-card); }
        .faq-section { background: var(--bg-dark); }
        
        .section-title { text-align: center; font-size: 2.5rem; margin-bottom: 10px; color: white; }
        .section-desc { text-align: center; color: var(--text-muted); max-width: 600px; margin: 0 auto 60px auto; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
        .feature-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 40px; border-radius: 20px; transition: all 0.3s ease; }
        .feature-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
        .feature-card.highlight { background: linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%); border: 1px solid rgba(59, 130, 246, 0.3); box-shadow: 0 0 30px rgba(59, 130, 246, 0.05); }

        .icon-box { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; }
        .user-color { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .admin-color { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .tech-color { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

        .feature-card h3 { font-size: 1.5rem; margin-bottom: 15px; color: white; }
        .feature-card p { color: var(--text-muted); line-height: 1.6; margin-bottom: 25px; min-height: 50px; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { margin-bottom: 12px; color: #cbd5e1; font-size: 0.95rem; display: flex; align-items: center; }

        .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; }
        .faq-item { background: var(--bg-card); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
        .faq-item h4 { color: white; margin-bottom: 12px; font-size: 1.1rem; }
        .faq-item p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; }

        /* --- FOOTER --- */
        .main-footer { background: #020617; padding: 80px 0 20px 0; border-top: 1px solid rgba(255,255,255,0.05); position: relative; z-index: 3; }
        .footer-content { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 50px; margin-bottom: 50px; }
        .footer-col h4 { color: white; margin-bottom: 20px; font-size: 1.1rem; }
        .footer-col p { color: var(--text-muted); line-height: 1.6; font-size: 0.9rem; margin-bottom: 10px; }
        .footer-col a, .link-btn { display: block; color: var(--text-muted); text-decoration: none; margin-bottom: 10px; transition: color 0.2s; font-size: 0.9rem; background:none; border:none; padding:0; cursor:pointer; font-family:inherit;}
        .footer-col a:hover, .link-btn:hover { color: var(--primary); }
        .footer-bottom { text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); color: #64748b; font-size: 0.85rem; }

        /* --- MODAL ESTILOS --- */
        .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 200; display: flex; align-items: center; justify-content: center; }
        .modal-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); }
        .modal-content { position: relative; z-index: 210; animation: modalUp 0.3s ease-out; }
        @keyframes modalUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        @media (max-width: 900px) {
            .hero-content { grid-template-columns: 1fr; text-align: center; padding-top: 40px; }
            .hero-text { padding-right: 0; }
            .hero-buttons { justify-content: center; }
            .hero-image { margin-top: 40px; }
            .logo-container-glow { width: 280px; height: 280px; }
            .floating-logo { width: 160px; }
            .main-title { font-size: 2.5rem; }
            .footer-content, .faq-grid { grid-template-columns: 1fr; text-align: center; }
            .footer-col { align-items: center; display: flex; flex-direction: column; }
        }
      </style>
    `;
  },

  attachEventListeners: async () => {
    // Referencias al Modal
    const openBtn = document.getElementById('btnOpenLogin');
    const modal = document.getElementById('loginModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const overlay = document.getElementById('modalOverlay');

    // Botones del footer que también abren/llevan al login/registro
    const footerLogin = document.getElementById('footerLoginBtn');
    const footerRegister = document.getElementById('footerRegisterBtn');

    if (modal) {
        // Función para abrir modal
        const openModal = () => {
            modal.style.display = 'flex';
            const emailInput = document.getElementById('loginEmail');
            if(emailInput) emailInput.focus();
        };

        // Función para cerrar modal
        const closeModal = () => { 
            modal.style.display = 'none'; 
        };

        // Eventos de apertura
        if(openBtn) openBtn.addEventListener('click', openModal);
        if(footerLogin) footerLogin.addEventListener('click', openModal);
        
        // Eventos de cierre
        if(closeBtn) closeBtn.addEventListener('click', closeModal);
        if(overlay) overlay.addEventListener('click', closeModal);

        // Evento Footer Registro (Navegación Directa)
        if(footerRegister) footerRegister.addEventListener('click', () => navigate('/register'));

        // Evento LOGIN FORM
       const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // 1. Bloqueamos el botón para evitar doble clic
                const btn = loginForm.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = "VERIFICANDO...";
                btn.disabled = true;
                btn.style.opacity = '0.7';

                try {
                    const email = document.getElementById('loginEmail').value;
                    const pass = document.getElementById('loginPassword').value;
                    
                    // 2. Intentamos loguear
                    const user = await authService.login({ correo: email, contrasena: pass });
                    
                    // 3. Validación extra: Si el servicio no devuelve usuario, forzamos error
                    if (!user) throw new Error("No se recibieron datos del usuario");

                    closeModal(); 
                    toast.success(`¡Bienvenido, ${user.nombre || 'Usuario'}!`);
                    navigate('/dashboard'); 

                } catch (error) {
                    console.error("Error login:", error);
                    toast.error("Correo o contraseña incorrectos");
                    
                    // Opcional: Limpiar solo el campo de contraseña
                    document.getElementById('loginPassword').value = '';
                    document.getElementById('loginPassword').focus();
                } finally {
                    // 4. Restauramos el botón siempre
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                }
            });
        }

        // Toggle Password Visibility
        const toggleBtn = document.getElementById('toggleLoginPassword');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const passInput = document.getElementById('loginPassword');
                const isPass = passInput.type === 'password';
                passInput.type = isPass ? 'text' : 'password';
                toggleBtn.innerHTML = isPass ? ICONS.eyeOff : ICONS.eye;
            });
        }

        const registerLink = document.getElementById('registerLink');
        if(registerLink) {
            registerLink.addEventListener('click', (e) => {
                e.preventDefault(); // Evita comportamiento por defecto
                closeModal(); // Cierra el modal primero
                navigate('/register'); // Navega a la vista de registro
            });
        }
    }
  }
};

export default HomeView;