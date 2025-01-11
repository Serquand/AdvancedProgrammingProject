import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthLibService } from "./auth-lib.service";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class IsLoggedInGuard implements CanActivate {
    constructor (private authLibService: AuthLibService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const data = context.switchToRpc().getData();
        if(!data || !data.authorization) throw new RpcException(new UnauthorizedException());

        const token = data.authorization.split("Bearer ")[1];

        if (!token) throw new RpcException(new UnauthorizedException());

        const user = this.authLibService.verifyToken(token);
        if (!user) {
            throw new RpcException(new UnauthorizedException());
        }

        data.user = user;

        return true;
    }
}

@Injectable()
export class IsAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const data = context.switchToRpc().getData();
        const user = data.user;
        if(user.role !== "admin") throw new RpcException(new ForbiddenException("Permission not granted !"));
        return true;
    }
}

@Injectable()
export class IsTeacherGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const data = context.switchToRpc().getData();
        const user = data.user;
        if(user.role !== "teacher") throw new RpcException(new ForbiddenException("Permission not granted !"));
        return true;
    }
}

@Injectable()
export class IsStudentGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const data = context.switchToRpc().getData();
        const user = data.user;
        if(user.role !== "student") throw new RpcException(new ForbiddenException("Permission not granted !"));
        return true;
    }
}