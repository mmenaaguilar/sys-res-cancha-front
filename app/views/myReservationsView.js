import { navigate } from "../router.js";
import api from "../services/api.js";
import { UserTopNav } from "../components/UserTopNav.js";
import { toast } from "../utils/toast.js";
import { confirmAction } from "../utils/confirm.js";

// --- ICONOS SVG PROFESIONALES ---
const ICONS = {
    calendar: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    clock: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    location: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    sport: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`,
    empty: `<svg width="64" height="64" fill="none" stroke="#cbd5e1" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="7" y1="15" x2="7.01" y2="15"></line><line x1="11" y1="15" x2="13" y2="15"></line></svg>`,
    search: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
};

const myReservationsView = {
    // Estado local para paginación
    state: {
        page: 1,
        limit: 10, // ✅ AHORA SÍ SE RESPETA ESTE LÍMITE
        total: 0,
        reservas: []
    },

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
                        <p>Gestiona tu historial y cancelaciones.</p>
                    </div>

                    <div id="reservationsList">
                        <div class="loading-state">
                            <div class="spinner"></div>
                            <p>Cargando historial...</p>
                        </div>
                    </div>
                    
                    <!-- PAGINACIÓN -->
                    <div class="pagination-footer" id="paginationFooter" style="display:none;">
                        <button id="btnPrev" class="page-btn" disabled>Anterior</button>
                        <span id="pageInfo" class="page-info">Página 1</span>
                        <button id="btnNext" class="page-btn" disabled>Siguiente</button>
                    </div>
                </div>
            </div>

            <style>
                .reservations-page { background-color: #f8fafc; min-height: 100vh; color: #0f172a; padding-bottom: 60px; }
                .page-content { max-width: 800px; margin: 0 auto; padding: 20px; }
                .page-header { text-align: center; margin: 30px 0 40px; }
                .page-header h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin-bottom: 5px; letter-spacing: -0.5px; }
                .page-header p { color: #64748b; font-size: 1.05rem; }

                .reservation-card {
                    background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px;
                    border: 1px solid #e2e8f0; border-left: 6px solid #cbd5e1;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: transform 0.2s, box-shadow 0.2s;
                    display: grid; grid-template-columns: 1fr auto; gap: 20px;
                }
                .reservation-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

                /* Estados */
                .status-confirmed { border-left-color: #10b981; }
                .status-pending { border-left-color: #f59e0b; }
                .status-cancelled { border-left-color: #ef4444; opacity: 0.75; }

                .res-info { flex: 1; min-width: 200px; }
                .res-info h3 { margin: 0 0 6px; font-size: 1.25rem; font-weight: 700; color: #0f172a; }
                
                .res-meta { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.95rem; margin-bottom: 8px; }
                .res-meta svg { width: 16px; height: 16px; opacity: 0.8; }
                
                .badge-sport { 
                    background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; 
                    font-size: 0.75rem; font-weight: 700; text-transform: uppercase; border: 1px solid #e2e8f0;
                    display: inline-flex; align-items: center; gap: 5px; margin-bottom: 5px; width: fit-content;
                }

                .res-actions { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
                .res-price { font-size: 1.5rem; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
                
                .res-status-badge { 
                    padding: 6px 12px; border-radius: 30px; font-size: 0.75rem; 
                    font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                }
                .bg-confirmed { background: #d1fae5; color: #047857; }
                .bg-pending { background: #fef3c7; color: #b45309; }
                .bg-cancelled { background: #fee2e2; color: #b91c1c; }

                /* Botón Cancelar */
                .btn-cancel {
                    background: white; color: #ef4444; border: 1px solid #ef4444;
                    padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600;
                    cursor: pointer; transition: all 0.2s; margin-top: 5px;
                }
                .btn-cancel:hover { background: #fef2f2; }

                /* Paginación */
                .pagination-footer { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 30px; }
                .page-btn { background: white; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 8px; cursor: pointer; color: #475569; font-weight: 600; transition: all 0.2s; }
                .page-btn:hover:not(:disabled) { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }
                .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .page-info { color: #64748b; font-size: 0.9rem; font-weight: 500; }

                .empty-state { text-align: center; padding: 80px 20px; border: 2px dashed #e2e8f0; border-radius: 20px; background: white; margin-top: 20px; }
                .btn-explore { padding: 12px 24px; background: #0f172a; color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; margin-top: 20px; transition: background 0.2s; }
                .btn-explore:hover { background: #1e293b; }

                .loading-state { text-align: center; padding: 60px; color: #64748b; }
                .spinner { width: 30px; height: 30px; border: 3px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px; }
                @keyframes spin { to { transform: rotate(360deg); } }
                
                @media(max-width: 600px) {
                    .reservation-card { grid-template-columns: 1fr; gap: 15px; }
                    .res-aside { align-items: flex-start; text-align: left; flex-direction: row; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 15px; }
                }
            </style>
        `;
    },

    attachEventListeners: async () => {
        await loadReservasData();

        document.getElementById("btnExplore")?.addEventListener("click", () => navigate("/search"));

        document.getElementById('btnPrev')?.addEventListener('click', () => {
            if (myReservationsView.state.page > 1) {
                myReservationsView.state.page--;
                loadReservasData();
            }
        });

        document.getElementById('btnNext')?.addEventListener('click', () => {
            const totalPages = Math.ceil(myReservationsView.state.total / myReservationsView.state.limit);
            if (myReservationsView.state.page < totalPages) {
                myReservationsView.state.page++;
                loadReservasData();
            }
        });
    }
};

