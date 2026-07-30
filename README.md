# Projet : dashboard de surveillance d’URL

## Fonctionnalités finales

L’application permettra de :

* ajouter une URL à surveiller ;
* modifier son nom ou son URL ;
* supprimer une surveillance ;
* lancer une vérification manuelle ;
* afficher `ONLINE`, `OFFLINE` ou `UNKNOWN` ;
* mesurer le temps de réponse en millisecondes ;
* afficher le code HTTP ;
* vérifier automatiquement les services toutes les cinq minutes.

## Stack

### Backend

* NestJS
* TypeORM
* MySQL
* `mysql2`
* Axios
* `@nestjs/schedule`
* `class-validator`

NestJS propose une intégration officielle avec TypeORM via `@nestjs/typeorm`. Pour MySQL, la documentation recommande notamment le pilote `mysql2`. ([NestJS Documentation][1])

### Frontend

* React
* TypeScript
* Vite
* Axios
* TanStack Query
* React Router

## Architecture

```text
monitoring/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── types/
│       └── App.tsx
├── src/
│   ├── monitors/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── monitors.controller.ts
│   │   ├── monitors.service.ts
│   │   └── monitors.module.ts
│   ├── app.module.ts
│   └── main.ts
└── docker-compose.yml
```

---

# Jour 1 — NestJS, React et MySQL

## 1. Créer le backend

```bash
nest new .
```

Installer TypeORM et MySQL :

```bash
npm install @nestjs/typeorm typeorm mysql2
npm install @nestjs/config
npm install class-validator class-transformer
```

L’intégration NestJS repose ensuite sur `TypeOrmModule`, avec des repositories propres à chaque entité. ([NestJS Documentation][1])

## 2. MySQL

Créer un fichier `.env` :

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=monitoring

FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 3. Configurer TypeORM

Dans `app.module.ts` :

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.get('DB_PORT') ?? 3306),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),

        autoLoadEntities: true,

        // Uniquement pour le développement
        synchronize:
          configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
  ],
})
export class AppModule {}
```

`synchronize: true` est pratique pour apprendre et créer automatiquement les tables, mais ne doit pas être utilisé en production, car une synchronisation peut entraîner une perte de données. ([NestJS Documentation][1])

## 4. Créer le frontend

```bash
npm create vite@latest client -- --template react-ts
cd client
npm install
npm install axios react-router-dom @tanstack/react-query
```

### Résultat du jour 1

* NestJS démarre sur le port `3000` ;
* React démarre sur le port `5173` ;
* MySQL fonctionne ;
* TypeORM se connecte correctement à MySQL.

---

# Jour 2 — Entité TypeORM et CRUD

## 1. Générer le module

Depuis le backend :

```bash
nest generate module monitors
nest generate controller monitors
nest generate service monitors
```

## 2. Créer l’énumération de statut

`monitors/entities/monitor-status.enum.ts` :

```ts
export enum MonitorStatus {
  UNKNOWN = 'UNKNOWN',
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}
```

## 3. Créer l’entité TypeORM

`monitors/entities/monitor.entity.ts` :

```ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MonitorStatus } from './monitor-status.enum';

@Entity('monitors')
export class Monitor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 2048,
    unique: true,
  })
  url: string;

  @Column({
    type: 'enum',
    enum: MonitorStatus,
    default: MonitorStatus.UNKNOWN,
  })
  status: MonitorStatus;

  @Column({
    type: 'int',
    nullable: true,
  })
  responseTime: number | null;

  @Column({
    type: 'smallint',
    nullable: true,
  })
  statusCode: number | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  lastError: string | null;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  lastCheckedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

TypeORM prend en charge MySQL, les entités, les colonnes `enum` et l’utilisation de repositories pour manipuler une entité précise. ([typeorm.io][2])

## 4. Enregistrer l’entité

`monitors.module.ts` :

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Monitor } from './entities/monitor.entity';
import { MonitorsController } from './monitors.controller';
import { MonitorsService } from './monitors.service';

