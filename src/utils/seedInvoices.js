import Invoice from "../models/Invoice.js";
import User from "../models/User.js";

const TODAY = new Date("2026-02-02");

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const genInvoiceNumber = () =>
  "INV-" + Date.now() + "-" + Math.floor(Math.random() * 100000);

const randomDateLast3Months = () => {
  const daysBack = randomBetween(0, 90);
  const date = new Date(TODAY);
  date.setDate(date.getDate() - daysBack);
  return date;
};

const fakeItems = () => {
  const products = [
    "Laptop",
    "Mouse",
    "Keyboard",
    "Monitor",
    "Phone",
    "Headset"
  ];

  const count = randomBetween(1, 4);

  return Array.from({ length: count }).map(() => ({
    name: products[randomBetween(0, products.length - 1)],
    price: randomBetween(50, 1500),
    quantity: randomBetween(1, 3)
  }));
};

export const seedInvoices = async () => {
  try {
    const user = await User.findOne();

    if (!user) {
      console.log("❌ Create a user first before seeding invoices");
      return;
    }

    await Invoice.deleteMany({ userId: user._id });

    const invoices = [];

    for (let i = 0; i < 1000; i++) {
      const items = fakeItems();

      const total = items.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );

      const paidAmount = randomBetween(0, total);

      invoices.push({
        userId: user._id,
        invoiceNumber: genInvoiceNumber(),
        clientPhone: "01" + randomBetween(100000000, 999999999),
        items,
        paidAmount,
        paymentMethod: ["cash", "visa", "transfer"][randomBetween(0, 2)],
        createdAt: randomDateLast3Months()
      });
    }

    await Invoice.insertMany(invoices);

    console.log("✅ 1000 fake invoices seeded successfully");

  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
};
