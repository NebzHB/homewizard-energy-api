"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertHexToAscii = exports.subtractNumberOfSecondsFromDate = exports.parseHourlyReading = exports.parsePeakDemandHistory = exports.parsePeakDemand = exports.parsePowerFailureEventLog = exports.parseTimestamp = exports.parseLine = exports.getMeterBrandModelFromHeader = exports.parseTelegram = void 0;
const date_fns_1 = require("date-fns");
function parseTelegram(telegram) {
    const allLines = telegram
        .trim()
        .split(/\r\n|\n|\r/)
        .filter(Boolean); // filter out empty lines
    const header = allLines[0].substring(1);
    const [meterBrand, meterModal] = getMeterBrandModelFromHeader(header);
    const linesWithoutHeaderAndFooter = allLines
        .filter((_, index) => index > 0) // filter out header line
        .filter((_, index, arr) => index < arr.length - 1); // filter out footer line
    const parsedTelegram = {
        meter: {
            brand: meterBrand,
            model: meterModal,
        },
        version: null,
        timestamp: null,
        equipmentId: null,
        textMessage: {
            codes: null,
            message: null,
        },
        power: {
            import: {
                t1: {
                    value: null,
                    unit: null,
                },
                t2: {
                    value: null,
                    unit: null,
                },
                active: {
                    value: null,
                    unit: null,
                },
            },
            export: {
                t1: {
                    value: null,
                    unit: null,
                },
                t2: {
                    value: null,
                    unit: null,
                },
                active: {
                    value: null,
                    unit: null,
                },
            },
            demand: {
                average: {
                    value: null,
                    unit: null,
                },
                monthlyPeak: {
                    timestamp: null,
                    value: null,
                    unit: null,
                },
                monthlyPeakHistory: {
                    count: null,
                    log: [],
                },
            },
            tariffIndicator: null,
            threshold: {
                value: null,
                unit: null,
            },
            fuseThreshold: {
                value: null,
                unit: null,
            },
            switchPosition: null,
            numberOfPowerFailures: null,
            numberOfLongPowerFailures: null,
            longPowerFailureLog: {
                count: null,
                log: [],
            },
            voltageSags: {
                l1: null,
                l2: null,
                l3: null,
            },
            voltageSwell: {
                l1: null,
                l2: null,
                l3: null,
            },
            instantaneous: {
                current: {
                    l1: {
                        value: null,
                        unit: null,
                    },
                    l2: {
                        value: null,
                        unit: null,
                    },
                    l3: {
                        value: null,
                        unit: null,
                    },
                },
                voltage: {
                    l1: {
                        value: null,
                        unit: null,
                    },
                    l2: {
                        value: null,
                        unit: null,
                    },
                    l3: {
                        value: null,
                        unit: null,
                    },
                },
                power: {
                    positive: {
                        l1: {
                            value: null,
                            unit: null,
                        },
                        l2: {
                            value: null,
                            unit: null,
                        },
                        l3: {
                            value: null,
                            unit: null,
                        },
                    },
                    negative: {
                        l1: {
                            value: null,
                            unit: null,
                        },
                        l2: {
                            value: null,
                            unit: null,
                        },
                        l3: {
                            value: null,
                            unit: null,
                        },
                    },
                },
            },
        },
        gas: {
            deviceType: null,
            equipmentId: null,
            timestamp: null,
            value: null,
            unit: null,
            valvePosition: null,
        },
    };
    // Start parsing at line 3 since first two lines contain the header and an empty row
    for (const line of linesWithoutHeaderAndFooter) {
        const parsedLine = parseLine(line);
        // https://github.com/dsmrreader/dsmr-reader/blob/4d07f391cbf84edaace9aab85c1c22a0080a27e9/dsmr_parser/obis_references.py
        // 2016: https://www.netbeheernederland.nl/_upload/Files/Slimme_meter_15_a727fce1f1.pdf
        // 2014: https://www.netbeheernederland.nl/_upload/Files/Slimme_meter_15_40f025334f.pdf
        switch (parsedLine.obisCode) {
            // Version information for P1 output
            case '1-3:0.2.8': // version NL?
            case '0-0:96.1.4': // version BE
                parsedTelegram.version = parsedLine.value;
                break;
            // Date-time stamp of the P1 message
            case '0-0:1.0.0':
                parsedTelegram.timestamp = parseTimestamp(parsedLine.value);
                break;
            // Equipment identifier
            case '0-0:96.1.1':
                parsedTelegram.equipmentId = parsedLine.value;
                break;
            // TEXT_MESSAGE_CODE
            case '0-0:96.13.1':
                parsedTelegram.textMessage.codes = parsedLine.value;
                break;
            // Text message max 1024 characters.
            case '0-0:96.13.0':
                parsedTelegram.textMessage.message = convertHexToAscii(parsedLine.value);
                break;
            // Meter Reading electricity delivered to client (Tariff 1) in 0,001 kWh
            case '1-0:1.8.1':
                parsedTelegram.power.import.t1.value = parseFloat(parsedLine.value);
                parsedTelegram.power.import.t1.unit = parsedLine.unit;
                break;
            // Meter Reading electricity delivered to client (Tariff 2) in 0,001 kWh
            case '1-0:1.8.2':
                parsedTelegram.power.import.t2.value = parseFloat(parsedLine.value);
                parsedTelegram.power.import.t2.unit = parsedLine.unit;
                break;
            // Meter Reading electricity delivered by client (Tariff 1) in 0,001 kWh
            case '1-0:2.8.1':
                parsedTelegram.power.export.t1.value = parseFloat(parsedLine.value);
                parsedTelegram.power.export.t1.unit = parsedLine.unit;
                break;
            // Meter Reading electricity delivered by client (Tariff 2) in 0,001 kWh
            case '1-0:2.8.2':
                parsedTelegram.power.export.t2.value = parseFloat(parsedLine.value);
                parsedTelegram.power.export.t2.unit = parsedLine.unit;
                break;
            // Tariff indicator electricity.
            // The tariff indicator can also be used to switch tariff dependent loads e.g boilers.
            // This is the responsibility of the P1 user
            case '0-0:96.14.0':
                parsedTelegram.power.tariffIndicator = parseInt(parsedLine.value);
                break;
            // Actual electricity power delivered (+P) in 1 Watt resolution
            case '1-0:1.7.0':
                parsedTelegram.power.import.active.value = parseFloat(parsedLine.value);
                parsedTelegram.power.import.active.unit = parsedLine.unit;
                break;
            // Actual electricity power received (-P) in 1 Watt resolution
            case '1-0:2.7.0':
                parsedTelegram.power.export.active.value = parseFloat(parsedLine.value);
                parsedTelegram.power.export.active.unit = parsedLine.unit;
                break;
            // Positive active demand of the current quarter-hour (average, capacity tariff, BE)
            case '1-0:1.4.0':
                parsedTelegram.power.demand.average.value = parseFloat(parsedLine.value);
                parsedTelegram.power.demand.average.unit = parsedLine.unit;
                break;
            // Positive active maximum demand of the running month, with the timestamp of the peak (capacity tariff, BE)
            case '1-0:1.6.0':
                parsedTelegram.power.demand.monthlyPeak = parsePeakDemand(parsedLine.value);
                break;
            // Positive active maximum demand of the last 13 months (capacity tariff, BE)
            case '0-0:98.1.0':
                parsedTelegram.power.demand.monthlyPeakHistory = parsePeakDemandHistory(parsedLine.value);
                break;
            // The actual threshold Electricity in kW
            // probably not available anymore?
            // page 25: https://www.netbeheernederland.nl/_upload/Files/Slimme_meter_15_40f025334f.pdf
            case '0-0:17.0.0':
                parsedTelegram.power.threshold.value = parseFloat(parsedLine.value);
                parsedTelegram.power.threshold.unit = parsedLine.unit;
                break;
            // Switch position Electricity (in/out/enabled).
            // probably not available anymore?
            // page: 25https://www.netbeheernederland.nl/_upload/Files/Slimme_meter_15_40f025334f.pdf
            case '0-0:96.3.10':
                parsedTelegram.power.switchPosition = parsedLine.value; // TODO: parseBreaker
                break;
            // Number of power failures in any phase
            case '0-0:96.7.21':
                parsedTelegram.power.numberOfPowerFailures = parseInt(parsedLine.value);
                break;
            // Number of long power failures in any phase
            case '0-0:96.7.9':
                parsedTelegram.power.numberOfLongPowerFailures = parseInt(parsedLine.value);
                break;
            // Power Failure Event Log (long power failures)
            case '1-0:99.97.0':
                parsedTelegram.power.longPowerFailureLog = parsePowerFailureEventLog(parsedLine.value);
                break;
            // Number of voltage sags in phase L1
            case '1-0:32.32.0':
                parsedTelegram.power.voltageSags.l1 = parseInt(parsedLine.value);
                break;
            // Number of voltage sags in phase L2
            case '1-0:52.32.0':
                parsedTelegram.power.voltageSags.l2 = parseInt(parsedLine.value);
                break;
            // Number of voltage sags in phase L3
            case '1-0:72.32.0':
                parsedTelegram.power.voltageSags.l3 = parseInt(parsedLine.value);
                break;
            // Number of voltage swells in phase L1
            case '1-0:32.36.0':
                parsedTelegram.power.voltageSwell.l1 = parseInt(parsedLine.value);
                break;
            // Number of voltage swells in phase L2
            case '1-0:52.36.0':
                parsedTelegram.power.voltageSwell.l2 = parseInt(parsedLine.value);
                break;
            // Number of voltage swells in phase L3
            case '1-0:72.36.0':
                parsedTelegram.power.voltageSwell.l3 = parseInt(parsedLine.value);
                break;
            // Instantaneous current L1 in A resolution.
            case '1-0:31.7.0':
                parsedTelegram.power.instantaneous.current.l1.value = parseInt(parsedLine.value);
                parsedTelegram.power.instantaneous.current.l1.unit = parsedLine.unit;
                break;
            // Instantaneous current L2 in A resolution.
            case '1-0:51.7.0':
                parsedTelegram.power.instantaneous.current.l2.value = parseInt(parsedLine.value);
                parsedTelegram.power.instantaneous.current.l2.unit = parsedLine.unit;
                break;
            // Instantaneous current L3 in A resolution
            case '1-0:71.7.0':
                parsedTelegram.power.instantaneous.current.l3.value = parseInt(parsedLine.value);
                parsedTelegram.power.instantaneous.current.l3.unit = parsedLine.unit;
                break;
            // Instantaneous active power L1 (+P) in W resolution
            case '1-0:21.7.0':
                parsedTelegram.power.instantaneous.power.positive.l1.value = parseFloat(parsedLine.value);
                parsedTelegram.power.instantaneous.power.positive.l1.unit = parsedLine.unit;
                break;
            // Instantaneous active power L2 (+P) in W resolution
            case '1-0:41.7.0':
                parsedTelegram.power.instantaneous.power.positive.l2.value = parseFloat(parsedLine.value);
                parsedTelegram.power.instantaneous.power.positive.l2.unit = parsedLine.unit;
                break;
            // Instantaneous active power L3 (+P) in W resolution
            case '1-0:61.7.0':
                parsedTelegram.power.instantaneous.power.positive.l3.value = parseFloat(parsedLine.value);
                parsedTelegram.power.instantaneous.power.positive.l3.unit = parsedLine.unit;
                break;
            // Instantaneous active power L1 (-P) in W resolution
            case '1-0:22.7.0':
                parsedTelegram.power.instantaneous.power.negative.l1.value = parseFloat(parsedLine.value);
                parsedTelegram.power.instantaneous.power.negative.l1.unit = parsedLine.unit;
                break;
            // Instantaneous active power L2 (-P) in W resolution
            case '1-0:42.7.0':
                parsedTelegram.power.instantaneous.power.negative.l2.value = parseFloat(parsedLine.value);
                parsedTelegram.power.instantaneous.power.negative.l2.unit = parsedLine.unit;
                break;
            // Instantaneous active power L3 (-P) in W resolution
            case '1-0:62.7.0':
                parsedTelegram.power.instantaneous.power.negative.l3.value = parseFloat(parsedLine.value);
                parsedTelegram.power.instantaneous.power.negative.l3.unit = parsedLine.unit;
                break;
            /**
             * Device-Type
             *
             * The Smart Meter has 4 M-Bus interfaces which allow to connect external devices like a Gas, Thermal,
             * Water or slave Electricity meter. The Obis code of external devices starts with 0-n (where n is a number from 1 to 4)
             *
             * However, the way to correctly determine the type of external device that is connected to each M-Bus is very poorly documented.
             * At the moment only Gas meters are being installed by the grid companies as far as I know.
             * So we make the assumption that a gas meter is attached to M-Bus 1.
             */
            case '0-1:24.1.0':
            case '0-2:24.1.0':
            case '0-3:24.1.0':
            case '0-4:24.1.0':
                parsedTelegram.gas.deviceType = parsedLine.value;
                break;
            // Equipment identifier (Gas)
            // Equipment identifier (Thermal: Heat or Cold)
            // Equipment identifier (Water)
            case '0-1:96.1.0':
            case '0-2:96.1.0':
            case '0-3:96.1.0':
            case '0-4:96.1.0':
            case '0-1:96.1.1':
                parsedTelegram.gas.equipmentId = parsedLine.value;
                break;
            // Last 5-minute value (temperature converted), gas delivered to client in m3, including decimal values and capture time
            // Last 5-minute Meter reading Heat or Cold in 0,01 GJ and capture time
            // Last 5-minute Meter reading in 0,001 m3 and capture time
            // Last 5-minute Meter reading and capture time (e.g. slave E meter)
            case '0-1:24.2.1':
            case '0-2:24.2.1':
            case '0-3:24.2.1':
            case '0-4:24.2.1':
                // eslint-disable-next-line no-case-declarations
                const hourlyReading = parseHourlyReading(parsedLine.value);
                parsedTelegram.gas.timestamp = parseTimestamp(hourlyReading?.timestamp);
                parsedTelegram.gas.value = parseFloat(hourlyReading?.value || '0');
                parsedTelegram.gas.unit = hourlyReading?.unit || null;
                break;
            // Gas (BE), same format as the hourly reading: (timestamp)(value*unit)
            case '0-1:24.2.3':
            case '0-2:24.2.3':
            case '0-3:24.2.3':
            case '0-4:24.2.3':
                // eslint-disable-next-line no-case-declarations
                const instantReading = parseHourlyReading(parsedLine.value);
                parsedTelegram.gas.timestamp = parseTimestamp(instantReading?.timestamp);
                parsedTelegram.gas.value = parseFloat(instantReading?.value || '0');
                parsedTelegram.gas.unit = instantReading?.unit || null;
                break;
            // Valve position (Gas) (BE)
            case '0-1:24.4.0':
            case '0-2:24.4.0':
            case '0-3:24.4.0':
            case '0-4:24.4.0':
                parsedTelegram.gas.valvePosition = parsedLine.value;
                break;
            /*
             * DSMR 2.2 specific mappings
             */
            case '0-1:24.3.0':
                // eslint-disable-next-line no-case-declarations
                const split = parsedLine.value.split(')(');
                parsedTelegram.gas.timestamp = parseTimestamp(split[0]);
                parsedTelegram.gas.unit = split[5];
                break;
            /*
             * DSMR 5.0 specific mappings
             */
            // Instantaneous voltage L1 in V resolution
            case '1-0:32.7.0':
                parsedTelegram.power.instantaneous.voltage.l1.value = parseInt(parsedLine.value);
                parsedTelegram.power.instantaneous.voltage.l1.unit = parsedLine.unit;
                break;
            // Instantaneous voltage L2 in V resolution
            case '1-0:52.7.0':
                parsedTelegram.power.instantaneous.voltage.l2.value = parseInt(parsedLine.value);
                parsedTelegram.power.instantaneous.voltage.l2.unit = parsedLine.unit;
                break;
            // Instantaneous voltage L3 in V resolution
            case '1-0:72.7.0':
                parsedTelegram.power.instantaneous.voltage.l3.value = parseInt(parsedLine.value);
                parsedTelegram.power.instantaneous.voltage.l3.unit = parsedLine.unit;
                break;
            /*
             * eMUCs 1.4 specific mappings
             */
            case '1-0:31.4.0':
                parsedTelegram.power.fuseThreshold.value = parseFloat(parsedLine.value);
                parsedTelegram.power.fuseThreshold.unit = 'A';
                break;
            /*
             * Handling anything not matched so far
             */
            default:
                // Due to a 'bug' in DSMR2.2 the gas reading value is put on a separate line, so we catch it here with a regex
                // Format of the line containing that reading is: "(012345.678)"
                if (line.match(/\([0-9]{5}\.[0-9]{3}\)/)) {
                    parsedTelegram.gas.value = parseFloat(line.substring(1, 10));
                }
                else {
                    console.error('Unable to parse line: ' + line);
                }
                break;
        }
    }
    /*
     * DSMR 2.2 specific logic
     */
    // If we could not find a version number we assume it's DSMR version 2.2 and add server timestamp, since these are not contained in the packet
    if (parsedTelegram.version === null) {
        parsedTelegram.version = '22';
        // Take the current time but ignore the milliseconds
        const now = new Date();
        now.setMilliseconds(0);
        parsedTelegram.timestamp = now.toISOString();
    }
    return parsedTelegram;
}
exports.parseTelegram = parseTelegram;
function getMeterBrandModelFromHeader(header) {
    const [meterBrand, meterModel] = header.split('\\');
    return [meterBrand, meterModel];
}
exports.getMeterBrandModelFromHeader = getMeterBrandModelFromHeader;
/**
 * Parse a single line of format: obisCode(value*unit), example: 1-0:2.8.1(123456.789*kWh)
 */
