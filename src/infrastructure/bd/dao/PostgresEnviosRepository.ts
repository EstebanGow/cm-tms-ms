import 'reflect-metadata'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresException from '@common/http/exceptions/PostgresException'
import { logger } from '@common/logger'
import { injectable } from 'inversify'
import { IDatabase, IMain } from 'pg-promise'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import { EnviosRepository } from '@modules/GestionRutas/domain/repositories/EnviosRepository'
import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'

@injectable()
export default class PostgresEnviosRepository implements EnviosRepository {
    db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPESDEPENDENCIESGLOBAL.dbTms)

    async consultarEnvios(estado: string): Promise<EnvioEntity[] | null> {
        try {
            const sqlQuery = `SELECT 
                                e.id_envio,
                                e.id_cliente,
                                e.id_acuerdo_servicio,
                                e.id_direccion_destino,
                                e.fecha_creacion,
                                e.fecha_entrega_programada,
                                e.fecha_entrega_real,
                                e.peso_kg,
                                e.volumen_m3,
                                e.descripcion,
                                e.estado,
                                json_build_object(
                                    'id_acuerdo_servicio', a.id_acuerdo_servicio,
                                    'id_cliente', a.id_cliente,
                                    'nombre', a.nombre,
                                    'tiempo_entrega_horas', a.tiempo_entrega_horas,
                                    'prioridad', a.prioridad,
                                    'penalizacion_porcentaje', a.penalizacion_porcentaje,
                                    'descripcion', a.descripcion
                                ) AS acuerdo_servicio,
                                json_build_object(
                                    'id_direccion', d.id_direccion,
                                    'id_cliente', d.id_cliente,
                                    'nombre_contacto', d.nombre_contacto,
                                    'telefono_contacto', d.telefono_contacto,
                                    'calle', d.calle,
                                    'numero', d.numero,
                                    'ciudad', d.ciudad,
                                    'estado', d.estado,
                                    'codigo_postal', d.codigo_postal,
                                    'pais', d.pais,
                                    'latitud', d.latitud,
                                    'longitud', d.longitud,
                                    'instrucciones_entrega', d.instrucciones_entrega,
                                    'tipo', d.tipo
                                ) AS direccion_destino
                            FROM 
                                envios e
                            LEFT JOIN acuerdo_servicio a ON e.id_acuerdo_servicio = a.id_acuerdo_servicio
                            LEFT JOIN direcciones d ON e.id_direccion_destino = d.id_direccion
                            WHERE e.estado = $1;`
            const results = await this.db.manyOrNone(sqlQuery, estado)

            if (!results || results.length === 0) {
                return []
            }

            return results.map((result) => new EnvioEntity(result))
        } catch (error) {
            logger.error('Envios', 'obtenerEnvios', [`Error consultando envios: ${error.message}`])
            throw new PostgresException(500, `Error al consultar envios en postgress: ${error.message}`)
        }
    }
}
