import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: any, res: any, next: () => void): void {
        const { method, originalUrl } = req;
        const startTime = Date.now();

        res.on('finish', () => {
            const { statusCode } = res;
            const duration = Date.now() - startTime;
            this.logger.log(`${method} ${originalUrl} - ${statusCode} [${duration}ms]`);
        });

        next();
    }
}