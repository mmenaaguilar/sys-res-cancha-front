import { navigate } from "../router.js";
import api from "../services/api.js";

let state = {
    complejos: [],
    selectedComplejoId: null,
    servicios: [],
    pagination: { total: 0, page: 1, limit: 10 },
    searchTerm: '',
    isEditing: false,
    currentEditId: null,
    isSubmitting: false
};

const adminServicesView = {
  render: async () => {
    if (!api.isLoggedIn()) { navigate("/"); return ""; }
    if (!api.isStaff()) { alert("Acceso denegado."); navigate("/dashboard"); return ""; }
    const user = api.getUser();

    return `
        <div class="admin-layout">
            <!-- SIDEBAR -->
            <aside class="admin-sidebar">
                <div class="sidebar-header">
                    <img src="assets/images/logo.png" alt="ReserSport">
                    <div><h3>Panel Admin</h3><span class="status active" style="font-size:0.65rem;">${user.nombre}</span></div>
                </div>
                
                <nav class="sidebar-nav">
                    <div style="padding:0 12px; margin-bottom:8px; font-size:0.75rem; color:#64748b; font-weight:700;">PRINCIPAL</div>
                    
                    <a href="#" onclick="window.router.navigate('/admin'); return false;">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21V12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9"/></svg> Mis Complejos
                    </a>
                    <a href="#" onclick="window.router.navigate('/admin/canchas'); return false;">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 12h20M12 2v20"/><circle cx="12" cy="12" r="3"/></svg> Canchas
                    </a>

                    <div style="padding:10px 12px 8px; font-size:0.75rem; color:#64748b; font-weight:700;">OPERACIONES</div>
                    
                    <a href="#" onclick="window.router.navigate('/admin/contactos'); return false;">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Contactos
                    </a>
                    
                    <!-- ENLACE ACTIVO -->
                    <a href="#" onclick="window.location.reload()" class="active">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Servicios
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <button class="btn" id="btnBackToApp" style="width:100%; background:rgba(255,255,255,0.05);">Volver al App</button>
                </div>
            </aside>
            
            <!-- MAIN -->
            <main class="admin-content">
                <div class="page-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:15px;">
                    <div>
                        <h2>Servicios Adicionales</h2>
                        <p>Chalecos, pelotas, arbitraje, cocheras, etc.</p>
                    </div>
                    
                    <!-- SELECTOR SEDE -->
                    <div style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); padding:8px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                        <span style="color:var(--muted); font-size:0.85rem;">Sede:</span>
                        <select id="selectComplejo" class="select" style="background:transparent; border:none; height:auto; padding:0; color:var(--accent); font-weight:700; cursor:pointer; width:180px;">
                            <option value="">Cargando...</option>
                        </select>
                    </div>
                </div>

                <div class="admin-toolbar">
                    <div class="admin-search-box">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                        <input type="text" id="searchService" placeholder="Buscar servicio...">
                    </div>
                    <button class="btn" id="btnNewService" disabled style="opacity:0.5; cursor:not-allowed;">
                        <span>+</span> Nuevo Servicio
                    </button>
                </div>

                <!-- TABLA SERVICIOS -->
                <div class="datagrid-container">
                    <table class="datagrid">
                        <thead>
                            <tr>
                                <th style="width:50px;">#</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th style="text-align:right;">Precio (S/.)</th>
                                <th>Estado</th>
                                <th style="text-align:right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tableServices">
                            <tr><td colspan="6" style="text-align:center; padding:40px; color:var(--muted);">Selecciona una sede.</td></tr>
                        </tbody>
                    </table>
                    <div class="datagrid-footer">
                        <span class="small" style="color:var(--muted)" id="paginationInfo">0 registros</span>
                        <div class="pagination" id="paginationControls"></div>
                    </div>
                </div>
            </main>

            <!-- MODAL FORMULARIO -->
            <div id="serviceModal" class="modal" style="display:none;">
                <div class="modal-overlay" id="modalOverlay"></div>
                <div class="modal-content card" style="max-width:500px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                        <h3 id="modalTitle">Nuevo Servicio</h3>
                        <button class="modal-close" id="modalClose">&times;</button>
                    </div>
                    
                    <form id="formService">
                        <div class="field">
                            <label>Nombre del Servicio *</label>
                            <input type="text" id="sNombre" class="input" required placeholder="Ej. Alquiler de Pelota">
                        </div>
                        
                        <div class="field">
                            <label>Precio (S/.) *</label>
                            <div class="input-group" style="position:relative;">
                                <span style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-muted);">S/.</span>
                                <input type="number" id="sMonto" class="input" required min="0" step="0.01" style="padding-left:35px;" placeholder="0.00">
                            </div>
                        </div>

                        <div class="field">
                            <label>Descripción</label>
                            <textarea id="sDesc" class="input" rows="2" placeholder="Detalles del servicio..."></textarea>
                        </div>
                        
                        <div class="field" id="divEstado" style="display:none;">
                            <label>Estado</label>
                            <select id="sEstado" class="select">
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                            </select>
                        </div>

                        <button type="submit" class="btn" id="btnSubmit" style="width:100%; margin-top:10px;">Guardar</button>
                    </form>
                </div>
            </div>
        </div>

        <style>
            /* Switch Toggle */
            .switch { position: relative; display: inline-block; width: 34px; height: 18px; margin-right: 8px; vertical-align: middle; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .3s; border-radius: 20px; }
            .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
            input:checked + .slider { background-color: #10b981; }
            input:checked + .slider:before { transform: translateX(16px); }
            .status-text { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
            .status-text.active { color: #10b981; }
            
            /* Actions */
            .action-btn { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
            .btn-edit { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
            .btn-edit:hover { background: rgba(251, 191, 36, 0.3); }
            .btn-delete { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
            .btn-delete:hover { background: rgba(239, 68, 68, 0.3); }
        </style>
    `;
  },

  attachEventListeners: async () => {
      document.getElementById('btnBackToApp')?.addEventListener('click', () => navigate('/dashboard'));

      // Cargar Sedes
      try {
        const complejos = await api.getMyComplejos();
        const sel = document.getElementById('selectComplejo');
        if(complejos.length > 0) {
            sel.innerHTML = '<option value="">Selecciona Sede...</option>' + complejos.map(c => `<option value="${c.complejo_id}">${c.nombre}</option>`).join('');
            
            const lastId = localStorage.getItem('admin_last_complejo_id');
            if(lastId && complejos.find(c => c.complejo_id == lastId)) {
                sel.value = lastId;
                state.selectedComplejoId = lastId;
                loadServicios();
            } else if (complejos.length === 1) {
                sel.value = complejos[0].complejo_id;
                state.selectedComplejoId = complejos[0].complejo_id;
                loadServicios();
            }
            
            if(state.selectedComplejoId) updateUI();
        } else { sel.innerHTML = '<option>Sin sedes</option>'; }
      } catch(e){}

      document.getElementById('selectComplejo').addEventListener('change', (e) => {
          state.selectedComplejoId = e.target.value;
          state.pagination.page = 1;
          if(state.selectedComplejoId) localStorage.setItem('admin_last_complejo_id', state.selectedComplejoId);
          updateUI();
          loadServicios();
      });

      // Buscador
      document.getElementById('searchService')?.addEventListener('input', (e) => {
          state.searchTerm = e.target.value;
          loadServicios();
      });

      // Modal Logic
      const modal = document.getElementById('serviceModal');
      const closeModal = () => { modal.style.display = 'none'; state.isEditing = false; };
      document.getElementById('modalClose').addEventListener('click', closeModal);
      document.getElementById('modalOverlay').addEventListener('click', closeModal);

      document.getElementById('btnNewService').addEventListener('click', () => {
          if(!state.selectedComplejoId) return;
          state.isEditing = false;
          document.getElementById('modalTitle').textContent = "Nuevo Servicio";
          document.getElementById('btnSubmit').textContent = "Guardar";
          document.getElementById('formService').reset();
          document.getElementById('divEstado').style.display = 'none';
          modal.style.display = 'flex';
      });

      // Submit
      document.getElementById('formService').addEventListener('submit', async (e) => {
          e.preventDefault();
          if(state.isSubmitting) return; state.isSubmitting = true;
          const btn = document.getElementById('btnSubmit'); btn.textContent = "Guardando..."; btn.disabled = true;

          const data = {
              complejo_id: state.selectedComplejoId,
              nombre: document.getElementById('sNombre').value,
              monto: document.getElementById('sMonto').value,
              descripcion: document.getElementById('sDesc').value,
              estado: state.isEditing ? document.getElementById('sEstado').value : 'activo'
          };

          try {
              if(state.isEditing) await api.updateServicio(state.currentEditId, data);
              else await api.createServicio(data);
              closeModal();
              loadServicios();
          } catch(err) { alert("Error: " + err.message); }
          finally { state.isSubmitting = false; btn.textContent = "Guardar"; btn.disabled = false; }
      });

      // Acciones Globales
      window.editService = (id) => {
          const s = state.servicios.find(x => x.servicio_id == id);
          if(!s) return;
          state.isEditing = true; state.currentEditId = id;
          document.getElementById('modalTitle').textContent = "Editar Servicio";
          document.getElementById('sNombre').value = s.nombre;
          document.getElementById('sMonto').value = parseFloat(s.monto);
          document.getElementById('sDesc').value = s.descripcion || '';
          document.getElementById('divEstado').style.display = 'block';
          document.getElementById('sEstado').value = s.estado;
          modal.style.display = 'flex';
      };

      window.deleteService = async (id) => {
          if(confirm("¿Eliminar este servicio?")) {
              try { await api.deleteServicio(id); loadServicios(); } catch(e){}
          }
      };

      window.toggleServiceStatus = async (id) => {
          try {
              // Optimistic UI
              const idx = state.servicios.findIndex(s => s.servicio_id == id);
              if(idx > -1) {
                  const curr = state.servicios[idx].estado;
                  state.servicios[idx].estado = (curr === 'activo' ? 'inactivo' : 'activo');
                  renderTable();
              }
              await api.toggleStatusServicio(id);
          } catch(e){ loadServicios(); } // Revertir si falla
      };
  }
};

