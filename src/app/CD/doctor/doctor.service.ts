import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private baseUrl = environment.apiUrl;

  // Mock data for testing
  private mockDoctors = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      specification: 'Gynecologist',
      qualification: 'MBBS, MS - Gynecology',
      experience: 9,
      contactDetails: {
        phone: '9876543211',
        email: 'priya.sharma@gmail.com'
      },
      commission: 40,
      shiftStartTime: '10:00',
      shiftEndTime: '13:00',
      weeklyOff: ['Sunday'],
      status: 'Active',
      profileImage: ''
    },
    {
      id: '2',
      name: 'Dr. Rajesh Patel',
      specification: 'Cardiologist',
      qualification: 'MBBS, MD - Cardiology',
      experience: 12,
      contactDetails: {
        phone: '9876543212',
        email: 'rajesh.patel@gmail.com'
      },
      commission: 50,
      shiftStartTime: '09:00',
      shiftEndTime: '12:00',
      weeklyOff: ['Saturday'],
      status: 'Active',
      profileImage: ''
    },
    {
      id: '3',
      name: 'Dr. Anil Kumar',
      specification: 'Pediatrician',
      qualification: 'MBBS, MD - Pediatrics',
      experience: 7,
      contactDetails: {
        phone: '9876543213',
        email: 'anil.kumar@gmail.com'
      },
      commission: 35,
      shiftStartTime: '14:00',
      shiftEndTime: '17:00',
      weeklyOff: ['Sunday'],
      status: 'Active',
      profileImage: ''
    },
    {
      id: '4',
      name: 'Dr. Meera Singh',
      specification: 'Dermatologist',
      qualification: 'MBBS, MD - Dermatology',
      experience: 6,
      contactDetails: {
        phone: '9876543214',
        email: 'meera.singh@gmail.com'
      },
      commission: 45,
      shiftStartTime: '11:00',
      shiftEndTime: '14:00',
      weeklyOff: ['Monday'],
      status: 'Inactive',
      profileImage: ''
    }
  ];

  constructor(private http: HttpClient) { }

  getDoctors(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/coredepart/dm/get-dm`);
  }


  getDoctorById(id: string): Observable<any> {
    const doctor = this.mockDoctors.find(d => d.id === id);
    return of(doctor);
  }

  createDoctor(data: any): Observable<any> {
    const newDoctor = {
      id: Date.now().toString(),
      ...data
    };
    this.mockDoctors.push(newDoctor);
    return of({ success: true, data: newDoctor });
  }

  updateDoctor(id: string, data: any): Observable<any> {
    const index = this.mockDoctors.findIndex(d => d.id === id);
    if (index > -1) {
      this.mockDoctors[index] = { ...this.mockDoctors[index], ...data };
    }
    return of({ success: true, data: this.mockDoctors[index] });
  }

  deleteDoctor(id: string): Observable<any> {
    this.mockDoctors = this.mockDoctors.filter(d => d.id !== id);
    return of({ success: true });
  }
}
