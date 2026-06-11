import { Routes } from '@angular/router';
import { Home } from '../home/home';
import { Profile } from '../profile/profile';
import { Doctor } from '../CD/doctor/doctor';
import { Chat } from '../chat/chat';
import { PatientList } from '../MD/OPD/patient-list/patient-list';
import { PatientListForDoctor } from '../MD/OPD/patient-list-for-doctor/patient-list-for-doctor';
import { DoctorCalendar } from '../MD/OPD/doctor-calendar/doctor-calendar';
import { IpdAdmission } from '../MD/IPD/ipd-admission/ipd-admission';
import { IpdManagement } from '../MD/IPD/ipd-management/ipd-management';
import { WardManagement } from '../MD/IPD/ward-management/ward-management';
import { AppointmentManage } from '../MM/appointment-manage/appointment-manage';
import { AppointmentRequest } from '../MM/appointment-request/appointment-request';
import { BillingInvoice } from '../MM/billing-invoice/billing-invoice';

export const layOutRoutes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'chat',
    component: Chat,
  },
  {
    path: 'doctors',
    component: Doctor,
  },
  {
    path: 'opd',
    children: [
      {
        path: '',
        component: PatientList,
      },
    ],
  },
  {
    path: 'patient-list-for-doctor',
    component: PatientListForDoctor,
  },
  {
    path: 'calendar',
    component: DoctorCalendar,
  },
  {
    path: 'profile',
    component: Profile,
  },
  {
    path: 'ipd',
    children: [
      {
        path: '',
        component: IpdManagement,
      },
      {
        path: 'admission',
        component: IpdAdmission,
      },
      {
        path: 'patients',
        redirectTo: 'admission',
        pathMatch: 'full',
      },
      {
        path: 'beds',
        component: WardManagement,
      }
    ],
  },
  {
    path: 'appointment-manage',
    component: AppointmentManage,
  },
  {
    path: 'appointment-req',
    component: AppointmentRequest,
  },
  {
    path: 'billing',
    component: BillingInvoice
  }
];
