import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserInputDto } from './dto/create-user.dto';
import { VerifyUserInputDto } from './dto/verify-user-input.dto';
import { hasher } from '@/shared/utils/hasher';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  create(body: CreateUserInputDto) {
    // 비밀번호 해싱
    const hashing = hasher(body.password);
    const input: CreateUserInputDto = {
      ...body,
      password: hashing,
    };

    return this.userRepository.create(input);
  }

  findUserByEmail(email: string) {
    return this.userRepository.findUserByEmail(email);
  }

  verifyAccount(body: VerifyUserInputDto) {
    return this.userRepository.verifyAccount(body);
  }
}
