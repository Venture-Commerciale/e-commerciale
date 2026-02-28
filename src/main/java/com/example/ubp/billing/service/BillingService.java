package com.example.ubp.billing.service;

import com.example.ubp.billing.dto.InvoiceResponse;
import com.example.ubp.billing.dto.PaymentRequest;
import com.example.ubp.billing.dto.PaymentResponse;
import com.example.ubp.billing.model.Invoice;
import com.example.ubp.billing.model.InvoiceStatus;
import com.example.ubp.billing.model.Payment;
import com.example.ubp.billing.model.PaymentStatus;
import com.example.ubp.billing.repo.InvoiceRepository;
import com.example.ubp.billing.repo.PaymentRepository;
import com.example.ubp.common.audit.AuditService;
import com.example.ubp.auth.model.User;
import com.example.ubp.common.exception.ResourceNotFoundException;
import com.example.ubp.orders.model.Order;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingService {
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final AuditService auditService;

    public BillingService(
        InvoiceRepository invoiceRepository,
        PaymentRepository paymentRepository,
        AuditService auditService
    ) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Invoice createInvoiceForOrder(Order order) {
        return invoiceRepository.findByOrder(order)
            .orElseGet(() -> {
                Invoice invoice = new Invoice();
                invoice.setOrder(order);
                invoice.setInvoiceNo("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                invoice.setTotal(order.getTotal());
                invoice.setStatus(InvoiceStatus.OPEN);
                invoice.setCreatedAt(Instant.now());
                return invoiceRepository.save(invoice);
            });
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceForOrder(Order order) {
        Invoice invoice = invoiceRepository.findByOrder(order)
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        return toResponse(invoice);
    }

    @Transactional
    public PaymentResponse createPayment(User actor, PaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        Payment payment = new Payment();
        payment.setInvoice(invoice);
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setCreatedAt(Instant.now());
        paymentRepository.save(payment);

        if (request.getAmount().compareTo(invoice.getTotal()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoiceRepository.save(invoice);
        }
        auditService.log(actor, "CREATE_PAYMENT", "Invoice", invoice.getId());

        return PaymentResponse.builder()
            .id(payment.getId())
            .invoiceId(invoice.getId())
            .amount(payment.getAmount())
            .method(payment.getMethod())
            .status(payment.getStatus())
            .createdAt(payment.getCreatedAt())
            .build();
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        return InvoiceResponse.builder()
            .id(invoice.getId())
            .orderId(invoice.getOrder().getId())
            .invoiceNo(invoice.getInvoiceNo())
            .total(invoice.getTotal())
            .status(invoice.getStatus())
            .createdAt(invoice.getCreatedAt())
            .build();
    }
}
