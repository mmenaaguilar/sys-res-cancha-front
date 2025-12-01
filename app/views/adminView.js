import { navigate } from "../router.js";
import api from "../services/api.js";

let state = {
    allComplejos: [], 
    filteredComplejos: [], 
    currentPage: 1, 
    itemsPerPage: 10, 
    searchTerm: '', 
    isEditing: false, 
    currentEditId: null,
    isSubmitting: false 
};

const adminView = {
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
                    
                    <!-- ACTIVO -->
                    <a href="#" onclick="window.location.reload()" class="active">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21V12a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9"/></svg>
                        Mis Complejos
                    </a>
                    
                    <a href="#" onclick="window.router.navigate('/admin/canchas'); return false;">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 12h20M12 2v20"/><circle cx="12" cy="12" r="3"/></svg>
                        Gestión de Canchas
                    </a>

                    <div style="padding: 10px 12px 8px; font-size:0.75rem; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Operaciones</div>
                    
                    <!-- ENLACE A CONTACTOS AGREGADO -->
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
            
            <!-- CONTENIDO -->
            <main class="admin-content">
                <div class="page-header">
                    <h2>Gestión de Complejos</h2>
                    <p>Administra tus sedes e instalaciones.</p>
                </div>

                <div class="admin-toolbar">
                    <div class="admin-search-box">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                        <input type="text" id="searchInput" placeholder="Buscar por nombre o dirección...">
                    </div>
                    <button class="btn" id="btnNewComplejo"><span>+</span> Nuevo Complejo</button>
                </div>

                <div class="datagrid-container">
                    <table class="datagrid">
                        <thead>
                            <tr>
                                <th style="width:50px;">#</th>
                                <th>Nombre</th>
                                <th>Dirección</th>
                                <th>Ubicación</th>
                                <th>Estado</th>
                                <th style="text-align:right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <tr><td colspan="6" style="text-align:center; padding:30px;">Cargando...</td></tr>
                        </tbody>
                    </table>
                    <div class="datagrid-footer">
                        <span class="small" style="color:var(--muted)" id="paginationInfo">0 registros</span>
                        <div class="pagination" id="paginationControls"></div>
                    </div>
                </div>
            </main>

            <!-- MODAL -->
            <div id="adminModal" class="modal" style="display:none;">
                <div class="modal-overlay" id="adminModalOverlay"></div>
                <div class="modal-content card" style="max-width:800px;">
                    <button class="modal-close" id="adminModalClose">&times;</button>
                    <h3 id="modalTitle" style="margin-bottom:20px; border-bottom:1px solid var(--glass); padding-bottom:10px;">Registrar Nuevo Complejo</h3>
                    
                    <form id="formComplejo" class="form-grid-2">
                        <div class="form-col-span-2"><label class="small">Nombre *</label><input type="text" id="cNombre" class="input" required></div>
                        <div><label class="small">Departamento</label><select id="cDep" class="select"><option value="">Cargando...</option></select></div>
                        <div><label class="small">Provincia</label><select id="cProv" class="select" disabled></select></div>
                        <div><label class="small">Distrito</label><select id="cDist" class="select" disabled></select></div>
                        <div><label class="small">Dirección *</label><input type="text" id="cDir" class="input" required></div>
                        <div class="form-col-span-2"><label class="small">Imagen (URL)</label><input type="text" id="cImg" class="input"></div>
                        <div class="form-col-span-2"><label class="small">Descripción</label><textarea id="cDesc" class="input" rows="2"></textarea></div>
                        <div class="form-col-span-2" style="margin-top:15px;"><button type="submit" class="btn" id="btnSubmit" style="width:100%;">Guardar</button></div>
                    </form>
                </div>
            </div>
        </div>
        <style>
            /* ESTILO DEL SWITCH (BARRITA) */
            .switch { position: relative; display: inline-block; width: 34px; height: 18px; margin-right: 8px; vertical-align: middle; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .3s; border-radius: 20px; }
            .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
            input:checked + .slider { background-color: #10b981; }
            input:checked + .slider:before { transform: translateX(16px); }
            
            /* TEXTO ESTADO */
            .status-text { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
            .status-text.active { color: #10b981; }
        </style>
    `;
  },

  attachEventListeners: async () => {
      document.getElementById('btnBackToApp')?.addEventListener('click', () => navigate('/dashboard'));
      
      const modal = document.getElementById('adminModal');
      const closeModal = () => { modal.style.display = 'none'; state.isEditing = false; state.currentEditId = null; state.isSubmitting = false; };
      document.getElementById('adminModalClose')?.addEventListener('click', closeModal);
      document.getElementById('adminModalOverlay')?.addEventListener('click', closeModal);
      
      document.getElementById('btnNewComplejo')?.addEventListener('click', async () => {
        state.isEditing = false; state.currentEditId = null; state.isSubmitting = false;
        document.getElementById('modalTitle').textContent = "Registrar Nuevo Complejo";
        document.getElementById('btnSubmit').textContent = "Guardar";
        document.getElementById('formComplejo').reset();
        resetSelects(); await loadDepartamentos(); 
        modal.style.display = 'flex';
      });
      
      const selDep = document.getElementById('cDep'); 
      const selProv = document.getElementById('cProv');
      if(selDep) selDep.onchange = async (e) => { if(e.target.value) await updateProvincias(e.target.value); };
      if(selProv) selProv.onchange = async (e) => { if(e.target.value) await updateDistritos(e.target.value); };

      document.getElementById('searchInput')?.addEventListener('input', (e) => { 
          state.searchTerm = e.target.value.toLowerCase(); 
          state.currentPage = 1; 
          filterData(); 
          renderTable(); 
      });

      const form = document.getElementById('formComplejo');
      if (form && !form.dataset.listening) {
          form.dataset.listening = "true"; 
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (state.isSubmitting) return; state.isSubmitting = true;
            const btn = document.getElementById('btnSubmit'); 
            const originalText = btn.textContent; btn.textContent = "Procesando..."; btn.disabled = true;

            // Lógica de fusión de ubicación si se edita solo nombre
            let finalDep = document.getElementById('cDep').value;
            let finalProv = document.getElementById('cProv').value;
            let finalDist = document.getElementById('cDist').value;

            if (state.isEditing && state.currentEditId && !finalDep) {
                const original = state.allComplejos.find(c => c.complejo_id == state.currentEditId);
                if (original) {
                    finalDep = original.departamento_id;
                    finalProv = original.provincia_id;
                    finalDist = original.distrito_id;
                }
            }

            const data = { 
                nombre: document.getElementById('cNombre').value, 
                direccion_detalle: document.getElementById('cDir').value, 
                url_imagen: document.getElementById('cImg').value, 
                descripcion: document.getElementById('cDesc').value, 
                estado: 'activo',
                departamento_id: finalDep, 
                provincia_id: finalProv, 
                distrito_id: finalDist
            };

            try { 
                if (state.isEditing) { await api.updateComplejo(state.currentEditId, data); alert("¡Actualizado!"); } 
                else { await api.createComplejo(data); alert("¡Creado!"); } 
                closeModal(); await loadData(); 
            } catch (err) { alert("Error: " + err.message); } 
            finally { state.isSubmitting = false; btn.textContent = originalText; btn.disabled = false; }
          });
      }
      await loadData();
  }
};

// --- FUNCIONES AUXILIARES ---
function resetSelects() { /* ... igual ... */ const p = document.getElementById('cProv'); if(p) { p.innerHTML = '<option value="">Seleccione Dep.</option>'; p.disabled = true; } const d = document.getElementById('cDist'); if(d) { d.innerHTML = '<option value="">Seleccione Prov.</option>'; d.disabled = true; } }
async function loadDepartamentos() { const deps = await api.getDepartamentos(); const el = document.getElementById('cDep'); if(el) el.innerHTML = '<option value="">Seleccione...</option>' + deps.map(d => `<option value="${d.id}">${d.name}</option>`).join(''); }
async function updateProvincias(depId) { const provs = await api.getProvincias(depId); const el = document.getElementById('cProv'); if(el) { el.innerHTML = '<option value="">Seleccione...</option>' + provs.map(p => `<option value="${p.id}">${p.name}</option>`).join(''); el.disabled = false; } const elD = document.getElementById('cDist'); if(elD) { elD.innerHTML = '<option value="">Seleccione Prov.</option>'; elD.disabled = true; } }
async function updateDistritos(provId) { const dists = await api.getDistritos(provId); const el = document.getElementById('cDist'); if(el) { el.innerHTML = '<option value="">Seleccione...</option>' + dists.map(d => `<option value="${d.id}">${d.name}</option>`).join(''); el.disabled = false; } }
async function loadData() { try { state.allComplejos = await api.getMyComplejos(); filterData(); renderTable(); } catch (e) {} }

// LOGICA OPTIMISTA PARA EL TOGGLE
window.toggleStatus = async (id) => { 
    try { 
        // 1. Cambio Visual Inmediato
        const itemIndex = state.allComplejos.findIndex(c => c.complejo_id == id);
        if (itemIndex > -1) {
            const current = state.allComplejos[itemIndex].estado;
            state.allComplejos[itemIndex].estado = (current === 'activo' ? 'inactivo' : 'activo');
            filterData(); // Actualizar lista filtrada
            renderTable(); // Re-pintar tabla
        }
        
        // 2. Llamada al servidor en segundo plano
        await api.toggleComplejoStatus(id); 
    } catch (e) { 
        alert("Error al cambiar estado: " + e.message); 
        await loadData(); // Revertir si falla
    } 
};

window.deleteComplejo = async (id) => { if(confirm("¿Eliminar complejo permanentemente?")) { try { await api.deleteComplejo(id); await loadData(); } catch(e){ alert(e.message); } } };

window.editComplejo = async (id) => { 
    const c = state.allComplejos.find(x => x.complejo_id == id);
    if(!c) return;
    state.isEditing = true; state.currentEditId = id;
    document.getElementById('modalTitle').textContent = "Editar Complejo";
    document.getElementById('btnSubmit').textContent = "Actualizar";
    document.getElementById('cNombre').value = c.nombre;
    document.getElementById('cDir').value = c.direccion;
    document.getElementById('cImg').value = c.url_imagen || '';
    document.getElementById('cDesc').value = c.descripcion || ''; 
    resetSelects(); await loadDepartamentos();
    document.getElementById('adminModal').style.display = 'flex';
};

function filterData() { 
    if (!state.searchTerm) { state.filteredComplejos = state.allComplejos; } 
    else { state.filteredComplejos = state.allComplejos.filter(c => c.nombre.toLowerCase().includes(state.searchTerm)); } 
}

function renderTable() { 
    const tbody = document.getElementById('tableBody'); 
    const { filteredComplejos, currentPage, itemsPerPage } = state; 
    const start = (currentPage - 1) * itemsPerPage; 
    const paginated = filteredComplejos.slice(start, start + itemsPerPage); 
    
    if (paginated.length === 0) { 
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--muted);">Sin datos.</td></tr>`; 
    } else { 
        tbody.innerHTML = paginated.map((c, i) => { 
            const isActive = (c.estado || 'activo').toLowerCase() === 'activo';
            
            return `
            <tr>
                <td><span style="color:var(--muted); font-weight:bold;">#${start + i + 1}</span></td>
                <td><strong style="color:white;">${c.nombre}</strong></td>
                <td>${c.direccion || '--'}</td>
                <td><span class="status" style="background:rgba(255,255,255,0.1); color:#cbd5e1;">${c.ubicacion_label || '--'}</span></td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label class="switch">
                            <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.toggleStatus(${c.complejo_id})">
                            <span class="slider"></span>
                        </label>
                        <span class="status-text ${isActive ? 'active' : ''}">${isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                    </div>
                </td>
                <td style="text-align:right;">
                    <button class="action-btn btn-edit" onclick="window.editComplejo(${c.complejo_id})"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg></button>
                    <button class="action-btn btn-delete" onclick="window.deleteComplejo(${c.complejo_id})"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 0-1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>
                </td>
            </tr>`; 
        }).join(''); 
    } 
    renderPagination(); 
}

function renderPagination() { /* (Copia esta función del archivo anterior o déjala igual si ya la tienes) */ 
    const total = state.filteredComplejos.length; const pages = Math.ceil(total / state.itemsPerPage) || 1; document.getElementById('paginationInfo').textContent = `Mostrando ${state.filteredComplejos.length} registros`; let html = `<button class="page-btn" ${state.currentPage===1?'disabled':''} onclick="window.changePage(${state.currentPage-1})">Anterior</button>`; for(let i=1; i<=pages; i++) { html += `<button class="page-btn ${i===state.currentPage?'active':''}" onclick="window.changePage(${i})">${i}</button>`; } html += `<button class="page-btn" ${state.currentPage===pages?'disabled':''} onclick="window.changePage(${state.currentPage+1})">Siguiente</button>`; document.getElementById('paginationControls').innerHTML = html;
}
window.changePage = (p) => { state.currentPage = p; renderTable(); };

export default adminView;