import { AutenticacionErrorSchema, BadRequestSchema, RepositoryErrorSchema } from '../../../common/swagger/errors'

const EquiposSchema = {
    registrar: {
        description: 'Registrar evento inesperado en ruta',
        tags: ['Eventos'],
        body: {
            type: 'object',
            properties: {
                idTipoEvento: { type: 'number' },
                latitud: { type: 'number' },
                longitud: { type: 'number' },
                radioAfectacionKm: { type: 'number' },
                descripion: { type: 'string' },
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
