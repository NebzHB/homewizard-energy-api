"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KwhMeter3PhaseApi = void 0;
const base_api_1 = require("./base-api");
class KwhMeter3PhaseApi extends base_api_1.BaseApi {
    getBasicInformation() {
        return super.getBasicInformation();
    }
    getData() {
        return super.getData();
    }
    startPolling(method, apiMethod) {
        return super.startPolling(method, apiMethod);
    }
    constructor(baseUrl, options) {
        super(baseUrl, options);
    }
    get endpoints() {
        const { baseUrl } = this;
        return {
            ...super.endpoints,
            system: `${baseUrl}/api/${this.apiVersion}/system`,
        };
    }
    get polling() {
        return super.polling;
    }
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
    async getSystem() {
        const url = this.endpoints.system;
        this.log(`Fetching system state at ${url}`);
        const method = 'GET';
        const response = await this.request(url, {
            method,
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.log(`Received system state ${JSON.stringify(data)} from ${this.endpoints.system}`);
        return data;
    }
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
    async updateSystem(params) {
        const url = this.endpoints.system;
        this.log(`Setting system state to ${JSON.stringify(params)} at ${this.endpoints.system}`);
        const method = 'PUT';
        const response = await this.request(this.endpoints.system, {
            method,
            body: JSON.stringify(params),
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.log(`Received updated system state ${JSON.stringify(data)} from ${this.endpoints.system}`);
        return data;
    }
}
exports.KwhMeter3PhaseApi = KwhMeter3PhaseApi;
//# sourceMappingURL=kwh-meter-3-phase-api.js.map