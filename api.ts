import { jwtDecode } from "jwt-decode";
import { addDays, format } from "date-fns";
import type { Booking, Duration, Workout } from "./types.ts";

const rootUrl = "https://api.stc.se/api";

export type CreateBookingResponse = {
  id: number;
  name: string;
  duration: Duration;
};

export class StcApi {
  customerId: string;

  constructor(private token: string) {
    const customerId = jwtDecode(token).sub;
    if (!customerId) {
      throw new Error("Customer ID could not be extracted from token");
    }
    this.customerId = customerId;
  }

  private getHeaders = () => ({
    accept: "application/json",
    "user-agent": "STC",
    Authorization: `Bearer ${this.token}`,
    "Accept-Language": "sv-SE;sv;q=0.9",
  });

  getWorkouts = async (clubs: string[]) => {
    const dateFormat = "y-LL-dd";
    const now = new Date();
    const workoutsFrom = format(now, dateFormat);
    const workoutsTo = format(addDays(now, 10), dateFormat);
    const workoutsUrl = `${rootUrl}/v3/workout-sessions?clubIds=${clubs.join(",")}&endDate=${workoutsTo}&startDate=${workoutsFrom}`;

    const response = await fetch(workoutsUrl, {
      headers: this.getHeaders(),
    });

    return (await response.json()) as Workout[];
  };

  getBookings = async () => {
    const bookingsUrl = `${rootUrl}/bookings?customerId=${this.customerId}`;

    const response = await fetch(bookingsUrl, {
      headers: this.getHeaders(),
    });

    return (await response.json()) as Booking[];
  };

  createBooking = async (workoutId: number) => {
    const url = `${rootUrl}/bookings`;
    const data = {
      customerId: this.customerId,
      workoutSessionId: workoutId,
    };

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: this.getHeaders(),
    });

    return (await response.json()) as CreateBookingResponse;
  };
}
