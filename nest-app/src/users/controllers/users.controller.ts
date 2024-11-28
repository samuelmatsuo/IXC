import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { GetUserByIdHandler } from 'src/users/handlers/get-user-by-id.handler';
import { GetUsersHandler } from 'src/users/handlers/get-users.handler';
import { LoginUserHandler } from 'src/users/handlers/login-user.handler';
import { RegisterUserHandler } from 'src/users/handlers/register-user.handler';
import { UpdateUserCommand, UpdateUserHandler } from 'src/users/handlers/update-user.handler';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { LoginUserDto } from 'src/users/dtos/login-user.dto';
import { UpdateUserDto } from 'src/users/dtos/update-user.dto';

@Controller('users')
export class UsersController {

    constructor(
        private readonly getUserByIdHandler: GetUserByIdHandler,
        private readonly getUsersHandler: GetUsersHandler,
        private readonly loginUserHandler: LoginUserHandler,
        private readonly registerUserHandler: RegisterUserHandler,
        private readonly updateUserHandler: UpdateUserHandler,
    ) { }

    @Get('/getUsers')
    async getAllUsers() {
      return this.getUsersHandler.execute();
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
      return this.getUserByIdHandler.execute({ id });
    }
  
    @Post('/register')
    async registerUser(@Body() createUserDto: CreateUserDto) {
      return this.registerUserHandler.execute(createUserDto);
    }
  
    @Post('/login')
    async login(
      @Body() body: { username: string; password: string }, @Res() res: Response,
    ) {
      const { username, password } = body;
      return this.loginUserHandler.execute({ username, password, res });
    }
  
    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
      const updateUserCommand: UpdateUserCommand = {
        id,
        user: updateUserDto, 
      };
    
      return this.updateUserHandler.execute(updateUserCommand);
    }
}
