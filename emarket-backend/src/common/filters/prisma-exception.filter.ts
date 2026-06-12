// src/common/filters/prisma-exception.filter.ts
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        switch (exception.code) {
            case 'P2002': // unique constraint
                status = HttpStatus.CONFLICT;
                message = 'Dữ liệu đã tồn tại';
                break;

            case 'P2025': // record not found
                status = HttpStatus.NOT_FOUND;
                message = 'Không tìm thấy dữ liệu';
                break;

            case 'P2003': // foreign key constraint
                status = HttpStatus.BAD_REQUEST;
                message = 'Lỗi ràng buộc dữ liệu';
                break;

            case 'P2014': // relation violation (1-1, 1-n)
                status = HttpStatus.CONFLICT;
                message = 'Vi phạm ràng buộc quan hệ';
                break;

            case 'P2000': // value too long
                status = HttpStatus.BAD_REQUEST;
                message = 'Dữ liệu vượt quá độ dài cho phép';
                break;

            case 'P2006': // invalid value
                status = HttpStatus.BAD_REQUEST;
                message = 'Giá trị không hợp lệ';
                break;

            default:
                status = HttpStatus.INTERNAL_SERVER_ERROR;
                message = `Lỗi database: ${exception.code}`;
                break;
        }

        response.status(status).json({
            statusCode: status,
            message,
            ...(process.env.NODE_ENV === 'development' && {
                code: exception.code,
                meta: exception.meta,
            }),
        });
    }
}