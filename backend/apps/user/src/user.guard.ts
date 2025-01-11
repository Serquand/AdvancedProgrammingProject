import { User, UserRoles } from "@common";
import { BadRequestException, CanActivate, ConflictException, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { Observable } from "rxjs";
import { Repository } from "typeorm";

@Injectable()
export class EmailAlreadyUsedGuard implements CanActivate {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const data = context.switchToRpc().getData();
        const email = data.createUserInformations.email;
        if (!email) throw new RpcException(new BadRequestException({
            en: "Email is missing !",
            fr: "Adresse email manquante !"
        }));

        const userFound = await this.userRepository.count({ where: { email } });
        if (userFound) throw new RpcException(new ConflictException({
            en: "An user with that email already exists !",
            fr: "Un utilisateur avec cette adresse email existe déjà !"
        }));

        return true;
    }
}

@Injectable()
export class HasNoAdminRegisteredYet implements CanActivate {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

    async canActivate(): Promise<boolean> {
        const numberOfAdminFound = await this.userRepository.count({ where: { role: UserRoles.ADMIN } });
        if (numberOfAdminFound > 0) throw new RpcException(new ForbiddenException());
        else return true;
    }
}

@Injectable()
export class AdminCannotUpdateHimself implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const data = context.switchToRpc().getData();
        const requestInitiatorId = data.user.userId;
        if (requestInitiatorId === data.userId) {
            throw new RpcException(new BadRequestException({
                en: "You can't make this action on your own profile!",
                fr: "Vous ne pouvez pas réaliser cela sur votre propre profil !"
            }));
        }
        return true;
    }
}