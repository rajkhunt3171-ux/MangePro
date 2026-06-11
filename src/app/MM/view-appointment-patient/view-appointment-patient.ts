import { Component, Input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CreatePatientService } from '../../MD/OPD/create-patient/create-patient-service';
import { ToastService } from '../../shared/service/toast-service';
import { ViewAppointmentPatientService } from './view-appointment-patient-service';

@Component({
  selector: 'app-view-appointment-patient',
  imports: [FormsModule],
  templateUrl: './view-appointment-patient.html',
  styleUrl: './view-appointment-patient.scss',
})
export class ViewAppointmentPatient implements OnInit {
  @Input() patient: any;
  @Input() request: any;

  doctors = signal<any[]>([]);
  selectedDoctor: any = '';
  saving = false;
  createPatientReq = {
    patientId: null,
    visitDate: this.getDateInputValue(new Date()),
    visitTime: this.getTimeInputValue(new Date()),
    cdId: '',
    department: null,
    priority: 'Normal',
    symptoms: null,
    allergies: null,
    currentMedication: null,
    status: 'Waiting',
  };

  constructor(
    public activeModal: NgbActiveModal,
    private createPatientService: CreatePatientService,
    private viewAppointmentPatientService: ViewAppointmentPatientService,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.createPatientReq.patientId = this.patient?.patientId;
    this.loadDoctors();
  }

  loadDoctors() {
    this.createPatientService.getDoctors().subscribe({
      next: (res: any) => {
        this.doctors.set(res?.doctorList || []);
      },
      error: (err) => {
        this.doctors.set([]);
        console.error('Error loading doctors', err);
      },
    });
  }

  getAppointmentDate() {
    const date = new Date(this.request?.updatedAt);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleDateString('en-GB');
  }

  getAppointmentTime() {
    const date = new Date(this.request?.updatedAt);
    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  setDepartmentFromDoctor(doctorId: any) {
    this.selectedDoctor = this.doctors().find((doctor) => String(doctor?.id) === String(doctorId));
    this.createPatientReq.department = this.selectedDoctor?.specification;
  }

  get selectedDoctorTypeLabel() {
    const type = Number(this.selectedDoctor?.type);
    if (type === 1) {
      return 'Regular';
    }
    if (type === 2) {
      return 'Visiter';
    }
    return '';
  }

  get selectedDoctorTypeClass() {
    return Number(this.selectedDoctor?.type) === 2 ? 'visiter' : 'regular';
  }

  getDateInputValue(date: Date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }

  getTimeInputValue(date: Date) {
    const time = [
      String(date.getHours()).padStart(2, '0'),
      String(date.getMinutes()).padStart(2, '0'),
      String(date.getSeconds()).padStart(2, '0'),
    ].join(':');

    return `${time}.${String(date.getMilliseconds()).padStart(3, '0')}`;
  }

  submitAppointment() {
    const payload = {
      ...this.createPatientReq,
    };
    const appointmentId = this.request?.appointmentId;

    if (!payload.patientId) {
      this.toastService.showToastr('Patient ID missing che.', 'error');
      return;
    }

    if (!appointmentId) {
      this.toastService.showToastr('Appointment ID missing che.', 'error');
      return;
    }

    this.saving = true;
    this.viewAppointmentPatientService.addPatientVisitDetails(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.approveAppointmentRequest(appointmentId);
        } else {
          this.saving = false;
          this.toastService.showToastr(res?.message, 'error');
        }
      },
      error: (err) => {
        this.saving = false;
        this.toastService.showToastr(err?.error?.message, 'error');
      },
    });
  }

  approveAppointmentRequest(appointmentId: string | number) {
    this.viewAppointmentPatientService.approveAppointmentRequest(appointmentId).subscribe({
      next: (res: any) => {
        this.saving = false;
        if (res.success) {
          this.toastService.showToastr(res?.message, 'success');
          this.activeModal.close(true);
        } else {
          this.toastService.showToastr(res?.message, 'error');
        }
      },
      error: (err) => {
        this.saving = false;
        this.toastService.showToastr(err?.error?.message, 'error');
      },
    });
  }
}
