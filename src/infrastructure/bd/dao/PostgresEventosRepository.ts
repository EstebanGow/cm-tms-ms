import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresException from '@common/http/exceptions/PostgresException'
import { logger } from '@common/logger'
import { injectable } from 'inversify'
import { IDatabase, IMain } from 'pg-promise'
import { EventosRepository } from '@modules/Eventos/domain/repositories/EventosRepository'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import { IRegistrarEventoIn } from '@modules/Eventos/usecase/dto/in'
import TipoEventoEntity from '@modules/Eventos/domain/entities/TipoEventoEntity'

@injectable()
export default class PostgresEventosRepository implements EventosRepository {
    db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIESGLOBAL.dbTms)

    schema = '"public"'

    async registrarEvento(data: IRegistrarEventoIn): Promise<void> {
        try {
            const sqlQuery = `INSERT INTO eventos_inesperados (id_tipo_evento, descripcion, latitud, longitud, radio_afectacion_km)
             VALUES ($1,$2,$3,$4,$5)`
            await this.db.none(sqlQuery, [
                data.id_tipo_evento,
                data.descripcion,
                data.latitud,
                data.longitud,
                data.radio_afectacion_km,
            ])
        } catch (error) {
            logger.error('Eventos', 'registrarEvento', [`Error guardando evento inesperado: ${error.message}`])
            throw new PostgresException(500, `Error al guardar datos de evento en postgress: ${error.message}`)
        }
    }

    async consultarTipoEvento(idTIpoEvento: number): Promise<TipoEventoEntity | null> {
        try {
            const sqlQuery = `SELECT  nombre, descripcion, impacto_estimado
                                FROM tipos_eventos WHERE id_tipo_evento = $1;`
            const resultadoConsulta = await this.db.oneOrNone(sqlQuery, [idTIpoEvento])
            if (resultadoConsulta) {
                return resultadoConsulta
            }
            return null
        } catch (error) {
            logger.error('Eventos', 'consultarTipoEvento', [`Error al consultar tipo de evento: ${error.message}`])
            throw new PostgresException(500, `Error al consultar tipo evento en postgress: ${error.message}`)
        }
    }
}
