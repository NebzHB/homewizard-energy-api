/// <reference types="node" />
import { Dispatcher } from 'undici';
import { BaseApi, BaseApiOptions, HomeWizardEnergyApiResponseError, PollMethod, RequestParameters } from './base-api';
import { BasicInformationResponse } from './types';
import { BaseMeasurementResponse, BatteriesPutParams, BatteriesResponse, ErrorCodesV2, SystemV2PutParams, SystemV2Response, UserListResponse, UserResponse } from './types-v2';
import { TelegramResponse } from './types';
import { HomeWizardEnergyWebSocket, WebSocketConnectionOptions, WebSocketOptions } from './websocket-v2';
export declare class HomeWizardEnergyApiV2ResponseError extends HomeWizardEnergyApiResponseError {
    /**
     * The error code of the API v2, for example `user:unauthorized`.
     *
     * `undefined` when the response of the device is not a (known) API v2 error.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/error-handling
     */
    errorCode?: ErrorCodesV2 | string;
    constructor(message: string, url: string, statusCode: number, response: string, errorCode?: ErrorCodesV2 | string);
}
export interface ApiV2Options {
    /**
     * The token of the user, received from `createUser()` or `pair()`.
     *
     * Without a token only `createUser()` and `pair()` can be used.
     */
    token?: string;
    /**
     * The identifier of the device, formatted as `appliance/<product_type>/<serial>`.
     *
     * This is the `id` txt record of the mDNS discovery response, or can be created using `getCertificateIdentifier()`.
     *
     * When set, the certificate of the device must be issued to this identifier.
     * When not set, only the certificate chain is validated (the device is a genuine HomeWizard device, but could be any).
     */
    identifier?: string;
    /**
     * When `false` the certificate of the device is not validated at all. Defaults to `true`.
     *
     * Only use this for debugging purposes.
     */
    verifyCertificate?: boolean;
    /** The CA certificate (PEM) to validate the certificate of the device. Defaults to the HomeWizard CA certificate. */
    ca?: string;
}
export interface BaseApiV2Options extends Omit<BaseApiOptions, 'api'> {
    /** Options specific to the HomeWizard Energy API v2 */
    api?: ApiV2Options;
    /** Options of the WebSocket (`api.websocket`) */
    websocket?: WebSocketOptions;
}
export interface PairOptions {
    /** The time in milliseconds to wait for the user to press the button on the device. Defaults to `120000` (2 minutes). */
    timeout?: number;
    /** The time in milliseconds between each try. Defaults to `2000`. */
    interval?: number;
    /** Abort the pairing when the signal is aborted. */
    signal?: AbortSignal;
    /** Invoked before each try, can be used to show a countdown to the user. */
    onTry?: (remainingMs: number) => void;
}
export interface BatteriesPolling<TBatteriesResponse extends BatteriesResponse> {
    getBatteries: PollMethod<TBatteriesResponse>;
}
export declare const DEFAULT_V2_BODY_TIMEOUT = 5000;
export declare const DEFAULT_V2_HEADERS_TIMEOUT = 5000;
export declare const PAIR_BUTTON_WINDOW = 30000;
export declare const DEFAULT_PAIR_TIMEOUT = 120000;
export declare const DEFAULT_PAIR_INTERVAL = 2000;
/**
 * Creates the `checkServerIdentity` method to be used in the TLS connection to a device.
 *
 * A device has no domain name, its certificate is issued to `appliance/<product_type>/<serial>` (as Common Name).
 * The default hostname check of Node would always fail, so we check the Common Name ourself.
 *
 * @link https://api-documentation.homewizard.com/docs/v2/authorization#https
 */
