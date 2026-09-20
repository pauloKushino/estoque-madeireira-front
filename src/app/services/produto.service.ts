import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EstoqueResponse, Produto, ProdutoRequest } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoService {

  private readonly baseUrl = `${environment.apiUrl}/produtos`;

  constructor(private readonly http: HttpClient) {
  }

  listar(nome?: string): Observable<Produto[]> {
    const params = nome ? new HttpParams().set('nome', nome) : undefined;
    return this.http.get<Produto[]>(this.baseUrl, { params });
  }

  buscarPorId(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.baseUrl}/${id}`);
  }

  criar(request: ProdutoRequest): Observable<Produto> {
    return this.http.post<Produto>(this.baseUrl, request);
  }

  atualizar(id: number, request: ProdutoRequest): Observable<Produto> {
    return this.http.put<Produto>(`${this.baseUrl}/${id}`, request);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  consultarEstoque(id: number): Observable<EstoqueResponse> {
    return this.http.get<EstoqueResponse>(`${this.baseUrl}/${id}/estoque`);
  }
}
