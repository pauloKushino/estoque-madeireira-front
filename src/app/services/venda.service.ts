import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Venda, VendaRequest } from '../models/venda.model';

@Injectable({ providedIn: 'root' })
export class VendaService {

  private readonly baseUrl = `${environment.apiUrl}/vendas`;

  constructor(private readonly http: HttpClient) {
  }

  listar(): Observable<Venda[]> {
    return this.http.get<Venda[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Venda> {
    return this.http.get<Venda>(`${this.baseUrl}/${id}`);
  }

  criar(request: VendaRequest): Observable<Venda> {
    return this.http.post<Venda>(this.baseUrl, request);
  }
}
