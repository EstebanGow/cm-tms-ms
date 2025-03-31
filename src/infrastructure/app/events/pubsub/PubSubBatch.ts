import { PubSub } from '@google-cloud/pubsub'
import { logger } from '@common/logger/Logger'
import ENV from '@common/envs/Envs'
import PubSubException from '@common/exceptions/PubsubException'

const pubSubClient = new PubSub({ projectId: ENV.PROJECT_ID })

export default async function publishBatchedMessages(topicName: string, data: Record<string, unknown>[]) {
    const publishOptions = {
        batching: {
            maxMessages: 100,
            maxMilliseconds: 10000,
        },
    }
    const batchPublisher = pubSubClient.topic(topicName, publishOptions)

    const promises = data.map(async (item) => {
        try {
            const messageId = await batchPublisher.publishMessage({ json: item })
            logger.info('GUIAS', '182946189264', [`Mensaje publicado: ${messageId}`, 'Hola', 'Mundo'])
        } catch (error) {
            logger.error('GUIAS', '182946189264', [`Error publicando mensaje: ${error.message}`])
            throw error
        }
    })
    await Promise.all(promises)
}

export const publisher = async (publishData: object, topic: string) => {
    const datosBuffer = Buffer.from(JSON.stringify({ ...publishData }))

    try {
        const messageId = await pubSubClient.topic(topic).publishMessage({ data: datosBuffer })
        logger.info('RUTAS', 'publisher', [`Mensaje publicado: ${messageId}`, JSON.stringify({ ...publishData })])
    } catch (error) {
        throw new PubSubException(error.message, `Error al publicar en el topic: ${topic}`)
    }
}
