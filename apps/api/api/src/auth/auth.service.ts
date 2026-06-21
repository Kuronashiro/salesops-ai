import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase()

  console.log('EMAIL INPUT:', cleanEmail)

  const user = await this.prisma.user.findFirst({
  where: {
    email: cleanEmail,
  },
})

  console.log('USER FOUND:', user)

  if (!user) {
    throw new UnauthorizedException('User not found')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new UnauthorizedException('Invalid password')
  }

  return user
}

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password)

    const payload = {
  sub: user.id,
  email: user.email,
  role: user.role, // 🔥 INI WAJIB
}

    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}