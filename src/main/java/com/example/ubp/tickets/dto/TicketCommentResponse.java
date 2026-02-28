package com.example.ubp.tickets.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketCommentResponse {
    private Long id;
    private Long ticketId;
    private Long authorId;
    private String body;
    private Instant createdAt;
}
