import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresException from '@common/http/exceptions/PostgresException'
import { logger } from '@common/logger'
import { injectable } from 'inversify'
import { IDatabase, IMain } from 'pg-promise'
import { EventosRepository } from '@modules/Eventos/domain/repositories/EventosRepository'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import TipoEventoEntity from '@modules/Eventos/domain/entities/TipoEventoEntity'
import moment from 'moment-timezone'
import { IRegistrarEventoIn } from '@modules/Eventos/usecase/dto/in'
import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'

@injectable()
export default class PostgresEventosRepository implements EventosRepository {
    db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIESGLOBAL.dbTms)

    schema = '"public"'

    async registrarEvento(data: IRegistrarEventoIn): Promise<void> {
        try {
            const fechaHoraActual = moment().tz('America/Bogota').format('Y-MM-DD HH:mm:ss')
            const sqlQuery = `INSERT INTO eventos_inesperados (id_tipo_evento, descripcion, latitud, longitud, radio_afectacion_km, fecha_inicio)
             VALUES ($1,$2,$3,$4,$5, $6)`
            await this.db.none(sqlQuery, [
                data.idTipoEvento,
                data.descripcion,
                data.latitud,
                data.longitud,
                data.radioAfectacionKm,
                fechaHoraActual,
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

    async consultarEventosInesperados(latitud: number, longitud: number): Promise<EventoInesperadoEntity | null> {
        try {
            const sqlQuery = `SELECT id_evento, id_tipo_evento, descripcion, latitud, longitud, radio_afectacion_km, fecha_inicio, fecha_fin, estado
                                FROM public.eventos_inesperados
                                WHERE latitud = $1 AND longitud = $2;`
            const resultadoConsulta = await this.db.oneOrNone(sqlQuery, [latitud, longitud])
            if (resultadoConsulta) {
                return resultadoConsulta
            }
            return null
        } catch (error) {
            logger.error('Eventos', 'consultarEventosInesperados', [`Error al consultar eventos: ${error.message}`])
            throw new PostgresException(500, `Error al consultar eventos en postgress: ${error.message}`)
        }
    }

    async consultarClima(latitud: number, longitud: number): Promise<CondicionClimaEntity | null> {
        try {
            const sqlQuery = `SELECT id_condicion_clima, latitud, longitud, condicion, temperatura_c, humedad_porcentaje, velocidad_viento_kmh, visibilidad_km, "timestamp"
                                FROM public.condiciones_clima
                                WHERE latitud = $1 AND longitud = $2;`
            const resultadoConsulta = await this.db.oneOrNone(sqlQuery, [latitud, longitud])
            if (resultadoConsulta) {
                return resultadoConsulta
            }
            return null
        } catch (error) {
            logger.error('Eventos', 'consultarClima', [`Error al consultar clima: ${error.message}`])
            throw new PostgresException(500, `Error al consultar clima en postgress: ${error.message}`)
        }
    }

    async consultarTrafico(latitud: number, longitud: number): Promise<CondicionTraficoEntity | null> {
        try {
            const sqlQuery = `SELECT id_condicion_trafico, latitud_inicio, longitud_inicio, latitud_fin, longitud_fin, nivel_congestion, velocidad_promedio_kmh, tiempo_estimado_minutos, "timestamp"
                                FROM public.condiciones_trafico
                                WHERE latitud = $1 AND longitud = $2;`
            const resultadoConsulta = await this.db.oneOrNone(sqlQuery, [latitud, longitud])
            if (resultadoConsulta) {
                return resultadoConsulta
            }
            return null
        } catch (error) {
            logger.error('Eventos', 'consultarClima', [`Error al consultar clima: ${error.message}`])
            throw new PostgresException(500, `Error al consultar clima en postgress: ${error.message}`)
        }
    }
}
