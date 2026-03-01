package com.example.ubp.orders.controller;

import com.example.ubp.auth.security.UserPrincipal;
import com.example.ubp.common.dto.ApiResponse;
import com.example.ubp.orders.dto.OrderRequest;
import com.example.ubp.orders.dto.OrderResponse;
import com.example.ubp.orders.dto.ProductResponse;
import com.example.ubp.orders.dto.UpdateOrderStatusRequest;
import com.example.ubp.orders.model.OrderStatus;
import com.example.ubp.orders.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/products")
    public ApiResponse<Page<ProductResponse>> listProducts(Pageable pageable) {
        return new ApiResponse<>(true, orderService.listProducts(pageable));
    }

    @PostMapping("/orders")
    public ApiResponse<OrderResponse> createOrder(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody OrderRequest request
    ) {
        return new ApiResponse<>(true, orderService.createOrder(principal, request));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN') or hasRole('CUSTOMER')")
    public ApiResponse<Page<OrderResponse>> listOrders(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) OrderStatus status,
        @RequestParam(required = false) Long customerId,
        Pageable pageable
    ) {
        return new ApiResponse<>(true, orderService.listOrders(principal, status, customerId, pageable));
    }

    @GetMapping("/orders/{id}")
    public ApiResponse<OrderResponse> getOrder(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        return new ApiResponse<>(true, orderService.getOrder(principal, id));
    }

    @PutMapping("/orders/{id}/status")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    public ApiResponse<OrderResponse> updateOrderStatus(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return new ApiResponse<>(true, orderService.updateStatus(principal, id, request));
    }
}
