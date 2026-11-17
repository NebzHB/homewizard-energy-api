"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaterMeterApi = void 0;
const base_api_1 = require("./base-api");
class WaterMeterApi extends base_api_1.BaseApi {
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
    get polling() {
        return super.polling;
    }
}
exports.WaterMeterApi = WaterMeterApi;
//# sourceMappingURL=water-meter-api.js.map