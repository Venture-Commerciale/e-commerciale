package com.example.ubp.tickets.service;

import com.example.ubp.auth.model.User;
import com.example.ubp.auth.repo.UserRepository;
import com.example.ubp.auth.security.UserPrincipal;
import com.example.ubp.common.audit.AuditService;
import com.example.ubp.common.exception.ResourceNotFoundException;
import com.example.ubp.tickets.dto.TicketCommentRequest;
import com.example.ubp.tickets.dto.TicketCommentResponse;
import com.example.ubp.tickets.dto.TicketRequest;
import com.example.ubp.tickets.dto.TicketResponse;
import com.example.ubp.tickets.dto.TicketUpdateRequest;
import com.example.ubp.tickets.model.Ticket;
import com.example.ubp.tickets.model.TicketComment;
import com.example.ubp.tickets.model.TicketStatus;
import com.example.ubp.tickets.repo.TicketCommentRepository;
import com.example.ubp.tickets.repo.TicketRepository;
import java.time.Instant;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public TicketService(
        TicketRepository ticketRepository,
        TicketCommentRepository commentRepository,
        UserRepository userRepository,
        AuditService auditService
    ) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public TicketResponse createTicket(UserPrincipal principal, TicketRequest request) {
        Ticket ticket = new Ticket();
        ticket.setCustomer(principal.getUser());
        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticketRepository.save(ticket);
        auditService.log(principal.getUser(), "CREATE_TICKET", "Ticket", ticket.getId());
        return toResponse(ticket);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> listTickets(
        UserPrincipal principal,
        TicketStatus status,
        Long assignedToId,
        Pageable pageable
    ) {
        if (isStaff(principal)) {
            if (assignedToId != null) {
                User assignedTo = userRepository.findById(assignedToId)
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found"));
                return ticketRepository.findByAssignedTo(assignedTo, pageable).map(this::toResponse);
            }
            if (status != null) {
                return ticketRepository.findByStatus(status, pageable).map(this::toResponse);
            }
            return ticketRepository.findAll(pageable).map(this::toResponse);
        }

        return ticketRepository.findByCustomer(principal.getUser(), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicket(UserPrincipal principal, Long id) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        if (!isStaff(principal) && !ticket.getCustomer().getId().equals(principal.getUser().getId())) {
            throw new IllegalArgumentException("Not allowed to view this ticket");
        }
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse updateTicket(UserPrincipal principal, Long id, TicketUpdateRequest request) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (!isStaff(principal) && !ticket.getCustomer().getId().equals(principal.getUser().getId())) {
            throw new IllegalArgumentException("Not allowed to update this ticket");
        }

        if (request.getStatus() != null && isStaff(principal)) {
            ticket.setStatus(request.getStatus());
        }
        if (request.getPriority() != null && isStaff(principal)) {
            ticket.setPriority(request.getPriority());
        }
        if (request.getAssignedToId() != null && isStaff(principal)) {
            User assigned = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found"));
            ticket.setAssignedTo(assigned);
        }
        ticket.setUpdatedAt(Instant.now());
        ticketRepository.save(ticket);
        auditService.log(principal.getUser(), "UPDATE_TICKET", "Ticket", ticket.getId());
        return toResponse(ticket);
    }

    @Transactional
    public TicketCommentResponse addComment(UserPrincipal principal, Long ticketId, TicketCommentRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        if (!isStaff(principal) && !ticket.getCustomer().getId().equals(principal.getUser().getId())) {
            throw new IllegalArgumentException("Not allowed to comment on this ticket");
        }
        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(principal.getUser());
        comment.setBody(request.getBody());
        commentRepository.save(comment);
        auditService.log(principal.getUser(), "COMMENT_TICKET", "Ticket", ticket.getId());
        return TicketCommentResponse.builder()
            .id(comment.getId())
            .ticketId(ticket.getId())
            .authorId(comment.getAuthor().getId())
            .body(comment.getBody())
            .createdAt(comment.getCreatedAt())
            .build();
    }

    private boolean isStaff(UserPrincipal principal) {
        Set<SimpleGrantedAuthority> authorities = principal.getAuthorities().stream()
            .filter(auth -> auth instanceof SimpleGrantedAuthority)
            .map(auth -> (SimpleGrantedAuthority) auth)
            .collect(java.util.stream.Collectors.toSet());
        return authorities.contains(new SimpleGrantedAuthority("ROLE_ADMIN"))
            || authorities.contains(new SimpleGrantedAuthority("ROLE_STAFF"));
    }

    private TicketResponse toResponse(Ticket ticket) {
        return TicketResponse.builder()
            .id(ticket.getId())
            .subject(ticket.getSubject())
            .description(ticket.getDescription())
            .status(ticket.getStatus())
            .priority(ticket.getPriority())
            .customerId(ticket.getCustomer().getId())
            .assignedToId(ticket.getAssignedTo() == null ? null : ticket.getAssignedTo().getId())
            .createdAt(ticket.getCreatedAt())
            .updatedAt(ticket.getUpdatedAt())
            .build();
    }
}
