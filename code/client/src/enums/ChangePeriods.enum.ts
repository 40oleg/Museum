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

export interface ChangePeriod {
  uiName: string,
  innerName: ChangePeriodsEnum;
  timestamp: number;
}

export const ChangePeriods: ChangePeriod[] = [
  { innerName: ChangePeriodsEnum.EVERY_15_SECONDS, uiName: 'Каждые 15 секунд (debug)', timestamp: 15 * 1000 },
  { innerName: ChangePeriodsEnum.EVERY_MINUTE, uiName: 'Каждую минуту (debug)', timestamp: 60 * 1000 },
  { innerName: ChangePeriodsEnum.EVERY_HOUR, uiName: 'Каждый час', timestamp: 60 * 60 * 1000},
  { innerName: ChangePeriodsEnum.EVERY_3_HOURS, uiName: 'Каждые 3 часа', timestamp: 3 * 60 * 60 * 1000},
  { innerName: ChangePeriodsEnum.EVERY_DAY, uiName: 'Каждый день', timestamp: 24 * 60 * 60 * 1000},
  { innerName: ChangePeriodsEnum.EVERY_3_DAY, uiName: 'Каждые 3 дня', timestamp: 3 * 24 * 60 * 60 * 1000},
  { innerName: ChangePeriodsEnum.EVERY_WEEK, uiName: 'Каждую неделю', timestamp: 7 * 24 * 60 * 60 * 1000},
  { innerName: ChangePeriodsEnum.EVERY_2_WEEK, uiName: 'Каждые 2 недели', timestamp: 14 * 24 * 60 * 60 * 1000},
  { innerName: ChangePeriodsEnum.EVERY_MONTH, uiName: 'Каждый месяц', timestamp: 28 * 24 * 60 * 60 * 1000},
];
