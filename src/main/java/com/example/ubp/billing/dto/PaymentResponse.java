package com.example.ubp.billing.dto;

import com.example.ubp.billing.model.PaymentMethod;
import com.example.ubp.billing.model.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long invoiceId;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private Instant createdAt;
}
