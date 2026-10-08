import { apiRequest } from "@/lib/api";
import type {
  ContactFormInput,
  MessageResponse,
  PlaceOrderInput,
  PlaceOrderResponse,
  TestRideRequestInput,
} from "@/types/api";

export function submitContactForm(input: ContactFormInput) {
  return apiRequest<MessageResponse>("/contact-submissions", {
    method: "POST",
    body: input,
  });
}

export function requestTestRide(input: TestRideRequestInput) {
  return apiRequest<MessageResponse>("/test-ride-requests", {
    method: "POST",
    body: input,
  });
}

export function placeOrder(input: PlaceOrderInput) {
  return apiRequest<PlaceOrderResponse>("/orders", {
    method: "POST",
    body: { ...input, paymentMethod: "cash on delivery" },
  });
}
