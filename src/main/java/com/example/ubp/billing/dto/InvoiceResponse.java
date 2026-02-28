package com.example.ubp.billing.dto;

import com.example.ubp.billing.model.InvoiceStatus;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvoiceResponse {
    private Long id;
    private Long orderId;
    private String invoiceNo;
    private BigDecimal total;
    private InvoiceStatus status;
    private Instant createdAt;
}
