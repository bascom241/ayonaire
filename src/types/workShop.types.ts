export enum WorkShopStatus {
  LIVE = "live",
  UPCOMING = "upcoming",
  COMPLETED = "completed",
}

export interface CreateWorkShopRequest {
  title: string;
  description: string;
  platform: {
    name: string;
    link: string;
    type: string;
  };
  status: string;
  startDate: string;
  endDate: string;
}

export interface CreateWorkShopResponse {
  id: string;
  title: string;
  description: string;
  platform: {
    name: string;
    link: string;
    type: string;
  };
  status: string;
  startDate: string;
  endDate: string;
}

export enum PlatformName {
  ZOOM = "zoom",
  GOOGLE_MEET = "googleMeet",
  TEAMS = "team",
  IN_PERSON = "inPerson",
  OTHER = "other",
}




export interface GetAllWorkShopsResponse {
  workshops: CreateWorkShopResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}