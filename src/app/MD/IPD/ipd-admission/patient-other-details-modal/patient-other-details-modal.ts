import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface DetailSection {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  tone: 'blue' | 'red' | 'green' | 'amber';
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

  ngOnInit() {
    console.log(this.patient)
  }

  get sections(): DetailSection[] {
    return [
      {
        key: 'laboratory',
        title: 'Laboratory',
        subtitle: 'Lab tests, reports and investigation notes',
        icon: 'fa-solid fa-flask-vial',
        tone: 'blue',
        route: '/laboratory-pathology',
      },
      {
        key: 'blood-bank',
        title: 'Blood Bank',
        subtitle: 'Blood group, request and transfusion details',
        icon: 'fa-solid fa-droplet',
        tone: 'red',
        route: '/blood-bank',
      },
      {
        key: 'medicine',
        title: 'Medicine',
        subtitle: 'Medication, prescription and pharmacy details',
        icon: 'fa-solid fa-pills',
        tone: 'green',
        route: '/pharmacy',
      },
      {
        key: 'billing',
        title: 'Billing',
        subtitle: 'Bill amount, payment and invoice details',
        icon: 'fa-solid fa-file-invoice-dollar',
        tone: 'amber',
        route: this.getBillingRoute(),
      },
    ];
  }

  getBillingRoute() {
    const patientId = this.patient?.patientId;
    return patientId ? `/billing?patientId=${encodeURIComponent(String(patientId))}` : '/billing';
  }

  getPatientMeta() {
    return [
      this.patient?.patientId,
      this.patient?.age ? `${this.patient.age} yrs` : '',
      this.patient?.gender,
    ].filter(Boolean).join(' / ') || 'N/A';
  }

  goToSection(section: DetailSection) {
    this.modalService.dismissAll();
    this.router.navigateByUrl(section.route);
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
}
