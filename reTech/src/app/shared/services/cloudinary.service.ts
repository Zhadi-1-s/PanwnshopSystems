import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {

  constructor(private http: HttpClient) {}

  private readonly apiUrl = environment.cloudinary.apiUrl
  private readonly cloudName = environment.cloudinary.cloudName;
  private readonly uploadPreset = environment.cloudinary.uploadPreset;

  async uploadImage(file: File): Promise<{ url: string; publicId: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response: any = await lastValueFrom(
      this.http.post(`${this.apiUrl}/${this.cloudName}/image/upload`, formData)
    );

   return {
      url: response.secure_url,
      publicId: response.public_id
    };
  }
}
