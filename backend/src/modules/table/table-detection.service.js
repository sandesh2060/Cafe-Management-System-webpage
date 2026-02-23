// File: backend/src/modules/table/table-detection.service.js
//
// ✅ Uses per-table radius set by manager (in metres, default 3ft = 0.9144m)
// ✅ effectiveRadius = max(table.radius, gpsAccuracy) — accounts for GPS drift
// ✅ Gap-based confidence for single-table matches
// ✅ needsSelection only when truly ambiguous after radius filtering
//
// FIXES APPLIED (to match frontend GPS threshold of 150 m):
// ✅ FIX A: SCAN_RADIUS_M bumped 50 → 200 so MongoDB returns candidates
//           even when GPS accuracy is 100–150 m (was silently returning 0)
// ✅ FIX B: MAX_MATCH_DISTANCE_M bumped 60 → 200 to match SCAN_RADIUS_M
// ✅ FIX C: CONFIDENT_GAP_M raised 1.5 → 3 m — avoids false confidence
//           when two tables are very close and GPS is imprecise
// ✅ FIX D: gpsAccuracy default raised 10 → 30 m (safer indoor fallback
//           when frontend doesn't send accuracy)

const Table = require('./table.model');
const { calculateDistance } = require('../../shared/utils/location');

// ─────────────────────────────────────────────────────────────────
// TUNING CONSTANTS
// ─────────────────────────────────────────────────────────────────

// FIX A: Wide MongoDB net — must be ≥ frontend GPS_FALLBACK_ACCURACY_M (150 m)
//        Previously 50 m, which meant the DB returned NO results when
//        GPS accuracy was 60–150 m, causing silent QR fallbacks.
const SCAN_RADIUS_M = 200;

// FIX C: Gap between #1 and #2 closest to declare confident single match.
//        Raised from 1.5 m → 3 m to be more conservative with poor GPS.
const CONFIDENT_GAP_M = 3;

// FIX B: Hard cap — must match SCAN_RADIUS_M.
//        Previously 60 m, which rejected valid matches at 61–150 m accuracy.
const MAX_MATCH_DISTANCE_M = 200;

// Verification radius for table-number + location strategy (unchanged)
const VERIFY_RADIUS_M = 20;

// FIX D: Safer indoor default when frontend doesn't send accuracy
const DEFAULT_GPS_ACCURACY_M = 30;


class TableDetectionService {

  /**
   * Main entry point — tries strategies in order of reliability.
   */
  async detectTable({ qrCode, latitude, longitude, tableNumber, accuracy }) {
    // STRATEGY 1: QR Code (always wins — unambiguous)
    if (qrCode) {
      return await this.findByQRCode(qrCode);
    }

    // STRATEGY 2: Table number + location verification
    if (tableNumber && latitude && longitude) {
      return await this.findByNumberWithLocation(tableNumber, latitude, longitude);
    }

    // STRATEGY 3: Pure GPS (per-table radius + gap-based matching)
    if (latitude && longitude) {
      return await this.findClosestTable(latitude, longitude, SCAN_RADIUS_M, accuracy);
    }

    throw new Error('Please provide QR code, table number, or location');
  }

  /**
   * QR code lookup — most reliable, always high confidence.
   */
  async findByQRCode(qrCode) {
    const table = await Table.findOne({ qrCode, isActive: true });

    if (!table) {
      throw new Error('Invalid QR code or table not found');
    }

    return {
      table,
      method:     'qr_code',
      confidence: 'high',
      distance:   0,
    };
  }

  /**
   * Find by table number, then verify customer is actually near it.
   */
  async findByNumberWithLocation(tableNumber, latitude, longitude) {
    const table = await Table.findByNumber(tableNumber);

    if (!table) {
      throw new Error('Table not found');
    }

    const [tableLon, tableLat] = table.location.coordinates;
    const distance = calculateDistance(latitude, longitude, tableLat, tableLon);

    if (distance > VERIFY_RADIUS_M) {
      throw new Error(
        `You are ${Math.round(distance)}m away from Table ${tableNumber}. Please move closer.`
      );
    }

    return {
      table,
      method:     'number_verified',
      confidence: distance < 3 ? 'high' : 'medium',
      distance:   _round(distance),
    };
  }

