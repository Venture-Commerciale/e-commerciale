package com.example.ubp.common.audit;

import com.example.ubp.auth.model.User;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(User actor, String action, String entity, Long entityId) {
        AuditLog log = new AuditLog();
        log.setActor(actor);
        log.setAction(action);
        log.setEntity(entity);
        log.setEntityId(entityId);
        auditLogRepository.save(log);
    }
}
