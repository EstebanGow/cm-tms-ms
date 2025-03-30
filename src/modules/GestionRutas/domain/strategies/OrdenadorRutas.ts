import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'
import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'
import { injectable } from 'inversify'
import EnvioEntity from '../entities/EnvioEntity'
import { IOrdenamientoStrategy } from '../models/IOrdenamientoStrategy'

@injectable()
class OrdenadorRutas {
    private strategy: IOrdenamientoStrategy

    constructor(strategy: IOrdenamientoStrategy) {
        this.strategy = strategy
    }

    setStrategy(strategy: IOrdenamientoStrategy): void {
        this.strategy = strategy
    }

    ordenarEnvios(
        envios: EnvioEntity[],
        clima: CondicionClimaEntity | null,
        trafico: CondicionTraficoEntity | null,
        eventosInesperados: EventoInesperadoEntity | null,
    ): EnvioEntity[] {
        return this.strategy.ordenarEnvios(envios, clima, trafico, eventosInesperados)
    }
}

export default OrdenadorRutas
