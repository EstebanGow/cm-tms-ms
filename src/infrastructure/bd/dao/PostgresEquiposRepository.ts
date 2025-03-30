import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresException from '@common/http/exceptions/PostgresException'
import { logger } from '@common/logger'
import { injectable } from 'inversify'
import { IDatabase, IMain } from 'pg-promise'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import { EquiposRepository } from '@modules/GestionRutas/domain/repositories/EquiposRepository'
import EquipoEntity from '@modules/GestionRutas/domain/entities/EquipoEntity'

@injectable()
export default class PostgresEquiposRepository implements EquiposRepository {
    db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIESGLOBAL.dbTms)

    schema = '"public"'

    async obtenerEquipoPorId(idEquipo: number): Promise<EquipoEntity | null> {
        try {
            const sqlQuery = `SELECT
                                e.id_equipo,
                                e.id_conductor,
                                e.id_vehiculo,
                                e.fecha_asignacion,
                                e.estado,
                               (
                                    SELECT o.id_optimizacion
                                    FROM optimizacion_rutas o
                                    WHERE o.id_equipo = e.id_equipo
                                    AND o.estado = 'Vigente'
                                    LIMIT 1
                                ) AS ruta_activa,
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
                                    'timestamp', u.timestamp,
                                    'ciudad', u.ciudad
                                ) AS ubicacion
                            FROM
                                equipos e
                            LEFT JOIN
                                conductores c ON e.id_conductor = c.id_conductor
                            LEFT JOIN
                                vehiculos v ON e.id_vehiculo = v.id_vehiculo
                            LEFT JOIN
                                ubicaciones_gps u ON e.id_equipo = u.id_equipo
                            WHERE
                                e.id_equipo = $1`
            return await this.db.oneOrNone(sqlQuery, [idEquipo])
        } catch (error) {
            logger.error('Equipos', 'obtenerEquipoPorId', [`Error consultando equipo: ${error.message}`])
            throw new PostgresException(500, `Error al consultar datos de equipo en postgress: ${error.message}`)
        }
    }
}
