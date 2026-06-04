import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AddWardService } from './add-ward-service';

@Component({
  selector: 'app-add-ward',
  imports: [FormsModule],
  templateUrl: './add-ward.html',
  styleUrl: './add-ward.scss',
})
export class AddWard {
  wardName = '';
  saving = false;
  errorMessage = '';

  constructor(
    public activeModal: NgbActiveModal,
    private addWardService: AddWardService,
  ) { }

  submitWard() {
    const name = this.wardName.trim();

    if (!name) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const payload = {
      name: name
    }

    this.addWardService.createWard(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.saving = false;
          this.activeModal.close(true);
        }
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message;
      },
    });
  }

  closeModal() {
    this.activeModal.dismiss();
  }
}
