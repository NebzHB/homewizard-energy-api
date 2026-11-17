"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KwhMeter3PhaseApiV2 = void 0;
const base_api_v2_1 = require("./base-api-v2");
/**
 * The API v2 of the kWh Meter 3-phase (`HWE-KWH3` and `SDM630-wifi`).
 *
 * @link https://api-documentation.homewizard.com/docs/category/api-v2
 */
class KwhMeter3PhaseApiV2 extends base_api_v2_1.BaseApiV2 {
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
    reboot() {
        return super.reboot();
    }
    getBatteries() {
        return super.getBatteries();
    }
    updateBatteries(params) {
        return super.updateBatteries(params);
    }
    constructor(baseUrl, options) {
        super(baseUrl, options);
    }
    get websocket() {
        return super.websocket;
    }
    /**
     * Start polling your kWh Meter using a specific method.
     *
     * Supported methods: `getData` and `getBatteries`
     */
    get polling() {
        const getBatteries = 'getBatteries';
        return {
            ...super.polling,
            [getBatteries]: {
                start: () => super.startPolling(getBatteries, this[getBatteries].bind(this)),
                stop: () => super.stopPolling(getBatteries),
                on: super.on.bind(this),
            },
        };
    }
}
exports.KwhMeter3PhaseApiV2 = KwhMeter3PhaseApiV2;
//# sourceMappingURL=kwh-meter-3-phase-api-v2.js.map