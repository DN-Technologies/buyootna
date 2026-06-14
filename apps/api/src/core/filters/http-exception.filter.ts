import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[] = '';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const resObj = exceptionResponse as { message?: string | string[] };
      message = resObj.message ?? exception.message;
    } else {
      message = exception.message;
    }

    // Determine target locale (from header 'accept-language' or default to 'ar')
    const acceptLang = request.headers['accept-language'];
    const lang = acceptLang ? acceptLang.split(',')[0] : 'ar';

    const translate = async (msg: string): Promise<string> => {
      const cleaned = msg.trim();

      // Convert translation string to a key friendly format (e.g. "email must be an email" -> "email_must_be_an_email")
      const keySuffix = cleaned
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/\./g, '');
      const translationKey = `errors.${keySuffix}`;

      try {
        const translated = await this.i18n.translate(translationKey, {
          lang,
          defaultValue: cleaned,
        });
        return translated as string;
      } catch {
        return cleaned;
      }
    };

    let translatedMessage: string | string[];

    if (Array.isArray(message)) {
      translatedMessage = await Promise.all(
        message.map((msg) => translate(msg)),
      );
    } else {
      translatedMessage = await translate(message);
    }

    response.status(status).json({
      statusCode: status,
      message: translatedMessage,
      error: exception.name,
    });
  }
}
