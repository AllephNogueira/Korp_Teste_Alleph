import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';
import { NotaFiscal } from '../models/nota-fiscal.model';

@Injectable({
  providedIn: 'root'
})
export class NotaFiscalService {
  private apiUrl = 'http://localhost:5002/api/notas-fiscais';

  constructor(private http: HttpClient) { }

  listar(): Observable<NotaFiscal[]> {
    return this.http.get<NotaFiscal[]>(this.apiUrl).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  obterPorId(id: number): Observable<NotaFiscal> {
    return this.http.get<NotaFiscal>(`${this.apiUrl}/${id}`).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  criar(nota: NotaFiscal): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(this.apiUrl, nota).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  imprimir(id: number): Observable<NotaFiscal> {
    return this.http.post<NotaFiscal>(`${this.apiUrl}/${id}/imprimir`, {}).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro no serviço de notas fiscais:', error);
    return throwError(() => error);
  }
}

