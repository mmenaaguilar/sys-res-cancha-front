import { navigate } from "../router.js";
import api from "../services/api.js";
import { AdminSidebar } from "../components/AdminSidebar.js";
import { toast } from "../utils/toast.js";
import { confirmAction } from "../utils/confirm.js";

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
        if (!api.isStaff()) { 
        toast.error("Acceso denegado."); // ✅ Toast
        navigate("/dashboard"); return ""; 
    }

    const user = api.getUser();

    return `
        <div class="admin-layout">
            ${AdminSidebar.render('canchas', user)}
            
            <main class="admin-content">
                <!-- HEADER -->
                <div class="page-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:15px;">
                    <div><h2>Mis Canchas</h2><p>Administra las canchas de tus sedes.</p></div>
                    
                    <div style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); padding:8px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                        <span style="color:var(--muted); font-size:0.85rem;">Sede:</span>
                        
                        <div style="width: 200px;">
                            <select id="selectComplejo" class="select-pro">
                                <option value="">Cargando...</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- TOOLBAR -->
                <div class="admin-toolbar">
                    <div class="admin-search-box">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                        <input type="text" id="searchCancha" placeholder="Buscar cancha...">
                    </div>
                    <button class="btn" id="btnNewCancha" disabled style="opacity:0.5; cursor:not-allowed; display:flex; align-items:center; gap:8px;">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Nueva Cancha
                    </button>
                </div>

                <!-- TABLA -->
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
                            <tr><td colspan="6" style="text-align:center; padding:40px; color:var(--muted);">Selecciona un complejo para ver sus canchas.</td></tr>
                        </tbody>
                    </table>
                    <div class="datagrid-footer">
                        <span class="small" style="color:var(--muted)" id="paginationInfo">0 registros</span>
                        <div class="pagination" id="paginationControls"></div>
                    </div>
                </div>
            </main>

            <!-- MODAL -->
            <div id="canchaModal" class="modal" style="display:none;">
                <div class="modal-overlay" id="canchaModalOverlay"></div>
                <div class="modal-content card" style="max-width:550px;">
                    <button class="modal-close" id="canchaModalClose">&times;</button>
                    <h3 id="modalTitle" style="margin-bottom:20px;">Nueva Cancha</h3>
                    
                    <form id="formCancha" class="form-grid-2" style="grid-template-columns: 1fr;">
                        <div class="field"><label>Nombre *</label><input type="text" id="fNombre" class="input" required></div>
                        <div class="field"><label>Deporte *</label><select id="fDeporte" class="select" required><option value="">Cargando...</option></select></div>
                        <div class="field"><label>Descripción</label><textarea id="fDesc" class="input" rows="3"></textarea></div>
                        <div style="margin-top:10px;"><button type="submit" class="btn" id="btnSubmitCancha" style="width:100%;">Guardar Cancha</button></div>
                    </form>
                </div>
            </div>
        </div>
        
        <style>
            .switch { position: relative; display: inline-block; width: 34px; height: 18px; margin-right: 8px; vertical-align: middle; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .3s; border-radius: 20px; }
            .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
            input:checked + .slider { background-color: #10b981; }
            input:checked + .slider:before { transform: translateX(16px); }
            .status-text { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
            .status-text.active { color: #10b981; }
            
            .action-btn { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
            .btn-edit { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
            .btn-edit:hover { background: rgba(251, 191, 36, 0.3); }
            .btn-delete { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
            .btn-delete:hover { background: rgba(239, 68, 68, 0.3); }
        </style>
    `;
  },

  attachEventListeners: async () => {
    AdminSidebar.attachListeners();
    
    document.getElementById('btnBackToApp')?.addEventListener('click', () => navigate('/dashboard'));
    document.getElementById('btnReload')?.addEventListener('click', () => loadCanchas(true));
    
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            if(link.getAttribute('onclick')) return;
            e.preventDefault();
        });
    });

    // ✅ CORRECCIÓN DE ORDEN: Cargar Deportes PRIMERO, luego Complejos
    await loadDeportesCombo(); 
    await loadComplejosCombo(); // Este llamará a loadCanchas() al final

    const selectComp = document.getElementById('selectComplejo');
    selectComp.addEventListener('change', (e) => {
        const val = e.target.value;
        state.selectedComplejoId = val;
        state.pagination.page = 1;
        if(val) localStorage.setItem('admin_last_complejo_id', val);
        updateUIState();
    });

    document.getElementById('searchCancha')?.addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        state.pagination.page = 1;
        if (state.searchTimeout) clearTimeout(state.searchTimeout);
        state.searchTimeout = setTimeout(() => loadCanchas(false), 300);
    });

    const modal = document.getElementById('canchaModal');
    const closeModal = () => { modal.style.display = 'none'; state.isEditing = false; state.currentEditId = null; state.isSubmitting = false; };
    document.getElementById('canchaModalClose')?.addEventListener('click', closeModal);
    document.getElementById('canchaModalOverlay')?.addEventListener('click', closeModal);

    document.getElementById('btnNewCancha')?.addEventListener('click', () => {
        if (!state.selectedComplejoId) return;
        state.isEditing = false; state.isSubmitting = false;
        document.getElementById('modalTitle').textContent = "Nueva Cancha";
        document.getElementById('btnSubmitCancha').textContent = "Guardar Cancha";
        document.getElementById('formCancha').reset();
        modal.style.display = 'flex';
    });

    const form = document.getElementById('formCancha');
    if (form && !form.dataset.listening) {
        form.dataset.listening = "true";
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); if(state.isSubmitting) return; state.isSubmitting = true;
            const btn = document.getElementById('btnSubmitCancha'); const original = btn.textContent; btn.textContent = "Procesando..."; btn.disabled = true;
            const data = { complejo_id: state.selectedComplejoId, nombre: document.getElementById('fNombre').value, tipo_deporte_id: document.getElementById('fDeporte').value, descripcion: document.getElementById('fDesc').value, estado: 'activo' };
            try { 
                if (state.isEditing) { 
                    await api.updateCancha(state.currentEditId, data); 
                    toast.success("Cancha actualizada correctamente"); // ✅ TOAST
                } else { 
                    await api.createCancha(data); 
                    toast.success("Cancha creada con éxito"); // ✅ TOAST
                } 
                closeModal(); loadCanchas(true); 
            } catch (err) { 
                toast.error(err.message); // ✅ TOAST ERROR
            } 
            finally { state.isSubmitting = false; btn.textContent = original; btn.disabled = false; }        });
    }
    
    window.toggleCanchaStatus = async (id) => { 
        try { 
            const idx = state.canchas.findIndex(c => c.cancha_id == id); 
            if(idx>-1){ state.canchas[idx].estado = (state.canchas[idx].estado==='activo'?'inactivo':'activo');
                toast.success("Estado Actualizado") 
                renderTable(); } 
            await api.toggleCanchaStatus(id); 
        } catch(e){ 
            toast.error("Error al cambiar estado"); 
            loadCanchas(); 
        } 
    };    
    
        window.editCancha = (id) => { const c = state.canchas.find(x => x.cancha_id == id); if(!c) return; state.isEditing = true; state.currentEditId = id; document.getElementById('modalTitle').textContent = "Editar Cancha"; document.getElementById('btnSubmitCancha').textContent = "Actualizar"; document.getElementById('fNombre').value = c.nombre; document.getElementById('fDeporte').value = c.tipo_deporte_id; document.getElementById('fDesc').value = c.descripcion||''; modal.style.display = 'flex'; };
        window.deleteCancha = async (id) => { 
        const confirmed = await confirmAction("¿Estás seguro de eliminar esta cancha?");
        if(confirmed) { 
            try { 
                await api.deleteCancha(id); 
                toast.success("Cancha eliminada"); // ✅ TOAST
                loadCanchas(); 
            } catch(e){ 
                toast.error(e.message); 
            } 
        } 
    };
  }
};

