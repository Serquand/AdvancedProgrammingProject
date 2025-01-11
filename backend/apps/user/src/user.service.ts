import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto, User, UserRoles } from '@common';
import { RpcException } from '@nestjs/microservices';
import { AuthLibService } from '@app/auth-lib';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		private authLibService: AuthLibService
	) { }

	async findAll(roles?: UserRoles[]) {
		if(roles) return this.userRepository.find({ where: { role: In(roles) } });
		return this.userRepository.find();
	}

	async registerUser(userToAdd: CreateUserDto) {
		const userToSave = { ...userToAdd };
		const hashedPassword = await this.authLibService.hashPassword(userToAdd.password);
		userToSave.password = hashedPassword;

		try {
			const { password, ...newUser } = await this.userRepository.save(userToSave); // eslint-disable-line
			return newUser;
		} catch {
			throw new RpcException(new InternalServerErrorException("Something went wrong"));
		}
	}

	async deleteUser(userId: number) {
		try {
			return await this.userRepository.delete({ id: userId });
		} catch {
			throw new RpcException(new InternalServerErrorException("Something went wrong !"));
		}
	}

	async getUserById(id: number) {
		return this.userRepository.findOne({ where: { id } });
	}

	async updateUser(userId: number, newUser: UpdateUserDto) {
		try {
			await this.userRepository.update(userId, newUser);
		} catch {
			throw new RpcException(new NotFoundException({
				en: "User not found!",
				fr: "Utilisateur non trouvé !"
			}))
		}
	}

	async getUserByEmail(email: string, alsoSelectPassword: boolean = false): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { email }, select: {
				password: alsoSelectPassword, email: true, firstName: true, id: true, lastName: true, role: true
			}
		});
		if (!user) {
			throw new RpcException(new NotFoundException({
				en: 'Email not found!',
				fr: "Adresse email non trouvé !"
			}));
		} else {
			return user;
		}
	}
}