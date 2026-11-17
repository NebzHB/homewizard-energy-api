"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaterMeterApiV2 = void 0;
const base_api_v2_1 = require("./base-api-v2");
/**
 * The API v2 of the Watermeter (`HWE-WTR`).
 *
 * **The API v2 is still in development for this device.** HomeWizard did not document it yet, so this class only
 * contains what all devices with the API v2 have in common (authorization, device information, measurement, system and identify).
 * These common methods are expected to work the same way once the firmware supports the API v2, but this is not verified.
 *
 * TODO (not documented yet):
 * - the datapoints of the measurement (`total_liter_m3` and `active_liter_lpm` in the API v1)
 *
 * @link https://api-documentation.homewizard.com/docs/category/api-v2
 */
class WaterMeterApiV2 extends base_api_v2_1.BaseApiV2 {
    getBasicInformation() {
        return super.getBasicInformation();
    }
    getData() {
        return super.getData();
    }
    getSystem() {
        return super.getSystem();
    }
    updateSystem(params) {
        return super.updateSystem(params);
    }
    identify() {
        return super.identify();
    }
    constructor(baseUrl, options) {
        super(baseUrl, options);
    }
    get websocket() {
        return super.websocket;
    }
    get polling() {
        return super.polling;
    }
}
exports.WaterMeterApiV2 = WaterMeterApiV2;
//# sourceMappingURL=water-meter-api-v2.js.map