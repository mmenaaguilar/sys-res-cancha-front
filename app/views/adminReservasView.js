import { navigate } from "../router.js";
import api from "../services/api.js";
import { AdminSidebar } from "../components/AdminSidebar.js";
import { toast } from "../utils/toast.js";
import { confirmAction } from "../utils/confirm.js";

// --- STATE ---
let state = {
    complejos: [],
    paymentMethodsMap: {}, 
    selectedComplejoId: null,
    reservas: [],
    pagination: { total: 0, page: 1, limit: 10 },
    searchTerm: '',
    searchDebounceTimer: null
};

// --- ICONOS ---
const ICONS = {
    search: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
    refresh: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
    eye: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
    close: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>`,
    calendar: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    clock: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    location: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    check: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>`,
    x: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>`,
    phone: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    court: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 20h20M4 4h16M12 4v16M4 12h16"/></svg>`
};

const METODOS_PAGO = {
    1: { label: 'Tarjeta', color: '#60a5fa' }, // Azul claro
    2: { label: 'Yape', color: '#a855f7' },    // Morado
    3: { label: 'Plin', color: '#3b82f6' },    // Azul
    4: { label: 'Efectivo', color: '#34d399' } // Verde
};

// --- UTILS ---
const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
const formatDate = (dateString) => {
    if(!dateString) return '-';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
};

