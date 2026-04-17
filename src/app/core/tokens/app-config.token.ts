import { InjectionToken } from '@angular/core';
import { Environment } from '../../../environments/environment.interface';

export const APP_CONFIG = new InjectionToken<Environment>('APP_CONFIG');
