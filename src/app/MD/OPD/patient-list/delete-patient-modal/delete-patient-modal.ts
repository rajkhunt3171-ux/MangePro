import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientListService } from '../patient-list-service';

@Component({
  selector: 'app-delete-patient-modal',
  templateUrl: './delete-patient-modal.html',
  styleUrl: './delete-patient-modal.scss',
})
export class DeletePatientModal {
  @Input() patient: any;

  deleting = false;
  errorMessage = '';

  constructor(
    public activeModal: NgbActiveModal,
    private patientListService: PatientListService,
  ) { }

  confirmDelete() {
    const patientId = this.patient?.patientId;

    if (!patientId) {
      this.errorMessage = 'Patient ID missing che.';
      return;
    }

    this.deleting = true;
    this.errorMessage = '';

    this.patientListService.deletePatient(patientId).subscribe({
      next: () => {
        this.deleting = false;
        this.activeModal.close(patientId);
      },
      error: (err) => {
        this.deleting = false;
        this.errorMessage = err?.error?.message || 'Patient delete karvama error aavyo.';
        console.error('Error deleting patient', err);
      },
    });
  }
}
