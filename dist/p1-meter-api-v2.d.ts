import { BaseApiV2, BaseApiV2Options, BatteriesPolling } from './base-api-v2';
import { HomeWizardEnergyWebSocket } from './websocket-v2';
import { BasePolling, PollMethod } from './base-api';
import { BasicInformationResponse, TelegramResponse } from './types';
import { BatteriesPutParams, BatteriesResponse, P1MeterMeasurementResponse, SystemV2PutParams, SystemV2Response } from './types-v2';
import { ParsedTelegram } from './utils/telegram';
export interface P1MeterPollingV2<TTelegramResponse extends TelegramResponse, TParsedTelegram extends ParsedTelegram, TBatteriesResponse extends BatteriesResponse> extends BasePolling<P1MeterMeasurementResponse>, BatteriesPolling<TBatteriesResponse> {
    getTelegram: PollMethod<TTelegramResponse>;
    getParsedTelegram: PollMethod<TParsedTelegram>;
}
/**
 * The API v2 of the P1 Meter (`HWE-P1`).
 *
 * @link https://api-documentation.homewizard.com/docs/category/api-v2
 */
export declare class P1MeterApiV2 extends BaseApiV2 {
    getBasicInformation<T extends BasicInformationResponse>(): Promise<T>;
    getData<T extends P1MeterMeasurementResponse>(): Promise<T>;
    getSystem(): Promise<SystemV2Response>;
    updateSystem(params: SystemV2PutParams): Promise<SystemV2Response>;
    identify(): Promise<void>;
    reboot(): Promise<void>;
    getBatteries<T extends BatteriesResponse>(): Promise<T>;
    updateBatteries<T extends BatteriesResponse>(params: BatteriesPutParams): Promise<T>;
    getTelegram<T extends TelegramResponse>(): Promise<T>;
    constructor(baseUrl: string, options?: BaseApiV2Options);
    get websocket(): HomeWizardEnergyWebSocket<P1MeterMeasurementResponse>;
    /**
     * Start polling your P1 Meter using a specific method.
     *
     * To start polling, call the `start()` method on the returned object.
     * The polling can be stopped by calling the `stop()` method.
     *
     * Supported methods: `getData`, `getBatteries`, `getTelegram` and `getParsedTelegram`
     */
    get polling(): P1MeterPollingV2<TelegramResponse, ParsedTelegram, BatteriesResponse>;
    /**
     * The /api/telegram endpoint returns the most recent, valid telegram that was given by the P1 meter in a text format.
     *
     * This method fetches the telegram and parses it and returns it as a JSON object.
     */
    getParsedTelegram<T extends ParsedTelegram>(): Promise<T>;
}
//# sourceMappingURL=p1-meter-api-v2.d.ts.map