function updateUI() {
    const btn = document.getElementById('btnNewService');
    if (state.selectedComplejoId) {
        btn.disabled = false; btn.style.opacity = "1"; btn.style.cursor = "pointer";
    } else {
        btn.disabled = true; btn.style.opacity = "0.5"; btn.style.cursor = "not-allowed";
    }
}

async function loadServicios() {
    if(!state.selectedComplejoId) return;
    const tbody = document.getElementById('tableServices');
    
    try {
        const res = await api.getServicios(state.selectedComplejoId, 1, 100, state.searchTerm);
        state.servicios = res.data || [];
        renderTable();
    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Error al cargar</td></tr>`;
    }
}

function renderTable() {
    const tbody = document.getElementById('tableServices');
    if (state.servicios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--muted);">No hay servicios registrados.</td></tr>`;
        document.getElementById('paginationInfo').textContent = "0 registros";
        return;
    }

    tbody.innerHTML = state.servicios.map((s, idx) => {
        const isActive = s.estado === 'activo';
        
        return `
        <tr style="opacity: ${isActive ? 1 : 0.6};">
            <td><span style="color:var(--muted);">#${idx+1}</span></td>
            <td><strong style="color:white;">${s.nombre}</strong></td>
            <td><small style="color:var(--muted);">${s.descripcion || '--'}</small></td>
            <td style="text-align:right; color:#4ade80; font-weight:bold;">S/. ${parseFloat(s.monto).toFixed(2)}</td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <label class="switch">
                        <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.toggleServiceStatus(${s.servicio_id})">
                        <span class="slider"></span>
                    </label>
                    <span class="status-text ${isActive ? 'active' : ''}">${isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                </div>
            </td>
            <td style="text-align:right;">
                <div style="display:flex; gap:5px; justify-content:flex-end;">
                    <button class="action-btn btn-edit" onclick="window.editService(${s.servicio_id})" title="Editar"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg></button>
                    <button class="action-btn btn-delete" onclick="window.deleteService(${s.servicio_id})" title="Eliminar"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>
                </div>
            </td>
        </tr>`;
    }).join('');
    
    document.getElementById('paginationInfo').textContent = `${state.servicios.length} registros`;
}

export default adminServicesView;