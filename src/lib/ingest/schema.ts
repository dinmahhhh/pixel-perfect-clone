export type CanonicalField =
  | "date"
  | "product"
  | "category"
  | "quantity"
  | "selling_price"
  | "cost_price"
  | "customer"
  | "location"
  | "payment_method";

export type FieldSpec = {
  id: CanonicalField;
  label: string;
  help: string;
  required: boolean;
  aliases: string[];
};

export const CANONICAL_FIELDS: FieldSpec[] = [
  {
    id: "date",
    label: "Date",
    help: "When the sale happened. Required.",
    required: true,
    aliases: [
      "date",
      "order date",
      "sale date",
      "transaction date",
      "invoice date",
      "day",
      "datetime",
      "timestamp",
      "created at",
      "purchase date",
      "sold on",
    ],
  },
  {
    id: "product",
    label: "Product",
    help: "Item name or SKU. Required.",
    required: true,
    aliases: [
      "product",
      "product name",
      "item",
      "item name",
      "sku",
      "description",
      "title",
      "article",
      "goods",
    ],
  },
  {
    id: "category",
    label: "Category",
    help: "Product group, if you track one.",
    required: false,
    aliases: ["category", "product category", "type", "group", "department", "segment"],
  },
  {
    id: "quantity",
    label: "Quantity",
    help: "Units sold. Defaults to 1 when missing.",
    required: false,
    aliases: ["quantity", "qty", "units", "units sold", "count", "amount sold", "no of items"],
  },
  {
    id: "selling_price",
    label: "Selling price",
    help: "Price per unit charged to the customer. Required.",
    required: true,
    aliases: [
      "selling price",
      "sale price",
      "unit price",
      "price",
      "price per unit",
      "rate",
      "amount",
      "revenue",
      "total",
      "sales",
      "line total",
      "gross",
    ],
  },
  {
    id: "cost_price",
    label: "Cost price",
    help: "What the unit cost you. Needed for profit and margin.",
    required: false,
    aliases: [
      "cost price",
      "cost",
      "unit cost",
      "cogs",
      "buying price",
      "purchase price",
      "wholesale price",
      "cost per unit",
      "landed cost",
    ],
  },
  {
    id: "customer",
    label: "Customer",
    help: "Customer name or ID, if recorded.",
    required: false,
    aliases: ["customer", "customer name", "client", "buyer", "customer id", "account"],
  },
  {
    id: "location",
    label: "Location",
    help: "Store, branch or region.",
    required: false,
    aliases: ["location", "store", "branch", "shop", "outlet", "region", "city", "warehouse"],
  },
  {
    id: "payment_method",
    label: "Payment method",
    help: "Cash, card, transfer, etc.",
    required: false,
    aliases: ["payment method", "payment", "payment type", "pay mode", "tender", "channel"],
  },
];

export type ColumnMapping = Partial<Record<CanonicalField, string | null>>;

export const NOT_PRESENT = "__none__";
