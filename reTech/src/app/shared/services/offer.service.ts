import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Offer } from '../interfaces/offer.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  private apiUrl  = environment.apiUrl.offers

  constructor(private http: HttpClient) {}

  createOffer(body: Partial<Offer>): Observable<Offer> {
    return this.http.post<Offer>(this.apiUrl, body);
  }

  getOffersByProduct(productId: string): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/product/${productId}`);
  }

  getOffersByPawnshop(pawnshopId: string): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/pawnshop/${pawnshopId}`);
  }

  getOfferById(id: string): Observable<Offer> {
    return this.http.get<Offer>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: 'pending' | 'completed' | 'rejected'| 'in_inspection'): Observable<Offer> {
    return this.http.patch<Offer>(`${this.apiUrl}/${id}/status`, { status });
  }

  cancelOffer(id:string,reason:string):Observable<Offer>{
    return this.http.patch<Offer>(`${this.apiUrl}/${id}/cancel`,{reason})
  }

}