  /**
   * GPS-only matching using per-table radius + gap analysis.
   *
   * Key insight:
   *   effectiveRadius = max(table.radius, gpsAccuracy)
   *
   *   If GPS accuracy is 80 m and table radius is 0.9144 m (3 ft),
   *   we use 80 m as the effective radius — otherwise NO table would
   *   ever match because the GPS drift alone exceeds the table radius.
   *
   *   Gap analysis then picks the closest candidate confidently if
   *   the gap between #1 and #2 is large enough (CONFIDENT_GAP_M).
   *
   * @param {number} latitude
   * @param {number} longitude
   * @param {number} maxRadius  - MongoDB initial scan radius (SCAN_RADIUS_M)
   * @param {number} accuracy   - GPS accuracy in metres from browser
   */
  async findClosestTable(latitude, longitude, maxRadius = SCAN_RADIUS_M, accuracy = null) {

    // FIX D: use safer default when accuracy not provided
    const gpsAccuracy = accuracy || DEFAULT_GPS_ACCURACY_M;

    // Step 1: Wide MongoDB query — fine-grained filter by per-table radius below
    const nearbyDocs = await Table.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: maxRadius,
        },
      },
      isActive: true,
      status:   { $ne: 'reserved' },
    }).limit(10);

    if (nearbyDocs.length === 0) {
      throw new Error(
        `You're not within any table's detection zone. Move closer or scan the QR code.`
      );
    }

    // Step 2: Compute exact Haversine distances
    const withDistances = nearbyDocs.map(table => {
      const [tLon, tLat] = table.location.coordinates;
      return {
        table,
        distance: _round(calculateDistance(latitude, longitude, tLat, tLon)),
      };
    });

    // Step 3: Filter by per-table effective radius
    //   effectiveRadius = max(table.radius, gpsAccuracy)
    //   This ensures that even with poor GPS (e.g. ±80 m), the closest
    //   table still matches — we just have a wider effective zone.
    const inRadius = withDistances.filter(({ table, distance }) => {
      const tableRadius     = table.radius || 0.9144; // 3 ft default
      const effectiveRadius = Math.max(tableRadius, gpsAccuracy);
      const within          = distance <= effectiveRadius;

      console.log(
        `📍 Table ${table.number}: distance=${distance}m, ` +
        `tableRadius=${tableRadius}m, gpsAccuracy=${gpsAccuracy}m, ` +
        `effectiveRadius=${effectiveRadius}m, within=${within}`
      );

      return within;
    });

    if (inRadius.length === 0) {
      throw new Error(
        `You're not within any table's detection zone. ` +
        `GPS accuracy: ±${Math.round(gpsAccuracy)}m. ` +
        `Please move closer to your table or scan the QR code.`
      );
    }

    // Step 4: Sort by distance
    const ranked = inRadius.sort((a, b) => a.distance - b.distance);
    const best   = ranked[0];
    const second = ranked[1];

    // Step 5: Hard distance cap (FIX B: now 200 m)
    if (best.distance > MAX_MATCH_DISTANCE_M) {
      throw new Error(
        `Closest table is ${best.distance}m away. Please sit at your table first.`
      );
    }

    // Step 6: Only one table in radius → confident
    if (!second) {
      console.log(`✅ Single table in radius: Table ${best.table.number} @ ${best.distance}m`);
      return _result(best, ranked, 'high');
    }

    // Step 7: Gap analysis between #1 and #2
    const gap = second.distance - best.distance;

    console.log(
      `📍 Gap analysis — best: Table ${best.table.number} @ ${best.distance}m, ` +
      `2nd: Table ${second.table.number} @ ${second.distance}m, gap: ${_round(gap)}m`
    );

    if (gap >= CONFIDENT_GAP_M) {
      const confidence = best.distance < 5 ? 'high' : best.distance < 20 ? 'medium' : 'low';
      console.log(`✅ Confident match: Table ${best.table.number} (gap=${_round(gap)}m)`);
      return _result(best, ranked, confidence);
    }

    // Step 8: Gap too small → ambiguous, ask user to select
    const ambiguous = ranked.filter(t => t.distance - best.distance < CONFIDENT_GAP_M);
    console.warn(
      `⚠️ Ambiguous: ${ambiguous.length} tables within gap threshold. Requesting selection.`
    );

    return {
      needsSelection: true,
      tables:         ambiguous,
      message:        'Multiple nearby tables detected. Please select your table or scan the QR code.',
      method:         'ambiguous',
      confidence:     'low',
    };
  }

  /**
   * Get all tables within a given radius (used by getTablesNearby endpoint).
   */
  async getTablesInRadius(latitude, longitude, radiusMeters = SCAN_RADIUS_M) {
    const docs = await Table.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: radiusMeters,
        },
      },
      isActive: true,
    });

    return docs.map(table => {
      const [tLon, tLat] = table.location.coordinates;
      return {
        ...table.toObject(),
        distance: _round(calculateDistance(latitude, longitude, tLat, tLon)),
      };
    });
  }
}

// ─── helpers ────────────────────────────────────────────────────
function _round(meters) {
  return Math.round(meters * 100) / 100;
}

function _result(best, ranked, confidence) {
  return {
    table:        best.table,
    method:       'location',
    confidence,
    distance:     best.distance,
    nearbyTables: ranked.slice(1, 4),
  };
}

module.exports = new TableDetectionService();