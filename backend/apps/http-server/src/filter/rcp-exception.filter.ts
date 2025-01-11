import { BadRequestException, ForbiddenException, UnauthorizedException, NotFoundException, ConflictException, InternalServerErrorException } from "@nestjs/common";

export const rpcExceptionFilter = (err: any) => {
    switch(err.status) {
        case 400:
            throw new BadRequestException(err.response);
        case 401:
            throw new UnauthorizedException(err.response);
        case 403:
            throw new ForbiddenException(err.response);
        case 404:
            throw new NotFoundException(err.response);
        case 409:
            throw new ConflictException(err.response);
        case 500:
            throw new InternalServerErrorException(err.response);
    }
}