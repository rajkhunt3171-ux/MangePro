import { Component, OnInit, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreatePatient } from '../create-patient/create-patient';
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
  searchText = '';
  statusFilter = 'All';

  constructor(
    private modalService: NgbModal,
    private patientListService: PatientListService,
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  get totalPatients() {
    return this.patients().length;
  }

  get todayVisits() {
    return this.patients().filter((patient) => this.isTodayVisit(patient)).length;
  }

  get waitingPatients() {
    return this.patients().filter((patient) => this.getPatientStatus(patient) === 'Waiting').length;
  }

  get criticalPatients() {
    return this.patients().filter((patient) => this.getPatientStatus(patient) === 'Critical').length;
  }

  loadPatients() {
    this.loading = true;
    this.errorMessage = '';

    this.patientListService.getPatientList().subscribe({
      next: (res) => {
        this.patients.set(this.extractPatients(res));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.patients.set([]);
        this.errorMessage = err?.error?.message || 'Patient list load karvama error aavyo.';
        console.error('Error loading patients', err);
      },
    });
  }

  openCreatePatient() {
    const modalRef = this.modalService.open(CreatePatient, {
      backdrop: 'static',
      scrollable: true,
      size: 'xl',
    });

    modalRef.result.then(() => this.loadPatients()).catch(() => {});
  }

  setSearchText(value: string) {
    this.searchText = value;
  }

  setStatusFilter(status: string) {
    this.statusFilter = status;
  }

  filteredPatients() {
    const search = this.searchText.trim().toLowerCase();

    return this.patients().filter((patient) => {
      const statusMatches = this.statusFilter === 'All' || this.getPatientStatus(patient) === this.statusFilter;

      if (!search) {
        return statusMatches;
      }

      const searchableText = [
        this.getPatientName(patient),
        this.getSymptoms(patient),
        this.getOpdNo(patient),
        this.getDoctorName(patient),
        patient?.number,
        patient?.mobileNumber,
        patient?.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return statusMatches && searchableText.includes(search);
    });
  }

  getPatientTrack(patient: any, index: number) {
    return patient?._id || patient?.id || patient?.opdNo || patient?.opdNumber || patient?.name || index;
  }

  getPatientName(patient: any) {
    return patient?.name || patient?.patientName || patient?.fullName || 'N/A';
  }

  getPatientInitials(patient: any) {
    const name = this.getPatientName(patient);
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((part: string) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return initials || 'NA';
  }

  getAvatarClass(index: number) {
    const classes = ['avatar', 'avatar soft-green', 'avatar soft-amber', 'avatar soft-purple', 'avatar soft-red'];
    return classes[index % classes.length];
  }

  getSymptoms(patient: any) {
    return patient?.symptoms || patient?.complaint || patient?.reason || 'No symptoms';
  }

  getOpdNo(patient: any) {
    return patient?.opdNo || patient?.opdNumber || patient?.opdId || patient?.registrationNo || patient?.patientNo || patient?.id || patient?._id || 'N/A';
  }

  getAgeGender(patient: any) {
    const age = patient?.age ?? 'N/A';
    const gender = patient?.gender || 'N/A';

    return `${age} / ${gender}`;
  }

  getDoctorName(patient: any) {
    const doctor = patient?.doctor || patient?.consultingDoctor || patient?.cdId;

    if (doctor && typeof doctor === 'object') {
      return doctor.name || doctor.fullName || doctor.doctorName || 'N/A';
    }

    return (
      patient?.doctorName ||
      patient?.cdName ||
      patient?.doctor ||
      patient?.cdId ||
      'N/A'
    );
  }

  getVisitTime(patient: any) {
    const value = patient?.visitTime || patient?.time || patient?.createdAt;

    if (!value) {
      return 'N/A';
    }

    if (/^\d{2}:\d{2}/.test(String(value))) {
      return new Date(`2000-01-01T${value}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getPatientStatus(patient: any) {
    if (patient?.status) {
      return this.toTitleStatus(patient.status);
    }

    if (String(patient?.priority || '').toLowerCase() === 'critical') {
      return 'Critical';
    }

    return 'Waiting';
  }

  getStatusClass(patient: any) {
    return this.getPatientStatus(patient).toLowerCase().replace(/\s+/g, '-');
  }

  private extractPatients(res: any) {
    const patients = Array.isArray(res)
      ? res
      : res?.patientList || res?.patients || res?.data?.patientList || res?.data?.patients || res?.data || [];

    return Array.isArray(patients) ? patients : [];
  }

  private isTodayVisit(patient: any) {
    const value = patient?.visitDate || patient?.createdAt;

    if (!value) {
      return false;
    }

    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    const date = String(value).slice(0, 10);

    return date === today;
  }

  private toTitleStatus(value: any) {
    const status = String(value || '').trim().toLowerCase();

    if (status === 'checked-in' || status === 'checked in') {
      return 'Checked In';
    }

    if (status === 'consulted') {
      return 'Consulted';
    }

    if (status === 'critical') {
      return 'Critical';
    }

    return 'Waiting';
  }
}
