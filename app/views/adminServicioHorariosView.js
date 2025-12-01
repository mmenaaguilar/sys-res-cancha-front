import { navigate } from "../router.js";
import api from "../services/api.js";
import { AdminSidebar } from "../components/AdminSidebar.js";
import { toast } from "../utils/toast.js";
import { confirmAction } from "../utils/confirm.js";

let state = {
    servicioId: null,
    horariosAsignados: [], 
    complejoId: null,
    canchas: [],
    horariosBaseDisponibles: [], 
    allHorariosCache: {}, 
    isEditing: false,
    currentEditId: null,
    isSubmitting: false
};

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// --- ICONOS SVG ---
const ICON_WEEKLY = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:6px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const ICON_SPECIAL = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:6px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const ICON_CLOCK = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const ICON_ALERT = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const ICON_CHECK = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;

// Helper para obligatoriedad (Acepta 1, "1", true, "true")
function isTrue(val) {
    if (val === undefined || val === null) return false;
    const s = String(val).toLowerCase();
    return s === '1' || s === 'true' || s === 'on' || s === 'yes';
}

const adminServicioHorariosView = {
  render: async (params) => {
    state.servicioId = params.id;
    if (!state.servicioId) { navigate("/admin/servicios"); return ""; }
    
    state.complejoId = localStorage.getItem('admin_last_complejo_id');
    const servicioNombre = localStorage.getItem('admin_temp_servicio_name') || `Servicio #${state.servicioId}`;
    const user = api.getUser();

    return `
      <div class="admin-layout">
        ${AdminSidebar.render('servicios', user)}

        <main class="admin-content">
            <div class="container schedule-container">
                
                <div class="page-header-flex">
                    <button class="btn-icon-back" onclick="window.history.back()">
                        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <div>
                        <h2 style="margin:0;">Configurar: <span style="color:var(--accent);">${servicioNombre}</span></h2>
                        <p class="small" style="color:var(--text-muted); margin-top:4px;">Define disponibilidad y tarifas del servicio.</p>
                    </div>
                </div>

                <div class="grid-responsive">
                    
                    <div class="card form-card">
                        <h3 id="formTitle" style="margin-bottom:15px; border-bottom:1px solid var(--glass); padding-bottom:10px;">Asignar Nuevo Horario</h3>
                        
                        <form id="formServicioHorario">
                            
                            <div class="field">
                                <label class="small">1. Selecciona la Cancha</label>
                                <select id="selCancha" class="select" required>
                                    <option value="">Cargando canchas...</option>
                                </select>
                            </div>

                            <div class="field">
                                <label class="small">2. Selecciona el Horario Base</label>
                                <select id="selHorarioBase" class="select" required disabled>
                                    <option value="">Primero selecciona cancha</option>
                                </select>
                                <div id="horarioDetails" style="margin-top:5px; font-size:0.8rem; color:#4ade80; display:none;"></div>
                            </div>

                            <div class="field" style="display:flex; align-items:center; gap:10px; margin-top:15px; background:rgba(255,255,255,0.03); padding:10px; border-radius:8px;">
                                <label class="switch">
                                    <input type="checkbox" id="shObligatorio" checked>
                                    <span class="slider"></span>
                                </label>
                                <div>
                                    <span style="font-size:0.9rem; color:white; display:block;">¿Es Obligatorio?</span>
                                    <span style="font-size:0.7rem; color:var(--text-muted);">Si se activa, se cobrará siempre automáticamente.</span>
                                </div>
                            </div>

                            <div class="field" id="divEstado" style="display:none; margin-top:15px;">
                                <label class="small">Estado</label>
                                <select id="shEstado" class="select">
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>

                            <div style="display:flex; gap:10px; margin-top:20px;">
                                <button type="button" id="btnCancel" class="btn btn-secondary" style="display:none; flex:1;">Cancelar</button>
                                <button type="submit" class="btn" id="btnSubmit" style="flex:2;" disabled>Asignar</button>
                            </div>
                        </form>
                    </div>

                    <div class="card list-card">
                        <div class="list-header">
                            <h3 style="color:var(--accent); margin:0;">Horarios Asignados</h3>
                            <span class="badge" id="countBadge" style="background:rgba(255,255,255,0.1);">0</span>
                        </div>
                        <div id="listContainer" class="schedule-list">
                            <div class="empty-state">Cargando asignaciones...</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
      
      <style>
        .schedule-container { padding-top: 20px; max-width: 1100px; }
        .grid-responsive { display: grid; grid-template-columns: 350px 1fr; gap: 25px; align-items: start; }
        @media (max-width: 900px) { .grid-responsive { grid-template-columns: 1fr; } }
        
        .btn-icon-back { background: rgba(255,255,255,0.1); border: none; color: white; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .btn-icon-back:hover { background: rgba(255,255,255,0.2); }

        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--glass); }
        
        .sh-item { 
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); 
            padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
            transition: all 0.2s;
        }
        .sh-item:hover { transform: translateX(2px); background: rgba(255,255,255,0.05); }
        
        .sh-item.obligatorio { border-left: 3px solid #ef4444; background: linear-gradient(90deg, rgba(239,68,68,0.1) 0%, transparent 100%); } 
        .sh-item.opcional { border-left: 3px solid #4ade80; } 
        .sh-item.inactive { opacity: 0.6; border-left-color: #64748b; background: none; }

        .switch { position: relative; display: inline-block; width: 34px; height: 18px; margin-right:8px; flex-shrink:0; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .3s; border-radius: 20px; }
        .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
        input:checked + .slider { background-color: #10b981; }
        input:checked + .slider:before { transform: translateX(16px); }

        .action-btn { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.05); color:#ccc; }
        .btn-edit { color: #fbbf24; } .btn-edit:hover { background: rgba(251,191,36,0.15); }
        .btn-delete { color: #ef4444; } .btn-delete:hover { background: rgba(239,68,68,0.15); }
        
        .empty-state { text-align: center; padding: 40px; color: var(--text-muted); border: 2px dashed rgba(255,255,255,0.1); border-radius: 10px; }
        #selHorarioBase option { background: #1e293b; color: white; padding: 8px; }
      </style>
    `;
  },

  attachEventListeners: async () => {
      AdminSidebar.attachListeners();
      await loadInitialData();

      document.getElementById('selCancha').addEventListener('change', async (e) => {
          const canchaId = e.target.value;
          if (!canchaId) { resetHorariosSelect(); return; }
          await loadHorariosBase(canchaId);
      });

      document.getElementById('selHorarioBase').addEventListener('change', (e) => {
          const val = e.target.value;
          document.getElementById('btnSubmit').disabled = !val;
          document.getElementById('btnSubmit').style.opacity = val ? '1' : '0.5';
          
          const details = document.getElementById('horarioDetails');
          if(val) {
              const hb = state.horariosBaseDisponibles.find(h => h.horario_base_id == val);
              if(hb) {
                  details.innerHTML = `Precio Base: <strong>S/. ${parseFloat(hb.monto).toFixed(2)}</strong>`;
                  details.style.display = 'block';
              }
          } else { details.style.display = 'none'; }
      });

      document.getElementById('formServicioHorario').addEventListener('submit', async (e) => {
          e.preventDefault();
          if(state.isSubmitting) return;
          state.isSubmitting = true;
          const btn = document.getElementById('btnSubmit'); const txt = btn.textContent; btn.textContent = "Guardando..."; btn.disabled = true;

          let horarioId = document.getElementById('selHorarioBase').value;
          if (state.isEditing && !horarioId) {
             const item = state.horariosAsignados.find(x => x.id == state.currentEditId);
             horarioId = item.horarioBase_id;
          }

          const data = {
              servicio_id: state.servicioId,
              horarioBase_id: horarioId,
              is_obligatorio: document.getElementById('shObligatorio').checked ? 1 : 0,
              estado: state.isEditing ? document.getElementById('shEstado').value : 'activo'
          };

          try {
              if (state.isEditing) {
                  await api.updateServicioHorario(state.currentEditId, data);
                  toast.success("Asignación actualizada");
                  // Resetear el formulario completamente tras actualizar
                  cancelEdit();
              } else {
                  await api.createServicioHorario(data);
                  toast.success("Horario asignado correctamente");
                  document.getElementById('shObligatorio').checked = true;
              }
              await loadList(); 
          } catch (err) { toast.error(err.message || "Error al guardar"); }
          finally { 
            state.isSubmitting = false; 
            // Si no estamos editando (es decir, fue creación o se canceló edición), habilitar si corresponde
            if (!state.isEditing) {
                 btn.textContent = "Asignar";
                 // Mantener disabled si no hay selección
                 if (!document.getElementById('selHorarioBase').value) {
                     btn.disabled = true;
                 } else {
                     btn.disabled = false;
                 }
            }
          }
      });

      // --- EVENTOS EXTERNOS ---
      
      document.getElementById('btnCancel').addEventListener('click', cancelEdit);
      window.cancelEdit = cancelEdit;

      window.editSH = async (id) => {
          const item = state.horariosAsignados.find(x => x.id == id);
          if(!item) return;
          state.isEditing = true; state.currentEditId = id;
          
          document.getElementById('formTitle').textContent = "Editar Asignación";
          const btn = document.getElementById('btnSubmit');
          btn.textContent = "Actualizar";
          btn.disabled = false;
          btn.style.opacity = '1';

          document.getElementById('btnCancel').style.display = "block";
          
          document.getElementById('selCancha').disabled = true;
          
          // ✅ CORRECCIÓN: Mostrar nombre legible del caché en lugar del ID crudo
          const cachedInfo = state.allHorariosCache[item.horarioBase_id];
          const displayLabel = cachedInfo ? cachedInfo.label : `Horario Agendado`;
          
          document.getElementById('selHorarioBase').innerHTML = `<option value="${item.horarioBase_id}" selected>${displayLabel}</option>`;
          document.getElementById('selHorarioBase').disabled = true;
          
          document.getElementById('shObligatorio').checked = isTrue(item.is_obligatorio);
          
          document.getElementById('divEstado').style.display = "block";
          document.getElementById('shEstado').value = item.estado || 'activo';
      };

      window.deleteSH = async (id) => {
          if(await confirmAction("¿Desvincular este horario?")) {
              try { await api.deleteServicioHorario(id); toast.success("Eliminado"); await loadList(); } catch(e){ toast.error(e.message); }
          }
      };

      window.toggleSHStatus = async (id) => {
          try { 
              const idx = state.horariosAsignados.findIndex(x => x.id == id);
              if (idx > -1) {
                  const curr = state.horariosAsignados[idx].estado;
                  state.horariosAsignados[idx].estado = (curr === 'activo' ? 'inactivo' : 'activo');
                  toast.success("Estado Actualizado") 
                  renderListItems(); 
              }
              await api.toggleStatusServicioHorario(id);
          } catch(e){ 
              toast.error("Error al cambiar estado: " + e.message);
              loadList(); 
          }
      };
  }
};

