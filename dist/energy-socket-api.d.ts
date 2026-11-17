import { BaseApi, BaseApiOptions, BasePolling, PollMethod } from './base-api';
import { BasicInformationResponse, EnergySocketDataResponse, IdentifyResponse, StatePutParams, StateResponse, SystemPutParams, SystemResponse } from './types';
export interface EnergySocketPolling<TStateResponse extends StateResponse> extends BasePolling<EnergySocketDataResponse> {
    getState: PollMethod<TStateResponse>;
}
export declare class EnergySocketApi extends BaseApi {
    getBasicInformation<T extends BasicInformationResponse>(): Promise<T>;
    getData<T extends EnergySocketDataResponse>(): Promise<T>;
    protected startPolling(method: 'getData', apiMethod: <T extends EnergySocketDataResponse>() => Promise<T>): Promise<void>;
    protected startPolling(method: 'getState', apiMethod: <T extends StateResponse>() => Promise<T>): Promise<void>;
    constructor(baseUrl: string, options?: BaseApiOptions);
    protected get endpoints(): {
        state: string;
        identify: string;
        system: string;
        basic: string;
        data: string;
    };
    /**
     * Start polling your Energy Socket using a specific method.
     *
     * To start polling, call the `start()` method on the returned object.
     * The polling can be stopped by calling the `stop()` method.
     *
     * Supported methods: `getData`, `getState`
     */
    get polling(): EnergySocketPolling<StateResponse>;
    /**
     * Returns the actual state of the Energy Socket. This endpoint is only available for the HWE-SKT.
     *
     * @link https://homewizard-energy-api.readthedocs.io/endpoints.html#state-api-v1-state
     */
    getState<T extends StateResponse>(): Promise<T>;
    /**
     * Control the state of the Energy Socket. This endpoint is only available for the HWE-SKT.
     *
     * @link https://homewizard-energy-api.readthedocs.io/endpoints.html#state-api-v1-state
     */
    updateState<Keys extends keyof StateResponse>(params: StatePutParams<Keys>): Promise<StatePutParams<Keys>>;
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
    /**
     * The /api/v1/identify endpoint can be used to let the user identify the device. The status light will blink for a few seconds after calling this endpoint.
     *
     * This feature is currently only available for HWE-SKT running firmware version 3.00 or later.
     *
     * @link https://homewizard-energy-api.readthedocs.io/endpoints.html#identify-api-v1-identify
     */
    identify(): Promise<IdentifyResponse>;
}
//# sourceMappingURL=energy-socket-api.d.ts.map