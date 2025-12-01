import { navigate } from "../router.js";
import api from "../services/api.js";

let state = {
    complejos: [],          
    selectedComplejoId: null,
    canchas: [],            
    pagination: { total: 0, page: 1, limit: 10 },
    searchTerm: '',
    deportes: [], 
    isEditing: false,
    currentEditId: null,
    isSubmitting: false 
};

const adminCanchasView = {
  render: async () => {
    if (!api.isLoggedIn()) { navigate("/"); return ""; }
    const isStaff = api.isStaff();
    if (!isStaff) { alert("Acceso denegado."); navigate("/dashboard"); return ""; }

    const user = api.getUser();

    return `
        <div class="admin-layout">
            <!-- SIDEBAR COMPLETO -->
            <aside class="admin-sidebar">
                <div class="sidebar-header">
                    <img src="assets/images/logo.png" alt="ReserSport">
                    <div>
                        <h3>Panel Admin</h3>
                        <span class="status active" style="font-size:0.65rem; padding:2px 6px; margin-top:4px;">${user.nombre}</span>
                    </div>
                </div>
                
                <nav class="sidebar-nav">
                    <div style="padding: 0 12px; margin-bottom:8px; font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Principal</div>
                    
                    <a href="#" onclick="window.router.navigate('/admin'); return false;">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21V12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9"/></svg>
                        Mis Complejos
                    </a>
                    
                    <!-- ACTIVO -->
                    <a href="#" onclick="window.location.reload()" class="active">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 12h20M12 2v20"/><circle cx="12" cy="12" r="3"/></svg>
                        Gestión de Canchas
                    </a>

                    <div style="padding: 10px 12px 8px; font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Operaciones</div>
                    
                    <!-- ENLACE A CONTACTOS -->
                    <a href="#" onclick="window.router.navigate('/admin/contactos'); return false;">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        Contactos
                    </a>

                    <a href="#" style="opacity:0.5; cursor:not-allowed;"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Reservas</a>
                </nav>

                <div class="sidebar-footer">
                    <button class="btn" id="btnBackToApp" style="width:100%; background:rgba(255,255,255,0.05);">Volver al App</button>
                </div>
            </aside>
            
            <main class="admin-content">
                <div class="page-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:15px;">
                    <div><h2>Mis Canchas</h2><p>Administra las canchas de tus sedes.</p></div>
                    
                    <div style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); padding:8px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                        <span style="color:var(--muted); font-size:0.85rem;">Sede actual:</span>
                        <div class="custom-select-wrapper" style="width:200px;">
                            <select id="selectComplejo" class="select" style="background:transparent; border:none; height:auto; padding:0; color:var(--accent); font-weight:700; cursor:pointer;">
                                <option value="">Cargando...</option>
                            </select>
                        </div>
                        <button class="btn-action-mini" id="btnReload" title="Recargar"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></button>
                    </div>
                </div>

                <div class="admin-toolbar">
                    <div class="admin-search-box">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                        <input type="text" id="searchCancha" placeholder="Buscar cancha...">
                    </div>
                    <button class="btn" id="btnNewCancha" disabled style="opacity:0.5; cursor:not-allowed; display:flex; align-items:center; gap:8px;">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Nueva Cancha
                    </button>
                </div>

                <div class="datagrid-container">
                    <table class="datagrid" id="canchasTableElement">
                        <thead>
                            <tr>
                                <th style="width:50px;">#</th>
                                <th>Nombre Cancha</th>
                                <th>Deporte</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th style="text-align:right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tableCanchas">
                            <tr><td colspan="6" style="text-align:center; padding:40px; color:var(--muted);">Selecciona un complejo.</td></tr>
                        </tbody>
                    </table>
                    <div class="datagrid-footer">
                        <span class="small" style="color:var(--muted)" id="paginationInfo">0 registros</span>
                        <div class="pagination" id="paginationControls"></div>
                    </div>
                </div>
            </main>

            <!-- MODAL (Igual al anterior) -->
            <div id="canchaModal" class="modal" style="display:none;">
                <div class="modal-overlay" id="canchaModalOverlay"></div>
                <div class="modal-content card" style="max-width:550px;">
                    <button class="modal-close" id="canchaModalClose">&times;</button>
                    <h3 id="modalTitle" style="margin-bottom:20px; border-bottom:1px solid var(--glass); padding-bottom:10px;">Nueva Cancha</h3>
                    <form id="formCancha" class="form-grid-2" style="grid-template-columns: 1fr;">
                        <div class="field"><label>Nombre *</label><input type="text" id="fNombre" class="input" required></div>
                        <div class="field"><label>Tipo de Deporte *</label><select id="fDeporte" class="select" required><option value="">Cargando...</option></select></div>
                        <div class="field"><label>Descripción</label><textarea id="fDesc" class="input" rows="3"></textarea></div>
                        <div style="margin-top:10px;"><button type="submit" class="btn" id="btnSubmitCancha" style="width:100%;">Guardar Cancha</button></div>
                    </form>
                </div>
            </div>
        </div>
        
        <style>
            /* Estilos del Switch */
            .switch { position: relative; display: inline-block; width: 34px; height: 18px; margin-right: 8px; vertical-align: middle; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .3s; border-radius: 20px; }
            .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
            input:checked + .slider { background-color: #10b981; }
            input:checked + .slider:before { transform: translateX(16px); }
            .status-text { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
            .status-text.active { color: #10b981; }
        </style>
    `;
  },

  attachEventListeners: async () => {
    // ... (Listeners de menú, modal, submit igual que antes) ...
    document.getElementById('btnBackToApp')?.addEventListener('click', () => navigate('/dashboard'));
    document.getElementById('btnReload')?.addEventListener('click', () => loadCanchas(true));
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => { if(link.getAttribute('onclick')) return; e.preventDefault(); });
    });
    await loadComplejosCombo(); await loadDeportesCombo();

    const selectComp = document.getElementById('selectComplejo');
    selectComp.addEventListener('change', (e) => {
        state.selectedComplejoId = e.target.value;
        state.pagination.page = 1;
        if(state.selectedComplejoId) localStorage.setItem('admin_last_complejo_id', state.selectedComplejoId);
        updateUIState();
    });

    document.getElementById('searchCancha')?.addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        state.pagination.page = 1;
        if (state.searchTimeout) clearTimeout(state.searchTimeout);
        state.searchTimeout = setTimeout(() => loadCanchas(false), 300);
    });

    const modal = document.getElementById('canchaModal');
    const closeModal = () => { modal.style.display = 'none'; state.isEditing = false; state.currentEditId = null; };
    document.getElementById('canchaModalClose')?.addEventListener('click', closeModal);
    document.getElementById('canchaModalOverlay')?.addEventListener('click', closeModal);

    document.getElementById('btnNewCancha')?.addEventListener('click', () => {
        if (!state.selectedComplejoId) return;
        state.isEditing = false;
        document.getElementById('modalTitle').textContent = "Nueva Cancha";
        document.getElementById('btnSubmitCancha').textContent = "Guardar Cancha";
        document.getElementById('formCancha').reset();
        modal.style.display = 'flex';
    });

    const form = document.getElementById('formCancha');
    if (form && !form.dataset.listening) {
        form.dataset.listening = "true";
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (state.isSubmitting) return; state.isSubmitting = true;
            const btn = document.getElementById('btnSubmitCancha');
            const original = btn.textContent; btn.textContent = "Procesando..."; btn.disabled = true;
            const data = { complejo_id: state.selectedComplejoId, nombre: document.getElementById('fNombre').value, tipo_deporte_id: document.getElementById('fDeporte').value, descripcion: document.getElementById('fDesc').value, estado: 'activo' };
            try {
                if (state.isEditing) { await api.updateCancha(state.currentEditId, data); alert("Actualizado"); }
                else { await api.createCancha(data); alert("Creado"); }
                closeModal(); loadCanchas(true);
            } catch (err) { alert("Error: " + err.message); }
            finally { state.isSubmitting = false; btn.textContent = original; btn.disabled = false; }
        });
    }
  }
};

