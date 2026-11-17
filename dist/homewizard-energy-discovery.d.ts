import * as multicastDns from 'multicast-dns';
import { MdnsTxtRecord, MDNS_DISCOVERY_TYPE } from './types';
import { MdnsTxtRecordV2, MDNS_DISCOVERY_TYPE_V2 } from './types-v2';
import { LoggerOptions } from './base-api';
export interface DiscoveryResponse {
    ip: string;
    hostname: string;
    fqdn: string;
    /**
     * The txt record of the device.
     *
     * A device that supports both API versions responds on both domains, so you will receive two responses for that device.
     * Use `isMdnsTxtRecordV2()` to know if the response is from the API v2 domain (`_homewizard._tcp`).
     */
    txt: MdnsTxtRecord | MdnsTxtRecordV2;
}
export type DiscoveryType = typeof MDNS_DISCOVERY_TYPE | typeof MDNS_DISCOVERY_TYPE_V2;
export interface HomeWizardEnergyDiscoveryOptions {
    logger?: LoggerOptions;
    /**
     * The mDNS service types to discover. Defaults to `['hwenergy']` (API v1).
     *
     * - `hwenergy`: devices with the API v1 (`_hwenergy._tcp`)
     * - `homewizard`: devices with the API v2 (`_homewizard._tcp`), the only way to discover the Plug-In Battery
     */
    types?: DiscoveryType[];
}
/**
 * Returns `true` when the txt record is from the API v2 domain (`_homewizard._tcp`).
 */
export declare function isMdnsTxtRecordV2(txt: MdnsTxtRecord | MdnsTxtRecordV2): txt is MdnsTxtRecordV2;
/**
 * HomeWizard Energy Discovery
 *
 * @link: https://homewizard-energy-api.readthedocs.io/discovery.html
 */
export declare class HomeWizardEnergyDiscovery {
    private mdns;
    private loggerOptions;
    private cachedDiscoveryResponses;
    private types;
    constructor(options?: HomeWizardEnergyDiscoveryOptions);
    /**
     * Find out if the text (name or data of a mDNS answer) is about one of the service types we discover.
     */
    protected includesDiscoveryType(text: string): boolean;
    protected log(...args: unknown[]): void;
    start(): void;
    stop(): void;
    on(event: 'response', callback: (discoveryResponse: DiscoveryResponse) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    on(event: 'warning', callback: (error: Error) => void): void;
    protected isGoodbyeResponse(response: multicastDns.ResponsePacket): boolean;
    /**
     * Find out if the response is a HomeWizard Energy response.
     */
    protected isHomeWizardEnergyResponse(response: multicastDns.ResponsePacket): boolean;
    /**
     * Returns the txt record of the response. Looks in the answers and in the additionals.
     *
     * A device that supports both API versions can answer both services in one response, so when a fqdn is given
     * the txt record of that fqdn is used.
     */
    protected getTxtRecordFromResponse(response: multicastDns.ResponsePacket, fqdn?: string): MdnsTxtRecord | MdnsTxtRecordV2 | null;
    protected getHostDetailsFromAnswer(answer: multicastDns.ResponsePacket['answers'][number]): {
        ip: string;
        hostname: string;
    } | null;
    protected getHostDetailsFromResponse(response: multicastDns.ResponsePacket): {
        ip: string;
        hostname: string;
    } | null;
    protected getFqdnFromResponse(response: multicastDns.ResponsePacket): string | null;
    protected getCachedResponseByFqdn(fqdn: string): DiscoveryResponse | undefined;
    protected removeCachedResponseByFqdn(fqdn: string): void;
    protected isDiscoveryResponseInCache(discoveryResponse: DiscoveryResponse): boolean;
    /**
     * Returns the fqdn of each service of the response we are discovering.
     *
     * A device that supports both API versions can answer `_hwenergy._tcp` and `_homewizard._tcp` in one response.
     */
    protected getFqdnsFromResponse(response: multicastDns.ResponsePacket): string[];
    protected isGoodbyeForFqdn(response: multicastDns.ResponsePacket, fqdn: string): boolean;
    protected handleMdnsResponse(callback: (discoveryResponse: DiscoveryResponse) => void): (response: multicastDns.ResponsePacket) => void;
    protected handleMdnsError(callback: (error: Error) => void): (error: Error) => void;
    protected handleMdnsWarning(callback: (error: Error) => void): (error: Error) => void;
}
//# sourceMappingURL=homewizard-energy-discovery.d.ts.map