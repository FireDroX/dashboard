import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMonitorDto } from './create-monitor.dto';
import { Monitor } from './entities/monitor.entity';
import { UpdateMonitorDto } from './update-monitor.dto';

@Injectable()
export class MonitorsService {
  constructor(
    @InjectRepository(Monitor)
    private readonly monitorRepository: Repository<Monitor>,
  ) {}

  create(dto: CreateMonitorDto): Promise<Monitor> {
    const monitor = this.monitorRepository.create(dto);

    return this.monitorRepository.save(monitor);
  }

  findAll(): Promise<Monitor[]> {
    return this.monitorRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Monitor> {
    const monitor = await this.monitorRepository.findOneBy({ id });

    if (!monitor) {
      throw new NotFoundException(`Le monitor ${id} n'existe pas`);
    }

    return monitor;
  }

  async update(id: number, dto: UpdateMonitorDto): Promise<Monitor> {
    const monitor = await this.monitorRepository.preload({
      id,
      ...dto,
    });

    if (!monitor) {
      throw new NotFoundException(`Le monitor ${id} n'existe pas`);
    }

    return this.monitorRepository.save(monitor);
  }

  async remove(id: number): Promise<void> {
    const monitor = await this.findOne(id);

    await this.monitorRepository.remove(monitor);
  }
}
