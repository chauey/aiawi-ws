import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
// NxWelcome removed - using custom layout now

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'aiawi-ws';
}
