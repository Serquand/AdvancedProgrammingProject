import { Controller, NotFoundException, UseGuards, ConflictException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { AddMemberDto, CreateOrganizationDto, UpdateOrganizationDto } from '@common';
import { OrganizationExistsGuard, OrganizationNameNotExistGuard } from './organizations.guard';
import { IsAdminGuard, IsLoggedInGuard } from '@app/auth-lib';
import { MessagePattern, RpcException } from '@nestjs/microservices';

@UseGuards(IsLoggedInGuard, IsAdminGuard)
@Controller('organization')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationsService) {}

    @MessagePattern({ cmd: "get-all-organizations" })
    async getAllOrganizations() {
        return this.organizationService.getAllOrganizations();
    }

    @UseGuards(OrganizationExistsGuard)
    @MessagePattern({ cmd: "get-organization" })
    async getOrganization(data: {organizationId: number}) {
        return this.organizationService.getOrganization(data.organizationId);
    }

    @UseGuards(OrganizationNameNotExistGuard)
    @MessagePattern({ cmd: "create-organization" })
    async createOrganization(data: {createOrganizationDto: CreateOrganizationDto}) {
        return await this.organizationService.createOrganization(data.createOrganizationDto);
    }

    @UseGuards(OrganizationExistsGuard)
    @MessagePattern({ cmd: "add-member" })
    async addMember(data: {organizationId: number, memberToAdd: AddMemberDto}) {
        if(await this.organizationService.isMemberInOrganization(data.organizationId, data.memberToAdd.userId)) {
            throw new RpcException(new ConflictException({
                en: "The member is already in this organization !",
                fr: "L\'utilisateur est déjà membre de cette organisation !"
            }));
        }
        return this.organizationService.addMember(data.organizationId, data.memberToAdd);
    }

    @UseGuards(OrganizationExistsGuard)
    @MessagePattern({ cmd: "update-organization" })
    async updateOrganization(data: {organizationId: number, updateOrganizationDto: UpdateOrganizationDto}) {
        return this.organizationService.updateOrganization(data.organizationId, data.updateOrganizationDto);
    }

    @UseGuards(OrganizationExistsGuard)
    @MessagePattern({ cmd: "delete-organization" })
    async deleteOrganization(data: {organizationId: number}) {
        await this.organizationService.deleteOrganization(data.organizationId);
        return {success: true};
    }

    @UseGuards(OrganizationExistsGuard)
    @MessagePattern({ cmd: "remove-member" })
    async removeMember(data: {organizationId: number, userId: number}) {
        if(!await this.organizationService.isMemberInOrganization(data.organizationId, data.userId)) {
            throw new RpcException(new NotFoundException({
                en: "The member doesn't exist in this organization !",
                fr: "L'utilisateur n'est pas membre de cette organisation !"
            }));
        }
        await this.organizationService.removeMemberFromOrganization(data.organizationId, data.userId);
        return {success: true};
    }
}
