import { navigate } from "../router.js";

export const UserTopNav = {
    /**
     * Renderiza la barra de navegación global.
     * @param {string} currentView - Identificador para marcar el ítem activo ('dashboard', 'search', 'favorites', etc).
     * @param {Object} user - Objeto de usuario logueado.
     */
    render: (currentView = '', user = null) => {
        const userName = user?.nombre?.split(' ')[0] || 'Invitado';
        const initial = user?.nombre?.charAt(0).toUpperCase() || 'U';
        const isActive = (view) => currentView === view ? 'active' : '';

        // Estilos críticos inyectados para asegurar visibilidad inmediata
        const navStyles = `
            <style>
                .user-top-nav { background: #ffffff; border-bottom: 1px solid #e2e8f0; }
                .nav-logo .logo-text { color: #0f172a; }
                .nav-item { color: #475569; }
                .nav-item:hover { color: #0f172a; background: #f1f5f9; }
                .nav-item.active { background: #2563eb; color: #ffffff !important; }
                .user-greeting { color: #64748b; }
                .user-name { color: #0f172a; }
            </style>
        `;

        return `
            ${navStyles}
            <header class="user-top-nav">
                <div class="nav-container">
                    <!-- LOGO DE LA MARCA -->
                    <div class="nav-logo" data-link="/dashboard" role="button" tabindex="0">
                        <img src="assets/images/logo.png" alt="ReserSport" class="logo-img" onerror="this.style.display='none'">
                        <!-- Fallback si no hay imagen -->
                        <div class="logo-icon-fallback" style="display:none;">R</div>
                        <span class="logo-text">ReserSport</span>
                    </div>
                    
                    <!-- NAVEGACIÓN CENTRAL -->
                    <nav class="nav-items" role="navigation">
                        <a href="/dashboard" class="nav-item ${isActive('dashboard')}" data-link="/dashboard" title="Inicio">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 01-1 1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                            <span class="nav-label">Inicio</span>
                        </a>
                        <a href="/search" class="nav-item ${isActive('search')}" data-link="/search" title="Buscar">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <span class="nav-label">Explorar</span>
                        </a>
                        <a href="/favorites" class="nav-item ${isActive('favorites')}" data-link="/favorites" title="Favoritos">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                            <span class="nav-label">Favoritos</span>
                        </a>
                        <a href="/reservations" class="nav-item ${isActive('reservations')}" data-link="/reservations" title="Mis Reservas">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            <span class="nav-label">Reservas</span>
                        </a>
                    </nav>
                    
                    <!-- PERFIL DE USUARIO -->
                    <div class="nav-user" id="userMenuBtn" aria-haspopup="true" aria-expanded="false" role="button" tabindex="0">
                        <div class="user-info">
                            <span class="user-greeting">Hola,</span>
                            <span class="user-name">${userName}</span>
                        </div>
                        <div class="user-avatar">${initial}</div>
                        
                        <!-- Dropdown Desplegable -->
                        <div class="user-dropdown" id="userDropdown" role="menu">
                            <div class="dropdown-header">
                                <span class="dropdown-user-name">${user?.nombre || 'Usuario'}</span>
                                <span class="dropdown-user-role">Deportista</span>
                            </div>
                            <div class="dropdown-divider"></div>
                            <a href="/profile" data-action="profile" role="menuitem">
                                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                Mi Perfil
                            </a>
                            <a href="#" data-action="logout" role="menuitem" class="logout-link">
                                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Cerrar Sesión
                            </a>
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    attachListeners: () => {
        const header = document.querySelector('.user-top-nav');
        if (!header) return;

        // Listener Global para el Header (Optimización)
        header.addEventListener('click', (e) => {
            // 1. Clic en Links (Navegación SPA)
            const linkElement = e.target.closest('[data-link]');
            if (linkElement) {
                e.preventDefault();
                navigate(linkElement.getAttribute('data-link'));
                return;
            }

            // 2. Clic en Menú Usuario (Dropdown)
            const userBtn = e.target.closest('#userMenuBtn');
            if (userBtn) {
                e.stopPropagation();
                const dropdown = document.getElementById('userDropdown');
                dropdown.classList.toggle('show');
                userBtn.setAttribute('aria-expanded', dropdown.classList.contains('show'));
                return;
            }

            // 3. Clic en Acciones del Dropdown
            const actionLink = e.target.closest('[data-action]');
            if (actionLink) {
                e.preventDefault();
                const action = actionLink.getAttribute('data-action');
                
                if (action === 'profile') navigate('/profile');
                if (action === 'logout') {
                    // Limpieza de sesión
                    localStorage.removeItem('reserSport_token');
                    localStorage.removeItem('reserSport_user');
                    // Redirigir al login
                    navigate('/login');
                }
            }
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('userDropdown');
            const userBtn = document.getElementById('userMenuBtn');
            if (dropdown && dropdown.classList.contains('show')) {
                if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('show');
                    if (userBtn) userBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
        
        // Manejar error de imagen del logo (mostrar fallback)
        const logoImg = header.querySelector('.logo-img');
        if(logoImg) {
            logoImg.onerror = function() {
                this.style.display = 'none';
                const fallback = header.querySelector('.logo-icon-fallback');
                if(fallback) fallback.style.display = 'flex';
            };
        }
    }
};