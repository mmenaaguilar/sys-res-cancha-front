// app/views/userProfileView.js
import { navigate } from "../router.js";
import api from "../services/api.js";
import { toast } from "../utils/toast.js";
import { UserTopNav } from "../components/UserTopNav.js";

const userProfileView = {
  render: async () => {
    if (!api.isLoggedIn()) { 
      navigate("/"); 
      return ""; 
    }

    const user = api.getUser();
    let creditos = 0;
    
    try {
      creditos = await api.getUserCredits();
    } catch (e) {
      console.error("No se pudieron cargar créditos:", e);
    }

    return `
      <style>
        .profile-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #6366f1); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; color: white; }
        .profile-info h2 { margin: 0; color: white; font-size: 1.8rem; }
        .profile-info p { margin: 5px 0 0; color: #94a3b8; }
        .profile-credits { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 15px; margin: 20px 0; }
        .profile-credits h3 { margin: 0 0 10px; color: #34d399; font-size: 1.2rem; }
        .credits-amount { font-size: 2rem; font-weight: bold; color: white; }

        .form-section { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 25px; margin-bottom: 25px; }
        .form-section h3 { color: white; margin: 0 0 20px; font-size: 1.3rem; font-weight: 600; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; color: #cbd5e1; margin-bottom: 6px; font-size: 0.9rem; font-weight: 500; }
        .form-control { width: 100%; padding: 12px 14px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; color: #e2e8f0; font-size: 1rem; }
        .form-control:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
        .form-hint { font-size: 0.8rem; color: #94a3b8; margin-top: 5px; font-style: italic; }
        .form-description { color: #94a3b8; margin: 0 0 20px; line-height: 1.5; }
        .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
        
        .btn-primary { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
        .btn-secondary { background: transparent; border: 1px solid #475569; color: #cbd5e1; padding: 12px 24px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: rgba(255,255,255,0.05); border-color: #94a3b8; color: white; }
        
        .profile-footer { margin-top: 30px; text-align: center; }
        .btn-back-to-dashboard { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .btn-back-to-dashboard:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(107, 114, 128, 0.4); }

        /* --- MODAL DE CONTRASEÑA --- */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          /* backdrop-filter: blur(8px); */ /* ❌ Eliminado para evitar problemas */
        }
        .modal-content {
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 25px;
          width: 90%;
          max-width: 400px;
          color: white;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .modal-header h3 {
          margin: 0;
          color: white;
          font-size: 1.3rem;
          font-weight: 600;
        }
        .modal-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .modal-close:hover {
          color: white;
        }
        .modal-body {
          margin-bottom: 20px;
        }
        .password-rules {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          padding: 15px;
          margin-top: 15px;
        }
        .password-rules h4 {
          margin: 0 0 10px;
          color: #3b82f6;
          font-size: 1rem;
          font-weight: 600;
        }
        .password-rules ul {
          margin: 0;
          padding-left: 20px;
          list-style-type: disc;
          color: #cbd5e1;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .password-rules li {
          margin-bottom: 5px;
        }
        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        @media (max-width: 768px) {
          .form-row { grid-template-columns: 1fr; }
          .profile-header { flex-direction: column; text-align: center; }
          .modal-content { width: 95%; padding: 20px; }
        }
      </style>

      <!-- TOP NAVIGATION -->
      <div id="userTopNav"></div>
      
      <div class="profile-container">
        <!-- Header -->
        <div class="profile-header">
          <div class="profile-avatar">${user.nombre.charAt(0).toUpperCase()}</div>
          <div class="profile-info">
            <h2>Mi Perfil</h2>
            <p>${user.correo}</p>
          </div>
        </div>

        <!-- Créditos -->
        <div class="profile-credits">
          <h3>Créditos Disponibles</h3>
          <div class="credits-amount">${creditos}</div>
        </div>

        <!-- Formulario de perfil -->
        <div class="form-section">
          <h3>Información Personal</h3>
          <form id="profileForm">
            <div class="form-row">
              <div class="form-group">
                <label for="nombre">Nombre Completo</label>
                <input type="text" id="nombre" class="form-control" value="${user.nombre}" required>
              </div>
              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input type="tel" id="telefono" class="form-control" value="${user.telefono || ''}">
              </div>
            </div>
            
            <div class="form-group">
              <label for="email">Correo Electrónico</label>
              <input type="email" id="email" class="form-control" value="${user.correo}" required readonly>
              <p class="form-hint">El correo no se puede modificar por seguridad.</p>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn-secondary" onclick="window.history.back()">Cancelar</button>
              <button type="submit" class="btn-primary" id="btnSaveProfile">Guardar Cambios</button>
            </div>
          </form>
        </div>

        <!-- Seguridad -->
        <div class="form-section">
          <h3>Seguridad</h3>
          <p class="form-description">Protege tu cuenta actualizando tu contraseña regularmente.</p>
          <button type="button" class="btn-secondary" id="btnChangePassword">Cambiar Contraseña</button>
        </div>

        <!-- Botón Volver al Dashboard -->
        <div class="profile-footer">
            <button type="button" class="btn-back-to-dashboard" id="btnBackToDashboard">
                ← Volver al Dashboard
            </button>
        </div>
      </div>
    `;
  },

  attachEventListeners: () => {
    // Guardar cambios de perfil
    document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const user = api.getUser();
      const formData = {
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        correo: document.getElementById('email').value
      };

      try {
        await api.updateUserProfile(user.usuario_id, formData);
        toast.success("Perfil actualizado correctamente");
        
        // Actualizar datos en localStorage
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        toast.error(error.message || "Error al actualizar el perfil");
      }
    });

    // Cambiar contraseña
    document.getElementById('btnChangePassword')?.addEventListener('click', () => {
        const modalHtml = `
            <div id="passwordModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Cambiar Contraseña</h3>
                        <button id="closePasswordModal" class="modal-close">×</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="currentPass">Contraseña Actual</label>
                            <input type="password" id="currentPass" class="form-control" placeholder="Ingresa tu contraseña actual" autocomplete="current-password">
                        </div>
                        
                        <div class="form-group">
                            <label for="newPass">Nueva Contraseña</label>
                            <input type="password" id="newPass" class="form-control" placeholder="Mínimo 8 caracteres" autocomplete="new-password">
                        </div>
                        
                        <div class="form-group">
                            <label for="confirmPass">Confirmar Nueva Contraseña</label>
                            <input type="password" id="confirmPass" class="form-control" placeholder="Confirma tu nueva contraseña" autocomplete="new-password">
                        </div>
                        
                        <div class="password-rules">
                            <h4>Requisitos:</h4>
                            <ul>
                                <li>Al menos 8 caracteres</li>
                                <li>Diferente a la actual</li>
                                <li>No debe ser fácil de adivinar</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelPassChange" class="btn-secondary">Cancelar</button>
                        <button id="savePassChange" class="btn-primary">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        `;
        
        // Limpiar modal existente
        const existingModal = document.getElementById('passwordModal');
        if (existingModal) existingModal.remove();
        
        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Obtener elementos del modal
        const modal = document.getElementById('passwordModal');
        const closeBtn = document.getElementById('closePasswordModal');
        const cancelBtn = document.getElementById('cancelPassChange');
        const saveBtn = document.getElementById('savePassChange');
        
        // Función para cerrar modal
        const closeModal = () => {
            if (modal) modal.remove();
        };
        
        // Registrar listeners
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (modal) modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Guardar cambios
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const currentPass = document.getElementById('currentPass')?.value || '';
                const newPass = document.getElementById('newPass')?.value || '';
                const confirmPass = document.getElementById('confirmPass')?.value || '';
                
                // Validaciones
                if (!currentPass) {
                    toast.error("Ingresa tu contraseña actual");
                    return;
                }
                if (!newPass) {
                    toast.error("Ingresa tu nueva contraseña");
                    return;
                }
                if (newPass.length < 8) {
                    toast.error("La nueva contraseña debe tener al menos 8 caracteres");
                    return;
                }
                if (newPass !== confirmPass) {
                    toast.error("Las contraseñas no coinciden");
                    return;
                }
                if (newPass === currentPass) {
                    toast.error("La nueva contraseña debe ser diferente a la actual");
                    return;
                }
                
                try {
                    await api.changeUserPassword(currentPass, newPass);
                    toast.success("¡Contraseña actualizada correctamente!");
                    closeModal();
                } catch (error) {
                    toast.error(error.message || "Error al cambiar la contraseña");
                }
            });
        }
    });

    // Botón Volver al Dashboard
    document.getElementById('btnBackToDashboard')?.addEventListener('click', () => {
        navigate('/dashboard');
    });

    // Top Navigation
    const navContainer = document.getElementById('userTopNav');
    if (navContainer) {
        const user = api.getUser();
        navContainer.innerHTML = UserTopNav.render('profile', user);
        UserTopNav.attachListeners();
    }
  }
};

export default userProfileView;