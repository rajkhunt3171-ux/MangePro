import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientListService } from '../patient-list-service';

@Component({
  selector: 'app-view-patient-modal',
  templateUrl: './view-patient-modal.html',
  styleUrl: './view-patient-modal.scss',
})
export class ViewPatientModal {
  @Input() patient: any;
  @Input() onCheckIn?: (patient: any) => void;
  @Input() onStatusChange?: (patient: any) => void;

  statusUpdating = false;
  statusErrorMessage = '';

  constructor(
    public activeModal: NgbActiveModal,
    private patientListService: PatientListService,
  ) { }

  getPatientStatus() {
    if (this.patient?.status) {
      return this.toTitleStatus(this.patient.status);
    }
    return 'Waiting';
  }

  getStatusClass() {
    return this.getPatientStatus().toLowerCase().replace(/\s+/g, '-');
  }

  get loginType() {
    return localStorage.getItem('type') || '';
  }

  canCheckIn() {
    return this.loginType === '0' && this.getPatientStatus() === 'Waiting';
  }

  showContactAdmin() {
    return this.loginType === '1' && this.getPatientStatus() === 'Waiting';
  }

  canConsult() {
    return this.loginType === '1' && this.getPatientStatus() === 'Checked In';
  }

  canComplete() {
    return this.loginType === '1' && this.getPatientStatus() === 'Consulted';
  }

  showCompletedButton() {
    return this.loginType === '1' && this.getPatientStatus() === 'Completed';
  }

  canChangeStatus() {
    return this.canCheckIn() || this.canConsult() || this.canComplete();
  }

  getActionLabel() {
    if (this.canCheckIn()) {
      return 'Check In';
    }
    if (this.canConsult()) {
      return 'Consulted';
    }
    if (this.canComplete() || this.showCompletedButton()) {
      return 'Completed';
    }
    return '';
  }

  getActionIcon() {
    if (this.canCheckIn()) {
      return 'fa-solid fa-user-check';
    }
    if (this.canConsult()) {
      return 'fa-solid fa-stethoscope';
    }
    return 'fa-solid fa-circle-check';
  }

  getActionClass() {
    if (this.canConsult()) {
      return 'status-action consult-action';
    }
    if (this.canComplete()) {
      return 'status-action complete-action';
    }
    return 'status-action check-in-action';
  }

  changePatientStatus() {
    if (this.statusUpdating) {
      return;
    }

    const status = this.getNextStatus();
    const patientId = this.patient?.patientId;

    if (!status) {
      return;
    }

    if (!patientId) {
      this.statusErrorMessage = 'Patient ID missing che.';
      return;
    }

    this.statusUpdating = true;
    this.statusErrorMessage = '';

    this.patientListService.changePatientStatus({ patientId, status }).subscribe({
      next: (res) => {
        this.statusUpdating = false;
        this.activeModal.close(this.patient);
      },
      error: (err) => {
        this.statusUpdating = false;
        this.statusErrorMessage = err?.error?.message || 'Patient status change karvama error aavyo.';
        console.error('Error changing patient status', err);
      },
    });
  }

  private getNextStatus() {
    if (this.canCheckIn()) {
      return 'Checked In';
    }
    if (this.canConsult()) {
      return 'Consulted';
    }
    if (this.canComplete()) {
      return 'Completed';
    }
    return '';
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
