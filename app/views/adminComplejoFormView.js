import { navigate } from "../router.js";
import api from "../services/api.js";
import { AdminSidebar } from "../components/AdminSidebar.js";
import { toast } from "../utils/toast.js";

// Inyección de Leaflet
if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; document.head.appendChild(script);
}

// ✅ Función definitiva - usa window.location.origin para URL completa
function getAbsoluteImageUrl(relativePath) {
    if (!relativePath) return null;
    
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }
    
    let cleanPath = relativePath;
    
    // Eliminar 'public/' del inicio
    if (cleanPath.startsWith('public/')) {
        cleanPath = cleanPath.substring(7);
    } else if (cleanPath.startsWith('public\\')) {
        cleanPath = cleanPath.substring(7);
    }
    
    cleanPath = cleanPath.replace(/\\/g, '/');
    cleanPath = cleanPath.replace(/^\//, '');
    
    // ✅ Forzar el puerto 8000 para desarrollo
    const baseUrl = 'http://localhost:8000'; // <-- ¡Aquí está la clave!
    return baseUrl + '/' + cleanPath;
}

let state = {
    complejo: null,
    isSubmitting: false,
    originalImageUrl: null,
    mapInstance: null,
    mapMarker: null,
    mapCoordinates: { lat: -12.0463, lng: -77.0428, url: '' }
};

function generateMapUrl(lat, lng) { return `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`; }

function parseCoordsFromUrl(url) {
    if (!url) return null;
    let match = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    match = url.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
}

