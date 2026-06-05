import { Component, OnInit, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddBed } from '../add-bed/add-bed';
import { AddBedService } from '../add-bed/add-bed-service';
import { AddRoom } from '../add-room/add-room';
import { AddRoomService } from '../add-room/add-room-service';
import { AddWard } from '../add-ward/add-ward';
import { AddWardService } from '../add-ward/add-ward-service';
import { ViewPatientModal } from '../../OPD/patient-list/view-patient-modal/view-patient-modal';

interface Room {
  id?: number | string;
  wardId?: string | number;
  name?: string;
  totalBeds: number;
}

interface Ward {
  id?: number | string;
  name: string;
}

interface BedDetail {
  label: string;
  value: string | number;
}

export const BED_STATUSES = ['available', 'occupied', 'reserved', 'cleaning', 'maintenance'] as const;
type BedStatus = typeof BED_STATUSES[number];

interface Bed {
  id?: number | string;
  wardId?: string | number;
  roomId?: string | number;
  name?: string;
  status: BedStatus;
  statusLabel: string;
  statusClass: string;
  type?: string;
  patient?: any;
  patientId?: string | number;
  patientName?: string;
  details: BedDetail[];
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

type ManagementTab = 'ward' | 'room' | 'bed' | 'visual';

@Component({
  selector: 'app-ward-management',
  imports: [],
  templateUrl: './ward-management.html',
  styleUrl: './ward-management.scss',
})
export class WardManagement implements OnInit {
  wards = signal<Ward[]>([]);
  rooms = signal<Room[]>([]);
  beds = signal<Bed[]>([]);
  activeTab: ManagementTab = 'ward';
  loadingWards = false;
  loadingRooms = false;
  loadingBeds = false;
  deletingWardId: string | number | null = null;
  deletingRoomId: string | number | null = null;
  deletingBedId: string | number | null = null;
  visualWardId: string | number | 'all' = 'all';
  wardErrorMessage = '';
  roomErrorMessage = '';
  bedErrorMessage = '';

  constructor(
    private modalService: NgbModal,
    private addBedService: AddBedService,
    private addRoomService: AddRoomService,
    private addWardService: AddWardService,
  ) { }

