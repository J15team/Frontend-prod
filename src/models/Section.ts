/**
 * Section Model
 * セクション情報を表すモデル
 */
export interface Section {
  subjectId: number;
  sectionId: number;
  title: string;
  description: string;
  images?: SectionImage[] | null;
}

export interface SectionImage {
  imageId: number;
  subjectId: number;
  sectionId: number;
  imageUrl: string;
  createdAt: string;
}

export interface CreateSectionPayload {
  sectionId: number;
  title: string;
  description?: string;
  image?: File | null;
}

export interface UpdateSectionPayload {
  title?: string;
  description?: string;
  image?: File | null;
}
