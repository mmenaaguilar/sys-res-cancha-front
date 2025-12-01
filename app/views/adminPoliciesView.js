import { navigate } from "../router.js";
import api from "../services/api.js";
import { AdminSidebar } from "../components/AdminSidebar.js";
import { toast } from "../utils/toast.js";
import { confirmAction } from "../utils/confirm.js";

let state = {
    complejos: [], // Se almacena la lista de complejos donde el usuario es admin/gestor con su rol
    selectedComplejoId: null,
    politicas: [],
    isEditing: false,
    currentEditId: null,
    isSubmitting: false
};

// --- ICONOS SVG PROFESIONALES (Se añade el ícono de candado para el estado restringido) ---
const ICON_CREDIT = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`;
const ICON_CASH = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
const ICON_LOCK = `<svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`; // Icono de candado con el estilo grande (40x40)

const ESTRATEGIAS = {
    'CreditoCompleto': { label: 'Crédito / Saldo a Favor', icon: ICON_CREDIT, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    'ReembolsoFisico': { label: 'Devolución de Dinero', icon: ICON_CASH, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
};

// HELPER: Normaliza valores booleanos/activos
function checkBool(val) {
    if (val === null || val === undefined) return false;
    const s = String(val).toLowerCase().trim();
    return s === '1' || s === 'true' || s === 'activo' || s === 'on' || s === 'yes';
}

/**
 * Verifica si el usuario actual tiene el rol de 'admin' para el complejo seleccionado.
 * Las políticas solo pueden ser gestionadas por usuarios con el rol 'admin'.
 */
function checkAdminForSelectedComplejo() {
    if (!state.selectedComplejoId) return false;
    const complejo = state.complejos.find(c => c.complejo_id == state.selectedComplejoId);
    // Verificación estricta: Solo permite continuar si el rol es 'admin' para esta sede.
    return complejo && complejo.user_role === 'admin';
}

const adminPoliciesView = {
    render: async () => {
        if (!api.isLoggedIn()) { navigate("/"); return ""; }
        const user = api.getUser();

        return `
            <style>
                /* Estilos unificados de restricted-state */
                .restricted-state { text-align: center; padding: 60px 20px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.02); margin-top: 20px; }
                .restricted-icon { color: #64748b; margin-bottom: 15px; opacity: 0.7; }
                .restricted-title { font-size: 1.2rem; color: white; margin-bottom: 8px; font-weight: 600; }
                .restricted-desc { color: #94a3b8; font-size: 0.95rem; max-width: 400px; margin: 0 auto; }
                /* Otros estilos */
                .badge-strategy { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 500; letter-spacing: 0.3px; }
                .select-pro { appearance: none; background-color: #1e293b; color: #e2e8f0; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 8px 12px; width: 100%; outline: none; }
                
                .switch { position: relative; display: inline-block; width: 34px; height: 18px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #475569; transition: .3s; border-radius: 20px; }
                .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
                input:checked + .slider { background-color: #10b981; }
                input:checked + .slider:before { transform: translateX(16px); }

                .action-btn { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.05); color:#ccc; }
                .btn-edit { color: #fbbf24; } .btn-edit:hover { background: rgba(251,191,36,0.15); }
                .btn-delete { color: #ef4444; } .btn-delete:hover { background: rgba(239,68,68,0.15); }
                
                .input-group { position: relative; }
            </style>

            <div class="admin-layout">
                ${AdminSidebar.render('politicas', user)}
                
                <main class="admin-content">
                    <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px;">
                        <div>
                            <h2>Políticas de Cancelación</h2>
                            <p>Define reglas de reembolso según el tiempo de aviso.</p>
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
                        <div style="flex:1;"></div>
                        <button class="btn" id="btnNewPolicy" disabled style="opacity:0.5;" title="Selecciona una sede para crear políticas">
                            + Nueva Regla
                        </button>
                    </div>

                    <div id="policiesContainer">
                        <div class="datagrid-container">
                            <table class="datagrid">
                                <thead>
                                    <tr>
                                        <th style="width: 150px;">Anticipación</th>
                                        <th>Método de Reembolso</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th style="text-align:right;">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tablePolicies">
                                    <tr><td colspan="5" style="text-align:center; padding:40px; color:var(--muted);">Cargando...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                <div id="policyModal" class="modal" style="display:none;">
                    <div class="modal-overlay" id="modalOverlay"></div>
                    <div class="modal-content card" style="max-width:500px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                            <h3 id="modalTitle">Nueva Regla</h3>
                            <button class="modal-close" id="modalClose">&times;</button>
                        </div>
                        
                        <form id="formPolicy">
                            <div class="field">
                                <label>Horas de Anticipación (Límite)</label>
                                <div class="input-group">
                                    <input type="number" id="pHoras" class="input" required min="0" placeholder="Ej. 24" style="padding-right:60px;">
                                    <span style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:0.85rem;">Horas</span>
                                </div>
                                <small style="color:var(--text-muted); margin-top:5px; display:block;">
                                    Si el cliente cancela <strong>antes</strong> de este tiempo, se aplica la regla.
                                </small>
                            </div>

                            <div class="field">
                                <label>Tipo de Reembolso</label>
                                <select id="pEstrategia" class="select" required>
                                    <option value="CreditoCompleto">Saldo a favor (Billetera Virtual)</option>
                                    <option value="ReembolsoFisico">Devolución de Dinero (Efectivo/Yape)</option>
                                </select>
                            </div>

                            <button type="submit" class="btn" id="btnSubmit" style="width:100%; margin-top:10px;">Guardar</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    attachEventListeners: async () => {
        AdminSidebar.attachListeners();

        // Cargar Sedes
        try {
            let complejos = await api.getMyComplejos();
            
            // *** AJUSTE CRÍTICO: SIMULACIÓN DE ROL para la verificación estricta ***
            // En una aplicación real, el API debería devolver el rol del usuario para cada complejo.
            // Aquí simulamos que solo es 'admin' en la primera sede, y 'gestor' en las demás.
            complejos = complejos.map((c, index) => ({
                ...c,
                user_role: (index === 0 || complejos.length === 1) ? 'admin' : 'gestor' 
            }));

            state.complejos = complejos; // ¡Guardamos la lista de complejos autorizados con rol!
            const sel = document.getElementById('selectComplejo');
            
            if(complejos.length > 0) {
                sel.innerHTML = '<option value="">Selecciona Sede...</option>' + complejos.map(c => `<option value="${c.complejo_id}">${c.nombre} (${c.user_role})</option>`).join('');
                
                const lastId = localStorage.getItem('admin_last_complejo_id');
                // Buscamos el complejo guardado o usamos el primero
                const defaultComplex = complejos.find(c => c.complejo_id == lastId) || complejos[0];
                const defaultId = defaultComplex ? defaultComplex.complejo_id : null;
                
                if(defaultId) {
                    sel.value = defaultId;
                    state.selectedComplejoId = defaultId; // Set state
                    
                    if (checkAdminForSelectedComplejo()) {
                        enableUI(true);
                        loadPoliticas();
                    } else {
                        // Si no es 'admin' para el ID por defecto, deshabilita y muestra el estado restringido
                        disableUI(defaultComplex.user_role); // Pasamos el rol para un mensaje más específico
                    }
                }
            } else { 
                sel.innerHTML = '<option>Sin sedes</option>'; 
                disableUI(null, "No tienes sedes asignadas."); // Mensaje actualizado
            }
        } catch(e){
            console.error("Error cargando complejos:", e);
            document.getElementById('selectComplejo').innerHTML = '<option>Error al cargar</option>';
            disableUI(null, "Error de conexión al cargar las sedes.");
        }

        // Listener de cambio de Sede
        document.getElementById('selectComplejo').addEventListener('change', (e) => {
            const newId = e.target.value;
            state.selectedComplejoId = newId; // Actualizar el ID seleccionado en el estado
            
            // Se comprueba la autorización estricta en cada cambio
            if(newId && checkAdminForSelectedComplejo()) {
                localStorage.setItem('admin_last_complejo_id', state.selectedComplejoId);
                enableUI(true);
                loadPoliticas();
            } else {
                const complejo = state.complejos.find(c => c.complejo_id == newId);
                const role = complejo ? complejo.user_role : null;
                // Si no está seleccionado O no está autorizado como 'admin'
                if (newId) {
                     disableUI(role);
                } else {
                     disableUI(null, "Selecciona una sede.");
                }
            }
        });

        // Modal Logic
        const modal = document.getElementById('policyModal');
        const closeModal = () => { modal.style.display = 'none'; state.isEditing = false; };
        document.getElementById('modalClose').addEventListener('click', closeModal);
        document.getElementById('modalOverlay').addEventListener('click', closeModal);

        document.getElementById('btnNewPolicy').addEventListener('click', () => {
            // *** SECURITY GUARD CRÍTICO: CREAR (Reforzado) ***
            if (!checkAdminForSelectedComplejo()) {
                toast.error("Error de autorización. Solo el rol 'admin' puede crear políticas.");
                return;
            }
            state.isEditing = false;
            document.getElementById('modalTitle').textContent = "Nueva Regla";
            document.getElementById('btnSubmit').textContent = "Guardar";
            document.getElementById('formPolicy').reset();
            modal.style.display = 'flex';
        });

        // Guardar/Actualizar
        document.getElementById('formPolicy').addEventListener('submit', async (e) => {
            e.preventDefault();

            // *** SECURITY GUARD CRÍTICO: GUARDAR/ACTUALIZAR (Reforzado) ***
            if (!checkAdminForSelectedComplejo()) {
                toast.error("Error de autorización. Solo el rol 'admin' puede guardar/actualizar políticas.");
                return;
            }

            if(state.isSubmitting) return; state.isSubmitting = true;
            const btn = document.getElementById('btnSubmit'); const txt = btn.textContent; btn.textContent = "Guardando..."; btn.disabled = true;

            let finalEstado = 'activo';
            if(state.isEditing && state.currentEditId) {
                const p = state.politicas.find(x => (x.politica_id == state.currentEditId || x.id == state.currentEditId));
                if(p) finalEstado = p.estado;
            }

            const data = {
                complejo_id: state.selectedComplejoId,
                horas_limite: document.getElementById('pHoras').value,
                estrategia_temprana: document.getElementById('pEstrategia').value,
                estado: finalEstado 
            };

            try {
                if(state.isEditing) {
                    await api.updatePolitica(state.currentEditId, data);
                    toast.success("Política actualizada");
                } else {
                    await api.createPolitica(data);
                    toast.success("Política creada");
                }
                closeModal(); 
                loadPoliticas();
            } catch(err) { toast.error(err.message); }
            finally { state.isSubmitting = false; btn.textContent = txt; btn.disabled = false; }
        });

        // Funciones globales para onclick
        window.editPolicy = (id) => {
             // *** SECURITY GUARD CRÍTICO: EDITAR (Reforzado) ***
            if (!checkAdminForSelectedComplejo()) {
                toast.error("Error de autorización. Solo el rol 'admin' puede editar políticas.");
                return;
            }
            const p = state.politicas.find(x => (x.politica_id == id || x.id == id));
            if(!p) return;
            state.isEditing = true; state.currentEditId = id;
            document.getElementById('modalTitle').textContent = "Editar Regla";
            document.getElementById('btnSubmit').textContent = "Actualizar";
            document.getElementById('pHoras').value = p.horas_limite;
            document.getElementById('pEstrategia').value = p.estrategia_temprana;
            modal.style.display = 'flex';
        };

        window.deletePolicy = async (id) => {
             // *** SECURITY GUARD CRÍTICO: ELIMINAR (Reforzado) ***
            if (!checkAdminForSelectedComplejo()) {
                toast.error("Error de autorización. Solo el rol 'admin' puede eliminar políticas.");
                return;
            }
            if(await confirmAction("¿Eliminar esta regla?")) {
                try { await api.deletePolitica(id); toast.success("Eliminada"); loadPoliticas(); } catch(e){ toast.error(e.message); }
            }
        };

        window.togglePolicyStatus = async (id) => {
             // *** SECURITY GUARD CRÍTICO: CAMBIAR ESTADO (Reforzado) ***
            if (!checkAdminForSelectedComplejo()) {
                toast.error("Error de autorización. Solo el rol 'admin' puede cambiar el estado de las políticas.");
                return;
            }
            try {
                // Optimistic UI
                const idx = state.politicas.findIndex(p => (p.politica_id == id || p.id == id));
                if(idx > -1) {
                    const current = state.politicas[idx].estado;
                    const isActive = checkBool(current);
                    state.politicas[idx].estado = isActive ? 'inactivo' : 'activo';
                    renderTable();
                }
                await api.toggleStatusPolitica(id);
            } catch(e){ 
                toast.error("Error al cambiar estado");
                loadPoliticas(); // Revertir
            }
        };
    }
};

function enableUI(isAuthorized = true) {
    const btn = document.getElementById('btnNewPolicy');
    const container = document.getElementById('policiesContainer');
    
    // Restaurar contenedor si estaba el estado restringido
    if (container.querySelector('.restricted-state')) {
         container.innerHTML = `<div class="datagrid-container">
            <table class="datagrid">
                <thead>
                    <tr>
                        <th style="width: 150px;">Anticipación</th>
                        <th>Método de Reembolso</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th style="text-align:right;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="tablePolicies">
                    <tr><td colspan="5" style="text-align:center; padding:40px; color:var(--muted);">Cargando...</td></tr>
                </tbody>
            </table>
        </div>`;
    }

    btn.disabled = !isAuthorized;
    btn.style.opacity = isAuthorized ? "1" : "0.5";
    btn.style.cursor = isAuthorized ? "pointer" : "not-allowed";
    btn.title = isAuthorized ? "+ Nueva Regla" : "Error de autorización. Solo el rol 'admin' puede crear políticas.";
}

/**
 * Deshabilita la UI y muestra el mensaje de restricción.
 * @param {string | null} role El rol actual del usuario en la sede (si seleccionó una).
 * @param {string} defaultMessage Mensaje a mostrar si no hay sede seleccionada o hay error de carga.
 */
function disableUI(role, defaultMessage = "Selecciona una sede.") {
    // Limpiar el estado de datos y selección
    state.politicas = []; 
    
    const btn = document.getElementById('btnNewPolicy');
    const container = document.getElementById('policiesContainer');
    
    let restrictedTitle = "Permiso Insuficiente";
    let restrictedDesc = `Tu rol de <strong>${role}</strong> en esta sede no te permite modificar políticas.`;
    
    if (!role) {
        restrictedTitle = "Selección Requerida";
        restrictedDesc = defaultMessage;
    }

    btn.disabled = true;
    btn.style.opacity = "0.5";
    btn.style.cursor = "not-allowed";
    btn.title = role ? `Solo tienes rol '${role}'. Se requiere 'admin'.` : defaultMessage;
    
    // Renderizar el estado restringido
    container.innerHTML = `
        <div class="restricted-state">
            <div class="restricted-icon">${ICON_LOCK}</div>
            <div class="restricted-title">${restrictedTitle}</div>
            <div class="restricted-desc">
                ${restrictedDesc}
            </div>
        </div>
    `;
}

async function loadPoliticas() {
    if(!state.selectedComplejoId || !checkAdminForSelectedComplejo()) { 
        // Si por alguna razón se llama sin autorización, deshabilitamos la UI y abortamos.
        // Se llama a disableUI con el rol 'admin' para forzar el mensaje de restricción
        disableUI('Gestor', "Acceso no autorizado. Solo el rol 'admin' puede ver políticas aquí.");
        return;
    }
    const tbody = document.getElementById('tablePolicies');
    
    try {
        // Mostrar "Cargando..."
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--muted);">Cargando políticas...</td></tr>`;

        const res = await api.getPoliticas(state.selectedComplejoId);
        state.politicas = res;
        renderTable();
    } catch(e) { 
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="5" style="color:#ef4444; text-align:center; padding:20px;">Error al cargar datos.</td></tr>`; 
    }
}

function renderTable() {
    const tbody = document.getElementById('tablePolicies');
    if(state.politicas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--muted); border:2px dashed rgba(255,255,255,0.05); border-radius:10px;">
            <div style="font-size:2rem; margin-bottom:10px;">📜</div>
            No hay reglas definidas para esta sede.<br>Crea una nueva regla para gestionar cancelaciones.
        </td></tr>`;
        return;
    }

    tbody.innerHTML = state.politicas.map(p => {
        const isActive = checkBool(p.estado);
        const safeId = p.politica_id || p.id;
        
        const stratKey = p.estrategia_temprana;
        const strat = ESTRATEGIAS[stratKey] || { label: stratKey, icon: '❓', color: '#ccc', bg: 'rgba(255,255,255,0.1)' };
        
        return `
        <tr style="opacity:${isActive ? 1 : 0.6}; transition: opacity 0.2s;">
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="background:rgba(255,255,255,0.1); padding:5px 10px; border-radius:6px; font-weight:bold; color:white;">
                        ${p.horas_limite}h
                    </div>
                    <span style="color:var(--text-muted); font-size:0.8rem;">Anticipación</span>
                </div>
            </td>
            <td>
                <span class="badge-strategy" style="background:${strat.bg}; color:${strat.color}; border:1px solid ${strat.color}30;">
                    ${strat.icon} ${strat.label}
                </span>
            </td>
            <td style="color:var(--text-muted); font-size:0.9rem;">
                Si el usuario cancela con <strong>más de ${p.horas_limite} horas</strong> de anticipación.
            </td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <label class="switch">
                        <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.togglePolicyStatus(${safeId})">
                        <span class="slider"></span>
                    </label>
                </div>
            </td>
            <td style="text-align:right;">
                <div style="display:flex; gap:5px; justify-content:flex-end;">
                    <button class="action-btn btn-edit" onclick="window.editPolicy(${safeId})" title="Editar">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
                    </button>
                    <button class="action-btn btn-delete" onclick="window.deletePolicy(${safeId})" title="Eliminar">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

export default adminPoliciesView;