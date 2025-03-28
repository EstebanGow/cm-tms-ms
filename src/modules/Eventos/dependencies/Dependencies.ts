import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from './TypesDependencies'
import AgregarEventoUseCase from '../usecase/services/AgregarEventoUseCase'
import EventosController from '../controllers/EventosController'

const createDependencies = (): void => {
    DEPENDENCY_CONTAINER.bind<EventosController>(TYPESDEPENDENCIES.EventosController)
        .to(EventosController)
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<AgregarEventoUseCase>(TYPESDEPENDENCIES.AgregarEventoUseCase)
        .toDynamicValue(() => {
            return new AgregarEventoUseCase()
        })
        .inSingletonScope()
}

export default createDependencies
