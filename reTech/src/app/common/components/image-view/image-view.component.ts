import { CommonModule } from '@angular/common';
import { Component, Input,Output,EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-image-view',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './image-view.component.html',
  styleUrl: './image-view.component.scss'
})
export class ImageViewComponent {

  @Input() photos: string[];
  @Input() editable:boolean ;

  @Output() photoRemoved = new EventEmitter<number>();
  @Output() photoAdded = new EventEmitter<void>();

  selectedPhoto: string | null = null;

  selectedIndex: number | null = null;

  openPhoto(index: number) {
    this.selectedIndex = index;
  }

  closePhoto() {
    this.selectedIndex = null;
  }

  nextPhoto(event: Event) {
    event.stopPropagation();
    if (this.selectedIndex === null) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.photos.length;
  }

  prevPhoto(event: Event) {
    event.stopPropagation();
    if (this.selectedIndex === null) return;
    this.selectedIndex =
      (this.selectedIndex - 1 + this.photos.length) % this.photos.length;
  }

  removePhoto(index:number, event: Event){
    event.stopPropagation();
    this.photoRemoved.emit(index);
  }
  addPhoto(){
    this.photoAdded.emit();
  }

}
