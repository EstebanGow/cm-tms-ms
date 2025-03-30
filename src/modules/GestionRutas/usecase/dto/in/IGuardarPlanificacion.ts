import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'

export interface IGuardarPlanificacion {
    envios: EnvioEntity[]
    idEquipo: number
}

export interface IGuardarReplanificacion extends IGuardarPlanificacion {
    idOptimizacionAnterior: number
}
