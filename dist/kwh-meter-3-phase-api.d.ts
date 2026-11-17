import { BaseApi, BaseApiOptions, BasePolling } from './base-api';
import { BasicInformationResponse, KwhMeter3PhaseDataResponse, SystemPutParams, SystemResponse } from './types';
export type KwhMeter3PhasePolling = BasePolling<KwhMeter3PhaseDataResponse>;
export declare class KwhMeter3PhaseApi extends BaseApi {
    getBasicInformation<T extends BasicInformationResponse>(): Promise<T>;
    getData<T extends KwhMeter3PhaseDataResponse>(): Promise<T>;
    protected startPolling(method: 'getData', apiMethod: <T extends KwhMeter3PhaseDataResponse>() => Promise<T>): Promise<void>;
    constructor(baseUrl: string, options?: BaseApiOptions);
    protected get endpoints(): {
        system: string;
        basic: string;
        data: string;
    };
    get polling(): KwhMeter3PhasePolling;
    /**
     * The /api/v1/system endpoint can be used to configure system settings.
     * Currently the only available option it to turn on and off all cloud communication.
     *
     * With GET will send the actual system state.
     *
     * This feature is currently available for `HWE-P1` running firmware version 4.00 or later.
     * And `HWE-SKT`, `SDM230-wifi` and `SDM630-wifi` running firmware version 3.00 or later.
     *
     * @link https://homewizard-energy-api.readthedocs.io/endpoints.html#system-api-v1-system
     */
    getSystem(): Promise<SystemResponse>;
    /**
     * The /api/v1/system endpoint can be used to configure system settings.
     * Currently the only available option it to turn on and off all cloud communication.
     *
     * With PUT allows to set the system state.
     *
     * This feature is currently available for `HWE-P1` running firmware version 4.00 or later.
     * And `HWE-SKT`, `SDM230-wifi` and `SDM630-wifi` running firmware version 3.00 or later.
     *
     * @link https://homewizard-energy-api.readthedocs.io/endpoints.html#system-api-v1-system
     */
    updateSystem(params: SystemPutParams): Promise<SystemResponse>;
}
//# sourceMappingURL=kwh-meter-3-phase-api.d.ts.map