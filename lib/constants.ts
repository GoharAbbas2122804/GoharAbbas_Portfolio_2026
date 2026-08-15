export interface Project {
  id: number;
  artist: string;
  album: string;
  category: string;
  label: string;
  year: string;
  image: string;
}

export interface AboutConfig {
  timeZone?: string;
  timeUpdateInterval: number;
  idleDelay: number;
}

export interface SocialLinks {
  spotify: string;
  email: string;
  x: string;
}

export interface LocationInfo {
  latitude: string;
  longitude: string;
  display: boolean;
}

export interface AboutCallbacks {
  onProjectHover?: (project: Project) => void;
  onProjectLeave?: () => void;
  onContainerLeave?: () => void;
  onIdleStart?: () => void;
}

export const ABOUT_PROJECTS: Project[] = [
  {
    id: 1,
    artist: "YOUNG BROKE & LONELY",
    album: "LONELY BOY",
    category: "SINGLE",
    label: "SELF RELEASED",
    year: "2024",
    image: "https://i.pinimg.com/736x/9f/10/23/9f1023c3785097536e164d3ef7ac9fb6.jpg",
  },
  {
    id: 2,
    artist: "YOUNG BROKE & LONELY",
    album: "IN YOUR MEMORY",
    category: "SINGLE",
    label: "SELF RELEASED",
    year: "2024",
    image: "https://i.pinimg.com/736x/bf/f0/4d/bff04d662db206377de801ec0bc42804.jpg",
  },
  {
    id: 3,
    artist: "YOUNG BROKE & LONELY",
    album: "WHO AM I?",
    category: "SINGLE",
    label: "SELF RELEASED",
    year: "2023",
    image: "https://i.pinimg.com/736x/90/cf/ec/90cfec4c5230978dba450909c676fd42.jpg",
  },
  {
    id: 4,
    artist: "YOUNG BROKE & LONELY",
    album: "SINGLE MOM",
    category: "SINGLE",
    label: "SELF RELEASED",
    year: "2023",
    image: "https://i.pinimg.com/736x/8a/9d/06/8a9d06bccabc53834aa311fb3beb75f6.jpg",
  },
  {
    id: 5,
    artist: "YOUNG BROKE & LONELY",
    album: "GHOST",
    category: "SINGLE",
    label: "SELF RELEASED",
    year: "2023",
    image: "https://i.pinimg.com/1200x/99/0d/93/990d93d257f1f31ac12fbd161b29da8b.jpg",
  },
  {
    id: 6,
    artist: "YOUNG BROKE & LONELY",
    album: "DIFFICULTY",
    category: "SINGLE",
    label: "SELF RELEASED",
    year: "2022",
    image: "https://i.pinimg.com/1200x/1c/17/6b/1c176b16985212a93a950d61793b7e18.jpg",
  },
];

export const ABOUT_CONFIG: AboutConfig = {
  timeZone: "America/New_York",
  timeUpdateInterval: 1000,
  idleDelay: 4000,
};

export const ABOUT_SOCIAL_LINKS: SocialLinks = {
  spotify: "https://spotify.com/your-profile",
  email: "mailto:your-email@example.com",
  x: "https://x.com/your-handle",
};

export const ABOUT_LOCATION: LocationInfo = {
  latitude: "40.7128° N",
  longitude: "74.0060° W",
  display: true,
};
