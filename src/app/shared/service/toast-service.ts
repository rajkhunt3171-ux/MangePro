import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastr: ToastrService) { }

  showToastr(message?: string | null, type: ToastType = 'success', title?: string) {
    const toastMessage = String(message || this.getDefaultMessage(type)).trim();

    setTimeout(() => {
      switch (type) {
        case 'error':
          this.toastr.error(toastMessage, title);
          break;
        case 'info':
          this.toastr.info(toastMessage, title);
          break;
        case 'warning':
          this.toastr.warning(toastMessage, title);
          break;
        default:
          this.toastr.success(toastMessage, title);
          break;
      }
    });
  }

  private getDefaultMessage(type: ToastType) {
    if (type === 'error') {
      return 'Something went wrong.';
    }
    if (type === 'warning') {
      return 'Please check and try again.';
    }
    if (type === 'info') {
      return 'Information updated.';
    }
    return 'Success.';
  }
}
