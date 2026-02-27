package com.ecommerce.service;

import com.ecommerce.dto.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse placeOrder();
    List<OrderResponse> getMyOrders();
}
