// app/services/user.service.js
import http from "./httpClient.js";

export const userService = {
  // Obtener créditos del usuario
  getCreditos: async () => {
    try {
      // Obtener el usuario del localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.usuario_id) {
        throw new Error("Usuario no autenticado");
      }

      const response = await http.request("/api/usuarios/creditos", "POST", {
        usuario_id: user.usuario_id,
      });
      // 🚨 Accedemos a la lista anidada: response.data.creditos
      console.log(response);
      const creditosList = response?.creditos || [];

      // 1. Verificamos que sea un array válido.
      if (!Array.isArray(creditosList)) {
        console.warn("La respuesta de créditos no es un array:", creditosList);
        return 0;
      }

      // 2. Usamos .reduce() para sumar todos los montos.
      //    Convertimos la cadena (c.monto) a un número flotante (parseFloat).
      console.log(creditosList);
      const sumaTotal = creditosList.reduce((acumulador, credito) => {
        const montoNumerico = parseFloat(credito.monto) || 0;
        return acumulador + montoNumerico;
      }, 0); // El 0 inicializa el acumulador // 3. Retornamos la suma total de los créditos.
    console.log(sumaTotal);

      return sumaTotal;
    } catch (error) {
      console.error("Error al obtener créditos:", error);
      throw error;
    }
  },

  // Actualizar perfil del usuario
  updateProfile: async (userId, userData) => {
    try {
      const response = await http.request(
        `/api/usuarios/${userId}`,
        "PUT",
        userData
      );
      return response;
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      throw error;
    }
  },

  // Cambiar contraseña (opcional)
  cambiarContrasena: async (contrasenaActual, nuevaContrasena) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await http.request(
        "/api/usuarios/cambiar-contrasena",
        "POST",
        {
          usuario_id: user.usuario_id,
          contrasena_actual: contrasenaActual,
          nueva_contrasena: nuevaContrasena,
        }
      );
      return response;
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      throw error;
    }
  },
};