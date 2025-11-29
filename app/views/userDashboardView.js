import { navigate } from "../router.js";
import api from "../services/api.js";

const userDashboardView = {
  render: async () => {
    // 1. Verificar sesión
    if (!api.isLoggedIn()) { navigate("/"); return ""; }

    const user = api.getUser() || { nombre: "Deportista" };
    const initial = user.nombre ? user.nombre.charAt(0).toUpperCase() : "U";
    
    // 2. Verificar Rol
    const isStaff = api.isStaff();

    // 3. Configurar Botón Admin según Rol
    // Si ya es admin, el botón lo lleva al panel. Si no, le ofrece la opción.
    const adminBtnText = isStaff ? "Panel de Gestión" : "Publicar mi Cancha";
    const adminBtnIcon = isStaff ? "📊" : "🤝";
    // Color: Azul si ya es admin, Naranja/Accent si es una "oferta"
    const adminBtnStyle = isStaff 
        ? "background: #3b82f6; color: white;" 
        : "background: var(--accent); color: #0f172a;";

    return `
      <div class="container">
        
        <!-- HEADER -->
        <header class="user-header">
          <div class="logo">
            <img src="assets/images/logo.png" alt="ReserSport" onerror="this.src='https://placehold.co/60x60?text=Logo'">
            <div>
              <strong>ReserSport</strong>
              <div class="small">Panel de Usuario</div>
            </div>
          </div>
          
          <nav style="display:flex; align-items:center; gap:15px;">
            <a href="/software" class="hide-mobile">Software</a>

            <!-- BOTÓN DINÁMICO ADMIN/PARTNER -->
            <button id="btnAdminAction" class="btn" style="padding: 6px 15px; font-size: 0.85rem; display:flex; gap:5px; align-items:center; border:none; ${adminBtnStyle}">
                <span>${adminBtnIcon}</span> <span>${adminBtnText}</span>
            </button>

            <!-- Menú Usuario -->
            <div class="user-profile-menu" id="homeUserMenuBtn" style="cursor:pointer;">
                <div class="user-avatar">${initial}</div>
            </div>
          </nav>
        </header>

        <!-- DROPDOWN PERFIL -->
        <div id="homeUserDropdown" class="card" style="position:absolute; top:70px; right:20px; width:200px; display:none; z-index:100; padding:10px;">
            <div style="padding:10px; border-bottom:1px solid var(--glass); font-weight:bold; font-size:0.9rem;">${user.nombre}</div>
            <a href="#" id="doLogout" style="display:block; padding:10px; color:#ef4444;">Cerrar Sesión</a>
        </div>

        <main>
          <!-- HERO SECTION -->
          <section class="hero">
            <div class="hero-background">
              <div class="hero-overlay"></div>
              <!-- Imagen estática o swiper simplificado para el dashboard -->
               <img src="assets/images/futbol.jpg" style="width:100%; height:100%; object-fit:cover; opacity:0.4;">
            </div>

            <div class="hero-content">
              <div>
                <h1>Hola, ${user.nombre.split(' ')[0]}</h1>
                <p>¿Qué quieres jugar hoy?</p>
              </div>

              <!-- BUSCADOR -->
              <aside class="card">
                <form id="searchForm" class="search" novalidate>
                    <div class="row">
                        <div class="field">
                            <label class="small">Ubicación</label>
                            <input id="location" class="input" placeholder="Distrito..." />
                        </div>
                    </div>
                    <div class="row">
                        <div class="field">
                            <label class="small">Deporte</label>
                            <select id="sport" class="select">
                                <option value="futbol">Fútbol</option>
                                <option value="voley">Vóley</option>
                            </select>
                        </div>
                        <div class="field"><label class="small">Fecha</label><input id="date" type="date" class="input"></div>
                        <button type="submit" class="btn-search">Buscar</button>
                    </div>
                </form>
              </aside>
            </div>
          </section>

          <!-- TARJETAS DE ACCESO RÁPIDO -->
          <section class="container" style="margin-top: -30px; position: relative; z-index: 10; padding-bottom: 40px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                
                <!-- Mis Reservas -->
                <div class="card" id="cardMyReservations" style="cursor:pointer; border-left: 4px solid var(--accent);">
                    <div style="display:flex; justify-content:space-between;">
                        <div><h3>Mis Reservas</h3><p class="small">Ver mis partidos.</p></div>
                        <div style="font-size: 2rem;">📅</div>
                    </div>
                </div>

                <!-- Favoritos -->
                <div class="card" style="cursor:pointer; border-left: 4px solid #fbbf24;">
                    <div style="display:flex; justify-content:space-between;">
                        <div><h3>Favoritos</h3><p class="small">Mis canchas preferidas.</p></div>
                        <div style="font-size: 2rem;">⭐</div>
                    </div>
                </div>

                <!-- Tarjeta Admin (Replica la acción del botón del header) -->
                <div class="card" id="cardAdminAction" style="cursor:pointer; border-left: 4px solid #3b82f6;">
                    <div style="display:flex; justify-content:space-between;">
                        <div>
                            <h3>${isStaff ? 'Administración' : '¿Tienes Canchas?'}</h3>
                            <p class="small">${isStaff ? 'Gestionar mi complejo.' : 'Regístralas aquí.'}</p>
                        </div>
                        <div style="font-size: 2rem;">${isStaff ? '🏢' : '📢'}</div>
                    </div>
                </div>

            </div>
          </section>
        </main>

        <!-- ================= MODAL DE BIENVENIDA A GESTORES ================= -->
        <!-- Solo se muestra si NO tiene rol Admin/Gestor -->
        <div id="partnerModal" class="modal" style="display:none; align-items:center; justify-content:center;">
            <div class="modal-overlay" id="partnerOverlay"></div>
            <div class="modal-content card" style="max-width: 500px; text-align: center; position:relative; animation: slideUp 0.3s ease;">
                <button class="modal-close" id="partnerClose">&times;</button>
                
                <div style="margin-bottom:20px;">
                    <div style="font-size:3.5rem; margin-bottom:15px;">🏟️</div>
                    <h2 style="font-size:1.6rem; margin-bottom:10px; color:white;">Gestiona tu Complejo Deportivo</h2>
                    <p style="color:var(--text-muted); line-height:1.5;">
                        Únete a la red de ReserSport. Activa tu cuenta de <strong>Gestor</strong> y accede a herramientas profesionales.
                    </p>
                </div>

                <div style="text-align:left; background: rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="display:flex; gap:10px; margin-bottom:10px;">
                        <span>✅</span> <span>Control total de horarios y precios.</span>
                    </div>
                    <div style="display:flex; gap:10px; margin-bottom:10px;">
                        <span>✅</span> <span>Recepción de reservas online 24/7.</span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <span>✅</span> <span>Reportes de ingresos y ocupación.</span>
                    </div>
                </div>

                <button id="btnAcceptPartner" class="btn" style="width:100%; padding: 12px; font-size:1rem;">
                    ¡Quiero empezar a gestionar!
                </button>
                <p class="small" style="margin-top:15px; color:var(--text-muted);">Al aceptar, se actualizará tu perfil inmediatamente.</p>
            </div>
        </div>

      </div>
    `;
  },

  attachEventListeners: () => {
    // 1. Dropdown Usuario
    const menuBtn = document.getElementById('homeUserMenuBtn');
    const dropdown = document.getElementById('homeUserDropdown');
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', () => { if(dropdown) dropdown.style.display = 'none'; });
        document.getElementById('doLogout')?.addEventListener('click', () => api.logout());
    }

    // 2. Buscador (Fecha por defecto hoy)
    const dateInput = document.getElementById('date');
    if(dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    
    document.getElementById('searchForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const loc = document.getElementById('location').value;
        const sport = document.getElementById('sport').value;
        const date = document.getElementById('date').value;
        navigate(`/search?location=${loc}&sport=${sport}&date=${date}`);
    });

    // 3. LÓGICA CRÍTICA: BOTÓN ADMIN / PARTNER
    const btnAdminAction = document.getElementById('btnAdminAction');
    const cardAdminAction = document.getElementById('cardAdminAction');
    const modalPartner = document.getElementById('partnerModal');
    
    const handleAdminClick = () => {
        // LA LÓGICA QUE PEDISTE:
        if (api.isStaff()) {
            // SI YA TIENE ROL 1 o 2: Entra directo
            navigate('/admin');
        } else {
            // SI ES SOLO DEPORTISTA (ROL 3): Muestra el modal de bienvenida
            modalPartner.style.display = 'flex';
        }
    };

    if (btnAdminAction) btnAdminAction.addEventListener('click', handleAdminClick);
    if (cardAdminAction) cardAdminAction.addEventListener('click', handleAdminClick);

    // 4. Lógica del Modal (Aceptar y convertirse en Gestor)
    const closeModal = () => modalPartner.style.display = 'none';
    document.getElementById('partnerClose')?.addEventListener('click', closeModal);
    document.getElementById('partnerOverlay')?.addEventListener('click', closeModal);

    document.getElementById('btnAcceptPartner')?.addEventListener('click', async (e) => {
        const btn = e.target;
        const originalText = btn.textContent;
        btn.textContent = "Activando perfil...";
        btn.disabled = true;

        try {
            // Llamamos al servicio para impactar la BD
            await api.becomePartner(); 
            
            alert("¡Bienvenido! Tu perfil ha sido actualizado a Gestor.");
            closeModal();
            // Redirigimos al panel inmediatamente
            navigate('/admin');
        } catch (error) {
            alert("Error: " + error.message);
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });

    // Redirección Reservas
    document.getElementById('cardMyReservations')?.addEventListener('click', () => navigate('/reservations'));
  }
};

export default userDashboardView;