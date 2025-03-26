import { injectable } from 'inversify'
import axios, { AxiosResponse } from 'axios'
import { AxiosRepository } from '../repositories/AxiosRepository'

@injectable()
export default class ApiServiceAxios implements AxiosRepository {
    async getDataFromUrl(url: string): Promise<AxiosResponse> {
        const response = await axios.get(url)
        return response
    }

    async postDataToUrl(url: string, data: unknown): Promise<AxiosResponse> {
        const response = await axios.post(url, data)
        return response
    }
}
