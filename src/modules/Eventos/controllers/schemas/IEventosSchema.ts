import CustomJoi from '@common/util/JoiMessage'
import { IRegistrarEventoIn } from '@modules/Eventos/usecase/dto/in'

const IRegistrarEventoSchema = CustomJoi.object<IRegistrarEventoIn>({
    id_tipo_evento: CustomJoi.number().required(),
    descripcion: CustomJoi.string().required(),
    latitud: CustomJoi.number().required(),
    longitud: CustomJoi.number().required(),
    radio_afectacion_km: CustomJoi.number().required(),
})

export default IRegistrarEventoSchema
