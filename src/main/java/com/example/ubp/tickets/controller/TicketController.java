package com.example.ubp.tickets.controller;

import com.example.ubp.auth.security.UserPrincipal;
import com.example.ubp.common.dto.ApiResponse;
import com.example.ubp.tickets.dto.TicketCommentRequest;
import com.example.ubp.tickets.dto.TicketCommentResponse;
import com.example.ubp.tickets.dto.TicketRequest;
import com.example.ubp.tickets.dto.TicketResponse;
import com.example.ubp.tickets.dto.TicketUpdateRequest;
import com.example.ubp.tickets.model.TicketStatus;
import com.example.ubp.tickets.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ApiResponse<TicketResponse> createTicket(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody TicketRequest request
    ) {
        return new ApiResponse<>(true, ticketService.createTicket(principal, request));
    }

    @GetMapping
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN') or hasRole('CUSTOMER')")
    public ApiResponse<Page<TicketResponse>> listTickets(
        @AuthenticationPrincipal UserPrincipal principal,
        @RequestParam(required = false) TicketStatus status,
        @RequestParam(required = false) Long assignedToId,
        @RequestParam(required = false) Long customerId,
        Pageable pageable
    ) {
        return new ApiResponse<>(true, ticketService.listTickets(principal, status, assignedToId, customerId, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<TicketResponse> getTicket(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        return new ApiResponse<>(true, ticketService.getTicket(principal, id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN') or hasRole('CUSTOMER')")
    public ApiResponse<TicketResponse> updateTicket(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @RequestBody TicketUpdateRequest request
    ) {
        return new ApiResponse<>(true, ticketService.updateTicket(principal, id, request));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN') or hasRole('CUSTOMER')")
    public ApiResponse<TicketCommentResponse> addComment(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id,
        @Valid @RequestBody TicketCommentRequest request
    ) {
        return new ApiResponse<>(true, ticketService.addComment(principal, id, request));
    }
}
