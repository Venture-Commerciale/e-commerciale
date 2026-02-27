package com.ecommerce.controller;

import com.ecommerce.dto.OrderResponse;
import com.ecommerce.service.OrderService;
import com.ecommerce.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder() {
        return ResponseEntity.ok(ApiResponse.success("Order placed", orderService.placeOrder()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders() {
        return ResponseEntity.ok(ApiResponse.success("Orders fetched", orderService.getMyOrders()));
    }
}
