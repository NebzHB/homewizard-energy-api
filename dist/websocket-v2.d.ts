/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
import { ConnectionOptions } from 'tls';
import WebSocket from 'ws';
import { LoggerOptions } from './base-api';
import { BasicInformationResponse } from './types';
import { BaseMeasurementResponse, BatteriesPutParams, BatteriesResponse, ErrorCodesV2, SystemV2PutParams, SystemV2Response, UserListResponse } from './types-v2';
/**
 * The topics of the WebSocket. Use `*` to subscribe to all topics.
 *
 * - `system`: only `cloud_enabled` and `status_led_brightness_pct` are updated in real time
 * - `batteries`: only `mode`, `permissions` and `target_power_w` are updated in real time
 *
 * @link https://api-documentation.homewizard.com/docs/v2/websocket
 */
export type WebSocketTopic = 'device' | 'user' | 'measurement' | 'system' | 'batteries';
export declare const WebSocketTopics: WebSocketTopic[];
export interface WebSocketMessage {
    type: string;
    data?: unknown;
}
export interface WebSocketOptions {
    /** Connect again when the connection is lost. Defaults to `true`. */
    reconnect?: boolean;
    /** The time in milliseconds to wait before connecting again. Defaults to `5000`. */
    reconnectInterval?: number;
    /**
     * The interval in milliseconds to check if the connection is still alive (ping). Defaults to `30000`, use `0` to disable.
     * The connection is closed (and opened again) when nothing is received during two intervals.
     */
    heartbeatInterval?: number;
}
export interface WebSocketConnectionOptions {
    /** Returns the token to authorize with, requested each time the device asks for authorization. */
    getToken: () => string | undefined;
    /** The TLS options, the same as used for the HTTPS requests. */
    tls?: Pick<ConnectionOptions, 'ca' | 'rejectUnauthorized' | 'checkServerIdentity'>;
    logger?: LoggerOptions;
    websocket?: WebSocketOptions;
}
export declare class HomeWizardEnergyApiV2WebSocketError extends Error {
    /** The error code of the API v2, for example `request:unknown-subscription`. */
    errorCode?: ErrorCodesV2 | string;
    constructor(message: string, errorCode?: ErrorCodesV2 | string);
}
export declare const WEBSOCKET_AUTHORIZATION_TIMEOUT = 40000;
export declare const WEBSOCKET_AUTHORIZED_TIMEOUT = 10000;
export declare const DEFAULT_WEBSOCKET_RECONNECT_INTERVAL = 5000;
export declare const DEFAULT_WEBSOCKET_HEARTBEAT_INTERVAL = 30000;
/**
 * The WebSocket of the API v2. The device pushes the data when it changes, so there is no need to poll the device.
 *
 * @example
 * api.websocket.on('measurement', measurement => console.log(measurement));
 * api.websocket.on('error', error => console.log(error));
 * api.websocket.subscribe('measurement');
 * api.websocket.start();
 *
 * @link https://api-documentation.homewizard.com/docs/v2/websocket
 */
export declare class HomeWizardEnergyWebSocket<TMeasurementResponse extends BaseMeasurementResponse = BaseMeasurementResponse> {
    protected readonly url: string;
    protected readonly connectionOptions: WebSocketConnectionOptions;
    protected readonly eventEmitter: EventEmitter;
    protected readonly subscriptions: Set<WebSocketTopic | "*">;
    protected socket: WebSocket | null;
    protected started: boolean;
    protected authorized: boolean;
    protected reconnectTimeout: ReturnType<typeof setTimeout> | null;
    protected heartbeatTimer: ReturnType<typeof setInterval> | null;
    protected authorizedTimeout: ReturnType<typeof setTimeout> | null;
    protected lastActivityAt: number;
    constructor(url: string, connectionOptions: WebSocketConnectionOptions);
    /** `true` when the WebSocket is started (it might still be connecting). */
    get isStarted(): boolean;
    /** `true` when the connection is open and the device accepted the token. */
    get isAuthorized(): boolean;
    protected log(...args: unknown[]): void;
    on(event: 'measurement', listener: (measurement: TMeasurementResponse) => void): this;
    on(event: 'system', listener: (system: SystemV2Response) => void): this;
    on(event: 'batteries', listener: (batteries: BatteriesResponse) => void): this;
    on(event: 'device', listener: (device: BasicInformationResponse) => void): this;
    on(event: 'user', listener: (users: UserListResponse) => void): this;
    /** The connection is open and the device accepted the token, the subscriptions are (re)sent. */
    on(event: 'authorized', listener: () => void): this;
    /** The connection is closed. When `reconnect` is enabled, a new connection is made after the interval. */
    on(event: 'close', listener: (code: number, reason: string) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    /** Every message received from the device. */
    on(event: 'message', listener: (message: WebSocketMessage) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    /** Removes all listeners (of the event). */
    removeAllListeners(event?: string): this;
    /**
     * Opens the connection to the device and authorizes with the token.
     */
    start(): void;
    /**
     * Closes the connection to the device, the subscriptions are kept for the next `start()`.
     */
    stop(): void;
    /**
     * Subscribe to a topic. The device sends the latest values, and sends an update when the data changes.
     *
     * Can be invoked before `start()`, subscriptions are sent again after a reconnect.
     */
    subscribe(topic: WebSocketTopic | '*'): this;
    unsubscribe(topic: WebSocketTopic | '*'): this;
    /**
     * Ask the device to send the latest values of a topic once, they are received in the event of the topic.
     */
    request(topic: WebSocketTopic): void;
    /**
     * Change the system settings, the new values are received in the `system` event.
     */
    updateSystem(params: SystemV2PutParams): void;
    /**
     * Control the Plug-In Batteries, the new values are received in the `batteries` event. Only for the `HWE-P1` and the kWh meters.
     */
    updateBatteries(params: BatteriesPutParams): void;
    /**
     * The status light will blink for a few seconds.
     */
    identify(): void;
    protected send(message: WebSocketMessage): void;
    protected connect(): void;
    protected handleMessage(socket: WebSocket, text: string): void;
    protected startHeartbeat(): void;
    protected clearAuthorizedTimeout(): void;
    protected stopHeartbeat(): void;
}
//# sourceMappingURL=websocket-v2.d.ts.map