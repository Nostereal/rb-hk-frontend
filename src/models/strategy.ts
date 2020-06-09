export interface Strategy {
    uuid?: string;
    type: StrategyType;
    title: string;
    settings: InstantStrategy | AggregateStrategy;
}

export interface InstantStrategy {
    intervals: IntervalSettings[];
    mcc_list?: number[];
    min_bonus: number;
    max_bonus: number;
}

export enum StrategyType {
    INSTANT = 'INSTANT',
    AGGREGATE_DATE = 'AGGREGATE_DATE',
}

export interface IntervalSettings {
    from?: number;
    to?: number;
    ratio?: number;
    amount?: number;
}

export interface AggregateStrategy {
    aggregate_time_settings: AggregateTimeSettings;
    mcc_list: number[];
    min_bonus: number;
    max_bonus: number;
    aggregate_function: AggregateFunction;
    intervals: IntervalSettings[];
}

export enum AggregateFunction {
    SUM = 'SUM',
    COUNT = 'COUNT',
}

export enum TimeUnit {
    DAYS = 'DAYS',
    MINUTES = 'MINUTES',
    HOURS = 'HOURS',
    WEEKS = 'WEEKS',
}

export interface AggregateTimeSettings {
    from_time: Date;
    to_time: Date;
    time_unit: TimeUnit;
    quantity: number;
}
