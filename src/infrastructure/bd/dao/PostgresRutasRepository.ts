import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresException from '@common/http/exceptions/PostgresException'
import { logger } from '@common/logger'
import { injectable } from 'inversify'
import { IDatabase, IMain, ITask } from 'pg-promise'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'
import moment from 'moment-timezone'
import EstadoEnvios from '@common/enum/EstadoEnvios'
import EstadosComunes from '@common/enum/EstadosComunes'
import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'

@injectable()
export default class PostgresRutasRepository implements RutasRepository {
    db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIESGLOBAL.dbTms)

    schema = '"public"'

    async guardarRutas(data: EnvioEntity[], idEquipo: number): Promise<void> {
        try {
            return await this.db.tx(async (t) => {
                const idOprimizacion = await this.guardarOptimizacion(idEquipo, t)
                await this.guardarDetallesOptimizacion(data, idOprimizacion, t)
                await this.cambiarEstadoEnvios(data, EstadoEnvios.Asignado, t)
                await this.guardarEnviosAsignados(data, idOprimizacion, idEquipo, t)
            })
        } catch (error) {
            logger.error('Rutas', 'guardarRutas', [`Error guardando rutas: ${error.message}`])
            throw new PostgresException(500, `Error al guardar datos rutas en postgress: ${error.message}`)
        }
    }

    async guardarRutasReplanificacion(
        data: EnvioEntity[],
        idEquipo: number,
        idOptimizacionAnterior: number,
    ): Promise<void> {
        try {
            return await this.db.tx(async (t) => {
                await this.cambiarEstaoOptimizacion(idOptimizacionAnterior, EstadosComunes.REEMPLAZADA)
                const idOptimizacion = await this.guardarOptimizacion(idEquipo, t)
                await this.guardarDetallesOptimizacion(data, idOptimizacion, t)
                await this.guardarEnviosAsignados(data, idOptimizacion, idEquipo, t)
            })
        } catch (error) {
            logger.error('Rutas', 'guardarRutas', [`Error guardando replanificacion rutas: ${error.message}`])
            throw new PostgresException(
                500,
                `Error al guardar datos replanificacion rutas en postgress: ${error.message}`,
            )
        }
    }

    private async guardarOptimizacion(idEquipo: number, t: ITask<IMain>): Promise<number> {
        try {
            const fechaActual = moment().tz('America/Bogota').format('Y-MM-DD')
            const fechaHoraActual = moment().tz('America/Bogota').format('Y-MM-DD HH:mm:ss')

            const sqlQuery = `INSERT INTO public.optimizacion_rutas
                    (id_equipo, fecha_optimizacion, timestamp_optimizacion, estado, tiempo_total_estimado_minutos, distancia_total_km, consumo_combustible_estimado_litros)
                    VALUES($1, $2, $3, 'Vigente'::estado_optimizacion, 0, 0, 0) returning  id_optimizacion`
            return await t.one(sqlQuery, [idEquipo, fechaActual, fechaHoraActual], (res) => res.id_optimizacion)
        } catch (error) {
            logger.error('Rutas', 'guardarOptimizacion', [`Error guardando ruta optimizada: ${error.message}`])
            throw new PostgresException(500, `Error al guardar data de ruta optimizada en postgress: ${error.message}`)
        }
    }

    private async guardarEnviosAsignados(
        envios: EnvioEntity[],
        idOptimizacion: number,
        idEquipo: number,
        t: ITask<IMain>,
    ): Promise<void> {
        try {
            const queries = envios.map((envio) => {
                return t.none(
                    `
                    INSERT INTO public.asignacion_envios
                        (id_envio, id_equipo, id_optimizacion, timestamp_asignacion, estado)
                        VALUES($1, $2, $3, CURRENT_TIMESTAMP, 'Asignado'::estado_asignacion);
                `,
                    [envio.id_envio, idEquipo, idOptimizacion],
                )
            })
            await t.batch(queries)
        } catch (error) {
            logger.error('Rutas', 'guardarEnviosAsignados', [
                `Error guardando asignacion ruta optimizada: ${error.message}`,
            ])
            throw new PostgresException(
                500,
                `Error al guardar data de asignacion ruta optimizada en postgress: ${error.message}`,
            )
        }
    }

    private async guardarDetallesOptimizacion(
        envios: EnvioEntity[],
        idOptimizacion: number,
        t: ITask<IMain>,
    ): Promise<void> {
        try {
            const queries = envios.map((envio, index) => {
                const horaEstimada = moment()
                    .tz('America/Bogota')
                    .add((index + 1) * 15, 'minutes')
                    .format('Y-MM-DD HH:mm:ss')

                const tiempoSiguienteParada = envio.tiempo_estimado_minutos || 15
                const distanciaSiguienteParada = envio.distancia_km || 5

                return t.none(
                    `
                    INSERT INTO public.detalles_optimizacion (
                        id_optimizacion, 
                        id_envio, 
                        orden_secuencia,
                        hora_estimada_llegada,
                        tiempo_estimado_siguiente_parada_minutos,
                        distancia_siguiente_parada_km
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `,
                    [
                        idOptimizacion,
                        envio.id_envio,
                        envio.orden_secuencia || index + 1,
                        horaEstimada,
                        tiempoSiguienteParada,
                        distanciaSiguienteParada,
                    ],
                )
            })
            await t.batch(queries)
        } catch (error) {
            logger.error('Rutas', 'guardarDetallesOptimizacion', [
                `Error guardando detalles de optimización: ${error.message}`,
            ])
            throw new PostgresException(500, `Error al guardar detalles de optimización en postgres: ${error.message}`)
        }
    }

    private async cambiarEstadoEnvios(envios: EnvioEntity[], estado: string, t: ITask<IMain>): Promise<void> {
        try {
            const queries = envios.map((envio) => {
                return t.none(
                    `
                    UPDATE envios SET estado = $1 WHERE id_envio = $2
                `,
                    [estado, envio.id_envio],
                )
            })
            await t.batch(queries)
        } catch (error) {
            logger.error('Rutas', 'cambiarEstadoEnvios', [`Error actualizando estado de envio: ${error.message}`])
            throw new PostgresException(500, `Error al actualizar estado de envio en postgres: ${error.message}`)
        }
    }

    private async cambiarEstaoOptimizacion(idOptimizacion: number, estado: string): Promise<void> {
        try {
            const sqlQuery = `UPDATE optimizacion_rutas SET estado = $1 WHERE id_optimizacion = $2`
            await this.db.oneOrNone(sqlQuery, [estado, idOptimizacion])
        } catch (error) {
            logger.error('Rutas', 'cambiarEstadoEnvios', [
                `Error actualizando estado de optimizacion: ${error.message}`,
            ])
            throw new PostgresException(500, `Error al actualizar estado de optimizacion en postgres: ${error.message}`)
        }
    }

    async consultarRutaActivaEquipo(idEquipo: number, ciudad: string): Promise<OptimizacionRutaEntity | null> {
        try {
            const sqlQuery = `SELECT 
                                opt.id_optimizacion, 
                                opt.id_equipo, 
                                opt.fecha_optimizacion, 
                                opt.timestamp_optimizacion, 
                                opt.estado, 
                                opt.tiempo_total_estimado_minutos, 
                                opt.distancia_total_km, 
                                opt.consumo_combustible_estimado_litros,
                                EXISTS (
                                    SELECT 1
                                    FROM eventos_inesperados ei
                                    WHERE ei.fecha_inicio > opt.timestamp_optimizacion and ei.estado = $3
                                    and ei.ciudad = $4
                                ) AS nuevo_evento
                            FROM 
                                optimizacion_rutas opt
                            WHERE 
                                opt.id_equipo = $1 
                                AND opt.estado = $2`
            return await this.db.oneOrNone(sqlQuery, [idEquipo, EstadosComunes.VIGENTE, EstadosComunes.ACTIVO, ciudad])
        } catch (error) {
            logger.error('Rutas', 'consultarRutaActivaEquipo', [`Error consultando ruta activa: ${error.message}`])
            throw new PostgresException(500, `Error al consultar ruta activa en postgres: ${error.message}`)
        }
    }

    async obtenerRutasEquipo(idEquipo: number): Promise<OptimizacionRutaEntity | null> {
        try {
            const sqlQuery = `WITH detalles_con_direccion AS (
                                SELECT 
                                    det_opt.id_optimizacion,
                                    det_opt.id_envio,
                                    det_opt.orden_secuencia,
                                    det_opt.hora_estimada_llegada,
                                    det_opt.tiempo_estimado_siguiente_parada_minutos,
                                    det_opt.distancia_siguiente_parada_km,
                                    dir.id_direccion,
                                    dir.nombre_contacto,
                                    dir.telefono_contacto,
                                    dir.calle,
                                    dir.numero,
                                    dir.ciudad,
                                    dir.estado AS estado_direccion,
                                    dir.codigo_postal,
                                    dir.pais,
                                    dir.latitud,
                                    dir.longitud,
                                    dir.instrucciones_entrega
                                FROM detalles_optimizacion det_opt
                                JOIN envios env ON det_opt.id_envio = env.id_envio
                                JOIN direcciones dir ON env.id_direccion_destino = dir.id_direccion
                            )

                            SELECT 
                                opt_ruta.id_optimizacion,
                                opt_ruta.id_equipo,
                                opt_ruta.fecha_optimizacion,
                                opt_ruta.estado,
                                jsonb_agg(
                                    jsonb_build_object(
                                        'id_envio', dcd.id_envio,
                                        'orden_secuencia', dcd.orden_secuencia,
                                        'hora_estimada_llegada', dcd.hora_estimada_llegada,
                                        'tiempo_estimado_siguiente_parada_minutos', dcd.tiempo_estimado_siguiente_parada_minutos,
                                        'distancia_siguiente_parada_km', dcd.distancia_siguiente_parada_km,
                                        'direccion', jsonb_build_object(
                                            'id_direccion', dcd.id_direccion,
                                            'nombre_contacto', dcd.nombre_contacto,
                                            'telefono_contacto', dcd.telefono_contacto,
                                            'calle', dcd.calle,
                                            'numero', dcd.numero,
                                            'ciudad', dcd.ciudad,
                                            'estado', dcd.estado_direccion,
                                            'codigo_postal', dcd.codigo_postal,
                                            'pais', dcd.pais,
                                            'latitud', dcd.latitud,
                                            'longitud', dcd.longitud,
                                            'instrucciones_entrega', dcd.instrucciones_entrega
                                        )
                                    )
                                ) AS detalles_optimizacion,
                                jsonb_build_object(
                                    'id_equipo', eq.id_equipo,
                                    'id_conductor', eq.id_conductor,
                                    'id_vehiculo', eq.id_vehiculo,
                                    'fecha_asignacion', eq.fecha_asignacion,
                                    'estado', eq.estado
                                ) AS info_equipo
                            FROM optimizacion_rutas opt_ruta
                            JOIN detalles_con_direccion dcd ON opt_ruta.id_optimizacion = dcd.id_optimizacion
                            JOIN equipos eq ON opt_ruta.id_equipo = eq.id_equipo
                            WHERE opt_ruta.estado = 'Vigente' and opt_ruta.id_equipo = $1
                            GROUP BY opt_ruta.id_optimizacion, opt_ruta.id_equipo, opt_ruta.fecha_optimizacion, opt_ruta.estado, 
                                eq.id_equipo, eq.id_conductor, eq.id_vehiculo, eq.fecha_asignacion, eq.estado;`
            return await this.db.oneOrNone(sqlQuery, [idEquipo])
        } catch (error) {
            logger.error('Eventos', 'registrarEvento', [`Error guardando evento inesperado: ${error.message}`])
            throw new PostgresException(500, `Error al guardar datos de evento en postgress: ${error.message}`)
        }
    }
}
