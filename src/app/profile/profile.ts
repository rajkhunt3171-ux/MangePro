import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedService } from '../shared/service/shared-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  constructor(public sharedService: SharedService) {}
}
