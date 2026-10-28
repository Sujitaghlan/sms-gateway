const { SmsLog } = require("../models");
const { Op } = require("sequelize");
async function getSmsLogs(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );

    const offset = (page - 1) * limit;

    const where = {
      userId: req.user.userId,
    };

    if (req.query.status) {
      const allowedStatuses = ["sent", "failed", "pending"];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          message: "Invalid status. Use sent, failed, or pending.",
        });
      }

      where.status = req.query.status;
    }

    // Filter by phone number
    if (req.query.phoneNumber) {
      where.phoneNumber = {
        [Op.like]: `%${req.query.phoneNumber}%`,
      };
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {};

      if (req.query.startDate) {
        const startDate = new Date(req.query.startDate);

        if (Number.isNaN(startDate.getTime())) {
          return res.status(400).json({
            message: "Invalid startDate format.",
          });
        }

        where.createdAt[Op.gte] = startDate;
      }

     if (req.query.endDate) {
  const endDate = new Date(req.query.endDate);

  if (Number.isNaN(endDate.getTime())) {
    return res.status(400).json({
      message: "Invalid endDate format.",
    });
  }

  // Include the entire day only when a date is supplied.
  if (/^\d{4}-\d{2}-\d{2}$/.test(req.query.endDate)) {
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    where.createdAt[Op.lt] = endDate;
  } else {
    where.createdAt[Op.lte] = endDate;
  }
}
    }
    const { count, rows } = await SmsLog.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      logs: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get SMS logs error:", error);
    return res.status(500).json({
      message: "Failed to retrieve SMS logs",
    });
  }
}

module.exports = { getSmsLogs };
