export const confirmAction = (message, title = "¿Estás seguro?") => {
    return new Promise((resolve) => {
        // 1. Crear elementos
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        
        overlay.innerHTML = `
            <div class="confirm-box">
                <div class="confirm-icon">⚠️</div>
                <div class="confirm-title">${title}</div>
                <div class="confirm-message">${message}</div>
                <div class="confirm-actions">
                    <button id="btnConfirmCancel" class="btn-confirm-cancel">Cancelar</button>
                    <button id="btnConfirmYes" class="btn-confirm-yes">Sí, Eliminar</button>
                </div>
            </div>
        `;

        // 2. Agregar al DOM
        document.body.appendChild(overlay);

        // 3. Funciones de cierre
        const close = (value) => {
            overlay.style.opacity = '0'; // Animación salida
            setTimeout(() => {
                if (overlay.parentNode) document.body.removeChild(overlay);
                resolve(value); // Devuelve true o false
            }, 200);
        };

        // 4. Listeners
        document.getElementById('btnConfirmCancel').onclick = () => close(false);
        document.getElementById('btnConfirmYes').onclick = () => close(true);
        
        // Cerrar si hace clic fuera (opcional)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close(false);
        });
    });
};