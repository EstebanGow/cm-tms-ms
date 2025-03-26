import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { AutenticacionRepository } from '@modules/Autenticacion/domain/repositories/AutenticacionRepository'
import TYPESDEPENDENCIES from '@modules/Autenticacion/dependencies/TypesDependencies'
import TokenService from '@infrastructure/services/TokenService'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import UsuarioAutenticacionEntity from '@modules/Autenticacion/domain/entities/UsuarioAutenticacionEntity'
import CustomError from '@common/util/CustomError'
import { IAutenticacionIn } from '../dto/in'

export default class AutenticacionUseCase {
    private autenticacionRepository = DEPENDENCY_CONTAINER.get<AutenticacionRepository>(
        TYPESDEPENDENCIES.AutenticacionRepository,
    )

    private tokenService = DEPENDENCY_CONTAINER.get<TokenService>(TYPESDEPENDENCIESGLOBAL.TokenService)

    async execute(data: IAutenticacionIn): Promise<string | null> {
        const usuario = await this.validarUsuario(data)
        const token = this.tokenService.generarToken(usuario)
        return token
    }

    private async validarUsuario(data: IAutenticacionIn): Promise<UsuarioAutenticacionEntity> {
        const usuario = await this.autenticacionRepository.obtenerUsuario(data)
        if (usuario) return usuario
        throw new CustomError('Error de autenticacion', 401, true)
    }
}
