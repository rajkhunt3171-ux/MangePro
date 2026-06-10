import { Component, OnInit, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreatePatient } from '../../MD/OPD/create-patient/create-patient';
import { DeletePatientModal } from '../../MD/OPD/patient-list/delete-patient-modal/delete-patient-modal';
import { PatientListService } from '../../MD/OPD/patient-list/patient-list-service';
import { ViewPatientModal } from '../../MD/OPD/patient-list/view-patient-modal/view-patient-modal';

@Component({
  selector: 'app-appointment-manage',
  imports: [],
  templateUrl: './appointment-manage.html',
  styleUrl: './appointment-manage.scss',
})
export class AppointmentManage implements OnInit {
  appointments = signal<any[]>([]);
  loading = false;
  errorMessage = '';
  searchText = '';
  statusFilter = 'All';

  constructor(
    private modalService: NgbModal,
    private patientListService: PatientListService,
  ) { }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.errorMessage = '';

    this.patientListService.getPatientList().subscribe({
      next: (res) => {
        const appointmentList = res?.appointmentList || res?.appointments || res?.patientList || res?.data || [];
        this.appointments.set(Array.isArray(appointmentList) ? appointmentList : []);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.appointments.set([]);
        this.errorMessage = err?.error?.message || 'Appointments load karvama error aavyo.';
        console.error('Error loading appointments', err);
      },
    });
  }

  get totalAppointments() {
    return this.appointments().length;
  }

  get todayAppointments() {
    return this.appointments().filter((appointment) => this.isTodayVisit(appointment)).length;
  }

  get waitingAppointments() {
    return this.appointments().filter((appointment) => this.getAppointmentStatus(appointment) === 'Waiting').length;
  }

  get checkedInAppointments() {
    return this.appointments().filter((appointment) => this.getAppointmentStatus(appointment) === 'Checked In').length;
  }

  get consultedAppointments() {
    return this.appointments().filter((appointment) => this.getAppointmentStatus(appointment) === 'Consulted').length;
  }

  get completedAppointments() {
    return this.appointments().filter((appointment) => this.getAppointmentStatus(appointment) === 'Completed').length;
  }

  setSearchText(value: string) {
    this.searchText = value;
  }

  setStatusFilter(status: string) {
    this.statusFilter = status;
  }

  filteredAppointments() {
    const search = this.searchText.trim().toLowerCase();

    return this.appointments().filter((appointment) => {
      const statusMatches = this.statusFilter === 'All' || this.getAppointmentStatus(appointment) === this.statusFilter;
      if (!search) {
        return statusMatches;
      }

      const searchableText = [
        appointment?.patientId,
        appointment?.appointmentId,
        appointment?.name,
        appointment?.number,
        appointment?.cdId,
        appointment?.doctorName,
        appointment?.doctor?.name,
        appointment?.dateandtime,
        appointment?.dateAndTime,
      ].filter(Boolean).join(' ').toLowerCase();

      return statusMatches && searchableText.includes(search);
    });
  }

  getAppointmentId(appointment: any) {
    return appointment?.appointmentId || appointment?.patientId || appointment?.id || 'N/A';
  }

  getPatientInitials(appointment: any) {
    const name = appointment?.name || '';
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

  getAgeGender(appointment: any) {
    const age = appointment?.age ?? 'N/A';
    const gender = appointment?.gender || 'N/A';
    return `${age} / ${gender}`;
  }

  getDoctorName(appointment: any) {
    return appointment?.doctorName || appointment?.doctor?.name || appointment?.cdName || appointment?.cdId || 'N/A';
  }

  getAppointmentDate(appointment: any) {
    const value = this.getAppointmentDateValue(appointment);
    if (!value) {
      return 'N/A';
    }

    const dateKey = this.getDateKey(value);
    return dateKey ? this.formatDateForDisplay(dateKey) : value;
  }

  getAppointmentTime(appointment: any) {
    const value = this.getAppointmentTimeValue(appointment);
    if (!value) {
      return 'N/A';
    }

    const combinedDateTimeMatch = String(value).trim().match(/^\d{4}-\d{2}-\d{2}\s+(\d{2}:\d{2})/);
    if (combinedDateTimeMatch) {
      return new Date(`2000-01-01T${combinedDateTimeMatch[1]}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
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

  getAppointmentPriority(appointment: any) {
    const priority = String(appointment?.priority || '').trim().toLowerCase();
    if (priority === 'critical') {
      return 'Critical';
    }
    if (priority === 'urgent') {
      return 'Urgent';
    }
    return 'Normal';
  }

  getAppointmentStatus(appointment: any) {
    if (appointment?.status) {
      return this.toTitleStatus(appointment.status);
    }
    return 'Waiting';
  }

  getStatusClass(appointment: any) {
    return this.getAppointmentStatus(appointment).toLowerCase().replace(/\s+/g, '-');
  }

  updateAppointmentStatus(appointment: any) {
    const patientId = appointment?.patientId;

    this.appointments.update((appointments) =>
      appointments.map((item) => {
        const isCurrentAppointment = patientId ? item?.patientId === patientId : item === appointment;
        return isCurrentAppointment ? { ...item, status: appointment?.status } : item;
      })
    );
  }

  isPatientAdmitted(appointment: any) {
    const admittedValue =
      appointment?.idAdmitted ??
      appointment?.isAdmitted ??
      appointment?.admitted ??
      appointment?.is_admitted ??
      appointment?.admission?.idAdmitted;

    if (typeof admittedValue === 'boolean') {
      return admittedValue;
    }

    const normalizedValue = String(admittedValue ?? '').trim().toLowerCase();

    return (
      normalizedValue === 'true' ||
      normalizedValue === '1' ||
      normalizedValue === 'yes' ||
      normalizedValue === 'admitted' ||
      !!appointment?.admissionDate ||
      !!appointment?.admission?.admissionDate
    );
  }

  getAdmitStatusLabel(appointment: any) {
    return this.isPatientAdmitted(appointment) ? 'Admitted' : 'Not Admit';
  }

  getAdmitStatusClass(appointment: any) {
    return this.isPatientAdmitted(appointment) ? 'admitted' : 'not-admitted';
  }

  isTodayVisit(appointment: any) {
    const todayKey = this.getTodayDateKey();
    const visitDateKey = this.getDateKey(this.getAppointmentDateValue(appointment));

    return visitDateKey === todayKey;
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

  openCreateAppointment() {
    const modalRef = this.modalService.open(CreatePatient, {
      backdrop: 'static',
      scrollable: true,
      size: 'xl',
    });

    modalRef.result.then(() => this.loadAppointments()).catch(() => { });
  }

  openViewAppointment(appointment: any) {
    const modalRef = this.modalService.open(ViewPatientModal, {
      backdrop: 'static',
      scrollable: true,
      size: 'xl',
    });

    modalRef.componentInstance.patient = appointment;
    modalRef.componentInstance.onStatusChange = (selectedAppointment: any) => this.updateAppointmentStatus(selectedAppointment);

    modalRef.result.then((updatedAppointment) => {
      if (updatedAppointment) {
        this.loadAppointments();
      }
    }).catch(() => { });
  }

  openDeleteAppointment(appointment: any) {
    const modalRef = this.modalService.open(DeletePatientModal, {
      backdrop: 'static',
      centered: true,
    });

    modalRef.componentInstance.patient = appointment;

    modalRef.result.then((patientId) => {
      if (patientId) {
        this.appointments.update((appointments) => appointments.filter((item) => item.patientId !== patientId));
      }
    }).catch(() => { });
  }

  private getAppointmentDateValue(appointment: any) {
    return (
      appointment?.appointmentDate ||
      appointment?.date ||
      appointment?.dateandtime ||
      appointment?.dateAndTime ||
      appointment?.appointmentDateTime ||
      appointment?.visitDate ||
      appointment?.createdAt
    );
  }

  private getAppointmentTimeValue(appointment: any) {
    return (
      appointment?.appointmentTime ||
      appointment?.time ||
      appointment?.dateandtime ||
      appointment?.dateAndTime ||
      appointment?.appointmentDateTime ||
      appointment?.visitTime ||
      appointment?.createdAt
    );
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
