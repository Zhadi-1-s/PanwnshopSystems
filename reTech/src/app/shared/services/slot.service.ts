import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Slot } from '../interfaces/slot.interface';

@Injectable({
  providedIn: 'root'
})
export class SlotService {
  private apiUrl = 'http://localhost:3000/slots';

  constructor(private http: HttpClient) {}


  createSlot(slotData: Partial<Slot>): Observable<Slot> {
    return this.http.post<Slot>(`${this.apiUrl}`, slotData);
  }

  deleteSlot(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getActiveSlots(): Observable<Slot[]> {
    return this.http.get<Slot[]>(`${this.apiUrl}/active`);
  }

  getAllSlots(): Observable<Slot[]> {
    return this.http.get<Slot[]>(`${this.apiUrl}`);
  }

  getSlotsByUserId(userId: string): Observable<Slot[]> {
    return this.http.get<Slot[]>(`${this.apiUrl}/user/${userId}`);
  }

  getSlotsByPawnshopId(pawnshopId: string): Observable<Slot[]> {
    return this.http.get<Slot[]>(`${this.apiUrl}/pawnshop/${pawnshopId}`);
  }

  getSlotById(id: string): Observable<Slot> {
    return this.http.get<Slot>(`${this.apiUrl}/${id}`);
  }
}
