import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { LoginDto, LoginResponse, RegisterDto, RegisterResponse } from "../interfaces/auth.interface";

import { BehaviorSubject,catchError,of } from "rxjs";

import { User } from "../interfaces/user.interface";
import { Product } from "../interfaces/product.interface";
import { PawnshopProfile } from "../interfaces/shop-profile.interface";

@Injectable({
    providedIn: 'root'
})
export class AuthService{

    private apiUrl = 'http://localhost:3000/auth';

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        if (this.getToken()) {
            this.getUserProfile().subscribe(user => {
                this.currentUserSubject.next(user);
            });
        }
    }

    login(dto: LoginDto): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, dto).pipe(
        tap((response: LoginResponse) => {
           if( typeof localStorage !== 'undefined'){
                    localStorage.setItem('access_token', response.access_token)
                }
            this.getUserProfile().subscribe(user => this.currentUserSubject.next(user));
        })
        );
    }

    register(dto:RegisterDto):Observable<RegisterResponse>{
        return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, dto).pipe(
            tap((response:RegisterResponse) => {
                if( typeof localStorage !== 'undefined'){
                    localStorage.setItem('access_token', response.access_token)
                }
            })
        )
    }

    updateUser(userData: Partial<User> | FormData): Observable<User> {
    const headers = this.getToken()
        ? { Authorization: `Bearer ${this.getToken()}` }
        : {};

    return this.http.put<User>(`${this.apiUrl}/update`, userData, { headers }).pipe(
        tap((updatedUser) => {
        // Обновляем текущего пользователя в BehaviorSubject
        this.currentUserSubject.next(updatedUser);
        })
    );
    }

    getUserProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/profile`);
    }

    resetPasswordRequest(email:string):Observable<{message:string}>{
        return this.http.post<{message:string}>(`${this.apiUrl}/request-reset`, {email})
    }
    
    resetPassword(token:string, newPassword:string):Observable<{message:string}>{
        return this.http.post<{message:string}>(`${this.apiUrl}/reset-password`, {token, newPassword})
    }

    logout(): void {
        localStorage.removeItem('access_token');
    }

    getToken(): string | null {
        if(typeof localStorage !=='undefined'){
            return localStorage.getItem('access_token');
        }
        return null;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    setCurrentUser(user: User | null) {
        this.currentUserSubject.next(user);
    }

    // initializeAuth(): Promise<void> {
    // return new Promise((resolve) => {
    //     const token = this.getToken();
    //     if (!token) {
    //     resolve();
    //     return;
    //     }

    //     this.getUserProfile().subscribe({
    //     next: (user) => {
    //         this.currentUserSubject.next(user);
    //         resolve();
    //     },
    //     error: () => {
    //         this.logout();
    //         resolve();
    //     },
    //     });
    // });
    // }

    // loadUserOnInit(): Promise<void> {
    // return new Promise((resolve) => {
    //     const token = this.getToken();
    //     if (!token) {
    //     resolve();
    //     return;
    //     }

    //     // Загружаем профиль в фоне, но не блокируем запуск приложения
    //     this.getUserProfile().subscribe({
    //     next: (user) => this.currentUserSubject.next(user),
    //     error: () => this.logout(),
    //     });

    //     resolve(); // приложение продолжает загружаться
    // });
    // }

    currentPawnshop?: PawnshopProfile | null;
    canEdit(product:Product){
        const user = this.currentUserSubject.value;
    }

}