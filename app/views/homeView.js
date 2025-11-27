// app/views/homeView.js
import { navigate } from "../router.js"; 
import api from "../services/api.js";

const ICONS = {
    eye: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>`,
    eyeSlash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/></svg>`
};

let handleEscapeRef = null;

const homeView = {
  render: () => {
    // 1. LOGICA DE SESIÓN PARA LA CABECERA
    const user = api.getUser(); // Retorna null si no hay sesión
    let navContent = '';
    
    if (user) {
        // SI ESTÁ LOGUEADO: Muestra Avatar y Nombre
        const initial = user.nombre ? user.nombre.charAt(0).toUpperCase() : "U";
        navContent = `
            <div class="user-profile-menu" id="homeUserMenuBtn" style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                <div style="text-align:right; display:none; @media(min-width:768px){display:block;}">
                    <div style="font-weight:bold; font-size:0.9rem;">${user.nombre}</div>
                    <div class="small" style="color:var(--text-muted);">Deportista</div>
                </div>
                <div class="user-avatar">${initial}</div>
            </div>
        `;
    } else {
        // SI NO ESTÁ LOGUEADO: Muestra Botón Login
        navContent = `
            <button type="button" class="btn" id="btnOpenLogin">
                Iniciar sesión
            </button>
        `;
    }

    return `
      <div class="container">
        <!-- HEADER DINÁMICO -->
        <header class="user-header">
          <div class="logo">
            <img src="assets/images/logo.png" alt="ReserSport" onerror="this.src='https://placehold.co/60x60?text=Logo'">
            <div>
              <strong>ReserSport</strong>
              <div class="small">Reserva tu cancha</div>
            </div>
          </div>
          <nav aria-label="Navegación principal">
            <a href="/software">Software para clubes</a>
            <a href="/contact">Contacto</a>
            ${navContent}
          </nav>
        </header>

        <!-- MENÚ DESPLEGABLE (Solo si está logueado) -->
        <div id="homeUserDropdown" class="card" style="position:absolute; top:70px; right:20px; width:200px; display:none; z-index:100; padding:10px;">
            <a href="#" id="goDashboard" style="display:block; padding:10px; color:white; border-bottom:1px solid var(--glass);">Ir a mi Panel</a>
            <a href="#" id="doLogout" style="display:block; padding:10px; color:#ef4444;">Cerrar Sesión</a>
        </div>

        <main>
          <section class="hero" aria-labelledby="hero-title">
            <!-- ... (Fondo y Carrusel igual) ... -->
            <div class="hero-background">
              <div class="swiper hero-swiper">
                <div class="swiper-wrapper">
                  <div class="swiper-slide"><img src="assets/images/futbol.jpg" alt="Fútbol" onerror="this.style.display='none'"></div>
                  <div class="swiper-slide"><img src="assets/images/voley.jpg" alt="Voley" onerror="this.style.display='none'"></div>
                  <div class="swiper-slide"><img src="assets/images/tenis.jpg" alt="Tenis" onerror="this.style.display='none'"></div>
                </div>
              </div>
              <div class="hero-overlay"></div>
            </div>

            <div class="hero-content">
              <div>
                <h1 id="hero-title">Reserva tu cancha al instante</h1>
                <p>Explora canchas disponibles en tu ciudad y en tiempo real.</p>
                <div class="cities">
                  <strong>Presente en:</strong> Tacna | Moquegua | Arequipa | Lima | más
                </div>
              </div>

            <aside class="card">
              <form id="searchForm" class="search" novalidate>
                <div class="row">
                  <div class="field">
                    <label for="location" class="small">Ubicación (Distrito)</label>
                    <input id="location" class="input" placeholder="Ej. Pocollay" autocomplete="off" />
                  </div>
                </div>
                <div class="row">
                  <div class="field">
                    <label for="sport" class="small">Elige deporte</label>
                    <select id="sport" class="select">
                      <option value="futbol">Fútbol</option>
                      <option value="tenis">Tenis</option>
                      <option value="padel">Pádel</option>
                      <option value="voley">Vóley</option>
                    </select>
                  </div>
                  <div class="field" style="max-width:140px">
                    <label for="date" class="small">Fecha</label>
                    <input id="date" type="date" class="input" />
                  </div>
                </div>
                <div class="row" style="align-items:center">
                  <div class="field" style="flex:1">
                    <label for="time" class="small">Hora</label>
                    <input id="time" type="time" class="input" value="18:00" />
                  </div>
                  <button id="btnSearch" type="submit" class="btn-search">Buscar</button>
                </div>
              </form>
            </aside>
          </section>

          <!-- ... (Resto del Home igual) ... -->
           <section class="cta">
             <div class="cta-content"><strong>Ranking de las mejores canchas</strong></div>
             <a href="/ranking" class="btn">Ver ranking</a>
          </section>
        </main>
        
        <footer id="contact">
            <div class="copyright">&copy; <span id="year"></span> ReserSport</div>
        </footer>

        <!-- MODAL DE LOGIN (Igual que antes) -->
        <div id="loginModal" class="modal" style="display:none">
          <div class="modal-overlay" id="modalOverlay"></div>
          <div class="modal-content card">
            <button class="modal-close" id="modalCloseBtn">&times;</button>
            <h3>Iniciar sesión</h3>
            <form id="loginForm" novalidate>
              <div class="field">
                <label for="loginEmail" class="small">Email</label>
                <input type="email" id="loginEmail" class="input" required />
              </div>
              <div class="field" style="position:relative;">
                <label for="loginPassword" class="small">Contraseña</label>
                <input type="password" id="loginPassword" class="input" required minlength="6" />
                <button type="button" class="toggle-password" id="toggleLoginPassword"></button>
              </div>
              <div style="text-align:center; margin-top:16px">
                <span class="small">¿No tienes cuenta?</span><br>
                <a href="/register" id="registerLink">Regístrate aquí</a>
              </div>
              <div style="margin-top:16px;">
                  <button type="submit" class="btn" style="width:100%">Ingresar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  attachEventListeners: () => {
    // 1. SWIPER
    try {
        if (typeof Swiper !== 'undefined') {
            new Swiper('.hero-swiper', { loop: true, effect: 'fade', fadeEffect: { crossFade: true }, autoplay: { delay: 5000, disableOnInteraction: false } });
        }
    } catch (e) { console.error(e); }

    // 2. HEADER USUARIO LOGUEADO
    const menuBtn = document.getElementById('homeUserMenuBtn');
    const dropdown = document.getElementById('homeUserDropdown');
    if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', () => dropdown.style.display = 'none');
        document.getElementById('doLogout')?.addEventListener('click', () => api.logout());
        document.getElementById('goDashboard')?.addEventListener('click', () => navigate('/dashboard'));
    }

    // 3. LOGICA LOGIN (Solo si existe el botón)
    const openBtn = document.getElementById('btnOpenLogin');
    if (openBtn) {
        // Lógica del Modal completa...
        const modal = document.getElementById('loginModal');
        const closeBtn = document.getElementById('modalCloseBtn');
        const overlay = document.getElementById('modalOverlay');
        const openModal = () => { if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; } };
        const closeModal = () => { if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; } };

        openBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);
        handleEscapeRef = (e) => { if (e.key === 'Escape' && modal && modal.style.display === 'flex') closeModal(); };
        document.addEventListener('keydown', handleEscapeRef);
        
        // Formulario Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailVal = document.getElementById('loginEmail').value;
                const passwordVal = document.getElementById('loginPassword').value;
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = "Cargando..."; submitBtn.disabled = true;

                try {
                    const credentials = { correo: emailVal, contrasena: passwordVal };
                    const user = await api.login(credentials);
                    closeModal();
                    alert(`¡Bienvenido de nuevo, ${user.nombre}!`);
                    navigate('/dashboard'); 
                } catch (error) {
                    alert("Error: " + error.message);
                } finally {
                    submitBtn.textContent = originalText; submitBtn.disabled = false;
                }
            });
        }
        
        // Toggle Password e Ir a Registro
        // (Código de toggle y registro igual al anterior...)
        const toggleBtn = document.getElementById('toggleLoginPassword');
        const passInput = document.getElementById('loginPassword');
        if (toggleBtn && passInput) {
             toggleBtn.innerHTML = ICONS.eyeSlash;
             toggleBtn.addEventListener('click', () => {
                const isPass = passInput.type === 'password';
                passInput.type = isPass ? 'text' : 'password';
                toggleBtn.innerHTML = isPass ? ICONS.eye : ICONS.eyeSlash;
             });
        }
        document.getElementById('registerLink')?.addEventListener('click', (e) => {
            e.preventDefault(); closeModal(); navigate('/register');
        });
    }

    // 4. BUSCADOR (Redirige a /search)
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const loc = document.getElementById('location').value;
            const sport = document.getElementById('sport').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;

            if (!date) { alert("Selecciona una fecha"); return; }
            const query = new URLSearchParams({ location: loc, sport, date, time }).toString();
            window.history.pushState({}, "", `/search?${query}`);
            import("../router.js").then(r => r.handleLocation());
        });
    }

    // FAQ y Footer Year...
    document.getElementById('year').textContent = new Date().getFullYear();
    console.log("HomeView: Listeners activos");
  },

  cleanup: () => {
    if (handleEscapeRef) { document.removeEventListener('keydown', handleEscapeRef); handleEscapeRef = null; }
  }
};

export default homeView;