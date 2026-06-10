import { calculateAge } from './calculate-age';

describe('calculateAge', () => {
  it.each([
    ['2026-04-18T23:59:59.000Z', 25],
    ['2026-04-19T00:00:00.000Z', 26],
    ['2026-04-20T00:00:00.000Z', 26],
  ])('считает возраст на дату %s', (today, expectedAge) => {
    expect(calculateAge('2000-04-19', new Date(today))).toBe(expectedAge);
  });
});
