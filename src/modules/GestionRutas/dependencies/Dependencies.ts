import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresRutasRepository from '@infrastructure/bd/dao/PostgresRutasRepository'
import { RutasRepository } from '../domain/repositories/RutasRepository'
import TYPESDEPENDENCIES from './TypesDependencies'
import GestionRutasController from '../controllers/GestionRutasController'
import PlanificarRutasUseCase from '../usecase/services/PlanificarRutasUseCase'
import ReplanificarRutasUseCase from '../usecase/services/ReplanificarRutasUseCase'

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
    DEPENDENCY_CONTAINER.bind<RutasRepository>(TYPESDEPENDENCIES.RutasRepository)
        .to(PostgresRutasRepository)
        .inSingletonScope()
}

export default createDependencies
