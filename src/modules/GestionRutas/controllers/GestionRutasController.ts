import { Req } from '@modules/shared/infrastructure'
import { injectable } from 'inversify'
import { Response } from '@common/http/Response'

import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import Result from '@common/http/Result'
import { validateData } from '@common/util/Schemas'
import { Status } from '../../shared/infrastructure/Controller'
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies'
import TemplateUseCase from '../usecase/services/PlanificarRutasUseCase'
import { IEquipoId } from '../usecase/dto/in'
import IEquipoIdSchema from './schemas/IGestionRutasSchema'

@injectable()
export default class GestionRutasController {
    private planificarRutasUseCase = DEPENDENCY_CONTAINER.get<TemplateUseCase>(TYPESDEPENDENCIES.PlanificarRutasUseCase)

    async planificarRutas(_req: Req): Promise<Response<Status | null>> {
        const { idEquipo } = validateData<IEquipoId>(IEquipoIdSchema, _req.data)
        await this.planificarRutasUseCase.execute(idEquipo)
        return Result.ok<Status>({ ok: 'Se ejecuto correctamente el template' })
    }
}
