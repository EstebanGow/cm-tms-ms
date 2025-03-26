import { ErrorCode, StatusCode } from './ErrorCode'
import Exception from './Exceptions'

export default class PubSubException extends Exception {
    constructor(message: string, cause: string) {
        super(message, ErrorCode.PUBSUB_ERROR, StatusCode.INTERNAL_ERROR, cause)
    }
}
