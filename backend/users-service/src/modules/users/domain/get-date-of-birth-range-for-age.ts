import type { DateOfBirth } from '../types/user.type';

type AgeRange = {
  minAge: number;
  maxAge: number;
  referenceDate?: Date;
};

type DateOfBirthRange = {
  from: DateOfBirth;
  to: DateOfBirth;
};

export function getDateOfBirthRangeForAge({
  minAge,
  maxAge,
  referenceDate = new Date(),
}: AgeRange): DateOfBirthRange {
  const firstExcludedAge = maxAge + 1;
  const firstAllowedDateOfBirth = getNextUtcDay(
    getDateYearsAgo(referenceDate, firstExcludedAge),
  );
  const lastAllowedDateOfBirth = getDateYearsAgo(referenceDate, minAge);

  return {
    from: formatDateOfBirth(firstAllowedDateOfBirth),
    to: formatDateOfBirth(lastAllowedDateOfBirth),
  };
}

function getDateYearsAgo(referenceDate: Date, yearsAgo: number): Date {
  const year = referenceDate.getUTCFullYear() - yearsAgo;
  const monthIndex = referenceDate.getUTCMonth();
  const day = Math.min(
    referenceDate.getUTCDate(),
    getDaysInUtcMonth(year, monthIndex),
  );

  return new Date(Date.UTC(year, monthIndex, day));
}

function getDaysInUtcMonth(year: number, monthIndex: number): number {
  const lastDayOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0));

  return lastDayOfMonth.getUTCDate();
}

function getNextUtcDay(date: Date): Date {
  const nextDay = new Date(date);

  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  return nextDay;
}

function formatDateOfBirth(date: Date): DateOfBirth {
  const year = date.getUTCFullYear();
  const month = formatDatePart(date.getUTCMonth() + 1);
  const day = formatDatePart(date.getUTCDate());

  return `${year}-${month}-${day}`;
}

function formatDatePart(value: number): string {
  return String(value).padStart(2, '0');
}
