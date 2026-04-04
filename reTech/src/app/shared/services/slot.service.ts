import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,Subject } from 'rxjs';
import { Slot } from '../interfaces/slot.interface';
import { environment } from '../../../environments/environment';
import { LoanStatus } from '../enums/status.enum';

@Injectable({
  providedIn: 'root'
})
export class SlotService {
  private apiUrl  = environment.apiUrl.slots;

  private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();


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

 updateSlotStatus(id: string, dto: { status: LoanStatus; userId: string }): Observable<Slot> {
    return this.http.patch<Slot>(`${this.apiUrl}/${id}/status`, dto);
  }

  triggerRefresh() {
    this.refreshSubject.next();
  }

}
