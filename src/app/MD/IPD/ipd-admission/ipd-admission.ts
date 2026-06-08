import { Component, OnInit, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RouterLink } from '@angular/router';
import { PatientListService } from '../../OPD/patient-list/patient-list-service';
import { ViewPatientModal } from '../../OPD/patient-list/view-patient-modal/view-patient-modal';
import { BedVisualModal } from './bed-visual-modal/bed-visual-modal';

@Component({
  selector: 'app-ipd-admission',
  imports: [RouterLink],
  templateUrl: './ipd-admission.html',
  styleUrl: './ipd-admission.scss',
})
export class IpdAdmission implements OnInit {
  patients = signal<any[]>([]);
  loading = false;
  errorMessage = '';
  searchText = '';

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
        const patientList = res?.patientList || res?.patients || res?.data || [];
        this.patients.set(Array.isArray(patientList) ? patientList : []);
        this.loading = false;
      },
      error: (err) => {
        this.patients.set([]);
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Unable to load admitted patient list.';
      },
    });
  }

  get admittedPatients() {
    return this.patients().filter((patient) => this.isPatientAdmitted(patient));
  }

  get totalAdmittedPatients() {
    return this.admittedPatients.length;
  }

  get todayAdmissions() {
    const todayKey = this.getTodayDateKey();

    return this.admittedPatients.filter((patient) => this.getDateKey(this.getAdmissionDateValue(patient)) === todayKey).length;
  }

  get criticalPatients() {
    return this.admittedPatients.filter((patient) => this.getPatientPriority(patient) === 'Critical').length;
  }

  setSearchText(value: string) {
    this.searchText = value;
  }

  filteredAdmittedPatients() {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.admittedPatients;
    }

    return this.admittedPatients.filter((patient) => {
      const searchableText = [
        patient?.patientId,
        patient?.name,
        patient?.mobile,
        patient?.phone,
        patient?.cdId,
        patient?.doctorName,
        patient?.doctor?.name,
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(search);
    });
  }

  getPatientInitials(patient: any) {
    const initials = String(patient?.name || '')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return initials || 'NA';
  }

  getAvatarClass(index: number) {
    const classes = ['avatar', 'avatar soft-green', 'avatar soft-amber', 'avatar soft-red'];
    return classes[index % classes.length];
  }

  getAgeGender(patient: any) {
    const age = patient?.age ?? 'N/A';
    const gender = patient?.gender || 'N/A';

    return `${age} / ${gender}`;
  }

  getDoctorName(patient: any) {
    return patient?.doctorName || patient?.doctor?.name || patient?.cdId || 'N/A';
  }

  getPatientPriority(patient: any) {
    const priority = String(patient?.priority || '').trim().toLowerCase();

    if (priority === 'critical') {
      return 'Critical';
    }

    if (priority === 'urgent') {
      return 'Urgent';
    }

    return 'Normal';
  }

  getPriorityClass(patient: any) {
    return this.getPatientPriority(patient).toLowerCase();
  }

  getPatientStatus(patient: any) {
    const status = String(patient?.status || '').trim().toLowerCase();

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

  getStatusClass(patient: any) {
    return this.getPatientStatus(patient).toLowerCase().replace(/\s+/g, '-');
  }

  getAdmissionDate(patient: any) {
    const value = this.getAdmissionDateValue(patient);
    const dateKey = this.getDateKey(value);

    return dateKey ? this.formatDateForDisplay(dateKey) : 'N/A';
  }

  getVisitDate(patient: any) {
    const dateKey = this.getDateKey(patient?.visitDate);

    return dateKey ? this.formatDateForDisplay(dateKey) : 'N/A';
  }

  getBedLabel(patient: any) {
    return (
      patient?.bedName ||
      patient?.bedId ||
      patient?.admission?.bedName ||
      patient?.admission?.bedId ||
      'Not Allocated'
    );
  }

  openViewPatient(patient: any) {
    const modalRef = this.modalService.open(ViewPatientModal, {
      backdrop: 'static',
      scrollable: true,
      size: 'xl',
    });

    modalRef.componentInstance.patient = patient;

    modalRef.result.then((updatedPatient) => {
      if (updatedPatient) {
        this.loadPatients();
      }
    }).catch(() => { });
  }

  openBedVisual(patient: any) {
    const modalRef = this.modalService.open(BedVisualModal, {
      backdrop: 'static',
      scrollable: true,
      size: 'xl',
      windowClass: 'bed-visual-modal-window',
    });

    modalRef.componentInstance.patient = patient;

    modalRef.result.then((allocationResult) => {
      if (allocationResult) {
        this.loadPatients();
      }
    }).catch(() => { });
  }

  isPatientAdmitted(patient: any) {
    const admittedValue =
      patient?.idAdmitted ??
      patient?.isAdmitted ??
      patient?.admitted ??
      patient?.is_admitted ??
      patient?.admission?.idAdmitted;

    if (typeof admittedValue === 'boolean') {
      return admittedValue;
    }

    const normalizedValue = String(admittedValue ?? '').trim().toLowerCase();

    return (
      normalizedValue === 'true' ||
      normalizedValue === '1' ||
      normalizedValue === 'yes' ||
      normalizedValue === 'admitted' ||
      !!this.getAdmissionDateValue(patient)
    );
  }

  private getAdmissionDateValue(patient: any) {
    return patient?.admissionDate || patient?.admittedAt || patient?.admission?.admissionDate || patient?.admission?.date;
  }

  private getTodayDateKey() {
    return this.formatDateKey(new Date());
  }

  private getDateKey(value: any) {
    if (!value) {
      return '';
    }

    const rawValue = String(value).trim();
    const dateMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (dateMatch) {
      return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    }

    const parsedDate = new Date(rawValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return this.formatDateKey(parsedDate);
  }

  private formatDateKey(date: Date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  }

  private formatDateForDisplay(dateKey: string) {
    const [year, month, day] = dateKey.split('-');
    return `${day}/${month}/${year}`;
  }
}
