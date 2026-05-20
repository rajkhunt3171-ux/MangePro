import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { loginReq, loginRes } from './login.model';
import { SharedService } from '../shared/service/shared-service';
import { LoginService } from './login.service';
import { Headers } from '../shared/component/header/headers';
import { SocketService } from '../shared/service/socket-service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {

  loginReq = new loginReq();
  loginRes = new loginRes();
  selectedDepartment = '';
  selectedBranch = '';

  departments = [
    { label: 'Core Departments', value: 'core-departments' },
    { label: 'Medical Departments', value: 'medical-departments' },
    { label: 'Management Modules', value: 'management-modules' },
    { label: 'Accounts & Reports', value: 'accounts-reports' },
    { label: 'Advanced Modules', value: 'advanced-modules' },
    { label: 'Main Roles', value: 'main-roles' },
  ];

  branchOptions = {
    'core-departments': [
      { label: 'Admin Management', value: 'admin-management' },
      { label: 'Doctor Management', value: 'doctor-management' },
      { label: 'Patient Management', value: 'patient-management' },
      { label: 'Reception / Front Desk', value: 'reception-front-desk' },
      { label: 'Nurse Management', value: 'nurse-management' },
      { label: 'Staff Management', value: 'staff-management' },
    ],
    'medical-departments': [
      { label: 'OPD (Out Patient Department)', value: 'opd' },
      { label: 'IPD (In Patient Department)', value: 'ipd' },
      { label: 'Emergency / ICU', value: 'emergency-icu' },
      { label: 'Surgery Department', value: 'surgery-department' },
      { label: 'Pharmacy', value: 'pharmacy' },
      { label: 'Laboratory / Pathology', value: 'laboratory-pathology' },
      { label: 'Radiology (X-Ray, MRI, CT Scan)', value: 'radiology' },
      { label: 'Blood Bank', value: 'blood-bank' },
      { label: 'Physiotherapy', value: 'physiotherapy' },
    ],
    'management-modules': [
      { label: 'Appointment Management', value: 'appointment-management' },
      { label: 'Bed / Ward Management', value: 'bed-ward-management' },
      { label: 'Billing & Invoice', value: 'billing-invoice' },
      { label: 'Insurance Management', value: 'insurance-management' },
      { label: 'Prescription Management', value: 'prescription-management' },
      { label: 'Medical Records', value: 'medical-records' },
      { label: 'Discharge Summary', value: 'discharge-summary' },
      { label: 'Ambulance Management', value: 'ambulance-management' },
    ],
    'accounts-reports': [
      { label: 'Finance / Accounts', value: 'finance-accounts' },
      { label: 'Salary / Payroll', value: 'salary-payroll' },
      { label: 'Expense Management', value: 'expense-management' },
      { label: 'Reports & Analytics', value: 'reports-analytics' },
    ],
    'advanced-modules': [
      { label: 'Online Consultation', value: 'online-consultation' },
      { label: 'Video Calling', value: 'video-calling' },
      { label: 'Notification System', value: 'notification-system' },
      { label: 'Role & Permission Management', value: 'role-permission-management' },
      { label: 'Inventory / Stock Management', value: 'inventory-stock-management' },
      { label: 'Medicine Stock Alerts', value: 'medicine-stock-alerts' },
      { label: 'Audit Logs', value: 'audit-logs' },
    ],
    'main-roles': [
      { label: 'Super Admin', value: 'super-admin' },
      { label: 'Hospital Admin', value: 'hospital-admin' },
      { label: 'Doctor', value: 'doctor' },
      { label: 'Nurse', value: 'nurse' },
      { label: 'Receptionist', value: 'receptionist' },
      { label: 'Lab Technician', value: 'lab-technician' },
      { label: 'Pharmacist', value: 'pharmacist' },
      { label: 'Accountant', value: 'accountant' },
      { label: 'Patient', value: 'patient' },
    ],
  };

  get branches() {
    return this.branchOptions[this.selectedDepartment] || [];
  }

  constructor(
    public sharedService: SharedService,
    private loginService: LoginService,
    private router: Router,
    private headersService: Headers,
    private socketService: SocketService
  ) { }

  ngOnInit() {
  }

  onDepartmentChange(department: string) {
    this.selectedDepartment = department;
    this.selectedBranch = '';
  }

  login() {
    this.loginService.login(this.loginReq).subscribe({
      next: (res) => {
        localStorage.setItem('authToken', res.token);
        this.loadUserDetails();
      },
      error: (error) => {
        console.error('Login error', error);
      }
    });
  }

  loadUserDetails() {
    this.headersService.getUserDetails().subscribe({
      next: (res) => {
        this.sharedService.userDetails = res.user;
        this.sharedService.userDepartment = res.department;
        localStorage.setItem('id', res.user.id);
        this.socketService.connect(res.user.id);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error fetching user details', error);
        localStorage.removeItem('authToken');
      }
    });
  }
}
