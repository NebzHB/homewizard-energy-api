import { BaseApiV2, BaseApiV2Options, BatteriesPolling } from './base-api-v2';
import { HomeWizardEnergyWebSocket } from './websocket-v2';
import { BasePolling } from './base-api';
import { BasicInformationResponse } from './types';
import { BatteriesPutParams, BatteriesResponse, KwhMeter3PhaseMeasurementResponse, SystemV2PutParams, SystemV2Response } from './types-v2';
export interface KwhMeter3PhasePollingV2<TBatteriesResponse extends BatteriesResponse> extends BasePolling<KwhMeter3PhaseMeasurementResponse>, BatteriesPolling<TBatteriesResponse> {
}
/**
 * The API v2 of the kWh Meter 3-phase (`HWE-KWH3` and `SDM630-wifi`).
 *
 * @link https://api-documentation.homewizard.com/docs/category/api-v2
 */
export declare class KwhMeter3PhaseApiV2 extends BaseApiV2 {
    getBasicInformation<T extends BasicInformationResponse>(): Promise<T>;
    getData<T extends KwhMeter3PhaseMeasurementResponse>(): Promise<T>;
    getSystem(): Promise<SystemV2Response>;
    updateSystem(params: SystemV2PutParams): Promise<SystemV2Response>;
    identify(): Promise<void>;
    reboot(): Promise<void>;
    getBatteries<T extends BatteriesResponse>(): Promise<T>;
    updateBatteries<T extends BatteriesResponse>(params: BatteriesPutParams): Promise<T>;
    constructor(baseUrl: string, options?: BaseApiV2Options);
    get websocket(): HomeWizardEnergyWebSocket<KwhMeter3PhaseMeasurementResponse>;
    /**
     * Start polling your kWh Meter using a specific method.
     *
     * Supported methods: `getData` and `getBatteries`
     */
    get polling(): KwhMeter3PhasePollingV2<BatteriesResponse>;
}
//# sourceMappingURL=kwh-meter-3-phase-api-v2.d.ts.map