async function loadReservasData() {
    const listContainer = document.getElementById("reservationsList");
    const footer = document.getElementById("paginationFooter");
    
    if (myReservationsView.state.page > 1) {
        listContainer.style.opacity = '0.5';
    }

    try {
        // ✅ AQUI EL CAMBIO: Pasamos page y limit al servicio
        const response = await api.getMyReservations(
            myReservationsView.state.page, 
            myReservationsView.state.limit
        );
        
        // Manejar estructura de respuesta { total, data }
        const reservations = response.data || [];
        const total = response.total || 0;
        
        myReservationsView.state.reservas = reservations;
        myReservationsView.state.total = total;
        
        listContainer.style.opacity = '1';

        if (reservations.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">${ICONS.empty}</div>
                    <h3>No tienes reservas</h3>
                    <p>Busca tu cancha ideal y comienza a jugar.</p>
                    <button class="btn-explore" id="btnExplore">
                        ${ICONS.search} Buscar Canchas
                    </button>
                </div>`;
            document.getElementById("btnExplore")?.addEventListener("click", () => navigate("/search"));
            footer.style.display = 'none';
        } else {
            listContainer.innerHTML = reservations.map(res => createReservationCard(res)).join('');
            
            // Actualizar Paginación
            footer.style.display = 'flex';
            document.getElementById('pageInfo').textContent = `Página ${myReservationsView.state.page}`;
            document.getElementById('btnPrev').disabled = myReservationsView.state.page === 1;
            const totalPages = Math.ceil(total / myReservationsView.state.limit);
            document.getElementById('btnNext').disabled = myReservationsView.state.page >= totalPages;

            // Attach eventos cancelar
            document.querySelectorAll('.btn-cancel').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    if(await confirmAction("¿Estás seguro de cancelar esta reserva?")) {
                        try {
                            await api.cancelarReserva(id);
                            toast.success("Reserva cancelada");
                            loadReservasData(); 
                        } catch (err) {
                            toast.error("Error al cancelar");
                        }
                    }
                });
            });
        }
    } catch (error) {
        console.error("Error:", error);
        listContainer.innerHTML = `<div style="color: #ef4444; text-align: center; padding: 40px; background:white; border-radius:12px;">Error al cargar tus reservas.</div>`;
    }
}

const createReservationCard = (res) => {
    let statusClass = 'status-pending';
    let badgeClass = 'bg-pending';
    let labelText = 'Pendiente de Pago';
    let canCancel = true;

    // Lógica de estado
    if (res.estado === 'confirmada' || res.estado === 'pagada') {
        statusClass = 'status-confirmed'; badgeClass = 'bg-confirmed'; labelText = 'Confirmada';
    } else if (res.estado === 'cancelado' || res.estado === 'cancelada') {
        statusClass = 'status-cancelled'; badgeClass = 'bg-cancelled'; labelText = 'Cancelada';
        canCancel = false;
    }

    const dateObj = new Date(res.fecha + 'T00:00:00'); 
    const dateStr = dateObj.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const dateFormatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    const timeStr = `${res.hora_inicio.slice(0,5)} - ${res.hora_fin.slice(0,5)}`;

    return `
        <div class="reservation-card ${statusClass} fade-in">
            <div class="res-main">
                <span class="badge-sport">${ICONS.sport} ${
      res.deporte || "Deporte"
    }</span>
                
                <h3>${res.complejo_nombre || "Complejo Deportivo"}</h3>
                
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
                        ${ICONS.location} ${res.cancha_nombre || "Cancha"}
                    </div>
                </div>
            </div>
            
            <div class="res-aside">
                <span class="res-price">S/ ${parseFloat(res.total_pago).toFixed(
                  2
                )}</span>
                <span class="res-status-badge ${badgeClass}">${labelText}</span>
                
                ${
                  canCancel
                    ? `<button class="btn-cancel" data-id="${res.reserva_id}">Cancelar</button>`
                    : ""
                }
            </div>
        </div>
    `;
};

export default myReservationsView;