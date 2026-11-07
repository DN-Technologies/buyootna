import apiClient from '@/shared/api/api';

export type VerificationStatus = 'PENDING' | 'CHANGES_REQUESTED' | 'APPROVED';

/** The fields the admin can send back, each with a reason. */
export type VerificationField =
  | 'licenseFile'
  | 'licenseNumber'
  | 'licenseActivity'
  | 'licenseExpiry';

export type VerificationIssues = Partial<
  Record<VerificationField | 'note', string>
>;

export interface VerificationRequest {
  id: string;
  status: VerificationStatus;
  licenseActivity: string | null;
  licenseNumber: string;
  licenseExpiry: string | null;
  licenseFileUrl: string;
  licenseFileName: string | null;
  licenseFileSize: number | null;
  licenseFileType: string | null;
  issues: VerificationIssues | null;
  submittedAt: string;
  reviewedAt: string | null;
  createdAt: string;
}

export interface MyVerification {
  isVerified: boolean;
  request: VerificationRequest | null;
}

/** A picked licence image or PDF. */
export interface LicenseFile {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
}

export interface VerificationForm {
  licenseNumber?: string;
  licenseActivity?: string;
  licenseExpiry?: string;
  file?: LicenseFile | null;
}

const toFormData = (form: VerificationForm) => {
  const data = new FormData();
  if (form.licenseNumber) data.append('licenseNumber', form.licenseNumber);
  if (form.licenseActivity) data.append('licenseActivity', form.licenseActivity);
  if (form.licenseExpiry) data.append('licenseExpiry', form.licenseExpiry);
  if (form.file) {
    data.append('license', {
      uri: form.file.uri,
      name: form.file.name || 'license.jpg',
      type: form.file.mimeType || 'image/jpeg',
    } as unknown as Blob);
  }
  return data;
};

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

/** «طلب التوثيق» of the current company. */
export const verificationService = {
  async get(identityId: string): Promise<MyVerification> {
    const res = await apiClient.get(`/identities/${identityId}/verification`);
    return res.data;
  },

  async submit(
    identityId: string,
    form: VerificationForm,
  ): Promise<VerificationRequest> {
    const res = await apiClient.post(
      `/identities/${identityId}/verification`,
      toFormData(form),
      MULTIPART,
    );
    return res.data;
  },

  /** «اعادة ارسال الطلب»: only the fields the admin sent back are read. */
  async resubmit(
    identityId: string,
    form: VerificationForm,
  ): Promise<VerificationRequest> {
    const res = await apiClient.patch(
      `/identities/${identityId}/verification`,
      toFormData(form),
      MULTIPART,
    );
    return res.data;
  },
};
