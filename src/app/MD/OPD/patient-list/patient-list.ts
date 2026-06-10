import { Component, OnInit, computed, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../../shared/service/toast-service';
import { CreatePatient } from '../create-patient/create-patient';
import { DeletePatientModal } from './delete-patient-modal/delete-patient-modal';
import { PatientListService } from './patient-list-service';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss',
})
export class PatientList implements OnInit {
  patients = signal<any[]>([]);
  loading = false;
  errorMessage = '';
  searchText = signal('');
  dateFilter = signal('All');
  appointmentRequestingPatientId: string | number | null = null;
  appointmentRequestedPatientIds = new Set<string | number>();
  private todayDateKey = this.formatDateKey(new Date());
  filteredPatients = computed(() => {
    const search = this.searchText().trim().toLowerCase();
    const dateFilter = this.dateFilter();

    return this.patients().filter((patient) => {
      const dateMatches = dateFilter === 'All' || this.isTodayVisit(patient);
      if (!search) {
        return dateMatches;
      }
      const searchableText = [
        patient?.patientId,
        patient?.name,
        patient?.number,
        patient?.mobileNumber,
        patient?.mobile,
        patient?.phone,
      ].filter(Boolean).join(' ').toLowerCase();
      return dateMatches && searchableText.includes(search);
    });
  });

  constructor(
    private modalService: NgbModal,
    private patientListService: PatientListService,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    this.errorMessage = '';

    this.patientListService.getPatientList().subscribe({
      next: (res) => {
        this.patients.set(res.patientList || []);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.patients.set([]);
        this.errorMessage = err?.error?.message;
        console.error('Error loading patients', err);
      },
    });
  }

  get totalPatients() {
    return this.patients().length;
  }

  get todayVisits() {
    return this.patients().filter((patient) => this.isTodayVisit(patient)).length;
  }

  isTodayVisit(patient: any) {
    const visitDateKey = this.getDateKey(this.getCreatedAtValue(patient) || patient?.visitDate);

    return visitDateKey === this.todayDateKey;
  }

  setSearchText(value: string) {
    this.searchText.set(value);
  }

  setDateFilter(filter: string) {
    this.dateFilter.set(filter);
  }

  getMobileNumber(patient: any) {
    return patient?.number || patient?.mobileNumber || patient?.mobile || patient?.phone || 'N/A';
  }

  getPatientInitials(patient: any) {
    const name = String(patient?.name || '').trim();
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((part: string) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return initials || 'NA';
  }

  getAgeGender(patient: any) {
    const age = patient?.age ?? 'N/A';
    const gender = patient?.gender || 'N/A';
    return `${age} / ${gender}`;
  }

  getCreatedDateTime(patient: any) {
    const value = this.getCreatedAtValue(patient);
    if (!value) {
      return 'N/A';
    }

    const dateKey = this.getDateKey(value);
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return dateKey ? this.formatDateForDisplay(dateKey) : 'N/A';
    }

    const displayDate = dateKey ? this.formatDateForDisplay(dateKey) : 'N/A';
    const displayTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${displayDate} ${displayTime}`;
  }

  getDateKey(value: any) {
    if (!value) {
      return '';
    }
    if (value instanceof Date) {
      return this.formatDateKey(value);
    }
    const rawValue = String(value).trim();
    const dateMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    }
    const parsedDate = new Date(rawValue);
    if (!Number.isNaN(parsedDate.getTime())) {
      return this.formatDateKey(parsedDate);
    }
    return '';
  }

  formatDateKey(date: Date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }

  formatDateForDisplay(dateKey: string) {
    const [year, month, day] = dateKey.split('-');
    return `${day}/${month}/${year}`;
  }

  openCreatePatient() {
    const modalRef = this.modalService.open(CreatePatient, {
      backdrop: 'static',
      scrollable: true,
      size: 'xl',
    });

    modalRef.result.then(() => this.loadPatients()).catch(() => { });
  }

  openDeletePatient(patient: any) {
    const modalRef = this.modalService.open(DeletePatientModal, {
      backdrop: 'static',
      centered: true,
    });

    modalRef.componentInstance.patient = patient;

    modalRef.result.then((patientId) => {
      if (patientId) {
        this.patients.update((patients) => patients.filter((item) => item.patientId !== patientId));
      }
    }).catch(() => { });
  }

  requestToAppointment(patient: any) {
    const patientId = patient?.patientId;

    if (!patientId) {
      this.toastService.showToastr('Patient ID missing che.', 'error');
      return;
    }

    if (this.isAppointmentRequesting(patient) || this.isAppointmentRequested(patient)) {
      return;
    }

    this.appointmentRequestingPatientId = patientId;

    const payload = {
      patientId,
      dateandtime: this.getDateTimeForRequest(),
    };

    this.patientListService.requestToAppointment(payload).subscribe({
      next: (res) => {
        this.appointmentRequestingPatientId = null;

        if (res?.success === false) {
          this.toastService.showToastr(res?.message || 'Appointment request failed.', 'error');
          return;
        }

        const requestedIds = new Set(this.appointmentRequestedPatientIds);
        requestedIds.add(patientId);
        this.appointmentRequestedPatientIds = requestedIds;
        this.toastService.showToastr(res?.message || 'Appointment request mokli didhi.', 'success');
        this.loadPatients();
      },
      error: (err) => {
        this.appointmentRequestingPatientId = null;
        this.toastService.showToastr(err?.error?.message || 'Appointment request karvama error aavyo.', 'error');
      },
    });
  }

  isAppointmentRequesting(patient: any) {
    return this.appointmentRequestingPatientId === patient?.patientId;
  }

  isAppointmentRequested(patient: any) {
    const patientId = patient?.patientId;
    return !!patientId && this.appointmentRequestedPatientIds.has(patientId);
  }

  getAppointmentRequestIcon(patient: any) {
    if (this.isAppointmentRequesting(patient)) {
      return 'fa-solid fa-spinner fa-spin';
    }
    if (this.isAppointmentRequested(patient)) {
      return 'fa-solid fa-check';
    }
    return 'fa-regular fa-calendar-plus';
  }

  private getCreatedAtValue(patient: any) {
    return patient?.createdAt || patient?.created_at || patient?.createdDate || patient?.createdOn || patient?.created_on || '';
  }

  private getDateTimeForRequest(date = new Date()) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${this.formatDateKey(date)} ${hours}:${minutes}`;
  }
}
