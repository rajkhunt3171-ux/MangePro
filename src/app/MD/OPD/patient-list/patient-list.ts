import { Component, OnInit, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreatePatient } from '../create-patient/create-patient';
import { DeletePatientModal } from './delete-patient-modal/delete-patient-modal';
import { PatientListService } from './patient-list-service';
import { ViewPatientModal } from './view-patient-modal/view-patient-modal';

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
    const todayKey = this.getTodayDateKey();
    const visitDateKey = this.getDateKey(patient?.visitDate);

    return visitDateKey === todayKey;
  }

  get waitingPatients() {
    return this.patients().filter((patient) => this.getPatientStatus(patient) === 'Waiting').length;
  }

  getPatientStatus(patient: any) {
    if (patient?.status) {
      return this.toTitleStatus(patient.status);
    }
    return 'Waiting';
  }

  toTitleStatus(value: any) {
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

  get urgentPatients() {
    return this.patients().filter((patient) => this.getPatientPriority(patient) === 'Urgent').length;
  }

  get criticalPatients() {
    return this.patients().filter((patient) => this.getPatientPriority(patient) === 'Critical').length;
  }

  private getPatientPriority(patient: any) {
    const priority = String(patient?.priority || '').trim().toLowerCase();
    if (priority === 'critical') {
      return 'Critical';
    }
    if (priority === 'urgent') {
      return 'Urgent';
    }
    return 'Normal';
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
      const searchableText = String(patient?.name || '').toLowerCase();
      return statusMatches && searchableText.includes(search);
    });
  }

  getPatientInitials(patient: any) {
    const name = patient?.name || '';
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

  getAgeGender(patient: any) {
    const age = patient?.age ?? 'N/A';
    const gender = patient?.gender || 'N/A';
    return `${age} / ${gender}`;
  }

  getVisitDate(patient: any) {
    const value = patient?.visitDate;
    if (!value) {
      return 'N/A';
    }
    const dateKey = this.getDateKey(value);
    return dateKey ? this.formatDateForDisplay(dateKey) : value;
  }

  getVisitTime(patient: any) {
    const value = patient?.visitTime;
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

  getStatusClass(patient: any) {
    return this.getPatientStatus(patient).toLowerCase().replace(/\s+/g, '-');
  }

  updatePatientStatus(patient: any) {
    const patientId = patient?.patientId;

    this.patients.update((patients) =>
      patients.map((item) => {
        const isCurrentPatient = patientId ? item?.patientId === patientId : item === patient;
        return isCurrentPatient ? { ...item, status: patient?.status } : item;
      })
    );
  }

  getTodayDateKey() {
    return this.formatDateKey(new Date());
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

  openViewPatient(patient: any) {
    const modalRef = this.modalService.open(ViewPatientModal, {
      backdrop: 'static',
      scrollable: true,
      size: 'xl',
    });

    modalRef.componentInstance.patient = patient;
    modalRef.componentInstance.onStatusChange = (selectedPatient: any) => this.updatePatientStatus(selectedPatient);

    modalRef.result.then((updatedPatient) => {
      if (updatedPatient) {
        this.loadPatients();
      }
    }).catch(() => { });
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
}
