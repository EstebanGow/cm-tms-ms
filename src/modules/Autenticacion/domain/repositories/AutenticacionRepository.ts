import { IAutenticacionIn } from '@modules/Autenticacion/usecase/dto/in'
import UsuarioAutenticacionEntity from '../entities/UsuarioAutenticacionEntity'

export interface AutenticacionRepository {
    obtenerUsuario(data: IAutenticacionIn): Promise<UsuarioAutenticacionEntity | null>
}
