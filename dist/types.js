"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = exports.SupportedDevicesList = exports.MDNS_DISCOVERY_QUERY_TYPE = exports.MDNS_DISCOVERY_DOMAIN = exports.MDNS_DISCOVERY_PROTOCOL = exports.MDNS_DISCOVERY_TYPE = void 0;
/**
 * We can discover devices on the local network using the `_hwenergy._tcp` domain.
 *
 * The Bonjour service we use in our plugin only needs `hwenergy` and use the option `protocol: 'tcp'`.
 *
 * @link: https://homewizard-energy-api.readthedocs.io/discovery.html#discovery
 */
exports.MDNS_DISCOVERY_TYPE = 'hwenergy';
exports.MDNS_DISCOVERY_PROTOCOL = 'tcp';
exports.MDNS_DISCOVERY_DOMAIN = `_${exports.MDNS_DISCOVERY_TYPE}._${exports.MDNS_DISCOVERY_PROTOCOL}.local`; // _hwenergy._tcp.local
exports.MDNS_DISCOVERY_QUERY_TYPE = 'PTR';
/**
 * A list of device types that HomeWizard supports.
 *
 * The supported devices are listed below. The device type is used as identifier within the API.
 *
 * @link https://homewizard-energy-api.readthedocs.io/getting-started.html#supported-devices
 */
exports.SupportedDevicesList = [
    'HWE-P1',
    'HWE-SKT',
    'HWE-WTR',
    'SDM230-wifi',
    'SDM630-wifi',
    'HWE-KWH1',
    'HWE-KWH3',
    'HWE-BAT',
    'HWE-DSP',
    'HWE-TMP',
];
/**
 * When you perform an invalid request or something went wrong, the API will respond with an error message.
 * You have to check if the HTTP status code returns 200 OK before parsing the result.
 * If you use an endpoint that returns JSON, you also will receive an object with some error information.
 *
 * @link: https://homewizard-energy-api.readthedocs.io/error-handling.html
 */
var ErrorCodes;
(function (ErrorCodes) {
    ErrorCodes[ErrorCodes["BODY_CONTAINS_INVALID_JSON"] = 2] = "BODY_CONTAINS_INVALID_JSON";
    ErrorCodes[ErrorCodes["NO_DATA_IN_BODY"] = 5] = "NO_DATA_IN_BODY";
    ErrorCodes[ErrorCodes["INVALID_VALUE_FOR_PARAMETER"] = 7] = "INVALID_VALUE_FOR_PARAMETER";
    ErrorCodes[ErrorCodes["PARAMETER_IS_NOT_MODIFIABLE"] = 8] = "PARAMETER_IS_NOT_MODIFIABLE";
    ErrorCodes[ErrorCodes["REQUEST_TO_LONG"] = 201] = "REQUEST_TO_LONG";
    ErrorCodes[ErrorCodes["API_DISABLED"] = 202] = "API_DISABLED";
    ErrorCodes[ErrorCodes["INTERNAL_ERROR"] = 901] = "INTERNAL_ERROR";
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
//# sourceMappingURL=types.js.map