function parseLine(line) {
    const output = {};
    const split = line.split(/\((.+)?/); // Split only on first occurrence of "("
    if (split[0] && split[1]) {
        const value = split[1].substring(0, split[1].length - 1);
        output.obisCode = split[0];
        if (value.indexOf('*') > -1 && value.indexOf(')(') === -1) {
            output.value = value.split('*')[0];
            output.unit = value.split('*')[1];
        }
        else {
            output.value = value;
        }
    }
    return output;
}
exports.parseLine = parseLine;
/**
 * Parse timestamp of format: YYMMDDhhmmssX
 */
function parseTimestamp(timestamp) {
    if (!timestamp)
        return null;
    const parsedTimestamp = new Date();
    parsedTimestamp.setUTCFullYear(parseInt(timestamp.substring(0, 2)) + 2000);
    parsedTimestamp.setUTCMonth(parseInt(timestamp.substring(2, 4)) - 1);
    parsedTimestamp.setUTCDate(parseInt(timestamp.substring(4, 6)));
    parsedTimestamp.setUTCHours(parseInt(timestamp.substring(6, 8)));
    parsedTimestamp.setUTCMinutes(parseInt(timestamp.substring(8, 10)));
    parsedTimestamp.setUTCSeconds(parseInt(timestamp.substring(10, 12)));
    parsedTimestamp.setUTCMilliseconds(0);
    return (0, date_fns_1.formatISO)(parsedTimestamp);
}
exports.parseTimestamp = parseTimestamp;
/**
 * Parse power failure event log of format: 1)(0-0:96.7.19)(timestamp end)(duration)(timestamp end)(duration...
 */
function parsePowerFailureEventLog(value) {
    const split = value.split(')(0-0:96.7.19)(');
    const output = {
        count: parseInt(split[0]) || 0,
        log: [],
    };
    if (split[1]) {
        const log = split[1].split(')(');
        // Loop the log structure: timestamp)(duration)(timestamp)(duration...
        for (let i = 0; i <= log.length; i = i + 2) {
            if (log[i] && log[i + 1]) {
                const endOfFailure = parseTimestamp(log[i]);
                const duration = parseInt(log[i + 1].split('*')[0]);
                const startOfFailure = endOfFailure
                    ? subtractNumberOfSecondsFromDate(endOfFailure, duration)
                    : null;
                const logEntry = {
                    startOfFailure,
                    endOfFailure: parseTimestamp(log[i]),
                    duration,
                    unit: log[i + 1].split('*')[1],
                };
                output.log.push(logEntry);
            }
        }
    }
    return output;
}
exports.parsePowerFailureEventLog = parsePowerFailureEventLog;
/**
 * Parse a peak demand of format: timestamp)(value*unit, example: 230903114500S)(02.762*kW
 */
function parsePeakDemand(value) {
    const reading = parseHourlyReading(value);
    return {
        timestamp: parseTimestamp(reading?.timestamp),
        value: reading?.value ? parseFloat(reading.value) : null,
        unit: reading?.unit || null,
    };
}
exports.parsePeakDemand = parsePeakDemand;
/**
 * Parse the peak demand history of format: count)(1-0:1.6.0)(1-0:1.6.0)(timestamp end of period)(timestamp peak)(value*unit)(timestamp end of period...
 *
 * Example: 2)(1-0:1.6.0)(1-0:1.6.0)(230201000000W)(230110174500W)(04.769*kW)(230301000000W)(230212181500W)(05.012*kW
 */
function parsePeakDemandHistory(value) {
    const parts = value.split(')(');
    const output = {
        count: parseInt(parts[0]) || 0,
        log: [],
    };
    // Everything after the count that is not a reference to an OBIS code (1-0:1.6.0) is part of the log
    const log = parts.slice(1).filter(part => !part.includes(':'));
    // Loop the log structure: end of period)(timestamp)(value*unit)(end of period)(timestamp)(value*unit...
    for (let i = 0; i + 2 < log.length; i = i + 3) {
        const [peakValue, peakUnit] = log[i + 2].split('*');
        output.log.push({
            endOfPeriod: parseTimestamp(log[i]),
            timestamp: parseTimestamp(log[i + 1]),
            value: parseFloat(peakValue),
            unit: peakUnit || null,
        });
    }
    return output;
}
exports.parsePeakDemandHistory = parsePeakDemandHistory;
/**
 * Parse hourly readings, which is used for gas, water, heat, cold and slave electricity meters (DSMR 4.0+)
 */
function parseHourlyReading(reading) {
    if (!reading)
        return null;
    const output = {
        timestamp: null,
        value: null,
        unit: null,
    };
    const split = reading.split(')(');
    if (split[0] && split[1]) {
        output.timestamp = split[0];
        output.value = split[1].split('*')[0];
        output.unit = split[1].split('*')[1];
    }
    return output;
}
exports.parseHourlyReading = parseHourlyReading;
/**
 * Subtract a number of seconds from a date and return the result as ISO string.
 */
function subtractNumberOfSecondsFromDate(date, seconds) {
    const output = new Date(date);
    output.setSeconds(output.getSeconds() - seconds);
    return (0, date_fns_1.formatISO)(output);
}
exports.subtractNumberOfSecondsFromDate = subtractNumberOfSecondsFromDate;
/**
 * Convert a hexadecimal encoded string to readable ASCII characters (e.g. 0x414243 -> ABC)
 */
function convertHexToAscii(hex) {
    if (!(typeof hex === 'number' || typeof hex == 'string')) {
        return '';
    }
    hex = hex.toString().replace(/\s+/gi, '');
    const stack = [];
    for (let i = 0; i < hex.length; i += 2) {
        const code = parseInt(hex.substring(i, i + 2), 16);
        if (!isNaN(code) && code !== 0) {
            stack.push(String.fromCharCode(code));
        }
    }
    const ascii = stack.join('');
    return ascii;
}
exports.convertHexToAscii = convertHexToAscii;
// Credits to https://github.com/ruudverheijden/node-p1-reader for the initial idea.
// This code is based on that code, but has been heavily modified to support Typescript and to be more readable.
//# sourceMappingURL=telegram.js.map