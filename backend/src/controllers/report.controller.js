const { Report, User, Article, Comment } = require('../models');

exports.createReport = async (req, res) => {
  try {
    const { entityType, entityId, reportType, details } = req.body;

    let entity;
    if (entityType === 'article') {
      entity = await Article.findByPk(entityId);
    } else if (entityType === 'comment') {
      entity = await Comment.findByPk(entityId);
    }

    if (!entity) {
      return res.status(404).json({ error: 'Reported entity not found' });
    }

    const report = await Report.create({
      userId: req.user.userId,
      entityType,
      reportedEntityId: entityId,
      reportType,
      details,
      status: 'pending'
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const reports = await Report.findAll({
      include: [{
        model: User,
        as: 'reporter',
        attributes: ['userId', 'name', 'email']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const [affectedCount, [updatedReport]] = await Report.update(
      { status },
      {
        where: { reportId },
        returning: true
      }
    );

    if (affectedCount === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};