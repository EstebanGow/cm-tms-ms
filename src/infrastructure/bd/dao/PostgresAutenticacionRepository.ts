import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresException from '@common/http/exceptions/PostgresException'
import { logger } from '@common/logger'
import { injectable } from 'inversify'
import { IDatabase, IMain } from 'pg-promise'
import { ITemplateIn } from '@modules/GestionRutas/usecase/dto/in'
import TemplateEntity from '@modules/GestionRutas/domain/entities/TemplateEntity'
import { AutenticacionRepository } from '@modules/Autenticacion/domain/repositories/AutenticacionRepository'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'

@injectable()
export default class PostgresAutenticacionRepository implements AutenticacionRepository {
    db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIESGLOBAL.dbTms)

    schema = '"public"'

    async guardar(data: ITemplateIn): Promise<TemplateEntity | null> {
        try {
            const sqlQuery = `INSERT INTO ${this.schema}."nombre_tabla" (nombre) VALUES ($1) RETURNING id, nombre`
            const result = await this.db.one(sqlQuery, data)
            return new TemplateEntity(result)
        } catch (error) {
            logger.error('TEMPLATE', 'KEY', [`Error guardando nombre: ${error.message}`])
            throw new PostgresException(500, `Error al guardar data en postgress: ${error.message}`)
        }
    }
}
