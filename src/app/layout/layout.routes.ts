import { Routes } from "@angular/router";
import { Home } from "../home/home";
import { Profile } from "../profile/profile";


export const layOutRoutes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'profile',
        component: Profile
    }

]