import { select } from "@inquirer/prompts";
import { Separator } from "@inquirer/select";
import { format, parse } from "date-fns";
import chalk from "chalk";
import type { Workout } from "./types.ts";
import { StcApi } from "./api.ts";

const token = process.env.STC_TOKEN;

if (!token) {
  throw new Error("Token must be specified in STC_TOKEN env var");
}

// TODO: Make selected gyms configurable in the app
const clubs = (process.env.CLUBS || "").split(",");

const api = new StcApi(token);

const [workouts, bookings] = await Promise.all([
  api.getWorkouts(clubs),
  api.getBookings(),
]);

const bookedWorkoutIds = new Set(bookings.map((b) => b.workoutSessionId));

const dayGroupFormat = "y/LL/dd";

const workoutsByDay = workouts
  .filter((w) => !w.name.startsWith("Virtual "))
  .reduce<{ [day: string]: Workout[] }>((acc, w) => {
    const day = format(new Date(w.duration.start), dayGroupFormat);
    if (!acc[day]) {
      acc[day] = [];
    }

    return { ...acc, [day]: [...acc[day], w] };
  }, {});

const choices: any[] = [];

Object.entries(workoutsByDay).forEach(([day, dayWorkouts]) => {
  choices.push(
    new Separator(
      chalk.blue(
        format(parse(day, dayGroupFormat, new Date()), "EEEE dd/LL/y"),
      ),
    ),
  );
  dayWorkouts.forEach((w) => {
    const disabled = bookedWorkoutIds.has(w.id)
      ? `(${chalk.yellowBright("already booked")})`
      : w.slots <= 0
        ? `(${chalk.red("workout is full")})`
        : new Date(w.bookable.earliest) > new Date()
          ? "(too early to book)"
          : false;
    choices.push({
      name: `${format(new Date(w.duration.start), "HH:mm")} ${w.name.trim()}${!disabled ? ` (${chalk.green(w.slots)} slot${w.slots > 1 ? "s" : ""})` : ""} - ${w.club.name}`,
      value: w.id + "",
      disabled,
    });
  });
});

const selectedWorkoutId = await select({
  message: "Select a workout",
  pageSize: 80,
  choices,
});

if (selectedWorkoutId) {
  const bookedWorkout = await api.createBooking(selectedWorkoutId as number);
  console.log(chalk.green(`Workout "${bookedWorkout.name}" has been booked!`));
} else {
  console.log(chalk.red("Booking process cancelled"));
}
