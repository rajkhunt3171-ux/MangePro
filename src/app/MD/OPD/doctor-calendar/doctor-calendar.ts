import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../../shared/service/shared-service';

type LeaveType = 'full_day' | 'half_day' | 'emergency' | 'weekly_off';

interface DoctorLeave {
  leave_id: number;
  leave_type: LeaveType;
  from_date: string;
  to_date: string;
  from_time: string | null;
  to_time: string | null;
  reason: string;
  note: string;
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
  private readonly storageKey = 'leave';

  leaves = signal<DoctorLeave[]>([]);
  leaveForm: Omit<DoctorLeave, 'leave_id' | 'created_at'> = {
    leave_type: 'full_day',
    from_date: '',
    to_date: '',
    from_time: null,
    to_time: null,
    reason: '',
    note: '',
    is_available: false,
  };

  errorMessage = '';
  successMessage = '';
  showLeaveList = false;

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

  constructor(public sharedService: SharedService) { }

  ngOnInit() {
    this.loadLeaves();
  }

  get doctorName() {
    return String(this.sharedService.userDetails?.name || this.sharedService.userDetails?.username || 'Doctor');
  }

  get totalLeaves() {
    return this.leaves().length;
  }

  get unavailableLeaves() {
    return this.leaves().filter((leave) => !leave.is_available).length;
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

    const allLeaves = this.getStoredLeaves();
    const leave: DoctorLeave = {
      ...this.leaveForm,
      leave_id: this.getNextLeaveId(allLeaves),
      from_time: this.hasTimeRange() ? this.leaveForm.from_time : null,
      to_time: this.hasTimeRange() ? this.leaveForm.to_time : null,
      reason: this.leaveForm.reason.trim(),
      note: this.leaveForm.note.trim(),
      created_at: new Date().toISOString(),
    };

    allLeaves.unshift(leave);
    this.saveAllLeaves(allLeaves);
    this.leaves.set(allLeaves);
    this.resetForm();
    this.successMessage = 'Leave data save thai gayo.';
  }

  removeLeave(leaveId: number) {
    const allLeaves = this.getStoredLeaves().filter((leave) => leave.leave_id !== leaveId);
    this.saveAllLeaves(allLeaves);
    this.leaves.set(allLeaves);
  }

  toggleLeaveList() {
    this.showLeaveList = !this.showLeaveList;
  }

  closeLeaveList() {
    this.showLeaveList = false;
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

  private loadLeaves() {
    this.leaves.set(this.getStoredLeaves());
  }

  private getStoredLeaves(): DoctorLeave[] {
    const rawLeaves = localStorage.getItem(this.storageKey);

    if (!rawLeaves) {
      return [];
    }

    try {
      const parsedLeaves = JSON.parse(rawLeaves);

      if (Array.isArray(parsedLeaves)) {
        return parsedLeaves;
      }

      if (Array.isArray(parsedLeaves?.leave)) {
        return parsedLeaves.leave;
      }

      return [];
    } catch {
      return [];
    }
  }

  private saveAllLeaves(leaves: DoctorLeave[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(leaves));
  }

  private getNextLeaveId(leaves: DoctorLeave[]) {
    return leaves.reduce((maxId, leave) => Math.max(maxId, Number(leave.leave_id) || 0), 0) + 1;
  }

  private resetForm() {
    this.leaveForm = {
      leave_type: 'full_day',
      from_date: '',
      to_date: '',
      from_time: null,
      to_time: null,
      reason: '',
      note: '',
      is_available: false,
    };
  }

  private formatDateForDisplay(dateKey: string) {
    const [year, month, day] = dateKey.split('-');
    return `${day}/${month}/${year}`;
  }
}
