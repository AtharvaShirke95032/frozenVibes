// Films from the original site's Films page (YouTube).

export type Film = {
  id: string;
  couple: string;
  place?: string;
  kind?: string;
  /** YouTube has no maxresdefault thumbnail for this video. */
  lowResThumb?: boolean;
};

export const films: Film[] = [
  { id: "aXHnaDeyMZE", lowResThumb: true, couple: "Anushka & Archit", place: "Phuket, Thailand" },
  { id: "hmTJdrdW7p0", couple: "Divya & Chaitanya", place: "Oxford Golf Course, Pune" },
  { id: "kY2Qg14qeTk", couple: "Devina & Sidd", place: "Kenya" },
  { id: "VK0m3SZXiI8", couple: "Sunaina & Dan", place: "Goa" },
  { id: "4aSud0yNPXc", couple: "Pratyushi & Vedant", place: "Jodhpur" },
  { id: "zyad5rplJlg", couple: "Aayusha & Vibhor", place: "Taj, Goa" },
  { id: "gETIqA5tRJI", couple: "Nikita & Harshil" },
  { id: "LT_fSNnbc2M", couple: "Tanushka & Sidhaant" },
  { id: "WBl0Mi5XTeQ", lowResThumb: true, couple: "Alka & Divyanshu", place: "Goa" },
  { id: "L8GxrDwi-iA", lowResThumb: true, couple: "Shivangi & Varun", place: "Chandigarh" },
  { id: "eu5n0mPzWHU", lowResThumb: true, couple: "Jinali & Kashyap", kind: "Wedding film" },
  { id: "PSR-X-GHj1Q", lowResThumb: true, couple: "Jinali & Kashyap", kind: "Teaser" },
  { id: "LJi-gr56TQg", couple: "Jinali & Kashyap", place: "Goa", kind: "Pre-wedding" },
  { id: "TZHsPv2L6ZE", lowResThumb: true, couple: "Riteeka & Mit", place: "Taj, Mumbai" },
  { id: "WoJra45-XOI", lowResThumb: true, couple: "Anuradha & Abhimanyu" },
  { id: "O57lFjYwXv0", couple: "Ankita & Vishal", place: "Dubai", kind: "Pre-wedding" },
  { id: "7H47jTAE4go", couple: "Aditi & Dhruv", place: "Lonavla", kind: "Pre-wedding" },
];

// hqdefault is 4:3 with letterboxing; object-cover in a 16:9 frame crops the bars exactly.
export const filmThumb = (f: Film) => `https://i.ytimg.com/vi/${f.id}/${f.lowResThumb ? "hqdefault" : "maxresdefault"}.jpg`;
