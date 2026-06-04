import { Component, OnInit, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddBed } from '../add-bed/add-bed';
import { AddBedService } from '../add-bed/add-bed-service';
import { AddRoom } from '../add-room/add-room';
import { AddRoomService } from '../add-room/add-room-service';
import { AddWard } from '../add-ward/add-ward';
import { AddWardService } from '../add-ward/add-ward-service';

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

interface Bed {
  id?: number | string;
  wardId?: string | number;
  roomId?: string | number;
  name?: string;
}

interface ChartRow {
  id?: number | string;
  label: string;
  rooms: number;
  beds: number;
}

type ManagementTab = 'ward' | 'room' | 'bed' | 'chart';

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

  get wardChartRows(): ChartRow[] {
    return this.wards().map((ward) => {
      const roomIds = this.rooms()
        .filter((room) => this.isSameId(room.wardId, ward.id))
        .map((room) => room.id);
      const beds = this.beds().filter((bed) =>
        this.isSameId(bed.wardId, ward.id) || roomIds.some((roomId) => this.isSameId(bed.roomId, roomId))
      ).length;

      return {
        id: ward.id,
        label: ward.name,
        rooms: roomIds.length,
        beds,
      };
    });
  }

  get chartMaxValue() {
    return Math.max(1, ...this.wardChartRows.flatMap((row) => [row.rooms, row.beds]));
  }

  setActiveTab(tab: ManagementTab) {
    this.activeTab = tab;
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
    return bedList.map((bed) => ({
      id: bed?.id || bed?._id || bed?.bedId,
      wardId: bed?.wardId || bed?.wardID || bed?.ward?.id || bed?.ward?._id || this.getWardIdByRoomId(bed?.roomId || bed?.roomID || bed?.room?.id || bed?.room?._id),
      roomId: bed?.roomId || bed?.roomID || bed?.room?.id || bed?.room?._id,
      name: bed?.name || bed?.bedName || '',
    })).filter((bed) => bed.name);
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
