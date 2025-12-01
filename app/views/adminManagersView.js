import { navigate } from "../router.js";
import { managerService } from "../services/manager.service.js"; 
import api from "../services/api.js";
import { AdminSidebar } from "../components/AdminSidebar.js";
import { toast } from "../utils/toast.js";
import { confirmAction } from "../utils/confirm.js";

// ✅ 1. Definir funciones globales al inicio (fuera del estado)
window.openInviteModal = () => {
    const state = window.__adminManagersState || {};
    if (!state.selectedComplejoId) {
        toast.warning("Selecciona una sede para invitar usuarios.");
        return;
    }
    const modal = document.getElementById('inviteModal');
    if (modal) modal.style.display = 'flex';
};

window.deleteManager = async (id) => {
    if (await confirmAction("¿Revocar acceso?")) {
        try {
            await managerService.delete(id);
            toast.success("Acceso revocado");
            // Recargar solo los datos, no toda la vista
            const state = window.__adminManagersState || {};
            if (state.selectedComplejoId) {
                const container = document.getElementById('managersViewContainer');
                if (container) {
                    container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--muted);">Actualizando...</div>`;
                    loadManagersDataFor(state.selectedComplejoId, state.pagination?.page || 1, state.searchTerm || '');
                }
            }
        } catch (e) {
            toast.error(e.message);
        }
    }
};

window.changeManagerPage = (p) => {
    const state = window.__adminManagersState || {};
    if (state.selectedComplejoId) {
        const container = document.getElementById('managersViewContainer');
        if (container) {
            container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--muted);">Cargando página...</div>`;
            loadManagersDataFor(state.selectedComplejoId, p, state.searchTerm || '');
        }
    }
};

// ✅ 2. Estado global accesible (para evitar captura en closures)
let state = {
    selectedComplejoId: null,
    gestores: [],
    pagination: { total: 0, page: 1, limit: 10 },
    searchTerm: '',
    searchDebounceTimer: null,
    isSubmitting: false
};
window.__adminManagersState = state; // Solo para acceso desde funciones globales

