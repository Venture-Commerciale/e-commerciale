package com.example.ubp.billing.repo;

import com.example.ubp.billing.model.Invoice;
import com.example.ubp.orders.model.Order;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByOrder(Order order);
    Optional<Invoice> findByInvoiceNo(String invoiceNo);
}
