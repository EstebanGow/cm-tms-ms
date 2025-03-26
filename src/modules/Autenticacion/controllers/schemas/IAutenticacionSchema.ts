import CustomJoi from '@common/util/JoiMessage'

const IAutenticacionSchema = CustomJoi.object({
    nombre: CustomJoi.string().required(),
})

export default IAutenticacionSchema
