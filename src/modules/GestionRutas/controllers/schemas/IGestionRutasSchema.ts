import CustomJoi from '@common/util/JoiMessage'
import {
    IGuardarPlanificacion,
    IGuardarReplanificacion,
} from '@modules/GestionRutas/usecase/dto/in/IGuardarPlanificacion'

const IEquipoIdSchema = CustomJoi.object({
    idEquipo: CustomJoi.number().required(),
})

export const IGuardarPlanificacionSchema = CustomJoi.object<IGuardarPlanificacion>({
    envios: CustomJoi.array().items(CustomJoi.object({})),
    idEquipo: CustomJoi.number().required(),
})

export const IGuardarReplanificacionSchema = CustomJoi.object<IGuardarReplanificacion>({
    envios: CustomJoi.array().items(CustomJoi.object({})),
    idEquipo: CustomJoi.number().required(),
    idOptimizacionAnterior: CustomJoi.number().required(),
})

export default IEquipoIdSchema