function cancelEdit() {
    state.isEditing = false;
    state.currentEditId = null;

    const form = document.getElementById('formServicioHorario');
    if(form) form.reset();

    const check = document.getElementById('shObligatorio');
    if(check) check.checked = true;

    document.getElementById('formTitle').textContent = "Asignar Nuevo Horario";
    
    const btn = document.getElementById('btnSubmit');
    if(btn) {
        btn.textContent = "Asignar";
        btn.disabled = true; 
        btn.style.opacity = '0.5';
    }

    const btnCancel = document.getElementById('btnCancel');
    if(btnCancel) btnCancel.style.display = "none";

    const divEstado = document.getElementById('divEstado');
    if(divEstado) divEstado.style.display = "none";

    const selCancha = document.getElementById('selCancha');
    if(selCancha) {
        selCancha.disabled = false;
        selCancha.value = "";
    }

    resetHorariosSelect();
}

function resetHorariosSelect() {
    const sel = document.getElementById('selHorarioBase');
    if(sel) {
        sel.innerHTML = '<option value="">Primero selecciona cancha</option>';
        sel.disabled = true;
    }
    const btn = document.getElementById('btnSubmit');
    if(btn) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    }
    const details = document.getElementById('horarioDetails');
    if(details) details.style.display = 'none';
}

