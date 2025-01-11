import { Injectable, CanActivate, ExecutionContext, NotFoundException, ConflictException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class OrganizationExistsGuard implements CanActivate {
    constructor(private readonly organizationService: OrganizationsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const data = context.switchToRpc().getData();
        const organizationId = data.organizationId;

        const organization = await this.organizationService.getOrganization(organizationId);
        if (!organization) {
            throw new RpcException(new NotFoundException({
                en: `Organization not found`,
                fr: "L'organisation n'a pas été trouvé !",
            }));
        }

        data.organization = organization;

        return true;
    }
}

@Injectable()
export class OrganizationNameNotExistGuard implements CanActivate {
    constructor(private readonly organizationService: OrganizationsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const data = context.switchToRpc().getData();
        const organizationName = data.createOrganizationDto.name;
        const organizations = await this.organizationService.getAllOrganizations();
        const foundOrganization = organizations.find(organization => organization.name === organizationName);

        if(foundOrganization) {
            throw new RpcException(new ConflictException({
                en: "The organization you tried to create already exist !",
                fr: "L'organisation que vous essayez de créer existe déjà !"
            }));
        }
        return true;
    }
}