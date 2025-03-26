import { ITemplateIn } from '@modules/GestionRutas/usecase/dto/in'
import TemplateEntity from '../entities/TemplateEntity'

export interface AutenticacionRepository {
    guardar(data: ITemplateIn): Promise<TemplateEntity | null>
}
