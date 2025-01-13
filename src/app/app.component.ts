import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthSignInComponent } from './modules/auth/sign-in/sign-in.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, AuthSignInComponent],
})
export class AppComponent {
    /**
     * Constructor
     */
    constructor() {}
}
