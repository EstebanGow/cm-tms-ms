import { Req } from '@modules/shared/infrastructure'
import { injectable } from 'inversify'
import { Response } from '@common/http/Response'

import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import Result from '@common/http/Result'
import { validateData } from '@common/util/Schemas'
import { Status } from '../../shared/infrastructure/Controller'
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies'
import { IEquipoId } from '../usecase/dto/in'
import IEquipoIdSchema from './schemas/IGestionRutasSchema'
import PlanificarRutasUseCase from '../usecase/services/PlanificarRutasUseCase'
import ReplanificarRutasUseCase from '../usecase/services/ReplanificarRutasUseCase'

@injectable()
export default class GestionRutasController {
    private planificarRutasUseCase = DEPENDENCY_CONTAINER.get<PlanificarRutasUseCase>(
        TYPESDEPENDENCIES.PlanificarRutasUseCase,
    )

    private replanificarRutasUseCase = DEPENDENCY_CONTAINER.get<ReplanificarRutasUseCase>(
        TYPESDEPENDENCIES.ReplanificarRutasUseCase,
    )

    async planificarRutas(req: Req): Promise<Response<Status | null>> {
        const data = validateData<IEquipoId>(IEquipoIdSchema, req.data)
        await this.planificarRutasUseCase.execute(data.idEquipo)
        return Result.ok<Status>({ ok: 'Se planificaron correctamente las rutas' })
    }

    async replanificarRutas(req: Req): Promise<Response<Status | null>> {
        const data = validateData<IEquipoId>(IEquipoIdSchema, req.data)
        await this.replanificarRutasUseCase.execute(data.idEquipo)
        return Result.ok<Status>({ ok: 'Se replanificaron correctamente las rutas' })
    }
}
