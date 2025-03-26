const TYPESDEPENDENCIES = {
    db: Symbol.for('db'),
    dbTms: Symbol.for('dbTms'),
    Axios: Symbol.for('Axios'),
    RedisRepository: Symbol.for('RedisRepository'),
    RedisClient: Symbol.for('RedisClient'),
    TokenService: Symbol.for('TokenService'),
}

export default TYPESDEPENDENCIES
