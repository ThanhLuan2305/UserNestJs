import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import {
  CreateUserParams,
  CreateUserPostParams,
  CreateUserProfileParams,
  UpdateUserParams,
} from '../../../utils/types';
import { Repository } from 'typeorm';
import { Profile } from 'src/typeorm/entities/Profile';
import { CreateUserProfileDto } from 'src/users/dtos/CreateUserProfile.dto';
import { Post } from 'src/typeorm/entities/Post';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
  ) {}
  findUsers() {
    return this.userRepository.find({ relations: ['profile'] });
  }

  findUserById(id: number) {
    return this.userRepository.findBy({ id });
  }

  createUser(userDetails: CreateUserParams) {
    const newUser = this.userRepository.create({
      ...userDetails,
      createdAt: new Date(),
    });
    this.userRepository.save(newUser);
  }

  updateUser(id: number, updateUserDetails: UpdateUserParams) {
    this.userRepository.update({ id }, { ...updateUserDetails });
  }

  deleteUser(id: number) {
    return this.userRepository.delete({ id });
  }

  async createUserProfile(
    id: number,
    createUserProfileDetails: CreateUserProfileParams,
  ) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user)
      throw new HttpException(
        'User not found. Cannot create profile',
        HttpStatus.BAD_REQUEST,
      );

    const newProfile = this.profileRepository.create(createUserProfileDetails);
    const saveProfile = await this.profileRepository.save(newProfile);
    user.profile = saveProfile;
    return this.userRepository.save(user);
  }

  async createUserPost(
    id: number,
    createUserPostDetails: CreateUserPostParams,
  ) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user)
      throw new HttpException(
        'User not found. Cannot create profile',
        HttpStatus.BAD_REQUEST,
      );
    const newPost = this.postRepository.create({
      ...createUserPostDetails,
      user,
    });
    return this.postRepository.save(newPost);
  }
}
