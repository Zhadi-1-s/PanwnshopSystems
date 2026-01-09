import { Injectable } from '@angular/core';
import { Observable,BehaviorSubject,tap } from 'rxjs';
import { Product } from '../interfaces/product.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService{

  private apiUrl = 'http://localhost:3000/products';

  private products$ = new BehaviorSubject<Product[]>([]);

  constructor(private http:HttpClient){
  
  }

  getProducts() {
    return this.products$.asObservable();
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

  loadProductsByOwner(ownerId: string): void {
    this.http
      .get<Product[]>(`${this.apiUrl}/owner/${ownerId}`)
      .subscribe(products => {
        this.products$.next(products);
      });
  }


   createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(created => {
        this.products$.next([...this.products$.value, created]);
      })
    );
  }


  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      tap(updated => {
        const updatedList = this.products$.value.map(p =>
          p._id === updated._id ? updated : p
        );
        this.products$.next(updatedList);
      })
    );
  }


  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const updated = this.products$.value.filter(p => p._id !== id);
        this.products$.next(updated);
      })
    );
  }

}