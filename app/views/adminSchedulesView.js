import { navigate } from "../router.js";
import api from "../services/api.js";
import { toast } from "../utils/toast.js";
import { confirmAction } from "../utils/confirm.js";

let state = {
    canchaId: null,
    horariosBase: [],
    horariosSpecial: [],
    activeTab: 'base', // 'base' o 'special'
    selectedDay: 'Lunes', 
    isSubmitting: false,
    isEditing: false,
    currentEditId: null
};

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// --- ICONOS SVG ---
const ICON_WEEKLY = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:6px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const ICON_SPECIAL = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:6px;"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const ICON_COPY = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

// Iconos de Estado
const STATUS_ICONS = {
    disponible: `<svg width="16" height="16" style="color:#4ade80" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    bloqueado: `<svg width="16" height="16" style="color:#ef4444" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    mantenimiento: `<svg width="16" height="16" style="color:#fbbf24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
};

const adminSchedulesView = {
  render: async (params) => {
    state.canchaId = params.id;
    if (!state.canchaId) { navigate("/admin/canchas"); return ""; }

    return `
      <div class="admin-layout">
        <div class="container schedule-container">
            
            <!-- HEADER -->
            <div class="page-header-flex">
                <button class="btn-icon-back" onclick="window.history.back()">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <div>
                    <h2 style="margin:0; font-size:1.5rem;">Configurar Horarios</h2>
                    <p class="small" style="color:var(--text-muted); margin-top:4px;">Define disponibilidad y tarifas.</p>
                </div>
            </div>

            <!-- TABS -->
            <div class="tabs-container">
                <button class="tab-btn active" id="tabBase" onclick="window.switchTab('base')">
                    ${ICON_WEEKLY} Semanal
                </button>
                <button class="tab-btn" id="tabSpecial" onclick="window.switchTab('special')">
                    ${ICON_SPECIAL} Fechas Especiales
                </button>
            </div>

            <div class="grid-responsive">
                
                <!-- COLUMNA IZQUIERDA: FORMULARIO -->
                <div class="card form-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid var(--glass); padding-bottom:10px;">
                        <h3 id="formTitle" style="margin:0;">Nuevo Horario</h3>
                        <button id="btnCancelEdit" type="button" style="display:none; background:none; border:none; color:#ef4444; font-size:0.8rem; cursor:pointer; text-decoration:underline;">Cancelar Edición</button>
                    </div>
                    
                    <form id="formHorario">
                        <!-- CONTENIDO DINÁMICO (Días o Fecha) -->
                        <div id="formContent"></div>

                        <div class="time-grid">
                            <div class="field"><label class="small">Inicio</label><input type="time" id="hInicio" class="input" required value="08:00"></div>
                            <div class="field"><label class="small">Fin</label><input type="time" id="hFin" class="input" required value="22:00"></div>
                        </div>

                        <!-- Campos Especiales -->
                        <div id="specialFields" style="display:none;">
                            <div class="field">
                                <label class="small">Estado Horario</label>
                                <select id="hEstadoHorario" class="select" onchange="window.togglePriceField()">
                                    <option value="disponible">Disponible (Oferta)</option>
                                    <option value="bloqueado">Bloqueado</option>
                                    <option value="mantenimiento">Mantenimiento</option>
                                </select>
                            </div>
                            <div class="field">
                                <label class="small">Descripción</label>
                                <input type="text" id="hDesc" class="input" placeholder="Ej. Feriado, Torneo...">
                            </div>
                        </div>

                        <div class="field" id="priceContainer">
                            <label class="small">Precio por Hora (S/.)</label>
                            <div class="input-group">
                                <span class="input-prefix">S/.</span>
                                <input type="number" id="hPrecio" class="input" placeholder="0.00" min="0" step="0.01" required>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary" id="btnSaveSchedule" style="width:100%; margin-top:15px;">
                            + Agregar
                        </button>
                    </form>
                </div>

                <!-- COLUMNA DERECHA: LISTA -->
                <div class="card list-card">
                    <div class="list-header">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <h3 id="listTitle" style="color:var(--accent); margin:0;">Horarios</h3>
                            <span class="badge-count" id="countBadge">0</span>
                        </div>
                        
                        <!-- BOTÓN CLONAR (Solo visible en Semanal) -->
                        <button id="btnCloneOpen" class="btn-sm-secondary" onclick="window.openCloneModal()" style="display:none;">
                            ${ICON_COPY} Clonar Día
                        </button>
                    </div>
                    <div id="scheduleList" class="schedule-list"><div class="empty-state">Cargando...</div></div>
                </div>
            </div>
        </div>

        <!-- MODAL CLONAR -->
        <div id="cloneModal" class="modal" style="display:none;">
            <div class="modal-overlay" onclick="document.getElementById('cloneModal').style.display='none'"></div>
            <div class="modal-content card" style="max-width:400px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <h3>Clonar Horarios</h3>
                    <button class="modal-close" onclick="document.getElementById('cloneModal').style.display='none'">&times;</button>
                </div>
                <p class="small" style="color:var(--text-muted); margin-bottom:20px;">
                    Copia todos los horarios de <strong id="cloneFromName" style="color:white;"></strong> a otro día.
                </p>
                <form id="formClone">
                    <div class="field">
                        <label class="small">Día Destino</label>
                        <select id="cloneDestino" class="select" required></select>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%;">Confirmar Copia</button>
                </form>
            </div>
        </div>

      </div>
      
      <style>
        .schedule-container { padding-top: 20px; max-width: 1100px; }
        .grid-responsive { display: grid; grid-template-columns: 340px 1fr; gap: 25px; align-items: start; }
        @media (max-width: 768px) { .grid-responsive { grid-template-columns: 1fr; } .form-card { order: 1; } .list-card { order: 2; } }

        .tabs-container { display: flex; gap: 20px; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .tab-btn { background: transparent; border: none; color: var(--text-muted); padding: 12px 5px; cursor: pointer; font-size: 1rem; border-bottom: 3px solid transparent; transition: all 0.3s; display: flex; align-items: center; }
        .tab-btn:hover { color: white; }
        .tab-btn.active { color: white; border-bottom: 3px solid #4ade80; font-weight: bold; }

        .btn-icon-back { background: rgba(255,255,255,0.1); border: none; color: white; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .btn-icon-back:hover { background: rgba(255,255,255,0.2); }

        .day-selector { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 15px; }
        .btn-day { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); padding: 8px 0; border-radius: 6px; cursor: pointer; font-size: 0.75rem; transition: 0.2s; }
        .btn-day.active { background: var(--primary); color: #0f172a; font-weight: bold; border-color: var(--primary); }

        .time-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .input-group { position: relative; }
        .input-prefix { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-weight: bold; font-size: 0.9rem; }
        #hPrecio { padding-left: 35px; }

        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--glass); }
        .badge-count { background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: bold; }
        
        .btn-sm-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); padding: 5px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.85rem; transition:0.2s; }
        .btn-sm-secondary:hover { background: rgba(255,255,255,0.1); color: white; }

        .schedule-list { display: flex; flex-direction: column; gap: 10px; max-height: 600px; overflow-y: auto; }
        .schedule-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
        .schedule-item:hover { background: rgba(255,255,255,0.05); transform: translateX(2px); }
        .schedule-item.inactive { opacity: 0.6; }
        
        .schedule-item.type-bloqueado { border-left: 3px solid #ef4444; }
        .schedule-item.type-disponible { border-left: 3px solid #4ade80; }
        .schedule-item.type-mantenimiento { border-left: 3px solid #fbbf24; }

        .time-range { font-size: 1.1rem; font-weight: 700; color: white; letter-spacing: 0.5px; }
        .price-tag { color: #4ade80; font-weight: bold; font-size: 1rem; text-align: right; }

        .item-actions { display: flex; gap: 8px; margin-top: 4px; justify-content: flex-end; align-items: center; }
        .action-btn-icon { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(255,255,255,0.05); color: var(--text-muted); transition: 0.2s; }
        .action-btn-icon:hover { background: rgba(255,255,255,0.1); color: white; }
        .btn-edit-icon { color: #fbbf24; }
        .btn-delete-icon { color: #ef4444; }

        .switch { position: relative; display: inline-block; width: 36px; height: 20px; margin-right: 10px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .4s; border-radius: 20px; }
        .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #4ade80; }
        input:checked + .slider:before { transform: translateX(16px); }
        
        .empty-state { text-align: center; padding: 40px; color: var(--text-muted); border: 2px dashed rgba(255,255,255,0.1); border-radius: 10px; }
      </style>
    `;
  },

  attachEventListeners: async () => {
    
    // --- 1. DEFINIR FUNCIONES GLOBALES ---

    // Cambio de Pestaña
    window.switchTab = (tab) => {
        state.activeTab = tab;
        cancelEdit(); // Resetear formulario al cambiar de contexto
        renderUI();
    };

    // Selección de Día
    window.selectDay = (day) => {
        state.selectedDay = day;
        const el = document.getElementById('hDia');
        if(el) el.value = day;
        cancelEdit(); // Resetear formulario al cambiar de día
        renderUI();
    };

    // Lógica Precio
    window.togglePriceField = () => {
        const el = document.getElementById('hEstadoHorario');
        if(!el) return;
        const type = el.value;
        const priceCont = document.getElementById('priceContainer');
        const priceInp = document.getElementById('hPrecio');
        
        if(type === 'bloqueado' || type === 'mantenimiento') {
            priceCont.style.display = 'none';
            priceInp.value = 0;
            priceInp.required = false;
        } else {
            priceCont.style.display = 'block';
            priceInp.required = true;
        }
    };

    // Lógica Clonación
    window.openCloneModal = () => {
        document.getElementById('cloneFromName').textContent = state.selectedDay;
        const sel = document.getElementById('cloneDestino');
        sel.innerHTML = diasSemana
            .filter(d => d !== state.selectedDay)
            .map(d => `<option value="${d}">${d}</option>`)
            .join('');
        document.getElementById('cloneModal').style.display = 'flex';
    };

    // Lógica Cancelar Edición (RESET COMPLETO)
    window.cancelEdit = () => {
        state.isEditing = false; 
        state.currentEditId = null;
        
        const form = document.getElementById('formHorario');
        if(form) form.reset();
        
        // Restaurar valores por defecto según tab
        if(state.activeTab === 'special') {
            const fDate = document.getElementById('hFecha');
            if(fDate) fDate.value = new Date().toISOString().split('T')[0];
            window.togglePriceField();
        } else {
            const fDia = document.getElementById('hDia');
            if(fDia) fDia.value = state.selectedDay;
        }

        // Resetear visuales del botón
        document.getElementById('formTitle').textContent = "Nuevo Horario";
        const btn = document.getElementById('btnSaveSchedule');
        if(btn) {
            btn.textContent = "+ Agregar";
            btn.style.background = "var(--primary)";
            btn.style.color = "white";
            btn.disabled = false;
        }
        
        const cancelBtn = document.getElementById('btnCancelEdit');
        if(cancelBtn) cancelBtn.style.display = 'none';
    };

    // Lógica Editar Item
    window.editItem = (id) => {
        state.isEditing = true; state.currentEditId = id;
        const list = state.activeTab === 'base' ? state.horariosBase : state.horariosSpecial;
        const key = state.activeTab === 'base' ? 'horario_base_id' : 'horario_especial_id';
        const item = list.find(x => x[key] == id);
        if(!item) return;

        document.getElementById('hInicio').value = item.hora_inicio.substring(0,5);
        document.getElementById('hFin').value = item.hora_fin.substring(0,5);

        if (state.activeTab === 'base') {
            state.selectedDay = item.dia_semana;
            document.getElementById('hPrecio').value = parseFloat(item.monto);
        } else {
            const fDate = document.getElementById('hFecha');
            if(fDate) fDate.value = item.fecha;
            
            document.getElementById('hEstadoHorario').value = item.estado_horario;
            document.getElementById('hDesc').value = item.descripcion || '';
            
            if(item.estado_horario === 'disponible') {
                document.getElementById('hPrecio').value = parseFloat(item.monto);
            } else {
                document.getElementById('hPrecio').value = 0;
            }
            window.togglePriceField();
        }
        
        // Actualizamos visuales a Modo Edición
        document.getElementById('formTitle').textContent = "Editando Horario";
        const btn = document.getElementById('btnSaveSchedule');
        btn.textContent = "Actualizar";
        btn.style.background = "#fbbf24";
        btn.style.color = "black";
        document.getElementById('btnCancelEdit').style.display = 'block';
    };

    // Lógica Eliminar
    window.deleteItem = async (id) => {
        const confirmed = await confirmAction("¿Eliminar?");
        if(!confirmed) return;
        try {
            if(state.activeTab === 'base') await api.deleteHorarioBase(id);
            else await api.deleteHorarioSpecial(id);
            toast.success("Eliminado correctamente");
            await loadAllData(); renderUI();
        } catch(e){toast.error(e.message);}
    };

    // Lógica Toggle Status
    window.toggleItemStatus = async (id) => {
        try {
            const list = state.activeTab === 'base' ? state.horariosBase : state.horariosSpecial;
            const key = state.activeTab === 'base' ? 'horario_base_id' : 'horario_especial_id';
            const itemIndex = list.findIndex(x => x[key] == id);
            
            if (itemIndex > -1) {
                // Actualización optimista
                const current = list[itemIndex].estado;
                list[itemIndex].estado = (current === 'activo' ? 'inactivo' : 'activo');
                renderUI();
            }

            if(state.activeTab === 'base') await api.toggleStatusBase(id);
            else await api.toggleStatusSpecial(id);
        } catch(e){ 
            toast.error(e.message);
            await loadAllData(); renderUI(); // Revertir en caso de error
        }
    };

    // --- 2. LISTENERS DOM ---

    document.getElementById('btnCancelEdit').addEventListener('click', window.cancelEdit);

    document.getElementById('formClone').addEventListener('submit', async (e) => {
        e.preventDefault();
        const toDay = document.getElementById('cloneDestino').value;
        try {
            // ✅ Llamada corregida a cloneHorarioBase
            await api.cloneHorarioBase(state.canchaId, state.selectedDay, toDay);
            toast.success(`Horarios copiados a ${toDay}`);
            document.getElementById('cloneModal').style.display = 'none';
            await loadAllData(); 
        } catch(e) {
            toast.error(e.message || "Error al clonar");
        }
    });

    const form = document.getElementById('formHorario');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if(state.isSubmitting) return;
        state.isSubmitting = true;
        
        const btn = document.getElementById('btnSaveSchedule');
        const originalText = btn.textContent;
        btn.textContent = "Guardando..."; 
        btn.disabled = true;

        try {
            if (state.activeTab === 'base') {
                const data = {
                    cancha_id: state.canchaId,
                    dia_semana: state.selectedDay,
                    hora_inicio: document.getElementById('hInicio').value,
                    hora_fin: document.getElementById('hFin').value,
                    monto: document.getElementById('hPrecio').value,
                    estado: 'activo'
                };
                if (state.isEditing) await api.updateHorarioBase(state.currentEditId, data);
                else await api.createHorarioBase(data);
            } else {
                const estadoHorario = document.getElementById('hEstadoHorario').value;
                const data = {
                    cancha_id: state.canchaId,
                    fecha: document.getElementById('hFecha').value,
                    hora_inicio: document.getElementById('hInicio').value,
                    hora_fin: document.getElementById('hFin').value,
                    monto: estadoHorario === 'disponible' ? document.getElementById('hPrecio').value : 0,
                    estado_horario: estadoHorario,
                    descripcion: document.getElementById('hDesc').value,
                    estado: 'activo'
                };
                if (state.isEditing) await api.updateHorarioSpecial(state.currentEditId, data);
                else await api.createHorarioSpecial(data);
            }
            
            // ✅ RESETEAR SIEMPRE AL FINALIZAR
            window.cancelEdit();
            
            await loadAllData();
            renderUI();
            toast.success(state.isEditing ? "Actualizado correctamente" : "Creado correctamente");

        } catch (err) { 
            toast.error(err.message || "Error al guardar");
            // Si hubo error, revertimos el botón pero mantenemos el estado de edición para que el usuario reintente
            btn.textContent = originalText;
            btn.disabled = false;
        } finally { 
            state.isSubmitting = false; 
        }
    });

    // Carga Inicial
    await loadAllData();
    renderUI();
  }
};

// --- HELPERS ---
async function loadAllData() {
    try {
        const [base, special] = await Promise.all([
            api.getHorariosBase(state.canchaId).catch(()=>[]),
            api.getHorariosSpecial(state.canchaId).catch(()=>[])
        ]);
        state.horariosBase = base || [];
        state.horariosSpecial = special || [];
    } catch (e) { console.error(e); }
}

function renderUI() {
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.getElementById(state.activeTab === 'base' ? 'tabBase' : 'tabSpecial').classList.add('active');

    const formContent = document.getElementById('formContent');
    const btnClone = document.getElementById('btnCloneOpen');

    if (state.activeTab === 'base') {
        document.getElementById('specialFields').style.display = 'none';
        document.getElementById('priceContainer').style.display = 'block';
        if(btnClone) btnClone.style.display = 'flex';

        formContent.innerHTML = `
            <div class="field">
                <label class="small">Día de la Semana</label>
                <div class="day-selector">
                    ${diasSemana.map(d => `
                        <button type="button" class="btn-day ${d === state.selectedDay ? 'active' : ''}" onclick="window.selectDay('${d}')">${d.substring(0,3)}</button>
                    `).join('')}
                </div>
                <input type="hidden" id="hDia" value="${state.selectedDay}">
            </div>
        `;
    } else {
        document.getElementById('specialFields').style.display = 'block';
        if(btnClone) btnClone.style.display = 'none';

        if (!document.getElementById('hFecha')) {
            const today = new Date().toISOString().split('T')[0];
            formContent.innerHTML = `
                <div class="field">
                    <label class="small">Fecha Específica</label>
                    <input type="date" id="hFecha" class="input" required value="${today}">
                </div>
            `;
        }
    }

    const listContainer = document.getElementById('scheduleList');
    let list = [];
    let title = "";

    if (state.activeTab === 'base') {
        title = `Horarios del ${state.selectedDay}`;
        list = state.horariosBase.filter(h => h.dia_semana === state.selectedDay);
        list.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    } else {
        title = "Fechas Especiales";
        list = state.horariosSpecial;
        list.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }

    document.getElementById('listTitle').textContent = title;
    document.getElementById('countBadge').textContent = list.length;

    if (list.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">Sin datos registrados.</div>`;
        return;
    }

    listContainer.innerHTML = list.map(item => {
        const id = state.activeTab === 'base' ? item.horario_base_id : item.horario_especial_id;
        const isActive = item.estado === 'activo';
        const statusClass = isActive ? '' : 'inactive';
        
        let infoMain = "", infoSubHtml = "", typeClass = "";
        let showPrice = true; 
        
        if (state.activeTab === 'base') {
            infoMain = `${item.hora_inicio.substring(0,5)} - ${item.hora_fin.substring(0,5)}`;
            // Usamos iconos de estado para disponibilidad base también
            infoSubHtml = isActive 
                ? `<span style="display:flex; align-items:center; gap:4px; color:#4ade80;">${STATUS_ICONS.disponible} Disponible</span>` 
                : `<span style="color:#64748b;">Inactivo</span>`;
        } else {
            const d = new Date(item.fecha + 'T00:00:00');
            const dateStr = d.toLocaleDateString('es-PE', { day:'2-digit', month:'short' });
            infoMain = `${dateStr} | ${item.hora_inicio.substring(0,5)} - ${item.hora_fin.substring(0,5)}`;
            typeClass = `type-${item.estado_horario}`;
            
            if(item.estado_horario === 'bloqueado') {
                infoSubHtml = `<span style="display:flex; align-items:center; gap:4px; color:#ef4444;">${STATUS_ICONS.bloqueado} Bloqueado</span>`;
                showPrice = false;
            }
            else if(item.estado_horario === 'mantenimiento') {
                infoSubHtml = `<span style="display:flex; align-items:center; gap:4px; color:#fbbf24;">${STATUS_ICONS.mantenimiento} Mantenimiento</span>`;
                showPrice = false;
            }
            else {
                infoSubHtml = `<span style="display:flex; align-items:center; gap:4px; color:#4ade80;">${STATUS_ICONS.disponible} Disponible</span>`;
            }
            
            if(item.descripcion) infoSubHtml += ` <span style="color:var(--text-muted); margin-left:5px;">• ${item.descripcion}</span>`;
        }

        const montoHtml = showPrice 
            ? `<div class="price-tag">S/. ${parseFloat(item.monto || 0).toFixed(2)}</div>` 
            : '';

        return `
        <div class="schedule-item ${statusClass} ${typeClass}">
            <div style="display:flex; align-items:center;">
                <label class="switch" title="Activar/Desactivar">
                    <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.toggleItemStatus(${id})">
                    <span class="slider"></span>
                </label>
                <div style="margin-left:5px;">
                    <div class="time-range">${infoMain}</div>
                    <div class="small" style="font-size:0.8rem; margin-top:2px;">${infoSubHtml}</div>
                </div>
            </div>
            <div style="text-align:right;">
                ${montoHtml}
                <div class="item-actions">
                    <button class="action-btn-icon btn-edit-icon" onclick="window.editItem(${id})" title="Editar">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
                    </button>
                    <button class="action-btn-icon btn-delete-icon" onclick="window.deleteItem(${id})" title="Eliminar">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

export default adminSchedulesView;