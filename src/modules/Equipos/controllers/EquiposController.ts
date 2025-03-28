import { Req } from '@modules/shared/infrastructure'
import { injectable } from 'inversify'
import { Response } from '@common/http/Response'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import Result from '@common/http/Result'
import { validateData } from '@common/util/Schemas'
import IEquipoIdSchema from '@modules/GestionRutas/controllers/schemas/IGestionRutasSchema'
import { Status } from '../../shared/infrastructure/Controller'
import TYPESDEPENDENCIES from '../dependencies/TypesDependencies'
import { IEquipoIn } from '../usecase/dto/in'
import ConsultarRutasEquipoUseCase from '../usecase/services/ConsultarRutasEquipoUseCase'

@injectable()
export default class EquiposController {
    private consultarRutaEquipoUseCase = DEPENDENCY_CONTAINER.get<ConsultarRutasEquipoUseCase>(
        TYPESDEPENDENCIES.ConsultarRutasEquipoUseCase,
    )

    async consultarRutaEquipo(_req: Req): Promise<Response<Status | null>> {
        const data = validateData<IEquipoIn>(IEquipoIdSchema, _req.data)
        const respuestaServicio = await this.consultarRutaEquipoUseCase.execute(data)
        return Result.ok<Status>({
            ok: 'Se consultaron las rutas del equipo de forma exitosa',
            data: respuestaServicio,
        })
    }
}
