import { UserDto } from '@/user/user.entity';
import { LoginTokenDto } from './login-token.dto';

export class LoginResultDto extends LoginTokenDto {
  user: UserDto;
}
