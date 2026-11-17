"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlugInBatteryApiV2 = void 0;
const base_api_v2_1 = require("./base-api-v2");
/**
 * The API v2 of the Plug-In Battery (`HWE-BAT`). This device only supports the API v2.
 *
 * The Plug-In Battery itself only exposes its measurements. To control the batteries (mode, permissions...)
 * use `getBatteries()` and `updateBatteries()` of the P1 Meter or kWh Meter that controls the batteries.
 *
 * Reboot is not available for safety reasons.
 *
 * @link https://api-documentation.homewizard.com/docs/category/api-v2
 */
class PlugInBatteryApiV2 extends base_api_v2_1.BaseApiV2 {
    getBasicInformation() {
        return super.getBasicInformation();
    }
    getData() {
        return super.getData();
    }
    getSystem() {
        return super.getSystem();
    }
    /**
     * Only `status_led_brightness_pct` can be changed, `cloud_enabled` is always `true` and `api_v1_enabled` is not available.
     */
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
exports.PlugInBatteryApiV2 = PlugInBatteryApiV2;
//# sourceMappingURL=plug-in-battery-api-v2.js.map