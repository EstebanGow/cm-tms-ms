import { IModule } from '@common/modules/IModule'
import { FastifyInstance } from 'fastify'

export interface IServer {
    port: number | string
    app: FastifyInstance
    start(): void
    addModule(module: IModule): Promise<void>
}
