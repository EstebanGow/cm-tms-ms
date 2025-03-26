import CustomJoi from '@common/util/JoiMessage'

const IGestionRutasSchema = CustomJoi.object({
    nombre: CustomJoi.string().required(),
})

export default IGestionRutasSchema
