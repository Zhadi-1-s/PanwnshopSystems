import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/product.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService{

  private apiUrl = 'http://localhost:3000/products';

  constructor(private http:HttpClient){
  
  }

  getProcutsList():Observable<Product[]>{
      return this.http.get<Product[]>(this.apiUrl);
  }


  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }


  getProductsByOwner(ownerId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/owner/${ownerId}`);
  }


  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }


  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }


  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}