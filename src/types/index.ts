export interface EmailSubmission {
  email: string;
  privacyAccepted: boolean;
  dataProcessingAccepted: boolean;
  newsletterOptIn: boolean;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface AnonymizationLog {
  sessionId: string;
  fileType: string;
  fileSizeKb: number;
  processingTimeMs: number;
  success: boolean;
  errorType?: string;
}

export type ProcessingState =
  | 'idle'
  | 'uploading'
  | 'parsing'
  | 'anonymizing'
  | 'generating'
  | 'complete'
  | 'error';

export interface FileState {
  file: File | null;
  anonymizedBlob: Blob | null;
  state: ProcessingState;
  progress: number;
  errorMessage: string;
}

export interface AnonymizationResponse {
  success: boolean;
  blob?: Blob;
  fileName?: string;
  error?: string;
}
