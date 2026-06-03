import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../shared/service/shared-service';
import { DoctorCalendarService } from './doctor-calendar-service';
import { Headers } from '../../../shared/component/header/headers';

type LeaveType = 'full_day' | 'half_day' | 'emergency' | 'weekly_off';

interface DoctorLeave {
  leave_id: string | number;
  leave_type: LeaveType;
  from_date: string;
  to_date: string;
  from_time: string | null;
  to_time: string | null;
  reason: string;
  is_available: boolean;
  created_at: string;
}

@Component({
  selector: 'app-doctor-calendar',
  imports: [FormsModule],
  templateUrl: './doctor-calendar.html',
  styleUrl: './doctor-calendar.scss',
})
export class DoctorCalendar implements OnInit {
  leaves = signal<DoctorLeave[]>([]);
  leaveForm: Omit<DoctorLeave, 'leave_id' | 'created_at'> = {
    leave_type: 'full_day',
    from_date: '',
    to_date: '',
    from_time: null,
    to_time: null,
    reason: '',
    is_available: false,
  };

  errorMessage = '';
  successMessage = '';
  showLeaveList = false;
  loadingLeaves = false;
  savingLeave = false;
  deletingLeaveId: string | number | null = null;

  leaveTypes: { label: string; value: LeaveType }[] = [
    { label: 'Full Day', value: 'full_day' },
    { label: 'Half Day', value: 'half_day' },
    { label: 'Emergency', value: 'emergency' },
    { label: 'Weekly Off', value: 'weekly_off' },
  ];

  availabilityOptions = [
    { label: 'Unavailable', value: false },
    { label: 'Available', value: true },
  ];

  constructor(
    public sharedService: SharedService,
    private doctorCalendarService: DoctorCalendarService,
    private headersService: Headers
  ) { }

  ngOnInit() {
    this.leaves.set(this.sharedService.userDetails?.leave || []);
  }

  get doctorName() {
    return String(this.sharedService.userDetails?.name || this.sharedService.userDetails?.username || 'Doctor');
  }

  get totalLeaves() {
    return this.leaves().length;
  }

  get emergencyLeaves() {
    return this.leaves().filter((leave) => leave.leave_type === 'emergency').length;
  }

  get weeklyOffLeaves() {
    return this.leaves().filter((leave) => leave.leave_type === 'weekly_off').length;
  }

  get selectedLeaveDays() {
    return this.getLeaveDays(this.leaveForm.from_date, this.leaveForm.to_date, this.leaveForm.leave_type);
  }

  get sortedLeaves() {
    return [...this.leaves()].sort((first, second) => second.created_at.localeCompare(first.created_at));
  }

  toggleLeaveList() {
    this.showLeaveList = !this.showLeaveList;
  }

  closeLeaveList() {
    this.showLeaveList = false;
  }

  private loadLeaves(showLoader = true) {
    if (showLoader) {
      this.loadingLeaves = true;
    }
    this.errorMessage = '';

    this.headersService.getDoctorDetails().subscribe({
      next: (res) => {
        this.leaves.set(res.doctor.leave || []);
        this.loadingLeaves = false;
      },
      error: (err) => {
        this.loadingLeaves = false;
        this.leaves.set([]);
        this.errorMessage = err?.error?.message || 'Leave data load thai nathi.';
        console.error('Error loading leaves', err);
      },
    });
  }

