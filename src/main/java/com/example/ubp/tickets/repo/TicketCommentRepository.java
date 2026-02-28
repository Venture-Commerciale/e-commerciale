package com.example.ubp.tickets.repo;

import com.example.ubp.tickets.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
}
