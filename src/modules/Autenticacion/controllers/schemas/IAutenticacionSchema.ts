import CustomJoi from '@common/util/JoiMessage'
import { IAutenticacionIn } from '@modules/Autenticacion/usecase/dto/in'

const IAutenticacionSchema = CustomJoi.object<IAutenticacionIn>({
    usuario: CustomJoi.string().required(),
    clave: CustomJoi.string().required(),
})

export default IAutenticacionSchema
