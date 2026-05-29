import { Component } from '@angular/core';
import { Header } from '../shared/component/header/header';
import { SideBar } from '../shared/component/side-bar/side-bar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [Header, SideBar, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
