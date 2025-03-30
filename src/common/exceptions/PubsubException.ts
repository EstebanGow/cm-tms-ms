import { ErrorCode, StatusCode } from '@common/http/exceptions'
import Exception from '@common/http/exceptions/Exceptions'

export class PubSubException extends Exception {
    constructor(message: string, cause: string) {
        super(message, ErrorCode.PUBSUB_ERROR, StatusCode.INTERNAL_ERROR, cause)
    }
}

export default PubSubException
