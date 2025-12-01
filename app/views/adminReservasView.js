import { navigate } from "../router.js";
import api from "../services/api.js";
import { AdminSidebar } from "../components/AdminSidebar.js";
import { toast } from "../utils/toast.js";
import { confirmAction } from "../utils/confirm.js";

// --- STATE ---
let state = {
    complejos: [],
    selectedComplejoId: null,
    reservas: [],
    pagination: { total: 0, page: 1, limit: 10 },
    searchTerm: '',
    searchDebounceTimer: null
};

// --- ICONOS (Estilo consistente con tu app) ---
const ICONS = {
    creditCard: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>`,
    wallet: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>`,
    eye: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    search: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>`,
    refresh: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>`,
    calendar: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    clock: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    location: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    close: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    phone: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    mail: `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    court: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 20h20M4 4h16M12 4v16M4 12h16"/></svg>`
};

const METODOS_PAGO = {
    1: { label: 'Tarjeta', icon: ICONS.creditCard, color: '#60a5fa' },
    2: { label: 'Créditos', icon: ICONS.wallet, color: '#34d399' }
};

// --- UTILS ---
const formatCurrency = (amount) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
const formatDate = (dateString) => {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
};

// --- VISTA PRINCIPAL ---
const adminReservasView = {
    render: async () => {
        if (!api.isLoggedIn()) { navigate("/"); return ""; }
        const user = api.getUser();

        // Estilos específicos para igualar a adminCanchasView
        const styles = `
            <style>
                /* Reutilizando estilos de Canchas para armonía */
                .action-btn { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .btn-view { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
                .btn-view:hover { background: rgba(59, 130, 246, 0.3); }

                /* Badges específicos de Reservas */
                .badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                .badge-success { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.1); }
                .badge-warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.1); }
                .badge-danger { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.1); }

                /* Modal Styles (Estilo Bonito) */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px); z-index: 100; display: none; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; }
                .modal-overlay.active { display: flex; opacity: 1; }
                .modal-content { background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; width: 90%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); transform: scale(0.95); transition: transform 0.3s ease; }
                .modal-overlay.active .modal-content { transform: scale(1); }
                
                .detail-card { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 15px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05); }
                .icon-flex { display: flex; align-items: center; gap: 6px; }
            </style>
        `;

        return `
            ${styles}
            <div class="admin-layout">
                ${AdminSidebar.render('reservas', user)}
                
                <main class="admin-content">
                    <div class="page-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:15px;">
                        <div>
                            <h2>Reservas</h2>
                            <p>Gestión de transacciones y ocupación.</p>
                        </div>
                        
                        <div style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); padding:8px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                            <span style="color:var(--muted); font-size:0.85rem;">Sede:</span>
                            <div style="width: 200px;">
                                <select id="selectComplejo" class="select-pro">
                                    <option value="">Cargando...</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="admin-toolbar">
                        <div class="admin-search-box">
                            ${ICONS.search}
                            <input type="text" id="searchInput" placeholder="Buscar cliente, email, ID...">
                        </div>
                        <button class="btn" id="btnReload" title="Actualizar" style="padding: 8px 15px; display:flex; gap:8px;">
                             ${ICONS.refresh} Actualizar
                        </button>
                    </div>

                    <div class="datagrid-container">
                        <table class="datagrid">
                            <thead>
                                <tr>
                                    <th style="width:60px;">ID</th>
                                    <th>Cliente</th>
                                    <th>Método Pago</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th style="text-align:right;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tableReservas">
                                <tr><td colspan="7" style="text-align:center; padding:40px; color:var(--muted);">Cargando reservas...</td></tr>
                            </tbody>
                        </table>
                        
                        <div class="datagrid-footer">
                            <span class="small" style="color:var(--muted)" id="paginationInfo">0 registros</span>
                            <div class="pagination" id="paginationControls"></div>
                        </div>
                    </div>
                </main>

                <div id="detailModal" class="modal-overlay">
                    <div class="modal-content">
                        <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                            <h3 style="margin:0; font-size:1.1rem; color:white;">Reserva #<span id="modalReservaId"></span></h3>
                            <button id="modalClose" style="background:transparent; border:none; color:var(--muted); cursor:pointer;">${ICONS.close}</button>
                        </div>
                        
                        <div id="modalContent" style="padding:20px; max-height:60vh; overflow-y:auto;">
                            </div>
                        
                        <div style="padding:20px; border-top:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); border-radius:0 0 12px 12px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <div style="font-size:0.75rem; color:var(--muted);">TOTAL</div>
                                <div style="font-size:1.2rem; font-weight:bold; color:white;" id="modalTotalAmount"></div>
                            </div>
                            <div style="display:flex; gap:10px;">
                                <button id="btnCancelReserva" style="background:rgba(239, 68, 68, 0.15); color:#f87171; border:1px solid rgba(239, 68, 68, 0.3); padding:8px 15px; border-radius:6px; cursor:pointer;">Cancelar</button>
                                <button id="btnConfirmReserva" style="background:#10b981; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer;">Confirmar Pago</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    attachEventListeners: async () => {
        AdminSidebar.attachListeners();
        
        // Listeners Globales
        document.getElementById('btnReload')?.addEventListener('click', () => {
            const svg = document.querySelector('#btnReload svg');
            if(svg) svg.style.transform = 'rotate(360deg)';
            setTimeout(() => { if(svg) svg.style.transform = 'none'; }, 500);
            loadReservas();
        });

        document.getElementById('searchInput')?.addEventListener('input', (e) => { 
            clearTimeout(state.searchDebounceTimer);
            state.searchTerm = e.target.value;
            state.searchDebounceTimer = setTimeout(() => { state.pagination.page = 1; loadReservas(); }, 400);
        });

        const selectComp = document.getElementById('selectComplejo');
        selectComp.addEventListener('change', (e) => {
            state.selectedComplejoId = e.target.value;
            localStorage.setItem('admin_last_complejo_id', state.selectedComplejoId);
            state.pagination.page = 1;
            
            // Si no hay sede seleccionada, limpiar tabla
            if (!state.selectedComplejoId) {
                document.getElementById('tableReservas').innerHTML = 
                    `<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--muted);">Selecciona una sede para ver sus reservas.</td></tr>`;
                document.getElementById('paginationInfo').textContent = "0 registros";
                document.getElementById('paginationControls').innerHTML = "";
                return;
            }
            
            loadReservas();
        });

        // Modal Logic
        const modal = document.getElementById('detailModal');
        const closeModal = () => { modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 300); };
        document.getElementById('modalClose').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); });

        // Carga Inicial
        try {
            const complejos = await api.getMyComplejos();
            state.complejos = complejos;
            
            if(complejos.length) {
                // ✅ Cambiado: "Selecciona una sede" en lugar de "Todas las Sedes"
                selectComp.innerHTML = '<option value="">Selecciona una sede</option>' + 
                    complejos.map(c => `<option value="${c.complejo_id}">${c.nombre}</option>`).join('');
                const lastId = localStorage.getItem('admin_last_complejo_id');
                if(lastId && complejos.some(c => c.complejo_id == lastId)) {
                    selectComp.value = lastId;
                    state.selectedComplejoId = lastId;
                    loadReservas();
                } else {
                    // No cargar reservas hasta que se seleccione una sede
                    document.getElementById('tableReservas').innerHTML = 
                        `<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--muted);">Selecciona una sede para ver sus reservas.</td></tr>`;
                }
            } else {
                selectComp.innerHTML = '<option value="">Sin sedes</option>';
                document.getElementById('tableReservas').innerHTML = 
                    `<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--muted);">No tienes complejos asignados.</td></tr>`;
            }
        } catch(e) {
            console.error("Error al cargar complejos:", e);
        }

        window.changeReservaPage = (p) => { state.pagination.page = p; loadReservas(); };
        window.viewDetails = (id) => openDetailModal(id);
    }
};

