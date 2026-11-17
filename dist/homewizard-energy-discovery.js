"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeWizardEnergyDiscovery = exports.isMdnsTxtRecordV2 = void 0;
const multicastDns = __importStar(require("multicast-dns"));
const types_1 = require("./types");
const buffer_1 = require("./utils/buffer");
const util_1 = __importDefault(require("util"));
/**
 * Returns `true` when the txt record is from the API v2 domain (`_homewizard._tcp`).
 */
function isMdnsTxtRecordV2(txt) {
    return 'api_version' in txt;
}
exports.isMdnsTxtRecordV2 = isMdnsTxtRecordV2;
/**
 * HomeWizard Energy Discovery
 *
 * @link: https://homewizard-energy-api.readthedocs.io/discovery.html
 */
class HomeWizardEnergyDiscovery {
    constructor(options) {
        this.mdns = null;
        this.cachedDiscoveryResponses = [];
        this.loggerOptions = options?.logger;
        this.types = options?.types?.length ? options.types : [types_1.MDNS_DISCOVERY_TYPE];
    }
    /**
     * Find out if the text (name or data of a mDNS answer) is about one of the service types we discover.
     */
    includesDiscoveryType(text) {
        return this.types.some(type => text.includes(type));
    }
    log(...args) {
        if (!this.loggerOptions?.method)
            return;
        const loggerPrefix = this.loggerOptions.prefix || '[HomeWizard Energy API]:';
        return this.loggerOptions.method(loggerPrefix, ...args);
    }
    start() {
        this.log('start');
        this.mdns = multicastDns.default();
        const [firstType] = this.types;
        if (this.types.length === 1) {
            this.mdns.query(`_${firstType}._tcp.local`, types_1.MDNS_DISCOVERY_QUERY_TYPE);
            return;
        }
        this.mdns.query(this.types.map(type => ({
            name: `_${type}._tcp.local`,
            type: types_1.MDNS_DISCOVERY_QUERY_TYPE,
        })));
    }
    stop() {
        this.log('stop');
        if (this.mdns) {
            this.mdns.removeAllListeners();
            this.mdns.destroy();
            this.mdns = null;
        }
    }
    on(event, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback) {
        if (!this.mdns) {
            throw new Error('mDNS is not started, call discovery.start() first');
        }
        // if (event === 'down') {
        //   this.on(event, this.handleMdnsDown(callback));
        //   return;
        // }
        if (event === 'error') {
            this.mdns.on(event, this.handleMdnsError(callback));
            return;
        }
        if (event === 'warning') {
            this.mdns.on(event, this.handleMdnsWarning(callback));
            return;
        }
        this.mdns.on(event, this.handleMdnsResponse(callback));
    }
    // TODO: make this handler work
    // protected handleMdnsDown(callback: (goodbyeResponse: DiscoveryResponse) => void) {
    //   return (response: multicastDns.ResponsePacket) => {
    //     console.log('goodbye!', response);
    //     // TODO: fix
    //     callback(response as unknown as DiscoveryResponse);
    //   };
    // }
    isGoodbyeResponse(response) {
        return response.answers.some(answer => {
            if ('ttl' in answer) {
                return (answer.type === types_1.MDNS_DISCOVERY_QUERY_TYPE &&
                    answer.ttl === 0 &&
                    this.includesDiscoveryType(answer.data));
            }
            return false;
        });
    }
    /**
     * Find out if the response is a HomeWizard Energy response.
     */
    isHomeWizardEnergyResponse(response) {
        return (response.answers?.filter(answer => {
            if ('data' in answer && typeof answer.data === 'string') {
                return this.includesDiscoveryType(answer.data);
            }
            return false;
        }).length > 0);
    }
    /**
     * Returns the txt record of the response. Looks in the answers and in the additionals.
     *
     * A device that supports both API versions can answer both services in one response, so when a fqdn is given
     * the txt record of that fqdn is used.
     */
    getTxtRecordFromResponse(response, fqdn) {
        const records = [...response.answers, ...(response.additionals || [])].filter(record => record.type === 'TXT');
        const txt = (fqdn && records.find(record => record.name === fqdn)) || records[0];
        // no txt record found
        if (!txt)
            return null;
        // no data property found
        if (!('data' in txt))
            return null;
        // data is not an array of buffers
        if (!(0, buffer_1.isBufferArray)(txt.data))
            return null;
        // txt.data must be an Array of Buffers when we end up here
        const txtRecordFromBuffers = (0, buffer_1.bufferArrayToJSON)(txt.data);
        return txtRecordFromBuffers;
    }
    getHostDetailsFromAnswer(answer) {
        if (!('data' in answer))
            return null;
        if (typeof answer.data !== 'string')
            return null;
        return { ip: answer.data, hostname: answer.name };
    }
    getHostDetailsFromResponse(response) {
        // We can find the host details in the answer or additional section
        const answer = response.answers.find(answer => answer.type === 'A');
        const additional = response.additionals.find(additional => additional.type === 'A');
        if (!answer && !additional)
            return null;
        if (answer && !additional) {
            return this.getHostDetailsFromAnswer(answer);
        }
        if (additional) {
            return this.getHostDetailsFromAnswer(additional);
        }
        return null;
    }
    getFqdnFromResponse(response) {
        const ptr = response.answers.find(a => a.type === 'PTR' && !!a.name && this.includesDiscoveryType(a.name));
        if (!ptr) {
            return null;
        }
        if (ptr && !('data' in ptr)) {
            return null;
        }
        if (typeof ptr.data !== 'string') {
            return null;
        }
        return ptr.data;
    }
    getCachedResponseByFqdn(fqdn) {
        return this.cachedDiscoveryResponses.find(cachedResponse => cachedResponse.fqdn === fqdn);
    }
    removeCachedResponseByFqdn(fqdn) {
        this.cachedDiscoveryResponses = this.cachedDiscoveryResponses.filter(cachedResponse => cachedResponse.fqdn !== fqdn);
    }
    isDiscoveryResponseInCache(discoveryResponse) {
        return this.cachedDiscoveryResponses.some(cachedDiscoveryResponse => util_1.default.isDeepStrictEqual(discoveryResponse, cachedDiscoveryResponse));
    }
    /**
     * Returns the fqdn of each service of the response we are discovering.
     *
     * A device that supports both API versions can answer `_hwenergy._tcp` and `_homewizard._tcp` in one response.
     */
    getFqdnsFromResponse(response) {
        const fqdns = [];
        for (const answer of response.answers || []) {
            if (answer.type !== 'PTR' || !answer.name || !this.includesDiscoveryType(answer.name)) {
                continue;
            }
            if ('data' in answer && typeof answer.data === 'string' && !fqdns.includes(answer.data)) {
                fqdns.push(answer.data);
            }
        }
        return fqdns;
    }
    isGoodbyeForFqdn(response, fqdn) {
        return response.answers.some(answer => answer.type === types_1.MDNS_DISCOVERY_QUERY_TYPE &&
            'ttl' in answer &&
            answer.ttl === 0 &&
            answer.data === fqdn);
    }
    handleMdnsResponse(callback) {
        return (response) => {
            const isHomeWizardEnergyResponse = this.isHomeWizardEnergyResponse(response);
            this.log(`Received response from mDNS: ${JSON.stringify(response)}`);
            if (!isHomeWizardEnergyResponse) {
                this.log('Response from mDNS is not from HomeWizard Energy, ignoring.');
                return;
            }
            // Get the FQDN's from the response, we use this as a unique identifier for the device (and its API version)
            const fqdns = this.getFqdnsFromResponse(response);
            if (!fqdns.length) {
                this.log(`No fqdn found in mDNS response, ignoring: ${JSON.stringify(response)}`);
                return;
            }
            for (const fqdn of fqdns) {
                if (this.isGoodbyeForFqdn(response, fqdn)) {
                    this.log(`Response is a goodbye message for ${fqdn}.`);
                    // Remove the response from cache by using the fqdn, which is specific enough
                    this.removeCachedResponseByFqdn(fqdn);
                    continue;
                }
                const hostDetails = this.getHostDetailsFromResponse(response);
                const txtRecord = this.getTxtRecordFromResponse(response, fqdn);
                // An incomplete response must never throw: this handler runs inside the mDNS socket event, an error here
                // would be an uncaught exception in the application. The device will be handled on its next (complete) response.
                if (!hostDetails) {
                    this.log(`No host details found in mDNS response, ignoring: ${JSON.stringify(response)}`);
                    continue;
                }
                if (!txtRecord) {
                    this.log(`No txt record data found in mDNS response, ignoring: ${JSON.stringify(response)}`);
                    continue;
                }
                const discoveryResponse = {
                    ip: hostDetails.ip,
                    hostname: hostDetails.hostname,
                    fqdn,
                    txt: txtRecord,
                };
                const isDiscoveryResponseInCache = this.isDiscoveryResponseInCache(discoveryResponse);
                if (isDiscoveryResponseInCache) {
                    this.log('Nothing changed. Response is already in cache, ignoring.');
                    continue;
                }
                // Store response in cache, so we don't send multiple events for the same device when not needed
                this.cachedDiscoveryResponses.push(discoveryResponse);
                callback(discoveryResponse);
            }
        };
    }
    handleMdnsError(callback) {
        return (error) => {
            callback(error);
        };
    }
    handleMdnsWarning(callback) {
        return (error) => {
            callback(error);
        };
    }
}
exports.HomeWizardEnergyDiscovery = HomeWizardEnergyDiscovery;
//# sourceMappingURL=homewizard-energy-discovery.js.map