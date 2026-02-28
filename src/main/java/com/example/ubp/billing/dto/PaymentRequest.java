package com.example.ubp.billing.dto;

import com.example.ubp.billing.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull
    private Long invoiceId;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private PaymentMethod method;
}
