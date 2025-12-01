// app/components/UserBottomNav.js
import { navigate } from "../router.js";

export const UserBottomNav = {
    render: (currentView = '') => {
        const isReservations = currentView === 'reservations';
        const isSearch = currentView === 'search';
        const isDashboard = currentView === 'dashboard';
        const isProfile = currentView === 'profile';

        return `
            <nav class="bottom-nav">
                <div class="nav-item" data-view="dashboard" ${isDashboard ? 'data-active="true"' : ''}>
                    <div class="nav-icon">${UserBottomNav.icons.home}</div>
                    <span class="nav-label">Inicio</span>
                </div>
                <div class="nav-item" data-view="search" ${isSearch ? 'data-active="true"' : ''}>
                    <div class="nav-icon">${UserBottomNav.icons.search}</div>
                    <span class="nav-label">Buscar</span>
                </div>
                <div class="nav-item" data-view="reservations" ${isReservations ? 'data-active="true"' : ''}>
                    <div class="nav-icon">${UserBottomNav.icons.calendar}</div>
                    <span class="nav-label">Reservas</span>
                </div>
                <div class="nav-item" data-view="profile" ${isProfile ? 'data-active="true"' : ''}>
                    <div class="nav-icon">${UserBottomNav.icons.user}</div>
                    <span class="nav-label">Perfil</span>
                </div>
            </nav>
        `;
    },

    attachListeners: () => {
        document.querySelectorAll('.nav-item[data-view]').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                let path = '/';
                
                switch(view) {
                    case 'dashboard':
                        path = '/dashboard';
                        break;
                    case 'search':
                        path = '/search';
                        break;
                    case 'reservations':
                        path = '/reservations';
                        break;
                    case 'profile':
                        path = '/profile';
                        break;
                }
                
                navigate(path);
            });
        });
    },

    icons: {
        home: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        search: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
        calendar: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
        user: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    }
};