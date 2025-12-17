import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PawnshopProfile } from '../interfaces/shop-profile.interface';
import { HttpClient } from '@angular/common/http';
import { Review } from '../interfaces/reviews.interface';

@Injectable({
  providedIn: 'root'
})
export class LombardService {

  private apiUrl = 'http://localhost:3000/pawnshops';

  constructor(private http:HttpClient) { }

  getLombards():Observable<PawnshopProfile[]>{
    return this.http.get<PawnshopProfile[]>(this.apiUrl); 
  }

  getLombardById(id:string):Observable<PawnshopProfile>{
    return this.http.get<PawnshopProfile>(`${this.apiUrl}/${id}`)
  }

  getLombardByUserId(userId: string): Observable<PawnshopProfile> {
    return this.http.get<PawnshopProfile>(`${this.apiUrl}/user/${userId}`);
  }

  createLombard(lombard:PawnshopProfile):Observable<PawnshopProfile>{
    return this.http.post<PawnshopProfile>(this.apiUrl, lombard);
  }

  updateLombard(id: string, lombard: Partial<PawnshopProfile>): Observable<PawnshopProfile> {
    return this.http.put<PawnshopProfile>(`${this.apiUrl}/${id}`, lombard);
  }

  /** Удалить ломбард */
  deleteLombard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addReview(pawnshopId: string, review: Review): Observable<PawnshopProfile> {
    return this.http.put<PawnshopProfile>(`${this.apiUrl}/${pawnshopId}/review`, review);
  }
  
}
