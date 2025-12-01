import { navigate } from "../router.js";
import api from "../services/api.js";
import { AdminSidebar } from "../components/AdminSidebar.js";
import { toast } from "../utils/toast.js";
import { confirmAction } from "../utils/confirm.js";

// --- 1. LIBRERÍAS MAPA ---
if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css'; link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(script);
}

// --- 2. ICONOS SVG (Set Unificado) ---
const ICONS = {
    search: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>`,
    plus: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    edit: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    lock: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    mapPin: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    refresh: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`
};

// --- 3. ESTADO ---
let state = {
    allComplejos: [],
    filteredComplejos: [],
    currentPage: 1,
    itemsPerPage: 10,
    searchTerm: '',
    isEditing: false,
    currentEditId: null,
    isSubmitting: false,
    originalImageUrl: null,
    mapInstance: null,
    mapMarker: null,
    mapCoordinates: { lat: -18.0065, lng: -70.2457, url: '' }
};

// --- Helpers Mapa ---
const generateMapUrl = (lat, lng) => `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
const generateEmbedUrl = (url) => {
    if (!url) return '';
    const match = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (!match) return '';
    return `https://maps.google.com/maps?q=${match[1]},${match[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};

// --- VISTA ---
const adminView = {
  render: async () => {
    if (!api.isLoggedIn()) { navigate("/"); return ""; }
    if (!api.isStaff()) { toast.error("Acceso denegado."); navigate("/dashboard"); return ""; }
    const user = api.getUser();

    // Estilos alineados con Reservas/Canchas
    const styles = `
        <style>
            /* Badges */
            .role-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid transparent; }
            .badge-owner { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border-color: rgba(251, 191, 36, 0.3); }
            .badge-gestor { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border-color: rgba(59, 130, 246, 0.3); }

            /* Action Buttons */
            .action-btn { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
            .btn-edit { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.2); }
            .btn-edit:hover { background: rgba(251, 191, 36, 0.3); }
            .btn-delete { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
            .btn-delete:hover { background: rgba(239, 68, 68, 0.3); }
            .btn-locked { background: #1e293b; color: #64748b; border: 1px solid #334155; cursor: not-allowed; opacity: 0.6; }

            /* Switch */
            .switch { position: relative; display: inline-block; width: 34px; height: 18px; margin-right: 8px; vertical-align: middle; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .3s; border-radius: 20px; }
            .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
            input:checked + .slider { background-color: #10b981; }
            input:checked + .slider:before { transform: translateX(16px); }
            input:disabled + .slider { background-color: #1e293b; cursor: not-allowed; opacity: 0.5; }
            
            .status-text { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .status-text.active { color: #34d399; }
        </style>
    `;

    return `
        ${styles}
        <div class="admin-layout">
            ${AdminSidebar.render('complejos', user)}
            
            <main class="admin-content">
                <!-- HEADER -->
                <div class="page-header" style="display:flex; justify-content:space-between; align-items:flex-end;">
                    <div>
                        <h2>Mis Complejos</h2>
                        <p>Administra tus sedes e instalaciones.</p>
                    </div>
                    <button class="btn" id="btnReload" title="Recargar" style="padding: 8px 12px; display:flex; gap:6px;">
                        ${ICONS.refresh} Actualizar
                    </button>
                </div>

                <!-- TOOLBAR -->
                <div class="admin-toolbar">
                    <div class="admin-search-box">
                        ${ICONS.search}
                        <input type="text" id="searchInput" placeholder="Buscar por nombre...">
                    </div>
                    <button class="btn" id="btnNewComplejo" style="display:flex; align-items:center; gap:8px;">
                        ${ICONS.plus} Nuevo Complejo
                    </button>
                </div>

                <!-- DATAGRID -->
                <div class="datagrid-container">
                    <table class="datagrid">
                        <thead>
                            <tr>
                                <th style="width:50px;">#</th>
                                <th>Nombre</th>
                                <th style="width:100px;">Tu Rol</th>
                                <th>Ubicación</th>
                                <th>Estado</th>
                                <th style="text-align:right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <tr><td colspan="6" style="text-align:center; padding:40px; color:var(--muted);">Cargando...</td></tr>
                        </tbody>
                    </table>
                    <div class="datagrid-footer">
                        <span class="small" style="color:var(--muted)" id="paginationInfo">0 registros</span>
                        <div class="pagination" id="paginationControls"></div>
                    </div>
                </div>
            </main>

            <!-- MODAL FORMULARIO -->
            <div id="adminModal" class="modal" style="display:none;">
                <div class="modal-overlay" id="adminModalOverlay"></div>
                <div class="modal-content card" style="max-width:700px; max-height:90vh; overflow-y:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:15px;">
                        <h3 id="modalTitle" style="margin:0;">Nuevo Complejo</h3>
                        <button class="modal-close" id="adminModalClose" style="position:static;">&times;</button>
                    </div>
                    
                    <form id="formComplejo" class="form-grid-2" enctype="multipart/form-data">
                        <div class="form-col-span-2">
                            <label class="small">Nombre de la Sede *</label>
                            <input type="text" id="cNombre" class="input" required placeholder="Ej. Complejo Deportivo Los Olivos">
                        </div>
                        
                        <div><label class="small">Departamento</label><select id="cDep" class="select"><option value="">Cargando...</option></select></div>
                        <div><label class="small">Provincia</label><select id="cProv" class="select" disabled></select></div>
                        <div><label class="small">Distrito</label><select id="cDist" class="select" disabled></select></div>
                        
                        <div>
                            <label class="small">Dirección *</label>
                            <input type="text" id="cDir" class="input" required placeholder="Av. Principal 123">
                        </div>
                        
                        <!-- MAPA -->
                        <div class="form-col-span-2" style="background:rgba(255,255,255,0.03); padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                            <label class="small" style="display:flex; align-items:center; gap:5px;">
                                ${ICONS.mapPin} Ubicación en Mapa
                            </label>
                            <div style="display:flex; gap:10px; margin-top:5px;">
                                <input type="text" id="cUrlMap" class="input" placeholder="No seleccionada" readonly style="flex:1; cursor:not-allowed; opacity:0.7;">
                                <button type="button" class="btn" id="btnOpenMapPicker" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3);">
                                    📍 Abrir Mapa
                                </button>
                            </div>
                            <input type="hidden" id="cMapUrlFinal">
                            <div id="mapPreviewDisplay" style="margin-top:10px; height:150px; background:#0f172a; border-radius:8px; overflow:hidden; display:none; border:1px solid rgba(255,255,255,0.1);">
                                <iframe id="mapIframePreview" style="width:100%; height:100%; border:none;"></iframe>
                            </div>
                        </div>

                        <div class="form-col-span-2">
                            <label class="small">Imagen de Portada</label>
                            <input type="file" id="cFile" class="input" accept="image/*">
                            <div id="imgPreview" style="margin-top:5px; font-size:0.8rem; color:#34d399; display:none;"></div>
                        </div>
                        
                        <div class="form-col-span-2">
                            <label class="small">Descripción</label>
                            <textarea id="cDesc" class="input" rows="2" placeholder="Breve descripción..."></textarea>
                        </div>
                        
                        <div class="form-col-span-2" style="margin-top:10px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.1);">
                            <button type="submit" class="btn" id="btnSubmit" style="width:100%;">Guardar Sede</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL MAPA -->
            <div id="mapPickerModal" class="modal" style="display:none; z-index:2000;">
                <div class="modal-overlay" id="mapModalOverlay"></div>
                <div class="modal-content card" style="max-width:90%; width:900px; height:85vh; display:flex; flex-direction:column; padding:0;">
                    <div style="padding:15px 20px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; background:#1e293b;">
                        <h3 style="margin:0; font-size:1.1rem;">Seleccionar Ubicación</h3>
                        <button class="modal-close" id="mapModalClose" style="position:static;">&times;</button>
                    </div>
                    <div id="leafletMapContainer" style="flex:1; width:100%; background:#eee; z-index:1;"></div>
                    <div style="padding:15px 20px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; background:#1e293b;">
                        <span id="currentCoords" style="font-family:monospace; font-size:0.85rem; color:var(--muted);">Haz clic en el mapa...</span>
                        <button class="btn" id="btnConfirmMap" disabled style="opacity:0.5;">Confirmar</button>
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
          const icon = document.querySelector('#btnReload svg');
          if(icon) icon.style.transform = 'rotate(180deg)';
          setTimeout(() => { if(icon) icon.style.transform = 'none'; }, 500);
          loadData();
      });

      // Modales
      const modal = document.getElementById('adminModal');
      const mapModal = document.getElementById('mapPickerModal');
      
      const closeModal = () => { modal.style.display = 'none'; state.isEditing = false; };
      const closeMapModal = () => { mapModal.style.display = 'none'; };

      document.getElementById('adminModalClose').addEventListener('click', closeModal);
      document.getElementById('adminModalOverlay').addEventListener('click', closeModal);
      document.getElementById('mapModalClose').addEventListener('click', closeMapModal);
      
      // Buscador
      document.getElementById('searchInput')?.addEventListener('input', (e) => { 
          state.searchTerm = e.target.value.toLowerCase(); 
          filterData(); 
          renderTable(); 
      });

      // Formulario: Usamos replaceChild para limpiar listeners previos
      const form = document.getElementById('formComplejo');
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);

      // Referencias Formulario
      const btnOpenMap = document.getElementById('btnOpenMapPicker'); 
      const selDep = document.getElementById('cDep');
      const selProv = document.getElementById('cProv');
      const selDist = document.getElementById('cDist');
      const cFile = document.getElementById('cFile');
      
      // Mapa
      if (btnOpenMap) {
          btnOpenMap.addEventListener('click', (e) => {
              e.preventDefault(); 
              mapModal.style.display = 'flex';
              
              setTimeout(() => {
                  const initialLat = state.mapCoordinates.lat || -18.0065;
                  const initialLng = state.mapCoordinates.lng || -70.2457;

                  if (!state.mapInstance) {
                      state.mapInstance = L.map('leafletMapContainer').setView([initialLat, initialLng], 15);
                      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(state.mapInstance);
                      
                      state.mapInstance.on('click', function(ev) {
                          updateMarker(ev.latlng.lat, ev.latlng.lng);
                      });
                  } else {
                      state.mapInstance.invalidateSize();
                      state.mapInstance.setView([initialLat, initialLng], 15);
                  }

                  if (state.mapCoordinates.url) {
                      updateMarker(initialLat, initialLng);
                  }
              }, 200);
          });
      }

      function updateMarker(lat, lng) {
          if (state.mapMarker) state.mapInstance.removeLayer(state.mapMarker);
          state.mapMarker = L.marker([lat, lng]).addTo(state.mapInstance);
          state.mapCoordinates = { lat, lng, url: generateMapUrl(lat, lng) };
          
          document.getElementById('currentCoords').textContent = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
          document.getElementById('currentCoords').style.color = "#4ade80";
          const btn = document.getElementById('btnConfirmMap');
          btn.disabled = false; btn.style.opacity = "1";
      }

      document.getElementById('btnConfirmMap').addEventListener('click', () => {
          document.getElementById('cUrlMap').value = `Ubicación Seleccionada`;
          document.getElementById('cMapUrlFinal').value = state.mapCoordinates.url;
          document.getElementById('mapIframePreview').src = generateEmbedUrl(state.mapCoordinates.url);
          document.getElementById('mapPreviewDisplay').style.display = 'block';
          closeMapModal();
      });

      // Ubigeo
      const attachCascadingListeners = () => {
          if(selDep) selDep.addEventListener('change', async (e) => { if(e.target.value) await updateProvincias(e.target.value); else resetSelects(); });
          if(selProv) selProv.addEventListener('change', async (e) => { if(e.target.value) await updateDistritos(e.target.value); else updateDistritos(null); });
      };
      attachCascadingListeners(); 
      await loadDepartamentos();

      // Archivo
      if(cFile) cFile.addEventListener('change', (e) => {
          const file = e.target.files[0];
          const preview = document.getElementById('imgPreview');
          if (file) { preview.innerHTML = `Imagen: <strong>${file.name}</strong>`; preview.style.display = 'block'; }
          else if(state.originalImageUrl) { preview.innerHTML = `Imagen actual mantenida.`; preview.style.display = 'block'; }
          else { preview.style.display = 'none'; }
      });

      // Submit
      newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (state.isSubmitting) return; state.isSubmitting = true;
            const btn = document.getElementById('btnSubmit'); 
            const originalText = btn.textContent; btn.textContent = "Guardando..."; btn.disabled = true;

            // Recuperar valores de Ubigeo (si no se tocaron en edit, mantener los viejos)
            let finalDep = selDep.value;
            let finalProv = selProv.value;
            let finalDist = selDist.value;
            
            if (state.isEditing && state.currentEditId && !finalDep) {
                const original = state.allComplejos.find(c => c.complejo_id == state.currentEditId);
                if (original) { finalDep = original.departamento_id; finalProv = original.provincia_id; finalDist = original.distrito_id; }
            }
            
            const data = { 
                nombre: document.getElementById('cNombre').value, 
                direccion_detalle: document.getElementById('cDir').value, 
                descripcion: document.getElementById('cDesc').value, 
                estado: 'activo',
                departamento_id: finalDep, provincia_id: finalProv, distrito_id: finalDist,
                file: cFile.files[0] || null, 
                url_imagen: !cFile.files[0] ? state.originalImageUrl : null, 
                url_map: document.getElementById('cMapUrlFinal').value || null,
            };

            try { 
                if (state.isEditing) { await api.updateComplejo(state.currentEditId, data); toast.success("Sede actualizada"); } 
                else { await api.createComplejo(data); toast.success("Sede creada correctamente"); } 
                closeModal(); await loadData(); 
            } catch (err) { toast.error(err.message || "Error al guardar"); } 
            finally { state.isSubmitting = false; btn.textContent = originalText; btn.disabled = false; }
      });

      // Botón Nuevo
      document.getElementById('btnNewComplejo')?.addEventListener('click', async () => {
        state.isEditing = false; state.currentEditId = null; state.originalImageUrl = null;
        document.getElementById('formComplejo').reset();
        document.getElementById('modalTitle').textContent = "Nuevo Complejo";
        document.getElementById('btnSubmit').textContent = "Guardar Sede";
        document.getElementById('imgPreview').style.display = 'none';
        document.getElementById('mapPreviewDisplay').style.display = 'none';
        document.getElementById('cMapUrlFinal').value = ''; 
        document.getElementById('cUrlMap').value = '';
        
        // Reset Map
        state.mapCoordinates = { lat: -18.0065, lng: -70.2457, url: '' };
        if(state.mapInstance && state.mapMarker) {
             state.mapInstance.removeLayer(state.mapMarker);
             state.mapMarker = null;
        }
        
        resetSelects(); await loadDepartamentos(); modal.style.display = 'flex';
      });

      await loadData();
  }
};

// --- HELPERS ---
function resetSelects() { 
    const p = document.getElementById('cProv'); if(p) { p.innerHTML = '<option value="">Seleccione Dep.</option>'; p.disabled = true; } 
    const d = document.getElementById('cDist'); if(d) { d.innerHTML = '<option value="">Seleccione Prov.</option>'; d.disabled = true; } 
}
async function loadDepartamentos() { const deps = await api.getDepartamentos(); const el = document.getElementById('cDep'); if(el) el.innerHTML = '<option value="">Seleccione...</option>' + deps.map(d => `<option value="${d.id}">${d.name}</option>`).join(''); }
async function updateProvincias(depId) { const provs = await api.getProvincias(depId); const el = document.getElementById('cProv'); if(el) { el.innerHTML = '<option value="">Seleccione...</option>' + provs.map(p => `<option value="${p.id}">${p.name}</option>`).join(''); el.disabled = false; } document.getElementById('cDist').disabled = true; }
async function updateDistritos(provId) { const dists = await api.getDistritos(provId); const el = document.getElementById('cDist'); if(el) { el.innerHTML = '<option value="">Seleccione...</option>' + dists.map(d => `<option value="${d.id}">${d.name}</option>`).join(''); el.disabled = false; } }

async function loadData() { 
    try { 
        const res = await api.getMyComplejos();
        state.allComplejos = res; filterData(); renderTable(); 
    } catch (e) {
        toast.error("Error cargando sedes");
    }
}

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
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--muted);">No tienes complejos registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = paginated.map((c, i) => {
        const isActive = (c.estado || 'activo').toLowerCase() === 'activo';
        
        // LOGICA DE ROLES
        const myRole = parseInt(c.mi_rol); 
        const isOwner = myRole === 1;

        // Badge Visual
        const roleBadge = isOwner 
            ? '<span class="role-badge badge-owner">Dueño</span>'
            : '<span class="role-badge badge-gestor">Gestor</span>';

        // Botón Eliminar protegido
        const deleteBtn = isOwner 
            ? `<button class="action-btn btn-delete" onclick="window.deleteComplejo(${c.complejo_id})" title="Eliminar">${ICONS.trash}</button>`
            : `<button class="action-btn btn-locked" title="Solo el dueño puede eliminar" disabled>${ICONS.lock}</button>`;

        // Switch protegido
        const switchControl = `
            <label class="switch">
                <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.toggleStatus(${c.complejo_id})" ${!isOwner ? 'disabled' : ''}>
                <span class="slider"></span>
            </label>
        `;

        return `
        <tr>
            <td><span style="color:var(--muted);">#${start + i + 1}</span></td>
            <td><strong style="color:white;">${c.nombre}</strong></td>
            <td>${roleBadge}</td>
            <td>${c.ubicacion_label || '--'}</td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    ${switchControl}
                    <span class="status-text ${isActive ? 'active' : ''}">${isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                </div>
            </td>
            <td style="text-align:right;">
                <div style="display:flex; justify-content:flex-end; gap:8px;">
                    <button class="action-btn btn-edit" onclick="window.editComplejo(${c.complejo_id})" title="Editar">${ICONS.edit}</button>
                    ${deleteBtn}
                </div>
            </td>
        </tr>`;
    }).join('');
    
    renderPagination();
}

function renderPagination() {
    const total = state.filteredComplejos.length;
    const pages = Math.ceil(total / state.itemsPerPage) || 1;
    document.getElementById('paginationInfo').textContent = `Total: ${total}`;
    
    let html = `<button class="page-btn" ${state.currentPage===1?'disabled':''} onclick="window.changePage(${state.currentPage-1})">Anterior</button>`;
    for(let i=1; i<=pages; i++) { html += `<button class="page-btn ${i===state.currentPage?'active':''}" onclick="window.changePage(${i})">${i}</button>`; }
    html += `<button class="page-btn" ${state.currentPage===pages?'disabled':''} onclick="window.changePage(${state.currentPage+1})">Siguiente</button>`;
    
    document.getElementById('paginationControls').innerHTML = html;
}

window.changePage = (p) => { state.currentPage = p; renderTable(); };

window.toggleStatus = async (id) => { 
    try { 
        const row = state.allComplejos.find(c => c.complejo_id == id);
        if(row && row.mi_rol != 1) { toast.error("Solo el dueño puede cambiar el estado."); renderTable(); return; }

        row.estado = (row.estado==='activo'?'inactivo':'activo'); 
        filterData(); renderTable(); 
        await api.toggleComplejoStatus(id); 
        toast.success("Estado actualizado");
    } catch (e) { 
        toast.error("Error al actualizar"); await loadData(); 
    } 
};

window.deleteComplejo = async (id) => { 
    if(await confirmAction("¿Eliminar esta sede permanentemente?")) {
        try { await api.deleteComplejo(id); toast.success("Sede eliminada"); await loadData(); } 
        catch(e){ toast.error(e.message); } 
    }
};

    window.editComplejo = (id) => {
    // Asume que la ruta para editar es /admin/complejo/form/{id}
    navigate(`/admin/complejos/editar/${id}`);
};


export default adminView;