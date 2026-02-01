import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { Product, Company, PagedResult } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductIntelligenceFacade {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3333/api';

  // Load all data (products and companies)
  loadAllData(): Observable<{ products: Product[]; companies: Company[] }> {
    return forkJoin({
      products: this.getProducts(),
      companies: this.getCompanies(),
    });
  }

  // Products API
  getProducts(): Observable<Product[]> {
    return this.http
      .get<PagedResult<Product>>(`${this.apiUrl}/products?maxResultCount=1000`)
      .pipe(map((res) => res.items));
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  // Companies API
  getCompanies(): Observable<Company[]> {
    return this.http
      .get<PagedResult<Company>>(`${this.apiUrl}/companies?maxResultCount=1000`)
      .pipe(map((res) => res.items));
  }

  getCompany(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/companies/${id}`);
  }

  createCompany(company: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/companies`, company);
  }

  updateCompany(id: string, company: Partial<Company>): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/companies/${id}`, company);
  }

  deleteCompany(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/companies/${id}`);
  }
}
