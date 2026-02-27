package com.ecommerce.service;

import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.dto.CartResponse;

public interface CartService {
    CartResponse getMyCart();
    CartResponse addItem(CartItemRequest request);
    CartResponse removeItem(Long productId);
    void clearCart();
}
