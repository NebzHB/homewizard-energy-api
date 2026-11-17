import { BaseApi, BaseApiOptions, BasePolling } from './base-api';
import { BasicInformationResponse, WaterMeterDataResponse } from './types';
export type WaterMeterPolling = BasePolling<WaterMeterDataResponse>;
export declare class WaterMeterApi extends BaseApi {
    getBasicInformation<T extends BasicInformationResponse>(): Promise<T>;
    getData<T extends WaterMeterDataResponse>(): Promise<T>;
    protected startPolling(method: 'getData', apiMethod: <T extends WaterMeterDataResponse>() => Promise<T>): Promise<void>;
    constructor(baseUrl: string, options?: BaseApiOptions);
    get polling(): WaterMeterPolling;
}
//# sourceMappingURL=water-meter-api.d.ts.map