// --- VISTA ---
const adminReservasView = {
    render: async () => {
        if (!api.isLoggedIn()) { navigate("/"); return ""; }
        const user = api.getUser();

        // ESTILOS DARK EMERALD (Basado en tu imagen)
        const styles = `
            <style>
                :root {
                    --bg-dark: #0b1121;  /* Fondo muy oscuro de la imagen */
                    --bg-card: #0f172a;  /* Fondo de inputs/tablas */
                    --primary-green: #10b981; /* Verde del botón Nueva Cancha */
                    --primary-green-hover: #059669;
                    --text-muted: #94a3b8;
                    --border-color: #1e293b;
                }

                .page-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
                
                /* Barra de Filtros - Alineada con la imagen */
                .filter-bar { 
                    display: flex; gap: 15px; 
                    background: transparent; 
                    padding: 0 0 20px 0;
                    align-items: center; flex-wrap:wrap; 
                }
                
                .select-sede { 
                    padding: 10px 15px; 
                    background: var(--bg-card); 
                    border: 1px solid var(--border-color); 
                    border-radius: 8px; outline: none; 
                    font-size: 0.9rem; color: #e2e8f0; font-weight: 500; 
                    min-width: 220px; 
                }
                
                .search-box { flex: 1; position: relative; min-width: 250px; }
                .search-box input { 
                    width: 100%; padding: 12px 15px 12px 45px; 
                    background: var(--bg-card); 
                    border: 1px solid var(--border-color); 
                    border-radius: 8px; outline: none; 
                    font-size: 0.9rem; color: #e2e8f0; 
                    transition: border-color 0.2s;
                }
                .search-box input:focus { border-color: var(--primary-green); }
                .search-box svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
                
                /* Botón estilo "Nueva Cancha" */
                .btn-refresh { 
                    background: var(--primary-green); 
                    border: none;
                    color: white; 
                    padding: 12px 20px; border-radius: 8px; 
                    cursor: pointer; transition: all 0.2s; 
                    display:flex; align-items:center; gap: 8px; font-weight: 600;
                    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
                }
                .btn-refresh:hover { background: var(--primary-green-hover); transform: translateY(-1px); }

                /* TABLA ESTILO IMAGEN */
                .table-container { 
                    margin-top: 10px;
                    background: var(--bg-dark); /* Fondo oscuro general */
                    border-radius: 12px; 
                    border: 1px solid var(--border-color);
                    overflow: hidden; 
                }
                .data-table { width: 100%; border-collapse: collapse; }
                
                .data-table th { 
                    background: var(--bg-dark); /* Header oscuro */
                    color: var(--text-muted); 
                    font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;
                    padding: 20px 24px; text-align: left; 
                    border-bottom: 1px solid var(--border-color); 
                }
                
                .data-table td { 
                    padding: 20px 24px; 
                    border-bottom: 1px solid var(--border-color); 
                    color: #e2e8f0; 
                    font-size: 0.95rem; vertical-align: middle; 
                    background: var(--bg-dark);
                }
                .data-table tr:hover td { background: #111a2d; } /* Hover muy sutil */

                /* Usuario Cell */
                .user-cell { display: flex; align-items: center; gap: 12px; }
                .user-avatar { 
                    width: 40px; height: 40px; 
                    background: #1e293b; color: #e2e8f0; 
                    border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                    font-weight: 700; font-size: 1rem; 
                }
                .user-info div { line-height: 1.3; }
                .user-name { font-weight: 600; color: white; }
                .user-meta { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
                .user-phone { color: var(--primary-green); font-weight: 500; }

                /* BADGES - Estilo Pill */
                .badge { padding: 6px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px; }
                .bg-green { background: rgba(16, 185, 129, 0.1); color: var(--primary-green); border: 1px solid rgba(16, 185, 129, 0.2); }
                .bg-yellow { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
                .bg-red { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }

                /* Botones de acción (outline style como en la imagen) */
                .btn-icon { 
                    background: transparent; 
                    border: 1px solid var(--border-color); 
                    color: #fbbf24; /* Por defecto amarillo como el edit */
                    width: 36px; height: 36px; 
                    border-radius: 8px; 
                    display: inline-flex; align-items: center; justify-content: center; 
                    cursor: pointer; transition: all 0.2s; 
                }
                .btn-icon:hover { border-color: #fbbf24; background: rgba(251, 191, 36, 0.1); }
                
                /* MODAL DARK */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 2000; opacity: 0; transition: opacity 0.3s; }
                .modal-overlay.active { display: flex; opacity: 1; }
                .modal-card { background: var(--bg-dark); width: 90%; max-width: 500px; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); transform: translateY(20px); transition: transform 0.3s; border: 1px solid var(--border-color); }
                .modal-overlay.active .modal-card { transform: translateY(0); }
                
                .modal-header { padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-dark); }
                .modal-header h3 { margin: 0; color: white; font-size: 1.1rem; }
                .modal-body { padding: 20px; max-height: 60vh; overflow-y: auto; }
                .modal-footer { padding: 15px 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; background: var(--bg-dark); }

                .detail-item { display: flex; justify-content: space-between; padding: 12px 10px; border-bottom: 1px dashed var(--border-color); font-size: 0.9rem; }
                .detail-item:last-child { border-bottom: none; }
                .label-icon { display: flex; align-items: center; gap: 8px; color: var(--text-muted); }
                
                .btn-danger { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
                .btn-success { background: var(--primary-green); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); }
                
                .datagrid-footer { padding: 20px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); background:var(--bg-dark); color: var(--text-muted); }

                @media (max-width: 768px) {
                    .filter-bar { flex-direction: column; align-items: stretch; }
                    .select-sede, .search-box { width: 100%; }
                    .table-container { overflow-x: auto; border: none; }
                    .data-table { min-width: 700px; }
                }
            </style>
        `;

        return `
            ${styles}
            <div class="admin-layout">
                ${AdminSidebar.render('reservas', user)}
                
                <main class="admin-content">
                    <div class="page-header-flex">
                        <div>
                            <h2 style="margin:0; color:white; font-size:1.5rem;">Reservas</h2>
                            <p style="margin:5px 0 0; color:var(--text-muted);">Gestiona y visualiza las reservas del sistema.</p>
                        </div>
                    </div>

                    <div class="filter-bar">
                        <select id="selectComplejo" class="select-sede">
                            <option value="">Cargando sedes...</option>
                        </select>
                        
                        <div class="search-box">
                            ${ICONS.search}
                            <input type="text" id="searchInput" placeholder="Buscar cancha...">
                        </div>
                        
                        <button id="btnReload" class="btn-refresh" title="Recargar Lista">
                            Recargar Lista
                        </button>
                    </div>

                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width:70px;">ID</th>
                                    <th>Cliente</th>
                                    <th>Pago</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th style="text-align:right;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tableReservas">
                                <tr><td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">Selecciona una sede para cargar datos.</td></tr>
                            </tbody>
                        </table>
                        
                        <div class="datagrid-footer">
                            <span style="font-size:0.85rem;" id="paginationInfo">0 registros</span>
                            <div style="display:flex; gap:10px;">
                                <button id="prevPage" class="btn-icon" style="width:auto; padding:0 15px; font-size:0.8rem; color:var(--text-muted); border-color:var(--border-color);" disabled>Anterior</button>
                                <button id="nextPage" class="btn-refresh" style="width:auto; padding:5px 15px; font-size:0.8rem; height:36px;" disabled>Siguiente</button>
                            </div>
                        </div>
                    </div>
                </main>

                <div id="detailModal" class="modal-overlay">
                    <div class="modal-card">
                        <div class="modal-header">
                            <h3>Detalle Reserva #<span id="modalReservaId"></span></h3>
                            <button id="modalClose" style="background:none; border:none; cursor:pointer; color:var(--text-muted);">${ICONS.close}</button>
                        </div>
                        <div class="modal-body" id="modalContent"></div>
                        <div class="modal-footer">
                            <button id="btnCancelReserva" class="btn-danger" style="display:none;">Cancelar Reserva</button>
                            <button id="btnConfirmReserva" class="btn-success" style="display:none;">Confirmar Pago</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    attachEventListeners: async () => {
        AdminSidebar.attachListeners();
        
        const selectComp = document.getElementById('selectComplejo');
        
        // 1. Cargar Métodos de Pago
        try {
            const metodos = await api.getPaymentMethods();
            const metodosMap = {};
            metodos.forEach(m => {
                let color = '#94a3b8'; 
                const n = m.nombre.toLowerCase();
                if(n.includes('yape')) color = '#a855f7'; 
                if(n.includes('plin')) color = '#3b82f6';
                if(n.includes('tarjeta')) color = '#0ea5e9';
                if(n.includes('efectivo')) color = '#10b981';
                metodosMap[m.metodo_pago_id] = { label: m.nombre, color: color };
            });
            state.paymentMethodsMap = metodosMap;
        } catch (e) { console.error("Error métodos pago:", e); }

        // 2. Cargar Complejos
        try {
            const complejos = await api.getMyComplejos();
            state.complejos = complejos;
            
            if(complejos.length) {
                selectComp.innerHTML = '<option value="">-- Selecciona Sede --</option>' + 
                    complejos.map(c => `<option value="${c.complejo_id}">${c.nombre}</option>`).join('');
                
                const lastId = localStorage.getItem('admin_last_complejo_id');
                if(lastId && complejos.some(c => c.complejo_id == lastId)) {
                    selectComp.value = lastId;
                    state.selectedComplejoId = lastId;
                    loadReservas();
                }
            } else {
                selectComp.innerHTML = '<option value="">Sin sedes asignadas</option>';
            }
        } catch(e) { console.error(e); }

        // Eventos
        selectComp.addEventListener('change', (e) => {
            state.selectedComplejoId = e.target.value;
            localStorage.setItem('admin_last_complejo_id', state.selectedComplejoId);
            state.pagination.page = 1;
            loadReservas();
        });

        document.getElementById('btnReload').addEventListener('click', loadReservas);
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(state.searchDebounceTimer);
            state.searchTerm = e.target.value;
            state.searchDebounceTimer = setTimeout(() => { state.pagination.page = 1; loadReservas(); }, 500);
        });

        document.getElementById('prevPage').addEventListener('click', () => { if(state.pagination.page > 1) { state.pagination.page--; loadReservas(); } });
        document.getElementById('nextPage').addEventListener('click', () => { state.pagination.page++; loadReservas(); });

        // Modal
        const modal = document.getElementById('detailModal');
        const closeModal = () => modal.classList.remove('active');
        document.getElementById('modalClose').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });
        window.openReservaDetail = (id) => openDetailModal(id);
    },
};

async function loadReservas() {
    const tbody = document.getElementById('tableReservas');
    if (!state.selectedComplejoId) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#94a3b8;">Selecciona una sede para ver datos.</td></tr>`;
        return;
    }
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#94a3b8;">Cargando...</td></tr>`;

    try {
        const res = await api.getReservas(state.selectedComplejoId, state.pagination.page, state.searchTerm);
        const data = Array.isArray(res) ? res : (res.data || []);
        state.reservas = data;
        if (res.total) state.pagination.total = res.total;
        
        renderTable();
        updatePaginationUI();
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#f87171; padding:30px;">Error al cargar datos.</td></tr>`;
    }
}

