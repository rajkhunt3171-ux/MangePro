import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-view-patient-modal',
  templateUrl: './view-patient-modal.html',
  styleUrl: './view-patient-modal.scss',
})
export class ViewPatientModal {
  @Input() patient: any;

  constructor(public activeModal: NgbActiveModal) { }
}
