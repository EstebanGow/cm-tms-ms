import { BadRequestSchema, RepositoryErrorSchema } from '../../../common/swagger/errors'

const TemplateSchema = {
    guardar: {
        description: 'Swagger del Template de microservicios en el backend',
        tags: ['Template'],
        body: {
            type: 'object',
            properties: {
                nombre: { type: 'string' },
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
                                example: 'Se guardó correctamente la data',
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
            500: RepositoryErrorSchema,
        },
    },
}

export default TemplateSchema