async function loadInitialData() {
    if (state.complejoId) {
        try {
            const res = await api.getCanchasPaginated(state.complejoId, 1, 100);
            const canchas = res.data || [];
            state.canchas = canchas;
            
            const selCancha = document.getElementById('selCancha');
            if (canchas.length > 0) {
                selCancha.innerHTML = '<option value="">Selecciona Cancha...</option>' + 
                    canchas.map(c => `<option value="${c.cancha_id}">${c.nombre}</option>`).join('');
            } else {
                selCancha.innerHTML = '<option value="">No hay canchas</option>';
            }
            
            for (let c of canchas) {
                 const hList = await api.getHorariosBase(c.cancha_id);
                 hList.forEach(h => {
                     state.allHorariosCache[h.horario_base_id] = {
                         label: `${c.nombre} | ${h.dia_semana} ${h.hora_inicio.substring(0,5)}-${h.hora_fin.substring(0,5)}`
                     };
                 });
            }
            await loadList();
        } catch (e) { toast.error("Error al cargar datos"); }
    }
}

async function loadHorariosBase(canchaId) {
    const selHorario = document.getElementById('selHorarioBase');
    selHorario.innerHTML = '<option>Cargando...</option>';
    selHorario.disabled = true;
    try {
        const res = await api.getHorariosBase(canchaId);
        state.horariosBaseDisponibles = res;
        if (res.length > 0) {
            selHorario.innerHTML = '<option value="">Selecciona Horario...</option>' + 
                res.map(h => {
                    const label = `${h.dia_semana} | ${h.hora_inicio.substring(0,5)} - ${h.hora_fin.substring(0,5)}`;
                    return `<option value="${h.horario_base_id}">${label}</option>`;
                }).join('');
            selHorario.disabled = false;
        } else {
            selHorario.innerHTML = '<option value="">Sin horarios</option>';
        }
    } catch (e) { selHorario.innerHTML = '<option value="">Error</option>'; }
}