function renderTable() {
    const tbody = document.getElementById('tableReservas');
    if (state.reservas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#94a3b8;">No se encontraron reservas.</td></tr>`;
        return;
    }

    tbody.innerHTML = state.reservas.map(r => {
        let badge = `<span class="badge bg-yellow">${ICONS.clock} Pendiente</span>`;
        if(r.estado === 'confirmada') badge = `<span class="badge bg-green">${ICONS.check} ACTIVO</span>`; // Texto ajustado a imagen
        if(r.estado === 'cancelado') badge = `<span class="badge bg-red">${ICONS.x} Cancelada</span>`;

        const payData = state.paymentMethodsMap[r.metodo_pago_id] || { label: 'Desconocido', color: '#94a3b8' };
        const inicial = r.usuario_nombre ? r.usuario_nombre.charAt(0).toUpperCase() : 'U';

        return `
            <tr>
                <td style="color:var(--text-muted); font-family:monospace;">#${r.reserva_id}</td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">${inicial}</div>
                        <div class="user-info">
                            <div class="user-name">${r.usuario_nombre || 'Cliente'}</div>
                            <div class="user-meta">
                                <span>${r.correo || '-'}</span>
                                ${r.telefono ? `<span>• <span class="user-phone">${r.telefono}</span></span>` : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td><span style="font-size:0.85rem; color:${payData.color}; font-weight:600;">${payData.label}</span></td>
                <td><strong style="color:#e2e8f0;">${formatCurrency(r.total_pago)}</strong></td>
                <td>${badge}</td>
                <td style="color:var(--text-muted); font-size:0.85rem;">${formatDate(r.fecha_creacion)}</td>
                <td style="text-align:right;">
                    <button class="btn-icon" onclick="window.openReservaDetail(${r.reserva_id})" title="Ver Detalle" style="color:#fbbf24; border-color:#fbbf24;">${ICONS.eye}</button>
                </td>
            </tr>
        `;
    }).join('');
}

