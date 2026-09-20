import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Endereco } from '../models/endereco.model';

@Injectable({ providedIn: 'root' })
export class EnderecoService {

  private readonly baseUrl = `${environment.apiUrl}/enderecos`;

  constructor(private readonly http: HttpClient) {
  }

  consultarCep(cep: string): Observable<Endereco> {
    return this.http.get<Endereco>(`${this.baseUrl}/${cep}`);
  }
}
