export class ApiDataResponse<T> {
  constructor(public data: T) {
    this.data = data;
  }

  toJson() {
    return {
      data: this.data,
    };
  }
}
