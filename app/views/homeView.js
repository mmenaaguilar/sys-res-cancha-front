// js/views/homeView.js

const homeView = {
  // 1. MÉTODO RENDER: Genera el HTML estático (síncrono)
  render: () => {
    // Devuelve el HTML que se inyectará en el <main id="app-content">
    return `
            <section class="home-view container">
                <h1>👋 ¡Hola! Esta es la Vista Principal (HomeView)</h1>
                <p>El router cargó esta página correctamente.</p>
                
                <div id="test-area">
                    <p>Haz clic en el botón para probar el evento de la vista.</p>
                    <button id="test-button" class="button-primary">Probar Lógica JS</button>
                </div>
            </section>
        `;
  },

  // 2. MÉTODO ATTACHEVENTLISTENERS: Añade la interactividad (síncrono)
  attachEventListeners: () => {
    // En esta versión simple, no es necesario que sea async.
    console.log("HomeView: Event Listeners adjuntados.");

    const testButton = document.getElementById("test-button");

    if (testButton) {
      testButton.addEventListener("click", () => {
        alert(
          "¡Éxito! La lógica de homeView está funcionando y el evento click fue capturado."
        );
      });
    }
  },
};

export default homeView;
