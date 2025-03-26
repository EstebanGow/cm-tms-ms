import { Req } from '@modules/shared/infrastructure'
import { injectable } from 'inversify'
import { Response } from '@common/http/Response'

import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import Result from '@common/http/Result'
import { validateData } from '@common/util/Schemas'
import { Status } from '../../shared/infrastructure/Controller'
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies'
import { ITemplateIn } from '../usecase/dto/in'
import IGestionRutasSchema from './schemas/IEventosSchema'
import AgregarEventoUseCase from '../usecase/services/AgregarEventoUseCase'

@injectable()
export default class EventosController {
    private templateUseCase = DEPENDENCY_CONTAINER.get<AgregarEventoUseCase>(TYPESDEPENDENCIES.AgregarEventoUseCase)

    async guardar(_req: Req): Promise<Response<Status | null>> {
        const data = validateData<ITemplateIn>(IGestionRutasSchema, _req.data)
        await this.templateUseCase.execute(data)
        return Result.ok<Status>({ ok: 'Se ejecuto correctamente el template' })
    }
}
