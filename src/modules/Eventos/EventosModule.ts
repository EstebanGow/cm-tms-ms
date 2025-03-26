import { IModule } from '@common/modules/IModule'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { HTTPMETODO, Ruta } from '@common/modules/Ruta'
import TYPESDEPENDENCIES from './dependencies/TypesDependencies'
import createDependencies from './dependencies/Dependencies'
import TemplateSchema from './schemas/TemplateSchema'
import EventosController from './controllers/GestionRutasController'

export default class EventosModule implements IModule {
    private moduloRuta = '/eventos'

    constructor() {
        createDependencies()
    }

    getRutas = (): Ruta[] => {
        const templateController = DEPENDENCY_CONTAINER.get<EventosController>(TYPESDEPENDENCIES.EventosController)
        return [
            {
                metodo: HTTPMETODO.POST,
                url: '/',
                evento: templateController.guardar.bind(templateController),
                schema: TemplateSchema.guardar,
            },
            {
                metodo: HTTPMETODO.GET,
                url: '/',
                evento: templateController.guardar.bind(templateController),
            },
        ]
    }

    get ruta(): string {
        return this.moduloRuta
    }
}
