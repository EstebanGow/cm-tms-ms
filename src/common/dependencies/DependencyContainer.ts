import { IServer } from '@infrastructure/app/server'
import FastifyServer from '@infrastructure/app/server/fastify/Fastify'
import TYPESSERVER from '@infrastructure/app/server/TypeServer'
import { Container } from 'inversify'
import { IDatabase, IMain } from 'pg-promise'
import cm from '@infrastructure/bd/adapter/Config'
import { RedisRepository } from '@common/repositories'
import { redisClient, RedisRuteoRepository } from '@infrastructure/redis'
import { ITokenService } from '@common/interfaces/ITokenService'
import TokenService from '@infrastructure/services/TokenService'
import { EventosRepository } from '@modules/Eventos/domain/repositories/EventosRepository'
import PostgresEventosRepository from '@infrastructure/bd/dao/PostgresEventosRepository'
import { EquiposRepository } from '@modules/GestionRutas/domain/repositories/EquiposRepository'
import PostgresEquiposRepository from '@infrastructure/bd/dao/PostgresEquiposRepository'
import { EnviosRepository } from '@modules/GestionRutas/domain/repositories/EnviosRepository'
import PostgresEnviosRepository from '@infrastructure/bd/dao/PostgresEnviosRepository'
import EquiposDomainService from '@modules/GestionRutas/domain/services/Equipos/EquiposDomainService'
import CondicionesDomainService from '@modules/GestionRutas/domain/services/Condiciones/CondicionesDomainService'
import EnviosDomainService from '@modules/GestionRutas/domain/services/Envios/EnviosDomainService'
import { AxiosRepository } from '@common/http/repositories/AxiosRepository'
import ApiServiceAxios from '@common/http/services/apiServiceAxios'
import GeolocalizacionDomainService from '@modules/Eventos/domain/services/GeolocalizacionDomainService'
import TYPESDEPENDENCIES from './TypesDependencies'

export const DEPENDENCY_CONTAINER = new Container()

export const globalDependencies = (): void => {
    DEPENDENCY_CONTAINER.bind<AxiosRepository>(TYPESDEPENDENCIES.Axios).to(ApiServiceAxios).inSingletonScope()
    DEPENDENCY_CONTAINER.bind<IServer>(TYPESSERVER.Fastify).to(FastifyServer).inSingletonScope()
    DEPENDENCY_CONTAINER.bind<IDatabase<IMain>>(TYPESDEPENDENCIES.dbTms).toConstantValue(cm)
    DEPENDENCY_CONTAINER.bind(TYPESDEPENDENCIES.RedisClient).toConstantValue(redisClient)
    DEPENDENCY_CONTAINER.bind<RedisRepository>(TYPESDEPENDENCIES.RedisRepository)
        .to(RedisRuteoRepository)
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<ITokenService>(TYPESDEPENDENCIES.TokenService)
        .toDynamicValue(() => {
            return new TokenService()
        })
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<EventosRepository>(TYPESDEPENDENCIES.EventosRepository)
        .to(PostgresEventosRepository)
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<EquiposRepository>(TYPESDEPENDENCIES.EquiposRepository)
        .to(PostgresEquiposRepository)
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<EnviosRepository>(TYPESDEPENDENCIES.EnviosRepository)
        .to(PostgresEnviosRepository)
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<EquiposDomainService>(TYPESDEPENDENCIES.EquiposDomainService)
        .toDynamicValue(() => {
            return new EquiposDomainService()
        })
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<GeolocalizacionDomainService>(
        TYPESDEPENDENCIES.GeolocalizacionDomainService,
    ).toDynamicValue(() => {
        return new GeolocalizacionDomainService()
    })
    DEPENDENCY_CONTAINER.bind<CondicionesDomainService>(TYPESDEPENDENCIES.CondicionesDomainService)
        .toDynamicValue(() => {
            return new CondicionesDomainService()
        })
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<EnviosDomainService>(TYPESDEPENDENCIES.EnviosDomainService)
        .toDynamicValue(() => {
            return new EnviosDomainService()
        })
        .inSingletonScope()
}