const ICONS = {
    lock: `<svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    shield: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    user: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    search: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>`,
    trash: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    plus: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    close: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>`
};

const adminManagersView = {
  render: async () => {
    if (!api.isLoggedIn()) { navigate("/"); return ""; }
    const user = api.getUser();

    return `
        <style>
            .role-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 6px; }
            .role-admin { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.2); }
            .role-gestor { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
            .btn-delete { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
            .btn-delete:hover { background: rgba(239, 68, 68, 0.3); }
            
            /* Estado Restringido */
            .restricted-state { text-align: center; padding: 60px 20px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.02); margin-top: 20px; }
            .restricted-icon { color: #64748b; margin-bottom: 15px; opacity: 0.7; }
            .restricted-title { font-size: 1.2rem; color: white; margin-bottom: 8px; font-weight: 600; }
            .restricted-desc { color: #94a3b8; font-size: 0.95rem; max-width: 400px; margin: 0 auto; }
        </style>

        <div class="admin-layout">
            ${AdminSidebar.render('gestores', user)}
            
            <main class="admin-content">
                <div class="page-header" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:15px;">
                    <div><h2>Equipo y Permisos</h2><p>Gestiona el acceso a esta sede.</p></div>
                    <div style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.03); padding:8px 15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
                        <span style="color:var(--muted); font-size:0.85rem;">Sede:</span>
                        <div style="width: 200px;">
                            <select id="selectComplejo" class="select-pro"><option value="">Cargando...</option></select>
                        </div>
                    </div>
                </div>

                <div id="managersViewContainer">
                    <div style="text-align:center; padding:50px; color:var(--muted);">Cargando permisos...</div>
                </div>
            </main>

            <div id="inviteModal" class="modal" style="display:none; z-index:2000;">
                <div class="modal-overlay" id="inviteOverlay"></div>
                <div class="modal-content card" style="max-width:450px;">
                    <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0;">Invitar Colaborador</h3>
                        <button class="modal-close" id="modalClose" style="position:static;">&times;</button>
                    </div>
                    <form id="formInvite" style="padding:20px;">
                        <div class="field">
                            <label class="small">Correo Electrónico</label>
                            <input type="email" id="mEmail" class="input" required placeholder="usuario@email.com">
                        </div>
                        <div class="field" style="margin-top:15px;">
                            <label class="small">Rol</label>
                            <div style="display:grid; gap:10px;">
                                <label style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:10px;">
                                    <input type="radio" name="rol" value="2" checked>
                                    <div><div style="font-weight:bold; font-size:0.9rem; color:white;">Gestor</div><div style="font-size:0.8rem; color:var(--muted);">Ver reservas y canchas.</div></div>
                                </label>
                                <label style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:8px; cursor:pointer; display:flex; align-items:center; gap:10px;">
                                    <input type="radio" name="rol" value="1">
                                    <div><div style="font-weight:bold; font-size:0.9rem; color:white;">Super Admin</div><div style="font-size:0.8rem; color:var(--muted);">Control total + Equipo.</div></div>
                                </label>
                            </div>
                        </div>
                        <button type="submit" class="btn" id="btnSubmitInvite" style="width:100%; margin-top:20px;">Enviar Invitación</button>
                    </form>
                </div>
            </div>
        </div>
    `;
  },

  attachEventListeners: async () => {
      AdminSidebar.attachListeners();

      const sel = document.getElementById('selectComplejo');
      if (!sel) return;

      try {
        const complejos = await api.getMyComplejos();
        
        if (complejos.length > 0) {
            sel.innerHTML = '<option value="">Selecciona Sede...</option>' + 
                complejos.map(c => `<option value="${c.complejo_id}">${c.nombre}</option>`).join('');
            
            const lastId = localStorage.getItem('admin_last_complejo_id');
            const defaultId = complejos[0].complejo_id;
            let idToLoad = lastId && complejos.some(c => c.complejo_id == lastId) ? lastId : defaultId;

            sel.value = idToLoad;
            state.selectedComplejoId = idToLoad;
            if (idToLoad) {
                localStorage.setItem('admin_last_complejo_id', idToLoad);
            }
        } else {
            sel.innerHTML = '<option value="">Sin sedes</option>';
        }

        // Cargar datos iniciales
        await renderManagersView();
        
      } catch (e) {
        console.error("Error al cargar complejos:", e);
      }

      // ✅ Listener SIMPLE y directo
      sel.addEventListener('change', (e) => {
          const newId = e.target.value;
          state.selectedComplejoId = newId || null;
          state.pagination.page = 1;
          state.searchTerm = '';
          
          if (newId) {
              localStorage.setItem('admin_last_complejo_id', newId);
          } else {
              localStorage.removeItem('admin_last_complejo_id');
          }

          AdminSidebar.updateBadge?.();

          // ✅ Limpieza inmediata del contenedor
          const container = document.getElementById('managersViewContainer');
          if (container) {
              container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--muted);">Cargando permisos...</div>`;
          }

          // ✅ Renderizar inmediatamente (sin setTimeout)
          renderManagersView();
      });

      // Modal
      const modal = document.getElementById('inviteModal');
      const closeModal = () => { if (modal) modal.style.display = 'none'; };
      document.getElementById('modalClose')?.addEventListener('click', closeModal);
      document.getElementById('inviteOverlay')?.addEventListener('click', closeModal);

      // Form submit
      document.getElementById('formInvite')?.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (state.isSubmitting) return;
          state.isSubmitting = true;
          const btn = document.getElementById('btnSubmitInvite');
          const originalText = btn?.textContent || 'Enviar Invitación';
          if (btn) { btn.textContent = "Enviando..."; btn.disabled = true; }

          try {
              const email = document.getElementById('mEmail')?.value;
              const rolId = document.querySelector('input[name="rol"]:checked')?.value;
              if (!state.selectedComplejoId || !email || !rolId) {
                  throw new Error("Datos incompletos");
              }
              await managerService.invite(email, state.selectedComplejoId, rolId);
              toast.success("Invitación enviada");
              document.getElementById('mEmail').value = '';
              closeModal();
              renderManagersView(); // ✅ Actualizar vista
          } catch (err) {
              toast.error(err.message);
          } finally {
              state.isSubmitting = false;
              if (btn) { btn.textContent = originalText; btn.disabled = false; }
          }
      });

      // ✅ Búsqueda con debounce
      let searchInput = document.getElementById('managersSearchInput');
      if (searchInput) {
          searchInput.addEventListener('input', (e) => {
              clearTimeout(state.searchDebounceTimer);
              state.searchTerm = e.target.value;
              state.searchDebounceTimer = setTimeout(() => {
                  state.pagination.page = 1;
                  renderManagersView();
              }, 400);
          });
      }
  }
};

