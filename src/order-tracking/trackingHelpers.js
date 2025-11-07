import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // 🔧 Local dev
// const BASE_URL = 'https://trackapi.geekmelange.in'; // ✅ Production

export const fetchTrackingData = async (awb, ref_id) => {
    if (!awb) throw new Error('AWB number is required');

    try {
        const response = await axios.get(
            `${BASE_URL}/api/track?awb=${awb}&ref_id=${ref_id || ''}`
        );

        console.log('[TrackingHelpers] ✅ Response received:', response.data);
        return response.data;
    } catch (err) {
        const status = err.response?.status || 'Unknown';
        const message = err.response?.data?.error || err.message || 'Tracking fetch failed';

        console.error(`[TrackingHelpers] ❌ AWB ${awb} | ${status} | ${message}`);
        throw new Error(message);
    }
};