"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeWizardEnergyApiV2PairError = exports.BaseApiV2 = exports.createCheckServerIdentity = exports.DEFAULT_PAIR_INTERVAL = exports.DEFAULT_PAIR_TIMEOUT = exports.PAIR_BUTTON_WINDOW = exports.DEFAULT_V2_HEADERS_TIMEOUT = exports.DEFAULT_V2_BODY_TIMEOUT = exports.HomeWizardEnergyApiV2ResponseError = void 0;
const undici_1 = require("undici");
const base_api_1 = require("./base-api");
const homewizard_ca_cert_1 = require("./homewizard-ca-cert");
const types_v2_1 = require("./types-v2");
const websocket_v2_1 = require("./websocket-v2");
class HomeWizardEnergyApiV2ResponseError extends base_api_1.HomeWizardEnergyApiResponseError {
    constructor(message, url, statusCode, response, errorCode) {
        super(message, url, statusCode, response);
        this.name = 'HomeWizardEnergyApiV2ResponseError';
        this.errorCode = errorCode;
    }
}
exports.HomeWizardEnergyApiV2ResponseError = HomeWizardEnergyApiV2ResponseError;
// The API v2 uses HTTPS, the TLS handshake on the device takes some time, so we need a bit more time than the API v1.
exports.DEFAULT_V2_BODY_TIMEOUT = 5000;
exports.DEFAULT_V2_HEADERS_TIMEOUT = 5000;
// After pressing the button, the user has 30 seconds to request the token.
exports.PAIR_BUTTON_WINDOW = 30000;
exports.DEFAULT_PAIR_TIMEOUT = 120000;
exports.DEFAULT_PAIR_INTERVAL = 2000;
/**
 * Creates the `checkServerIdentity` method to be used in the TLS connection to a device.
 *
 * A device has no domain name, its certificate is issued to `appliance/<product_type>/<serial>` (as Common Name).
 * The default hostname check of Node would always fail, so we check the Common Name ourself.
 *
 * @link https://api-documentation.homewizard.com/docs/v2/authorization#https
 */
function createCheckServerIdentity(identifier) {
    return (_hostname, cert) => {
        // No identifier given, we only validate the certificate chain
        if (!identifier)
            return undefined;
        const commonName = cert?.subject?.CN;
        const commonNames = Array.isArray(commonName) ? commonName : [commonName];
        if (commonNames.includes(identifier))
            return undefined;
        return new Error(`The certificate of the device is issued to "${commonNames.join(', ')}", but expected "${identifier}"`);
    };
}
exports.createCheckServerIdentity = createCheckServerIdentity;
/**
 * The base of the API v2. Contains everything that all devices that support the API v2 have in common:
 *
 * - HTTPS with certificate validation
 * - Authorization using a token (create, list and delete users)
 * - Error handling
 * - Device information, measurement, system and identify
 *
 * @link https://api-documentation.homewizard.com/docs/category/api-v2
 */