function updateUIState() { const btn = document.getElementById('btnNewCancha'); if (state.selectedComplejoId) { btn.disabled = false; btn.style.opacity = "1"; btn.style.cursor = "pointer"; loadCanchas(true); } else { btn.disabled = true; btn.style.opacity = "0.5"; } }
async function loadComplejosCombo() { try { const res = await api.getMyComplejos(); const sel = document.getElementById('selectComplejo'); if(res.length){ sel.innerHTML = '<option value="">Selecciona...</option>'+res.map(c=>`<option value="${c.complejo_id}">${c.nombre}</option>`).join(''); const last = localStorage.getItem('admin_last_complejo_id'); if(last && res.find(c=>c.complejo_id==last)) { sel.value=last; state.selectedComplejoId=last; updateUIState(); } else if(res.length===1){ sel.value=res[0].complejo_id; state.selectedComplejoId=res[0].complejo_id; updateUIState(); } } } catch(e){} }
async function loadDeportesCombo() { const d = await api.getSports(); state.deportes=d; document.getElementById('fDeporte').innerHTML=`<option value="">Selecciona...</option>`+d.map(x=>`<option value="${x.value}">${x.label}</option>`).join(''); }
async function loadCanchas() { if(!state.selectedComplejoId) return; const res = await api.getCanchasPaginated(state.selectedComplejoId, state.pagination.page, 10, state.searchTerm, null); let lista = [], total = 0; if (res.data && Array.isArray(res.data)) { lista = res.data; total = res.total || lista.length; } else if (Array.isArray(res)) { lista = res; total = res.length; } state.canchas = lista; state.pagination.total = total; renderTable(); renderPagination(); }

