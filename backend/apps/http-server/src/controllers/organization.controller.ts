import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Req } from '@nestjs/common';
import { GatewayService } from '../services/gateway.service';
import { Request } from 'express';
import { AddMemberDto, CreateOrganizationDto, UpdateOrganizationDto } from '@common'

@Controller('organization')
export class OrganizationController{
    constructor(private gatewayService: GatewayService) {}

    @Get('/')
    async getAllOrganizations(@Req() req: Request) {
        const data = { authorization: req.headers.authorization };
        return this.gatewayService.contactOrganizationMicroservices("get-all-organizations", data);
    }

    @Get(':organizationId')
    async getOrganization(@Param('organizationId') organizationId: number, @Req() req) {
        const data = { authorization: req.headers.authorization, organizationId };
        return this.gatewayService.contactOrganizationMicroservices("get-organization", data);
    }

    @Post('/')
    async createOrganization(@Body() createOrganizationDto: CreateOrganizationDto, @Req() req) {
        const data = { authorization: req.headers.authorization, createOrganizationDto };
        return this.gatewayService.contactOrganizationMicroservices("create-organization", data);
    }

    @Post(':organizationId/member')
    async addMember(@Body() memberToAdd: AddMemberDto, @Param('organizationId') organizationId: number, @Req() req) {
        const data = { authorization: req.headers.authorization, memberToAdd, organizationId };
        return this.gatewayService.contactOrganizationMicroservices("add-member", data);
    }

    @Put(':organizationId')
    async updateOrganization(@Body() updateOrganizationDto : UpdateOrganizationDto, @Param('organizationId') organizationId: number, @Req() req ){
        const data = { authorization: req.headers.authorization, updateOrganizationDto, organizationId};
        return this.gatewayService.contactOrganizationMicroservices("update-organization", data);
    }

    @Delete(':organizationId')
    @HttpCode(204)
    async deleteOrganization(@Param('organizationId') organizationId: number, @Req() req ){
        const data = { authorization: req.headers.authorization, organizationId};
        return this.gatewayService.contactOrganizationMicroservices("delete-organization", data);
    }

    @Delete(':organizationId/members/:userId')
    @HttpCode(204)
    async removeMember(@Param('organizationId') organizationId: number, @Param('userId') userId: number , @Req() req ) {
        const data = { authorization: req.headers.authorization, organizationId, userId };
        await this.gatewayService.contactOrganizationMicroservices("remove-member", data);
        return null;
    }
}