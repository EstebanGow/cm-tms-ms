import { Req } from '@modules/shared/infrastructure'
import { injectable } from 'inversify'
import { Response } from '@common/http/Response'

import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import Result from '@common/http/Result'
import { validateData, validateDataPubSub } from '@common/util/Schemas'
import { Status } from '../../shared/infrastructure/Controller'
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies'
import { IEquipoId } from '../usecase/dto/in'
import IEquipoIdSchema, {
    IGuardarPlanificacionSchema,
    IGuardarReplanificacionSchema,
} from './schemas/IGestionRutasSchema'
import PlanificarRutasUseCase from '../usecase/services/PlanificarRutasUseCase'
import ReplanificarRutasUseCase from '../usecase/services/ReplanificarRutasUseCase'
import GuardarPlanificacionUseCase from '../usecase/services/GuardarPlanificacionUseCase'
import GuardarReplanificacionUseCase from '../usecase/services/GuardarReplanificacionUseCase'
import { IGuardarPlanificacion, IGuardarReplanificacion } from '../usecase/dto/in/IGuardarPlanificacion'

@injectable()
export default class GestionRutasController {
    private planificarRutasUseCase = DEPENDENCY_CONTAINER.get<PlanificarRutasUseCase>(
        TYPESDEPENDENCIES.PlanificarRutasUseCase,
    )

    private replanificarRutasUseCase = DEPENDENCY_CONTAINER.get<ReplanificarRutasUseCase>(
        TYPESDEPENDENCIES.ReplanificarRutasUseCase,
    )

    private guardarPlanificacionUseCase = DEPENDENCY_CONTAINER.get<GuardarPlanificacionUseCase>(
        TYPESDEPENDENCIES.GuardarPlanificacionUseCase,
    )

    private guardarReplanificacionUseCase = DEPENDENCY_CONTAINER.get<GuardarReplanificacionUseCase>(
        TYPESDEPENDENCIES.GuardarReplanificacionUseCase,
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

    async guardarPlanificacionRutas(req: Req): Promise<Response<Status | null>> {
        const data = validateDataPubSub<IGuardarPlanificacion>(IGuardarPlanificacionSchema, req.data)
        await this.guardarPlanificacionUseCase.execute(data.envios, data.idEquipo)
        return Result.ok<Status>({ ok: 'Se replanificaron correctamente las rutas' })
    }

    async guardarReplanificacionRutas(req: Req): Promise<Response<Status | null>> {
        const data = validateDataPubSub<IGuardarReplanificacion>(IGuardarReplanificacionSchema, req.data)
        await this.guardarReplanificacionUseCase.execute(data.envios, data.idEquipo, data.idOptimizacionAnterior)
        return Result.ok<Status>({ ok: 'Se replanificaron correctamente las rutas' })
    }
}
