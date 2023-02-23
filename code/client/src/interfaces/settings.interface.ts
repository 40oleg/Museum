import {ChangePeriodsEnum} from "../enums/ChangePeriods.enum.js";

export interface MuseumSettings {
  changePeriod: ChangePeriodsEnum;
  enabled: boolean;
}