  saveLeave() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.leaveForm.leave_type || !this.leaveForm.from_date || !this.leaveForm.to_date) {
      this.errorMessage = 'Leave type, from date ane to date required che.';
      return;
    }

    if (this.leaveForm.from_date > this.leaveForm.to_date) {
      this.errorMessage = 'To date from date karta pahela na hoi shake.';
      return;
    }

    if (this.leaveForm.leave_type === 'half_day' && this.leaveForm.from_date !== this.leaveForm.to_date) {
      this.errorMessage = 'Half day mate from date ane to date same hovi joiye.';
      return;
    }

    if (this.hasTimeRange() && (!this.leaveForm.from_time || !this.leaveForm.to_time)) {
      this.errorMessage = 'Half day/emergency mate from time ane to time required che.';
      return;
    }

    if (this.hasTimeRange() && this.leaveForm.from_date === this.leaveForm.to_date && this.leaveForm.from_time! >= this.leaveForm.to_time!) {
      this.errorMessage = 'To time from time karta pachhi hovu joiye.';
      return;
    }

    const payload = {
      ...this.leaveForm,
      id: localStorage.getItem('id') || '',
      from_time: this.hasTimeRange() ? this.leaveForm.from_time : null,
      to_time: this.hasTimeRange() ? this.leaveForm.to_time : null,
      reason: this.leaveForm.reason.trim(),
    };

    this.savingLeave = true;

    this.doctorCalendarService.createLeave(payload).subscribe({
      next: (res) => {
        if(res.success) {
          this.savingLeave = true;
          this.resetForm();
          this.successMessage = 'Leave data save thai gayo.';
          this.loadLeaves(false);
        }else{
          this.savingLeave = true;
          this.errorMessage = res.message;
          console.error('Error saving leave', res);
        }
      },
      error: (err) => {
        this.savingLeave = false;
        this.errorMessage = err?.error?.message;
        console.error('Error saving leave', err);
      },
    });
  }

  removeLeave(leaveId: string | number) {
    this.errorMessage = '';
    this.successMessage = '';
    this.deletingLeaveId = leaveId;

    let payload = {
      id: localStorage.getItem('id') || '',
      leave_id: leaveId,
    }

    this.doctorCalendarService.deleteLeave(payload).subscribe({
      next: () => {
        this.deletingLeaveId = null;
        this.leaves.update((leaves) => leaves.filter((leave) => String(leave.leave_id) !== String(leaveId)));
        this.loadLeaves(false);
      },
      error: (err) => {
        this.deletingLeaveId = null;
        this.errorMessage = err?.error?.message || 'Please try again.';
        console.error('Error removing leave', err);
      },
    });
  }

  onLeaveTypeChange() {
    if (!this.hasTimeRange()) {
      this.leaveForm.from_time = null;
      this.leaveForm.to_time = null;
    }
  }

  hasTimeRange(leaveType = this.leaveForm.leave_type) {
    return leaveType === 'half_day' || leaveType === 'emergency';
  }

  getLeaveDateRange(leave: DoctorLeave) {
    if (leave.from_date === leave.to_date) {
      return this.formatDateForDisplay(leave.from_date);
    }

    return `${this.formatDateForDisplay(leave.from_date)} - ${this.formatDateForDisplay(leave.to_date)}`;
  }

  getLeaveTimeRange(leave: DoctorLeave) {
    if (!leave.from_time || !leave.to_time) {
      return 'Full day';
    }

    return `${leave.from_time} - ${leave.to_time}`;
  }

  getCreatedDate(leave: DoctorLeave) {
    return new Date(leave.created_at).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getLeaveDays(fromDate: string, toDate: string, leaveType = '') {
    if (!fromDate || !toDate || fromDate > toDate) {
      return 0;
    }

    if (leaveType === 'half_day') {
      return 0.5;
    }

    const start = new Date(`${fromDate}T00:00:00`);
    const end = new Date(`${toDate}T00:00:00`);
    const diffTime = end.getTime() - start.getTime();

    return Math.floor(diffTime / 86400000) + 1;
  }

  getLeaveTypeLabel(leaveType: LeaveType) {
    return this.leaveTypes.find((type) => type.value === leaveType)?.label || leaveType;
  }

  getAvailabilityLabel(isAvailable: boolean) {
    return isAvailable ? 'Available' : 'Unavailable';
  }

  private resetForm() {
    this.leaveForm = {
      leave_type: 'full_day',
      from_date: '',
      to_date: '',
      from_time: null,
      to_time: null,
      reason: '',
      is_available: false,
    };
  }

  private formatDateForDisplay(dateKey: string) {
    if (!dateKey) {
      return 'N/A';
    }

    const [year, month, day] = dateKey.split('-');
    if (!year || !month || !day) {
      return dateKey;
    }

    return `${day}/${month}/${year}`;
  }
}
