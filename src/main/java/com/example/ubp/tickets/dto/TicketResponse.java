package com.example.ubp.tickets.dto;

import com.example.ubp.tickets.model.TicketPriority;
import com.example.ubp.tickets.model.TicketStatus;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private String subject;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;
    private Long customerId;
    private Long assignedToId;
    private Instant createdAt;
    private Instant updatedAt;
}
