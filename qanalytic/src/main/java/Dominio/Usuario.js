import Datos from './Datos.js';

class Usuario {
    constructor(nombre) {
        this.nombre = nombre;
        this.preguntasTotales = [new Datos(), new Datos(), new Datos(), new Datos()];
    }
}
export default Usuario;
