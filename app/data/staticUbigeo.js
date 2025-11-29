// app/data/staticUbigeo.js

export const ubigeoData = {
    departamentos: [
        { id: 1, nombre: "Arequipa" },
        { id: 2, nombre: "Lima" },
        { id: 3, nombre: "Tacna" }
    ],
    provincias: [
        // Arequipa
        { id: 1, departamento_id: 1, nombre: "Arequipa" },
        { id: 2, departamento_id: 1, nombre: "Camaná" },
        // ... resto de Arequipa ...
        // Lima
        { id: 9, departamento_id: 2, nombre: "Lima" },
        { id: 10, departamento_id: 2, nombre: "Barranca" },
        // ... resto de Lima ...
        // Tacna
        { id: 19, departamento_id: 3, nombre: "Tacna" },
        { id: 20, departamento_id: 3, nombre: "Candarave" },
        { id: 21, departamento_id: 3, nombre: "Jorge Basadre" },
        { id: 22, departamento_id: 3, nombre: "Tarata" }
    ],
    distritos: [
        // EJEMPLO: Tacna (Provincia 19)
        // IDs basados en tu SQL aproximado (ajusta los IDs si tu BD real tiene otros)
        { id: 60, provincia_id: 19, nombre: "Tacna" },
        { id: 61, provincia_id: 19, nombre: "Alto de la Alianza" },
        { id: 62, provincia_id: 19, nombre: "Calana" },
        { id: 63, provincia_id: 19, nombre: "Ciudad Nueva" },
        { id: 64, provincia_id: 19, nombre: "Inclán" },
        { id: 65, provincia_id: 19, nombre: "Pocollay" }, // <--- AQUÍ ESTÁ TU ID 65
        { id: 66, provincia_id: 19, nombre: "Pachía" },
        { id: 67, provincia_id: 19, nombre: "Palca" },
        { id: 68, provincia_id: 19, nombre: "Sama" },
        { id: 69, provincia_id: 19, nombre: "Cnel. Gregorio Albarracín" },
        
        // EJEMPLO: Lima (Provincia 9)
        { id: 30, provincia_id: 9, nombre: "Cercado de Lima" },
        { id: 31, provincia_id: 9, nombre: "Miraflores" },
        { id: 32, provincia_id: 9, nombre: "San Isidro" },
        
        // EJEMPLO: Arequipa (Provincia 1)
        { id: 10, provincia_id: 1, nombre: "Arequipa" },
        { id: 11, provincia_id: 1, nombre: "Cayma" },
        { id: 12, provincia_id: 1, nombre: "Yanahuara" }
    ]
};