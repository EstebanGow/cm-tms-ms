import { AutenticacionErrorSchema, BadRequestSchema, RepositoryErrorSchema } from '../../../common/swagger/errors'

const EquiposSchema = {
    consultarRutaEquipo: {
        description: 'Consultar equipo y su ruta',
        tags: ['Equipos'],
        params: {
            type: 'object',
            properties: {
                idEquipo: { type: 'number' },
            },
        },
        response: {
            200: {
                description: 'Succesful response',
                type: 'object',
                properties: {
                    isError: { type: 'boolean', example: false },
                    data: {
                        type: 'object',
                        properties: {
                            ok: {
                                type: 'string',
                                example: 'Se registro el evento de forma exitosa',
                            },
                            data: {
                                type: 'object',
                                properties: {
                                    id_optimizacion: { type: 'number', example: 47 },
                                    id_equipo: { type: 'number', example: 1 },
                                    fecha_optimizacion: {
                                        type: 'string',
                                        format: 'date-time',
                                        example: '2025-03-31T00:00:00.000Z',
                                    },
                                    estado: { type: 'string', example: 'Vigente' },
                                    detalles_optimizacion: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id_envio: { type: 'number', example: 4 },
                                                direccion: {
                                                    type: 'object',
                                                    properties: {
                                                        pais: { type: 'string', example: 'Colombia' },
                                                        calle: { type: 'string', example: 'Calle 65' },
                                                        ciudad: { type: 'string', example: 'Medellín' },
                                                        estado: { type: 'string', example: 'Antioquia' },
                                                        numero: { type: 'string', example: '65 77' },
                                                        latitud: { type: 'number', example: 6.24234151 },
                                                        longitud: { type: 'number', example: -75.55977836 },
                                                        id_direccion: { type: 'number', example: 2 },
                                                        codigo_postal: { type: 'string', example: '050001' },
                                                        nombre_contacto: { type: 'string', example: 'Carlos Castro' },
                                                        telefono_contacto: { type: 'string', example: '3122938444' },
                                                        instrucciones_entrega: {
                                                            type: 'string',
                                                            example: 'Entregar en el primer piso',
                                                        },
                                                    },
                                                },
                                                orden_secuencia: { type: 'number', example: 1 },
                                                hora_estimada_llegada: {
                                                    type: 'string',
                                                    format: 'date-time',
                                                    example: '2025-03-31T01:02:12',
                                                },
                                                distancia_siguiente_parada_km: { type: 'number', example: 5 },
                                                tiempo_estimado_siguiente_parada_minutos: {
                                                    type: 'number',
                                                    example: 15,
                                                },
                                            },
                                        },
                                    },
                                    info_equipo: {
                                        type: 'object',
                                        properties: {
                                            estado: { type: 'string', example: 'Activo' },
                                            id_equipo: { type: 'number', example: 1 },
                                            id_vehiculo: { type: 'number', example: 1 },
                                            id_conductor: { type: 'number', example: 2 },
                                            fecha_asignacion: { type: 'string', format: 'date', example: '2025-03-26' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time',
                        example: '2030-07-21T17:32:28Z',
                    },
                },
            },
            400: BadRequestSchema,
            401: AutenticacionErrorSchema,
            500: RepositoryErrorSchema,
        },
    },
}

export default EquiposSchema
