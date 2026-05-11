import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService } from './doctor.service';

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor.html',
  styleUrls: ['./doctor.scss'],
})
export class Doctor implements OnInit {
  doctors = signal<any[]>([]);
  filteredDoctors: any[] = [];
  loading = signal<boolean>(false);
  showModal = false;
  editingDoctor: any = null;
  searchTerm = '';

  constructor(private doctorService: DoctorService) { }

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

  closeModal() {
    this.showModal = false;
  }
}
