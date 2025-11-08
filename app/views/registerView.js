// app/views/registerView.js

const registerView = {
  render: () => {
    return `
      <div class="container" style="max-width: 500px; margin: 40px auto;">
        <div class="card">
          <div class="logo" style="text-align:center; margin-bottom:24px;">
            <img src="assets/images/logo.png" alt="ReserSport" style="width:60px; height:60px; object-fit:contain;">
            <h2 style="margin-top:12px;">Crear cuenta</h2>
            <p class="small" style="color:var(--muted);">Únete a ReserSport y reserva tu cancha al instante</p>
          </div>

          <form id="registerForm" novalidate>
            <div class="field">
              <label for="regName" class="small">Nombre completo</label>
              <input type="text" id="regName" class="input" required minlength="2" />
            </div>
            <div class="field">
              <label for="regEmail" class="small">Email</label>
              <input type="email" id="regEmail" class="input" required />
            </div>
            <div class="field" style="position:relative;">
              <label for="regPassword" class="small">Contraseña</label>
              <input type="password" id="regPassword" class="input" required minlength="6" />
              <button type="button" class="toggle-password" id="toggleRegPassword"
                      onclick="togglePasswordVisibility('regPassword', 'toggleRegPassword')">
              </button>
            </div>
            <div class="field">
              <label for="regPasswordConfirm" class="small">Confirmar contraseña</label>
              <input type="password" id="regPasswordConfirm" class="input" required minlength="6" />
              <button type="button" class="toggle-password" id="toggleRegPasswordConfirm"
                      onclick="togglePasswordVisibility('regPasswordConfirm', 'toggleRegPasswordConfirm')">
              </button>
            </div>
            <button type="submit" class="btn" style="width:100%; margin-top:16px;">Crear cuenta</button>
          </form>

          <div style="text-align:center; margin-top:20px;">
            <span class="small">¿Ya tienes cuenta?</span>
            <br>
            <!-- Este enlace está bien con href="#" porque su comportamiento se define en attachEventListeners -->
            <a href="#" id="loginLink" class="small" style="color:var(--accent); text-decoration:underline;">
              Inicia sesión aquí
            </a>
          </div>
        </div>
      </div>
    `;
  },

// En app/views/registerView.js

attachEventListeners: () => {
    // 1. Definición de iconos con viewBox CORRECTO
    const eyeIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>`;
    const eyeSlashIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/></svg>`;

    // 2. Insertamos el icono inicial (ojo tachado) en los botones
    const toggleRegBtn = document.getElementById('toggleRegPassword');
    const toggleRegConfirmBtn = document.getElementById('toggleRegPasswordConfirm');

    if (toggleRegBtn) {
      toggleRegBtn.innerHTML = eyeSlashIconSVG;
    }
    if (toggleRegConfirmBtn) {
      toggleRegConfirmBtn.innerHTML = eyeSlashIconSVG;
    }

    // La función `window.togglePasswordVisibility` ya existe globalmente gracias a homeView,
    // por lo que los botones `onclick` funcionarán correctamente.

    // Enlace para volver al login
    const loginLink = document.getElementById('loginLink');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.router.navigate('/');
        
        // Abrir directamente el modal de login para mejorar la experiencia
        setTimeout(() => {
            if (typeof window.openLoginModal === 'function') {
                window.openLoginModal();
            }
        }, 100);
      });
    }

    // Formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('regName').value.trim();
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;

        if (password !== passwordConfirm) {
          alert('Las contraseñas no coinciden.');
          return;
        }

        if (password.length < 6) {
          alert('La contraseña debe tener al menos 6 caracteres.');
          return;
        }

        alert(`¡Cuenta creada con éxito!\nBienvenido, ${name} 🎉`);
        window.router.navigate('/');
      });
    }
    
    console.log("RegisterView: Event Listeners adjuntados.");
  },
};

export default registerView;