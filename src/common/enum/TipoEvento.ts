export enum TipoEvento {
    CongestionInesperada = 1,
    AccidenteTransito = 2,
    CambioBruscoClima = 3,
    BloqueoVial = 4,
    FallaMecanica = 5,
    EmergenciaMedica = 6,
    DesviioObligatorio = 7,
    Inundacion = 8,
}

export interface FactorImpacto {
    nombre: string
    valor: number
}
