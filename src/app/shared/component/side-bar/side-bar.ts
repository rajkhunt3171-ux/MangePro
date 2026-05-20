import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedService } from '../../service/shared-service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar {

  coreDepartment = [
    {
      id: 2,
      name: 'Doctor Management',
      url: '/doctors',
      icon: 'fas fa-user-md'
    },
    {
      id: 3,
      name: 'Patient Management',
      url: '/patients',
      icon: 'fas fa-hospital-user'
    },
    {
      id: 4,
      name: 'Reception / Front Desk',
      url: '/reception',
      icon: 'fas fa-concierge-bell'
    },
    {
      id: 5,
      name: 'Nurse Management',
      url: '/nurses',
      icon: 'fas fa-user-nurse'
    },
    {
      id: 6,
      name: 'Staff Management',
      url: '/staff',
      icon: 'fas fa-users'
    }
  ];

  medicalDepartment = [
    {
      id: 1,
      name: 'OPD (Out Patient Department)',
      url: '/opd',
      icon: 'fas fa-user-injured'
    },
    {
      id: 2,
      name: 'IPD (In Patient Department)',
      url: '/ipd',
      icon: 'fas fa-procedures'
    },
    {
      id: 3,
      name: 'Emergency / ICU',
      url: '/emergency-icu',
      icon: 'fas fa-ambulance'
    },
    {
      id: 4,
      name: 'Surgery Department',
      url: '/surgery-department',
      icon: 'fas fa-user-md'
    },
    {
      id: 5,
      name: 'Pharmacy',
      url: '/pharmacy',
      icon: 'fas fa-pills'
    },
    {
      id: 6,
      name: 'Laboratory / Pathology',
      url: '/laboratory-pathology',
      icon: 'fas fa-flask'
    },
    {
      id: 7,
      name: 'Radiology (X-Ray, MRI, CT Scan)',
      url: '/radiology',
      icon: 'fas fa-x-ray'
    },
    {
      id: 8,
      name: 'Blood Bank',
      url: '/blood-bank',
      icon: 'fas fa-tint'
    },
    {
      id: 9,
      name: 'Physiotherapy',
      url: '/physiotherapy',
      icon: 'fas fa-walking'
    }
  ];

  constructor(
    public sharedService: SharedService
  ) { }

  ngOnInit() {
  }
}
