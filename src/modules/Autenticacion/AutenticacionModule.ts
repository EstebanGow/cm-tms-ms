import { IModule } from '@common/modules/IModule'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { HTTPMETODO, Ruta } from '@common/modules/Ruta'
import TYPESDEPENDENCIES from './dependencies/TypesDependencies'
import createDependencies from './dependencies/Dependencies'
import AutenticacionController from './controllers/AutenticacionController'

export default class AutenticacionModule implements IModule {
    private moduloRuta = '/autenticacion'

    constructor() {
        createDependencies()
    }

    getRutas = (): Ruta[] => {
        const autenticacionController = DEPENDENCY_CONTAINER.get<AutenticacionController>(
            TYPESDEPENDENCIES.AutenticacionController,
        )
        return [
            {
                metodo: HTTPMETODO.POST,
                url: '/',
                evento: autenticacionController.autenticar.bind(autenticacionController),
            },
        ]
    }

    get ruta(): string {
        return this.moduloRuta
    }
}
