import 'reflect-metadata'
import { injectable } from 'inversify'
import { PubSub } from '@google-cloud/pubsub'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import PubSubException from '@common/exceptions/PubsubException'
import { IPublisherPubSub } from '../IPublisher'

@injectable()
export class PublishPubSub implements IPublisherPubSub {
    private pubsub = DEPENDENCY_CONTAINER.get<PubSub>(TYPESDEPENDENCIES.PubSub)

    async publisher(publishData: Buffer, topic: string): Promise<string> {
        try {
            return await this.pubsub.topic(topic).publish(publishData)
        } catch (error) {
            throw new PubSubException(error.message, `Error al publicar en el topic: ${topic}`)
        }
    }
}

export default PublishPubSub
