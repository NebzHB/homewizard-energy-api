export type TelegramParsedLine = {
    obisCode: string;
    value: string;
    unit: TelegramUnit;
};
export type TelegramUnit = 'kWh' | 'kW' | 'A' | 'V' | 's' | 'm3';
export interface TelegramHourlyReading {
    timestamp: string | null;
    value: string | null;
    unit: TelegramUnit | null;
}
export interface TelegramValueItem {
    value: number | null;
    unit: TelegramUnit | null;
}
export interface TelegramPowerFailureLogItem {
    startOfFailure: string | null;
    endOfFailure: string | null;
    duration: number | null;
    unit: TelegramUnit | null;
}
export interface TelegramPeakDemand {
    /** The timestamp the peak was registered. */
    timestamp: string | null;
    value: number | null;
    unit: TelegramUnit | null;
}
export interface TelegramPeakDemandHistoryItem extends TelegramPeakDemand {
    /** The end of the month (billing period) of this peak. */
    endOfPeriod: string | null;
}
export interface TelegramPeakDemandHistory {
    count: number | null;
    log: TelegramPeakDemandHistoryItem[];
}
export interface TelegramPowerFailureLog {
    count: number | null;
    log: TelegramPowerFailureLogItem[];
}
export interface ParsedTelegram {
    meter: {
        brand: string | null;
        model: string | null;
    };
    /** Version information for P1 output */
    version: string | null;
    /** Date-time stamp of the P1 message. Value unit `YYMMDDhhmmssX` */
    timestamp: string | null;
    /** Equipment identifier */
    equipmentId: string | null;
    /** Text message max 1024 characters. */
    textMessage: {
        codes: string | null;
        message: string | null;
    };
    power: {
        import: {
            t1: TelegramValueItem;
            t2: TelegramValueItem;
            active: TelegramValueItem;
        };
        export: {
            t1: TelegramValueItem;
            t2: TelegramValueItem;
            active: TelegramValueItem;
        };
        /**
         * The demand (capacity tariff), only available on meters that register it, like the Belgian meters (Fluvius).
         */
        demand: {
            /** The average demand of the current quarter-hour (`active_power_average_w` / `average_power_15m_w` in the API). */
            average: TelegramValueItem;
            /** The peak demand of the running month (`montly_power_peak_w` / `monthly_power_peak_w` in the API). */
            monthlyPeak: TelegramPeakDemand;
            /** The peak demand of the last (maximum 13) months. */
            monthlyPeakHistory: TelegramPeakDemandHistory;
        };
        /** Tariff indicator electricity. The tariff indicator can also be used to switch tariff dependent loads e.g boilers. This is the responsibility of the P1 user */
        tariffIndicator: number | null;
        threshold: TelegramValueItem;
        fuseThreshold: TelegramValueItem;
        switchPosition: string | null;
        numberOfPowerFailures: number | null;
        numberOfLongPowerFailures: number | null;
        /** Power Failure Event Log (long power failures). Value unit `Timestamp (end of failure) – duration in seconds` */
        longPowerFailureLog: TelegramPowerFailureLog;
        voltageSags: {
            l1: number | null;
            l2: number | null;
            l3: number | null;
        };
        voltageSwell: {
            l1: number | null;
            l2: number | null;
            l3: number | null;
        };
        instantaneous: {
            current: {
                l1: TelegramValueItem;
                l2: TelegramValueItem;
                l3: TelegramValueItem;
            };
            voltage: {
                l1: TelegramValueItem;
                l2: TelegramValueItem;
                l3: TelegramValueItem;
            };
            power: {
                positive: {
                    l1: TelegramValueItem;
                    l2: TelegramValueItem;
                    l3: TelegramValueItem;
                };
                negative: {
                    l1: TelegramValueItem;
                    l2: TelegramValueItem;
                    l3: TelegramValueItem;
                };
            };
        };
    };
    gas: {
        deviceType: string | null;
        equipmentId: string | null;
        timestamp: string | null;
        value: number | null;
        unit: TelegramUnit | null;
        valvePosition: string | null;
    };
}
export declare function parseTelegram(telegram: string): ParsedTelegram;
export declare function getMeterBrandModelFromHeader(header: string): string[];
/**
 * Parse a single line of format: obisCode(value*unit), example: 1-0:2.8.1(123456.789*kWh)
 */
export declare function parseLine(line: string): TelegramParsedLine;
/**
 * Parse timestamp of format: YYMMDDhhmmssX
 */
export declare function parseTimestamp(timestamp: string | null | undefined): string | null;
/**
 * Parse power failure event log of format: 1)(0-0:96.7.19)(timestamp end)(duration)(timestamp end)(duration...
 */
export declare function parsePowerFailureEventLog(value: string): TelegramPowerFailureLog;
/**
 * Parse a peak demand of format: timestamp)(value*unit, example: 230903114500S)(02.762*kW
 */
export declare function parsePeakDemand(value: string): TelegramPeakDemand;
/**
 * Parse the peak demand history of format: count)(1-0:1.6.0)(1-0:1.6.0)(timestamp end of period)(timestamp peak)(value*unit)(timestamp end of period...
 *
 * Example: 2)(1-0:1.6.0)(1-0:1.6.0)(230201000000W)(230110174500W)(04.769*kW)(230301000000W)(230212181500W)(05.012*kW
 */
export declare function parsePeakDemandHistory(value: string): TelegramPeakDemandHistory;
/**
 * Parse hourly readings, which is used for gas, water, heat, cold and slave electricity meters (DSMR 4.0+)
 */
export declare function parseHourlyReading(reading: string | null): TelegramHourlyReading | null;
/**
 * Subtract a number of seconds from a date and return the result as ISO string.
 */
export declare function subtractNumberOfSecondsFromDate(date: string | number | Date, seconds: number): string;
/**
 * Convert a hexadecimal encoded string to readable ASCII characters (e.g. 0x414243 -> ABC)
 */
export declare function convertHexToAscii(hex: string): string;
//# sourceMappingURL=telegram.d.ts.map