"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergySocketApi = void 0;
const base_api_1 = require("./base-api");
class EnergySocketApi extends base_api_1.BaseApi {
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
            state: `${baseUrl}/api/${this.apiVersion}/state`,
            identify: `${baseUrl}/api/${this.apiVersion}/identify`,
            system: `${baseUrl}/api/${this.apiVersion}/system`,
        };
    }
    /**
     * Start polling your Energy Socket using a specific method.
     *
     * To start polling, call the `start()` method on the returned object.
     * The polling can be stopped by calling the `stop()` method.
     *
     * Supported methods: `getData`, `getState`
     */
    get polling() {
        const getState = 'getState';
        return {
            ...super.polling,
            [getState]: {
                start: () => super.startPolling(getState, this.getState.bind(this)),
                stop: () => super.stopPolling(getState),
                on: super.on.bind(this),
            },
        };
    }
    /**
     * Returns the actual state of the Energy Socket. This endpoint is only available for the HWE-SKT.
     *
     * @link https://homewizard-energy-api.readthedocs.io/endpoints.html#state-api-v1-state
     */
    async getState() {
        const url = this.endpoints.state;
        this.log(`Fetching the state at ${url}`);
        const method = 'GET';
        const response = await this.request(url, {
            method,
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.log(`Received state ${JSON.stringify(data)} from ${this.endpoints.state}`);
        return data;
    }
    /**
     * Control the state of the Energy Socket. This endpoint is only available for the HWE-SKT.
     *
     * @link https://homewizard-energy-api.readthedocs.io/endpoints.html#state-api-v1-state
     */
    async updateState(params) {
        const url = this.endpoints.state;
        this.log(`Setting the state to ${JSON.stringify(params)} at ${this.endpoints.state}`);
        const method = 'PUT';
        const response = await this.request(this.endpoints.state, {
            method,
            body: JSON.stringify(params),
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.log(`Received updated state ${JSON.stringify(data)} from ${this.endpoints.state}`);
        return data;
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
    /**
     * The /api/v1/identify endpoint can be used to let the user identify the device. The status light will blink for a few seconds after calling this endpoint.
     *
     * This feature is currently only available for HWE-SKT running firmware version 3.00 or later.
     *
     * @link https://homewizard-energy-api.readthedocs.io/endpoints.html#identify-api-v1-identify
     */
    async identify() {
        const url = this.endpoints.identify;
        this.log(`Fetching identify at ${url}`);
        const method = 'PUT';
        const response = await this.request(url, {
            method,
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.log(`Energy Socket identified: ${JSON.stringify(data)}`);
        return data;
    }
}
exports.EnergySocketApi = EnergySocketApi;
//# sourceMappingURL=energy-socket-api.js.map