import { HttpClient,HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AppNotification } from "../interfaces/notification.interface";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = environment.apiUrl.notifications;

  constructor(private http: HttpClient) {}

  createnotification(body: AppNotification): Observable<AppNotification> {
    return this.http.post<AppNotification>(this.apiUrl, body);
  }

  /** Получить уведомления пользователя */
  getUserNotifications(userId: string): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}/user/${userId}`);
  }

  /** Пометить как прочитанное */
  markAsRead(id: string, userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/read`, { userId });
  }

  /** Получить количество непрочитанных */
  getUnreadCount(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/user/${userId}/unread-count`);
  }
}