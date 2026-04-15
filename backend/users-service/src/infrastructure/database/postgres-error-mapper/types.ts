import { AppError } from '../../../shared/errors';

export type PostgresDriverError = Error & {
  readonly code?: string;
  readonly detail?: string;
  readonly constraint?: string;
  readonly table?: string;
  readonly column?: string;
  readonly schema?: string;
  readonly routine?: string;
};

export type PostgresConstraintErrorFactory = () => AppError;

export type PostgresConstraintErrorMap = Record<
  string,
  PostgresConstraintErrorFactory
>;
