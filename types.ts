export type Duration = {
  start: string;
  end: string;
};

export type Workout = {
  id: number;
  name: string;
  description: string;
  room: string;
  duration: Duration;
  bookable: { earliest: string; latest: string };
  cancelled: boolean;
  slots: number;
  club: {
    id: number;
    name: string;
  };
  clubId: number;
  clubName: string;
  instructors: any[];
};

export type Booking = {
  id: number;
  name: string;
  workoutSessionId: number; // this matches a Workout Id (used to unbook)
};
