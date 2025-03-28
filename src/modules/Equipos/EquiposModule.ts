import { IModule } from '@common/modules/IModule'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { HTTPMETODO, Ruta } from '@common/modules/Ruta'
import TYPESDEPENDENCIES from './dependencies/TypesDependencies'
import createDependencies from './dependencies/Dependencies'
import EquiposController from './controllers/EquiposController'

export default class EquiposModule implements IModule {
    private moduloRuta = '/equipos'

    constructor() {
        createDependencies()
    }

    getRutas = (): Ruta[] => {
        const eventosController = DEPENDENCY_CONTAINER.get<EquiposController>(TYPESDEPENDENCIES.EquiposController)
        return [
            {
                metodo: HTTPMETODO.GET,
                url: '/rutas/:idEquipo',
                evento: eventosController.consultarRutaEquipo.bind(eventosController),
            },
        ]
    }

    get ruta(): string {
        return this.moduloRuta
    }
}
