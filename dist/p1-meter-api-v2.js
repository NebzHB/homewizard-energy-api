"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.P1MeterApiV2 = void 0;
const base_api_v2_1 = require("./base-api-v2");
const telegram_1 = require("./utils/telegram");
/**
 * The API v2 of the P1 Meter (`HWE-P1`).
 *
 * @link https://api-documentation.homewizard.com/docs/category/api-v2
 */
class P1MeterApiV2 extends base_api_v2_1.BaseApiV2 {
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
    getTelegram() {
        return super.getTelegram();
    }
    constructor(baseUrl, options) {
        super(baseUrl, options);
    }
    get websocket() {
        return super.websocket;
    }
    /**
     * Start polling your P1 Meter using a specific method.
     *
     * To start polling, call the `start()` method on the returned object.
     * The polling can be stopped by calling the `stop()` method.
     *
     * Supported methods: `getData`, `getBatteries`, `getTelegram` and `getParsedTelegram`
     */
    get polling() {
        const getBatteries = 'getBatteries';
        const getTelegram = 'getTelegram';
        const getParsedTelegram = 'getParsedTelegram';
        return {
            ...super.polling,
            [getBatteries]: {
                start: () => super.startPolling(getBatteries, this[getBatteries].bind(this)),
                stop: () => super.stopPolling(getBatteries),
                on: super.on.bind(this),
            },
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
     * The /api/telegram endpoint returns the most recent, valid telegram that was given by the P1 meter in a text format.
     *
     * This method fetches the telegram and parses it and returns it as a JSON object.
     */
    async getParsedTelegram() {
        const telegram = await this.getTelegram();
        const parsedTelegram = (0, telegram_1.parseTelegram)(telegram);
        this.log(`Parsed telegram ${JSON.stringify(parsedTelegram)} from ${this.endpoints.telegram}`);
        return parsedTelegram;
    }
}
exports.P1MeterApiV2 = P1MeterApiV2;
//# sourceMappingURL=p1-meter-api-v2.js.map