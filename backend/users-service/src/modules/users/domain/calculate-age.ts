import type { DateOfBirth } from '../types/user.type';

export function calculateAge(
  dateOfBirth: DateOfBirth,
  today = new Date(),
): number {
  const {
    year: birthYear,
    month: birthMonth,
    day: birthDay,
  } = parseDateOfBirth(dateOfBirth);
  const currentMonth = getCalendarMonth(today);
  let age = today.getUTCFullYear() - birthYear;

  const hasHadBirthdayThisYear =
    currentMonth > birthMonth ||
    (currentMonth === birthMonth && today.getUTCDate() >= birthDay);

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  return age;
}

function parseDateOfBirth(dateOfBirth: DateOfBirth) {
  const [year, month, day] = dateOfBirth.split('-').map(Number);

  return { year, month, day };
}

function getCalendarMonth(date: Date): number {
  const calendarMonthOffset = 1;

  return date.getUTCMonth() + calendarMonthOffset;
}
