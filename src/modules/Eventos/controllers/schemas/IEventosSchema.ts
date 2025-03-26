import CustomJoi from '@common/util/JoiMessage'

const IEventosSchema = CustomJoi.object({
    nombre: CustomJoi.string().required(),
})

export default IEventosSchema
