import { ITipoEvento } from '../models/ITipoEvento'

export default class TipoEventoEntity {
    nombre: string

    descripcion: string

    impacto_estimado: string

    constructor(data: ITipoEvento) {
        this.nombre = data.nombre
        this.descripcion = data.descripcion
        this.impacto_estimado = data.impacto_estimado
    }
}
