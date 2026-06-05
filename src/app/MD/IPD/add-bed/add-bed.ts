import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AddBedService } from './add-bed-service';

interface RoomOption {
  id?: string | number;
  wardId?: string | number;
  name?: string;
}

interface WardOption {
  id?: string | number;
  name: string;
}

@Component({
  selector: 'app-add-bed',
  imports: [FormsModule],
  templateUrl: './add-bed.html',
  styleUrl: './add-bed.scss',
})
export class AddBed {
  wards: WardOption[] = [];
  rooms: RoomOption[] = [];
  filteredRooms: RoomOption[] = [];
  wardId: string | number | null = null;
  roomId: string | number | null = null;
  bedName = '';
  saving = false;
  errorMessage = '';

  constructor(
    public activeModal: NgbActiveModal,
    private addBedService: AddBedService,
  ) { }

  onWardChange(wardId: string | number | null) {
    this.wardId = wardId;
    this.roomId = null;
    this.filteredRooms = this.rooms.filter((room) => String(room.wardId || '') === String(wardId || ''));
  }

  submitBed() {
    const name = this.bedName.trim();

    if (!this.wardId || !this.roomId || !name) {
      return;
    }

    const payload = {
      roomId: this.roomId,
      wardId: this.wardId,
      name,
      status: 'available'
    };

    this.saving = true;
    this.errorMessage = '';

    this.addBedService.createBed(payload).subscribe({
      next: () => {
        this.saving = false;
        this.activeModal.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'Bed add karvama error aavyo.';
        console.error('Error adding bed', err);
      },
    });
  }

  closeModal() {
    this.activeModal.dismiss();
  }
}
