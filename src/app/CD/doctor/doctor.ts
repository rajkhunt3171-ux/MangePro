import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DoctorService } from './doctor.service';
import { AddDocotor } from '../add-docotor/add-docotor';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './doctor.html',
  styleUrls: ['./doctor.scss'],
})
export class Doctor implements OnInit {
  doctors = signal<any[]>([]);
  filteredDoctors: any[] = [];
  loading = signal<boolean>(false);
  editingDoctor: any = null;
  searchTerm = '';

  constructor(
    private doctorService: DoctorService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.loadDoctors();
  }

  loadDoctors() {
    this.loading.set(true);
    this.doctorService.getDoctors().subscribe({
      next: (res) => {
        this.loading.set(false);
        this.doctors.set(res.doctorList || []);
      },
      error: (err) => {
        console.error('Error loading doctors', err);
        this.loading.set(false);
      }
    });
  }

  openAddDoctor() {
    this.editingDoctor = null;
    const modalRef = this.modalService.open(AddDocotor, {
      backdrop: 'static',
      scrollable: true,
      size: 'xl'
    });

    modalRef.componentInstance.doctor = this.editingDoctor;
    modalRef.result.then((doctor) => this.addDoctorToList(doctor)).catch(() => { });
  }

  addDoctorToList(doctor: any) {
    this.doctors.update((doctors) => [
      doctor,
      ...doctors
    ]);
  }
}
