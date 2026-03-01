// Utility functions for bulk admin operations

export async function bulkUpdateOrderStatuses(orderIds, newStatus, updateFn) {
  const results = {
    success: [],
    failed: [],
  };

  for (const orderId of orderIds) {
    try {
      await updateFn(orderId, newStatus);
      results.success.push(orderId);
    } catch (error) {
      results.failed.push({ orderId, error: error.message });
    }
  }

  return results;
}

export async function bulkAssignTickets(ticketIds, staffId, updateFn) {
  const results = {
    success: [],
    failed: [],
  };

  for (const ticketId of ticketIds) {
    try {
      await updateFn(ticketId, { assignedToId: staffId });
      results.success.push(ticketId);
    } catch (error) {
      results.failed.push({ ticketId, error: error.message });
    }
  }

  return results;
}

export async function bulkUpdateTicketStatus(ticketIds, newStatus, updateFn) {
  const results = {
    success: [],
    failed: [],
  };

  for (const ticketId of ticketIds) {
    try {
      await updateFn(ticketId, { status: newStatus });
      results.success.push(ticketId);
    } catch (error) {
      results.failed.push({ ticketId, error: error.message });
    }
  }

  return results;
}