@Module({
  imports: [TypeOrmModule.forFeature([Monitor])],
  controllers: [MonitorsController],
  providers: [MonitorsService],
  exports: [MonitorsService],
})
export class MonitorsModule {}
```

Ajouter ensuite `MonitorsModule` dans `AppModule`.

## 5. Créer les DTO

`create-monitor.dto.ts` :

```ts
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateMonitorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(2048)
  url: string;
}
```

`update-monitor.dto.ts` :

```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMonitorDto } from './create-monitor.dto';

export class UpdateMonitorDto extends PartialType(CreateMonitorDto) {}
```

Installer le package utilisé par `PartialType` :

```bash
npm install @nestjs/mapped-types
```

## 6. Routes à créer

```http
GET    /monitors
GET    /monitors/:id
POST   /monitors
PATCH  /monitors/:id
DELETE /monitors/:id
```

### Résultat du jour 2

Tu dois pouvoir tester le CRUD avec Bruno, Postman ou Insomnia.

---

# Jour 3 — Vérification de l’état et du temps de réponse

## 1. Installer Axios pour NestJS

```bash
npm install @nestjs/axios axios
```

Ajouter `HttpModule` dans `MonitorsModule` :

```ts
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Monitor]),

    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
  ],
})
export class MonitorsModule {}
```

NestJS expose Axios avec `HttpModule` et `HttpService`. Il est également possible d’accéder directement à l’instance Axios avec `httpService.axiosRef`. ([NestJS Documentation][3])

## 2. Injecter le repository

Dans `monitors.service.ts` :

```ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Monitor } from './entities/monitor.entity';
import { MonitorStatus } from './entities/monitor-status.enum';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

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

  async update(
    id: number,
    dto: UpdateMonitorDto,
  ): Promise<Monitor> {
    const monitor = await this.monitorRepository.preload({
      id,
      ...dto,
    });

    if (!monitor) {
      throw new NotFoundException(`Le service ${id} n'existe pas`);
    }

    // Une nouvelle URL doit être revérifiée
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
}
```

## 3. Ajouter la vérification

Toujours dans `monitors.service.ts` :

```ts
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

    /*
     * 200 à 499 :
     * le serveur répond, il est donc considéré comme accessible.
     *
     * 500 et plus :
     * le serveur répond, mais l'application est considérée indisponible.
     */
    const isOnline =
      response.status >= 200 && response.status < 500;

    monitor.status = isOnline
      ? MonitorStatus.ONLINE
      : MonitorStatus.OFFLINE;

    monitor.responseTime = responseTime;
    monitor.statusCode = response.status;
    monitor.lastCheckedAt = new Date();
    monitor.lastError = isOnline
      ? null
      : `Erreur HTTP ${response.status}`;
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
```

## 4. Ajouter la route

Dans `monitors.controller.ts` :

```ts
import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

@Post(':id/check')
check(@Param('id', ParseIntPipe) id: number) {
  return this.monitorsService.check(id);
}
```

Route obtenue :

```http
POST /monitors/1/check
```

Exemple de réponse :

```json
{
  "id": 1,
  "name": "Portfolio",
  "url": "https://addrien.fr",
  "status": "ONLINE",
  "responseTime": 184,
  "statusCode": 200,
  "lastError": null,
  "lastCheckedAt": "2026-07-30T10:30:00.000Z"
}
```

### Résultat du jour 3

* une URL accessible devient `ONLINE` ;
* une URL inaccessible devient `OFFLINE` ;
* le temps de réponse est enregistré ;
* le code HTTP est enregistré ;
* les erreurs et timeouts sont enregistrés.

---

# Jour 4 — Dashboard React

## 1. Créer le type TypeScript

`src/types/monitor.ts` :

```ts
export type MonitorStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'UNKNOWN';

export interface Monitor {
  id: number;
  name: string;
  url: string;
  status: MonitorStatus;
  responseTime: number | null;
  statusCode: number | null;
  lastError: string | null;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorPayload {
  name: string;
  url: string;
}
```

## 2. Créer le service Axios

`src/services/monitorApi.ts` :

```ts
import axios from 'axios';
import type {
  Monitor,
  MonitorPayload,
} from '../types/monitor';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10_000,
});

