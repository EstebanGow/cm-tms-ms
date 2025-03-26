import 'module-alias/register'
import 'reflect-metadata'
import ModulesFactory from '@common/modules/ModulesFactory'
import TYPESSERVER from '@infrastructure/app/server/TypeServer'
import GestionRutasModule from '@modules/GestionRutas/GestionRutasModule'
import AutenticacionModule from '@modules/Autenticacion/AutenticacionModule'
import { globalDependencies } from '@common/dependencies/DependencyContainer'
import EventosModule from '@modules/Eventos/EventosModule'

async function bootstrap() {
    globalDependencies()
    const modulesFactory = new ModulesFactory()
    const server = modulesFactory.createServer(TYPESSERVER.Fastify)
    modulesFactory.initModules([GestionRutasModule, AutenticacionModule, EventosModule])
    server?.start()
}
bootstrap()
