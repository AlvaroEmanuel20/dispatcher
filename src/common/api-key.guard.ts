import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeyService } from '../api-key/api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (!token || type !== 'Bearer') {
      throw new UnauthorizedException();
    }

    try {
      const { isValid, applicationId, apiKeyId } =
        await this.apiKeyService.isApiKeyValid(token);

      if (!isValid || !applicationId) {
        throw new UnauthorizedException();
      }

      request['application'] = applicationId;

      void this.apiKeyService.updateLastUsed(apiKeyId);

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
