import { Component, Input, OnInit, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { AddBedService } from '../../add-bed/add-bed-service';
import { AddRoomService } from '../../add-room/add-room-service';
import { AddWardService } from '../../add-ward/add-ward-service';

interface Room {
  id?: number | string;
  wardId?: string | number;
  name?: string;
}

interface Ward {
  id?: number | string;
  name: string;
}

interface BedDetail {
  label: string;
  value: string | number;
}

const BED_STATUSES = ['available', 'occupied', 'reserved', 'cleaning', 'maintenance'] as const;
type BedStatus = typeof BED_STATUSES[number];
type AllocationStatus = 'occupied' | 'reserved';

interface Bed {
  id?: number | string;
  wardId?: string | number;
  roomId?: string | number;
  name?: string;
  status: BedStatus;
  statusLabel: string;
  patientId?: string | number;
}

interface VisualRoom {
  id?: number | string;
  name: string;
  wardId?: string | number;
  beds: Bed[];
}

interface VisualWard {
  id?: number | string;
  name: string;
  rooms: VisualRoom[];
}

@Component({
  selector: 'app-bed-visual-modal',
  imports: [],
  templateUrl: './bed-visual-modal.html',
})
export class BedVisualModal implements OnInit {
  @Input() patient: any;
  wards = signal<Ward[]>([]);
  rooms = signal<Room[]>([]);
  beds = signal<Bed[]>([]);
  loadingVisual = false;
  assigningBed = false;
  errorMessage = '';
  allocationErrorMessage = '';
  selectedBedKey = '';
  selectedAllocationStatus: AllocationStatus | '' = '';
  readonly bedStatuses = BED_STATUSES.map((status) => ({
    key: status,
    label: this.toTitleCase(status),
  }));

  constructor(
    public activeModal: NgbActiveModal,
    private addBedService: AddBedService,
    private addRoomService: AddRoomService,
    private addWardService: AddWardService,
  ) { }

  ngOnInit() {
    console.log('Patient data received in modal:', this.patient);
    this.loadVisualData();
  }

  loadVisualData() {
    this.loadingVisual = true;
    this.errorMessage = '';

    forkJoin({
      wardRes: this.addWardService.getWardList(),
      roomRes: this.addRoomService.getRoomList(),
      bedRes: this.addBedService.getBedList(),
    }).subscribe({
      next: ({ wardRes, roomRes, bedRes }) => {
        const wardList = wardRes?.wardList || wardRes?.wards || wardRes?.data || [];
        const roomList = roomRes?.roomList || roomRes?.rooms || roomRes?.data || [];
        const bedList = bedRes?.bedList || bedRes?.beds || bedRes?.data || [];

        this.wards.set(this.normalizeWardList(Array.isArray(wardList) ? wardList : []));
        this.rooms.set(this.normalizeRoomList(Array.isArray(roomList) ? roomList : []));
        this.beds.set(this.normalizeBedList(Array.isArray(bedList) ? bedList : []));
        this.setDefaultSelectedBed();
        this.loadingVisual = false;
      },
      error: (err) => {
        this.wards.set([]);
        this.rooms.set([]);
        this.beds.set([]);
        this.loadingVisual = false;
        this.errorMessage = err?.error?.message || 'Unable to load ward, room and bed visual data.';
      },
    });
  }

  setDefaultSelectedBed() {
    const patientBed = this.beds().find((bed) => this.isPatientBed(bed) && this.isBedSelectable(bed));

    if (patientBed) {
      this.selectedBedKey = this.getBedKey(patientBed);
    }
  }

  getBedKey(bed: Bed) {
    return `${bed.id || ''}-${bed.name || ''}-${bed.roomId || ''}`;
  }

  isPatientBed(bed: Bed) {
    const patientId = this.getPatientId();
    const patientBedIds = [
      this.patient?.bedId,
      this.patient?.admission?.bedId,
      this.patient?.assignedBedId,
      this.patient?.bed?.id,
      this.patient?.bed?._id,
      this.patient?.admission?.bed?.id,
      this.patient?.admission?.bed?._id,
      this.patient?.assignedBed?.id,
      this.patient?.assignedBed?._id,
    ].filter(Boolean);

    if (patientId && this.isSameId(patientId, bed.patientId)) {
      return true;
    }

    if (!patientBedIds.length) {
      return false;
    }

    return patientBedIds.some((bedId) => this.isSameId(bedId, bed.id));
  }

  normalizeWardList(wardList: any[]): Ward[] {
    return wardList.map((ward) => ({
      id: ward?.id || ward?._id || ward?.wardId,
      name: ward?.name || ward?.wardName || '',
    })).filter((ward) => ward.name);
  }

  normalizeRoomList(roomList: any[]): Room[] {
    return roomList.map((room) => ({
      id: room?.id || room?._id || room?.roomId,
      wardId: room?.wardId || room?.wardID || room?.ward?.id || room?.ward?._id,
      name: room?.name || room?.roomName || '',
    })).filter((room) => room.name);
  }

  normalizeBedList(bedList: any[]): Bed[] {
    return bedList.map((bed) => {
      const roomId = bed?.roomId || bed?.roomID || bed?.room?.id || bed?.room?._id;
      const wardId = bed?.wardId || bed?.wardID || bed?.ward?.id || bed?.ward?._id || this.getWardIdByRoomId(roomId);
      const assignedPatient = bed?.patient || bed?.assignedPatient || bed?.patientDetails || bed?.admittedPatient;
      const normalizedBed: Bed = {
        id: bed?.id || bed?._id || bed?.bedId,
        wardId,
        roomId,
        name: bed?.name || bed?.bedName || '',
        status: this.getBedStatus(this.getRawBedStatus(bed)),
        statusLabel: '',
        patientId: bed?.patientId || bed?.patientID || assignedPatient?.patientId || assignedPatient?.id || assignedPatient?._id,
      };

      normalizedBed.statusLabel = this.toTitleCase(normalizedBed.status);

      return normalizedBed;
    }).filter((bed) => bed.name);
  }

  getRawBedStatus(bed: any) {
    return (
      bed?.status ||
      bed?.bedStatus ||
      bed?.bed_status ||
      bed?.availabilityStatus ||
      bed?.availability_status ||
      bed?.currentStatus ||
      bed?.current_status ||
      bed?.statusName ||
      bed?.status?.name
    );
  }

  get totalWards() {
    return this.wards().length;
  }

  get totalRooms() {
    return this.rooms().length;
  }

  get totalBeds() {
    return this.beds().length;
  }

  get selectedBed() {
    return this.beds().find((bed) => this.getBedKey(bed) === this.selectedBedKey);
  }

  get visualWards(): VisualWard[] {
    return this.wards()
      .map((ward) => ({
        id: ward.id,
        name: ward.name || String(ward.id || 'Ward'),
        rooms: this.rooms()
          .filter((room) => this.isSameId(room.wardId, ward.id))
          .map((room) => ({
            id: room.id,
            name: room.name || String(room.id || 'Room'),
            wardId: room.wardId,
            beds: this.beds().filter((bed) => this.isSameId(bed.roomId, room.id)),
          })),
      }));
  }

  selectBed(bed: Bed) {
    if (!this.isBedSelectable(bed) || this.assigningBed) {
      return;
    }

    this.selectedBedKey = this.getBedKey(bed);
    this.selectedAllocationStatus = '';
    this.allocationErrorMessage = '';
  }

  isSelectedBed(bed: Bed) {
    return this.isBedSelectable(bed) && this.getBedKey(bed) === this.selectedBedKey;
  }

  isBedSelectable(bed?: Bed) {
    return bed?.status === 'available';
  }

  setAllocationStatus(status: AllocationStatus) {
    this.selectedAllocationStatus = status;
  }

  isAllocationStatusSelected(status: AllocationStatus) {
    return this.selectedAllocationStatus === status;
  }

  canAllocateSelectedBed() {
    return !!this.selectedBed && this.isBedSelectable(this.selectedBed) && !!this.selectedAllocationStatus && !this.assigningBed;
  }

  getStatusCount(status: BedStatus) {
    return this.beds().filter((bed) => bed.status === status).length;
  }

  getPatientInitials() {
    const initials = String(this.patient?.name || '')
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return initials || 'NA';
  }

  getPatientName() {
    return this.patient?.name || 'N/A';
  }

  getPatientMeta() {
    return [
      this.patient?.patientId,
      this.patient?.age ? `${this.patient.age} yrs` : '',
      this.patient?.gender,
    ].filter(Boolean).join(' / ') || 'N/A';
  }

  getPatientBedLabel() {
    return (
      this.patient?.bedName ||
      this.patient?.bedId ||
      this.patient?.admission?.bedName ||
      this.patient?.admission?.bedId ||
      'Not allocated'
    );
  }

  //get bed details
  getBedDetails(bed: Bed): BedDetail[] {
    const details: BedDetail[] = [
      { label: 'Bed ID', value: bed.id || '-' },
      { label: 'Ward ID', value: bed.wardId || '-' },
      { label: 'Room ID', value: bed.roomId || '-' },
      { label: 'Status', value: bed.statusLabel },
    ];
    return details;
  }

  //get bed status
  getBedStatus(status: any): BedStatus {
    const normalizedStatus = String(status || '').trim().toLowerCase();
    const matchedStatus = BED_STATUSES.find((bedStatus) => bedStatus === normalizedStatus);

    return matchedStatus || 'available';
  }

  private getWardIdByRoomId(roomId: any) {
    if (!roomId) {
      return '';
    }

    return this.rooms().find((room) => String(room.id || '') === String(roomId))?.wardId || '';
  }

  private isSameId(first: any, second: any) {
    return !!first && !!second && String(first) === String(second);
  }

  private toTitleCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private getPatientId() {
    return (this.patient?.patientId);
  }

  allocateBed(item?: Bed) {
    const patientId = this.getPatientId();

    if (!item || !this.selectedAllocationStatus || !patientId || !item.id || !this.isBedSelectable(item)) {
      if (!patientId || !item?.id) {
        this.allocationErrorMessage = 'Patient ID or Bed ID is missing.';
      } else if (!this.isBedSelectable(item)) {
        this.allocationErrorMessage = 'Only available beds can be allocated.';
      } else {
        this.allocationErrorMessage = '';
      }

      return;
    }

    const payload = {
      patientId,
      bedId: item.id,
      allocationStatus: this.selectedAllocationStatus,
    };

    this.assigningBed = true;
    this.allocationErrorMessage = '';

    this.addBedService.assignPatientToBed(payload).subscribe({
      next: (res) => {
        this.assigningBed = false;
        this.activeModal.close(true);
      },
      error: (err) => {
        this.assigningBed = false;
        this.allocationErrorMessage = err?.error?.message || 'Unable to allocate bed.';
      },
    });
  }
}
