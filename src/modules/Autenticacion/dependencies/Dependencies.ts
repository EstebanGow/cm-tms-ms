import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import PostgresAutenticacionRepository from '@infrastructure/bd/dao/PostgresAutenticacionRepository'
import TYPESDEPENDENCIES from './TypesDependencies'
import AutenticacionController from '../controllers/AutenticacionController'
import AutenticacionUseCase from '../usecase/services/AutenticacionUseCase'
import { AutenticacionRepository } from '../domain/repositories/AutenticacionRepository'

const createDependencies = (): void => {
    DEPENDENCY_CONTAINER.bind<AutenticacionController>(TYPESDEPENDENCIES.AutenticacionController)
        .to(AutenticacionController)
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<AutenticacionUseCase>(TYPESDEPENDENCIES.AutenticacionUseCase)
        .toDynamicValue(() => {
            return new AutenticacionUseCase()
        })
        .inSingletonScope()
    DEPENDENCY_CONTAINER.bind<AutenticacionRepository>(TYPESDEPENDENCIES.AutenticacionRepository)
        .to(PostgresAutenticacionRepository)
        .inSingletonScope()
}

export default createDependencies
