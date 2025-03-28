import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from './TypesDependencies'
import EquiposController from '../controllers/EquiposController'
import ConsultarRutasEquipoUseCase from '../usecase/services/ConsultarRutasEquipoUseCase'

const createDependencies = (): void => {
    DEPENDENCY_CONTAINER.bind<EquiposController>(TYPESDEPENDENCIES.EquiposController)
        .to(EquiposController)
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<ConsultarRutasEquipoUseCase>(TYPESDEPENDENCIES.ConsultarRutasEquipoUseCase)
        .toDynamicValue(() => {
            return new ConsultarRutasEquipoUseCase()
        })
        .inSingletonScope()
}

export default createDependencies
