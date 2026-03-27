import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CommonModule } from './common/common.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { OrganizationsModule } from './modules/organizations/organizations.module.js';
import { MembershipsModule } from './modules/memberships/memberships.module.js';
import { ClientsModule } from './modules/clients/clients.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    OrganizationsModule,
    MembershipsModule,
    ClientsModule,
    ProjectsModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
