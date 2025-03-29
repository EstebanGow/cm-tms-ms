const TYPESDEPENDENCIES = {
    db: Symbol.for('db'),
    dbTms: Symbol.for('dbTms'),
    Axios: Symbol.for('Axios'),
    RedisRepository: Symbol.for('RedisRepository'),
    RedisClient: Symbol.for('RedisClient'),
    TokenService: Symbol.for('TokenService'),
    EnviosRepository: Symbol.for('PostgresEnviosRepository'),
    EnviosDomainService: Symbol.for('EnviosDomainService'),
    EquiposDomainService: Symbol.for('EquiposDomainService'),
    EquiposRepository: Symbol.for('PostgresEquiposRepository'),
    CondicionesDomainService: Symbol.for('CondicionesDomainService'),
    EventosRepository: Symbol.for('PostgresEventosRepository'),
    GeolocalizacionDomainService: Symbol.for('GeolocalizacionDomainService'),
}

export default TYPESDEPENDENCIES
