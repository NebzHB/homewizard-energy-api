"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeWizardEnergyWebSocket = exports.DEFAULT_WEBSOCKET_HEARTBEAT_INTERVAL = exports.DEFAULT_WEBSOCKET_RECONNECT_INTERVAL = exports.WEBSOCKET_AUTHORIZED_TIMEOUT = exports.WEBSOCKET_AUTHORIZATION_TIMEOUT = exports.HomeWizardEnergyApiV2WebSocketError = exports.WebSocketTopics = void 0;
const events_1 = require("events");
const ws_1 = __importDefault(require("ws"));
const types_v2_1 = require("./types-v2");
exports.WebSocketTopics = [
    'device',
    'user',
    'measurement',
    'system',
    'batteries',
];
class HomeWizardEnergyApiV2WebSocketError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.name = 'HomeWizardEnergyApiV2WebSocketError';
        this.errorCode = errorCode;
    }
}
exports.HomeWizardEnergyApiV2WebSocketError = HomeWizardEnergyApiV2WebSocketError;
// The device closes the connection when it did not receive the token within 40 seconds.
exports.WEBSOCKET_AUTHORIZATION_TIMEOUT = 40000;
// When the device does not answer our token, the connection is closed (and opened again when reconnect is enabled).
exports.WEBSOCKET_AUTHORIZED_TIMEOUT = 10000;
exports.DEFAULT_WEBSOCKET_RECONNECT_INTERVAL = 5000;
exports.DEFAULT_WEBSOCKET_HEARTBEAT_INTERVAL = 30000;
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
class HomeWizardEnergyWebSocket {
    constructor(url, connectionOptions) {
        this.eventEmitter = new events_1.EventEmitter();
        this.subscriptions = new Set();
        this.socket = null;
        this.started = false;
        this.authorized = false;
        this.reconnectTimeout = null;
        this.heartbeatTimer = null;
        this.authorizedTimeout = null;
        this.lastActivityAt = 0;
        this.url = url;
        this.connectionOptions = connectionOptions;
        // An "error" event without a listener would throw, we don't want that
        this.eventEmitter.on('error', () => undefined);
    }
    /** `true` when the WebSocket is started (it might still be connecting). */
    get isStarted() {
        return this.started;
    }
    /** `true` when the connection is open and the device accepted the token. */
    get isAuthorized() {
        return this.authorized;
    }
    log(...args) {
        const logger = this.connectionOptions.logger;
        if (!logger?.method)
            return;
        return logger.method(logger.prefix || '[HomeWizard Energy API]:', ...args);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event, listener) {
        this.eventEmitter.on(event, listener);
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off(event, listener) {
        this.eventEmitter.off(event, listener);
        return this;
    }
    /** Removes all listeners (of the event). */
    removeAllListeners(event) {
        // An explicit undefined would only remove the listeners of the event named "undefined"
        if (event) {
            this.eventEmitter.removeAllListeners(event);
        }
        else {
            this.eventEmitter.removeAllListeners();
        }
        this.eventEmitter.on('error', () => undefined);
        return this;
    }
    /**
     * Opens the connection to the device and authorizes with the token.
     */
    start() {
        if (this.started) {
            this.log('WebSocket is already started.');
            return;
        }
        this.started = true;
        this.connect();
    }
    /**
     * Closes the connection to the device, the subscriptions are kept for the next `start()`.
     */
    stop() {
        this.started = false;
        this.authorized = false;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        this.stopHeartbeat();
        this.clearAuthorizedTimeout();
        if (this.socket) {
            this.log('Closing WebSocket.');
            // terminate() does not wait for the closing handshake, the device might be gone
            this.socket.terminate();
            this.socket = null;
        }
    }
    /**
     * Subscribe to a topic. The device sends the latest values, and sends an update when the data changes.
     *
     * Can be invoked before `start()`, subscriptions are sent again after a reconnect.
     */
    subscribe(topic) {
        this.subscriptions.add(topic);
        if (this.authorized) {
            this.send({ type: 'subscribe', data: topic });
        }
        return this;
    }
    unsubscribe(topic) {
        this.subscriptions.delete(topic);
        if (this.authorized) {
            this.send({ type: 'unsubscribe', data: topic });
        }
        return this;
    }
    /**
     * Ask the device to send the latest values of a topic once, they are received in the event of the topic.
     */
    request(topic) {
        this.send({ type: topic });
    }
    /**
     * Change the system settings, the new values are received in the `system` event.
     */
    updateSystem(params) {
        this.send({ type: 'system', data: params });
    }
    /**
     * Control the Plug-In Batteries, the new values are received in the `batteries` event. Only for the `HWE-P1` and the kWh meters.
     */
    updateBatteries(params) {
        this.send({ type: 'batteries', data: params });
    }
    /**
     * The status light will blink for a few seconds.
     */
    identify() {
        this.send({ type: 'identify' });
    }
    send(message) {
        if (!this.socket || !this.authorized) {
            throw new HomeWizardEnergyApiV2WebSocketError(`WebSocket is not authorized (yet), unable to send "${message.type}"`);
        }
        this.log(`Sending WebSocket message: ${JSON.stringify(message)}`);
        this.socket.send(JSON.stringify(message));
    }
    connect() {
        this.log(`Connecting to WebSocket at ${this.url}`);
        const socket = new ws_1.default(this.url, {
            handshakeTimeout: exports.WEBSOCKET_AUTHORIZATION_TIMEOUT,
            // The options are given to tls.connect() of Node, the types of "ws" differ for checkServerIdentity
            ...this.connectionOptions.tls,
        });
        this.socket = socket;
        this.authorized = false;
        socket.on('open', () => {
            this.log('WebSocket connected, waiting for the authorization request...');
            this.lastActivityAt = Date.now();
            this.startHeartbeat();
        });
        socket.on('pong', () => {
            this.lastActivityAt = Date.now();
        });
        socket.on('message', (raw) => {
            this.lastActivityAt = Date.now();
            this.handleMessage(socket, raw.toString());
        });
        socket.on('error', (error) => {
            this.log(`WebSocket error: ${error}`);
            this.eventEmitter.emit('error', error);
        });
        socket.on('close', (code, reason) => {
            // An old connection that we replaced or stopped
            if (this.socket !== socket)
                return;
            this.log(`WebSocket closed (${code})`);
            this.socket = null;
            this.authorized = false;
            this.stopHeartbeat();
            this.clearAuthorizedTimeout();
            this.eventEmitter.emit('close', code, reason.toString());
            if (this.started && this.connectionOptions.websocket?.reconnect !== false) {
                const interval = this.connectionOptions.websocket?.reconnectInterval ||
                    exports.DEFAULT_WEBSOCKET_RECONNECT_INTERVAL;
                this.log(`Connecting again in ${interval}ms...`);
                this.reconnectTimeout = setTimeout(() => {
                    this.reconnectTimeout = null;
                    if (this.started)
                        this.connect();
                }, interval);
            }
            else {
                this.started = false;
            }
        });
    }
    handleMessage(socket, text) {
        let message;
        try {
            message = JSON.parse(text);
        }
        catch (e) {
            this.eventEmitter.emit('error', new HomeWizardEnergyApiV2WebSocketError(`Received an invalid WebSocket message: ${text}`));
            return;
        }
        this.eventEmitter.emit('message', message);
        switch (message.type) {
            case 'authorization_requested': {
                const token = this.connectionOptions.getToken();
                if (!token) {
                    this.eventEmitter.emit('error', new HomeWizardEnergyApiV2WebSocketError('The device requests authorization, but there is no token. Use pair() or setToken() first.', types_v2_1.ErrorCodesV2.USER_UNAUTHORIZED));
                    this.stop();
                    return;
                }
                // We don't log the token
                this.log('Authorization requested, sending the token.');
                socket.send(JSON.stringify({ type: 'authorization', data: token }));
                // A connection that stays open without being authorized would never receive anything
                this.clearAuthorizedTimeout();
                this.authorizedTimeout = setTimeout(() => {
                    this.authorizedTimeout = null;
                    if (this.socket === socket && !this.authorized) {
                        this.log('No answer to the authorization, closing the WebSocket.');
                        socket.terminate();
                    }
                }, exports.WEBSOCKET_AUTHORIZED_TIMEOUT);
                break;
            }
            case 'authorized':
                this.log('WebSocket authorized.');
                this.clearAuthorizedTimeout();
                this.authorized = true;
                this.subscriptions.forEach(topic => this.send({ type: 'subscribe', data: topic }));
                this.eventEmitter.emit('authorized');
                break;
            case 'error': {
                const errorCode = message.data?.message;
                this.log(`Received WebSocket error: ${errorCode}`);
                this.eventEmitter.emit('error', new HomeWizardEnergyApiV2WebSocketError(`The device responded with the error: ${errorCode}`, errorCode));
                // The token is not accepted, connecting again will not help
                if (errorCode === types_v2_1.ErrorCodesV2.USER_UNAUTHORIZED) {
                    this.stop();
                }
                break;
            }
            default:
                if (exports.WebSocketTopics.includes(message.type)) {
                    this.eventEmitter.emit(message.type, message.data);
                }
                break;
        }
    }
    startHeartbeat() {
        const configured = this.connectionOptions.websocket?.heartbeatInterval;
        const interval = configured === undefined ? exports.DEFAULT_WEBSOCKET_HEARTBEAT_INTERVAL : configured;
        this.stopHeartbeat();
        if (!interval)
            return;
        this.heartbeatTimer = setInterval(() => {
            if (!this.socket)
                return;
            if (Date.now() - this.lastActivityAt > interval * 2) {
                this.log('Nothing received from the device, closing the WebSocket.');
                // Emits "close", which connects again when enabled
                this.socket.terminate();
                return;
            }
            if (this.socket.readyState === ws_1.default.OPEN) {
                this.socket.ping();
            }
        }, interval);
    }
    clearAuthorizedTimeout() {
        if (this.authorizedTimeout) {
            clearTimeout(this.authorizedTimeout);
            this.authorizedTimeout = null;
        }
    }
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
}
exports.HomeWizardEnergyWebSocket = HomeWizardEnergyWebSocket;
//# sourceMappingURL=websocket-v2.js.map