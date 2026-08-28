import { ConfigService } from '@nestjs/config';
import { Params } from 'nestjs-pino';

export function getPinoLoggerConfig(configService: ConfigService): Params {
  return {
    pinoHttp: {
      level: configService.get('LOG_LEVEL', 'info'),
      transport:
        configService.get('NODE_ENV') === 'production'
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
              },
            },
      autoLogging: true,
      redact: {
        paths: [
          'req.headers.authorization',
          'email',
          'emails',
          'to',
          '*.email',
        ],
        censor: '****',
      },
    },
  };
}
