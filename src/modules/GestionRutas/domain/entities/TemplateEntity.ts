import { ITemplateIn } from '@modules/GestionRutas/usecase/dto/in'

export default class TemplateEntity {
    nombre: string

    constructor(data: ITemplateIn) {
        this.nombre = data.nombre
    }
}