async function loadList() {
    const container = document.getElementById('listContainer');
    try {
        const res = await api.getServicioHorarios(state.servicioId);
        state.horariosAsignados = res;
        document.getElementById('countBadge').textContent = res.length;
        renderListItems();
    } catch(e) { container.innerHTML = `<div style="color:red; text-align:center;">Error de carga</div>`; }
}

function renderListItems() {
    const container = document.getElementById('listContainer');
    if (state.horariosAsignados.length === 0) {
        container.innerHTML = `<div class="empty-state">No hay horarios asignados.</div>`;
        return;
    }

    container.innerHTML = state.horariosAsignados.map(item => {
        const isActive = String(item.estado).trim().toLowerCase() === 'activo' || item.estado == 1 || item.estado === true;
        
        const obligVal = item.is_obligatorio ?? item.isObligatorio ?? item.obligatorio;
        const isOblig = isTrue(obligVal); 
        
        const typeClass = isOblig ? 'obligatorio' : 'opcional';
        const statusClass = isActive ? '' : 'inactive';
        
        const cachedInfo = state.allHorariosCache[item.horarioBase_id];
        const mainLabel = cachedInfo ? cachedInfo.label : `Horario ID: ${item.horarioBase_id}`;
        
        return `
        <div class="sh-item ${typeClass} ${statusClass}">
            <div>
                <div style="font-weight:bold; color:white; font-size:0.95rem; display:flex; align-items:center;">
                    <span style="color:var(--accent); margin-right:8px;">${ICON_CLOCK}</span>
                    ${mainLabel}
                </div>
                <div class="small" style="display:flex; align-items:center; gap:5px; color:${isOblig ? '#ef4444' : '#4ade80'}; margin-top:6px; font-weight:600;">
                    ${isOblig ? ICON_ALERT + '<span>OBLIGATORIO</span>' : ICON_CHECK + '<span>OPCIONAL</span>'}
                </div>
            </div>
            
            <div style="display:flex; align-items:center; gap:10px;">
                <label class="switch" title="Activar/Desactivar">
                    <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.toggleSHStatus(${item.id})">
                    <span class="slider"></span>
                </label>
                
                <div style="display:flex; gap:5px;">
                    <button class="action-btn btn-edit" onclick="window.editSH(${item.id})">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
                    </button>
                    <button class="action-btn btn-delete" onclick="window.deleteSH(${item.id})">
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

export default adminServicioHorariosView;