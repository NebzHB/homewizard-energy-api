import { BaseApiV2, BaseApiV2Options, BatteriesPolling } from './base-api-v2';
import { HomeWizardEnergyWebSocket } from './websocket-v2';
import { BasePolling } from './base-api';
import { BasicInformationResponse } from './types';
import { BatteriesPutParams, BatteriesResponse, KwhMeter1PhaseMeasurementResponse, SystemV2PutParams, SystemV2Response } from './types-v2';
export interface KwhMeter1PhasePollingV2<TBatteriesResponse extends BatteriesResponse> extends BasePolling<KwhMeter1PhaseMeasurementResponse>, BatteriesPolling<TBatteriesResponse> {
}
/**
 * The API v2 of the kWh Meter 1-phase (`HWE-KWH1` and `SDM230-wifi`).
 *
 * @link https://api-documentation.homewizard.com/docs/category/api-v2
 */
export declare class KwhMeter1PhaseApiV2 extends BaseApiV2 {
    getBasicInformation<T extends BasicInformationResponse>(): Promise<T>;
    getData<T extends KwhMeter1PhaseMeasurementResponse>(): Promise<T>;
    getSystem(): Promise<SystemV2Response>;
    updateSystem(params: SystemV2PutParams): Promise<SystemV2Response>;
    identify(): Promise<void>;
    reboot(): Promise<void>;
    getBatteries<T extends BatteriesResponse>(): Promise<T>;
    updateBatteries<T extends BatteriesResponse>(params: BatteriesPutParams): Promise<T>;
    constructor(baseUrl: string, options?: BaseApiV2Options);
    get websocket(): HomeWizardEnergyWebSocket<KwhMeter1PhaseMeasurementResponse>;
    /**
     * Start polling your kWh Meter using a specific method.
     *
     * Supported methods: `getData` and `getBatteries`
     */
    get polling(): KwhMeter1PhasePollingV2<BatteriesResponse>;
}
//# sourceMappingURL=kwh-meter-1-phase-api-v2.d.ts.map