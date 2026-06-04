import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AddRoomService } from './add-room-service';

interface WardOption {
  id?: string | number;
  name: string;
}

@Component({
  selector: 'app-add-room',
  imports: [FormsModule],
  templateUrl: './add-room.html',
  styleUrl: './add-room.scss',
})
export class AddRoom {
  wards: WardOption[] = [];
  wardId: string | number | null = null;
  roomName = '';
  saving = false;
  errorMessage = '';

  constructor(
    public activeModal: NgbActiveModal,
    private addRoomService: AddRoomService,
  ) { }

  submitRoom() {
    const name = this.roomName.trim();

    if (!this.wardId || !name) {
      return;
    }

    const payload = {
      wardId: this.wardId,
      name,
    };

    this.saving = true;
    this.errorMessage = '';

    this.addRoomService.createRoom(payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.activeModal.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'Room add karvama error aavyo.';
        console.error('Error adding room', err);
      },
    });
  }

  closeModal() {
    this.activeModal.dismiss();
  }
}
