export interface Response<T> {
    response: {
        isError: boolean
        data: T
    }
    status: number
}
