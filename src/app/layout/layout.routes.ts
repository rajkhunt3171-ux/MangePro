import { Routes } from "@angular/router";
import { Home } from "../home/home";
import { Profile } from "../profile/profile";
import { Doctor } from "../CD/doctor/doctor";
import { Chat } from "../chat/chat";


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
        path: 'profile',
        component: Profile
    }
];