const adminComplejoFormView = {
  render: async (params) => {
    if (!api.isLoggedIn()) { navigate("/"); return ""; }
    const user = api.getUser();
    
    const complexes = await api.getMyComplejos();
    const id = params.id || window.location.pathname.split('/').pop();
    
    const c = complexes.find(x => x.complejo_id == id);
    if (!c) { 
        toast.error("Complejo no encontrado"); 
        navigate("/admin"); 
        return ""; 
    }
    
    state.complejo = c;
    state.currentEditId = id;
    state.originalImageUrl = c.url_imagen;

    const displayImageUrl = c.url_imagen ? getAbsoluteImageUrl(c.url_imagen) : null;

    // Agregar depuración temporal
    if (displayImageUrl) {
        console.log('🔍 URL de imagen generada:', displayImageUrl);
    }

    const imagePreviewHtml = displayImageUrl
        ? `<img src="${displayImageUrl}" 
               style="width:100%; height:100%; object-fit:cover; border-radius:10px;"
               onerror="console.error('❌ Error al cargar imagen:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div style="display:none; text-align:center; color:#ef4444; height:100%; flex-direction:column; justify-content:center;">
               <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24" style="margin:0 auto;"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
               <span style="font-size:0.8rem; margin-top:5px;">No se puede cargar la imagen</span>
           </div>`
        : `<div style="text-align:center; color:var(--text-muted);">
             <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24" style="margin:0 auto; display:block; opacity:0.5;"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
             <span style="font-size:0.85rem;">Clic para subir imagen</span>
           </div>`;

    return `
        <div class="admin-layout">
            ${AdminSidebar.render('complejos', user)}
            
            <main class="admin-content">
                <div class="page-header-flex">
                    <button class="btn-icon-back" onclick="window.history.back()">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <div>
                        <h2 style="margin:0;">Editar Complejo</h2>
                        <p class="small" style="color:var(--text-muted); margin-top:4px;">Editando: <span style="color:white; font-weight:bold;">${c.nombre}</span></p>
                    </div>
                </div>

                <div class="card form-container">
                    <form id="formComplejo" enctype="multipart/form-data">
                        
                        <h4 class="section-title">Información General</h4>
                        <div class="grid-2-col">
                            <div class="field">
                                <label>Nombre del Complejo *</label>
                                <input type="text" id="cNombre" class="input-pro" value="${c.nombre}" required>
                            </div>
                            <div class="field">
                                <label>Dirección Exacta *</label>
                                <input type="text" id="cDir" class="input-pro" value="${c.direccion}" required>
                            </div>
                        </div>
                        
                        <div class="grid-3-col">
                            <div class="field">
                                <label>Departamento</label>
                                <select id="cDep" class="select-pro"><option value="">Cargando...</option></select>
                            </div>
                            <div class="field">
                                <label>Provincia</label>
                                <select id="cProv" class="select-pro" disabled></select>
                            </div>
                            <div class="field">
                                <label>Distrito</label>
                                <select id="cDist" class="select-pro" disabled></select>
                            </div>
                        </div>
                        
                        <div class="field" style="margin-top:15px;">
                            <label>Descripción / Detalles</label>
                            <textarea id="cDesc" class="input-pro" rows="3">${c.descripcion || ''}</textarea>
                        </div>

                        <hr class="separator">

                        <div class="grid-2-col-layout">
                            <div class="field map-section">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                    <label style="margin:0;">📍 Ubicación en Mapa</label>
                                    <span class="badge-info">Haz clic para corregir</span>
                                </div>
                                <div id="mapContainer" class="map-box"></div>
                                <div class="coords-box">
                                    <span id="currentCoords">Sin ubicación definida</span>
                                    <input type="hidden" id="cMapUrlFinal" value="${c.url_map || ''}">
                                </div>
                            </div>

                            <div class="field image-section">
                                <label>📷 Imagen de Portada</label>
                                <div class="image-preview-wrapper" onclick="document.getElementById('cFile').click()">
                                    <div id="imgPreviewBox" class="img-box">
                                        ${imagePreviewHtml}
                                    </div>
                                    <div class="img-overlay">Cambiar Foto</div>
                                </div>
                                <input type="file" id="cFile" class="input" accept="image/*" style="display:none;">
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary-pro" onclick="window.history.back()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn-primary-pro" id="btnSubmit">
                                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
        
        <style>
            .form-container { padding: 30px; background: #1e293b; border: 1px solid rgba(255,255,255,0.05); }
            .section-title { color: var(--accent); margin-bottom: 20px; font-size: 1.1rem; border-left: 3px solid var(--accent); padding-left: 10px; }
            .separator { border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0; }

            .input-pro, .select-pro { width: 100%; background-color: #0f172a; border: 1px solid #334155; color: #e2e8f0; padding: 10px 12px; border-radius: 8px; outline: none; }
            .input-pro:focus, .select-pro:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
            .select-pro:disabled { opacity: 0.6; cursor: not-allowed; }
            
            .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
            .grid-3-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 15px; }
            .grid-2-col-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
            
            .map-box { height: 320px; width: 100%; background: #334155; border-radius: 12px; z-index: 1; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
            .coords-box { margin-top: 10px; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; color: #4ade80; border: 1px solid rgba(255,255,255,0.05); }
            .badge-info { font-size: 0.75rem; background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 2px 8px; border-radius: 4px; }

            .image-preview-wrapper { position: relative; cursor: pointer; border-radius: 12px; overflow: hidden; height: 320px; border: 2px dashed rgba(255,255,255,0.1); transition: all 0.2s; background: #0f172a; }
            .image-preview-wrapper:hover { border-color: var(--accent); }
            .img-box { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
            .img-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); color: white; text-align: center; padding: 8px; transform: translateY(100%); transition: transform 0.2s; font-size: 0.9rem; }
            .image-preview-wrapper:hover .img-overlay { transform: translateY(0); }

            .form-actions { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: flex-end; gap: 12px; }
            .btn-secondary-pro { background: transparent; border: 1px solid #475569; color: #cbd5e1; padding: 10px 24px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
            .btn-secondary-pro:hover { background: rgba(255,255,255,0.05); border-color: #94a3b8; color: white; }
            .btn-primary-pro { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border: none; color: white; padding: 10px 30px; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3); transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
            .btn-primary-pro:hover { transform: translateY(-1px); box-shadow: 0 6px 10px -2px rgba(37, 99, 235, 0.4); filter: brightness(1.1); }

            @media (max-width: 900px) { 
                .grid-2-col, .grid-3-col, .grid-2-col-layout { grid-template-columns: 1fr; } 
                .map-box, .image-preview-wrapper { height: 250px; }
            }
        </style>
    `;
  },

  attachEventListeners: async () => {
    AdminSidebar.attachListeners();
    const c = state.complejo; 

    await loadDepartamentos();
    if(c.departamento_id) {
        document.getElementById('cDep').value = c.departamento_id;
        await updateProvincias(c.departamento_id);
        document.getElementById('cProv').value = c.provincia_id;
        await updateDistritos(c.provincia_id);
        document.getElementById('cDist').value = c.distrito_id;
    }

    setTimeout(() => {
        let startLat = -12.0463; 
        let startLng = -77.0428; 
        let hasSavedLocation = false;

        if (c.url_map) {
            const coords = parseCoordsFromUrl(c.url_map);
            if (coords) {
                startLat = coords.lat;
                startLng = coords.lng;
                hasSavedLocation = true;
            }
        }

        state.mapInstance = L.map('mapContainer').setView([startLat, startLng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(state.mapInstance);
        
        if (hasSavedLocation) {
            state.mapMarker = L.marker([startLat, startLng]).addTo(state.mapInstance);
            document.getElementById('currentCoords').textContent = `Guardada: ${startLat.toFixed(5)}, ${startLng.toFixed(5)}`;
            document.getElementById('currentCoords').style.color = "#4ade80";
        } else {
            document.getElementById('currentCoords').textContent = "Ubicación por defecto (Haz clic para cambiar)";
            document.getElementById('currentCoords').style.color = "#fbbf24";
        }

        state.mapInstance.on('click', (e) => {
            const { lat, lng } = e.latlng;
            if (state.mapMarker) state.mapInstance.removeLayer(state.mapMarker);
            state.mapMarker = L.marker([lat, lng]).addTo(state.mapInstance);
            
            const url = generateMapUrl(lat, lng);
            document.getElementById('cMapUrlFinal').value = url;
            document.getElementById('currentCoords').textContent = `Nueva: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            document.getElementById('currentCoords').style.color = "#60a5fa";
        });
        state.mapInstance.invalidateSize();
    }, 500);

    document.getElementById('cDep').addEventListener('change', async (e) => {
         if(e.target.value) await updateProvincias(e.target.value); else { document.getElementById('cProv').innerHTML=''; document.getElementById('cDist').innerHTML=''; }
    });
    document.getElementById('cProv').addEventListener('change', async (e) => {
         if(e.target.value) await updateDistritos(e.target.value); else document.getElementById('cDist').innerHTML='';
    });

    document.getElementById('cFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        const imgBox = document.getElementById('imgPreviewBox');
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => imgBox.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:10px;">`;
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('formComplejo').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (state.isSubmitting) return; 
        state.isSubmitting = true;
        const btn = document.getElementById('btnSubmit'); 
        const originalContent = btn.innerHTML;
        btn.innerHTML = `Guardando...`; btn.disabled = true;

        const file = document.getElementById('cFile').files[0];
        
        const data = {
            nombre: document.getElementById('cNombre').value,
            direccion_detalle: document.getElementById('cDir').value,
            descripcion: document.getElementById('cDesc').value,
            estado: 'activo',
            departamento_id: document.getElementById('cDep').value || c.departamento_id,
            provincia_id: document.getElementById('cProv').value || c.provincia_id,
            distrito_id: document.getElementById('cDist').value || c.distrito_id,
            
            file: file || null,
            url_imagen: !file ? state.originalImageUrl : null, 
            url_map: document.getElementById('cMapUrlFinal').value || c.url_map
        };

        try {
            await api.updateComplejo(state.currentEditId, data);
            toast.success("¡Complejo actualizado correctamente!");
            setTimeout(() => navigate('/admin'), 1000);
        } catch (err) {
            toast.error(err.message || "Error al actualizar");
            state.isSubmitting = false; 
            btn.innerHTML = originalContent; btn.disabled = false;
        }
    });
  }
};

async function loadDepartamentos() { const deps = await api.getDepartamentos(); document.getElementById('cDep').innerHTML = '<option value="">Seleccione...</option>' + deps.map(d => `<option value="${d.id}">${d.name}</option>`).join(''); }
async function updateProvincias(depId) { const provs = await api.getProvincias(depId); const el = document.getElementById('cProv'); el.innerHTML = '<option value="">Seleccione...</option>' + provs.map(p => `<option value="${p.id}">${p.name}</option>`).join(''); el.disabled = false; }
async function updateDistritos(provId) { const dists = await api.getDistritos(provId); const el = document.getElementById('cDist'); el.innerHTML = '<option value="">Seleccione...</option>' + dists.map(d => `<option value="${d.id}">${d.name}</option>`).join(''); el.disabled = false; }

export default adminComplejoFormView;