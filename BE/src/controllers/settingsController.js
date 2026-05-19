const { query }          = require('../config/db');
const { sendSuccess }    = require('../utils/helpers');

exports.get = async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM company_settings ORDER BY id LIMIT 1'
    );
    return sendSuccess(res, result.rows[0] || {});
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const fields = req.body;
    const keys   = Object.keys(fields);
    const values = Object.values(fields);

    const existing = await query('SELECT id FROM company_settings LIMIT 1');

    if (existing.rows.length) {
      // Update baris yang sudah ada
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      values.push(existing.rows[0].id);
      await query(
        `UPDATE company_settings SET ${sets}, updated_at = NOW() WHERE id = $${values.length}`,
        values
      );
    } else {
      // Insert baris baru
      const cols = keys.join(', ');
      const phs  = keys.map((_, i) => `$${i + 1}`).join(', ');
      await query(`INSERT INTO company_settings (${cols}) VALUES (${phs})`, values);
    }

    const result = await query('SELECT * FROM company_settings ORDER BY id LIMIT 1');
    return sendSuccess(res, result.rows[0], 'Pengaturan berhasil disimpan.');
  } catch (err) {
    next(err);
  }
};
