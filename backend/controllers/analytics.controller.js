import { BetaAnalyticsDataClient } from '@google-analytics/data';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

// Initialize the GA4 client if credentials exist
let analyticsDataClient = null;
const propertyId = process.env.GA4_PROPERTY_ID;

if (propertyId && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
  try {
    analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
  } catch (error) {
    console.warn("Failed to initialize Google Analytics Client. Using mock data.", error.message);
  }
} else {
  console.warn("GA4 credentials not found in environment variables. Using mock analytics data.");
}

export const getVisitorAnalytics = asyncHandler(async (req, res) => {
  if (!analyticsDataClient || !propertyId) {
    // Return realistic mock data
    const today = new Date();
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      trendData.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visitors: Math.floor(Math.random() * 200) + 50
      });
    }

    return res.status(200).json(new ApiResponse(200, {
      totalVisitors: 12450,
      todayVisitors: trendData[6].visitors,
      weeklyVisitors: trendData.reduce((acc, curr) => acc + curr.visitors, 0),
      monthlyVisitors: 4520,
      trend: trendData,
      topPages: [
        { path: '/', views: 5200 },
        { path: '/courses', views: 3100 },
        { path: '/practice', views: 1850 },
        { path: '/notes', views: 1200 },
        { path: '/compiler', views: 890 }
      ]
    }, 'Mock analytics fetched successfully'));
  }

  try {
    // 1. Fetch Summary Totals (Today, 7 days, 30 days)
    const [todayResponse, weekResponse, monthResponse, totalResponse] = await Promise.all([
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: 'today', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '365daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
      })
    ]);

    const todayVisitors = parseInt(todayResponse[0].rows?.[0]?.metricValues?.[0]?.value || '0', 10);
    const weeklyVisitors = parseInt(weekResponse[0].rows?.[0]?.metricValues?.[0]?.value || '0', 10);
    const monthlyVisitors = parseInt(monthResponse[0].rows?.[0]?.metricValues?.[0]?.value || '0', 10);
    const totalVisitors = parseInt(totalResponse[0].rows?.[0]?.metricValues?.[0]?.value || '0', 10);

    // 2. Fetch Trend Data for Chart (Last 7 days grouped by date)
    const [trendResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '6daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }],
    });

    const trend = (trendResponse.rows || []).map(row => {
      const dateStr = row.dimensionValues[0].value; // e.g., '20231024'
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
      return {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visitors: parseInt(row.metricValues[0].value, 10),
        rawDate: dateStr
      };
    }).sort((a, b) => a.rawDate.localeCompare(b.rawDate)).map(item => ({ date: item.date, visitors: item.visitors }));

    // 3. Fetch Most Visited Pages (Last 30 days)
    const [pagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10,
    });

    const topPages = (pagesResponse.rows || []).map(row => ({
      path: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value, 10)
    }));

    res.status(200).json(new ApiResponse(200, {
      totalVisitors,
      todayVisitors,
      weeklyVisitors,
      monthlyVisitors,
      trend,
      topPages
    }, 'Analytics fetched successfully'));

  } catch (error) {
    console.error("GA4 Analytics Error:", error);
    res.status(500).json(new ApiResponse(500, null, 'Failed to fetch analytics from Google Analytics'));
  }
});
