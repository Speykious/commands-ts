export declare class Timestamp {
    hours: number;
    minutes: number;
    seconds: number;
    constructor(hours: number, minutes: number, seconds: number);
    get totalSeconds(): number;
    toString(): string;
}
