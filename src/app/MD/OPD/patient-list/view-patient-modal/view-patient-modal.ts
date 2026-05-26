import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-view-patient-modal',
  templateUrl: './view-patient-modal.html',
  styleUrl: './view-patient-modal.scss',
})
export class ViewPatientModal {
  @Input() patient: any;
  @Input() onCheckIn?: (patient: any) => void;

  constructor(public activeModal: NgbActiveModal) { }

  getPatientStatus() {
    if (this.patient?.status) {
      return this.toTitleStatus(this.patient.status);
    }
    return 'Waiting';
  }

  getStatusClass() {
    return this.getPatientStatus().toLowerCase().replace(/\s+/g, '-');
  }

  canCheckIn() {
    return this.getPatientStatus() === 'Waiting';
  }

  checkInPatient() {
    this.patient = { ...this.patient, status: 'Checked In' };
    this.onCheckIn?.(this.patient);
  }

  private toTitleStatus(value: any) {
    const status = String(value || '').trim().toLowerCase();
    if (status === 'checked-in' || status === 'checked in') {
      return 'Checked In';
    }
    if (status === 'consulted') {
      return 'Consulted';
    }
    if (status === 'completed') {
      return 'Completed';
    }
    return 'Waiting';
  }

}
