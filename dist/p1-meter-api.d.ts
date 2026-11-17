import { BaseApi, BaseApiOptions, BasePolling, PollMethod } from './base-api';
import { BasicInformationResponse, IdentifyResponse, P1MeterDataResponse, SystemPutParams, SystemResponse, TelegramResponse } from './types';
import { ParsedTelegram } from './utils/telegram';
export interface P1MeterPolling<TTelegramResponse extends TelegramResponse, TParsedTelegram extends ParsedTelegram> extends BasePolling<P1MeterDataResponse> {
    getTelegram: PollMethod<TTelegramResponse>;
    getParsedTelegram: PollMethod<TParsedTelegram>;
}
export declare class P1MeterApi extends BaseApi {
    getBasicInformation<T extends BasicInformationResponse>(): Promise<T>;
    getData<T extends P1MeterDataResponse>(): Promise<T>;
    protected startPolling(method: 'getData', apiMethod: <T extends P1MeterDataResponse>() => Promise<T>): Promise<void>;
    protected startPolling(method: 'getTelegram', apiMethod: <T extends TelegramResponse>() => Promise<T>): Promise<void>;
    protected startPolling(method: 'getParsedTelegram', apiMethod: <T extends TelegramResponse>() => Promise<T>): Promise<void>;
    constructor(baseUrl: string, options?: BaseApiOptions);
    protected get endpoints(): {
        telegram: string;
        identify: string;
        system: string;
        basic: string;
        data: string;
    };
    /**
     * Start polling your P1 Meter using a specific method.
     *
     * To start polling, call the `start()` method on the returned object.
     * The polling can be stopped by calling the `stop()` method.
     *
     * Supported methods: `getData`, `getTelegram` and `getParsedTelegram`
     */
    get polling(): P1MeterPolling<TelegramResponse, ParsedTelegram>;
    /**
     * The /api/v1/telegram endpoint returns the most recent, valid telegram that was given by the P1 meter,
     * therefore this endpoint is only available for the HWE-P1.
     *
     * The telegram validated with its CRC, but not parsed in any form.
     *
     * Note that this endpoint returns plain text instead of formatted JSON, even when an error occours (see Error handling)
     *
     * @link: https://homewizard-energy-api.readthedocs.io/endpoints.html#p1-telegram-api-v1-telegram
     */
    getTelegram<T extends TelegramResponse>(): Promise<T>;
    /**
     * The /api/v1/telegram endpoint returns the most recent, valid telegram that was given by the P1 meter in a text format.
     *
     * This method fetches the telegram and parses it and returns it as a JSON object.
     */
    getParsedTelegram<T extends ParsedTelegram>(): Promise<T>;
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
     * This feature is currently only available for HWE-P1 running firmware version 4.00 or later.
     *
     * @link https://homewizard-energy-api.readthedocs.io/endpoints.html#identify-api-v1-identify
     */
    identify(): Promise<IdentifyResponse>;
}
//# sourceMappingURL=p1-meter-api.d.ts.map