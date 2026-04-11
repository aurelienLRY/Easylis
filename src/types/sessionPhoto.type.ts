export interface ISessionPhoto {
  _id: string;
  sessionId: string;
  originalName: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  expiresAt: Date;
  deletedAt?: Date | null;
}
