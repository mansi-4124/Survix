/**
 * Generates backend/openapi.json from Swagger/OpenAPI spec.
 * Requires: npm run build (to have dist/ ready)
 * Run: node scripts/generate-openapi.mjs
 */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const { AppModule } = require('../dist/src/app.module.js');

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const config = new DocumentBuilder()
    .setTitle('Survix API')
    .setDescription('Backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  const outPath = path.join(path.dirname(__dirname), 'openapi.json');
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2), 'utf-8');
  await app.close();
  console.log('Written to', outPath);
}

generate().catch((e) => {
  console.error(e);
  process.exit(1);
});
