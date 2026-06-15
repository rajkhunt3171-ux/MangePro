import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { createPatientReq } from './create-patient.model';
import { CreatePatientService } from './create-patient-service';

@Component({
  selector: 'app-create-patient',
  imports: [FormsModule],
  templateUrl: './create-patient.html',
  styleUrl: './create-patient.scss',
})
export class CreatePatient implements OnInit {
  createPatientReq = new createPatientReq();

  doctors = signal<any[]>([]);

  selectedDoctor: any;
  saving = false;
  errorMessage = '';

  constructor(
    public activeModal: NgbActiveModal,
    private createPatientService: CreatePatientService,
  ) { }

  ngOnInit() {
  }

  closeModal() {
    this.activeModal.dismiss();
  }

  savePatient() {
    const payload = {
      ...this.createPatientReq,
      isNewPatient: Boolean(this.createPatientReq.isNewPatient),
      age: this.createPatientReq.age === null ? null : Number(this.createPatientReq.age),
    };

    this.saving = true;
    this.errorMessage = '';

    this.createPatientService.createPatient(payload).subscribe({
      next: (res) => {
        const savedPatient = res?.patient || res?.data || payload;

        this.saving = false;
        this.activeModal.close(savedPatient);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err;
      },
    });
  }
}
