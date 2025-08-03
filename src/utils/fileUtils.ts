import { UploadedFile } from '../types';

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

export async function handleFileUpload(file: File): Promise<UploadedFile> {
  const data = await fileToBase64(file);
  
  return {
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type,
    size: file.size,
    data,
    uploadedAt: new Date().toISOString(),
  };
}

export function downloadFile(uploadedFile: UploadedFile): void {
  const link = document.createElement('a');
  link.href = uploadedFile.data;
  link.download = uploadedFile.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isImage(file: UploadedFile): boolean {
  return file.type.startsWith('image/');
}

export function isPDF(file: UploadedFile): boolean {
  return file.type === 'application/pdf';
}