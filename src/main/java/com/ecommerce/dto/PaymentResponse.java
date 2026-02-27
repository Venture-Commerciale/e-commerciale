package com.ecommerce.dto;

import com.ecommerce.entity.PaymentStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PaymentResponse {
    private Long paymentId;
    private Long orderId;
    private String transactionRef;
    private PaymentStatus status;
}
