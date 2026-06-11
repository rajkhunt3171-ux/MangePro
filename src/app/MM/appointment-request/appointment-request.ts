import { Component, OnInit, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentRequestService } from './appointment-request-service';
import { ToastService } from '../../shared/service/toast-service';
import { ViewAppointmentPatient } from '../view-appointment-patient/view-appointment-patient';

@Component({
  selector: 'app-appointment-request',
  imports: [],
  templateUrl: './appointment-request.html',
  styleUrl: './appointment-request.scss',
})
export class AppointmentRequest implements OnInit {

  appointmentRequestList = signal<any[]>([]);
  appointmentRequestPatient = signal<any>(null);

  loading: boolean = false;
  errorMessage: string = '';
  searchText: string = '';

  constructor(
    private appointmentRequestService: AppointmentRequestService,
    private modalService: NgbModal,
    public toastService: ToastService,
  ) { }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.errorMessage = '';

    this.appointmentRequestService.getAppointmentRequestList().subscribe({
      next: (res) => {
        this.appointmentRequestList.set(res.data || []);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.appointmentRequestList.set([]);
        this.errorMessage = err?.error?.message;
        console.error('Error loading appointment requests', err);
      },
    });
  }

  setSearchText(value: string) {
    this.searchText = value;
  }

  get totalRequests() {
    return this.appointmentRequestList().length;
  }

  get todayRequests() {
    return this.appointmentRequestList().filter((appointment) => this.isTodayRequest(appointment)).length;
  }

  getAppointmentDate(appointment: any) {
    const date = new Date(appointment?.updatedAt);

    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString('en-GB');
  }

  getAppointmentTime(appointment: any) {
    const date = new Date(appointment?.updatedAt);

    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private isTodayRequest(appointment: any): boolean {
    const appointmentDate = new Date(appointment?.updatedAt);
    const today = new Date();

    if (Number.isNaN(appointmentDate.getTime())) {
      return false;
    }

    return appointmentDate.toDateString() === today.toDateString();
  }

  approveRequest(data: any) {
    if (!data?.patientId) {
      this.toastService.showToastr('Patient ID missing che.', 'error');
      return;
    }

    this.appointmentRequestService.getAppointmentRequestPatient(data?.patientId).subscribe({
      next: (res: any) => {
        if (res.success) {
          const patient = res.data || null;
          this.appointmentRequestPatient.set(patient);

          const modalRef = this.modalService.open(ViewAppointmentPatient, {
            backdrop: 'static',
            scrollable: true,
            size: 'xl',
          });

          modalRef.componentInstance.patient = patient;
          modalRef.componentInstance.request = data;
          modalRef.result.then((result) => {
            if (result) {
              this.loadAppointments();
            }
          });
        } else {
          this.toastService.showToastr(res?.message, 'error');
          this.appointmentRequestPatient.set(null);
        }
      },
      error: (err) => {
        this.loading = false;
        this.appointmentRequestPatient.set(null);
        this.errorMessage = err?.error?.message;
        console.error('Error loading appointment requests', err);
      },
    });
  }

  deleteRequest(data: any) { }
}
