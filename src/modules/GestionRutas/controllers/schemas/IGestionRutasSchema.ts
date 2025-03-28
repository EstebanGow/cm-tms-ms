import CustomJoi from '@common/util/JoiMessage'

const IEquipoIdSchema = CustomJoi.object({
    idEquipo: CustomJoi.number().required(),
})

export default IEquipoIdSchema
