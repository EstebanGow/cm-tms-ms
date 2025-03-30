import { IModule } from '@common/modules/IModule'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { HTTPMETODO, Ruta } from '@common/modules/Ruta'
import TYPESDEPENDENCIES from './dependencies/TypesDependencies'
import createDependencies from './dependencies/Dependencies'
import GestionRutasController from './controllers/GestionRutasController'

export default class GestionRutasModule implements IModule {
    private moduloRuta = '/rutas'

    constructor() {
        createDependencies()
    }

    getRutas = (): Ruta[] => {
        const gestionRutasController = DEPENDENCY_CONTAINER.get<GestionRutasController>(
            TYPESDEPENDENCIES.GestionRutasController,
        )
        return [
            {
                metodo: HTTPMETODO.GET,
                url: '/planificar/:idEquipo',
                evento: gestionRutasController.planificarRutas.bind(gestionRutasController),
            },
            {
                metodo: HTTPMETODO.GET,
                url: '/replanificar/:idEquipo',
                evento: gestionRutasController.replanificarRutas.bind(gestionRutasController),
            },
        ]
    }

    get ruta(): string {
        return this.moduloRuta
    }
}
