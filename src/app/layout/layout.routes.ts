import { Routes } from "@angular/router";
import { Home } from "../home/home";
import { Profile } from "../profile/profile";
import { Doctor } from "../CD/doctor/doctor";


export const layOutRoutes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'doctors',
        component: Doctor
    },
    {
        path: 'profile',
        component: Profile
    }

]