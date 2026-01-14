import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Evaluation } from '../interfaces/offer.interface';
import { Observable } from 'rxjs';
import e from 'express';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  private apiUrl = environment.apiUrl.evaluation;

  constructor(private http:HttpClient) { }

  createEvaluation(body: Partial<Evaluation>): Observable<Evaluation> {
    return this.http.post<Evaluation>(this.apiUrl, body);
  }

  getEvaluationsForPawnshop(pawnshopId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/pawnshop/${pawnshopId}`);
  }

  getEvaluationsByUser(userId: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/user/${userId}`);
  }

  getEvaluationById(id: string): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: 'pending' | 'viewed' | 'responded'): Observable<Evaluation> {
    return this.http.patch<Evaluation>(`${this.apiUrl}/${id}/status`, { status });
  }

}
