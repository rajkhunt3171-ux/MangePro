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
    this.doctorList();
  }

  doctorList() {
    this.createPatientService.getDoctors().subscribe({
      next: (res) => {
        this.doctors.set(res?.doctorList || []);
        this.setDepartmentFromDoctor(this.createPatientReq.cdId);
      },
      error: (err) => {
        console.error('Error loading doctors', err);
        this.doctors.set([]);
      },
    });
  }

  closeModal() {
    this.activeModal.dismiss();
  }

  savePatient() {
    const payload = {
      ...this.createPatientReq,
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

  setDepartmentFromDoctor(doctorId: string) {
    this.selectedDoctor = this.doctors().find(
      (doctor) => String(this.getDoctorId(doctor)) === String(doctorId),
    );
    this.createPatientReq.department = this.selectedDoctor?.specification || '';
  }

  getDoctorId(doctor: any) {
    return doctor?.cdId || doctor?.id || doctor?._id || '';
  }
}
