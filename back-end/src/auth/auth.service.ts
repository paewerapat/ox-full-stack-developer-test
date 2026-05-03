import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: UserDocument): string {
    const payload = { sub: (user._id as object).toString(), email: user.email };
    return this.jwtService.sign(payload);
  }
}
