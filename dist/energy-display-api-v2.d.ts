import { BaseApiV2, BaseApiV2Options } from './base-api-v2';
import { HomeWizardEnergyWebSocket } from './websocket-v2';
import { BasePolling } from './base-api';
import { BasicInformationResponse } from './types';
import { BaseMeasurementResponse, SystemV2PutParams, SystemV2Response } from './types-v2';
export type EnergyDisplayMeasurementResponse = BaseMeasurementResponse;
export type EnergyDisplayPollingV2 = BasePolling<EnergyDisplayMeasurementResponse>;
/**
 * The API v2 of the Energy Display (`HWE-DSP`). This device will only support the API v2.
 *
 * **The API v2 is still in development for this device.** HomeWizard did not document it yet, so this class only
 * contains what all devices with the API v2 have in common (authorization, device information, measurement, system and identify).
 * These common methods are expected to work the same way once the firmware supports the API v2, but this is not verified.
 *
 * TODO (not documented yet):
 * - the datapoints of the measurement (if any)
 * - everything specific to the display
 *
 * @link https://api-documentation.homewizard.com/docs/category/api-v2
 */
export declare class EnergyDisplayApiV2 extends BaseApiV2 {
    getBasicInformation<T extends BasicInformationResponse>(): Promise<T>;
    getData<T extends EnergyDisplayMeasurementResponse>(): Promise<T>;
    getSystem(): Promise<SystemV2Response>;
    updateSystem(params: SystemV2PutParams): Promise<SystemV2Response>;
    identify(): Promise<void>;
    constructor(baseUrl: string, options?: BaseApiV2Options);
    get websocket(): HomeWizardEnergyWebSocket<EnergyDisplayMeasurementResponse>;
    get polling(): EnergyDisplayPollingV2;
}
//# sourceMappingURL=energy-display-api-v2.d.ts.map