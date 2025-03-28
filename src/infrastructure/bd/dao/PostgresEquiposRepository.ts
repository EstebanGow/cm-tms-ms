import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresException from '@common/http/exceptions/PostgresException'
import { logger } from '@common/logger'
import { injectable } from 'inversify'
import { IDatabase, IMain } from 'pg-promise'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import { EquiposRepository } from '@modules/GestionRutas/domain/repositories/EquiposRepository'
import EquipoEntity from '@modules/GestionRutas/domain/entities/EquipoEntity'
import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'

@injectable()
export default class PostgresEquiposRepository implements EquiposRepository {
    db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIESGLOBAL.dbTms)

    schema = '"public"'

    async obtenerEquipos(estado: string, disponible: boolean): Promise<EquipoEntity[] | null> {
        try {
            const sqlQuery = `SELECT
                                e.id_equipo,
                                e.id_conductor,
                                e.id_vehiculo,
                                e.fecha_asignacion,
                                e.estado,
                                jsonb_build_object(
                                    'id_conductor', c.id_conductor,
                                    'nombre', c.nombre,
                                    'apellidos', c.apellidos,
                                    'telefono', c.telefono,
                                    'email', c.email,
                                    'licencia_conducir', c.licencia_conducir,
                                    'fecha_contratacion', c.fecha_contratacion,
                                    'estado', c.estado,
                                    'ultima_actualizacion', c.ultima_actualizacion
                                ) AS conductor,
                                jsonb_build_object(
                                    'id_vehiculo', v.id_vehiculo,
                                    'placa', v.placa,
                                    'modelo', v.modelo,
                                    'marca', v.marca,
                                    'referencia', v.referencia,
                                    'capacidad_kg', v.capacidad_kg,
                                    'capacidad_volumen_m3', v.capacidad_volumen_m3,
                                    'tipo', v.tipo,
                                    'estado', v.estado,
                                    'ultima_actualizacion', v.ultima_actualizacion
                                ) AS vehiculo,
                                jsonb_build_object(
                                    'id_ubicacion', u.id_ubicacion,
                                    'latitud', u.latitud,
                                    'longitud', u.longitud,
                                    'velocidad', u.velocidad,
                                    'direccion', u.direccion,
                                    'timestamp', u.timestamp
                                ) AS ubicacion
                            FROM
                                equipos e
                            LEFT JOIN
                                conductores c ON e.id_conductor = c.id_conductor
                            LEFT JOIN
                                vehiculos v ON e.id_vehiculo = v.id_vehiculo
                            LEFT JOIN
                                ubicaciones_gps u ON e.id_equipo = u.id_equipo
                            LEFT JOIN
                                optimizacion_rutas o ON e.id_equipo = o.id_equipo
                            WHERE
                                ${disponible ? 'o.estado NOT IN ($1)' : 'o.estado = $1'}`
            return await this.db.manyOrNone(sqlQuery, estado)
        } catch (error) {
            logger.error('Eventos', 'registrarEvento', [`Error guardando evento inesperado: ${error.message}`])
            throw new PostgresException(500, `Error al guardar datos de evento en postgress: ${error.message}`)
        }
    }

    async obtenerEquipoPorId(idEquipo: number): Promise<EquipoEntity | null> {
        try {
            const sqlQuery = `SELECT
                                e.id_equipo,
                                e.id_conductor,
                                e.id_vehiculo,
                                e.fecha_asignacion,
                                e.estado,
                                (EXISTS (
                                    SELECT 1 
                                    FROM optimizacion_rutas o 
                                    WHERE o.id_equipo = e.id_equipo 
                                    AND o.estado = 'Vigente'
                                )) AS ruta_activa,
                                jsonb_build_object(
                                    'id_conductor', c.id_conductor,
                                    'nombre', c.nombre,
                                    'apellidos', c.apellidos,
                                    'telefono', c.telefono,
                                    'email', c.email,
                                    'licencia_conducir', c.licencia_conducir,
                                    'fecha_contratacion', c.fecha_contratacion,
                                    'estado', c.estado,
                                    'ultima_actualizacion', c.ultima_actualizacion
                                ) AS conductor,
                                jsonb_build_object(
                                    'id_vehiculo', v.id_vehiculo,
                                    'placa', v.placa,
                                    'modelo', v.modelo,
                                    'marca', v.marca,
                                    'referencia', v.referencia,
                                    'capacidad_kg', v.capacidad_kg,
                                    'capacidad_volumen_m3', v.capacidad_volumen_m3,
                                    'tipo', v.tipo,
                                    'estado', v.estado,
                                    'ultima_actualizacion', v.ultima_actualizacion
                                ) AS vehiculo,
                                jsonb_build_object(
                                    'id_ubicacion', u.id_ubicacion,
                                    'latitud', u.latitud,
                                    'longitud', u.longitud,
                                    'velocidad', u.velocidad,
                                    'direccion', u.direccion,
                                    'timestamp', u.timestamp
                                ) AS ubicacion
                            FROM
                                equipos e
                            LEFT JOIN
                                conductores c ON e.id_conductor = c.id_conductor
                            LEFT JOIN
                                vehiculos v ON e.id_vehiculo = v.id_vehiculo
                            LEFT JOIN
                                ubicaciones_gps u ON e.id_equipo = u.id_equipo
                            LEFT JOIN
                                optimizacion_rutas o ON e.id_equipo = o.id_equipo
                            WHERE
                                e.id_equipo = $1`
            return await this.db.oneOrNone(sqlQuery, [idEquipo])
        } catch (error) {
            logger.error('Equipos', 'obtenerEquipoPorId', [`Error consultando equipo: ${error.message}`])
            throw new PostgresException(500, `Error al consultar datos de equipo en postgress: ${error.message}`)
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
