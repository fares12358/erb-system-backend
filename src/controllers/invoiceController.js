import Invoice from "../models/Invoice.js";

/* ================= CREATE ================= */

export const createInvoice = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const invoice = await Invoice.create({
      userId: req.user._id,
      clientPhone: req.body.clientPhone,
      items: req.body.items,
      paidAmount: req.body.paidAmount || 0,
      paymentMethod: req.body.paymentMethod,
      note: req.body.note
    });

    res.status(201).json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
 
/* ================= LIST ================= */

export const getInvoices = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = Number(req.query.page) || 1;
    const limit =  20;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    if (req.query.status) query.status = req.query.status;
    if (req.query.paymentMethod) query.paymentMethod = req.query.paymentMethod;
    if (req.query.clientPhone) {
      query.clientPhone = { $regex: req.query.clientPhone, $options: "i" };
    }
    if (req.query.invoiceNumber) {
      query.invoiceNumber = { $regex: req.query.invoiceNumber, $options: "i" };
    }

    /* ===== Date filter ===== */

    if (req.query.dateFilter) {
      const now = new Date();
      let start;

      switch (req.query.dateFilter) {
        case "today":
          start = new Date();
          start.setHours(0, 0, 0, 0);
          break;

        case "thisWeek":
          start = new Date();
          start.setDate(start.getDate() - start.getDay());
          break;

        case "thisMonth":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;

        case "lastMonth":
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          break;

        case "last3Months":
          start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
      }

      if (start) query.createdAt = { $gte: start };
    }

    const sort =
      req.query.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const total = await Invoice.countDocuments(query);

    const invoices = await Invoice.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
/* ================= UPDATE ================= */

export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const allowed = [
      "clientPhone",
      "items",
      "paidAmount",
      "paymentMethod",
      "note"
    ];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        invoice[field] = req.body[field];
      }
    });

    await invoice.save();

    res.json({ success: true, data: invoice });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= DELETE ================= */

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
