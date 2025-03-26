import { FastifyDynamicSwaggerOptions } from '@fastify/swagger'

export const swaggerConfig: FastifyDynamicSwaggerOptions = {
    openapi: {
        info: {
            title: 'Microservice Template',
            description: 'Este es el template para microservicios de Coordinadora Mercantil S.A',
            version: '0.1.0',
            contact: {
                name: 'Coordinadora Mercantil S.A',
                url: 'https://www.coordinadora.com/',
                email: 'it@coordinadora.com',
            },
        },
    },
}

export default swaggerConfig
