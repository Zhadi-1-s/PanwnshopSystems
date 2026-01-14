import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable,forkJoin } from "rxjs";
import { User } from "../interfaces/user.interface";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn:'root'
})
export class UserService{

    private apiUrl = environment.apiUrl.users;

    constructor(
        private http:HttpClient
    ){}

    getuserByid(userId:string):Observable<User>{
        return this.http.get<User>(`${this.apiUrl}/${userId}`);
    }

    addFavorite(userId: string, pawnshopId: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${userId}/favorites/${pawnshopId}`, {});
    }

    removeFavorite(userId: string, pawnshopId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${userId}/favorites/${pawnshopId}`);
    }
    
    getFavorites(userId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/${userId}/favorites`);
    }

    addFavoriteItem(userId:string,productId:string):Observable<any>{
        return this.http.patch(`${this.apiUrl}/${userId}/favorite-items/${productId}`, {})
    }

    removeFavoriteItem(userId:string,productId:string):Observable<any>{
        return this.http.delete(`${this.apiUrl}/${userId}/favorite-items/${productId}`)
    }

    getFavoriteItems(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/${userId}/favorite-items`)
    }

    getAllFavorites(userId: string) {
    return forkJoin({
        items: this.getFavoriteItems(userId),
        shops: this.getFavorites(userId)
    });
}

}
