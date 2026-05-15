import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AddDocotorService } from './add-docotor-service';

const DEFAULT_DOCTOR = {
  id: 'DR1001',
  name: 'Dr. Rajesh Patel',
  specification: 'Cardiologist',
  qualification: 'MBBS, MD - Cardiology',
  experience: 15,
  contactDetails: {
    phone: '9876543210',
    email: 'rajesh.patel@gmail.com',
    address: 'Ahmedabad, Gujarat'
  },
  commission: 35,
  type: 1,
  shiftStartTime: '09:00',
  shiftEndTime: '18:00',
  weeklyOff: ['Sunday', 'Wednesday'],
  photo: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  photoContentType: 'image/png',
  status: 'Active'
};

@Component({
  selector: 'app-add-docotor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './add-docotor.html',
  styleUrl: './add-docotor.scss',
})
export class AddDocotor {
  weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  formData: any = this.cloneDoctor(DEFAULT_DOCTOR);
  saving = false;
  errorMessage = '';

  constructor(
    public activeModal: NgbActiveModal,
    private addDocotorService: AddDocotorService
  ) { }

  @Input() set doctor(value: any) {
    this.formData = this.cloneDoctor(value || DEFAULT_DOCTOR);
  }

  get photoPreview() {
    if (!this.formData.photo) {
      return '';
    }

    return `data:${this.formData.photoContentType || 'image/png'};base64,${this.formData.photo}`;
  }

  isWeeklyOff(day: string) {
    return this.formData.weeklyOff?.includes(day);
  }

  toggleWeeklyOff(day: string, checked: boolean) {
    const weeklyOff = new Set(this.formData.weeklyOff || []);

    if (checked) {
      weeklyOff.add(day);
    } else {
      weeklyOff.delete(day);
    }

    this.formData.weeklyOff = Array.from(weeklyOff);
  }

  onPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || '');
      const [meta, base64] = result.split(',');

      this.formData.photo = base64 || '';
      this.formData.photoContentType = meta.match(/data:(.*);base64/)?.[1] || file.type;
    };

    reader.readAsDataURL(file);
  }

  submitForm() {
    const payload = {
      ...this.cloneDoctor(this.formData),
      experience: Number(this.formData.experience),
      commission: Number(this.formData.commission),
      type: Number(this.formData.type),
      status: Number(this.formData.type) === 1 ? 'Active' : 'Inactive'
    };

    this.saving = true;
    this.errorMessage = '';

    this.addDocotorService.createDoctor(payload).subscribe({
      next: (res) => {
        const savedDoctor = res?.doctor || res?.data || payload;

        this.saving = false;
        this.activeModal.close(savedDoctor);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'Doctor save karvama error aavyo.';
        console.error('Error saving doctor', err);
      }
    });
  }

  closeModal() {
    this.activeModal.dismiss();
  }

  private cloneDoctor(doctor: any) {
    return JSON.parse(JSON.stringify(doctor));
  }
}
