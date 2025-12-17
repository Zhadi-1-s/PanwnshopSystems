import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private cloudName = 'damnrvrtn'; 
  private uploadPreset = 'uploader'; 

  constructor(private http: HttpClient) {}

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response: any = await lastValueFrom(
      this.http.post(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, formData)
    );

    return response.secure_url;
  }
}
