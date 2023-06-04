export enum ChangePeriodsEnum {
    EVERY_HOUR = 'EVERY_HOUR',
    EVERY_3_HOURS = 'EVERY_3_HOURS',
    EVERY_DAY = 'EVERY_DAY',
    EVERY_3_DAY = 'EVERY_3_DAY',
    EVERY_WEEK = 'EVERY_WEEK',
    EVERY_2_WEEK = 'EVERY_2_WEEK',
    EVERY_MONTH = 'EVERY_MONTH',

    //for debugging
    EVERY_15_SECONDS = 'EVERY_15_SECONDS',
    EVERY_MINUTE = 'EVERY_MINUTE',
}

/** Интерфейс периода смена обоев */
export interface ChangePeriod {
    /** Системное название */
    name: string;
    /** Время в мс, через которое обои меняются */
    timestamp: number;
}

export const ChangePeriods: ChangePeriod[] = [
    // for debugging
    // { name: ChangePeriodsEnum.EVERY_15_SECONDS, timestamp: 15 * 1000 },
    // { name: ChangePeriodsEnum.EVERY_MINUTE, timestamp: 60 * 1000 },
    { name: ChangePeriodsEnum.EVERY_HOUR, timestamp: 60 * 60 * 1000 },
    { name: ChangePeriodsEnum.EVERY_3_HOURS, timestamp: 3 * 60 * 60 * 1000 },
    { name: ChangePeriodsEnum.EVERY_DAY, timestamp: 24 * 60 * 60 * 1000 },
    { name: ChangePeriodsEnum.EVERY_3_DAY, timestamp: 3 * 24 * 60 * 60 * 1000 },
    { name: ChangePeriodsEnum.EVERY_WEEK, timestamp: 7 * 24 * 60 * 60 * 1000 },
    {
        name: ChangePeriodsEnum.EVERY_2_WEEK,
        timestamp: 14 * 24 * 60 * 60 * 1000,
    },
    {
        name: ChangePeriodsEnum.EVERY_MONTH,
        timestamp: 28 * 24 * 60 * 60 * 1000,
    },
];
