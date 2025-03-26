import CustomJoi from '@common/util/JoiMessage'
import { IRegistrarEventoIn } from '@modules/Eventos/usecase/dto/in'

const IRegistrarEventoSchema = CustomJoi.object<IRegistrarEventoIn>({
    idTipoEvento: CustomJoi.number().required(),
    descripcion: CustomJoi.string().required(),
    latitud: CustomJoi.number().required(),
    longitud: CustomJoi.number().required(),
    radioAfectacionKm: CustomJoi.number().required(),
})

export default IRegistrarEventoSchema
