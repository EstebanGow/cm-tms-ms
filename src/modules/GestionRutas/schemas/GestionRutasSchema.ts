import { AutenticacionErrorSchema, BadRequestSchema, RepositoryErrorSchema } from '../../../common/swagger/errors'

const GestionRutasSchema = {
    planificar: {
        description: 'Planificar las rutas para un equipo',
        tags: ['GestionRutas'],
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
                                example: 'Se planificaron correctamente las rutas',
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
    replanificar: {
        description: 'Replanificar las rutas para un equipo',
        tags: ['GestionRutas'],
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
                                example: 'Se replanificaron correctamente las rutas',
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
    guardarPlanificacion: {
        description: 'Planificar las rutas para un equipo',
        tags: ['GestionRutas'],
        body: {
            type: 'object',
            properties: {
                message: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'string',
                        },
                        messageId: {
                            type: 'string',
                        },
                        message_id: {
                            type: 'string',
                        },
                        publishTime: {
                            type: 'string',
                        },
                        publish_time: {
                            type: 'string',
                        },
                    },
                },
                subscription: {
                    type: 'string',
                },
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
                                example: 'Se planificaron correctamente las rutas',
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
    guardarReplanificacion: {
        description: 'Planificar las rutas para un equipo',
        tags: ['GestionRutas'],
        body: {
            type: 'object',
            properties: {
                message: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'string',
                        },
                        messageId: {
                            type: 'string',
                        },
                        message_id: {
                            type: 'string',
                        },
                        publishTime: {
                            type: 'string',
                        },
                        publish_time: {
                            type: 'string',
                        },
                    },
                },
                subscription: {
                    type: 'string',
                },
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
                                example: 'Se replanificaron correctamente las rutas',
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

export default GestionRutasSchema
