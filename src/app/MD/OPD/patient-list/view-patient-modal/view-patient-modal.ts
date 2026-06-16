import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientListService } from '../patient-list-service';

type PatientDetailTab = 'patient' | 'visit' | 'contact' | 'charge' | 'history';
type FileChargeStatus = 'paid' | 'unpaid';
type FileChargePaymentType = 'cash' | 'online';

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
  chargeSaving = false;
  chargeApplied = false;
  statusErrorMessage = '';
  activeTab: PatientDetailTab = 'patient';
  fileCharge = '';
  fileChargeStatus: FileChargeStatus = 'unpaid';
  fileChargePaymentType: FileChargePaymentType = 'cash';
  readonly fileChargeOptions = [100, 200, 300, 500, 1000];
  private chargeInitialized = false;

  constructor(
    public activeModal: NgbActiveModal,
    private patientListService: PatientListService,
  ) { }

  ngOnInit() {
    this.initializeChargeFlow();
  }

  getPatientVisits() {
    const allVisitData = this.patient?.allVisitData;
    const visitData = this.patient?.visitData;

    if (Array.isArray(allVisitData) && allVisitData.length) {
      return allVisitData;
    }

    if (Array.isArray(visitData) && visitData.length) {
      return visitData;
    }

    if (this.patient?.latestVisit) {
      return [this.patient.latestVisit];
    }

    return [];
  }

  getLatestVisit() {
    return this.patient?.latestVisit || this.getPatientVisits()[0] || null;
  }

  getVisitValue(field: string) {
    const latestVisit = this.getLatestVisit();
    return latestVisit?.[field] ?? this.patient?.[field] ?? '';
  }

  getDisplayValue(value: any) {
    if (value === undefined || value === null || value === '') {
      return 'N/A';
    }

    return value;
  }

  setActiveTab(tab: PatientDetailTab) {
    if (tab === 'charge') {
      this.initializeChargeFlow();
    }

    this.activeTab = tab;
  }

  isActiveTab(tab: PatientDetailTab) {
    return this.activeTab === tab;
  }

  getFileChargeValue() {
    return this.fileCharge;
  }

  setFileCharge(value: any) {
    if (this.chargeApplied) {
      return;
    }

    this.fileCharge = String(value ?? '');
  }

  setFileChargeAmount(amount: number) {
    this.setFileCharge(amount);
  }

  isFileChargeAmount(amount: number) {
    return this.getFileChargeValue() === String(amount);
  }

  setFileChargeStatus(status: FileChargeStatus) {
    if (this.chargeApplied) {
      return;
    }

    this.fileChargeStatus = status;
  }

  isFileChargeStatus(status: FileChargeStatus) {
    return this.fileChargeStatus === status;
  }

  setFileChargePaymentType(type: FileChargePaymentType) {
    if (this.chargeApplied) {
      return;
    }

    this.fileChargePaymentType = type;
  }

  isFileChargePaymentType(type: FileChargePaymentType) {
    return this.fileChargePaymentType === type;
  }

  isChargeSubmitDisabled() {
    return this.chargeSaving || this.chargeApplied;
  }

  getPatientTypeTagLabel() {
    return this.isNewPatient() ? 'New Patient' : 'Old Patient';
  }

  getPatientTypeTagClass() {
    return this.isNewPatient() ? 'new' : 'old';
  }

  private isNewPatient() {
    const value = this.patient?.isNewPatient;

    if (typeof value === 'boolean') {
      return value;
    }

    const normalizedValue = String(value ?? '').trim().toLowerCase();

    return normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'yes' || normalizedValue === 'new';
  }

  private getDefaultFileCharge() {
    return this.isNewPatient() ? 500 : 300;
  }

  private initializeChargeFlow() {
    if (this.chargeInitialized) {
      return;
    }

    const fileCharge = this.patient?.charge?.fileCharge || {};
    const chargeValue = Number(fileCharge?.charge);
    const hasChargeValue =
      fileCharge?.charge !== null &&
      fileCharge?.charge !== undefined &&
      fileCharge?.charge !== '' &&
      Number.isFinite(chargeValue) &&
      chargeValue > 0;

    this.chargeApplied = this.isPaidValue(fileCharge?.status);
    this.fileCharge = String(hasChargeValue ? chargeValue : this.getDefaultFileCharge());
    this.fileChargeStatus = this.chargeApplied ? 'paid' : 'unpaid';
    this.fileChargePaymentType = this.isOnlinePaymentType(fileCharge?.type) ? 'online' : 'cash';
    this.chargeInitialized = true;
  }

  private isPaidValue(value: any) {
    if (typeof value === 'boolean') {
      return value;
    }

    const normalizedValue = String(value ?? '').trim().toLowerCase();

    return normalizedValue === 'paid' || normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'yes';
  }

  private isOnlinePaymentType(value: any) {
    const normalizedValue = String(value ?? '').trim().toLowerCase();

    return normalizedValue === 'online' || normalizedValue === 'upi' || normalizedValue === 'card' || normalizedValue === 'net banking';
  }

  private getChargePayload() {
    const chargeValue = Number(this.fileCharge);

    return {
      patientId: this.patient?.patientId,
      cdId: this.getLatestVisit()?.cdId ?? this.patient?.cdId,
      visitId: this.getLatestVisit()?.visitId,
      charge: {
        fileCharge: {
          charge: Number.isFinite(chargeValue) ? chargeValue : 0,
          type: this.fileChargePaymentType,
          status: this.fileChargeStatus,
        },
      },
    };
  }

  getPatientStatus() {
    if (this.patient?.status) {
      return this.toTitleStatus(this.patient.status);
    }
    const latestVisitStatus = this.getLatestVisit()?.status;

    if (latestVisitStatus) {
      return this.toTitleStatus(latestVisitStatus);
    }

    return 'Waiting';
  }

  getStatusClass() {
    return this.getPatientStatus().toLowerCase().replace(/\s+/g, '-');
  }

  getVisitStatus(visit: any) {
    return this.toTitleStatus(visit?.status || this.getPatientStatus());
  }

  getVisitStatusClass(visit: any) {
    return this.getVisitStatus(visit).toLowerCase().replace(/\s+/g, '-');
  }

  getVisitPriority(visit: any) {
    const priority = String(visit?.priority || this.getVisitValue('priority') || 'Normal').trim().toLowerCase();

    if (priority === 'critical') {
      return 'Critical';
    }

    if (priority === 'urgent') {
      return 'Urgent';
    }

    return 'Normal';
  }

  getVisitPriorityClass(visit: any) {
    return this.getVisitPriority(visit).toLowerCase();
  }

  getFormattedDate(value: any) {
    const dateKey = this.getDateKey(value);

    if (!dateKey) {
      return this.getDisplayValue(value);
    }

    const [year, month, day] = dateKey.split('-');
    return `${day}/${month}/${year}`;
  }

  getFormattedTime(value: any) {
    if (!value) {
      return 'N/A';
    }

    const rawValue = String(value).trim();

    if (/^\d{2}:\d{2}/.test(rawValue)) {
      const date = new Date(`2000-01-01T${rawValue}`);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      return rawValue.slice(0, 5);
    }

    const date = new Date(rawValue);

    if (Number.isNaN(date.getTime())) {
      return rawValue;
    }

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
    const latestVisit = this.getLatestVisit();
    const admittedValue =
      this.patient?.idAdmitted ??
      latestVisit?.idAdmitted ??
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
      !!latestVisit?.admissionDate ||
      !!this.patient?.admission?.admissionDate
    );
  }

  isVisitAdmitted(visit: any) {
    const admittedValue = visit?.idAdmitted ?? visit?.isAdmitted ?? visit?.admitted ?? visit?.is_admitted;

    if (typeof admittedValue === 'boolean') {
      return admittedValue;
    }

    const normalizedValue = String(admittedValue ?? '').trim().toLowerCase();

    return (
      normalizedValue === 'true' ||
      normalizedValue === '1' ||
      normalizedValue === 'yes' ||
      normalizedValue === 'admitted' ||
      !!visit?.admissionDate
    );
  }

  isVisitDischarged(visit: any) {
    const dischargedValue = visit?.idDischarge ?? visit?.isDischarged ?? visit?.discharged ?? visit?.is_discharged;

    if (typeof dischargedValue === 'boolean') {
      return dischargedValue;
    }

    const normalizedValue = String(dischargedValue ?? '').trim().toLowerCase();

    return (
      normalizedValue === 'true' ||
      normalizedValue === '1' ||
      normalizedValue === 'yes' ||
      normalizedValue === 'discharged' ||
      !!visit?.dischargeDate
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

  private getDateKey(value: any) {
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

  submitCharge() {
    if (!this.patient || this.isChargeSubmitDisabled()) {
      return;
    }

    const payload = this.getChargePayload();

    console.log('Payload:', payload);
    this.chargeSaving = true;
    this.statusErrorMessage = '';

    this.patientListService.setPaymentStatus(payload).subscribe({
      next: (res) => {
        this.chargeSaving = false;
        this.chargeApplied = true;
        this.fileChargeStatus = 'paid';
        const savedPayload = this.getChargePayload();
        this.patient = {
          ...this.patient,
          charge: savedPayload.charge,
        };
        console.log('Payment status response:', res);
      },
      error: (err) => {
        this.chargeSaving = false;
        this.statusErrorMessage = err?.error?.message || 'Payment status set karvama error aavyo.';
        console.error('Error setting payment status', err);
      },
    });
  }

}
