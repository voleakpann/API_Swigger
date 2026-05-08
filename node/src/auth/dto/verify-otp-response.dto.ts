export class VerifyOtpResponse {
  phone: string;
  role: string | null;
  token: string | null;
  message: string;

  constructor(
    phone: string,
    role: string | null,
    token: string | null,
    message: string,
  ) {
    this.phone = phone;
    this.role = role;
    this.token = token;
    this.message = message;
  }
}
