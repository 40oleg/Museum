import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** API Service to interact with server */
@Injectable({
    providedIn: 'root',
})
export class ConfigurationApiService {
    private host = 'http://localhost:4200/api/config';

    constructor(private readonly httpService: HttpClient) {}

    /** Get configuration */
    getConfig(): Observable<unknown> {
        return this.httpService.get(this.host);
    }

    /** Save configuration */
    saveConfig(config: any): Observable<unknown> {
        return this.httpService.post(this.host, config);
    }
}
