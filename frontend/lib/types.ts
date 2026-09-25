export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
}

export interface Room {
  roomCode: string;
  roomName: string;
  isPublic: boolean;
}

export interface RoomMember {
  id: number;
  room?: Room;
  user: User;
  joinedAt: string;
}

export interface RoomVideoResponse {
  roomCode: string;
  videoKey: string | null;
  videoUrl: string | null;
}

export interface CreateRoomPayload {
  roomName: string;
  isPublic: boolean;
  roomPassword?: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  password?: string;
}
