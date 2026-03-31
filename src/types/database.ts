export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Row types
export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  description_en: string | null;
  description_es: string | null;
  cover_image: string | null;
  tagline: string | null;
  tagline_en: string | null;
  tagline_es: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tour {
  id: string;
  name: string;
  name_en: string | null;
  name_es: string | null;
  slug: string;
  short_description: string | null;
  short_description_en: string | null;
  short_description_es: string | null;
  long_description: string | null;
  long_description_en: string | null;
  long_description_es: string | null;
  duration: string | null;
  price: number | null;
  currency: string;
  max_group_size: number | null;
  language: string | null;
  difficulty: string | null;
  cover_image: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TourItinerary {
  id: string;
  tour_id: string;
  step_order: number;
  title: string;
  title_en: string | null;
  title_es: string | null;
  description: string | null;
  description_en: string | null;
  description_es: string | null;
}

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  alt_text: string | null;
  tour_id: string | null;
  destination_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  name_en: string | null;
  name_es: string | null;
  description: string | null;
  description_en: string | null;
  description_es: string | null;
  icon: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  tour_id: string | null;
  status: 'new' | 'replied' | 'archived';
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      destinations: {
        Row: Destination;
        Insert: Omit<Destination, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<Destination, 'id' | 'created_at' | 'updated_at'>>;
      };
      tours: {
        Row: Tour;
        Insert: Omit<Tour, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<Tour, 'id' | 'created_at' | 'updated_at'>>;
      };
      tour_destinations: {
        Row: { tour_id: string; destination_id: string };
        Insert: { tour_id: string; destination_id: string };
        Update: Partial<{ tour_id: string; destination_id: string }>;
      };
      tour_itinerary: {
        Row: TourItinerary;
        Insert: Omit<TourItinerary, 'id'> & { id?: string };
        Update: Partial<Omit<TourItinerary, 'id'>>;
      };
      media: {
        Row: Media;
        Insert: Omit<Media, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Media, 'id' | 'created_at'>>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Service, 'id' | 'created_at'>>;
      };
      contacts: {
        Row: Contact;
        Insert: Omit<Contact, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Contact, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      tour_status: 'draft' | 'published';
      media_type: 'image' | 'video';
      contact_status: 'new' | 'replied' | 'archived';
      difficulty_level: 'easy' | 'moderate' | 'challenging';
    };
  };
}
