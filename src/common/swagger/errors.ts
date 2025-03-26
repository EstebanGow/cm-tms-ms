export const BadRequestSchema = {
    description: 'Bad Request',
    type: 'object',
    properties: {
        isError: { type: 'boolean', example: true },
        message: { type: 'string', example: 'example is required' },
        cause: { type: ['string', 'null'], example: 'Error: example is required' },
        stack: { type: ['string', 'null'], example: 'Error o null' },
        statusCode: { type: 'number', example: 400 },
        code: { type: 'string', example: 'BAD_REQUEST' },
        defaultMessage: { type: 'string', example: 'Error handler log' },
    },
}

export const RepositoryErrorSchema = {
    description: 'Repository Error',
    type: 'object',
    properties: {
        isError: { type: 'boolean', example: true },
        message: { type: 'string', example: 'example is required' },
        cause: { type: ['string', 'null'], example: 'REPOSITORY_ERROR' },
        stack: { type: ['string', 'null'], example: 'Error o null' },
        statusCode: { type: 'number', example: 500 },
        code: { type: 'string', example: 'POSTGRES_ERROR' },
        defaultMessage: { type: 'string', example: 'Error handler log' },
    },
}

export const AutenticacionErrorSchema = {
    description: 'Bad Request',
    type: 'object',
    properties: {
        isError: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Error de autenticación' },
        cause: { type: ['string', 'null'], example: 'Error de autenticación' },
        stack: { type: ['string', 'null'], example: 'Error o null' },
        statusCode: { type: 'number', example: 401 },
        code: { type: 'string', example: '401' },
        defaultMessage: { type: 'string', example: 'Error handler log' },
    },
}
