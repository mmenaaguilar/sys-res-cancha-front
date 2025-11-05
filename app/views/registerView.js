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
            <button type="button" class="toggle-password" 
                    onclick="togglePasswordVisibility('regPassword')">
                👁️
            </button>
            </div>
            <div class="field" style="position:relative;">
            <label for="regPasswordConfirm" class="small">Confirmar contraseña</label>
            <input type="password" id="regPasswordConfirm" class="input" required minlength="6" />
            <button type="button" class="toggle-password" 
                    onclick="togglePasswordVisibility('regPasswordConfirm')">
                👁️
            </button>
            </div>
            <button type="submit" class="btn" style="width:100%; margin-top:16px;">Crear cuenta</button>
          </form>

          <div style="text-align:center; margin-top:20px;">
            <span class="small">¿Ya tienes cuenta?</span>
            <br>
            <a href="#" id="loginLink" class="small" style="color:var(--accent); text-decoration:underline;">
              Inicia sesión aquí
            </a>
          </div>
        </div>
      </div>
    `;
  },

  attachEventListeners: () => {
    // Enlace para volver al login
    const loginLink = document.getElementById('loginLink');
    if (loginLink) {
      loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.router.navigate('#/');
        // Opcional: abre directamente el modal de login
        // setTimeout(() => window.openLoginModal(), 100);
      });
    }

    // Formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;

        // Validación básica
        if (password !== passwordConfirm) {
          alert('Las contraseñas no coinciden.');
          return;
        }

        if (password.length < 6) {
          alert('La contraseña debe tener al menos 6 caracteres.');
          return;
        }

        // ✅ Simulación de registro exitoso
        alert(`¡Cuenta creada con éxito!\nBienvenido, ${name} 🎉`);
        
        // Redirigir al home (o al login)
        window.router.navigate('#/');
      });
    }

        // Función para mostrar/ocultar contraseña
    window.togglePasswordVisibility = (fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
        field.type = field.type === 'password' ? 'text' : 'password';
    }
    };
    
    console.log("RegisterView: Event Listeners adjuntados.");
  },
};

export default registerView;