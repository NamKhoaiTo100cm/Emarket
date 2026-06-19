import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private cartService: CartService) { }

    /** GET /cart — lấy toàn bộ giỏ hàng của user đang login */
    @Get()
    getCart(@Req() req) {
        return this.cartService.getCart(req.user.id);
    }

    /** POST /cart — thêm sản phẩm vào giỏ */
    @Post()
    addToCart(
        @Body() body: { productId: number; variantId?: number; quantity?: number },
        @Req() req,
    ) {
        return this.cartService.addToCart(
            req.user.id,
            body.productId,
            body.variantId,
            body.quantity ?? 1,
        );
    }

    /** PATCH /cart/:id — cập nhật số lượng item */
    @Patch(':id')
    updateQuantity(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { quantity: number },
        @Req() req,
    ) {
        return this.cartService.updateQuantity(req.user.id, id, body.quantity);
    }

    /** DELETE /cart/:id — xóa 1 item */
    @Delete(':id')
    removeFromCart(@Param('id', ParseIntPipe) id: number, @Req() req) {
        return this.cartService.removeFromCart(req.user.id, id);
    }

    /** DELETE /cart — xóa toàn bộ giỏ hàng */
    @Delete()
    clearCart(@Req() req) {
        return this.cartService.clearCart(req.user.id);
    }
}
