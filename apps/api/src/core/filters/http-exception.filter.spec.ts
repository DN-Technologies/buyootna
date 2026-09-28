import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  // Translation is a pass-through here: returns the default (original) text
  const i18n = {
    translate: jest.fn((_key: string, opts: { defaultValue: string }) =>
      Promise.resolve(opts.defaultValue),
    ),
  } as unknown as I18nService;
  const filter = new HttpExceptionFilter(i18n);

  const run = async (exception: HttpException) => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    };
    const host = {
      switchToHttp: () => ({
        getResponse: () => res,
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ArgumentsHost;
    await filter.catch(exception, host);
    return {
      status: (res.status.mock.calls[0] as [number])[0],
      body: (res.json.mock.calls[0] as [Record<string, unknown>])[0],
      setHeader: res.setHeader,
    };
  };

  it('keeps the OTP rate limiter code and retryAfter, and sets Retry-After', async () => {
    const { status, body, setHeader } = await run(
      new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'يرجى الانتظار 120 ثانية قبل طلب رمز تحقق جديد',
          code: 'OTP_COOLDOWN',
          retryAfter: 120,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      ),
    );

    expect(status).toBe(429);
    expect(body).toEqual({
      statusCode: 429,
      message: 'يرجى الانتظار 120 ثانية قبل طلب رمز تحقق جديد',
      error: 'HttpException',
      code: 'OTP_COOLDOWN',
      retryAfter: 120,
    });
    expect(setHeader).toHaveBeenCalledWith('Retry-After', '120');
  });

  it('keeps the old shape for plain string exceptions', async () => {
    const { body, setHeader } = await run(
      new UnauthorizedException('غير مصرح'),
    );

    expect(body).toEqual({
      statusCode: 401,
      message: 'غير مصرح',
      error: 'UnauthorizedException',
    });
    expect(setHeader).not.toHaveBeenCalled();
  });

  it('still translates validation message arrays', async () => {
    const { body } = await run(
      new BadRequestException(['email must be an email']),
    );

    expect(body.message).toEqual(['email must be an email']);
    expect(i18n.translate).toHaveBeenCalledWith(
      'errors.email_must_be_an_email',
      expect.anything(),
    );
  });

  it('never lets the payload override statusCode or error', async () => {
    const { status, body } = await run(
      new HttpException(
        { statusCode: 200, error: 'Fine', message: 'boom', code: 'X' },
        HttpStatus.BAD_REQUEST,
      ),
    );

    expect(status).toBe(400);
    expect(body).toMatchObject({
      statusCode: 400,
      error: 'HttpException',
      code: 'X',
    });
  });
});
