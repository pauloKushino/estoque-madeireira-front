import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente, ClienteRequest } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {

  private readonly baseUrl = `${environment.apiUrl}/clientes`;

  constructor(private readonly http: HttpClient) {
  }

  listar(nome?: string): Observable<Cliente[]> {
    const params = nome ? new HttpParams().set('nome', nome) : undefined;
    return this.http.get<Cliente[]>(this.baseUrl, { params });
  }

  buscarPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  criar(request: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.baseUrl, request);
  }

  atualizar(id: number, request: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${id}`, request);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