  ngOnInit() {
    this.getWardList();
    this.getRoomList();
    this.getBedList();
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

  get visualWards(): VisualWard[] {
    return this.wards()
      .filter((ward) => this.visualWardId === 'all' || this.isSameId(ward.id, this.visualWardId))
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

  setActiveTab(tab: ManagementTab) {
    this.activeTab = tab;
  }

  setVisualWardId(wardId: string | number | 'all') {
    this.visualWardId = wardId;
  }

  canShowPatientDetails(bed: Bed) {
    return bed.status === 'occupied' || bed.status === 'reserved' || this.hasBedPatientDetails(bed);
  }

  openBedPatientDetails(bed: Bed) {
    const modalRef = this.modalService.open(ViewPatientModal, {
      backdrop: 'static',
      scrollable: true,
      size: 'xl',
    });

    modalRef.componentInstance.patient = this.getPatientDetailsFromBed(bed);
  }

  openAddWard() {
    const modalRef = this.modalService.open(AddWard, {
      backdrop: 'static',
      centered: true,
      size: 'md',
    });

    modalRef.result.then((res) => {
      if (res) {
        this.getWardList();
      }
    }).catch(() => { });
  }

  getWardList() {
    this.loadingWards = true;
    this.wardErrorMessage = '';

    this.addWardService.getWardList().subscribe({
      next: (res) => {
        const wardList = res?.wardList || res?.wards || res?.data || [];

        this.wards.set(this.normalizeWardList(Array.isArray(wardList) ? wardList : []));
        this.loadingWards = false;
      },
      error: (err) => {
        this.wards.set([]);
        this.loadingWards = false;
        this.wardErrorMessage = err?.error?.message || 'Ward list load karvama error aavyo.';
        console.error('Error loading ward list', err);
      },
    });
  }

  deleteWard(ward: Ward) {
    const wardId = ward.id;

    if (!wardId) {
      this.wardErrorMessage = 'Ward ID missing che.';
      return;
    }

    this.deletingWardId = wardId;
    this.wardErrorMessage = '';

    this.addWardService.deleteWard(wardId).subscribe({
      next: () => {
        this.deletingWardId = null;
        this.getWardList();
      },
      error: (err) => {
        this.deletingWardId = null;
        this.wardErrorMessage = err?.error?.message || 'Ward delete karvama error aavyo.';
        console.error('Error deleting ward', err);
      },
    });
  }

  openAddRoom() {
    const modalRef = this.modalService.open(AddRoom, {
      backdrop: 'static',
      centered: true,
      size: 'md',
    });

    modalRef.componentInstance.wards = this.wards();

    modalRef.result.then((res) => {
      if (res) {
        this.getRoomList();
      }
    }).catch(() => { });
  }

  getRoomList() {
    this.loadingRooms = true;
    this.roomErrorMessage = '';

    this.addRoomService.getRoomList().subscribe({
      next: (res) => {
        const roomList = res?.roomList || res?.rooms || res?.data || [];

        this.rooms.set(this.normalizeRoomList(Array.isArray(roomList) ? roomList : []));
        this.loadingRooms = false;
      },
      error: (err) => {
        this.rooms.set([]);
        this.loadingRooms = false;
        this.roomErrorMessage = err?.error?.message || 'Room list load karvama error aavyo.';
        console.error('Error loading room list', err);
      },
    });
  }

  deleteRoom(room: Room) {
    const roomId = room.id;

    if (!roomId) {
      this.roomErrorMessage = 'Room ID missing che.';
      return;
    }

    this.deletingRoomId = roomId;
    this.roomErrorMessage = '';

    this.addRoomService.deleteRoom(roomId).subscribe({
      next: () => {
        this.deletingRoomId = null;
        this.getRoomList();
      },
      error: (err) => {
        this.deletingRoomId = null;
        this.roomErrorMessage = err?.error?.message || 'Room delete karvama error aavyo.';
        console.error('Error deleting room', err);
      },
    });
  }

  openAddBed() {
    const modalRef = this.modalService.open(AddBed, {
      backdrop: 'static',
      centered: true,
      size: 'md',
    });

    modalRef.componentInstance.wards = this.wards();
    modalRef.componentInstance.rooms = this.rooms();

    modalRef.result.then((res) => {
      if (res) {
        this.getBedList();
      }
    }).catch(() => { });
  }

  getBedList() {
    this.loadingBeds = true;
    this.bedErrorMessage = '';

    this.addBedService.getBedList().subscribe({
      next: (res) => {
        const bedList = res?.bedList || res?.beds || res?.data || [];

        this.beds.set(this.normalizeBedList(Array.isArray(bedList) ? bedList : []));
        this.loadingBeds = false;
      },
      error: (err) => {
        this.beds.set([]);
        this.loadingBeds = false;
        this.bedErrorMessage = err?.error?.message || 'Bed list load karvama error aavyo.';
        console.error('Error loading bed list', err);
      },
    });
  }

  deleteBed(bed: Bed) {
    const bedId = bed.id;

    if (!bedId) {
      this.bedErrorMessage = 'Bed ID missing che.';
      return;
    }

    this.deletingBedId = bedId;
    this.bedErrorMessage = '';

    this.addBedService.deleteBed(bedId).subscribe({
      next: () => {
        this.deletingBedId = null;
        this.getBedList();
      },
      error: (err) => {
        this.deletingBedId = null;
        this.bedErrorMessage = err?.error?.message || 'Bed delete karvama error aavyo.';
        console.error('Error deleting bed', err);
      },
    });
  }

  private normalizeWardList(wardList: any[]): Ward[] {
    return wardList.map((ward) => ({
      id: ward?.id || ward?._id || ward?.wardId,
      name: ward?.name || ward?.wardName || '',
    })).filter((ward) => ward.name);
  }

  private normalizeRoomList(roomList: any[]): Room[] {
    return roomList.map((room) => ({
      id: room?.id || room?._id || room?.roomId,
      wardId: room?.wardId || room?.wardID || room?.ward?.id || room?.ward?._id,
      name: room?.name || room?.roomName || '',
      totalBeds: Number(room?.totalBeds || room?.bedCount || 0),
    })).filter((room) => room.name);
  }

  private normalizeBedList(bedList: any[]): Bed[] {
    return bedList.map((bed) => {
      const roomId = bed?.roomId || bed?.roomID || bed?.room?.id || bed?.room?._id;
      const wardId = bed?.wardId || bed?.wardID || bed?.ward?.id || bed?.ward?._id || this.getWardIdByRoomId(roomId);
      const patient = bed?.patient || bed?.assignedPatient || bed?.patientDetails || bed?.admittedPatient;
      const normalizedBed: Bed = {
        id: bed?.id || bed?._id || bed?.bedId,
        wardId,
        roomId,
        name: bed?.name || bed?.bedName || '',
        status: this.getBedStatus(this.getRawBedStatus(bed)),
        statusLabel: '',
        statusClass: '',
        type: bed?.type || bed?.bedType,
        patient,
        patientId: bed?.patientId || bed?.patientID || patient?.patientId || patient?.id || patient?._id,
        patientName: bed?.patientName || patient?.name,
        details: [],
      };

      normalizedBed.statusLabel = this.toTitleCase(normalizedBed.status);
      normalizedBed.statusClass = `bed-status-${normalizedBed.status}`;
      normalizedBed.details = this.getBedDetails(normalizedBed);

      return normalizedBed;
    }).filter((bed) => bed.name);
  }

  private getBedDetails(bed: Bed): BedDetail[] {
    const details: BedDetail[] = [
      { label: 'Bed ID', value: bed.id || '-' },
      { label: 'Ward ID', value: bed.wardId || '-' },
      { label: 'Room ID', value: bed.roomId || '-' },
    ];

    details.push({ label: 'Status', value: bed.statusLabel });

    if (bed.type) {
      details.push({ label: 'Type', value: bed.type });
    }

    if (bed.patientName) {
      details.push({ label: 'Patient', value: bed.patientName });
    }

    return details;
  }

  private getBedStatus(status: any): BedStatus {
    const normalizedStatus = String(status || '').trim().toLowerCase();
    const matchedStatus = BED_STATUSES.find((bedStatus) => bedStatus === normalizedStatus);

    return matchedStatus || 'available';
  }

  private getRawBedStatus(bed: any) {
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

  private toTitleCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private hasBedPatientDetails(bed: Bed) {
    return !!(bed.patient || bed.patientId || bed.patientName);
  }

  private getPatientDetailsFromBed(bed: Bed) {
    return {
      ...(bed.patient || {}),
      patientId: bed.patient?.patientId || bed.patientId || 'N/A',
      name: bed.patient?.name || bed.patientName || 'N/A',
      bedName: bed.name || bed.id || 'N/A',
      bedStatus: bed.statusLabel,
      wardId: bed.wardId || 'N/A',
      roomId: bed.roomId || 'N/A',
    };
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

}
