const VALID_START = 200;
const VALID_END = 299;

export default function validateStatus(status: number): boolean {
  return status >= VALID_START && status <= VALID_END;
}
