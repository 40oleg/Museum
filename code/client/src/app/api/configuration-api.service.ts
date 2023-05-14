import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ChangePeriods} from "../../enums/ChangePeriods.enum";


/**
 * API Service to interact with server
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigurationApiService {
  private host = 'http://localhost:3000/api/config';

  constructor(
    private readonly httpService: HttpClient,
  ) {}

  getConfig(): Observable<unknown> {
    return this.httpService.get(this.host);
  }

  saveConfig(config: any): Observable<unknown> {
    return this.httpService.post(this.host, config);
  }
}
