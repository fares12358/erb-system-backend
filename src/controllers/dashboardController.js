import Invoice from "../models/Invoice.js";

const getDateRange = (filter) => {
  const now = new Date();
  let startDate;

  switch (filter) {
    case "thisWeek":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - startDate.getDay());
      break;

    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case "lastMonth":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;

    case "last3Months":
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;

    default:
      startDate = null;
  }

  return startDate;
};


/* ================= DASHBOARD STATS ================= */

export const getDashboardStats = async (req, res) => {
  try {
    const { dateFilter } = req.query;

    const query = { userId: req.user._id };

    const startDate = getDateRange(dateFilter);
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }

    const invoices = await Invoice.find(query);

    const totalInvoices = invoices.length;

    const paid = invoices.filter(i => i.status === "paid").length;
    const partial = invoices.filter(i => i.status === "partial").length;
    const unpaid = invoices.filter(i => i.status === "unpaid").length;

    const totalIncome = invoices.reduce(
      (sum, i) => sum + i.paidAmount,
      0
    );

    const totalRemaining = invoices.reduce(
      (sum, i) => sum + i.remainingAmount,
      0
    );

    res.json({
      success: true,
      data: {
        totalInvoices,
        paid,
        partial,
        unpaid,
        totalIncome,
        totalRemaining
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ================= LINE CHART DATA ================= */

export const getChartData = async (req, res) => {
  try {
    const { dateFilter } = req.query;

    const query = { userId: req.user._id };

    const startDate = getDateRange(dateFilter);
    if (startDate) query.createdAt = { $gte: startDate };

    const invoices = await Invoice.find(query).sort({ createdAt: 1 });

    const map = {};

    invoices.forEach(inv => {
      const day = inv.createdAt.toISOString().split("T")[0];

      if (!map[day]) {
        map[day] = { count: 0, income: 0 };
      }

      map[day].count += 1;
      map[day].income += inv.paidAmount;
    });

    const labels = Object.keys(map);
    const invoiceCounts = labels.map(d => map[d].count);
    const incomes = labels.map(d => map[d].income);

    res.json({
      success: true,
      data: {
        labels,
        invoiceCounts,
        incomes
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ================= PRODUCT ANALYTICS ================= */

export const getProductStats = async (req, res) => {
  try {
    const { dateFilter } = req.query;

    const query = { userId: req.user._id };

    const startDate = getDateRange(dateFilter);
    if (startDate) query.createdAt = { $gte: startDate };

    const invoices = await Invoice.find(query);

    const products = {};

    invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (!products[item.name]) {
          products[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }

        products[item.name].quantity += item.quantity;
        products[item.name].revenue += item.subtotal;
      });
    });

    res.json({
      success: true,
      data: Object.values(products)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= date range helper ================= */

const getStartDate = (range) => {
  const now = new Date();

  switch (range) {
    case "week":
      const week = new Date();
      week.setDate(week.getDate() - week.getDay());
      return week;

    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);

    case "lastMonth":
      return new Date(now.getFullYear(), now.getMonth() - 1, 1);

    case "last3":
      return new Date(now.getFullYear(), now.getMonth() - 3, 1);

    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
};

/* ================= MAIN DASHBOARD ================= */

export const getDashboard = async (req, res) => {
  try {
    const range = req.query.range || "month";
    const startDate = getStartDate(range);

    const invoices = await Invoice.find({
      userId: req.user._id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    /* ================= STATS ================= */

    const totalInvoices = invoices.length;

    let totalIncome = 0;
    let unpaidBalance = 0;

    const statusCount = {
      paid: 0,
      partial: 0,
      unpaid: 0
    };

    invoices.forEach(inv => {
      totalIncome += inv.paidAmount;
      unpaidBalance += inv.remainingAmount;
      statusCount[inv.status]++;
    });

    const statusPercent = {
      paid: totalInvoices ? Math.round((statusCount.paid / totalInvoices) * 100) : 0,
      partial: totalInvoices ? Math.round((statusCount.partial / totalInvoices) * 100) : 0,
      unpaid: totalInvoices ? Math.round((statusCount.unpaid / totalInvoices) * 100) : 0
    };

    /* ================= CHARTS ================= */

    const incomeMap = {};
    const invoiceMap = {};

    invoices.forEach(inv => {
      const day = inv.createdAt.toISOString().split("T")[0];

      if (!incomeMap[day]) {
        incomeMap[day] = 0;
        invoiceMap[day] = 0;
      }

      incomeMap[day] += inv.paidAmount;
      invoiceMap[day] += 1;
    });

    const chartLabels = Object.keys(incomeMap);

    const incomeValues = chartLabels.map(d => incomeMap[d]);
    const invoiceValues = chartLabels.map(d => invoiceMap[d]);

    /* ================= RECENT ================= */

    const recentInvoices = await Invoice.find({
      userId: req.user._id
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("invoiceNumber clientPhone total status");

    res.json({
      success: true,
      data: {
        stats: {
          totalIncome,
          unpaidBalance,
          totalInvoices,
          status: statusPercent
        },

        charts: {
          income: {
            labels: chartLabels,
            values: incomeValues
          },
          invoices: {
            labels: chartLabels,
            values: invoiceValues
          }
        },

        recentInvoices
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
