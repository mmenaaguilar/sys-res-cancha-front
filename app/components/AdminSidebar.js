import { navigate } from "../router.js";

export const AdminSidebar = {
    /**
     * Genera el HTML del Sidebar
     * @param {string} activePage - Identificador de la página actual ('complejos', 'canchas', 'servicios', 'contactos', 'horarios')
     * @param {object} user - Objeto de usuario para mostrar nombre/avatar
     */
    render: (activePage, user) => {
        const uName = user ? user.nombre : 'Usuario';
        
        // Función helper para marcar activo
        const isActive = (page) => page === activePage ? 'active' : '';

        return `
            <aside class="admin-sidebar">
                <div class="sidebar-header">
                    <img src="assets/images/logo.png" alt="ReserSport" onerror="this.style.display='none'">
                    <div>
                        <h3>Panel Admin</h3>
                        <span class="status active" style="font-size:0.65rem; padding:2px 6px; margin-top:4px;">${uName}</span>
                    </div>
                </div>
                
                <nav class="sidebar-nav">
                    <div class="nav-label">PRINCIPAL</div>
                    
                    <a href="#" class="nav-link ${isActive('complejos')}" data-link="/admin">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21V12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9"/></svg>
                        Mis Complejos
                    </a>
                    
                    <a href="#" class="nav-link ${isActive('canchas')}" data-link="/admin/canchas">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 12h20M12 2v20"/><circle cx="12" cy="12" r="3"/></svg>
                        Gestión de Canchas
                    </a>

                    <div class="nav-label">OPERACIONES</div>
                    
                    <!-- ✅ SERVICIOS (NUEVO) -->
                    <a href="#" class="nav-link ${isActive('servicios')}" data-link="/admin/servicios">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        Servicios
                    </a>

                    <a href="#" class="nav-link ${isActive('contactos')}" data-link="/admin/contactos">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        Contactos
                    </a>

                    <a href="#" style="opacity:0.5; cursor:not-allowed;" class="nav-link">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Reservas
                    </a>

                    <a href="#" class="nav-link ${isActive('politicas')}" data-link="/admin/politicas">
                        <span class="nav-icon">
                            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>
                        </span>
                        <span>Políticas</span>
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <button class="btn" id="btnBackToApp" style="width:100%; background:rgba(255,255,255,0.05);">
                        Volver al App
                    </button>
                </div>
            </aside>
        `;
    },

    /**
     * Activa los listeners de navegación del sidebar
     */
    attachListeners: () => {
        // Navegación interna SPA
        document.querySelectorAll('.nav-link[data-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('data-link');
                // Si ya estamos en la página, recargamos (opcional)
                if (window.location.pathname === href) {
                    window.location.reload();
                } else {
                    navigate(href);
                }
            });
        });

        // Volver al Dashboard
        document.getElementById('btnBackToApp')?.addEventListener('click', () => navigate('/dashboard'));
    }
};