export async function getMonitors(): Promise<Monitor[]> {
  const response = await api.get<Monitor[]>('/monitors');
  return response.data;
}

export async function createMonitor(
  payload: MonitorPayload,
): Promise<Monitor> {
  const response = await api.post<Monitor>(
    '/monitors',
    payload,
  );

  return response.data;
}

export async function updateMonitor(
  id: number,
  payload: MonitorPayload,
): Promise<Monitor> {
  const response = await api.patch<Monitor>(
    `/monitors/${id}`,
    payload,
  );

  return response.data;
}

export async function deleteMonitor(id: number): Promise<void> {
  await api.delete(`/monitors/${id}`);
}

export async function checkMonitor(id: number): Promise<Monitor> {
  const response = await api.post<Monitor>(
    `/monitors/${id}/check`,
  );

  return response.data;
}
```

## 3. Créer les composants

```text
src/components/
├── MonitorCard.tsx
├── MonitorForm.tsx
├── StatusBadge.tsx
├── SummaryCard.tsx
└── ConfirmModal.tsx
```

Chaque carte affichera :

```text
Portfolio
https://addrien.fr

● En ligne

Temps de réponse : 184 ms
Code HTTP : 200
Dernière vérification : 30/07/2026 à 12:30

[Vérifier] [Modifier] [Supprimer]
```

### Résultat du jour 4

Tous les services présents dans MySQL sont affichés dans React.

---

# Jour 5 — Ajout, modification et suppression

## Pages à créer

```text
src/pages/
├── DashboardPage.tsx
├── CreateMonitorPage.tsx
└── EditMonitorPage.tsx
```

## Formulaire

Champs :

```text
Nom du service
URL du service
```

Exemple :

```text
Nom : Portfolio
URL : https://addrien.fr
```

## Actions avec TanStack Query

Créer les mutations pour :

* `createMonitor()` ;
* `updateMonitor()` ;
* `deleteMonitor()` ;
* `checkMonitor()`.

Après chaque mutation, invalider la requête :

```ts
queryClient.invalidateQueries({
  queryKey: ['monitors'],
});
```

## CORS NestJS

Dans `main.ts` :

```ts
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.getOrThrow<string>('FRONTEND_URL'),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(
    Number(configService.get('PORT') ?? 3000),
  );
}

bootstrap();
```

### Résultat du jour 5

Depuis React, tu peux :

* ajouter une URL ;
* modifier une URL ;
* supprimer une URL ;
* déclencher une vérification ;
* afficher le nouvel état immédiatement.

---

# Jour 6 — Vérification automatique

## 1. Installer le scheduler

```bash
npm install @nestjs/schedule
```

Ajouter dans `AppModule` :

```ts
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
```

Le module `@nestjs/schedule` permet de déclarer des tâches périodiques avec `@Cron` et `CronExpression`. ([NestJS Documentation][4])

## 2. Vérifier tous les services

Dans `MonitorsService` :

```ts
import {
  Cron,
  CronExpression,
} from '@nestjs/schedule';

@Cron(CronExpression.EVERY_5_MINUTES)
async checkAll(): Promise<void> {
  const monitors = await this.monitorRepository.find({
    select: {
      id: true,
    },
  });

  await Promise.allSettled(
    monitors.map((monitor) => this.check(monitor.id)),
  );
}
```

## 3. Ajouter une route manuelle globale

```ts
@Post('check-all')
async checkAll() {
  await this.monitorsService.checkAll();

  return {
    message: 'Tous les services ont été vérifiés',
  };
}
```

Attention à placer cette route avant `POST /monitors/:id/check` ou à bien utiliser `ParseIntPipe`, pour éviter que `check-all` soit interprété comme un identifiant.

## 4. Actualiser automatiquement React

```ts
const monitorsQuery = useQuery({
  queryKey: ['monitors'],
  queryFn: getMonitors,
  refetchInterval: 30_000,
});
```

## Statistiques du dashboard

Afficher :

```text
Services surveillés : 5
En ligne : 3
Hors ligne : 1
Non vérifiés : 1
Temps moyen : 172 ms
```

Calcul du temps moyen :

```ts
const measuredMonitors = monitors.filter(
  (monitor) => monitor.responseTime !== null,
);

