import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number
    }
});

const invoiceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        invoiceNumber: {
            type: String,
            unique: true
        },


        clientPhone: {
            type: String,
            required: true
        },

        items: [itemSchema],

        total: {
            type: Number,
            default: 0
        },

        paidAmount: {
            type: Number,
            default: 0
        },

        remainingAmount: {
            type: Number,
            default: 0
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "visa", "transfer"],
            required: true
        },

        status: {
            type: String,
            enum: ["paid", "partial", "unpaid"],
            default: "unpaid"
        },

        note: {
            type: String
        }
    },
    { timestamps: true }
);


// ================= AUTO CALCULATIONS =================

invoiceSchema.pre("save", async function () {

    if (!this.invoiceNumber) {
      this.invoiceNumber = "INV-" + Date.now();
    }
  
    this.items.forEach(item => {
      item.subtotal = item.price * item.quantity;
    });
  
    this.total = this.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
  
    this.remainingAmount = this.total - this.paidAmount;
  
    if (this.paidAmount === 0) {
      this.status = "unpaid";
    } else if (this.paidAmount >= this.total) {
      this.status = "paid";
      this.remainingAmount = 0;
    } else {
      this.status = "partial";
    }
  
  });
  
export default mongoose.model("Invoice", invoiceSchema);
