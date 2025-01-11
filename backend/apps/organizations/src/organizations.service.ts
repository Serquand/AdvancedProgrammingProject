import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization, OrganizationUser, AddMemberDto, CreateOrganizationDto, UpdateOrganizationDto, UserRoles} from "@common";
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { inspect } from 'util';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,

        @InjectRepository(OrganizationUser)
        private readonly organizationUserRepository: Repository<OrganizationUser>,
    ) {}

    async isMemberInOrganization(organizationId: number, userId: number): Promise<boolean> {
        return (await this.organizationUserRepository.count({ where: { organizationId, userId } })) === 1;
    }

    async getAllOrganizations() {
        const organizations = (await this.organizationRepository
            .find({ relations: ["users", "users.user"], }))
            .map(org => ({ ...org, users: org.users.map((orgUser) => orgUser.user).filter(user => user.role !== UserRoles.ADMIN) }));
        return organizations;
    }

    async getOrganization(organizationId: number) {
        const organization = await this.organizationRepository.findOne({
            where: { id: organizationId },
            relations: ["users", "users.user"],
        });

        if (!organization) return null;

        return {
            ...organization,
            users: organization.users.map((orgUser) => orgUser.user).filter(user => user.role !== UserRoles.ADMIN),
        };
    }

    async updateOrganization(id: number, newOrganization: UpdateOrganizationDto) {
        const organization = await this.organizationRepository.findOne({ where: { id } });

        if (newOrganization.name) {
            organization.name = newOrganization.name;
            try {
                await this.organizationRepository.save(organization);
            } catch {
                throw new RpcException(new ConflictException({
                    en:"This organization name already exists !",
                    fr: "Le nom de cette organisation est déjà pris !"
                }));
            }
        }

        if (newOrganization.memberIds) {
            await this.organizationUserRepository.delete({ organizationId: id });

            for (const memberId of newOrganization.memberIds) {
                const organizationUser = new OrganizationUser();
                organizationUser.userId = memberId;
                organizationUser.organizationId = id;
                await this.organizationUserRepository.save(organizationUser);
            }
        }

        return this.getOrganization(id);
    }


    async addMember(organizationId: number, memberToAdd: AddMemberDto) {
        const { userId } = memberToAdd;
        return await this.organizationUserRepository.save({ organizationId, userId });
    }

    async deleteOrganization(organizationId: number) {
        await this.organizationRepository.delete(organizationId);
    }

    async removeMemberFromOrganization(organizationId: number, userId: number) {
        const organizationUser = await this.organizationUserRepository.findOne({
            where: { userId,  organizationId },
        });

        if(organizationUser) {
            await this.organizationUserRepository.delete(organizationUser);
        } else {
            throw new RpcException(new NotFoundException({
                en: "Member not found !",
                fr: "Utilisateur non trouvé !"
            }));
        }
    }

    async createOrganization(organizationToCreate: CreateOrganizationDto) {
        const organization = new Organization();
        organization.name = organizationToCreate.name;
        const savedOrganization = await this.organizationRepository.save(organization);
        if (organizationToCreate.memberIds) {
            for (const memberId of organizationToCreate.memberIds) {
                const organizationUser = new OrganizationUser();
                organizationUser.userId = memberId;
                organizationUser.organizationId = savedOrganization.id;
                await this.organizationUserRepository.save(organizationUser);
            }
        }
        return this.getOrganization(savedOrganization.id);
    }
}
