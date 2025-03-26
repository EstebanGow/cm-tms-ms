import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresException from '@common/http/exceptions/PostgresException'
import { logger } from '@common/logger'
import { injectable } from 'inversify'
import { IDatabase, IMain } from 'pg-promise'
import { AutenticacionRepository } from '@modules/Autenticacion/domain/repositories/AutenticacionRepository'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import UsuarioAutenticacionEntity from '@modules/Autenticacion/domain/entities/UsuarioAutenticacionEntity'
import { IAutenticacionIn } from '@modules/Autenticacion/usecase/dto/in'
import EstadosComunes from '@common/enum/EstadosComunes'

@injectable()
export default class PostgresAutenticacionRepository implements AutenticacionRepository {
    db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIESGLOBAL.dbTms)

    async obtenerUsuario(data: IAutenticacionIn): Promise<UsuarioAutenticacionEntity | null> {
        try {
            const sqlQuery = `SELECT usuario, clave, estado FROM usuarios_autenticacion WHERE usuario = $1 AND clave = $2 AND estado = $3`
            const result = await this.db.oneOrNone(sqlQuery, [data.usuario, data.clave, EstadosComunes.ACTIVO])
            if (!result) return null
            return new UsuarioAutenticacionEntity(result)
        } catch (error) {
            logger.error('Autenticacion', 'obtenerUsuario', [`Error consultando usuario: ${error.message}`])
            throw new PostgresException(500, `Error al consultar usuario en postgress: ${error.message}`)
        }
    }
}
