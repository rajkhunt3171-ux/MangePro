import { Routes } from "@angular/router";
import { Home } from "../home/home";
import { Profile } from "../profile/profile";
import { Doctor } from "../CD/doctor/doctor";
import { Chat } from "../chat/chat";
import { PatientList } from "../MD/OPD/patient-list/patient-list";
import { CreatePatient } from "../MD/OPD/create-patient/create-patient";

export const layOutRoutes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'chat',
        component: Chat
    },
    {
        path: 'doctors',
        component: Doctor
    },
    {
        path: 'opd',
        children: [
            {
                path: '',
                component: PatientList
            },
            {
                path: 'create-patient',
                component: CreatePatient
            }
        ]
    },
    {
        path: 'profile',
        component: Profile
    }
];
