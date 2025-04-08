/**
 * Doctor type definition
 */
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital?: string;
  bio?: string;
  image_url?: string;
  user_id?: string;
  created_at?: string;
}
