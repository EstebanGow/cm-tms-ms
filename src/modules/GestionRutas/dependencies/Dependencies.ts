import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from './TypesDependencies'
import GestionRutasController from '../controllers/GestionRutasController'
import PlanificarRutasUseCase from '../usecase/services/PlanificarRutasUseCase'
import ReplanificarRutasUseCase from '../usecase/services/ReplanificarRutasUseCase'
import GuardarPlanificacionUseCase from '../usecase/services/GuardarPlanificacionUseCase'
import GuardarReplanificacionUseCase from '../usecase/services/GuardarReplanificacionUseCase'

const createDependencies = (): void => {
    DEPENDENCY_CONTAINER.bind<GestionRutasController>(TYPESDEPENDENCIES.GestionRutasController)
        .to(GestionRutasController)
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<PlanificarRutasUseCase>(TYPESDEPENDENCIES.PlanificarRutasUseCase)
        .toDynamicValue(() => {
            return new PlanificarRutasUseCase()
        })
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<ReplanificarRutasUseCase>(TYPESDEPENDENCIES.ReplanificarRutasUseCase)
        .toDynamicValue(() => {
            return new ReplanificarRutasUseCase()
        })
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<GuardarPlanificacionUseCase>(TYPESDEPENDENCIES.GuardarPlanificacionUseCase)
        .toDynamicValue(() => {
            return new GuardarPlanificacionUseCase()
        })
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<GuardarReplanificacionUseCase>(TYPESDEPENDENCIES.GuardarReplanificacionUseCase)
        .toDynamicValue(() => {
            return new GuardarReplanificacionUseCase()
        })
        .inSingletonScope()
}

export default createDependencies
