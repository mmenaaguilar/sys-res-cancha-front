import { navigate } from "../router.js";
import api from "../services/api.js";

export const AdminSidebar = {
    render: (activePage, user) => {
        const uName = user ? user.nombre.split(' ')[0] : 'Usuario';
        
        const currentComplejoId = localStorage.getItem('admin_last_complejo_id');
        const myRole = api.getRoleForComplex ? api.getRoleForComplex(currentComplejoId) : -1;
        const isOwner = myRole === 1;
        
        let roleLabel = 'Sin sede';
        let badgeStyle = 'background:rgba(148, 163, 184, 0.15); color:#94a3b8; border:1px solid rgba(148, 163, 184, 0.2);';

        if (currentComplejoId) {
            if (isOwner) {
                roleLabel = 'Dueño';
                badgeStyle = 'background:rgba(251, 191, 36, 0.15); color:#fbbf24; border:1px solid rgba(251, 191, 36, 0.2);';
            } else if (myRole === 2) {
                roleLabel = 'Gestor';
                badgeStyle = 'background:rgba(59, 130, 246, 0.15); color:#60a5fa; border:1px solid rgba(59, 130, 246, 0.2);';
            }
        }
        
        const isActive = (page) => page === activePage ? 'active' : '';

        // ✅ MENÚ ACTUALIZADO: "Gestores" visible para todos
        const menuHtml = `
            <div class="nav-section">Principal</div>
            
            <a href="#" class="nav-item ${isActive('complejos')}" data-link="/admin">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21V12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9"/></svg>
                Mis Complejos
            </a>
            
            <a href="#" class="nav-item ${isActive('canchas')}" data-link="/admin/canchas">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 12h20M12 2v20"/><circle cx="12" cy="12" r="3"/></svg>
                Gestión de Canchas
            </a>

            <div class="nav-section">Operaciones</div>
            
            <a href="#" class="nav-item ${isActive('servicios')}" data-link="/admin/servicios">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Servicios
            </a>

            <a href="#" class="nav-item ${isActive('reservas')}" data-link="/admin/reservas">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Reservas
            </a>

            <a href="#" class="nav-item ${isActive('politicas')}" data-link="/admin/politicas">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>
                Políticas
            </a>
            
            <a href="#" class="nav-item ${isActive('contactos')}" data-link="/admin/contactos">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Contactos
            </a>

            <div class="nav-section">Administración</div>
            <a href="#" class="nav-item ${isActive('gestores')}" data-link="/admin/gestores">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                Equipo / Gestores
            </a>
        `;

        return `
            <aside class="admin-sidebar">
                <div class="sidebar-header">
                    <img src="assets/images/logo.png" alt="ReserSport" onerror="this.style.opacity='0.6'; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><path d=%22M3 21h18M5 21V7l8-4 8 4v14M8 21V12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9%22/></svg>'">
                    <div class="user-info">
                        <h3>Panel Admin</h3>
                        <div class="user-role">
                            <span>${uName}</span>
                            <span class="role-badge" style="${badgeStyle}">${roleLabel}</span>
                        </div>
                    </div>
                </div>
                
                <nav class="sidebar-nav">
                    ${menuHtml}
                </nav>

                <div class="sidebar-footer">
                    <button class="btn-back" id="btnBackToApp">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                        Volver al App
                    </button>
                </div>
            </aside>
        `;
    },

    attachListeners: () => {
        document.querySelectorAll('.nav-item[data-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('data-link');
                if (window.location.pathname === href) {
                    window.location.reload();
                } else {
                    navigate(href);
                }
            });
        });

        document.getElementById('btnBackToApp')?.addEventListener('click', () => navigate('/dashboard'));
    }
};