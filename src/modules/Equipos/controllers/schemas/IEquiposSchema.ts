import CustomJoi from '@common/util/JoiMessage'

const IEquipoSchema = CustomJoi.object({
    idEquipo: CustomJoi.number().required(),
})

export default IEquipoSchema
