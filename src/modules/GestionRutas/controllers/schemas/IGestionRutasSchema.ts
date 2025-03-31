import CustomJoi from '@common/util/JoiMessage'
import {
    IGuardarPlanificacion,
    IGuardarReplanificacion,
} from '@modules/GestionRutas/usecase/dto/in/IGuardarPlanificacion'

const IDireccionDestinoSchema = CustomJoi.object({
    id_direccion: CustomJoi.number().required(),
    id_cliente: CustomJoi.number().required(),
    nombre_contacto: CustomJoi.string().required(),
    telefono_contacto: CustomJoi.string().required(),
    calle: CustomJoi.string().required(),
    numero: CustomJoi.string().required(),
    ciudad: CustomJoi.string().required(),
    estado: CustomJoi.string().required(),
    codigo_postal: CustomJoi.string().required(),
    pais: CustomJoi.string().required(),
    latitud: CustomJoi.number().required(),
    longitud: CustomJoi.number().required(),
    instrucciones_entrega: CustomJoi.string().allow(''),
    tipo: CustomJoi.string().required(),
})

const IAcuerdoServicioSchema = CustomJoi.object({
    id_acuerdo_servicio: CustomJoi.number().required(),
    id_cliente: CustomJoi.number().required(),
    nombre: CustomJoi.string().required(),
    tiempo_entrega_horas: CustomJoi.number().required(),
    prioridad: CustomJoi.string().required(),
    penalizacion_porcentaje: CustomJoi.number().required(),
    descripcion: CustomJoi.string().allow(''),
})

const IEnvioSchema = CustomJoi.object({
    id_envio: CustomJoi.number().required(),
    id_cliente: CustomJoi.number().required(),
    id_acuerdo_servicio: CustomJoi.number().required(),
    id_direccion_destino: CustomJoi.number().required(),
    fecha_creacion: CustomJoi.date().iso().required(),
    fecha_entrega_programada: CustomJoi.date().iso().required(),
    fecha_entrega_real: CustomJoi.date().iso().allow(null),
    peso_kg: CustomJoi.number().required(),
    volumen_m3: CustomJoi.number().required(),
    descripcion: CustomJoi.string().allow(''),
    estado: CustomJoi.string().required(),
    acuerdo_servicio: IAcuerdoServicioSchema,
    direccion_destino: IDireccionDestinoSchema,
    orden_secuencia: CustomJoi.number().required(),
    tiempo_estimado_minutos: CustomJoi.number().required(),
    distancia_km: CustomJoi.number().required(),
})

const IEquipoIdSchema = CustomJoi.object({
    idEquipo: CustomJoi.number().required(),
})

export const IGuardarPlanificacionSchema = CustomJoi.object<IGuardarPlanificacion>({
    envios: CustomJoi.array().items(IEnvioSchema).required(),
    idEquipo: CustomJoi.number().required(),
})

export const IGuardarReplanificacionSchema = CustomJoi.object<IGuardarReplanificacion>({
    envios: CustomJoi.array().items(IEnvioSchema).required(),
    idEquipo: CustomJoi.number().required(),
    idOptimizacionAnterior: CustomJoi.number().required(),
    idEvento: CustomJoi.number().required(),
})

export default IEquipoIdSchema
