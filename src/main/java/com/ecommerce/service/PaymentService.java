package com.ecommerce.service;

import com.ecommerce.dto.PaymentResponse;

public interface PaymentService {
    PaymentResponse processPayment(Long orderId);
    PaymentResponse getPaymentByOrder(Long orderId);
}
