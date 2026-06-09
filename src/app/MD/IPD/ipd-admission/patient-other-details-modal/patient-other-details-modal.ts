import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface DetailField {
  label: string;
  value: string;
}

interface DetailRecord {
  title: string;
  fields: DetailField[];
}

interface DetailSection {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  tone: 'blue' | 'red' | 'green' | 'amber';
  summaryFields: DetailField[];
  records: DetailRecord[];
  route: string;
}

@Component({
  selector: 'app-patient-other-details-modal',
  imports: [],
  templateUrl: './patient-other-details-modal.html',
  styleUrl: './patient-other-details-modal.scss',
})
export class PatientOtherDetailsModal {
  @Input() patient: any;

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private router: Router,
  ) { }

  get sections(): DetailSection[] {
    return [
      {
        key: 'laboratory',
        title: 'Laboratory',
        subtitle: 'Lab tests, reports and investigation notes',
        icon: 'fa-solid fa-flask-vial',
        tone: 'blue',
        summaryFields: this.getLaboratorySummary(),
        records: this.getLaboratoryRecords(),
        route: '/laboratory-pathology',
      },
      {
        key: 'blood-bank',
        title: 'Blood Bank',
        subtitle: 'Blood group, request and transfusion details',
        icon: 'fa-solid fa-droplet',
        tone: 'red',
        summaryFields: this.getBloodBankSummary(),
        records: this.getBloodBankRecords(),
        route: '/blood-bank',
      },
      {
        key: 'medicine',
        title: 'Medicine',
        subtitle: 'Medication, prescription and pharmacy details',
        icon: 'fa-solid fa-pills',
        tone: 'green',
        summaryFields: this.getMedicineSummary(),
        records: this.getMedicineRecords(),
        route: '/pharmacy',
      },
      {
        key: 'billing',
        title: 'Billing',
        subtitle: 'Bill amount, payment and invoice details',
        icon: 'fa-solid fa-file-invoice-dollar',
        tone: 'amber',
        summaryFields: this.getBillingSummary(),
        records: this.getBillingRecords(),
        route: '/billing',
      },
    ];
  }

  goToSection(section: DetailSection) {
    this.modalService.dismissAll();
    this.router.navigateByUrl(section.route);
  }

  hasSectionData(section: DetailSection) {
    return section.summaryFields.length > 0 || section.records.length > 0;
  }

  getPatientInitials() {
    const initials = String(this.patient?.name || '')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return initials || 'NA';
  }

  getPatientName() {
    return this.patient?.name || 'N/A';
  }

  getPatientMeta() {
    return [
      this.patient?.patientId,
      this.patient?.age ? `${this.patient.age} yrs` : '',
      this.patient?.gender,
    ].filter(Boolean).join(' / ') || 'N/A';
  }

  getBedLabel() {
    return (
      this.patient?.bedName ||
      this.patient?.bedId ||
      this.patient?.admission?.bedName ||
      this.patient?.admission?.bedId ||
      'Not allocated'
    );
  }

  private getLaboratorySummary() {
    const fields: DetailField[] = [];

    this.addField(fields, 'Symptoms', this.patient?.symptoms || this.patient?.admission?.symptoms);
    this.addField(fields, 'Investigation', this.pick('investigation', 'investigationNotes', 'labInvestigation', 'admission.investigation'));
    this.addField(fields, 'Lab Status', this.pick('labStatus', 'laboratoryStatus', 'reportStatus', 'admission.labStatus'));
    this.addField(fields, 'Report Date', this.pick('labReportDate', 'reportDate', 'testDate', 'admission.labReportDate'));

    return fields;
  }

  private getBloodBankSummary() {
    const fields: DetailField[] = [];

    this.addField(fields, 'Blood Group', this.patient?.bloodGroup || this.patient?.admission?.bloodGroup);
    this.addField(fields, 'Requirement', this.pick('bloodRequirement', 'bloodRequired', 'bloodRequest', 'admission.bloodRequirement'));
    this.addField(fields, 'Units', this.pick('bloodUnits', 'requiredUnits', 'issuedUnits', 'admission.bloodUnits'));
    this.addField(fields, 'Status', this.pick('bloodStatus', 'bloodBankStatus', 'transfusionStatus', 'admission.bloodStatus'));

    return fields;
  }

  private getMedicineSummary() {
    const fields: DetailField[] = [];

    this.addField(fields, 'Current Medication', this.patient?.currentMedication || this.patient?.admission?.currentMedication);
    this.addField(fields, 'Allergies', this.patient?.allergies || this.patient?.admission?.allergies);
    this.addField(fields, 'Prescription', this.pick('prescription', 'prescriptionNote', 'doctorPrescription', 'admission.prescription'));
    this.addField(fields, 'Pharmacy Status', this.pick('medicineStatus', 'pharmacyStatus', 'admission.medicineStatus'));

    return fields;
  }

  private getBillingSummary() {
    const fields: DetailField[] = [];

    this.addField(fields, 'Bill No.', this.pick('billNo', 'billNumber', 'invoiceNo', 'invoiceNumber', 'admission.billNo'));
    this.addField(fields, 'Total Amount', this.pick('totalAmount', 'billAmount', 'billing.totalAmount', 'billing.billAmount', 'admission.totalAmount'));
    this.addField(fields, 'Paid Amount', this.pick('paidAmount', 'amountPaid', 'billing.paidAmount', 'billing.amountPaid', 'admission.paidAmount'));
    this.addField(fields, 'Due Amount', this.pick('dueAmount', 'balanceAmount', 'billing.dueAmount', 'billing.balanceAmount', 'admission.dueAmount'));
    this.addField(fields, 'Payment Status', this.pick('paymentStatus', 'billingStatus', 'billStatus', 'billing.paymentStatus', 'admission.paymentStatus'));

    return fields;
  }

  private getLaboratoryRecords() {
    return this.collectRecords([
      this.patient?.laboratory,
      this.patient?.laboratoryDetails,
      this.patient?.labDetails,
      this.patient?.labReports,
      this.patient?.labTests,
      this.patient?.tests,
      this.patient?.investigations,
      this.patient?.pathology,
      this.patient?.reports,
      this.patient?.admission?.laboratory,
      this.patient?.admission?.labReports,
      this.patient?.admission?.labTests,
    ], 'Lab Detail');
  }

  private getBloodBankRecords() {
    return this.collectRecords([
      this.patient?.bloodBank,
      this.patient?.bloodBankDetails,
      this.patient?.bloodRequest,
      this.patient?.bloodRequests,
      this.patient?.bloodTransfusion,
      this.patient?.transfusions,
      this.patient?.admission?.bloodBank,
      this.patient?.admission?.bloodRequest,
      this.patient?.admission?.transfusions,
    ], 'Blood Detail');
  }

  private getMedicineRecords() {
    return this.collectRecords([
      this.patient?.medicine,
      this.patient?.medicines,
      this.patient?.medication,
      this.patient?.medications,
      this.patient?.prescriptions,
      this.patient?.pharmacy,
      this.patient?.admission?.medicine,
      this.patient?.admission?.medicines,
      this.patient?.admission?.prescriptions,
    ], 'Medicine Detail');
  }

  private getBillingRecords() {
    return this.collectRecords([
      this.patient?.billing,
      this.patient?.bill,
      this.patient?.bills,
      this.patient?.invoice,
      this.patient?.invoices,
      this.patient?.payments,
      this.patient?.paymentDetails,
      this.patient?.charges,
      this.patient?.billingDetails,
      this.patient?.admission?.billing,
      this.patient?.admission?.bill,
      this.patient?.admission?.payments,
      this.patient?.admission?.charges,
    ], 'Billing Detail');
  }

  private collectRecords(sources: any[], fallbackTitle: string) {
    const records: DetailRecord[] = [];

    sources.forEach((source) => {
      if (this.isEmptyValue(source)) {
        return;
      }

      const sourceRecords = Array.isArray(source) ? source : [source];

      sourceRecords.forEach((record) => {
        if (!record || typeof record !== 'object' || Array.isArray(record)) {
          return;
        }

        const fields = Object.entries(record)
          .filter(([key, value]) => !this.isTitleKey(key) && !this.isEmptyValue(value))
          .map(([key, value]) => ({
            label: this.formatLabel(key),
            value: this.formatValue(value),
          }))
          .filter((field) => field.value);

        records.push({
          title: this.getRecordTitle(record, fallbackTitle, records.length + 1),
          fields,
        });
      });
    });

    return records.filter((record) => record.fields.length);
  }

  private getRecordTitle(record: any, fallbackTitle: string, index: number) {
    return (
      record?.testName ||
      record?.reportName ||
      record?.medicineName ||
      record?.drugName ||
      record?.itemName ||
      record?.name ||
      record?.title ||
      record?.requestId ||
      record?.reportId ||
      record?.billNo ||
      record?.billNumber ||
      record?.invoiceNo ||
      record?.invoiceNumber ||
      record?.paymentId ||
      `${fallbackTitle} ${index}`
    );
  }

  private addField(fields: DetailField[], label: string, value: any) {
    if (this.isEmptyValue(value)) {
      return;
    }

    fields.push({
      label,
      value: this.formatValue(value),
    });
  }

  private pick(...paths: string[]) {
    for (const path of paths) {
      const value = this.getPathValue(this.patient, path);

      if (!this.isEmptyValue(value)) {
        return value;
      }
    }

    return '';
  }

  private getPathValue(source: any, path: string) {
    return path.split('.').reduce((value, key) => value?.[key], source);
  }

  private formatLabel(value: string) {
    return value
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private formatValue(value: any): string {
    if (this.isEmptyValue(value)) {
      return '';
    }

    if (Array.isArray(value)) {
      if (!value.length) {
        return '';
      }

      if (value.every((item) => typeof item !== 'object')) {
        return value.join(', ');
      }

      return `${value.length} record${value.length === 1 ? '' : 's'}`;
    }

    if (typeof value === 'object') {
      return value?.name || value?.title || value?.label || value?.id || value?._id || JSON.stringify(value);
    }

    return String(value);
  }

  private isTitleKey(key: string) {
    return [
      'name',
      'title',
      'testName',
      'reportName',
      'medicineName',
      'drugName',
      'itemName',
      'billNo',
      'billNumber',
      'invoiceNo',
      'invoiceNumber',
      'paymentId',
    ].includes(key);
  }

  private isEmptyValue(value: any) {
    return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
  }
}