export declare function createCheckServerIdentity(identifier?: string): (_hostname: string, cert: {
    subject?: {
        CN?: string | string[];
    };
}) => Error | undefined;
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
export declare class BaseApiV2 extends BaseApi<BaseMeasurementResponse> {
    protected token: ApiV2Options['token'];
    protected readonly identifier: ApiV2Options['identifier'];
    protected readonly dispatcher: Dispatcher | undefined;
    protected readonly tlsOptions: WebSocketConnectionOptions['tls'];
    protected readonly websocketOptions: WebSocketOptions | undefined;
    protected webSocket: HomeWizardEnergyWebSocket | undefined;
    constructor(baseUrl: string, options?: BaseApiV2Options);
    protected get endpoints(): {
        basic: string;
        data: string;
        user: string;
        system: string;
        identify: string;
        reboot: string;
        batteries: string;
        telegram: string;
    };
    /** `true` when a token is set. */
    get isAuthorized(): boolean;
    /** Set the token to use, received earlier from `createUser()` or `pair()`. */
    setToken(token: string | undefined): void;
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
    get websocket(): HomeWizardEnergyWebSocket;
    /** Closes the connections to the device. Use this when you don't need this instance anymore. */
    close(): Promise<void>;
    protected request(url: RequestParameters[0], options: RequestParameters[1]): Promise<Dispatcher.ResponseData>;
    protected throwResponseError(url: string, method: string, response: Dispatcher.ResponseData): Promise<never>;
    /**
     * Makes sure the name of the user starts with `local/`.
     */
    protected getLocalUserName(name: string): string;
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
    createUser(name: string): Promise<UserResponse>;
    /**
     * Creates a user like `createUser()`, but keeps trying until the user pressed the button on the device.
     *
     * Throws an `HomeWizardEnergyApiError` when the button is not pressed within the timeout or when the pairing is aborted.
     *
     * @example
     * const { token } = await api.pair('my-app', { timeout: 60000 });
     */
    pair(name: string, options?: PairOptions): Promise<UserResponse>;
    /**
     * Returns all users of the device, including the users created by the HomeWizard cloud (`cloud/...`).
     *
     * @link https://api-documentation.homewizard.com/docs/v2/authorization#list-users
     */
    getUsers(): Promise<UserListResponse>;
    /**
     * Deletes a user from the device, its token is not valid anymore.
     *
     * The name must include the prefix (`local/` or `cloud/`).
     * Without a name the current user is deleted, the token of this instance is removed.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/authorization#delete-a-user
     */
    deleteUser(name?: string): Promise<void>;
    /**
     * Returns basic information from the device.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/device_information
     */
    protected getBasicInformation<T extends BasicInformationResponse>(): Promise<T>;
    /**
     * The /api/measurement endpoint allows you to get the most recent measurement from the device.
     *
     * All datapoints are "optional"; The API does not send datapoints that are null. Make sure your application can handle this.
     *
     * To stay compatible with the API v1 classes this method is still named `getData`.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/measurement
     */
    protected getData<T extends BaseMeasurementResponse>(): Promise<T>;
    /**
     * The /api/system endpoint can be used to get the system settings and status (Wi-Fi, uptime, cloud, status LED).
     *
     * @link https://api-documentation.homewizard.com/docs/v2/system
     */
    protected getSystem(): Promise<SystemV2Response>;
    /**
     * The /api/system endpoint can be used to configure system settings: `cloud_enabled`, `status_led_brightness_pct` and `api_v1_enabled`.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/system
     */
    protected updateSystem(params: SystemV2PutParams): Promise<SystemV2Response>;
    /**
     * The /api/system/identify endpoint can be used to let the user identify the device. The status light will blink for a few seconds after calling this endpoint.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/system#identify
     */
    protected identify(): Promise<void>;
    /**
     * The /api/system/reboot endpoint reboots the device.
     *
     * A reboot is usually not needed. When the user needs to reboot often, they should contact the support of HomeWizard.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/system#reboot
     */
    protected reboot(): Promise<void>;
    /**
     * Actions respond with "204 No Content".
     */
    protected putAction(url: string, name: string): Promise<void>;
    /**
     * The /api/batteries endpoint returns the state of the Plug-In Batteries that are controlled by this device.
     *
     * Only available for the `HWE-P1` and the kWh meters.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/batteries
     */
    protected getBatteries<T extends BatteriesResponse>(): Promise<T>;
    /**
     * The /api/batteries endpoint can be used to control the Plug-In Batteries: `mode`, `permissions` and `charge_to_full`.
     *
     * Only available for the `HWE-P1` and the kWh meters.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/batteries
     */
    protected updateBatteries<T extends BatteriesResponse>(params: BatteriesPutParams): Promise<T>;
    /**
     * The /api/telegram endpoint returns the most recent, valid telegram that was given by the P1 meter,
     * therefore this endpoint is only available for the `HWE-P1`.
     *
     * @link https://api-documentation.homewizard.com/docs/v2/telegram
     */
    protected getTelegram<T extends TelegramResponse>(): Promise<T>;
}
export declare class HomeWizardEnergyApiV2PairError extends Error {
    reason: 'timeout' | 'aborted';
    constructor(message: string, reason: 'timeout' | 'aborted');
}
//# sourceMappingURL=base-api-v2.d.ts.map