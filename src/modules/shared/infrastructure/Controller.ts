import { FastifyReply, FastifyRequest } from 'fastify'

export type Request = FastifyRequest
export type Reply = FastifyReply

export type Req = {
    body: unknown
    params: unknown
    data: unknown
}

export interface Status {
    ok: string
    [key: string]: unknown
}
