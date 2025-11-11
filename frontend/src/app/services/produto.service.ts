import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';
import { Produto } from '../models/produto.model';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private apiUrl = 'http://localhost:5001/api/produtos';

  constructor(private http: HttpClient) { }

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  obterPorId(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.apiUrl}/${id}`).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  criar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  atualizar(id: number, produto: Produto): Observable<Produto> {
    produto.id = id; // força consistência
    return this.http.put<Produto>(`${this.apiUrl}/${id}`, produto).pipe(
      retry(3),
      catchError(this.handleError)
    );

  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro no serviço de produtos:', error);
    return throwError(() => error);
  }
}

