import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export interface ToastOptions {
  title?: string; timeOut?: number;
  positionClass?: string; disableTimeOut?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastr = inject(ToastrService);

  success(message: string, opts?: ToastOptions): void {
    this.toastr.success(message, opts?.title ?? 'Éxito', this.cfg(opts));
  }
  error(message: string, opts?: ToastOptions): void {
    this.toastr.error(message, opts?.title ?? 'Error', this.cfg(opts));
  }
  warning(message: string, opts?: ToastOptions): void {
    this.toastr.warning(message, opts?.title ?? 'Atención', this.cfg(opts));
  }
  info(message: string, opts?: ToastOptions): void {
    this.toastr.info(message, opts?.title ?? 'Info', this.cfg(opts));
  }
  apiError(err: any): void {
    const msg   = err?.error?.message ?? err?.message ?? 'Error inesperado';
    const title = err?.error?.header  ?? 'Error';
    this.toastr.error(msg, title, this.cfg());
  }
  clear(): void { this.toastr.clear(); }

  private cfg(opts?: ToastOptions): any {
    return {
      timeOut:        opts?.timeOut        ?? 4000,
      positionClass:  opts?.positionClass  ?? 'toast-top-right',
      disableTimeOut: opts?.disableTimeOut ?? false,
      progressBar: true, closeButton: true, enableHtml: false,
    };
  }
}
