import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
      id: 1,
      name: 'Admin Management',
      url: '/admin',
      icon: 'fas fa-user-cog'
    },
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
  ]
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/' },
    { label: 'Profile', icon: 'person', route: '/profile' },
    { label: 'Messages', icon: 'chat', route: '/messages' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
    { label: 'Support', icon: 'support', route: '/support' }
  ];
}
