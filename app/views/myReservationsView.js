import { navigate } from "../router.js";
import api from "../services/api.js";
import { UserTopNav } from "../components/UserTopNav.js";

// --- ICONOS SVG PROFESIONALES ---
const ICONS = {
    calendar: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    clock: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    location: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    sport: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`, // Trofeo genérico
    empty: `<svg width="64" height="64" fill="none" stroke="#94a3b8" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    search: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
};

const myReservationsView = {
    render: async () => {
        if (!api.isLoggedIn()) { navigate("/"); return ""; }
        const user = api.getUser();

        setTimeout(() => {
            const nav = document.getElementById('resTopNav');
            if(nav) { nav.innerHTML = UserTopNav.render('reservations', user); UserTopNav.attachListeners(); }
        }, 0);

        return `
            <div id="resTopNav"></div>
            <div class="reservations-page fade-in">
                <div class="container page-content">
                    <div class="page-header">
                        <h1>Mis Reservas</h1>
                        <p>Historial de tus próximos partidos y eventos deportivos.</p>
                    </div>

                    <div id="reservationsList">
                        <div class="loading-state">
                            <div class="spinner"></div>
                            <p>Sincronizando reservas...</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .reservations-page { background-color: #f8fafc; min-height: 100vh; color: #0f172a; padding-bottom: 60px; }
                .page-content { max-width: 800px; margin: 0 auto; padding: 20px; }
                
                .page-header { text-align: center; margin: 30px 0 40px; }
                .page-header h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 5px; letter-spacing: -0.5px; }
                .page-header p { color: #64748b; font-size: 1rem; }

                /* TARJETA PROFESIONAL */
                .reservation-card {
                    background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px;
                    border: 1px solid #e2e8f0; border-left: 6px solid #cbd5e1;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: transform 0.2s, box-shadow 0.2s;
                    display: grid; grid-template-columns: 1fr auto; gap: 20px;
                }
                .reservation-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

                /* Colores de Estado (Borde Izquierdo) */
                .status-confirmed { border-left-color: #10b981; } /* Verde */
                .status-pending { border-left-color: #f59e0b; }   /* Amarillo */
                .status-cancelled { border-left-color: #ef4444; opacity: 0.75; } /* Rojo */

                /* Info Principal */
                .res-main { display: flex; flex-direction: column; gap: 8px; }
                .res-main h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
                
                /* Detalles con Iconos */
                .res-details { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 5px; }
                .detail-item { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; color: #64748b; font-weight: 500; }
                .detail-item.highlight { color: #334155; font-weight: 600; }
                .detail-item svg { color: #94a3b8; }

                .badge-sport { 
                    background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; 
                    font-size: 0.75rem; font-weight: 700; text-transform: uppercase; border: 1px solid #e2e8f0;
                    display: inline-flex; align-items: center; gap: 5px; margin-bottom: 5px; width: fit-content;
                }

                /* Lado Derecho (Precio y Estado) */
                .res-aside { text-align: right; display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 6px; }
                
                .res-price { font-size: 1.5rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
                
                .res-status-badge { 
                    padding: 6px 12px; border-radius: 30px; font-size: 0.75rem; 
                    font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                }
                .bg-confirmed { background: #d1fae5; color: #047857; }
                .bg-pending { background: #fef3c7; color: #b45309; }
                .bg-cancelled { background: #fee2e2; color: #b91c1c; }

                /* Estado Vacío */
                .empty-state { text-align: center; padding: 80px 20px; border: 2px dashed #e2e8f0; border-radius: 20px; background: white; margin-top: 20px; }
                .empty-icon { margin-bottom: 20px; }
                .empty-state h3 { color: #0f172a; margin: 0 0 10px; font-size: 1.4rem; font-weight: 700; }
                .empty-state p { color: #64748b; margin-bottom: 25px; }
                
                .btn-explore { 
                    padding: 12px 24px; background: #0f172a; color: white; border: none; 
                    border-radius: 10px; font-weight: 600; cursor: pointer; 
                    transition: background 0.2s; display: inline-flex; align-items: center; gap: 8px;
                }
                .btn-explore:hover { background: #1e293b; }

                .loading-state { text-align: center; padding: 60px; color: #64748b; }
                .spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                
                @media(max-width: 600px) {
                    .reservation-card { grid-template-columns: 1fr; gap: 15px; }
                    .res-aside { align-items: flex-start; text-align: left; flex-direction: row; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 15px; }
                }
            </style>
        `;
    },

    attachEventListeners: async () => {
        const listContainer = document.getElementById("reservationsList");
        try {
            const reservations = await api.getMyReservations();

            if (!reservations || reservations.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">${ICONS.empty}</div>
                        <h3>No tienes reservas activas</h3>
                        <p>Busca tu cancha ideal y comienza a jugar.</p>
                        <button class="btn-explore" id="btnExplore">
                            ${ICONS.search} Buscar Canchas
                        </button>
                    </div>`;
                document.getElementById("btnExplore")?.addEventListener("click", () => navigate("/search"));
                return;
            }

            listContainer.innerHTML = reservations.map(res => createReservationCard(res)).join('');

        } catch (error) {
            console.error("Error fetching reservas:", error);
            listContainer.innerHTML = `<div style="color: #ef4444; text-align: center; padding: 40px; background:white; border-radius:12px;">Error al cargar tus reservas. Intenta nuevamente.</div>`;
        }
    }
};

const createReservationCard = (res) => {
    // 1. Determinar estado y estilos
    let statusClass = 'status-pending';
    let badgeClass = 'bg-pending';
    let labelText = 'Pendiente de Pago';

    if (res.estado === 'confirmada' || res.estado === 'pagada') {
        statusClass = 'status-confirmed'; badgeClass = 'bg-confirmed'; labelText = 'Confirmada';
    } 
    // ✅ CORRECCIÓN: Comprobar tanto 'cancelado' como 'cancelada' por si acaso
    else if (res.estado === 'cancelado' || res.estado === 'cancelada') {
        statusClass = 'status-cancelled'; badgeClass = 'bg-cancelled'; labelText = 'Cancelada';
    }

    // 2. Formatear Fechas
    const dateObj = new Date(res.fecha + 'T00:00:00'); 
    const dateStr = dateObj.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    // Capitalizar primera letra de la fecha
    const dateFormatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    
    const timeStr = `${res.hora_inicio.slice(0,5)} - ${res.hora_fin.slice(0,5)}`;

    return `
        <div class="reservation-card ${statusClass} fade-in">
            <div class="res-main">
                <span class="badge-sport">${ICONS.sport} ${res.deporte || 'Deporte'}</span>
                
                <h3>${res.complejo_nombre || 'Complejo Deportivo'}</h3>
                
                <div class="res-details">
                    <div class="detail-item highlight">
                        ${ICONS.calendar} ${dateFormatted}
                    </div>
                    <div class="detail-item highlight">
                        ${ICONS.clock} ${timeStr}
                    </div>
                </div>

                <div class="res-details">
                    <div class="detail-item">
                        ${ICONS.location} ${res.cancha_nombre || 'Cancha'}
                    </div>
                </div>
            </div>
            
            <div class="res-aside">
                <span class="res-price">S/ ${parseFloat(res.precio).toFixed(2)}</span>
                <span class="res-status-badge ${badgeClass}">${labelText}</span>
            </div>
        </div>
    `;
};

export default myReservationsView;