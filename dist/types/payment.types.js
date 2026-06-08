export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["SUCCESS"] = "success";
    PaymentStatus["FAILED"] = "failed";
})(PaymentStatus || (PaymentStatus = {}));
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["COMPLETED"] = "Completed";
    OrderStatus["PROCESSING"] = "Processing";
    OrderStatus["PENDING_PAYMENT"] = "Pending_Payment";
    OrderStatus["ON_HOLD"] = "On_Hold";
    OrderStatus["CANCELLED"] = "Cancelled";
})(OrderStatus || (OrderStatus = {}));
