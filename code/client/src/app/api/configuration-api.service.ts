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
  private host = 'http://localhost/api/configuration';

  constructor(
    private readonly httpService: HttpClient,
  ) {}

  getConfig(): Observable<unknown> {
    return new Observable<unknown>((subscriber) => {
      subscriber.next({changeInterval: ChangePeriods[5], enabledCarousel: true})
    })
    return this.httpService.get(this.host);
  }

  setConfig(config: any): Observable<unknown> {
    return this.httpService.post(this.host, config);
  }
}
