// Shared types for the Visit members PWA

export interface MemberData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  tier: string;
  guestAllowance: number;
  joinedAt: string;
  expirationDate: string | null;
  appAccess: "none" | "preview" | "approved";
  visitCount: number;
}

export interface Artwork {
  id: string;
  title: string;
  medium?: string | null;
  year?: string | null;
  price: number | null;
  imageUrl?: string | null;
}

export interface Exhibition {
  artistName: string;
  title: string;
  statement?: string | null;
  startDate: string;
  endDate: string;
  artworks: Artwork[];
}

export interface Pour {
  drinkName: string;
  spec?: string | null;
  tastingNote?: string | null;
  imageUrl?: string | null;
}

export interface SoundInfo {
  djName: string;
  genre?: string | null;
}

export interface InsiderTip {
  title: string;
  description?: string | null;
}

export interface MenuItem {
  name: string;
  spec: string;
  price: number | null;
}

