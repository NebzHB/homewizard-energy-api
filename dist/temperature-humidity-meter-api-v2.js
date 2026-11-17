"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureHumidityMeterApiV2 = void 0;
const base_api_v2_1 = require("./base-api-v2");
/**
 * The API v2 of the Temperature Humidity Meter (`HWE-TMP`).
 *
 * **This device has no local API yet.** HomeWizard does not plan the API v1 for it and is only exploring the API v2
 * (the device is always battery powered), so it might never be available. This class is a preparation: it only
 * contains what all devices with the API v2 have in common (authorization, device information, measurement, system and identify).
 * Nothing of this class is verified against a device.
 *
 * TODO (not documented yet):
 * - the datapoints of the measurement (temperature and humidity, probably the battery level)
 * - if the device can be reached at any time, a battery powered device is probably asleep most of the time
 * - the product type used in the certificate (see `CertificateProductTypes`)
 *
 * @link https://api-documentation.homewizard.com/docs/introduction
 */
class TemperatureHumidityMeterApiV2 extends base_api_v2_1.BaseApiV2 {
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
        return super
            .websocket;
    }
    get polling() {
        return super.polling;
    }
}
exports.TemperatureHumidityMeterApiV2 = TemperatureHumidityMeterApiV2;
//# sourceMappingURL=temperature-humidity-meter-api-v2.js.map