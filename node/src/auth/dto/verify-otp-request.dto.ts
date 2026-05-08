import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpRequest {
  @IsString()
  @IsNotEmpty({ message: 'idToken is required' })
  idToken!: string;
}
