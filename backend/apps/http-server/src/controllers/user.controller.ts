import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { GatewayService } from '../services/gateway.service';
import { Request } from 'express';
import { CreateUserDto, UpdateUserDto, UserRoles } from '@common';

@Controller('user')
export class UserController {
    constructor(private gatewayService: GatewayService) { }

    @Get('/profile')
    async getProfile(@Req() req: Request) {
        const authorization = req.headers.authorization;
        return await this.gatewayService.contactUserMicroservices<{ authorization: string }>('profile', { authorization });
    }

    @Get('/all')
    async getAllUsers(@Req() req: Request, @Query('roles') roles?: UserRoles[]) {
        const data = { authorization: req.headers.authorization, roles };
        return this.gatewayService.contactUserMicroservices("get-all-users", data);
    }

    @ApiExcludeEndpoint()
    @Post("/register-first-admin")
    async registerFirstAdmin(@Body() createUserInformations: CreateUserDto) {
        const data = { createUserInformations };
        return await this.gatewayService.contactUserMicroservices("register-first-admin", data);
    }

    @Post('/register')
    async createUser(@Body() createUserInformations: CreateUserDto, @Req() req: Request) {
        const data = { authorization: req.headers.authorization, createUserInformations };
        return await this.gatewayService.contactUserMicroservices("register-user", data);
    }

    @Put('/:id')
    async updateUser(@Param('id') id: number, @Body() updateUserInformations: UpdateUserDto, @Req() req: Request) {
        const data = { authorization: req.headers.authorization, userId: id, updateUserInformations };
        return this.gatewayService.contactUserMicroservices("update-user", data);
    }

    @HttpCode(204)
    @Delete('/:id')
    async deleteUser(@Param('id') id: number, @Req() req: Request) {
        const data = { authorization: req.headers.authorization, userId: id };
        await this.gatewayService.contactUserMicroservices("delete-user", data);
        return;
    }
}