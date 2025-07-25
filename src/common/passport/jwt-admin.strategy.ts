import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAccessAdminStrategy extends PassportStrategy(
  Strategy,
  'jwt-admin',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: any) {
    const role = payload.role;
    if( role !== "admin") {
        throw new UnauthorizedException('Permission denied: Admin only');
    }
    return { userId: payload.sub, username: payload.username, role };
  }
}
