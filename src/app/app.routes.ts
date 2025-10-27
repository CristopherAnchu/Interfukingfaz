//Importaciones de librerias de Angular
import { Routes } from '@angular/router';

//Importaciones de los componentes
import { LoginComponent } from './componentes/login/login.component';
import { AdminComponent } from './componentes/admin/admin.component';
import { HomeComponent } from './componentes/home/home.component';
import { FeedComponent } from './componentes/feed/feed.component';
import { ProfileComponent } from './componentes/profile/profile.component';

//Importaciones de los guards
import { adminGuard } from './guards/admin.guard';
import { loginGuard } from './guards/login.guard';


export const routes: Routes = [
    {path: "", redirectTo: "login", pathMatch: "full"},
    {path: "login", component: LoginComponent},
    {path: "admin", component: AdminComponent, canActivate:[loginGuard, adminGuard]},
    {path: "feed", component: FeedComponent, canActivate:[loginGuard]},
    {path: "profile", component: ProfileComponent, canActivate:[loginGuard]},
    {path: "home", component: HomeComponent, canActivate:[loginGuard]},
    {path: "**", redirectTo: "login"},
];
