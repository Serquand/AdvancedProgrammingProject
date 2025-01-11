import { Controller, UseGuards } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserRoles } from '@common';
import { IsAdminGuard, IsLoggedInGuard, LoginPayload } from '@app/auth-lib';
import { AdminCannotUpdateHimself, EmailAlreadyUsedGuard, HasNoAdminRegisteredYet } from './user.guard';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    @UseGuards(IsLoggedInGuard)
    @MessagePattern({ cmd: 'profile' })
    async getProfile(data: { user: LoginPayload }) {
        return this.userService.getUserById(data.user.userId);
    }

    @UseGuards(IsLoggedInGuard, IsAdminGuard)
    @MessagePattern({ cmd: 'get-all-users' })
    async getAllUsers(data: { roles?: UserRoles[] }) {
        return this.userService.findAll(data.roles);
    }

    @MessagePattern({ cmd: "register-first-admin" })
    @UseGuards(HasNoAdminRegisteredYet)
    async registerFirstAdmin(data: {createUserInformations: CreateUserDto}) {
        return this.userService.registerUser(data.createUserInformations);
    }

    @UseGuards(IsLoggedInGuard, IsAdminGuard, EmailAlreadyUsedGuard)
    @MessagePattern({ cmd: 'register-user' })
    async createUser(data: {createUserInformations: CreateUserDto}) {
        return this.userService.registerUser(data.createUserInformations);
    }

    @UseGuards(IsLoggedInGuard, IsAdminGuard, AdminCannotUpdateHimself)
    @MessagePattern({ cmd: "update-user" })
    async updateUser(data: { updateUserInformations: UpdateUserDto; userId: number }) {
        await this.userService.updateUser(data.userId, data.updateUserInformations);
        return await this.userService.getUserById(data.userId);
    }

    @UseGuards(IsLoggedInGuard, IsAdminGuard, AdminCannotUpdateHimself)
    @MessagePattern({ cmd: 'delete-user' })
    async deleteUser(data: { userId: number }) {
        return this.userService.deleteUser(data.userId);
    }
}