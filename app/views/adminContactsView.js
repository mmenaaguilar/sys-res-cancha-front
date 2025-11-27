import { navigate } from "../router.js";
import api from "../services/api.js";

let state = {
    complejos: [],
    selectedComplejoId: null,
    contactos: [],
    isEditing: false,
    currentEditId: null,
    isSubmitting: false
};

// MAPA DE ICONOS SVG (Sin Emojis)
const CONTACT_ICONS = {
    'Telefono': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    'Celular': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    'WhatsApp': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    'Email': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    'Facebook': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`,
    'Instagram': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
    'Web': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    'Otro': `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`
};

const adminContactsView = {
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
                    
                    <!-- Enlace ACTIVO para Contactos -->
                    <a href="#" onclick="window.location.reload()" class="active">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Contactos
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <button class="btn" id="btnBackToApp" style="width:100%; background:rgba(255,255,255,0.05);">Volver al App</button>
                </div>
            </aside>
            
            <main class="admin-content">
                <div class="page-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:15px;">
                    <div>
                        <h2>Contactos y Redes</h2>
                        <p>Gestiona cómo te encuentran tus clientes.</p>
                    </div>
                    
                    <div style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); padding:8px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                        <span style="color:var(--muted); font-size:0.85rem;">Sede:</span>
                        <select id="selectComplejo" class="select" style="background:transparent; border:none; height:auto; padding:0; color:var(--accent); font-weight:700; cursor:pointer; width:180px;">
                            <option value="">Cargando...</option>
                        </select>
                    </div>
                </div>

                <div class="admin-toolbar">
                    <div style="flex:1;"></div>
                    <button class="btn" id="btnNewContact" disabled style="opacity:0.5; cursor:not-allowed;">
                        <span>+</span> Nuevo Contacto
                    </button>
                </div>

                <div id="contactsGrid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                    <div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--muted);">
                        Selecciona una sede arriba.
                    </div>
                </div>
            </main>

            <!-- MODAL -->
            <div id="contactModal" class="modal" style="display:none;">
                <div class="modal-overlay" id="modalOverlay"></div>
                <div class="modal-content card" style="max-width:500px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                        <h3 id="modalTitle">Nuevo Contacto</h3>
                        <button class="modal-close" id="modalClose">&times;</button>
                    </div>
                    
                    <form id="formContact">
                        <div class="field">
                            <label>Tipo de Canal</label>
                            <select id="cTipo" class="select" required>
                                ${Object.keys(CONTACT_ICONS).map(key => `<option value="${key}">${key}</option>`).join('')}
                            </select>
                        </div>
                        <div class="field">
                            <label>Valor</label>
                            <input type="text" id="cValor" class="input" required placeholder="Ej. 950123456">
                        </div>
                        <div class="field" id="divEstado" style="display:none;">
                            <label>Estado</label>
                            <select id="cEstado" class="select">
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
            /* Estilos unificados para botones */
            .action-btn {
                width: 32px; height: 32px; border-radius: 6px; border: none;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; transition: all 0.2s;
            }
            .btn-edit { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
            .btn-edit:hover { background: rgba(251, 191, 36, 0.3); }
            
            .btn-delete { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
            .btn-delete:hover { background: rgba(239, 68, 68, 0.3); }

            /* Switch */
            .switch { position: relative; display: inline-block; width: 36px; height: 20px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .4s; border-radius: 20px; }
            .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .slider { background-color: #4ade80; }
            input:checked + .slider:before { transform: translateX(16px); }
        </style>
    `;
  },

  attachEventListeners: async () => {
      document.getElementById('btnBackToApp')?.addEventListener('click', () => navigate('/dashboard'));

      try {
        const complejos = await api.getMyComplejos();
        const sel = document.getElementById('selectComplejo');
        if(complejos.length > 0) {
            sel.innerHTML = '<option value="">Selecciona...</option>' + complejos.map(c => `<option value="${c.complejo_id}">${c.nombre}</option>`).join('');
            
            const lastId = localStorage.getItem('admin_last_complejo_id');
            if(lastId && complejos.find(c => c.complejo_id == lastId)) {
                sel.value = lastId;
                state.selectedComplejoId = lastId;
                loadContactos();
            }
        } else { sel.innerHTML = '<option>Sin sedes</option>'; }
      } catch(e){}

      document.getElementById('selectComplejo').addEventListener('change', (e) => {
          state.selectedComplejoId = e.target.value;
          if(state.selectedComplejoId) localStorage.setItem('admin_last_complejo_id', state.selectedComplejoId);
          loadContactos();
      });

      const modal = document.getElementById('contactModal');
      const closeModal = () => { modal.style.display = 'none'; state.isEditing = false; };
      document.getElementById('modalClose').addEventListener('click', closeModal);
      document.getElementById('modalOverlay').addEventListener('click', closeModal);

      document.getElementById('btnNewContact').addEventListener('click', () => {
          if(!state.selectedComplejoId) return;
          state.isEditing = false;
          document.getElementById('modalTitle').textContent = "Nuevo Contacto";
          document.getElementById('btnSubmit').textContent = "Guardar";
          document.getElementById('formContact').reset();
          document.getElementById('divEstado').style.display = 'none';
          modal.style.display = 'flex';
      });

      document.getElementById('formContact').addEventListener('submit', async (e) => {
          e.preventDefault();
          if(state.isSubmitting) return; state.isSubmitting = true;
          const btn = document.getElementById('btnSubmit'); btn.textContent = "Guardando..."; btn.disabled = true;

          const data = {
              complejo_id: state.selectedComplejoId,
              tipo: document.getElementById('cTipo').value,
              valor_contacto: document.getElementById('cValor').value,
              estado: state.isEditing ? document.getElementById('cEstado').value : 'activo'
          };

          try {
              if(state.isEditing) await api.updateContacto(state.currentEditId, data);
              else await api.createContacto(data);
              closeModal();
              loadContactos();
          } catch(err) { alert("Error: " + err.message); }
          finally { state.isSubmitting = false; btn.textContent = "Guardar"; btn.disabled = false; }
      });

      window.editContact = (id) => {
          const c = state.contactos.find(x => x.contacto_id == id);
          if(!c) return;
          state.isEditing = true; state.currentEditId = id;
          document.getElementById('modalTitle').textContent = "Editar Contacto";
          document.getElementById('cTipo').value = c.tipo;
          document.getElementById('cValor').value = c.valor_contacto;
          document.getElementById('divEstado').style.display = 'block';
          document.getElementById('cEstado').value = c.estado;
          modal.style.display = 'flex';
      };

      window.deleteContact = async (id) => {
          if(confirm("¿Eliminar este contacto?")) {
              try { await api.deleteContacto(id); loadContactos(); } catch(e){}
          }
      };

      window.toggleContactStatus = async (id) => {
          try { await api.toggleStatusContacto(id); loadContactos(); } catch(e){}
      };
  }
};

