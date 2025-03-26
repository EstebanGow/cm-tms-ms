import { error } from 'console'

const validateEnvs = (ENV: Record<string, string>): never | void => {
    const indefinidas: string[] = []
    Object.keys(ENV).forEach((key) => {
        if (!process.env[key]) indefinidas.push(key)
    })
    if (indefinidas.length) {
        error('ENV ERROR', `Las siguientes variables no están definidas en los ENV: ${indefinidas.join(', ')}`)
        process.exit(1)
    }
}

export default validateEnvs
