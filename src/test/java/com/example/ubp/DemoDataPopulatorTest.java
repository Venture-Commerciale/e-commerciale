package com.example.ubp;

import com.example.ubp.billing.repo.InvoiceRepository;
import com.example.ubp.billing.repo.PaymentRepository;
import com.example.ubp.common.audit.AuditLogRepository;
import com.example.ubp.orders.repo.OrderItemRepository;
import com.example.ubp.orders.repo.OrderRepository;
import com.example.ubp.orders.repo.ProductRepository;
import com.example.ubp.tickets.repo.TicketCommentRepository;
import com.example.ubp.tickets.repo.TicketRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.example.ubp.auth.repo.UserRepository;

@SpringBootTest
public class DemoDataPopulatorTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketCommentRepository ticketCommentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    // DemoDataPopulator no longer exists; skip this test until it is reintroduced
    // @Test
    // public void populateDemoData() {
    //     // placeholder - implementation removed
    // }
}