function renderTable() {
    const tbody = document.getElementById('tableCanchas');
    if (!state.canchas.length) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--muted);">No hay canchas. Crea una nueva.</td></tr>`; return; }

    tbody.innerHTML = state.canchas.map((c, idx) => {
        const isActive = (c.estado || 'activo').toLowerCase() === 'activo';
        
        // 1. Intentar usar el nombre que viene del backend (si lo arreglaste)
        // 2. Si no, buscar en el diccionario local state.deportes
        const deporteNombre = c.deporte_nombre || state.deportes.find(d => d.value == c.tipo_deporte_id)?.label || '--';

        let iconSvg = '';
        const n = String(deporteNombre).toLowerCase();
        if(n.includes('fut')) iconSvg = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;
        else if(n.includes('tenis')) iconSvg = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2v20"/></svg>`;
        else iconSvg = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;

        return `
        <tr>
            <td><span style="color:var(--muted); font-weight:bold;">#${(state.pagination.page-1)*10 + idx + 1}</span></td>
            <td><strong style="color:white;">${c.nombre}</strong></td>
            <td><span style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:20px; font-size:0.8rem;">${iconSvg} ${deporteNombre}</span></td>
            <td><small style="color:var(--muted)">${c.descripcion || '--'}</small></td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <label class="switch">
                        <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.toggleCanchaStatus(${c.cancha_id})">
                        <span class="slider"></span>
                    </label>
                    <span class="status-text ${isActive ? 'active' : ''}">${isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                </div>
            </td>
            <td style="text-align:right;">
                <div style="display:flex; gap:5px; justify-content:flex-end;">
                    <button class="action-btn" title="Horarios" onclick="window.router.navigate('/admin/canchas/${c.cancha_id}/horarios')" style="color:#fbbf24; border:1px solid rgba(251,191,36,0.2);"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></button>
                    <button class="action-btn btn-edit" onclick="window.editCancha(${c.cancha_id})"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg></button>
                    <button class="action-btn btn-delete" onclick="window.deleteCancha(${c.cancha_id})"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function renderPagination() {
    const { total, page } = state.pagination;
    const pages = Math.ceil(total / 10) || 1;
    document.getElementById('paginationInfo').textContent = `Mostrando ${total} registros`;
    let html = `<button class="page-btn" ${page===1?'disabled':''} onclick="window.changeCanchaPage(${page-1})">Anterior</button>`;
    for(let i=1; i<=pages; i++) { html += `<button class="page-btn ${i===page?'active':''}" onclick="window.changeCanchaPage(${i})">${i}</button>`; }
    html += `<button class="page-btn" ${page===pages?'disabled':''} onclick="window.changeCanchaPage(${page+1})">Siguiente</button>`;
    document.getElementById('paginationControls').innerHTML = html;
}
window.changeCanchaPage = (p) => { state.pagination.page = p; loadCanchas(true); };

export default adminCanchasView;