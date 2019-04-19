import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class GuardService implements CanActivate {
    constructor(private authService: AuthService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authService.authenticated();
    }
}
