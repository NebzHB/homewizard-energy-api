"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseApi = exports.DEFAULT_API_VERSION = exports.DEFAULT_HEADERS_TIMEOUT = exports.DEFAULT_BODY_TIMEOUT = exports.HomeWizardEnergyApiResponseError = exports.HomeWizardEnergyApiError = void 0;
const events_1 = require("events");
const undici_1 = require("undici");
class HomeWizardEnergyApiError extends Error {
    constructor(message) {
        super(message);
        this.name = 'HomeWizardEnergyApiError';
    }
}
exports.HomeWizardEnergyApiError = HomeWizardEnergyApiError;
class HomeWizardEnergyApiResponseError extends HomeWizardEnergyApiError {
    constructor(message, url, statusCode, response) {
        super(message);
        this.name = 'HomeWizardEnergyApiResponseError';
        this.url = url;
        this.statusCode = statusCode;
        this.response = response;
    }
}
exports.HomeWizardEnergyApiResponseError = HomeWizardEnergyApiResponseError;
// 2 seconds, we are on a local network, so all request should be fast
exports.DEFAULT_BODY_TIMEOUT = 2000;
exports.DEFAULT_HEADERS_TIMEOUT = 2000;
exports.DEFAULT_API_VERSION = 'v1';
/**
 * `TBaseDataResponse` is the response type of the data endpoint, it differs between the API v1 (`/api/v1/data`) and the API v2 (`/api/measurement`).
 */
class BaseApi {
    constructor(baseUrl, options) {
        this.isPolling = {};
        this.baseUrl = baseUrl;
        this.apiOptions = options?.api;
        this.apiVersion = this.apiOptions?.version || exports.DEFAULT_API_VERSION;
        this.requestOptions = {
            bodyTimeout: exports.DEFAULT_BODY_TIMEOUT,
            headersTimeout: exports.DEFAULT_HEADERS_TIMEOUT,
            // Allow user to overwrite the defaults
            ...options?.requestOptions,
        };
        this.pollingOptions = options?.polling;
        this.loggerOptions = options?.logger;
        this.eventEmitter = new events_1.EventEmitter();
    }
    get endpoints() {
        const { baseUrl } = this;
        return {
            basic: `${baseUrl}/api`,
            data: `${baseUrl}/api/${this.apiVersion}/data`, // all products
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event, listener) {
        return this.eventEmitter.on(event, listener);
    }
    request(url, options) {
        return (0, undici_1.request)(url, {
            ...this.requestOptions,
            ...options,
        });
    }
    log(...args) {
        if (!this.loggerOptions?.method)
            return;
        const loggerPrefix = this.loggerOptions.prefix || '[HomeWizard Energy API]:';
        return this.loggerOptions.method(loggerPrefix, ...args);
    }
    isResponseOk(response) {
        return response.statusCode >= 200 && response.statusCode < 300;
    }
    async throwResponseError(url, method, response) {
        const { statusCode, body } = response;
        const text = await body.text();
        throw new HomeWizardEnergyApiResponseError(`Api ${method} call at ${url} failed with status ${statusCode} and response data: ${text}`, url, statusCode, text);
    }
    /**
     * Returns basic information from the device.
     *
     * Your application can use this endpoint to see if your integration is designed to work with this version of the API.
     * You can validate your support based on the combination of product_type and api_version.
     * Datapoints in this endpoint that are currently available won’t change, but make sure your application can accept new datapoints for future updates.
     *
     * @link https://homewizard-energy-api.readthedocs.io/endpoints.html#basic-information-api
     */
    async getBasicInformation() {
        const url = this.endpoints.basic;
        this.log(`Fetching the basic information at ${url}`);
        const method = 'GET';
        const response = await this.request(url, {
            method,
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.log(`Fetched basic information: ${JSON.stringify(data)}`);
        return data;
    }
    /**
     * The /api/v1/data endpoint allows you to get the most recent measurement from the device.
     *
     * This response type only relates to the Energy Socket.
     *
     * All datapoints are “optional”; The API does not send datapoints that are null. Make sure your application can handle this.
     *
     * @link: https://homewizard-energy-api.readthedocs.io/endpoints.html#recent-measurement-api-v1-data
     */
    async getData() {
        const url = this.endpoints.data;
        this.log(`Fetching the data at ${url}`);
        const method = 'GET';
        const response = await this.request(url, {
            method,
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.log(`Fetched data: ${JSON.stringify(data)}`);
        return data;
    }
    /**
     * Stops polling for a specific method.
     */
    stopPolling(method) {
        if (!this.isPolling[method]) {
            this.log(`Polling for "${method}" is not started or already stopped.`);
            return;
        }
        this.isPolling[method] = false;
        this.log(`Stopping polling for "${method}".`);
    }
    /**
     * Start polling for a specific method.
     */
    get polling() {
        const getData = 'getData';
        return {
            [getData]: {
                start: () => this.startPolling(getData, this.getData.bind(this)),
                stop: () => this.stopPolling(getData),
                on: this.on.bind(this),
            },
        };
    }
    /**
     * Start polling for a specific method. This method will keep polling until the stop method is called.
     *
     * It will use the `interval` and `stopOnError` options from the polling options.
     */
    async startPolling(method, apiMethod) {
        const interval = this.pollingOptions?.interval || 1000;
        const stopOnError = !!this.pollingOptions?.stopOnError;
        this.isPolling[method] = true;
        while (this.isPolling[method]) {
            try {
                const response = await apiMethod();
                this.log(`Received response while polling "${method}". Emitting "response": ${JSON.stringify(response)}`);
                this.eventEmitter.emit('response', response);
            }
            catch (error) {
                this.log(`Received error while polling "${method}": ${JSON.stringify(error)}`);
                // If the user wants to stop polling on error, we stop polling
                if (stopOnError) {
                    this.stopPolling(method);
                }
                this.eventEmitter.emit('error', error);
            }
            finally {
                this.log(`Waiting for next polling interval for "${method}"...`);
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }
    }
}
exports.BaseApi = BaseApi;
//# sourceMappingURL=base-api.js.map