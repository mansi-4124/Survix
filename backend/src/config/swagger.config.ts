import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Survix API')
    .setDescription('Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const doc = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, doc);
  fs.writeFileSync('./openapi.json', JSON.stringify(doc));
}
