import { AutenticacionErrorSchema, BadRequestSchema, RepositoryErrorSchema } from '../../../common/swagger/errors'

const AutenticacionSchema = {
    autenticar: {
        description: 'Servicio para autenticacion de usuario y obtención de token',
        tags: ['Autenticacion'],
        body: {
            type: 'object',
            properties: {
                usuario: { type: 'string' },
                clave: { type: 'string' },
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
                                example: 'Autenticacion exitosa',
                            },
                            token: {
                                type: 'string',
                                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ',
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

export default AutenticacionSchema
