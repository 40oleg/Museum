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
}

interface ChangePeriodsName {
  uiName: string,
  innerName: ChangePeriodsEnum;
}

export const ChangePeriodsNames: ChangePeriodsName[] = [
  { innerName: ChangePeriodsEnum.EVERY_15_SECONDS, uiName: 'Каждые 15 секунд (debug)' },
  { innerName: ChangePeriodsEnum.EVERY_HOUR, uiName: 'Каждый час'},
  { innerName: ChangePeriodsEnum.EVERY_3_HOURS, uiName: 'Каждые 3 часа'},
  { innerName: ChangePeriodsEnum.EVERY_DAY, uiName: 'Каждый день'},
  { innerName: ChangePeriodsEnum.EVERY_3_DAY, uiName: 'Каждые 3 дня'},
  { innerName: ChangePeriodsEnum.EVERY_WEEK, uiName: 'Каждую неделю'},
  { innerName: ChangePeriodsEnum.EVERY_2_WEEK, uiName: 'Каждые 2 недели'},
  { innerName: ChangePeriodsEnum.EVERY_MONTH, uiName: 'Каждый месяц'},
];
