import { ButtonTypes } from "../components/Buttons/Button";

export interface SoundPreview {
  "preview-hq-mp3": string;
  "preview-hq-ogg": string;
  "preview-lq-ogg": string;
  "preview-lq-mp3": string;
}
export interface Sound {
  id: number;
  url: string;
  name: string;
  filesize: number;
  type: string;
  duration: number;
  download: string;
  previews: SoundPreview;
  tags: string[];
  description: string;
  created: string;
  avg_rating: number;
  rate: string;
  license: string;
  username: string;
}
export interface FreeSoundResponse {
  count: number;
  next: string | null;
  prev: string | null;
  results: Sound[];
}
