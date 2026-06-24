import { Schema, models, model } from "mongoose";

const CartLineSchema = new Schema(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    userId: { type: String, index: true },
    status: {
      type: String,
      required: true,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    total: { type: Number, required: true },
    items: { type: [CartLineSchema], required: true },
    shippingAddress: { type: AddressSchema, required: true },
  },
  { timestamps: true }
);

export const OrderModel = models.Order || model("Order", OrderSchema);
export default OrderModel;