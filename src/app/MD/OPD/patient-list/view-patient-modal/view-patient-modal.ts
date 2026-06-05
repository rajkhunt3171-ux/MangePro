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
  admitUpdating = false;
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

  isCompleteDisabled() {
    return this.canComplete() && this.isPatientAdmitted();
  }

  showCompletedButton() {
    return this.loginType === '1' && this.getPatientStatus() === 'Completed';
  }

  showAdmitButton() {
    return this.getPatientStatus() === 'Consulted' && !this.isPatientAdmitted();
  }

  isPatientAdmitted() {
    const admittedValue =
      this.patient?.idAdmitted ??
      this.patient?.isAdmitted ??
      this.patient?.admitted ??
      this.patient?.is_admitted ??
      this.patient?.admission?.idAdmitted;

    if (typeof admittedValue === 'boolean') {
      return admittedValue;
    }

    const normalizedValue = String(admittedValue ?? '').trim().toLowerCase();

    return (
      normalizedValue === 'true' ||
      normalizedValue === '1' ||
      normalizedValue === 'yes' ||
      normalizedValue === 'admitted' ||
      !!this.patient?.admissionDate ||
      !!this.patient?.admission?.admissionDate
    );
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
    if (this.statusUpdating || this.isCompleteDisabled()) {
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

  admitPatient() {
    if (this.admitUpdating) {
      return;
    }

    const patientId = this.patient?.patientId;

    if (!patientId) {
      this.statusErrorMessage = 'Patient ID missing che.';
      return;
    }

    const payload = {
      patientId,
      idAdmitted: true,
      admissionDate: this.getTodayDateKey(),
    };

    this.admitUpdating = true;
    this.statusErrorMessage = '';

    this.patientListService.admitPatient(payload).subscribe({
      next: (res) => {
        this.admitUpdating = false;
        this.patient = {
          ...this.patient,
          idAdmitted: true,
          admissionDate: payload.admissionDate,
        };
        this.activeModal.close(true);
      },
      error: (err) => {
        this.admitUpdating = false;
        this.statusErrorMessage = err?.error?.message;
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

  private getTodayDateKey() {
    const today = new Date();

    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
  }

}
