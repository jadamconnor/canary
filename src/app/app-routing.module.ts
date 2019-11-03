import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticateComponent } from './authentication/authenticate.component';
import { JournalComponent } from './journal/journal.component';
import { AuthenticateGuard } from './authentication/authenticate.guard';


const routes: Routes = [
	{ path: 'journal', canActivate: [AuthenticateGuard], component: JournalComponent },
	{ path: 'authenticate', component: AuthenticateComponent },
	{ path: '',   redirectTo: '/journal', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
