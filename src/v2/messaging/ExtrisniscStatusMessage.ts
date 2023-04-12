export class ExtrinsicStatusMessage {
  constructor(
    public success: boolean,
    public message: string = '',
    public method: string = '',
    public subscanUrl: string = ''
  ) {}
}