class BaseApiV2 extends base_api_1.BaseApi {
    constructor(baseUrl, options) {
        super(baseUrl, {
            ...options,
            api: { version: 'v2' },
            requestOptions: {
                bodyTimeout: exports.DEFAULT_V2_BODY_TIMEOUT,
                headersTimeout: exports.DEFAULT_V2_HEADERS_TIMEOUT,
                // Allow user to overwrite the defaults
                ...options?.requestOptions,
            },
        });
        this.token = options?.api?.token;
        this.identifier = options?.api?.identifier;
        this.websocketOptions = options?.websocket;
        const verifyCertificate = options?.api?.verifyCertificate !== false;
        // The same validation of the certificate is used for the HTTPS requests and the WebSocket
        this.tlsOptions = {
            ca: options?.api?.ca || homewizard_ca_cert_1.HOMEWIZARD_CA_CERT,
            rejectUnauthorized: verifyCertificate,
            checkServerIdentity: createCheckServerIdentity(verifyCertificate ? this.identifier : undefined),
        };
        // Only needed when using HTTPS and when the user did not provide its own dispatcher
        if (baseUrl.startsWith('https:') && !options?.requestOptions?.dispatcher) {
            this.dispatcher = new undici_1.Agent({
                connect: this.tlsOptions,
            });
        }
    }
    get endpoints() {
        const { baseUrl } = this;
        return {
            basic: `${baseUrl}/api`,
            // In the API v2 this is the "measurement" endpoint, we keep the name "data" to stay compatible with the API v1 classes
            data: `${baseUrl}/api/measurement`,
            user: `${baseUrl}/api/user`,
            system: `${baseUrl}/api/system`,
            identify: `${baseUrl}/api/system/identify`,
            reboot: `${baseUrl}/api/system/reboot`,
            batteries: `${baseUrl}/api/batteries`,
            telegram: `${baseUrl}/api/telegram`,
        };
    }
    /** `true` when a token is set. */
    get isAuthorized() {
        return !!this.token;
    }
    /** Set the token to use, received earlier from `createUser()` or `pair()`. */
    setToken(token) {
        this.token = token;
    }
    /**
     * The WebSocket of the device. The device pushes the data when it changes, so there is no need to poll the device.
     *
     * @example
     * api.websocket.on('measurement', measurement => console.log(measurement));
     * api.websocket.subscribe('measurement');
     * api.websocket.start();
     *
     * @link https://api-documentation.homewizard.com/docs/v2/websocket
     */
    get websocket() {
        if (!this.webSocket) {
            this.webSocket = new websocket_v2_1.HomeWizardEnergyWebSocket(
            // http://... => ws://... and https://... => wss://...
            `${this.baseUrl.replace(/^http/, 'ws')}/api/ws`, {
                getToken: () => this.token,
                tls: this.baseUrl.startsWith('https:') ? this.tlsOptions : undefined,
                logger: this.loggerOptions,
                websocket: this.websocketOptions,
            });
        }
        return this.webSocket;
    }
    /** Closes the connections to the device. Use this when you don't need this instance anymore. */
    async close() {
        if (this.webSocket) {
            this.webSocket.stop();
        }
        if (this.dispatcher) {
            await this.dispatcher.close();
        }
    }
    request(url, options) {
        return super.request(url, {
            ...(this.dispatcher ? { dispatcher: this.dispatcher } : {}),
            ...options,
            headers: {
                'X-Api-Version': types_v2_1.API_V2_HEADER_VERSION,
                ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
                ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
                ...options?.headers,
            },
        });
    }
    async throwResponseError(url, method, response) {
        const { statusCode, body } = response;
        const text = await body.text();
        let errorCode;
        try {
            const json = JSON.parse(text);
            if (typeof json?.error === 'string') {
                errorCode = json.error;
            }
        }
        catch (e) {
            // Not all endpoints respond with JSON (telegram)
            if (/^[a-z]+:[a-z-]+/.test(text)) {
                errorCode = text.trim();
            }
        }
        throw new HomeWizardEnergyApiV2ResponseError(`Api ${method} call at ${url} failed with status ${statusCode} and response data: ${text}`, url, statusCode, text, errorCode);
    }
    /**
     * Makes sure the name of the user starts with `local/`.
     */
    getLocalUserName(name) {
        return name.startsWith(types_v2_1.LOCAL_USER_PREFIX) ? name : `${types_v2_1.LOCAL_USER_PREFIX}${name}`;
    }
    /**
     * Creates a user on the device and returns its token. The token is also set on this instance.
     *
     * The user must press the button on the device first (kWh Meter: hold the button for 1 to 3 seconds).
     * When the button is not pressed (yet), this method throws an `HomeWizardEnergyApiV2ResponseError` with the
     * error code `user:creation-not-enabled`. After the button is pressed you have 30 seconds to create the user.
     *
     * You probably want to use `pair()`, it waits for the user to press the button.
     *
     * The name will be prefixed with `local/` when needed, the part after the prefix can be 1 to 40 characters:
     * `a-z`, `A-Z`, `0-9`, `-`, `_`, `\`, `/`, `#` and spaces.
     * Creating a user with a name that already exists gives you a new token, the previous token is not valid anymore.
     *
     * Store the token, it can not be requested again.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/authorization#create-a-user-and-get-token
     */
    async createUser(name) {
        const url = this.endpoints.user;
        const localName = this.getLocalUserName(name);
        this.log(`Creating user ${localName} at ${url}`);
        const method = 'POST';
        const response = await this.request(url, {
            method,
            body: JSON.stringify({ name: localName }),
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.token = data.token;
        // We don't log the token
        this.log(`Created user ${data.name} at ${url}`);
        return data;
    }
    /**
     * Creates a user like `createUser()`, but keeps trying until the user pressed the button on the device.
     *
     * Throws an `HomeWizardEnergyApiError` when the button is not pressed within the timeout or when the pairing is aborted.
     *
     * @example
     * const { token } = await api.pair('my-app', { timeout: 60000 });
     */
    async pair(name, options) {
        const timeout = options?.timeout || exports.DEFAULT_PAIR_TIMEOUT;
        const interval = options?.interval || exports.DEFAULT_PAIR_INTERVAL;
        const startedAt = Date.now();
        this.log(`Start pairing, waiting ${timeout}ms for the button to be pressed on the device...`);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (options?.signal?.aborted) {
                throw new HomeWizardEnergyApiV2PairError('Pairing aborted', 'aborted');
            }
            const remaining = timeout - (Date.now() - startedAt);
            if (remaining <= 0) {
                throw new HomeWizardEnergyApiV2PairError(`The button on the device was not pressed within ${timeout}ms`, 'timeout');
            }
            options?.onTry?.(remaining);
            try {
                return await this.createUser(name);
            }
            catch (error) {
                const isButtonNotPressed = error instanceof HomeWizardEnergyApiV2ResponseError &&
                    error.errorCode === types_v2_1.ErrorCodesV2.USER_CREATION_NOT_ENABLED;
                // Network errors happen (the device reboots, bad wifi...), just try again until the timeout.
                // Other errors of the API (invalid name, no storage...) won't go away by trying again.
                if (error instanceof HomeWizardEnergyApiV2ResponseError && !isButtonNotPressed) {
                    throw error;
                }
                this.log(isButtonNotPressed
                    ? 'Button not pressed yet, trying again...'
                    : `Received error while pairing, trying again: ${error}`);
            }
            // Wait for the next try, an abort ends the waiting immediately
            await new Promise(resolve => {
                const done = () => {
                    clearTimeout(timer);
                    options?.signal?.removeEventListener('abort', done);
                    resolve();
                };
                const timer = setTimeout(done, interval);
                options?.signal?.addEventListener('abort', done, { once: true });
            });
        }
    }
    /**
     * Returns all users of the device, including the users created by the HomeWizard cloud (`cloud/...`).
     *
     * @link https://api-documentation.homewizard.com/docs/v2/authorization#list-users
     */
    async getUsers() {
        const url = this.endpoints.user;
        this.log(`Fetching users at ${url}`);
        const method = 'GET';
        const response = await this.request(url, {
            method,
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.log(`Received users ${JSON.stringify(data)} from ${url}`);
        return data;
    }
    /**
     * Deletes a user from the device, its token is not valid anymore.
     *
     * The name must include the prefix (`local/` or `cloud/`).
     * Without a name the current user is deleted, the token of this instance is removed.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/authorization#delete-a-user
     */
    async deleteUser(name) {
        const url = this.endpoints.user;
        this.log(`Deleting user ${name || '(current)'} at ${url}`);
        const method = 'DELETE';
        const response = await this.request(url, {
            method,
            ...(name ? { body: JSON.stringify({ name }) } : {}),
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        // Make sure the body is consumed
        await response.body.text();
        if (!name) {
            this.token = undefined;
        }
        this.log(`Deleted user ${name || '(current)'} at ${url}`);
    }
    /**
     * Returns basic information from the device.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/device_information
     */
    getBasicInformation() {
        return super.getBasicInformation();
    }
    /**
     * The /api/measurement endpoint allows you to get the most recent measurement from the device.
     *
     * All datapoints are "optional"; The API does not send datapoints that are null. Make sure your application can handle this.
     *
     * To stay compatible with the API v1 classes this method is still named `getData`.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/measurement
     */
    getData() {
        return super.getData();
    }
    /**
     * The /api/system endpoint can be used to get the system settings and status (Wi-Fi, uptime, cloud, status LED).
     *
     * @link https://api-documentation.homewizard.com/docs/v2/system
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
        this.log(`Received system state ${JSON.stringify(data)} from ${url}`);
        return data;
    }
    /**
     * The /api/system endpoint can be used to configure system settings: `cloud_enabled`, `status_led_brightness_pct` and `api_v1_enabled`.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/system
     */
    async updateSystem(params) {
        const url = this.endpoints.system;
        this.log(`Setting system state to ${JSON.stringify(params)} at ${url}`);
        const method = 'PUT';
        const response = await this.request(url, {
            method,
            body: JSON.stringify(params),
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.log(`Received updated system state ${JSON.stringify(data)} from ${url}`);
        return data;
    }
    /**
     * The /api/system/identify endpoint can be used to let the user identify the device. The status light will blink for a few seconds after calling this endpoint.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/system#identify
     */
    async identify() {
        return this.putAction(this.endpoints.identify, 'identify');
    }
    /**
     * The /api/system/reboot endpoint reboots the device.
     *
     * A reboot is usually not needed. When the user needs to reboot often, they should contact the support of HomeWizard.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/system#reboot
     */
    async reboot() {
        return this.putAction(this.endpoints.reboot, 'reboot');
    }
    /**
     * Actions respond with "204 No Content".
     */
    async putAction(url, name) {
        this.log(`Requesting ${name} at ${url}`);
        const method = 'PUT';
        const response = await this.request(url, {
            method,
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        // Make sure the body is consumed
        await response.body.text();
        this.log(`Requested ${name} at ${url}`);
    }
    /**
     * The /api/batteries endpoint returns the state of the Plug-In Batteries that are controlled by this device.
     *
     * Only available for the `HWE-P1` and the kWh meters.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/batteries
     */
    async getBatteries() {
        const url = this.endpoints.batteries;
        this.log(`Fetching batteries at ${url}`);
        const method = 'GET';
        const response = await this.request(url, {
            method,
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.log(`Received batteries ${JSON.stringify(data)} from ${url}`);
        return data;
    }
    /**
     * The /api/batteries endpoint can be used to control the Plug-In Batteries: `mode`, `permissions` and `charge_to_full`.
     *
     * Only available for the `HWE-P1` and the kWh meters.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/batteries
     */
    async updateBatteries(params) {
        const url = this.endpoints.batteries;
        this.log(`Setting batteries to ${JSON.stringify(params)} at ${url}`);
        const method = 'PUT';
        const response = await this.request(url, {
            method,
            body: JSON.stringify(params),
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        const data = (await response.body.json());
        this.log(`Received updated batteries ${JSON.stringify(data)} from ${url}`);
        return data;
    }
    /**
     * The /api/telegram endpoint returns the most recent, valid telegram that was given by the P1 meter,
     * therefore this endpoint is only available for the `HWE-P1`.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/telegram
     */
    async getTelegram() {
        const url = this.endpoints.telegram;
        this.log(`Fetching telegram at ${url}`);
        const method = 'GET';
        const response = await this.request(url, {
            method,
            headers: { Accept: 'text/plain' },
        });
        if (!this.isResponseOk(response)) {
            return this.throwResponseError(url, method, response);
        }
        // Telegram endpoint returns plain text
        const data = (await response.body.text());
        this.log(`Received telegram ${JSON.stringify(data)} from ${url}`);
        return data;
    }
}
exports.BaseApiV2 = BaseApiV2;
class HomeWizardEnergyApiV2PairError extends Error {
    constructor(message, reason) {
        super(message);
        this.name = 'HomeWizardEnergyApiV2PairError';
        this.reason = reason;
    }
}
exports.HomeWizardEnergyApiV2PairError = HomeWizardEnergyApiV2PairError;
//# sourceMappingURL=base-api-v2.js.map