package com.example.ubp.tickets.dto;

import com.example.ubp.tickets.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketRequest {
    @NotBlank
    private String subject;

    @NotBlank
    private String description;

    @NotNull
    private TicketPriority priority;
}
