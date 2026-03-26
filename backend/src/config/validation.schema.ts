import * as Joi from 'joi';

export default Joi.object({
  DATABASE_URL: Joi.string().required(),
  UPSTASH_REDIS_REST_URL: Joi.string().uri().required(),
  UPSTASH_REDIS_REST_TOKEN: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  REQUEST_TIMEOUT_MS: Joi.number().integer().min(1000).default(15000),
  EXPOSE_REFRESH_TOKEN_IN_BODY: Joi.boolean().default(false),
  GOOGLE_CLIENT_ID: Joi.string().allow('', null).default(''),
  EMAIL_SERVICE: Joi.string().default('gmail'),
  EMAIL_USER: Joi.string().allow('', null),
  EMAIL_PASSWORD: Joi.string().allow('', null),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  POLL_SURGE_THRESHOLD: Joi.number().integer().min(1).default(5),
  POLL_MOMENTUM_INTERVAL_MS: Joi.number().integer().min(1000).default(5000),
});
