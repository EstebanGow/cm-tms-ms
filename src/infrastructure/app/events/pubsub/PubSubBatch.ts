import { PubSub } from '@google-cloud/pubsub'
import { logger } from '@common/logger/Logger'

const pubSubClient = new PubSub()

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
