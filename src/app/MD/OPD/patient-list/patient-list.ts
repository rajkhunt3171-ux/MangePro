import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-patient-list',
  imports: [RouterLink],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss',
})
export class PatientList {}
