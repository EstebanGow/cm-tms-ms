import CustomJoi from '@common/util/JoiMessage'
import { IEquipoIn } from '@modules/Equipos/usecase/dto/in'

const IEquipoSchema = CustomJoi.object<IEquipoIn>({
    idEquipo: CustomJoi.number().required(),
})

export default IEquipoSchema
