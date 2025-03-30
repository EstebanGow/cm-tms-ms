export interface IPublisherPubSub {
    publisher(publishData: Buffer, topic: string): Promise<string>
}
