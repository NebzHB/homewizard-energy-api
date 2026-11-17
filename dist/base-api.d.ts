/// <reference types="node" />
import { EventEmitter } from 'events';
import { Dispatcher, request as undiciRequest } from 'undici';
import { BasicInformationResponse, BaseDataResponse } from './types';
export type RequestParameters = Parameters<typeof undiciRequest>;
export declare class HomeWizardEnergyApiError extends Error {
    constructor(message: string);
}
export declare class HomeWizardEnergyApiResponseError extends HomeWizardEnergyApiError {
    url: string;
    statusCode: number;
    response: string;
    constructor(message: string, url: string, statusCode: number, response: string);
}
export interface PollingOptions {
    /**
     * The polling interval in milliseconds. Defaults to `1000`.
     *
     * There is no limit to the time between each request on the local API, however,
     * HomeWizard advises not to retrieve data more often than every `500`ms.
     *
     * @link: https://homewizard-energy-api.readthedocs.io/getting-started.html#data-update-frequency
     * */
    interval?: number;
    /**
     * When `true` will stop polling the API when a error occurs. Defaults to `false`.
     *
     * You can listen for an error using:
     *
     * @example
     * api.polling.getMethod.on('error', (error) => console.log(error)) */
    stopOnError?: boolean;
}
export interface LoggerOptions {
    /** The log method to use. */
    method?: (...args: unknown[]) => void;
    /** The prefix that will show before the log. Defaults to `[HomeWizard Energy API]:` */
    prefix?: string;
}
export type ApiVersion = 'v1' | 'v2' | undefined;
export interface ApiOptions {
    /** The API version to be used. Defaults to `v1`. Use the `...ApiV2` classes for the API v2. */
    version?: ApiVersion;
}
export interface PollMethod<T> {
    start: () => void;
    stop: () => void;
    on(event: 'response', listener: (response: T) => void): void;
    on(event: 'error', listener: (error: Error) => void): void;
}
export interface BasePolling<TDataResponse extends object> {
    getData: PollMethod<TDataResponse>;
}
export interface BaseApiOptions {
    /** Options specific to the HomeWizard Energy API */
    api?: ApiOptions;
    /** Request options to be used in the HTTP request to the API */
    requestOptions?: RequestParameters[1];
    /** Logging options */
    logger?: LoggerOptions;
    /** Polling options to request API endpoints at the given interval. */
    polling?: PollingOptions;
}
export declare const DEFAULT_BODY_TIMEOUT = 2000;
export declare const DEFAULT_HEADERS_TIMEOUT = 2000;
export declare const DEFAULT_API_VERSION = "v1";
/**
 * `TBaseDataResponse` is the response type of the data endpoint, it differs between the API v1 (`/api/v1/data`) and the API v2 (`/api/measurement`).
 */
export declare class BaseApi<TBaseDataResponse extends object = BaseDataResponse> {
    protected readonly baseUrl: string;
    protected readonly apiOptions: BaseApiOptions['api'];
    protected readonly apiVersion: ApiVersion;
    protected requestOptions: BaseApiOptions['requestOptions'];
    protected loggerOptions: BaseApiOptions['logger'];
    protected pollingOptions: BaseApiOptions['polling'];
    protected eventEmitter: EventEmitter;
    protected isPolling: Record<string, boolean>;
    constructor(baseUrl: string, options?: BaseApiOptions);
    protected get endpoints(): {
        basic: string;
        data: string;
    };
    protected on<T>(event: 'response', listener: (response: T) => void): void;
    protected on(event: 'error', listener: (error: Error) => void): void;
    protected request(url: RequestParameters[0], options: RequestParameters[1]): Promise<Dispatcher.ResponseData>;
    protected log(...args: unknown[]): void;
    protected isResponseOk(response: Dispatcher.ResponseData): boolean;
    protected throwResponseError(url: string, method: string, response: Dispatcher.ResponseData): Promise<never>;
    /**
     * Returns basic information from the device.
     *
     * Your application can use this endpoint to see if your integration is designed to work with this version of the API.
     * You can validate your support based on the combination of product_type and api_version.
     * Datapoints in this endpoint that are currently available won’t change, but make sure your application can accept new datapoints for future updates.
     *
     * @link https://homewizard-energy-api.readthedocs.io/endpoints.html#basic-information-api
     */
    protected getBasicInformation<T extends BasicInformationResponse>(): Promise<T>;
    /**
     * The /api/v1/data endpoint allows you to get the most recent measurement from the device.
     *
     * This response type only relates to the Energy Socket.
     *
     * All datapoints are “optional”; The API does not send datapoints that are null. Make sure your application can handle this.
     *
     * @link: https://homewizard-energy-api.readthedocs.io/endpoints.html#recent-measurement-api-v1-data
     */
    protected getData<T extends TBaseDataResponse>(): Promise<T>;
    /**
     * Stops polling for a specific method.
     */
    protected stopPolling(method: string): void;
    /**
     * Start polling for a specific method.
     */
    get polling(): BasePolling<TBaseDataResponse>;
    /**
     * Start polling for a specific method. This method will keep polling until the stop method is called.
     *
     * It will use the `interval` and `stopOnError` options from the polling options.
     */
    protected startPolling(method: string, apiMethod: () => Promise<unknown>): Promise<void>;
}
//# sourceMappingURL=base-api.d.ts.map