async function loadContactos() {
    const btn = document.getElementById('btnNewContact');
    const grid = document.getElementById('contactsGrid');
    
    if(!state.selectedComplejoId) {
        btn.disabled = true; btn.style.opacity = "0.5"; btn.style.cursor = "not-allowed";
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--muted);">Selecciona una sede.</div>`;
        return;
    }
    
    btn.disabled = false; btn.style.opacity = "1"; btn.style.cursor = "pointer";
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--muted);">Cargando...</div>`;

    try {
        const res = await api.getContactos(state.selectedComplejoId);
        state.contactos = res;

        if(res.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--muted); border:2px dashed rgba(255,255,255,0.1); border-radius:10px;">No hay contactos registrados.</div>`;
            return;
        }

        grid.innerHTML = res.map(c => {
            const iconSvg = CONTACT_ICONS[c.tipo] || CONTACT_ICONS['Otro'];
            const isActive = c.estado === 'activo';
            
            return `
            <div class="card" style="display:flex; align-items:center; gap:15px; border-left: 4px solid ${isActive ? 'var(--accent)' : '#64748b'}; opacity: ${isActive ? 1 : 0.6}; transition: all 0.3s;">
                
                <div style="font-size:1.5rem; background:rgba(255,255,255,0.05); width:45px; height:45px; display:flex; align-items:center; justify-content:center; border-radius:12px; color:var(--accent);">
                    ${iconSvg}
                </div>
                
                <div style="flex:1; overflow:hidden;">
                    <div class="small" style="color:var(--text-muted); text-transform:uppercase; font-size:0.7rem; font-weight:bold;">${c.tipo}</div>
                    <div style="font-weight:500; font-size:1rem; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${c.valor_contacto}">
                        ${c.valor_contacto}
                    </div>
                    <div class="small" style="font-size:0.75rem; color:${isActive?'#4ade80':'#94a3b8'}; margin-top:2px;">
                        ${isActive ? '● Visible' : '○ Oculto'}
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:5px; align-items:center;">
                    <label class="switch" title="Activar/Desactivar">
                        <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.toggleContactStatus(${c.contacto_id})">
                        <span class="slider"></span>
                    </label>
                    
                    <div style="display:flex; gap:5px; margin-top:5px;">
                        <button class="action-btn btn-edit" onclick="window.editContact(${c.contacto_id})" title="Editar">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>
                        </button>
                        <button class="action-btn btn-delete" onclick="window.deleteContact(${c.contacto_id})" title="Eliminar">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');

    } catch(e) {
        grid.innerHTML = `<div style="color:red;">Error al cargar contactos.</div>`;
    }
}

export default adminContactsView;