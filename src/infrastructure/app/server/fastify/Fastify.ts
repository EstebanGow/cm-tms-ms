import { fastify, FastifyInstance, FastifyReply, FastifyRequest, FastifyPluginAsync, FastifyError } from 'fastify'
import { IModule } from '@common/modules/IModule'
import { HTTPMETODO } from '@common/modules/Ruta'
import { randomBytes } from 'crypto'
import CustomError from '@common/util/CustomError'
import { logger } from '@common/logger/Logger'
import ENV from '@common/envs/Envs'
import swagger from '@fastify/swagger'
import swaggerConfig from '@common/swagger/swaggerConfig'
import fastifySwaggerUi from '@fastify/swagger-ui'
import cors from '@fastify/cors'
import AuthenticationMiddleware from '@infrastructure/app/middleware/AuthenticationMiddleware'
import { IServer } from '../IServer'
import { DefaultErrorModel } from './DefaultError'

const swaggerUiOptions = {
    routePrefix: `/${ENV.DOMAIN}/${ENV.SERVICE_NAME}/${ENV.VERSION}/docs`,
    exposeRoute: true,
}

export default class FastifyServer implements IServer {
    port: number = +ENV.PORT

    app: FastifyInstance

    routes: Record<string, string>[] = []

    constructor() {
        this.app = fastify({
            genReqId: (_) => randomBytes(20).toString('hex'),
        })
        this.app.register(cors)
        this.app.register(swagger, swaggerConfig)
        this.app.register(fastifySwaggerUi, swaggerUiOptions)
        this.printRoutes()
        this.errorHandler()
        this.registerAuthMiddleware()
    }

    private registerAuthMiddleware = (): void => {
        this.app.addHook('onRequest', async (request) => {
            if (!request.url.includes(`v1/docs`) && !request.url.includes(`v1/autenticacion/`)) {
                await AuthenticationMiddleware(request)
            }
        })
    }

    private printRoutes = (): void => {
        this.app.addHook('onRoute', (r): void => {
            this.routes.push({ url: r.url, method: r.method.toString() })
        })
    }

    private errorHandler = () => {
        this.app.setErrorHandler((error, _request, reply) => {
            const typeError =
                error instanceof CustomError ? this.buildResponseError(error) : this.buildDefaultError(error)
            const statusCode = error?.statusCode && +error.statusCode > 0 ? error.statusCode : 500
            reply.status(statusCode).send(typeError)
        })
    }

    buildResponseError(error: CustomError): DefaultErrorModel {
        return {
            statusCode: error.statusCode,
            message: error?.message,
            stack: ENV.ENV === 'local' ? error?.stack : '',
            defaultMessage: 'Error handler log',
            isError: error.isCustomError,
            cause: error?.cause || 'Error sin causa',
            code: error.statusCode,
        }
    }

    buildDefaultError(error: FastifyError): DefaultErrorModel {
        return {
            message: error?.message ?? 'Error sin mensaje',
            isError: true,
            cause: error?.cause || 'Error sin causa',
            stack: ENV.ENV === 'local' ? (error?.stack ?? 'Error sin stack') : '',
            code: error?.code || 'Error',
            statusCode: error?.statusCode ?? 500,
            defaultMessage: 'Error handler log',
        }
    }

    addModule = async (module: IModule): Promise<void> => {
        const prefix = `/${ENV.DOMAIN}/${ENV.SERVICE_NAME}/${ENV.VERSION}`
        const pluggin: FastifyPluginAsync = async (router) => {
            const rutas = module.getRutas()
            rutas.forEach((ruta) => {
                const { url, metodo, evento, schema } = ruta
                const handler = ruta?.handler ?? {}
                const requestHandler = async (
                    req: FastifyRequest<{
                        Body: Record<string, unknown>
                        Params: Record<string, unknown>
                    }>,
                    reply: FastifyReply,
                ) => {
                    const data = {
                        ...(req.body || {}),
                        ...(req.params || {}),
                    }
                    const request = { data }
                    const result = await evento(request)
                    reply.header('Content-Type', 'application/json')
                    reply.status(result.status).send(JSON.stringify(result.response))
                }
                switch (metodo) {
                    case HTTPMETODO.POST:
                        router.post(url, { ...handler, schema }, requestHandler)
                        break
                    case HTTPMETODO.PUT:
                        router.put(url, { ...handler, schema }, requestHandler)
                        break
                    case HTTPMETODO.PATCH:
                        router.patch(url, { ...handler, schema }, requestHandler)
                        break
                    case HTTPMETODO.DELETE:
                        router.delete(url, { ...handler, schema }, requestHandler)
                        break
                    case HTTPMETODO.GET:
                    default:
                        router.get(url, { ...handler, schema }, requestHandler)
                        break
                }
            })
        }
        this.app.register(pluggin, {
            prefix: prefix + module.ruta,
        })
    }

    start = async (): Promise<void> => {
        try {
            await this.app.listen({ port: this.port, host: '0.0.0.0' })
            logger.info('FASTIFY', `Application running on port ${this.port}`, {
                rutas: this.routes,
            })
        } catch (err) {
            logger.error('Fastify error', 'Error al crear la instancia de fastify', err)
            process.exit(1)
        }
    }
}
