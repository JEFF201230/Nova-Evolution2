export type BffLogValue = string | number | boolean | null;
export type BffLogFields = Readonly<Record<string, BffLogValue>>;

export interface BffLogger {
  info(event: string, fields?: BffLogFields): void;
  warn(event: string, fields?: BffLogFields): void;
  error(event: string, fields?: BffLogFields): void;
}

export class JsonConsoleLogger implements BffLogger {
  constructor(
    private readonly service = "nova-secure-bff",
    private readonly clock: () => Date = () => new Date(),
  ) {}

  info(event: string, fields: BffLogFields = {}): void {
    this.write("INFO", event, fields);
  }

  warn(event: string, fields: BffLogFields = {}): void {
    this.write("WARN", event, fields);
  }

  error(event: string, fields: BffLogFields = {}): void {
    this.write("ERROR", event, fields);
  }

  private write(
    level: "INFO" | "WARN" | "ERROR",
    event: string,
    fields: BffLogFields,
  ): void {
    const record = {
      timestamp: this.clock().toISOString(),
      level,
      service: this.service,
      event,
      ...fields,
    };
    process.stdout.write(`${JSON.stringify(record)}\n`);
  }
}
