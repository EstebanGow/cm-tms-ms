import { IServer } from '@infrastructure/app/server'
import FastifyServer from '@infrastructure/app/server/fastify/Fastify'
import TYPESSERVER from '@infrastructure/app/server/TypeServer'
import { Container } from 'inversify'
import { IDatabase, IMain } from 'pg-promise'
import cm from '@infrastructure/bd/adapter/Config'
import TYPESDEPENDENCIES from './TypesDependencies'

export const DEPENDENCY_CONTAINER = new Container()

export const globalDependencies = (): void => {
    DEPENDENCY_CONTAINER.bind<IServer>(TYPESSERVER.Fastify).to(FastifyServer).inSingletonScope()
    DEPENDENCY_CONTAINER.bind<IDatabase<IMain>>(TYPESDEPENDENCIES.dbTms).toConstantValue(cm)
}
