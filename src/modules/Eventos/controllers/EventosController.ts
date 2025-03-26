import { Req } from '@modules/shared/infrastructure'
import { injectable } from 'inversify'
import { Response } from '@common/http/Response'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import Result from '@common/http/Result'
import { validateData } from '@common/util/Schemas'
import { Status } from '../../shared/infrastructure/Controller'
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies'
import { IRegistrarEventoIn } from '../usecase/dto/in'
import AgregarEventoUseCase from '../usecase/services/AgregarEventoUseCase'
import IRegistrarEventoSchema from './schemas/IEventosSchema'

@injectable()
export default class EventosController {
    private agregarEventoUseCase = DEPENDENCY_CONTAINER.get<AgregarEventoUseCase>(
        TYPESDEPENDENCIES.AgregarEventoUseCase,
    )

    async registrarEvento(_req: Req): Promise<Response<Status | null>> {
        const data = validateData<IRegistrarEventoIn>(IRegistrarEventoSchema, _req.data)
        await this.agregarEventoUseCase.execute(data)
        return Result.ok<Status>({ ok: 'Se registro el evento de forma exitosa' })
    }
}
