import { AxiosResponse } from 'axios'

export interface AxiosRepository {
    getDataFromUrl(url: string): Promise<AxiosResponse>
    postDataToUrl(url: string, _data: unknown): Promise<AxiosResponse>
}
