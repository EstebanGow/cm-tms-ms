import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresEventosRepository from '@infrastructure/bd/dao/PostgresEventosRepository'
import TYPESDEPENDENCIES from './TypesDependencies'
import AgregarEventoUseCase from '../usecase/services/AgregarEventoUseCase'
import { EventosRepository } from '../domain/repositories/EventosRepository'
import EventosController from '../controllers/GestionRutasController'

const createDependencies = (): void => {
    DEPENDENCY_CONTAINER.bind<EventosController>(TYPESDEPENDENCIES.EventosController)
        .to(EventosController)
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<AgregarEventoUseCase>(TYPESDEPENDENCIES.AgregarEventoUseCase)
        .toDynamicValue(() => {
            return new AgregarEventoUseCase()
        })
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<EventosRepository>(TYPESDEPENDENCIES.EventosRepository)
        .to(PostgresEventosRepository)
        .inSingletonScope()
}

export default createDependencies
