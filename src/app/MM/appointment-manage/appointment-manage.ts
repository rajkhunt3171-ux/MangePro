import { Component, OnInit, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
    private patientListService: PatientListService
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    this.errorMessage = '';

    this.patientListService.getPatientList().subscribe({
      next: (res: any) => {
        const appointments = (res?.patientList || [])
          .map((patient: any) => {
            const visits = this.sortVisitsByLatest(patient?.visitData || []);
            const latestVisit = visits[0];

            if (!latestVisit) {
              return null;
            }

            return {
              ...patient,
              ...latestVisit,
              appointmentId: latestVisit.visitId,
              latestVisit,
              visitData: [latestVisit],
              allVisitData: visits,
            };
          })
          .filter(Boolean);

        this.appointments.set(this.sortAppointmentsByLatest(appointments));
        this.loading = false;
        console.log('Loaded Appointments:', appointments);
      },
      error: (err) => {
        this.loading = false;
        this.appointments.set([]);
        this.errorMessage = err?.error?.message || 'Something went wrong';
      },
    });
  }

  get totalAppointments() {
    return this.appointments().length;
  }

  get todayAppointments() {
    const today = new Date().toISOString().split('T')[0];

    return this.appointments().filter(
      (appointment) => appointment?.latestVisit?.visitDate === today
    ).length;
  }

  private getStatusCount(status: string) {
    return this.appointments().filter(
      (appointment) => appointment?.latestVisit?.status === status
    ).length;
  }

  get waitingAppointments() {
    return this.getStatusCount('Waiting');
  }

  get checkedInAppointments() {
    return this.getStatusCount('Checked In');
  }

  get consultedAppointments() {
    return this.getStatusCount('Consulted');
  }

  get completedAppointments() {
    return this.getStatusCount('Completed');
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
      const status = this.getAppointmentStatus(appointment);
      const statusMatch = this.statusFilter === 'All' || status === this.statusFilter;

      if (!search) {
        return statusMatch;
      }

      const searchableText = [
        appointment?.patientId,
        appointment?.appointmentId,
        appointment?.name,
        appointment?.number,
        appointment?.latestVisit?.cdId,
        appointment?.latestVisit?.department,
        appointment?.latestVisit?.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return statusMatch && searchableText.includes(search);
    });
  }

  getAppointmentStatus(appointment: any) {
    return appointment?.latestVisit?.status || 'Waiting';
  }

  getAppointmentId(appointment: any) {
    return appointment?.appointmentId || appointment?.patientId || 'N/A';
  }

  getPatientInitials(appointment: any) {
    const name = appointment?.name || '';

    return (
      name
        .split(' ')
        .filter(Boolean)
        .map((part: string) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'NA'
    );
  }

  getAvatarClass(index: number) {
    const classes = [
      'avatar',
      'avatar soft-green',
      'avatar soft-amber',
      'avatar soft-purple',
      'avatar soft-red',
    ];

    return classes[index % classes.length];
  }

  getAgeGender(appointment: any) {
    return `${appointment?.age ?? 'N/A'} / ${appointment?.gender || 'N/A'}`;
  }

  getDoctorName(appointment: any) {
    return appointment?.latestVisit?.cdName || appointment?.latestVisit?.cdId || 'N/A';
  }

  getAppointmentDate(appointment: any) {
    const date = appointment?.latestVisit?.visitDate;

    if (!date) {
      return 'N/A';
    }

    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  getAppointmentTime(appointment: any) {
    const time = appointment?.latestVisit?.visitTime;

    if (!time) {
      return 'N/A';
    }

    return time.slice(0, 5);
  }

  getAppointmentPriority(appointment: any) {
    return appointment?.latestVisit?.priority || 'Normal';
  }

  private sortVisitsByLatest(visits: any[]) {
    return [...visits].sort(
      (firstVisit, secondVisit) =>
        this.getVisitDateTimeValue(secondVisit) - this.getVisitDateTimeValue(firstVisit)
    );
  }

  private sortAppointmentsByLatest(appointments: any[]) {
    return [...appointments].sort(
      (firstAppointment, secondAppointment) =>
        this.getVisitDateTimeValue(secondAppointment?.latestVisit || secondAppointment) -
        this.getVisitDateTimeValue(firstAppointment?.latestVisit || firstAppointment)
    );
  }

  private getVisitDateTimeValue(visit: any) {
    const visitDate = String(visit?.visitDate || '').trim();

    if (!visitDate) {
      return 0;
    }

    const visitTime = String(visit?.visitTime || '00:00:00').trim();
    const normalizedTime = /^\d{2}:\d{2}/.test(visitTime) ? visitTime : '00:00:00';
    const dateTime = new Date(`${visitDate}T${normalizedTime}`);

    if (!Number.isNaN(dateTime.getTime())) {
      return dateTime.getTime();
    }

    const dateOnly = new Date(visitDate);
    return Number.isNaN(dateOnly.getTime()) ? 0 : dateOnly.getTime();
  }

  getStatusClass(appointment: any) {
    return this.getAppointmentStatus(appointment)
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  updateAppointmentStatus(appointment: any) {
    this.appointments.update((appointments) =>
      appointments.map((item) =>
        item?.latestVisit?.visitId === appointment?.visitId
          ? {
              ...item,
              latestVisit: {
                ...item.latestVisit,
                status: appointment?.status,
              },
              status: appointment?.status,
            }
          : item
      )
    );
  }

  isPatientAdmitted(appointment: any) {
    return appointment?.latestVisit?.idAdmitted === true;
  }

  getAdmitStatusLabel(appointment: any) {
    return this.isPatientAdmitted(appointment) ? 'Admitted' : 'Not Admit';
  }

  getAdmitStatusClass(appointment: any) {
    return this.isPatientAdmitted(appointment) ? 'admitted' : 'not-admitted';
  }

  openViewAppointment(appointment: any) {
    const modalRef = this.modalService.open(ViewPatientModal, {
      backdrop: 'static',
      scrollable: true,
      size: 'xl',
    });

    modalRef.componentInstance.patient = appointment;
    modalRef.componentInstance.onStatusChange = (selectedAppointment: any) =>
      this.updateAppointmentStatus(selectedAppointment);

    modalRef.result
      .then((updatedAppointment) => {
        if (updatedAppointment) {
          this.loadAppointments();
        }
      })
      .catch(() => {});
  }

  openDeleteAppointment(appointment: any) {
    const modalRef = this.modalService.open(DeletePatientModal, {
      backdrop: 'static',
      centered: true,
    });

    modalRef.componentInstance.patient = appointment;

    modalRef.result
      .then((patientId) => {
        if (patientId) {
          this.appointments.update((appointments) =>
            appointments.filter((item) => item.patientId !== patientId)
          );
        }
      })
      .catch(() => {});
  }
}
