export class ExtrinsicStatusMessage {
  private success: boolean;
  private message: string;
  private method: string;
  private explorerUrl: string;

  constructor({
    success,
    message = '',
    method = '',
    explorerUrl = '',
  }: {
    success: boolean;
    message: string;
    method?: string;
    explorerUrl?: string;
  }) {
    this.success = success;
    this.message = message;
    this.method = method;
    this.explorerUrl = explorerUrl;
  }

  public getMessage(): string {
    return this.message;
  }

  public isSuccess(): boolean {
    return this.success;
  }

  public getMethod(): string {
    return this.method;
  }

  public getExplorerUrl(): string {
    return this.explorerUrl;
  }
}
