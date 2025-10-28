export interface Release {
  releaseid: number;
  releasetype: string;
  releasedate: string;
  releasetime: string;
  barangay: string | null;
  location: string | null;
  amountperstudent: number;
  numberofrecipients: number;
  additionalnotes: string | null;
  isArchived: boolean;
  semester_id: string;
}