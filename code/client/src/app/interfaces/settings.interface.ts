import {ChangePeriodsEnum} from "../enums/ChangePeriods.enum";

export interface MuseumSettings {
  changePeriod: ChangePeriodsEnum;
  enabled: boolean;
}
