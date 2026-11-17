"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodesV2 = exports.LOCAL_USER_PREFIX = exports.getCertificateIdentifier = exports.CertificateProductTypes = exports.MDNS_DISCOVERY_DOMAIN_V2 = exports.MDNS_DISCOVERY_TYPE_V2 = exports.API_V2_HEADER_VERSION = void 0;
/**
 * The value that needs to be sent in the `X-Api-Version` header to use the API v2.
 *
 * @link https://api-documentation.homewizard.com/docs/versioning
 */
exports.API_V2_HEADER_VERSION = '2';
/**
 * In API v2 devices are discovered using the `_homewizard._tcp` domain.
 * The API v1 uses `_hwenergy._tcp`, a device can respond to both.
 *
 * @link https://api-documentation.homewizard.com/docs/discovery
 */
exports.MDNS_DISCOVERY_TYPE_V2 = 'homewizard';
exports.MDNS_DISCOVERY_DOMAIN_V2 = `_${exports.MDNS_DISCOVERY_TYPE_V2}._tcp.local`; // _homewizard._tcp.local
/**
 * The product type that is used in the certificate of the device, by `product_type`.
 *
 * The device does not have a domain name, the certificate is issued to `appliance/<certificate product type>/<serial>`.
 *
 * @link https://api-documentation.homewizard.com/docs/v2/authorization#https
 */
exports.CertificateProductTypes = {
    'HWE-P1': 'p1dongle',
    'HWE-SKT': 'energysocket',
    'HWE-WTR': 'watermeter',
    'HWE-DSP': 'display',
    'HWE-KWH1': 'energymeter',
    'HWE-KWH3': 'energymeter',
    'SDM230-wifi': 'energymeter',
    'SDM630-wifi': 'energymeter',
    'HWE-BAT': 'battery',
    // TODO: 'HWE-TMP', not known yet. Use the `id` txt record of the mDNS discovery response for this device.
};
/**
 * Returns the identifier a device uses in its certificate: `appliance/<certificate product type>/<serial>`.
 *
 * This is the same value as the `id` txt record of the mDNS discovery response.
 * Returns `undefined` when the product type is unknown.
 */
function getCertificateIdentifier(productType, serial) {
    const certificateProductType = exports.CertificateProductTypes[productType];
    if (!certificateProductType)
        return undefined;
    return `appliance/${certificateProductType}/${serial}`;
}
exports.getCertificateIdentifier = getCertificateIdentifier;
/**
 * Local users are prefixed with `local/`, users created by the HomeWizard cloud are prefixed with `cloud/`.
 *
 * @link https://api-documentation.homewizard.com/docs/v2/authorization
 */
exports.LOCAL_USER_PREFIX = 'local/';
/**
 * The error codes of the API v2. This list might be extended in the future, make sure your application can handle other values.
 *
 * `json:parameter-invalid-type:<parameter>` and `json:parameter-missing:<parameter>` are followed by the name of the parameter.
 *
 * @link https://api-documentation.homewizard.com/docs/v2/error-handling
 */
var ErrorCodesV2;
(function (ErrorCodesV2) {
    ErrorCodesV2["REQUEST_INVALID_JSON"] = "request:invalid-json";
    ErrorCodesV2["REQUEST_API_VERSION_NOT_SUPPORTED"] = "request:api-version-not-supported";
    ErrorCodesV2["REQUEST_INTERNAL_SERVER_ERROR"] = "request:internal-server-error";
    ErrorCodesV2["REQUEST_TOO_LARGE"] = "request:too-large";
    ErrorCodesV2["REQUEST_UNKNOWN_SUBSCRIPTION"] = "request:unknown-subscription";
    ErrorCodesV2["REQUEST_UNKNOWN_TYPE"] = "request:unknown-type";
    ErrorCodesV2["JSON_NO_PARAMETERS_RECOGNIZED"] = "json:no-parameters-recognized";
    ErrorCodesV2["JSON_PARAMETER_INVALID_TYPE"] = "json:parameter-invalid-type";
    ErrorCodesV2["JSON_PARAMETER_MISSING"] = "json:parameter-missing";
    ErrorCodesV2["JSON_PARAMETER_NOT_EXCLUSIVE"] = "json:parameter-not-exclusive";
    ErrorCodesV2["TELEGRAM_NO_TELEGRAM_RECEIVED"] = "telegram:no-telegram-received";
    /** The button on the device is not pressed (yet), keep trying. */
    ErrorCodesV2["USER_CREATION_NOT_ENABLED"] = "user:creation-not-enabled";
    ErrorCodesV2["USER_INVALID_PREFIX"] = "user:invalid-prefix";
    ErrorCodesV2["USER_NAME_EMPTY"] = "user:name-empty";
    ErrorCodesV2["USER_NAME_INVALID"] = "user:name-invalid";
    ErrorCodesV2["USER_NAME_TOO_LONG"] = "user:name-too-long";
    ErrorCodesV2["USER_NO_STORAGE"] = "user:no-storage";
    ErrorCodesV2["USER_NOT_FOUND"] = "user:not-found";
    ErrorCodesV2["USER_UNAUTHORIZED"] = "user:unauthorized";
})(ErrorCodesV2 || (exports.ErrorCodesV2 = ErrorCodesV2 = {}));
//# sourceMappingURL=types-v2.js.map