// ✅ Función central de renderizado (reemplaza checkPermissionsAndLoad)
async function renderManagersView() {
    const container = document.getElementById('managersViewContainer');
    if (!container) return;

    const complejoId = state.selectedComplejoId;
    if (!complejoId) {
        container.innerHTML = `<div class="empty-state" style="padding: 60px;">Selecciona una sede arriba para gestionar su equipo.</div>`;
        return;
    }

    try {
        // Verificar permisos
        const isOwner = api.isOwnerOf(complejoId);
        if (!isOwner) {
            container.innerHTML = `
                <div class="restricted-state">
                    <div class="restricted-icon">${ICONS.lock}</div>
                    <div class="restricted-title">Permiso Insuficiente</div>
                    <div class="restricted-desc">
                        Tu rol de <strong>Gestor</strong> en esta sede no te permite modificar el equipo.
                    </div>
                </div>
            `;
            return;
        }

        // Renderizar estructura
        container.innerHTML = `
            <div class="admin-toolbar">
                <div class="admin-search-box">
                    ${ICONS.search}
                    <input type="text" id="managersSearchInput" placeholder="Buscar usuario..." value="${state.searchTerm || ''}">
                </div>
                <button class="btn" onclick="window.openInviteModal()" style="display:flex; align-items:center; gap:8px;">
                    ${ICONS.plus} Invitar Usuario
                </button>
            </div>
            <div class="datagrid-container">
                <table class="datagrid">
                    <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th style="text-align:right;">Acciones</th></tr></thead>
                    <tbody id="tableManagers"><tr><td colspan="4" style="text-align:center; padding:30px; color:var(--muted);">Cargando equipo...</td></tr></tbody>
                </table>
                <div class="datagrid-footer"><span id="paginationInfo"></span><div class="pagination" id="paginationControls"></div></div>
            </div>
        `;

        // Cargar datos
        await loadManagersDataFor(complejoId, state.pagination.page, state.searchTerm);
    } catch (err) {
        console.error("Error en renderManagersView:", err);
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#ef4444;">Error al cargar la vista.</div>`;
    }
}

// ✅ Cargar solo los datos de la tabla (sin re-renderizar toda la vista)
async function loadManagersDataFor(complejoId, page, searchTerm) {
    const tbody = document.getElementById('tableManagers');
    if (!tbody) return;

    try {
        const res = await managerService.list(complejoId, page, searchTerm);
        const lista = Array.isArray(res) ? res : (res?.data || []);
        state.pagination.total = res?.total || lista.length;
        state.pagination.page = page;

        if (lista.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:40px; color:var(--muted);">No hay miembros en el equipo.</td></tr>`;
        } else {
            tbody.innerHTML = lista.map(m => {
                const isSuper = (m.rol_nombre || '').toLowerCase().includes('admin');
                const badgeClass = isSuper ? 'role-admin' : 'role-gestor';
                const icon = isSuper ? ICONS.shield : ICONS.user;
                return `
                <tr>
                    <td>
                        <div style="font-weight:bold; color:white;">${m.usuario_nombre || '—'}</div>
                        <div style="font-size:0.8rem; color:var(--muted);">${m.correo || '—'}</div>
                    </td>
                    <td><span class="role-badge ${badgeClass}">${icon} ${isSuper ? 'Super Admin' : 'Gestor'}</span></td>
                    <td><span style="font-size:0.8rem; color:#34d399;">ACTIVO</span></td>
                    <td style="text-align:right;">
                        <button class="btn-delete" onclick="window.deleteManager(${m.usuarioRol_id})" title="Eliminar">${ICONS.trash}</button>
                    </td>
                </tr>`;
            }).join('');
        }

        renderPagination();
    } catch (e) {
        console.error("Error al cargar datos:", e);
        tbody.innerHTML = `<tr><td colspan="4" style="color:#ef4444; text-align:center;">Error al cargar datos del equipo.</td></tr>`;
    }
}

function renderPagination() {
    const info = document.getElementById('paginationInfo');
    const controls = document.getElementById('paginationControls');
    if (!info || !controls) return;

    const { total, page, limit } = state.pagination;
    const pages = Math.ceil(total / limit) || 1;
    info.textContent = `${total} Usuario(s)`;
    controls.innerHTML = `
        <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="window.changeManagerPage(${page - 1})">Anterior</button>
        <span style="padding:0 10px; color:var(--muted); font-size:0.9rem;">${page} / ${pages}</span>
        <button class="page-btn" ${page >= pages ? 'disabled' : ''} onclick="window.changeManagerPage(${page + 1})">Siguiente</button>
    `;
}

export default adminManagersView;