import { IModule } from '@common/modules/IModule'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { HTTPMETODO, Ruta } from '@common/modules/Ruta'
import TYPESDEPENDENCIES from './dependencies/TypesDependencies'
import createDependencies from './dependencies/Dependencies'
import EventosController from './controllers/EventosController'
import EventosSchema from './schemas/EventosSchema'

export default class EventosModule implements IModule {
    private moduloRuta = '/eventos'

    constructor() {
        createDependencies()
    }

    getRutas = (): Ruta[] => {
        const eventosController = DEPENDENCY_CONTAINER.get<EventosController>(TYPESDEPENDENCIES.EventosController)
        return [
            {
                metodo: HTTPMETODO.POST,
                url: '/',
                evento: eventosController.registrarEvento.bind(eventosController),
                schema: EventosSchema.registrar,
            },
        ]
    }

    get ruta(): string {
        return this.moduloRuta
    }
}
