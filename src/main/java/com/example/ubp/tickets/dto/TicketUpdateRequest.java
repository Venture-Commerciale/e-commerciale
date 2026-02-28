package com.example.ubp.tickets.dto;

import com.example.ubp.tickets.model.TicketPriority;
import com.example.ubp.tickets.model.TicketStatus;
import lombok.Data;

@Data
public class TicketUpdateRequest {
    private TicketStatus status;
    private TicketPriority priority;
    private Long assignedToId;
}
