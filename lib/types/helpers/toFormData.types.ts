export type VisitorFn = (
  this: FormData,
  key: string,
  value: unknown,
  path?: string[],
) => boolean;

export interface ToFormDataOptions {
  dots?: boolean;
  indexes?: boolean | null;
  visitor?: VisitorFn;
}
