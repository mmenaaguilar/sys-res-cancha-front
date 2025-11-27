// app/views/registerView.js

import { navigate } from "../router.js";
import api from "../services/api.js";

const ICONS = {
    eye: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>`,
    eyeSlash: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/></svg>`
};

const registerView = {
  render: () => {
    return `
      <div class="container">
        <div class="card" style="max-width: 480px; margin: 40px auto;">
          
          <div class="logo" style="justify-content: center; flex-direction: column; margin-bottom: 24px;">
            <img src="assets/images/logo.png" alt="ReserSport" style="width: 70px; height: auto;" onerror="this.src='https://placehold.co/70x70?text=Logo'">
            <div style="text-align: center;">
              <h2 style="margin-top: 10px;">Crear cuenta</h2>
              <p class="small" style="color: var(--text-muted);">Únete para reservar canchas al instante</p>
            </div>
          </div>

          <form id="registerForm" novalidate>
            <div class="field" style="margin-bottom: 12px;">
              <label for="regName">Nombre completo</label>
              <input type="text" id="regName" class="input" placeholder="Ej. Juan Pérez" required minlength="2" />
            </div>

            <div class="field" style="margin-bottom: 12px;">
              <label for="regPhone">Celular / WhatsApp</label>
              <input type="tel" id="regPhone" class="input" placeholder="999 999 999" maxlength="9" pattern="[0-9]*" required />
            </div>

            <div class="field" style="margin-bottom: 12px;">
              <label for="regEmail">Correo electrónico</label>
              <input type="email" id="regEmail" class="input" placeholder="nombre@ejemplo.com" required />
            </div>

            <div class="field" style="margin-bottom: 12px; position: relative;">
              <label for="regPassword">Contraseña</label>
              <input type="password" id="regPassword" class="input" placeholder="Mínimo 6 caracteres" required minlength="6" />
              <button type="button" class="toggle-password" id="toggleRegPassword"></button>
            </div>

            <div class="field" style="margin-bottom: 20px; position: relative;">
              <label for="regPasswordConfirm">Confirmar contraseña</label>
              <input type="password" id="regPasswordConfirm" class="input" placeholder="Repite tu contraseña" required minlength="6" />
              <button type="button" class="toggle-password" id="toggleRegPasswordConfirm"></button>
            </div>

            <button type="submit" class="btn" style="width:100%; height: 48px; font-size: 1rem;">
              Registrarme
            </button>
          </form>

          <div style="text-align:center; margin-top: 24px; font-size: 0.9rem; color: var(--text-muted);">
            ¿Ya tienes una cuenta? <br>
            <a href="#" id="loginLink" style="color: var(--accent); font-weight: 600; text-decoration: underline;">Inicia sesión aquí</a>
          </div>
        </div>
      </div>
    `;
  },

  attachEventListeners: () => {
    
    // 1. Mostrar/Ocultar Password
    const setupPasswordToggle = (inputId, btnId) => {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        
        if (input && btn) {
            btn.innerHTML = ICONS.eyeSlash;
            btn.addEventListener('click', () => {
                const isPass = input.type === 'password';
                input.type = isPass ? 'text' : 'password';
                btn.innerHTML = isPass ? ICONS.eye : ICONS.eyeSlash;
            });
        }
    };
    setupPasswordToggle('regPassword', 'toggleRegPassword');
    setupPasswordToggle('regPasswordConfirm', 'toggleRegPasswordConfirm');

    // 2. Link al Login (Home)
    const loginLink = document.getElementById('loginLink');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigate('/');
        // Pequeño delay para abrir el modal automáticamente
        setTimeout(() => {
            const btnOpen = document.getElementById('btnOpenLogin');
            if(btnOpen) btnOpen.click();
        }, 100);
      });
    }

    // 3. Input Teléfono (Solo números)
    const phoneInput = document.getElementById('regPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    // 4. SUBMIT DEL FORMULARIO (Aquí está el ajuste clave)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Procesando...";
        submitBtn.disabled = true;

        // Captura de datos
        const nameVal = document.getElementById('regName').value.trim();
        const phoneVal = document.getElementById('regPhone').value.trim();
        const emailVal = document.getElementById('regEmail').value.trim();
        const pass1 = document.getElementById('regPassword').value;
        const pass2 = document.getElementById('regPasswordConfirm').value;

        // Validaciones Front
        if (pass1 !== pass2) {
          alert('⚠️ Las contraseñas no coinciden.');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          return;
        }

        if (pass1.length < 6) {
           alert('⚠️ La contraseña es muy corta (mínimo 6 caracteres).');
           submitBtn.textContent = originalText;
           submitBtn.disabled = false;
           return;
        }

        try {
            // 🔥 CLAVE: Crear objeto con las propiedades que espera el PHP
            const usuarioParaBD = {
                nombre: nameVal,        // PHP: $input['nombre']
                correo: emailVal,       // PHP: $input['correo']
                telefono: phoneVal,     // PHP: $input['telefono']
                contrasena: pass1       // PHP: $input['contrasena']
            };

            // Enviamos el objeto directo
            await api.register(usuarioParaBD);

            alert(`¡Cuenta creada con éxito! Bienvenido, ${nameVal}.`);
            
            // Redirigir al home y abrir login
            navigate('/');
            setTimeout(() => {
                const btnOpen = document.getElementById('btnOpenLogin');
                if(btnOpen) btnOpen.click();
            }, 500);

        } catch (error) {
            // Aquí capturamos errores como "Correo duplicado"
            alert("Error: " + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
      });
    }
    
    console.log("RegisterView: Listo.");
  },
};

export default registerView;