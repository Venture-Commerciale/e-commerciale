package com.ecommerce.controller;

import com.ecommerce.dto.PaymentResponse;
import com.ecommerce.service.PaymentService;
import com.ecommerce.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> pay(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("Payment processed", paymentService.processPayment(orderId)));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("Payment fetched", paymentService.getPaymentByOrder(orderId)));
    }
}
