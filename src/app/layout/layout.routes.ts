import { Routes } from "@angular/router";
import { Home } from "../home/home";
import { Profile } from "../profile/profile";
import { Doctor } from "../CD/doctor/doctor";
import { Chat } from "../chat/chat";
import { PatientList } from "../MD/OPD/patient-list/patient-list";

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
        component: PatientList
    },
    {
        path: 'profile',
        component: Profile
    }
];
