import { IModule } from '@common/modules/IModule'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { HTTPMETODO, Ruta } from '@common/modules/Ruta'
import TYPESDEPENDENCIES from './dependencies/TypesDependencies'
import createDependencies from './dependencies/Dependencies'
import GestionRutasController from './controllers/GestionRutasController'
import GestionRutasSchema from './schemas/GestionRutasSchema'

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
                schema: GestionRutasSchema.planificar,
            },
            {
                metodo: HTTPMETODO.GET,
                url: '/replanificar/:idEquipo',
                evento: gestionRutasController.replanificarRutas.bind(gestionRutasController),
                schema: GestionRutasSchema.replanificar,
            },
            {
                metodo: HTTPMETODO.POST,
                url: '/planificacion/',
                evento: gestionRutasController.guardarPlanificacionRutas.bind(gestionRutasController),
                schema: GestionRutasSchema.guardarPlanificacion,
            },
            {
                metodo: HTTPMETODO.POST,
                url: '/replanificacion/',
                evento: gestionRutasController.guardarReplanificacionRutas.bind(gestionRutasController),
                schema: GestionRutasSchema.guardarReplanificacion,
            },
        ]
    }

    get ruta(): string {
        return this.moduloRuta
    }
}
