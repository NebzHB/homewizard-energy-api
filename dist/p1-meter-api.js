"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.P1MeterApi = void 0;
const base_api_1 = require("./base-api");
const telegram_1 = require("./utils/telegram");
class P1MeterApi extends base_api_1.BaseApi {
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
            telegram: `${baseUrl}/api/${this.apiVersion}/telegram`,
            identify: `${baseUrl}/api/${this.apiVersion}/identify`,
            system: `${baseUrl}/api/${this.apiVersion}/system`,
        };
    }
    /**
     * Start polling your P1 Meter using a specific method.
     *
     * To start polling, call the `start()` method on the returned object.
     * The polling can be stopped by calling the `stop()` method.
     *
     * Supported methods: `getData`, `getTelegram` and `getParsedTelegram`
     */
    get polling() {
        const getTelegram = 'getTelegram';
        const getParsedTelegram = 'getParsedTelegram';
        return {
            ...super.polling,
            [getTelegram]: {
                start: () => super.startPolling(getTelegram, this[getTelegram].bind(this)),
                stop: () => super.stopPolling(getTelegram),
                on: super.on.bind(this),
            },
            [getParsedTelegram]: {
                start: () => super.startPolling(getParsedTelegram, this[getParsedTelegram].bind(this)),
                stop: () => super.stopPolling(getParsedTelegram),
                on: super.on.bind(this),
            },
        };
    }
    /**
     * The /api/v1/telegram endpoint returns the most recent, valid telegram that was given by the P1 meter,
     * therefore this endpoint is only available for the HWE-P1.
     *
     * The telegram validated with its CRC, but not parsed in any form.
     *
     * Note that this endpoint returns plain text instead of formatted JSON, even when an error occours (see Error handling)
     *
     * @link: https://homewizard-energy-api.readthedocs.io/endpoints.html#p1-telegram-api-v1-telegram
     */
    async getTelegram() {
        const url = this.endpoints.telegram;
        this.log(`Fetching telegram at ${url}`);
        const method = 'GET';
        const response = await this.request(url, {
            method,
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        // Telegram endpoint returns plain text
        const data = (await response.body.text());
        this.log(`Received telegram ${JSON.stringify(data)} from ${this.endpoints.telegram}`);
        return data;
    }
    /**
     * The /api/v1/telegram endpoint returns the most recent, valid telegram that was given by the P1 meter in a text format.
     *
     * This method fetches the telegram and parses it and returns it as a JSON object.
     */
    async getParsedTelegram() {
        const telegram = await this.getTelegram();
        const parsedTelegram = (0, telegram_1.parseTelegram)(telegram);
        this.log(`Parsed telegram ${JSON.stringify(parsedTelegram)} from ${this.endpoints.telegram}`);
        return parsedTelegram;
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
     * This feature is currently only available for HWE-P1 running firmware version 4.00 or later.
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
exports.P1MeterApi = P1MeterApi;
//# sourceMappingURL=p1-meter-api.js.map