export class ApiMsgResponse<T = void> {
  protected message: string;
  protected key: string;
  protected data?: T;

  constructor(message: string, key: string, data?: T) {
    this.message = message;
    this.key = key;
    this.data = data;
  }

  toJson() {
    return {
      message: this.message,
      key: this.key,
      data: this.data,
    };
  }
}
