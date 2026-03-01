import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() body: {email: string; name: string}) {
    return this.userService.create(body);
  }

  @Get(":email")
  findByEmail(@Param("email") email: string) {
    return this.userService.findByEmail(email)
  }
}