// ✅ Corregido: usa la firma original de getReservas
async function loadReservas() {
    const tbody = document.getElementById('tableReservas');
    
    // Validación: debe haber una sede seleccionada
    if (!state.selectedComplejoId) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--muted);">Selecciona una sede para ver sus reservas.</td></tr>`;
        return;
    }

    try {
        // ✅ Llamada original: complejoId, page, searchTerm
        const res = await api.getReservas(state.selectedComplejoId, state.pagination.page, state.searchTerm);
        if(res.data && Array.isArray(res.data)) { 
            state.reservas = res.data; 
            state.pagination.total = res.total; 
        }
        else if (Array.isArray(res)) { 
            state.reservas = res; 
            state.pagination.total = res.length; 
        }
        renderTable();
        renderPagination();
    } catch(e) {
        console.error("Error al cargar reservas:", e);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#ef4444; padding:30px;">Error al conectar con el servidor</td></tr>`;
    }
}

function renderTable() {
    const tbody = document.getElementById('tableReservas');
    if (!state.reservas.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--muted);">No hay reservas registradas.</td></tr>`;
        return;
    }

    tbody.innerHTML = state.reservas.map(r => {
        let badgeClass = 'badge-warning'; 
        if(r.estado === 'confirmada') badgeClass = 'badge-success';
        if(r.estado === 'cancelado') badgeClass = 'badge-danger';
        
        const pay = METODOS_PAGO[r.metodo_pago_id] || { label: 'Otro', icon: '?', color: '#94a3b8' };
        
        return `
        <tr>
            <td><span style="color:var(--muted); font-weight:bold;">#${r.reserva_id}</span></td>
            <td>
                <div style="font-weight:bold; color:white; margin-bottom:2px;">${r.usuario_nombre || 'Anónimo'}</div>
                <div style="font-size:0.75rem; color:var(--muted); display:flex; flex-direction:column; gap:2px;">
                    <span class="icon-flex">${ICONS.mail} ${r.correo || '-'}</span>
                    <span class="icon-flex" style="color:#60a5fa;">${ICONS.phone} ${r.telefono || 'S/T'}</span>
                </div>
            </td>
            <td>
                <span style="font-size:0.85rem; color:${pay.color}; display:inline-flex; align-items:center; gap:5px;">
                    ${pay.icon} ${pay.label}
                </span>
            </td>
            <td><strong style="color:white;">${formatCurrency(r.total_pago)}</strong></td>
            <td><span class="badge ${badgeClass}">${r.estado}</span></td>
            <td><span style="color:var(--muted); font-size:0.85rem;">${formatDate(r.fecha_creacion)}</span></td>
            <td style="text-align:right;">
                <div style="display:flex; justify-content:flex-end;">
                    <button class="action-btn btn-view" onclick="window.viewDetails(${r.reserva_id})" title="Ver Detalles">
                        ${ICONS.eye}
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function renderPagination() {
    const { total, page } = state.pagination;
    const pages = Math.ceil(total / 10) || 1;
    document.getElementById('paginationInfo').textContent = `Mostrando ${state.reservas.length} de ${total} registros`;
    
    let html = `<button class="page-btn" ${page===1?'disabled':''} onclick="window.changeReservaPage(${page-1})">Anterior</button>`;
    for(let i=1; i<=pages; i++) {
        if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
            html += `<button class="page-btn ${i===page?'active':''}" onclick="window.changeReservaPage(${i})">${i}</button>`;
        } else if (i === page - 2 || i === page + 2) {
            html += `<span style="padding:0 5px; color:var(--muted);">...</span>`;
        }
    }
    html += `<button class="page-btn" ${page===pages?'disabled':''} onclick="window.changeReservaPage(${page+1})">Siguiente</button>`;
    document.getElementById('paginationControls').innerHTML = html;
}

async function openDetailModal(id) {
    const r = state.reservas.find(x => x.reserva_id == id);
    if(!r) return;

    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');
    document.getElementById('modalReservaId').textContent = id;
    document.getElementById('modalTotalAmount').textContent = formatCurrency(r.total_pago);
    
    const btnConfirm = document.getElementById('btnConfirmReserva');
    const btnCancel = document.getElementById('btnCancelReserva');
    btnConfirm.style.display = (r.estado === 'pendiente_pago') ? 'block' : 'none';
    btnCancel.style.display = (r.estado !== 'cancelado') ? 'block' : 'none';

    btnCancel.onclick = async () => {
        if(await confirmAction("¿Cancelar esta reserva?")) {
            try { 
                await api.cancelarReserva(id);
                toast.success("Reserva cancelada");
                modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 300);
                loadReservas(); 
            } catch(e) { toast.error(e.message || "Error al cancelar"); }
        }
    };

    btnConfirm.onclick = async () => {
        if(await confirmAction("¿Confirmar pago manual?")) {
            try { 
                await api.confirmarReserva(id); 
                toast.success("Pago confirmado"); 
                modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 300);
                loadReservas(); 
            } catch(e){ toast.error(e.message); }
        }
    };

    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    content.innerHTML = '<div style="text-align:center; padding:20px; color:var(--muted);">Cargando detalles...</div>';

    try {
        const response = await api.getReservaDetalles(id);
        const detalles = (Array.isArray(response) ? response : response.data) || [];
        
        if(!detalles.length) { content.innerHTML = '<div style="text-align:center; color:white;">Sin items.</div>'; return; }

        content.innerHTML = detalles.map(d => `
            <div class="detail-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <strong style="color:white; display:flex; align-items:center; gap:6px;">${ICONS.court} ${d.cancha_nombre || 'Cancha'}</strong>
                    <span style="color:#34d399; font-weight:bold;">${formatCurrency(d.precio)}</span>
                </div>
                <div style="font-size:0.85rem; color:var(--muted); display:flex; gap:15px;">
                    <span class="icon-flex">${ICONS.calendar} ${d.fecha}</span>
                    <span class="icon-flex">${ICONS.clock} ${d.hora_inicio?.substring(0,5)} - ${d.hora_fin?.substring(0,5)}</span>
                </div>
                <div style="font-size:0.8rem; color:var(--muted); margin-top:5px; padding-top:5px; border-top:1px dashed rgba(255,255,255,0.1);">
                    ${ICONS.location} ${d.complejo_nombre || 'Sede'}
                </div>
            </div>
        `).join('');
    } catch(e) { content.innerHTML = '<div style="color:#ef4444; text-align:center;">Error cargando detalles</div>'; }
}

export default adminReservasView;