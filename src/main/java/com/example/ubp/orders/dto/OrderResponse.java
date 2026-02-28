package com.example.ubp.orders.dto;

import com.example.ubp.orders.model.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long customerId;
    private OrderStatus status;
    private BigDecimal total;
    private Instant createdAt;
    private List<OrderItemResponse> items;
}
