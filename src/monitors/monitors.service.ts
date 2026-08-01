import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMonitorDto } from './create-monitor.dto';
import { Monitor } from './entities/monitor.entity';
import { MonitorStatus } from './entities/monitor-status.enum';
import { UpdateMonitorDto } from './update-monitor.dto';

@Injectable()
export class MonitorsService {
  constructor(
    @InjectRepository(Monitor)
    private readonly monitorRepository: Repository<Monitor>,
    private readonly httpService: HttpService,
  ) {}

  async create(dto: CreateMonitorDto): Promise<Monitor> {
    const existingMonitor = await this.monitorRepository.findOneBy({
      url: dto.url,
    });

    if (existingMonitor) {
      throw new ConflictException('Cette URL est déjà surveillée');
    }

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
      throw new NotFoundException(`Le service ${id} n'existe pas`);
    }

    return monitor;
  }

  async update(id: number, dto: UpdateMonitorDto): Promise<Monitor> {
    const monitor = await this.monitorRepository.preload({
      id,
      ...dto,
    });

    if (!monitor) {
      throw new NotFoundException(`Le service ${id} n'existe pas`);
    }

    if (dto.url) {
      monitor.status = MonitorStatus.UNKNOWN;
      monitor.responseTime = null;
      monitor.statusCode = null;
      monitor.lastCheckedAt = null;
      monitor.lastError = null;
    }

    return this.monitorRepository.save(monitor);
  }

  async remove(id: number): Promise<void> {
    const monitor = await this.findOne(id);

    await this.monitorRepository.remove(monitor);
  }

  async check(id: number): Promise<Monitor> {
    const monitor = await this.findOne(id);
    const startTime = Date.now();

    try {
      const response = await this.httpService.axiosRef.get(monitor.url, {
        timeout: 5000,
        maxRedirects: 3,
        validateStatus: () => true,
      });

      const responseTime = Date.now() - startTime;

      const isOnline = response.status >= 200 && response.status < 500;

      monitor.status = isOnline ? MonitorStatus.ONLINE : MonitorStatus.OFFLINE;

      monitor.responseTime = responseTime;
      monitor.statusCode = response.status;
      monitor.lastCheckedAt = new Date();
      monitor.lastError = isOnline ? null : `Erreur HTTP ${response.status}`;
    } catch (error) {
      monitor.status = MonitorStatus.OFFLINE;
      monitor.responseTime = Date.now() - startTime;
      monitor.statusCode = null;
      monitor.lastCheckedAt = new Date();

      monitor.lastError =
        error instanceof Error
          ? error.message.substring(0, 255)
          : 'Erreur inconnue';
    }

    return this.monitorRepository.save(monitor);
  }
}
