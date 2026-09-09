const express = require('express');
const router = express.Router();

const DEMO_HOUSEHOLD_ID = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

// GET /api/income - List All Income Methods & Project Inflows
router.get('/', async (req, res) => {
  try {
    const pool = req.app.get('dbPool');
    if (pool && process.env.DATABASE_URL) {
      const result = await pool.query(
        `SELECT id, title, amount, received_by_name as "receivedBy", category, recurrence, to_char(income_date, 'YYYY-MM-DD') as date 
         FROM income_sources 
         WHERE household_id = $1 
         ORDER BY created_at DESC`,
        [DEMO_HOUSEHOLD_ID]
      );
      return res.json({ success: true, data: result.rows.map(r => ({ ...r, amount: Number(r.amount) })) });
    }

    res.json({ success: true, data: [] });
  } catch (err) {
    console.error('Error fetching income sources from DB:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/income - Add New Income Method / Project Earning
router.post('/', async (req, res) => {
  try {
    const { title, amount, receivedBy, category, recurrence, date } = req.body;
    const pool = req.app.get('dbPool');
    let insertedIncome = {
      id: Date.now().toString(),
      title,
      amount: Number(amount),
      receivedBy: receivedBy || 'Dulanja',
      category: category || 'Project',
      recurrence: recurrence || 'monthly',
      date: date || new Date().toISOString().split('T')[0]
    };

    if (pool && process.env.DATABASE_URL) {
      const query = `
        INSERT INTO income_sources (household_id, title, amount, received_by_name, category, recurrence, income_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, title, amount, received_by_name as "receivedBy", category, recurrence, to_char(income_date, 'YYYY-MM-DD') as date
      `;
      const result = await pool.query(query, [
        DEMO_HOUSEHOLD_ID,
        title,
        amount,
        receivedBy || 'Dulanja',
        category || 'Project',
        recurrence || 'monthly',
        date || new Date().toISOString().split('T')[0]
      ]);
      if (result.rows.length > 0) {
        insertedIncome = { ...result.rows[0], amount: Number(result.rows[0].amount) };
      }
    }

    res.status(201).json({ success: true, message: 'Income method created successfully', income: insertedIncome });
  } catch (err) {
    console.error('Error creating income method in DB:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/income/:id - Update Income Method / Project Details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, receivedBy, category, recurrence, date } = req.body;
    const pool = req.app.get('dbPool');

    if (pool && process.env.DATABASE_URL) {
      const updates = [];
      const values = [];
      let idx = 1;

      if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(title); }
      if (amount !== undefined) { updates.push(`amount = $${idx++}`); values.push(amount); }
      if (receivedBy !== undefined) { updates.push(`received_by_name = $${idx++}`); values.push(receivedBy); }
      if (category !== undefined) { updates.push(`category = $${idx++}`); values.push(category); }
      if (recurrence !== undefined) { updates.push(`recurrence = $${idx++}`); values.push(recurrence); }
      if (date !== undefined) { updates.push(`income_date = $${idx++}`); values.push(date); }

      if (updates.length > 0) {
        values.push(String(id));
        await pool.query(
          `UPDATE income_sources SET ${updates.join(', ')} WHERE id::text = $${idx}`,
          values
        );
      }
    }

    res.json({ success: true, message: 'Income method updated successfully' });
  } catch (err) {
    console.error('Error updating income method:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/income/:id - Delete Income Method from DB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.get('dbPool');

    if (pool && process.env.DATABASE_URL) {
      await pool.query('DELETE FROM income_sources WHERE id::text = $1', [String(id)]);
    }

    res.json({ success: true, message: 'Income method deleted successfully' });
  } catch (err) {
    console.error('Error deleting income method:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
