// app/views/homeView.js
const homeView = {
  render: () => {
    return `
      <div class="container">
        <header>
          <div class="logo">
            <img src="assets/images/logo.png" alt="ReserSport">
            <div>
              <strong>ReserSport</strong>
              <div class="small">Reserva tu cancha</div>
            </div>
          </div>
          <nav aria-label="Navegación principal">
            <a href="#" onclick="router.navigate('/software')">Software para clubes</a>
            <a href="#" onclick="router.navigate('/contact')">Resevas</a>
            <button type="button" class="btn" onclick="window.openLoginModal()">
            Iniciar sesión
            </button>
          </nav>
        </header>

        <main>
          <section class="hero" aria-labelledby="hero-title">
            <div>
              <h1 id="hero-title">Reserva tu cancha al instante</h1>
              <p>Explora canchas disponibles en tu ciudad y en tiempo real. Busca por deporte, fecha y horario — gestiona reservas desde la app o la web.</p>
              <div class="cities">
                <strong>Presente en:</strong> Tacna | Moquegua | Arequipa | Lima | Cusco | más
              </div>
            </div>

            <aside class="card">
              <form id="searchForm" class="search" novalidate>
                <div class="row">
                  <div class="field">
                    <label for="location" class="small">Ubicación</label>
                    <input id="location" class="input" placeholder="Cargando ubicación..." autocomplete="off" />
                  </div>
                </div>
                <div class="row">
                  <div class="field">
                    <label for="sport" class="small">Elige deporte</label>
                    <select id="sport" class="select">
                      <option value="padel">Pádel</option>
                      <option value="futbol">Fútbol</option>
                      <option value="tenis">Tenis</option>
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
                    <input id="time" type="time" class="input" value="18:30" />
                  </div>
                  <button id="btnSearch" type="submit" class="btn-search">Buscar</button>
                </div>
                <div id="searchResult" style="margin-top:10px;color:var(--muted);font-size:14px"></div>
              </form>
            </aside>
          </section>

          <section class="features" id="software" aria-labelledby="features-title">
            <div class="feature card">
              <div class="feature-title">Organizador de partidos</div>
              <div class="small">Únete a partidos o crea el tuyo. Encuentra jugadores cerca.</div>
            </div>
            <div class="feature card">
              <div class="feature-title">Gestión para clubes</div>
              <div class="small">Reserva, cobro y administración de canchas en un solo lugar.</div>
            </div>
            <div class="feature card">
              <div class="feature-title">App móvil</div>
              <div class="small">Disponibilidad y notificaciones en tiempo real para tus clientes.</div>
            </div>
          </section>

          <section class="cta" role="region" aria-label="Ranking de canchas">
            <div class="cta-content">
              <strong>Ranking de las mejores canchas</strong>
              <div class="small">Te mostramos las mejores canchas de Perú.</div>
            </div>
            <a href="#" class="btn" onclick="router.navigate('/ranking')">Ver ranking</a>
          </section>

          <section class="card" style="margin-top:18px" aria-labelledby="faq-title">
            <h2 id="faq-title">Preguntas frecuentes</h2>
            <div class="faq">
              <div class="q">¿Cómo me registro para sacar un turno?</div>
              <div class="a">Selecciona tu zona y horario, elige un club y se te pedirá iniciar sesión. Recibirás un email con un enlace para ingresar.</div>
              <div class="q">¿La reserva es instantánea?</div>
              <div class="a">Sí: las reservas se confirman en tiempo real según la disponibilidad que mantenga el club.</div>
              <div class="q">¿Cómo doy de baja una reserva?</div>
              <div class="a">Desde "Mis reservas" en tu cuenta o desde el enlace del email de confirmación.</div>
            </div>
          </section>

          <section style="margin-top:22px" aria-label="Ciudades disponibles">
            <h3>Reservar en:</h3>
            <div class="cities-list">
              <span class="city-tag">Tacna</span>
              <span class="city-tag">Moquegua</span>
              <span class="city-tag">Arequipa</span>
              <span class="city-tag">Lima</span>
              <span class="city-tag">Más</span>
            </div>
          </section>
        </main>

        <footer id="contact" aria-labelledby="footer-title">
          <h2 class="visually-hidden">Contacto y enlaces</h2>
          <div class="footer-grid">
            <div>
              <strong>ReserSport</strong>
              <p class="small" style="margin-top:8px">Software para gestión de complejos deportivos y app para reservas en Perú.</p>
              <p class="small" style="margin-top:8px">contacto@resersport.io</p>
              <div class="footer-links">
                <a href="#" onclick="router.navigate('/privacy')">Políticas de privacidad</a>
                <a href="#" onclick="router.navigate('/terms')">Términos</a>
              </div>
            </div>
            <div>
              <div class="small">Descarga la app</div>
              <div class="app-stores">
                <div class="store-btn">Google Play</div>
                <div class="store-btn">App Store</div>
              </div>
            </div>
          </div>
          <div class="copyright">
            &copy; <span id="year"></span> ReserSport — Todos los derechos reservados
          </div>
        </footer>

        <!-- ✅ MODAL DE LOGIN -->
        <div id="loginModal" class="modal" style="display:none">
          <div class="modal-overlay" onclick="window.closeLoginModal()"></div>
          <div class="modal-content card">
            <button class="modal-close" onclick="window.closeLoginModal()">&times;</button>
            <h3>Iniciar sesión</h3>
            <form id="loginForm" novalidate>
              <div class="field">
                <label for="loginEmail" class="small">Email</label>
                <input type="email" id="loginEmail" class="input" required />
              </div>
              <div class="field" style="position:relative;">
              <label for="loginPassword" class="small">Contraseña</label>
              <input type="password" id="loginPassword" class="input" required minlength="6" />
              <button type="button" class="toggle-password" 
                      onclick="togglePasswordVisibility('loginPassword')">
                👁️
              </button>
            </div>
            <div style="text-align:center; margin-top:16px">
              <span class="small">¿No tienes cuenta?</span>
              <br>
              <a href="#" id="registerLink">Regístrate aquí</a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  attachEventListeners: () => {
    // Año en el footer
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    // Geolocalización simulada
    const locInput = document.getElementById('location');
    if (locInput) {
      const setLocationText = (text) => {
        locInput.placeholder = text;
      };
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => setLocationText('Ubicación detectada (ej. Lima)'),
          () => setLocationText('Ingresa tu ciudad')
        );
      } else {
        setLocationText('Ingresa tu ciudad');
      }
    }

    // Búsqueda simulada
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const sport = document.getElementById('sport')?.value || 'deporte';
        const date = document.getElementById('date')?.value || 'mañana';
        const time = document.getElementById('time')?.value || '18:30';
        const result = document.getElementById('searchResult');
        if (result) {
          result.textContent = `Buscando ${sport} - ${date} a las ${time}...`;
          setTimeout(() => {
            if (result) {
              result.innerHTML = `<strong>3 clubes encontrados cerca de ti</strong>
                <ul style="margin-top:8px; padding-left:16px; font-size:0.9rem;">
                  <li>Club A — 1 cancha disponible</li>
                  <li>Club B — 2 canchas</li>
                  <li>Club C — 1 cancha</li>
                </ul>`;
            }
          }, 800);
        }
      });
    }

    // FAQ toggle
    document.querySelectorAll('.faq .q').forEach(q => {
      q.addEventListener('click', function () {
        const a = this.nextElementSibling;
        if (a && a.classList.contains('a')) {
          a.style.display = a.style.display === 'block' ? 'none' : 'block';
        }
      });
    });

    // ✅ FUNCIONES DEL MODAL DE LOGIN
    window.openLoginModal = () => {
      const modal = document.getElementById('loginModal');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    };

    window.closeLoginModal = () => {
      const modal = document.getElementById('loginModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    };

    // Cerrar modal con tecla Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('loginModal');
        if (modal && modal.style.display === 'flex') {
          window.closeLoginModal();
        }
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Formulario de login (solo frontend)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // ✅ Simulación visual (en el futuro: llamada a API)
        alert(`¡Has iniciado sesión con ${email}!`);
        window.closeLoginModal();

        // 👉 Aquí iría: router.navigate('/dashboard');
      });
    }

    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
    registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.closeLoginModal();
    window.router.navigate('#/register');
    });
    }
        // Función para mostrar/ocultar contraseña
    window.togglePasswordVisibility = (fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.type = field.type === 'password' ? 'text' : 'password';
      }
    };

    console.log("HomeView: Event Listeners adjuntados.");
  },

  
};

export default homeView;