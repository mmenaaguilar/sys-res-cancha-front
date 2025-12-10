import { navigate } from "../router.js";
import api from "../services/api.js";
import { toast } from "../utils/toast.js"; // Asegúrate de importar el toast

// Iconos SVG consistentes
const ICONS = {
    user: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    phone: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    mail: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    lock: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    eye: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3-2.3M1 1l22 22"/></svg>`,
    back: `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`
};

const registerView = {
  render: () => {
    return `
      <div class="register-page">
        <button class="btn-back" id="btnBackHome" title="Volver al inicio">
            ${ICONS.back}
        </button>

        <div class="register-card">
          <div class="logo-section">
            <div class="logo-box">
                <img src="assets/images/logo.png" alt="ReserSport" onerror="this.style.display='none'">
            </div>
            <h2>Crear Cuenta</h2>
            <p>Únete a la comunidad deportiva más grande.</p>
          </div>

          <form id="registerForm" novalidate>
            
            <div class="input-group">
              <label>Nombre Completo</label>
              <div class="input-wrapper">
                <span class="input-icon left">${ICONS.user}</span>
                <input type="text" id="regName" placeholder="Ej. Juan Pérez" required minlength="2" />
              </div>
            </div>

            <div class="input-group">
              <label>Celular / WhatsApp</label>
              <div class="input-wrapper">
                <span class="input-icon left">${ICONS.phone}</span>
                <input type="tel" id="regPhone" placeholder="999 999 999" maxlength="9" required />
              </div>
            </div>

            <div class="input-group">
              <label>Correo Electrónico</label>
              <div class="input-wrapper">
                <span class="input-icon left">${ICONS.mail}</span>
                <input type="email" id="regEmail" placeholder="usuario@ejemplo.com" required />
              </div>
            </div>

            <div class="row-2-col">
                <div class="input-group">
                  <label>Contraseña</label>
                  <div class="input-wrapper">
                    <span class="input-icon left">${ICONS.lock}</span>
                    <input type="password" id="regPassword" placeholder="Min. 6 caracteres" required minlength="6" />
                    <button type="button" class="toggle-pass right" id="toggleRegPassword" tabindex="-1">${ICONS.eye}</button>
                  </div>
                </div>

                <div class="input-group">
                  <label>Confirmar</label>
                  <div class="input-wrapper">
                    <span class="input-icon left">${ICONS.lock}</span>
                    <input type="password" id="regPasswordConfirm" placeholder="Repetir contraseña" required />
                    <button type="button" class="toggle-pass right" id="toggleRegPasswordConfirm" tabindex="-1">${ICONS.eye}</button>
                  </div>
                </div>
            </div>

            <button type="submit" class="btn-submit">
              REGISTRARME
            </button>
          </form>

          <div class="login-footer">
            ¿Ya tienes una cuenta? <a href="#" id="loginLink">Inicia sesión aquí</a>
          </div>
        </div>
      </div>

      <style>
        :root {
            --bg-dark: #0f172a;
            --bg-card: #1e293b;
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --border: rgba(255,255,255,0.1);
        }

        .register-page {
            min-height: 100vh;
            background-color: var(--bg-dark);
            background-image: radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', system-ui, sans-serif;
            position: relative;
            padding: 20px;
        }

        .btn-back {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--border);
            color: var(--text-muted);
            width: 45px; height: 45px;
            border-radius: 12px;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
        }
        .btn-back:hover { background: rgba(255,255,255,0.1); color: white; }

        .register-card {
            width: 100%;
            max-width: 500px;
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .logo-section { text-align: center; margin-bottom: 30px; }
        .logo-box { width: 60px; height: 60px; margin: 0 auto 15px; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 15px; display: flex; align-items: center; justify-content: center; padding: 10px; box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4); }
        .logo-box img { width: 100%; height: 100%; object-fit: contain; }
        .logo-section h2 { margin: 0; color: white; font-size: 1.8rem; }
        .logo-section p { margin: 5px 0 0; color: var(--text-muted); font-size: 0.95rem; }

        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; color: #cbd5e1; font-size: 0.9rem; margin-bottom: 8px; font-weight: 500; }
        
        .input-wrapper { position: relative; }
        .input-wrapper input {
            width: 100%;
            background: #0f172a;
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px 40px; /* Espacio para iconos */
            color: white;
            font-size: 0.95rem;
            transition: all 0.2s;
            outline: none;
        }
        .input-wrapper input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
        
        .input-icon.left { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none; }
        
        .toggle-pass {
            position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
            background: none; border: none; color: #64748b; cursor: pointer; transition: color 0.2s;
        }
        .toggle-pass:hover { color: var(--primary); }

        .row-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }

        .btn-submit {
            width: 100%;
            background: linear-gradient(135deg, var(--primary) 0%, #2563eb 100%);
            color: white;
            border: none;
            padding: 14px;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 10px;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
        }
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .login-footer { text-align: center; margin-top: 25px; color: var(--text-muted); font-size: 0.9rem; padding-top: 20px; border-top: 1px solid var(--border); }
        .login-footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
        .login-footer a:hover { text-decoration: underline; }

        @media(max-width: 600px) {
            .register-card { padding: 25px; }
            .row-2-col { grid-template-columns: 1fr; gap: 0; }
        }
      </style>
    `;
  },

  attachEventListeners: () => {
    
    // 1. Botón volver
    document.getElementById('btnBackHome')?.addEventListener('click', () => navigate('/'));

    // 2. Toggle Password Logic (Reutilizable)
    const setupToggle = (inputId, btnId) => {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        if(input && btn) {
            btn.addEventListener('click', () => {
                const isPass = input.type === 'password';
                input.type = isPass ? 'text' : 'password';
                btn.innerHTML = isPass ? ICONS.eyeOff : ICONS.eye;
            });
        }
    };
    setupToggle('regPassword', 'toggleRegPassword');
    setupToggle('regPasswordConfirm', 'toggleRegPasswordConfirm');

    // 3. Link al Login
    document.getElementById('loginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/');
        setTimeout(() => {
            const btnOpen = document.getElementById('btnOpenLogin');
            if(btnOpen) btnOpen.click();
        }, 100);
    });

    // 4. Solo números en teléfono
    document.getElementById('regPhone')?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // 5. Submit Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Creando cuenta...";
        submitBtn.disabled = true;

        // Datos
        const nameVal = document.getElementById('regName').value.trim();
        const phoneVal = document.getElementById('regPhone').value.trim();
        const emailVal = document.getElementById('regEmail').value.trim();
        const pass1 = document.getElementById('regPassword').value;
        const pass2 = document.getElementById('regPasswordConfirm').value;

        // Validaciones Básicas
        if (pass1 !== pass2) {
          toast.warning('Las contraseñas no coinciden');
          resetBtn(submitBtn, originalText);
          return;
        }

        if (pass1.length < 6) {
           toast.warning('La contraseña es muy corta (mínimo 6)');
           resetBtn(submitBtn, originalText);
           return;
        }

        try {
            // Objeto para Backend
            const usuarioParaBD = {
                nombre: nameVal,
                correo: emailVal,
                telefono: phoneVal,
                contrasena: pass1
            };

            await api.register(usuarioParaBD);

            toast.success(`¡Bienvenido a ReserSport, ${nameVal}!`);
            
            // Navegación
            navigate('/');
            setTimeout(() => {
                const btnOpen = document.getElementById('btnOpenLogin');
                if(btnOpen) btnOpen.click();
            }, 500);

        } catch (error) {
            toast.error(error.message || "Error al registrarse");
            resetBtn(submitBtn, originalText);
        }
      });
    }
    
    function resetBtn(btn, text) {
        btn.textContent = text;
        btn.disabled = false;
    }
  },
};

export default registerView;