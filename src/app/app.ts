import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SharedService } from './shared/service/shared-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(
    public sharedService: SharedService,
    public router: Router
  ) { }

  ngOnInit() {
    if (this.sharedService.isLoggedUser()) {
      this.router.navigate(['/dashboard']);
    }else{
      this.router.navigate(['/login']);
    }
  }
}
