package com.example.ubp.tickets.repo;

import com.example.ubp.auth.model.User;
import com.example.ubp.tickets.model.Ticket;
import com.example.ubp.tickets.model.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Page<Ticket> findByCustomer(User customer, Pageable pageable);
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);
    Page<Ticket> findByAssignedTo(User assignedTo, Pageable pageable);
}
