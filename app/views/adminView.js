import { navigate } from "../router.js";
import api from "../services/api.js";
import { AdminSidebar } from "../components/AdminSidebar.js";
import { toast } from "../utils/toast.js";
import { confirmAction } from "../utils/confirm.js";


// 1. INYECTAR LIBRERÍAS DE MAPA (LEAFLET)
// Esto descarga el mapa automáticamente sin configurar nada extra
if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css'; link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(script);
}

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
    
    // Estado del mapa (Instancia y Marcador)
    mapInstance: null,
    mapMarker: null,
    mapCoordinates: { lat: -18.0065, lng: -70.2457, url: '' } 
};

// Genera URL formato Google Maps para guardar en BD
function generateMapUrl(lat, lng) {
    return `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

// Convierte URL de Google Maps a formato Embed para visualizar
function generateEmbedUrl(url) {
    if (!url) return '';
    const match = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (!match) return '';
    const lat = match[1];
    const lng = match[2];
    return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

const adminView = {
  render: async () => {
    if (!api.isLoggedIn()) { navigate("/"); return ""; }
    if (!api.isStaff()) { alert("Acceso denegado."); navigate("/dashboard"); return ""; }
    const user = api.getUser();

    return `
        <div class="admin-layout">
            ${AdminSidebar.render('complejos', user)}
            
            <main class="admin-content">
                <div class="page-header">
                    <h2>Gestión de Complejos</h2>
                    <p>Administra tus sedes e instalaciones.</p>
                </div>

                <div class="admin-toolbar">
                    <div class="admin-search-box">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>
                        <input type="text" id="searchInput" placeholder="Buscar...">
                    </div>
                    <button class="btn" id="btnNewComplejo"><span>+</span> Nuevo Complejo</button>
                </div>

                <div class="datagrid-container">
                    <table class="datagrid">
                        <thead><tr><th>#</th><th>Nombre</th><th>Dirección</th><th>Ubicación</th><th>Estado</th><th style="text-align:right;">Acciones</th></tr></thead>
                        <tbody id="tableBody"><tr><td colspan="6" style="text-align:center; padding:30px;">Cargando...</td></tr></tbody>
                    </table>
                    <div class="datagrid-footer"><span id="paginationInfo"></span><div class="pagination" id="paginationControls"></div></div>
                </div>
            </main>

            <!-- MODAL PRINCIPAL (Formulario) -->
            <div id="adminModal" class="modal" style="display:none;">
                <div class="modal-overlay" id="adminModalOverlay"></div>
                <div class="modal-content card" style="max-width:800px; max-height:90vh; overflow-y:auto;">
                    <button class="modal-close" id="adminModalClose">&times;</button>
                    <h3 id="modalTitle" style="margin-bottom:20px;">Registrar Nuevo Complejo</h3>
                    
                    <form id="formComplejo" class="form-grid-2" enctype="multipart/form-data">
                        <div class="form-col-span-2"><label class="small">Nombre *</label><input type="text" id="cNombre" class="input" required></div>
                        
                        <div><label class="small">Departamento</label><select id="cDep" class="select"><option value="">Cargando...</option></select></div>
                        <div><label class="small">Provincia</label><select id="cProv" class="select" disabled></select></div>
                        <div><label class="small">Distrito</label><select id="cDist" class="select" disabled></select></div>
                        <div><label class="small">Dirección *</label><input type="text" id="cDir" class="input" required></div>
                        
                        <!-- SECCIÓN MAPA -->
                        <div class="form-col-span-2" style="margin-bottom: 15px;">
                            <label class="small">Ubicación en Mapa</label>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <input type="text" id="cUrlMap" class="input" placeholder="No seleccionada" readonly style="flex:1; background: rgba(255,255,255,0.05); color: #aaa; cursor:not-allowed;">
                                
                                <button type="button" class="btn" id="btnOpenMapPicker" style="width:180px; flex-shrink:0; display:flex; align-items:center; justify-content:center; gap:8px; background-color: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa;">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"></path>
                                    </svg>
                                    <span>Abrir Mapa</span>
                                </button>
                            </div>
                            
                            <input type="hidden" id="cMapUrlFinal"> 
                            
                            <div id="mapPreviewDisplay" style="margin-top:8px; height:150px; background:#1e293b; border-radius:8px; overflow:hidden; display:none; border:1px solid #334155;">
                                <iframe id="mapIframePreview" style="width:100%; height:100%; border:none;"></iframe>
                            </div>
                        </div>

                        <div class="form-col-span-2">
                            <label class="small">Imagen del Complejo</label>
                            <input type="file" id="cFile" class="input" accept="image/*">
                            <div id="imgPreview" style="margin-top:5px; font-size:0.8rem; color:var(--accent); display:none;"></div>
                        </div>
                        
                        <div class="form-col-span-2"><label class="small">Descripción</label><textarea id="cDesc" class="input" rows="2"></textarea></div>
                        <div class="form-col-span-2" style="margin-top:15px;"><button type="submit" class="btn" id="btnSubmit" style="width:100%;">Crear</button></div>
                    </form>
                </div>
            </div>

            <!-- MODAL DE SELECCIÓN DE MAPA (LEAFLET) -->
            <div id="mapPickerModal" class="modal" style="display:none; z-index: 2000;">
                <div class="modal-overlay" id="mapModalOverlay"></div>
                
                <!-- Ajuste de altura para que entre en pantalla -->
                <div class="modal-content card" style="max-width:90%; width:900px; height: 85vh; display:flex; flex-direction:column; padding:0;">
                    
                    <div style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h3 style="margin:0;">Seleccionar Ubicación</h3>
                            <button class="modal-close" id="mapModalClose" style="position:static;">&times;</button>
                        </div>
                        <p class="small" style="color:var(--text-muted); margin-top:5px; margin-bottom:0;">
                            Arrastra el mapa y haz clic en el punto exacto. Usa la rueda para zoom.
                        </p>
                    </div>
                    
                    <!-- CONTENEDOR MAPA (Flexible) -->
                    <div id="leafletMapContainer" style="flex:1; width: 100%; background: #eee; z-index:1;"></div>

                    <div style="padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; background:#1e293b;">
                        <span id="currentCoords" style="font-family:monospace; font-size:0.9rem; color: white;">
                            Mueve el mapa...
                        </span>
                        <button class="btn" id="btnConfirmMap" disabled style="opacity:0.5;">Confirmar Ubicación</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- ESTILOS -->
        <style>
            .action-btn { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
            .btn-edit { background: rgba(251, 191, 36, 0.15); color: #fbbf24; } .btn-edit:hover { background: rgba(251, 191, 36, 0.3); }
            .btn-delete { background: rgba(239, 68, 68, 0.15); color: #ef4444; } .btn-delete:hover { background: rgba(239, 68, 68, 0.3); }
            .actions-cell { display: flex; justify-content: flex-end; gap: 8px; align-items: center; height: 100%; }
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
      AdminSidebar.attachListeners();
      
      // MODALES
      const modal = document.getElementById('adminModal');
      const mapModal = document.getElementById('mapPickerModal');
      const closeModal = () => { modal.style.display = 'none'; state.isEditing = false; };
      const closeMapModal = () => { mapModal.style.display = 'none'; };

      document.getElementById('adminModalClose')?.addEventListener('click', closeModal);
      document.getElementById('adminModalOverlay')?.addEventListener('click', closeModal);
      document.getElementById('mapModalClose')?.addEventListener('click', closeMapModal);
      document.getElementById('mapModalOverlay')?.addEventListener('click', closeMapModal);

      // BUSCADOR
      document.getElementById('searchInput')?.addEventListener('input', (e) => { 
          state.searchTerm = e.target.value.toLowerCase(); filterData(); renderTable(); 
      });

      // REEMPLAZO FORMULARIO (Limpia listeners viejos)
      const form = document.getElementById('formComplejo');
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);

      // ELEMENTOS DEL NUEVO FORMULARIO
      const btnOpenMap = document.getElementById('btnOpenMapPicker'); 
      const selDep = document.getElementById('cDep');
      const selProv = document.getElementById('cProv');
      const cFile = document.getElementById('cFile');
      const cMapUrlFinal = document.getElementById('cMapUrlFinal');
      const cUrlMapInput = document.getElementById('cUrlMap');
      const mapIframePreview = document.getElementById('mapIframePreview');

      // ============================================================
      // 3. LÓGICA DEL MAPA (LEAFLET) - AHORA FUNCIONA AL CLIC
      // ============================================================
      
      if (btnOpenMap) {
          btnOpenMap.addEventListener('click', (e) => {
              e.preventDefault(); 
              mapModal.style.display = 'flex';
              
              // Pequeño delay para asegurar que el div #leafletMapContainer tiene tamaño
              setTimeout(() => {
                  const initialLat = state.mapCoordinates.lat || -18.0065;
                  const initialLng = state.mapCoordinates.lng || -70.2457;

                  if (!state.mapInstance) {
                      // Crear mapa Leaflet
                      state.mapInstance = L.map('leafletMapContainer').setView([initialLat, initialLng], 15);
                      
                      // Capa de OpenStreetMap (Gratis y arrastrable)
                      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                          attribution: '&copy; OpenStreetMap'
                      }).addTo(state.mapInstance);
                      
                      // Evento Clic en Mapa
                      state.mapInstance.on('click', function(ev) {
                          const { lat, lng } = ev.latlng;
                          updateMarker(lat, lng);
                      });
                  } else {
                      // Si ya existe, redimensionar (fix problema gris) y centrar
                      state.mapInstance.invalidateSize();
                      state.mapInstance.setView([initialLat, initialLng], 15);
                  }

                  // Si ya hay url, poner marcador
                  if (state.mapCoordinates.url) {
                      updateMarker(initialLat, initialLng);
                  } else {
                      // Reset visual
                      if(state.mapMarker) state.mapInstance.removeLayer(state.mapMarker);
                      document.getElementById('currentCoords').textContent = "Haz clic en el mapa para marcar";
                      document.getElementById('btnConfirmMap').disabled = true;
                      document.getElementById('btnConfirmMap').style.opacity = "0.5";
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
          btn.disabled = false;
          btn.style.opacity = "1";
      }

      // Confirmar Ubicación
      document.getElementById('btnConfirmMap').addEventListener('click', () => {
          cUrlMapInput.value = `Ubicación Fijada (${state.mapCoordinates.lat.toFixed(4)}, ${state.mapCoordinates.lng.toFixed(4)})`;
          cMapUrlFinal.value = state.mapCoordinates.url;
          
          // Mostrar preview estática en el formulario principal
          mapIframePreview.src = generateEmbedUrl(state.mapCoordinates.url);
          document.getElementById('mapPreviewDisplay').style.display = 'block';
          
          closeMapModal();
      });

      // 4. UBIGEO Y ARCHIVOS
      const attachCascadingListeners = () => {
          if(selDep) selDep.addEventListener('change', async (e) => { if(e.target.value) await updateProvincias(e.target.value); else resetSelects(); });
          if(selProv) selProv.addEventListener('change', async (e) => { if(e.target.value) await updateDistritos(e.target.value); else updateDistritos(null); });
      };
      attachCascadingListeners(); 
      await loadDepartamentos();

      if(cFile) cFile.addEventListener('change', (e) => {
          const file = e.target.files[0];
          const preview = document.getElementById('imgPreview');
          if (file) { preview.innerHTML = `Archivo: <strong>${file.name}</strong>`; preview.style.display = 'block'; }
          else if(state.originalImageUrl) { preview.innerHTML = `URL Anterior mantenida.`; preview.style.display = 'block'; }
          else { preview.style.display = 'none'; }
      });

      // 5. SUBMIT
      newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (state.isSubmitting) return; state.isSubmitting = true;
            const btn = document.getElementById('btnSubmit'); const originalText = btn.textContent; btn.textContent = "Procesando..."; btn.disabled = true;

            let finalDep = document.getElementById('cDep').value;
            let finalProv = document.getElementById('cProv').value;
            let finalDist = document.getElementById('cDist').value;
            if (state.isEditing && state.currentEditId && !finalDep) {
                const original = state.allComplejos.find(c => c.complejo_id == state.currentEditId);
                if (original) { finalDep = original.departamento_id; finalProv = original.provincia_id; finalDist = original.distrito_id; }
            }
            
            const file = cFile.files[0];
            
            const data = { 
                nombre: document.getElementById('cNombre').value, 
                direccion_detalle: document.getElementById('cDir').value, 
                descripcion: document.getElementById('cDesc').value, 
                estado: 'activo',
                departamento_id: finalDep, provincia_id: finalProv, distrito_id: finalDist,
                file: file || null, 
                url_imagen: !file ? state.originalImageUrl : null, 
                url_map: cMapUrlFinal.value || null, // ✅ URL DEL MAPA
            };

            try { 
                if (state.isEditing) { await api.updateComplejo(state.currentEditId, data); toast.success("Complejo actualizado correctamente");; } 
                else { await api.createComplejo(data); toast.success("Complejo creado con éxito"); } 
                closeModal(); await loadData(); 
            } catch (err) { toast.error(err.message || "Error al guardar complejo"); } 
            finally { state.isSubmitting = false; btn.textContent = originalText; btn.disabled = false; }
      });

      // 6. BOTON NUEVO
      document.getElementById('btnNewComplejo')?.addEventListener('click', async () => {
        state.isEditing = false; state.currentEditId = null; state.originalImageUrl = null;
        document.getElementById('formComplejo').reset();
        document.getElementById('imgPreview').style.display = 'none';
        document.getElementById('mapPreviewDisplay').style.display = 'none';
        cMapUrlFinal.value = ''; cUrlMapInput.value = '';
        
        // Reset mapa
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

// ... (Helpers: loadData, renderTable, etc. se mantienen IGUAL) ...
function resetSelects() { const p = document.getElementById('cProv'); if(p) { p.innerHTML = '<option value="">Seleccione Dep.</option>'; p.disabled = true; } const d = document.getElementById('cDist'); if(d) { d.innerHTML = '<option value="">Seleccione Prov.</option>'; d.disabled = true; } }
async function loadDepartamentos() { const deps = await api.getDepartamentos(); const el = document.getElementById('cDep'); if(el) el.innerHTML = '<option value="">Seleccione...</option>' + deps.map(d => `<option value="${d.id}">${d.name}</option>`).join(''); }
async function updateProvincias(depId) { const provs = await api.getProvincias(depId); const el = document.getElementById('cProv'); if(el) { el.innerHTML = '<option value="">Seleccione...</option>' + provs.map(p => `<option value="${p.id}">${p.name}</option>`).join(''); el.disabled = false; } const elD = document.getElementById('cDist'); if(elD) { elD.innerHTML = '<option value="">Seleccione Prov.</option>'; elD.disabled = true; } }
async function updateDistritos(provId) { const dists = await api.getDistritos(provId); const el = document.getElementById('cDist'); if(el) { el.innerHTML = '<option value="">Seleccione...</option>' + dists.map(d => `<option value="${d.id}">${d.name}</option>`).join(''); el.disabled = false; } }

async function loadData() { 
    try { 
        const res = await api.getMyComplejos();
        state.allComplejos = res; filterData(); renderTable(); 
    } catch (e) {
        toast.error("No se pudieron cargar los complejos"); // ✅ TOAST
    }
}
window.toggleStatus = async (id) => { 
    try { 
        const idx = state.allComplejos.findIndex(c => c.complejo_id == id); 
        if(idx > -1) { 
            const curr = state.allComplejos[idx].estado; 
            state.allComplejos[idx].estado = (curr==='activo'?'inactivo':'activo'); 
            filterData();
            toast.success("Estado Actualizado") 
            renderTable(); 
        } 
        await api.toggleComplejoStatus(id); 
    } catch (e) { 
        toast.error("Error al cambiar estado: " + e.message); // ✅ TOAST
        await loadData(); 
    } 
};

window.deleteComplejo = async (id) => { 
    const confirmed = await confirmAction("Esta acción eliminará el complejo y todos sus datos permanentemente.");
    if (confirmed) {
        try { 
            await api.deleteComplejo(id); 
            toast.success("Complejo eliminado"); 
            await loadData(); 
        } catch(e){ 
            toast.error(e.message); 
        } 
    }
};

window.editComplejo = (id) => {
    navigate(`/admin/complejos/editar/${id}`);
};
function filterData() { if (!state.searchTerm) { state.filteredComplejos = state.allComplejos; } else { state.filteredComplejos = state.allComplejos.filter(c => c.nombre.toLowerCase().includes(state.searchTerm)); } }
function renderTable() { const tbody = document.getElementById('tableBody'); const { filteredComplejos, currentPage, itemsPerPage } = state; const start = (currentPage - 1) * itemsPerPage; const paginated = filteredComplejos.slice(start, start + itemsPerPage); if (paginated.length === 0) { tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--muted);">Sin datos.</td></tr>`; } else { tbody.innerHTML = paginated.map((c, i) => { const isActive = (c.estado || 'activo').toLowerCase() === 'activo'; return `<tr><td><span style="color:var(--muted);">#${start + i + 1}</span></td><td><strong style="color:white;">${c.nombre}</strong></td><td>${c.direccion || '--'}</td><td><span class="status" style="background:rgba(255,255,255,0.1); color:#cbd5e1;">${c.ubicacion_label || '--'}</span></td><td><div style="display:flex; align-items:center; gap:8px;"><label class="switch"><input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.toggleStatus(${c.complejo_id})"><span class="slider"></span></label><span class="status-text ${isActive ? 'active' : ''}">${isActive ? 'ACTIVO' : 'INACTIVO'}</span></div></td><td style="text-align:right;"><div class="actions-cell"><button class="action-btn btn-edit" onclick="window.editComplejo(${c.complejo_id})"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg></button><button class="action-btn btn-delete" onclick="window.deleteComplejo(${c.complejo_id})"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button></div></td></tr>`; }).join(''); } 
    renderPagination(); 
}
function renderPagination() { const total = state.filteredComplejos.length; const pages = Math.ceil(total / state.itemsPerPage) || 1; document.getElementById('paginationInfo').textContent = `Mostrando ${state.filteredComplejos.length} registros`; let html = `<button class="page-btn" ${state.currentPage===1?'disabled':''} onclick="window.changePage(${state.currentPage-1})">Anterior</button>`; for(let i=1; i<=pages; i++) { html += `<button class="page-btn ${i===state.currentPage?'active':''}" onclick="window.changePage(${i})">${i}</button>`; } html += `<button class="page-btn" ${state.currentPage===pages?'disabled':''} onclick="window.changePage(${state.currentPage+1})">Siguiente</button>`; document.getElementById('paginationControls').innerHTML = html; }
window.changeCanchaPage = (p) => { state.currentPage = p; renderTable(); };

export default adminView;