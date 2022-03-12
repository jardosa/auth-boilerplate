import { cleanEnv, str, port } from 'envalid';

const config = cleanEnv(process.env, {
  MONGODB_URI: str({ default: 'mongodb://localhost:27017/auth' }),
  NODE_ENV: str({ default: 'development' }),
  PORT: port({ default: 7000 }),
  JWT_SECRET: str({ default: 'Secret!' }),
  ACCESS_TOKEN_SECRET: str({ default: 'at-secret' }),
  REFRESH_TOKEN_SECRET: str({ default: 'rt-secret' }),
});

export default config;