// ... Helpers (updateUIState, loads) ...
function updateUIState() { const btn = document.getElementById('btnNewCancha'); if (state.selectedComplejoId) { btn.disabled = false; btn.style.opacity = "1"; btn.style.cursor = "pointer"; loadCanchas(true); } else { btn.disabled = true; btn.style.opacity = "0.5"; btn.style.cursor = "not-allowed"; document.getElementById('tableCanchas').innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--muted);">Selecciona una sede arriba.</td></tr>`; } }
async function loadComplejosCombo() { try { const complejos = await api.getMyComplejos(); const select = document.getElementById('selectComplejo'); if (complejos.length > 0) { select.innerHTML = '<option value="">Selecciona Sede...</option>' + complejos.map(c => `<option value="${c.complejo_id}">${c.nombre}</option>`).join(''); const lastId = localStorage.getItem('admin_last_complejo_id'); const exists = complejos.find(c => c.complejo_id == lastId); if (lastId && exists) { select.value = lastId; state.selectedComplejoId = lastId; } else if (complejos.length === 1) { select.value = complejos[0].complejo_id; state.selectedComplejoId = complejos[0].complejo_id; } if (state.selectedComplejoId) updateUIState(); } else { select.innerHTML = '<option value="">Sin complejos</option>'; } } catch (e) {} }
async function loadDeportesCombo() { try { const deportes = await api.getSports(); state.deportes = deportes; const options = deportes.map(d => `<option value="${d.value}">${d.label}</option>`).join(''); document.getElementById('fDeporte').innerHTML = `<option value="">Seleccione...</option>${options}`; } catch(e) {} }
async function loadCanchas(showLoading = false) { if (!state.selectedComplejoId) return; const tbody = document.getElementById('tableCanchas'); if(showLoading) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px;">Cargando...</td></tr>`; try { const response = await api.getCanchasPaginated(state.selectedComplejoId, state.pagination.page, 10, state.searchTerm, null); let lista = [], total = 0; if (response.data && Array.isArray(response.data)) { lista = response.data; total = response.total || lista.length; } else if (Array.isArray(response)) { lista = response; total = response.length; } state.canchas = lista; state.pagination.total = total; renderTable(); renderPagination(); } catch (e) { tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Error</td></tr>`; } }

// LOGICA DE TOGGLE OPTIMISTA
window.toggleCanchaStatus = async (id) => { 
    try { 
        // Cambio visual instantáneo
        const itemIndex = state.canchas.findIndex(c => c.cancha_id == id);
        if (itemIndex > -1) {
            const current = state.canchas[itemIndex].estado;
            state.canchas[itemIndex].estado = (current === 'activo' ? 'inactivo' : 'activo');
            renderTable();
        }
        // Llamada al servidor
        await api.toggleCanchaStatus(id); 
    } catch (e) { 
        alert(e.message); 
        loadCanchas(); // Revertir si falla
    } 
};

window.editCancha = (id) => { const c = state.canchas.find(x => x.cancha_id == id); if(!c) return; state.isEditing = true; state.currentEditId = id; document.getElementById('modalTitle').textContent = "Editar Cancha"; document.getElementById('btnSubmitCancha').textContent = "Actualizar"; document.getElementById('fNombre').value = c.nombre; document.getElementById('fDeporte').value = c.tipo_deporte_id; document.getElementById('fDesc').value = c.descripcion||''; document.getElementById('canchaModal').style.display = 'flex'; };
window.deleteCancha = async (id) => { if(confirm("¿Borrar?")) { await api.deleteCancha(id); loadCanchas(); } };

function renderTable() {
    const tbody = document.getElementById('tableCanchas');
    if (!state.canchas.length) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--muted);">No hay canchas.</td></tr>`; return; }

    tbody.innerHTML = state.canchas.map((c, idx) => {
        const isActive = (c.estado || 'activo').toLowerCase() === 'activo';
        const deporte = state.deportes.find(d => d.value == c.tipo_deporte_id)?.label || '--';

        // AQUI ESTÁ EL RENDER DEL SWITCH
        return `
        <tr>
            <td><span style="color:var(--muted);">#${idx+1}</span></td>
            <td><strong style="color:white;">${c.nombre}</strong></td>
            <td><span class="badge">${deporte}</span></td>
            <td><small>${c.descripcion || '--'}</small></td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <label class="switch">
                        <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.toggleCanchaStatus(${c.cancha_id})">
                        <span class="slider"></span>
                    </label>
                    <span class="status-text ${isActive ? 'active' : ''}">${isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                </div>
            </td>
            <td style="text-align:right; display:flex; gap:5px; justify-content:flex-end;">
                <button class="action-btn" title="Horarios" onclick="window.router.navigate('/admin/canchas/${c.cancha_id}/horarios')" style="color:#fbbf24; border:1px solid rgba(251,191,36,0.2);"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></button>
                <button class="action-btn btn-edit" onclick="window.editCancha(${c.cancha_id})"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg></button>
                <button class="action-btn btn-delete" onclick="window.deleteCancha(${c.cancha_id})"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>
            </td>
        </tr>`;
    }).join('');
}
function renderPagination() { /* (Mantén tu lógica de paginación aquí) */ }
window.changeCanchaPage = (p) => { state.pagination.page = p; loadCanchas(true); };

export default adminCanchasView;