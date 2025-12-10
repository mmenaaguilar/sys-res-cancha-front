// app/services/user.service.js
import http from "./httpClient.js";

export const userService = {
    // Obtener créditos del usuario
    getCreditos: async () => {
        try {
            // Obtener el usuario del localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.usuario_id) {
                throw new Error("Usuario no autenticado");
            }

            const response = await http.request('/api/usuarios/creditos', 'POST', {
                usuario_id: user.usuario_id  // ✅ Enviar el ID correcto
            });
            return response.creditos || 0;
        } catch (error) {
            console.error("Error al obtener créditos:", error);
            throw error;
        }
    },

    // Actualizar perfil del usuario
    updateProfile: async (userId, userData) => {
        try {
            const response = await http.request(`/api/usuarios/${userId}`, 'PUT', userData);
            return response;
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            throw error;
        }
    },

    // Cambiar contraseña (opcional)
    cambiarContrasena: async (contrasenaActual, nuevaContrasena) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await http.request('/api/usuarios/cambiar-contrasena', 'POST', {
                usuario_id: user.usuario_id,
                contrasena_actual: contrasenaActual,
                nueva_contrasena: nuevaContrasena
            });
            return response;
        } catch (error) {
            console.error("Error al cambiar contraseña:", error);
            throw error;
        }
    }
};