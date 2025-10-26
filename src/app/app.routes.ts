//Importaciones de librerias de Angular
import { Routes } from '@angular/router';

//Importaciones de los componentes
import { LoginComponent } from './componentes/login/login.component';
import { AdminComponent } from './componentes/admin/admin.component';
import { HomeComponent } from './componentes/home/home.component';

//Importaciones de los guards
import { adminGuard } from './guards/admin.guard';
import { loginGuard } from './guards/login.guard';


export const routes: Routes = [
    {path: "", redirectTo: "login", pathMatch: "full"},
    {path: "login", component: LoginComponent},
    {path: "admin", component: AdminComponent, canActivate:[loginGuard, adminGuard]},
    {path: "home", component: HomeComponent, canActivate:[loginGuard]},
    {path: "**", redirectTo: "login"},
];