function updatePaginationUI() {
    const { page, total, limit } = state.pagination;
    const start = (page - 1) * limit + 1;
    const end = Math.min(start + state.reservas.length - 1, total);
    
    document.getElementById('paginationInfo').textContent = total > 0 ? `Mostrando ${start}-${end} de ${total}` : '0 registros';
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = end >= total;
    
    // Ajustar estilos de botones paginación según estado
    const btnNext = document.getElementById('nextPage');
    if(end >= total) {
        btnNext.style.background = 'transparent';
        btnNext.style.border = '1px solid var(--border-color)';
        btnNext.style.color = 'var(--text-muted)';
    } else {
        btnNext.style.background = 'var(--primary-green)';
        btnNext.style.border = 'none';
        btnNext.style.color = 'white';
    }
}

async function openDetailModal(id) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');
    const r = state.reservas.find(x => x.reserva_id == id);
    if(!r) return;

    document.getElementById('modalReservaId').textContent = id;
    const btnConfirm = document.getElementById('btnConfirmReserva');
    const btnCancel = document.getElementById('btnCancelReserva');
    
    btnConfirm.style.display = r.estado === 'pendiente_pago' ? 'block' : 'none';
    btnCancel.style.display = r.estado !== 'cancelada' ? 'block' : 'none';

    // Eventos Botones
    btnConfirm.onclick = async () => {
        if(await confirmAction("¿Confirmar pago manual?")) {
            try { await api.confirmarReserva(id); toast.success("Confirmada"); modal.classList.remove('active'); loadReservas(); } 
            catch(e){ toast.error("Error al confirmar"); }
        }
    };
    btnCancel.onclick = async () => {
        if(await confirmAction("¿Cancelar reserva?")) {
            try { await api.cancelarReserva(id); toast.success("Cancelada"); modal.classList.remove('active'); loadReservas(); } 
            catch(e) { toast.error("Error al cancelar"); }
        }
    };

    modal.classList.add('active');
    content.innerHTML = `<div style="text-align:center; padding:20px; color:#94a3b8;">Cargando detalles...</div>`;

    try {
        const res = await api.getReservaDetalles(id);
        const detalles = Array.isArray(res) ? res : (res.data || []);
        
        if (detalles.length === 0) { content.innerHTML = '<p style="text-align:center; color:#94a3b8;">Sin detalles.</p>'; return; }

        content.innerHTML = detalles.map(d => `
            <div class="detail-item">
                <div class="label-icon">
                    ${ICONS.calendar} 
                    <span style="color:#e2e8f0; font-weight:600;">${formatDate(d.fecha).split(',')[0]}</span>
                </div>
                <div class="label-icon">
                    ${ICONS.clock} 
                    <span style="color:#e2e8f0;">${d.hora_inicio.slice(0,5)} - ${d.hora_fin.slice(0,5)}</span>
                </div>
                <div style="font-weight:700; color:#34d399;">${formatCurrency(d.precio)}</div>
            </div>
            <div style="font-size:0.8rem; color:#64748b; padding:0 10px 10px; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05);">
                ${d.cancha_nombre}
            </div>
        `).join('');
    } catch (e) { content.innerHTML = `<div style="color:#f87171; text-align:center;">Error detalles</div>`; }
}

export default adminReservasView;