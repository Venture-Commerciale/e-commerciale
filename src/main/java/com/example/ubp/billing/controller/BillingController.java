package com.example.ubp.billing.controller;

import com.example.ubp.auth.security.UserPrincipal;
import com.example.ubp.billing.dto.InvoiceResponse;
import com.example.ubp.billing.dto.PaymentRequest;
import com.example.ubp.billing.dto.PaymentResponse;
import com.example.ubp.billing.model.Invoice;
import com.example.ubp.billing.repo.InvoiceRepository;
import com.example.ubp.billing.service.BillingService;
import com.example.ubp.common.dto.ApiResponse;
import com.example.ubp.common.exception.ResourceNotFoundException;
import com.example.ubp.orders.model.Order;
import com.example.ubp.orders.repo.OrderRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class BillingController {
    private final BillingService billingService;
    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;

    public BillingController(
        BillingService billingService,
        OrderRepository orderRepository,
        InvoiceRepository invoiceRepository
    ) {
        this.billingService = billingService;
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @GetMapping("/invoices/{id}")
    public ApiResponse<InvoiceResponse> getInvoice(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        InvoiceResponse response = billingService.getInvoice(id);
        enforceOwnershipOrStaff(principal, response.getOrderId());
        return new ApiResponse<>(true, response);
    }

    @GetMapping("/orders/{id}/invoice")
    public ApiResponse<InvoiceResponse> getInvoiceForOrder(
        @AuthenticationPrincipal UserPrincipal principal,
        @PathVariable Long id
    ) {
        enforceOwnershipOrStaff(principal, id);
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return new ApiResponse<>(true, billingService.getInvoiceForOrder(order));
    }

    @PostMapping("/payments")
    public ApiResponse<PaymentResponse> createPayment(
        @AuthenticationPrincipal UserPrincipal principal,
        @Valid @RequestBody PaymentRequest request
    ) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        if (!isStaff(principal)
            && !invoice.getOrder().getCustomer().getId().equals(principal.getUser().getId())) {
            throw new IllegalArgumentException("Not allowed to pay this invoice");
        }
        return new ApiResponse<>(true, billingService.createPayment(principal.getUser(), request));
    }

    private void enforceOwnershipOrStaff(UserPrincipal principal, Long orderId) {
        if (isStaff(principal)) {
            return;
        }
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getCustomer().getId().equals(principal.getUser().getId())) {
            throw new IllegalArgumentException("Not allowed to access this invoice");
        }
    }

    private boolean isStaff(UserPrincipal principal) {
        return com.example.ubp.auth.util.SecurityUtils.isStaff(principal);
    }
}
