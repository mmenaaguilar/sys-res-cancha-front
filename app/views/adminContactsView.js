import { navigate } from "../router.js";
import api from "../services/api.js";
import { AdminSidebar } from "../components/AdminSidebar.js";
import { toast } from "../utils/toast.js";
import { confirmAction } from "../utils/confirm.js";

let state = { complejos: [], selectedComplejoId: null, contactos: [], isEditing: false, currentEditId: null, isSubmitting: false };

// ICONOS SVG
const CONTACT_ICONS = {
    'telefono': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    'celular': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    'whatsapp': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    'email': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    'facebook': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    'instagram': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
    'web': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    'otro': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`
};

const CONTACT_OPTIONS = [
    {val: 'Telefono', label: 'Teléfono'}, {val: 'Celular', label: 'Celular'}, 
    {val: 'WhatsApp', label: 'WhatsApp'}, {val: 'Email', label: 'Email'}, 
    {val: 'Facebook', label: 'Facebook'}, {val: 'Instagram', label: 'Instagram'}, 
    {val: 'Web', label: 'Web'}, {val: 'Otro', label: 'Otro (Especificar)'}
];

const adminContactsView = {
  render: async () => {
    if (!api.isLoggedIn()) { navigate("/"); return ""; }
    if (!api.isStaff()) { alert("Acceso denegado."); navigate("/dashboard"); return ""; }
    const user = api.getUser();

    return `
        <div class="admin-layout">
            ${AdminSidebar.render('contactos', user)}
            
            <main class="admin-content">
                <div class="page-header" style="display:flex; align-items:center; justify-content:space-between;">
                    <div><h2>Contactos</h2><p>Gestiona redes y teléfonos.</p></div>
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
                    <button class="btn" id="btnNewContact" disabled style="opacity:0.5;">+ Nuevo Contacto</button>
                </div>

                <div id="contactsGrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:20px;">
                    <div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--muted);">Selecciona una sede.</div>
                </div>
            </main>

            <div id="contactModal" class="modal" style="display:none;">
                <div class="modal-overlay" id="modalOverlay"></div>
                <div class="modal-content card" style="max-width:450px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                        <h3 id="modalTitle">Nuevo Contacto</h3>
                        <button class="modal-close" id="modalClose">&times;</button>
                    </div>
                    <form id="formContact">
                        <div class="field">
                            <label>Tipo</label>
                            <select id="cTipo" class="select" required>
                                ${CONTACT_OPTIONS.map(o => `<option value="${o.val}">${o.label}</option>`).join('')}
                            </select>
                            
                            <input type="text" id="cTipoCustom" class="input" style="display:none; margin-top:8px;" placeholder="Ej. TikTok, LinkedIn, Fax...">
                        </div>
                        
                        <div class="field">
                            <label>Valor / URL</label>
                            <input type="text" id="cValor" class="input" required placeholder="Ej. 950123456">
                        </div>
                        <button type="submit" class="btn" id="btnSubmit" style="width:100%; margin-top:10px;">Guardar</button>
                    </form>
                </div>
            </div>
        </div>
        
        <style>
            .contact-card { display: flex; align-items: center; justify-content: space-between; background: #1e293b; border: 1px solid rgba(255,255,255,0.05); border-left: 4px solid var(--primary); border-radius: 12px; padding: 20px; transition: transform 0.2s; }
            .contact-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
            .contact-left { display: flex; align-items: center; gap: 15px; flex: 1; min-width: 0; }
            .icon-box { width: 50px; height: 50px; background: rgba(255,255,255,0.03); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--accent); flex-shrink: 0; }
            .info-box { flex: 1; min-width: 0; }
            .info-label { font-size: 0.7rem; font-weight: bold; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
            .info-value { font-size: 1.1rem; font-weight: 500; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .actions-box { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; margin-left: 15px; }
            .btn-row { display: flex; gap: 8px; }
            .switch { position: relative; display: inline-block; width: 36px; height: 20px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .4s; border-radius: 20px; }
            .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .slider { background-color: #10b981; }
            input:checked + .slider:before { transform: translateX(16px); }
            .contact-card.inactive { border-left-color: #64748b; opacity: 0.7; }
            .contact-card.inactive .icon-box { color: #94a3b8; }
            .action-btn { width: 32px; height: 32px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
            .btn-edit { background: rgba(251, 191, 36, 0.15); color: #fbbf24; } .btn-edit:hover { background: rgba(251, 191, 36, 0.3); }
            .btn-delete { background: rgba(239, 68, 68, 0.15); color: #ef4444; } .btn-delete:hover { background: rgba(239, 68, 68, 0.3); }
        </style>
    `;
  },

  attachEventListeners: async () => {
      AdminSidebar.attachListeners();

      // 2. LOGICA VISUAL DEL SELECT "OTRO"
      const cTipoSelect = document.getElementById('cTipo');
      const cTipoCustom = document.getElementById('cTipoCustom');

      if(cTipoSelect) {
          cTipoSelect.addEventListener('change', (e) => {
              if (e.target.value === 'Otro') {
                  cTipoCustom.style.display = 'block';
                  cTipoCustom.required = true;
                  cTipoCustom.focus();
              } else {
                  cTipoCustom.style.display = 'none';
                  cTipoCustom.required = false;
                  cTipoCustom.value = '';
              }
          });
      }

      // Cargar Sedes
      try {
        const complejos = await api.getMyComplejos();
        const sel = document.getElementById('selectComplejo');
        if(complejos.length > 0) {
            sel.innerHTML = '<option value="">Selecciona...</option>' + complejos.map(c => `<option value="${c.complejo_id}">${c.nombre}</option>`).join('');
            const lastId = localStorage.getItem('admin_last_complejo_id') || complejos[0].complejo_id;
            if(complejos.find(c=>c.complejo_id == lastId)) {
                sel.value = lastId; state.selectedComplejoId = lastId; updateUI(); loadContactos();
            }
        } else { sel.innerHTML = '<option>Sin sedes</option>'; }
      } catch(e){}

      document.getElementById('selectComplejo').addEventListener('change', (e) => {
          state.selectedComplejoId = e.target.value;
          if(state.selectedComplejoId) localStorage.setItem('admin_last_complejo_id', state.selectedComplejoId);
          updateUI(); loadContactos();
      });

      // Modal
      const modal = document.getElementById('contactModal');
      const closeModal = () => { modal.style.display = 'none'; state.isEditing = false; };
      document.getElementById('modalClose').addEventListener('click', closeModal);
      document.getElementById('modalOverlay').addEventListener('click', closeModal);
      
      document.getElementById('btnNewContact').addEventListener('click', () => {
          state.isEditing = false;
          document.getElementById('modalTitle').textContent = "Nuevo Contacto";
          document.getElementById('btnSubmit').textContent = "Guardar";
          document.getElementById('formContact').reset();
          
          // Resetear estado del input personalizado
          cTipoCustom.style.display = 'none';
          cTipoCustom.required = false;

          modal.style.display = 'flex';
      });

      // 3. LOGICA AL GUARDAR
      document.getElementById('formContact').addEventListener('submit', async (e) => {
          e.preventDefault();
          if(state.isSubmitting) return; state.isSubmitting = true;
          const btn = document.getElementById('btnSubmit'); btn.textContent = "Guardando..."; btn.disabled = true;
          
          // Determinar el valor final del tipo
          let tipoFinal = cTipoSelect.value;
          if (tipoFinal === 'Otro') {
              tipoFinal = cTipoCustom.value.trim(); // Usar lo que escribió el usuario
          }

          const data = {
              complejo_id: state.selectedComplejoId,
              tipo: tipoFinal,
              valor_contacto: document.getElementById('cValor').value,
              estado: 'activo'
          };

          try {
              if(state.isEditing) await api.updateContacto(state.currentEditId, data);
              else await api.createContacto(data);
              closeModal(); loadContactos();
          } catch(err) { toast.error(err.message || "Error al guardar"); }
          finally { state.isSubmitting = false; btn.textContent = "Guardar"; btn.disabled = false; }
      });

      // 4. LOGICA AL EDITAR (DETECTAR SI ES PERSONALIZADO)
      window.editContact = (id) => {
          const c = state.contactos.find(x => x.contacto_id == id);
          if(!c) return;
          state.isEditing = true; state.currentEditId = id;
          document.getElementById('modalTitle').textContent = "Editar Contacto";
          
          // Revisar si el tipo actual está en la lista estándar
          const standardOption = Array.from(cTipoSelect.options).find(opt => opt.value === c.tipo);
          
          if (standardOption) {
              // Es estándar (ej: "WhatsApp")
              cTipoSelect.value = c.tipo;
              cTipoCustom.style.display = 'none';
              cTipoCustom.required = false;
              cTipoCustom.value = '';
          } else {
              // Es personalizado (ej: "TikTok")
              cTipoSelect.value = 'Otro';
              cTipoCustom.style.display = 'block';
              cTipoCustom.required = true;
              cTipoCustom.value = c.tipo; // Poner el valor real en el input de texto
          }

          document.getElementById('cValor').value = c.valor_contacto;
          modal.style.display = 'flex';
      };

      window.deleteContact = async (id) => {
        const confirmed = await confirmAction("¿Eliminar?");
          if(confirmed) { try { await api.deleteContacto(id);
            toast.success("Contacto eliminado"); 
            loadContactos(); } catch(e){toast.error(e.message);} }
      };

      window.toggleContactStatus = async (id) => {
          try {
              const idx = state.contactos.findIndex(c => c.contacto_id == id);
              if(idx > -1) {
                  const curr = state.contactos[idx].estado;
                  state.contactos[idx].estado = (curr === 'activo' ? 'inactivo' : 'activo');
                  toast.success("Estado Actualizado")
                  renderGrid();
              }
              await api.toggleStatusContacto(id);
          } catch(e){ loadContactos(); }
      };
  }
};

function updateUI() {
    const btn = document.getElementById('btnNewContact');
    if (state.selectedComplejoId) {
        btn.disabled = false; btn.style.opacity = "1"; btn.style.cursor = "pointer";
    } else {
        btn.disabled = true; btn.style.opacity = "0.5";
    }
}

async function loadContactos() {
    if(!state.selectedComplejoId) return;
    const grid = document.getElementById('contactsGrid');
    try {
        const res = await api.getContactos(state.selectedComplejoId);
        state.contactos = res;
        renderGrid();
    } catch(e) { grid.innerHTML = `<div style="color:red;">Error de carga</div>`; }
}

function renderGrid() {
    const grid = document.getElementById('contactsGrid');
    if(state.contactos.length === 0) { grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--muted); border:2px dashed rgba(255,255,255,0.1); border-radius:10px;">No hay contactos.</div>`; return; }

    grid.innerHTML = state.contactos.map(c => {
        const isActive = c.estado === 'activo';
        // Buscamos el icono. Si es un tipo personalizado (ej: TikTok), caerá en 'otro'
        const typeKey = c.tipo.toLowerCase();
        const icon = CONTACT_ICONS[typeKey] || CONTACT_ICONS['otro'];
        
        return `
        <div class="contact-card ${isActive ? '' : 'inactive'}">
            <div class="contact-left">
                <div class="icon-box">${icon}</div>
                <div class="info-box">
                    <div class="info-label">${c.tipo}</div>
                    <div class="info-value" title="${c.valor_contacto}">${c.valor_contacto}</div>
                </div>
            </div>
            <div class="actions-box">
                <label class="switch">
                    <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.toggleContactStatus(${c.contacto_id})">
                    <span class="slider"></span>
                </label>
                <div class="btn-row">
                    <button class="action-btn btn-edit" onclick="window.editContact(${c.contacto_id})"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg></button>
                    <button class="action-btn btn-delete" onclick="window.deleteContact(${c.contacto_id})"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 0-1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button>
                </div>
            </div>
        </div>`;
    }).join('');
}

export default adminContactsView;