const averageResponseTime =
  measuredMonitors.length === 0
    ? null
    : Math.round(
        measuredMonitors.reduce(
          (total, monitor) =>
            total + (monitor.responseTime ?? 0),
          0,
        ) / measuredMonitors.length,
      );
```

### Résultat du jour 6

Les services sont automatiquement vérifiés toutes les cinq minutes et React récupère régulièrement les nouveaux résultats.

---

# Jour 7 — Finitions, Docker et sécurité

## 1. Améliorer l’interface

Ajouter :

* un badge vert pour `ONLINE` ;
* un badge rouge pour `OFFLINE` ;
* un badge gris pour `UNKNOWN` ;
* un chargement individuel pendant une vérification ;
* une confirmation avant suppression ;
* un message lorsque la liste est vide ;
* un bouton `Tout vérifier` ;
* un lien permettant d’ouvrir le service dans un nouvel onglet.

## 2. Tests à effectuer

Tester les cas suivants :

```text
URL accessible
URL qui renvoie 404
URL qui renvoie 500
Domaine inexistant
Connexion refusée
Requête dépassant cinq secondes
Modification d'une URL
Suppression d'une URL
URL déjà enregistrée
URL sans http:// ou https://
```

## 3. Désactiver `synchronize` en production

Configuration finale :

```ts
synchronize: false,
```

Puis gérer les modifications de la base avec des migrations TypeORM.

## 4. Sécuriser les URLs

Ton backend effectue une requête vers une URL fournie par un utilisateur. Sans protection, cela peut créer une vulnérabilité SSRF permettant de tenter d’atteindre des services internes.

Avant une mise en production, il faudra notamment :

* autoriser uniquement `http` et `https` ;
* bloquer `localhost` ;
* bloquer les adresses privées comme `127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12` et `192.168.0.0/16` ;
* contrôler l’adresse après résolution DNS ;
* limiter ou désactiver les redirections ;
* limiter le délai et la taille des réponses.

OWASP recommande notamment l’allowlist lorsque les destinations sont connues et rappelle qu’une URL utilisateur peut être détournée pour accéder au réseau interne ou aux services de métadonnées cloud. ([OWASP Cheat Sheet Series][5])

Pour un projet uniquement local et personnel, tu peux commencer sans implémenter toute cette protection, mais elle doit apparaître dans la partie « limites et sécurité » du README.

---

# Résultat attendu après sept jours

```text
✅ API NestJS
✅ TypeORM
✅ Base de données MySQL
✅ Entité Monitor
✅ Repository TypeORM
✅ Ajout d'une URL
✅ Modification d'une URL
✅ Suppression d'une URL
✅ Statut ONLINE / OFFLINE / UNKNOWN
✅ Temps de réponse
✅ Code HTTP
✅ Dernière date de vérification
✅ Vérification manuelle
✅ Vérification automatique
✅ Dashboard React TypeScript
✅ Validation des données
✅ Gestion des erreurs
✅ Statistiques globales
```

[1]: https://docs.nestjs.com/techniques/database "Database | NestJS - A progressive Node.js framework"
[2]: https://typeorm.io/docs/drivers/mysql/ "MySQL / MariaDB | TypeORM"
[3]: https://docs.nestjs.com/techniques/http-module?utm_source=chatgpt.com "HTTP module | NestJS - A progressive Node.js framework"
[4]: https://docs.nestjs.com/techniques/task-scheduling?utm_source=chatgpt.com "Task Scheduling | NestJS - A progressive Node.js framework"
[5]: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html?utm_source=chatgpt.com "Server Side Request Forgery Prevention - OWASP Cheat Sheet Series"
