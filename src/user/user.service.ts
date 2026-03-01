import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  create(body: any) {
    return this.userRepository.create(body);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
